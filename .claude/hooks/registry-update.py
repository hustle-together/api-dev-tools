#!/usr/bin/env python3
"""
Registry Update Hook

Trigger: PostToolUse for Write|Edit
Action: Parse written files and add artifacts to .devkit/registry.json

Detects:
- API routes: src/app/api/**/*.ts → apis section
- Components: src/components/**/*.tsx → components section
- Pages: src/app/**/page.tsx → pages section
"""

import json
import sys
import os
import re
from datetime import datetime
from pathlib import Path

def get_project_root():
    """Get the project root directory."""
    return os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())

def load_registry():
    """Load the registry file."""
    registry_path = Path(get_project_root()) / ".devkit" / "registry.json"
    if registry_path.exists():
        with open(registry_path, "r") as f:
            return json.load(f)
    return {
        "version": "1.0.0",
        "updated_at": None,
        "apis": {},
        "components": {},
        "pages": {}
    }

def save_registry(registry):
    """Save the registry file."""
    registry_path = Path(get_project_root()) / ".devkit" / "registry.json"
    registry["updated_at"] = datetime.now().isoformat()

    # Ensure directory exists
    registry_path.parent.mkdir(parents=True, exist_ok=True)

    with open(registry_path, "w") as f:
        json.dump(registry, f, indent=2)

def extract_api_info(file_path: str, content: str) -> dict:
    """Extract API endpoint information from route file."""
    # Extract HTTP methods
    methods = []
    for method in ["GET", "POST", "PUT", "PATCH", "DELETE"]:
        if f"export async function {method}" in content or f"export function {method}" in content:
            methods.append(method)

    # Extract route from file path (src/app/api/stripe/checkout/route.ts → /api/stripe/checkout)
    route_match = re.search(r'src/app(/api/[^/]+(?:/[^/]+)*)/route\.ts', file_path)
    route = route_match.group(1) if route_match else None

    # Extract schema name if present
    schema_match = re.search(r'(\w+Schema)', content)
    schema = schema_match.group(1) if schema_match else None

    # Extract endpoint name from route
    if route:
        name = route.split("/")[-1]
    else:
        name = Path(file_path).stem

    return {
        "name": name,
        "route": route,
        "methods": methods,
        "schema": schema,
        "file": file_path
    }

def extract_component_info(file_path: str, content: str) -> dict:
    """Extract component information from TSX file."""
    # Extract component name from file path
    path = Path(file_path)
    component_name = path.stem

    # Skip if it's a test, story, or type file
    if any(x in component_name for x in [".test", ".spec", ".stories", ".types"]):
        return None

    # Extract props from interface
    props = []
    props_match = re.search(r'interface \w+Props\s*{([^}]+)}', content)
    if props_match:
        prop_lines = props_match.group(1)
        props = re.findall(r'(\w+)\s*[?:]', prop_lines)

    # Extract variants from cva or similar
    variants = []
    variants_match = re.search(r'variant:\s*\[([^\]]+)\]', content)
    if variants_match:
        variants = [v.strip().strip("'\"") for v in variants_match.group(1).split(",")]

    # Look for related files
    parent_dir = path.parent
    related_files = {}

    types_file = parent_dir / f"{component_name}.types.ts"
    if types_file.exists():
        related_files["types"] = str(types_file)

    stories_file = parent_dir / f"{component_name}.stories.tsx"
    if stories_file.exists():
        related_files["stories"] = str(stories_file)

    test_file = parent_dir / f"{component_name}.test.tsx"
    if test_file.exists():
        related_files["tests"] = str(test_file)

    visual_test = parent_dir / f"{component_name}.visual.spec.ts"
    if visual_test.exists():
        related_files["visualTests"] = str(visual_test)

    return {
        "name": component_name,
        "file": file_path,
        "props": props,
        "variants": variants,
        **related_files
    }

def extract_page_info(file_path: str, content: str) -> dict:
    """Extract page information from page.tsx file."""
    # Extract route from file path (src/app/dashboard/page.tsx → /dashboard)
    route_match = re.search(r'src/app(/[^/]+(?:/[^/]+)*)/page\.tsx', file_path)
    route = route_match.group(1) if route_match else "/"

    # Extract page name from route
    name = route.split("/")[-1] if route != "/" else "Home"
    name = name.title().replace("-", "")

    # Extract title from metadata
    title = None
    title_match = re.search(r'title:\s*["\']([^"\']+)["\']', content)
    if title_match:
        title = title_match.group(1)

    # Look for E2E test file
    parent_dir = Path(file_path).parent
    e2e_test = parent_dir / "page.e2e.test.ts"

    return {
        "name": name,
        "route": route,
        "title": title,
        "file": file_path,
        "e2eTests": str(e2e_test) if e2e_test.exists() else None
    }

def determine_artifact_type(file_path: str) -> str:
    """Determine what type of artifact this file represents."""
    if "/api/" in file_path and file_path.endswith("route.ts"):
        return "api"
    elif "/components/" in file_path and file_path.endswith(".tsx"):
        # Skip test/story files
        if not any(x in file_path for x in [".test.", ".spec.", ".stories."]):
            return "component"
    elif file_path.endswith("page.tsx") and "/api/" not in file_path:
        return "page"
    return None

def main():
    # Read hook input from stdin
    try:
        hook_input = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        sys.exit(0)  # Allow - no valid input

    tool_name = hook_input.get("tool_name", "")
    tool_input = hook_input.get("tool_input", {})
    tool_result = hook_input.get("tool_result", {})

    # Only process Write and Edit tools
    if tool_name not in ["Write", "Edit", "MultiEdit"]:
        sys.exit(0)

    # Get the file path that was written/edited
    file_path = tool_input.get("file_path", "")
    if not file_path:
        sys.exit(0)

    # Normalize path to be relative
    project_root = get_project_root()
    if file_path.startswith(project_root):
        file_path = file_path[len(project_root):].lstrip("/")

    # Determine artifact type
    artifact_type = determine_artifact_type(file_path)
    if not artifact_type:
        sys.exit(0)  # Not a tracked artifact type

    # Read the file content
    full_path = Path(project_root) / file_path
    if not full_path.exists():
        sys.exit(0)

    with open(full_path, "r") as f:
        content = f.read()

    # Load registry
    registry = load_registry()

    # Extract and add artifact info
    if artifact_type == "api":
        info = extract_api_info(file_path, content)
        if info and info.get("name"):
            registry["apis"][info["name"]] = {
                "route": info.get("route"),
                "methods": info.get("methods", []),
                "schema": info.get("schema"),
                "file": info.get("file"),
                "created": datetime.now().isoformat()
            }

    elif artifact_type == "component":
        info = extract_component_info(file_path, content)
        if info and info.get("name"):
            registry["components"][info["name"]] = {
                "file": info.get("file"),
                "types": info.get("types"),
                "stories": info.get("stories"),
                "tests": info.get("tests"),
                "visualTests": info.get("visualTests"),
                "props": info.get("props", []),
                "variants": info.get("variants", []),
                "created": datetime.now().isoformat()
            }

    elif artifact_type == "page":
        info = extract_page_info(file_path, content)
        if info and info.get("name"):
            registry["pages"][info["name"]] = {
                "route": info.get("route"),
                "title": info.get("title"),
                "file": info.get("file"),
                "e2eTests": info.get("e2eTests"),
                "created": datetime.now().isoformat()
            }

    # Save updated registry
    save_registry(registry)

    # Output confirmation (shown in Claude's context)
    print(f"Registry updated: {artifact_type} '{info.get('name')}' added to .devkit/registry.json")

    sys.exit(0)

if __name__ == "__main__":
    main()
