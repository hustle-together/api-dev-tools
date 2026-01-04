#!/usr/bin/env python3
"""
Registry Update Hook

Trigger: PostToolUse for Write|Edit
Action: Parse written files and add artifacts to .devkit/registry.json

Detects:
- API routes: src/app/api/**/*.ts → apis section
- Components: src/components/**/*.tsx → components section
- Pages: src/app/**/page.tsx → pages section

Enhanced: Parses Zod schemas for full parameter documentation
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

def parse_zod_schema(schema_file_path: str) -> dict:
    """
    Parse Zod schema file to extract parameter metadata.

    Returns: {
        "params": [{"name": str, "type": str, "required": bool, "description": str, ...}]
    }
    """
    full_path = Path(get_project_root()) / schema_file_path
    if not full_path.exists():
        return {"params": []}

    with open(full_path, 'r') as f:
        content = f.read()

    params = []

    # Match Zod field patterns like:
    # domain: z.string().min(3).max(255).describe("Company domain")
    # limit: z.number().int().min(1).max(100).default(10).optional()
    # action: z.enum(["search", "get", "random"])

    # Find schema definitions
    schema_blocks = re.findall(r'z\.object\(\{([^}]+(?:\{[^}]*\}[^}]*)*)\}\)', content, re.DOTALL)

    for block in schema_blocks:
        # Match each field in the schema
        field_pattern = r'(\w+):\s*z\.(\w+)\(([^)]*)\)((?:\.[^,\n]+)*)'

        for match in re.finditer(field_pattern, block):
            name = match.group(1)
            base_type = match.group(2)  # string, number, boolean, enum, array
            type_args = match.group(3)  # enum values, etc.
            modifiers = match.group(4)  # .min(), .max(), .describe(), etc.

            param = {
                "name": name,
                "type": base_type,
                "required": ".optional()" not in modifiers and ".nullish()" not in modifiers
            }

            # Extract enum values
            if base_type == "enum":
                enum_match = re.search(r'\[([^\]]+)\]', type_args)
                if enum_match:
                    param["enum"] = [v.strip().strip('"\'') for v in enum_match.group(1).split(',')]

            # Extract min value
            min_match = re.search(r'\.min\((\d+)\)', modifiers)
            if min_match:
                param["min"] = int(min_match.group(1))

            # Extract max value
            max_match = re.search(r'\.max\((\d+)\)', modifiers)
            if max_match:
                param["max"] = int(max_match.group(1))

            # Extract default value
            default_match = re.search(r'\.default\(([^)]+)\)', modifiers)
            if default_match:
                default_val = default_match.group(1).strip()
                # Parse the default value
                if default_val.isdigit():
                    param["default"] = int(default_val)
                elif default_val in ["true", "false"]:
                    param["default"] = default_val == "true"
                else:
                    param["default"] = default_val.strip('"\'')

            # Extract description from .describe()
            desc_match = re.search(r'\.describe\(["\']([^"\']+)["\']\)', modifiers)
            if desc_match:
                param["description"] = desc_match.group(1)

            # Generate example based on type
            if "example" not in param:
                if base_type == "string":
                    if "enum" in param:
                        param["example"] = param["enum"][0]
                    elif "email" in modifiers:
                        param["example"] = "user@example.com"
                    elif "url" in modifiers:
                        param["example"] = "https://example.com"
                    else:
                        param["example"] = f"example_{name}"
                elif base_type == "number":
                    param["example"] = param.get("min", 1)
                elif base_type == "boolean":
                    param["example"] = param.get("default", True)

            params.append(param)

    return {"params": params}

def generate_curl_example(route: str, method: str, params: list, body: dict = None) -> str:
    """Generate curl command from endpoint info."""
    base_url = "http://localhost:3000"

    if method == "GET":
        # Build query string from params
        query_parts = []
        for p in params:
            if p.get("example"):
                query_parts.append(f"{p['name']}={p['example']}")

        query_string = "&".join(query_parts)
        url = f"{base_url}{route}"
        if query_string:
            url += f"?{query_string}"

        return f'curl -X GET "{url}"'

    else:
        # POST/PUT/PATCH/DELETE with body
        if body is None:
            body = {}
            for p in params:
                if p.get("example") is not None:
                    body[p["name"]] = p["example"]

        return f'curl -X {method} "{base_url}{route}" -H "Content-Type: application/json" -d \'{json.dumps(body)}\''

def generate_examples(route: str, methods: list, params: list) -> dict:
    """Generate example requests for each method."""
    examples = {}

    for method in methods:
        # Basic example
        example_name = f"basic_{method.lower()}"
        body = {}

        # Build body from required params
        for p in params:
            if p.get("required", False) and p.get("example") is not None:
                body[p["name"]] = p["example"]

        examples[example_name] = {
            "description": f"Basic {method} request",
            "method": method,
            "curl": generate_curl_example(route, method, params, body if method != "GET" else None),
            "body": body if method != "GET" else None
        }

    return examples

def extract_api_info(file_path: str, content: str) -> dict:
    """Extract API endpoint information from route file."""
    project_root = get_project_root()

    # Extract HTTP methods
    methods = []
    for method in ["GET", "POST", "PUT", "PATCH", "DELETE"]:
        if f"export async function {method}" in content or f"export function {method}" in content:
            methods.append(method)

    # Extract route from file path (src/app/api/stripe/checkout/route.ts → /api/stripe/checkout)
    route_match = re.search(r'src/app(/api/[^/]+(?:/[^/]+)*)/route\.ts', file_path)
    route = route_match.group(1) if route_match else None

    # Extract schema import/name
    schema_match = re.search(r'(\w+Schema)', content)
    schema_name = schema_match.group(1) if schema_match else None

    # Find schema file
    schema_file = None
    if route:
        # Look for schemas.ts in same directory
        route_dir = Path(file_path).parent
        possible_schemas = [
            route_dir / "schemas.ts",
            route_dir / "schema.ts",
            Path(project_root) / "src" / "lib" / "schemas" / f"{route.split('/')[-1]}.ts"
        ]
        for sf in possible_schemas:
            if sf.exists():
                schema_file = str(sf.relative_to(project_root))
                break

    # Extract endpoint name from route
    if route:
        name = route.split("/")[-1]
    else:
        name = Path(file_path).stem

    # Parse Zod schema for detailed params
    params = []
    if schema_file:
        schema_data = parse_zod_schema(schema_file)
        params = schema_data.get("params", [])

    # Extract description from JSDoc comment
    description = None
    desc_match = re.search(r'/\*\*\s*\n\s*\*\s*(.+?)\n', content)
    if desc_match:
        description = desc_match.group(1).strip()

    # Generate examples
    examples = generate_examples(route or f"/api/{name}", methods, params)

    return {
        "name": name,
        "description": description or f"API endpoint for {name}",
        "route": route,
        "routeFile": file_path,
        "schemaFile": schema_file,
        "methods": methods,
        "endpoints": {
            "default": {
                "methods": methods,
                "description": description or f"{name} endpoint",
                "params": params,
                "examples": examples
            }
        }
    }

def extract_component_info(file_path: str, content: str) -> dict:
    """Extract component information from TSX file."""
    project_root = get_project_root()
    path = Path(file_path)
    component_name = path.stem

    # Skip if it's a test, story, or type file
    if any(x in component_name for x in [".test", ".spec", ".stories", ".types"]):
        return None

    # Extract props from interface
    props = []
    props_match = re.search(r'interface \w+Props\s*{([^}]+)}', content, re.DOTALL)
    if props_match:
        prop_lines = props_match.group(1)
        # Match prop name, optional marker, and type
        for prop_match in re.finditer(r'(\w+)(\?)?:\s*([^;]+)', prop_lines):
            prop = {
                "name": prop_match.group(1),
                "required": prop_match.group(2) != "?",
                "type": prop_match.group(3).strip()
            }
            props.append(prop)

    # Extract variants from cva or similar
    variants = []
    variants_match = re.search(r'variant:\s*\{[^}]*\}', content)
    if variants_match:
        variant_keys = re.findall(r'(\w+):\s*["\']', variants_match.group())
        variants = variant_keys

    # Alternative: look for variant type
    variant_type_match = re.search(r"variant['\"]?\s*:\s*\[([^\]]+)\]", content)
    if variant_type_match:
        variants = [v.strip().strip("'\"") for v in variant_type_match.group(1).split(",")]

    # Look for related files
    parent_dir = Path(project_root) / path.parent
    related_files = {}

    types_file = parent_dir / f"{component_name}.types.ts"
    if types_file.exists():
        related_files["types"] = str(types_file.relative_to(project_root))

    stories_file = parent_dir / f"{component_name}.stories.tsx"
    if stories_file.exists():
        related_files["stories"] = str(stories_file.relative_to(project_root))

    test_file = parent_dir / f"{component_name}.test.tsx"
    if test_file.exists():
        related_files["tests"] = str(test_file.relative_to(project_root))

    visual_test = parent_dir / f"{component_name}.visual.spec.ts"
    if visual_test.exists():
        related_files["visualTests"] = str(visual_test.relative_to(project_root))

    # Extract description from JSDoc
    description = None
    desc_match = re.search(r'/\*\*\s*\n\s*\*\s*(.+?)\n', content)
    if desc_match:
        description = desc_match.group(1).strip()

    return {
        "name": component_name,
        "description": description or f"{component_name} component",
        "file": file_path,
        "props": props,
        "variants": variants if variants else ["default"],
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

    # Extract description from metadata
    description = None
    desc_match = re.search(r'description:\s*["\']([^"\']+)["\']', content)
    if desc_match:
        description = desc_match.group(1)

    # Look for E2E test file
    project_root = get_project_root()
    parent_dir = Path(project_root) / Path(file_path).parent
    e2e_test = parent_dir / "page.e2e.test.ts"

    return {
        "name": name,
        "route": route,
        "title": title or name,
        "description": description,
        "file": file_path,
        "e2eTests": str(e2e_test.relative_to(project_root)) if e2e_test.exists() else None
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
    info = None

    if artifact_type == "api":
        info = extract_api_info(file_path, content)
        if info and info.get("name"):
            registry["apis"][info["name"]] = {
                "name": info.get("name"),
                "description": info.get("description"),
                "route": info.get("route"),
                "routeFile": info.get("routeFile"),
                "schemaFile": info.get("schemaFile"),
                "methods": info.get("methods", []),
                "endpoints": info.get("endpoints", {}),
                "created": datetime.now().isoformat(),
                "status": "active"
            }

    elif artifact_type == "component":
        info = extract_component_info(file_path, content)
        if info and info.get("name"):
            registry["components"][info["name"]] = {
                "name": info.get("name"),
                "description": info.get("description"),
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
                "name": info.get("name"),
                "route": info.get("route"),
                "title": info.get("title"),
                "description": info.get("description"),
                "file": info.get("file"),
                "e2eTests": info.get("e2eTests"),
                "created": datetime.now().isoformat()
            }

    # Save updated registry
    save_registry(registry)

    # Output confirmation
    if info:
        print(f"Registry updated: {artifact_type} '{info.get('name')}' added to .devkit/registry.json")
        if artifact_type == "api" and info.get("endpoints", {}).get("default", {}).get("params"):
            param_count = len(info["endpoints"]["default"]["params"])
            print(f"  Extracted {param_count} parameters from Zod schema")

    sys.exit(0)

if __name__ == "__main__":
    main()
