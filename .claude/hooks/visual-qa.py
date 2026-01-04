#!/usr/bin/env python3
"""
Visual QA Hook

Trigger: PostToolUse for Write (UI files during Phase 11)
Action: Run Haiku subagent for visual analysis

Analyzes:
- Brand guide compliance
- Accessibility issues (contrast, touch targets)
- Responsive breakpoint issues
- Visual consistency
"""

import json
import sys
import os
from datetime import datetime
from pathlib import Path

def get_project_root():
    """Get the project root directory."""
    return os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())

def load_state():
    """Load the workflow state file."""
    state_path = Path(get_project_root()) / ".devkit" / "state.json"
    if state_path.exists():
        with open(state_path, "r") as f:
            return json.load(f)
    return {}

def load_brand_guide():
    """Load the brand guide if it exists."""
    brand_path = Path(get_project_root()) / ".claude" / "BRAND_GUIDE.md"
    if brand_path.exists():
        with open(brand_path, "r") as f:
            return f.read()
    return None

def save_visual_qa_results(component_name: str, results: dict):
    """Save visual QA results to file."""
    results_path = Path(get_project_root()) / ".devkit" / "visual-qa-results.json"

    # Load existing results
    existing = {}
    if results_path.exists():
        with open(results_path, "r") as f:
            existing = json.load(f)

    # Add new results
    existing[component_name] = {
        "timestamp": datetime.now().isoformat(),
        "results": results
    }

    # Save
    with open(results_path, "w") as f:
        json.dump(existing, f, indent=2)

def is_ui_file(file_path: str) -> bool:
    """Check if the file is a UI file (component or page)."""
    if not file_path.endswith(".tsx"):
        return False

    # Skip test/story files
    if any(x in file_path for x in [".test.", ".spec.", ".stories."]):
        return False

    # Check if it's a component or page
    return "/components/" in file_path or file_path.endswith("page.tsx")

def is_phase_11(state: dict) -> bool:
    """Check if we're in Phase 11 (Code Review)."""
    phases = state.get("phases", {})
    code_review = phases.get("code_review", {})
    return code_review.get("status") == "in_progress"

def get_component_name(file_path: str) -> str:
    """Extract component name from file path."""
    path = Path(file_path)

    if file_path.endswith("page.tsx"):
        # For pages, use parent directory name
        return path.parent.name.title() + "Page"
    else:
        return path.stem

def check_storybook_running() -> bool:
    """Check if Storybook is running on port 6006."""
    import socket
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('localhost', 6006))
        sock.close()
        return result == 0
    except Exception:
        return False

def queue_visual_test(file_path: str, component_name: str):
    """Queue a visual test for later execution."""
    pending_file = Path(get_project_root()) / ".devkit" / "pending-visual-tests.json"
    pending_file.parent.mkdir(parents=True, exist_ok=True)

    with open(pending_file, "a") as f:
        f.write(json.dumps({
            "file": file_path,
            "component": component_name,
            "viewports": ["375x667", "768x1024", "1920x1080"],
            "queued_at": datetime.now().isoformat()
        }) + "\n")

def main():
    # Read hook input from stdin
    try:
        hook_input = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        sys.exit(0)

    tool_name = hook_input.get("tool_name", "")
    tool_input = hook_input.get("tool_input", {})

    # Only process Write/Edit tools
    if tool_name not in ["Write", "Edit", "MultiEdit"]:
        sys.exit(0)

    file_path = tool_input.get("file_path", "")

    # Only process UI files
    if not is_ui_file(file_path):
        sys.exit(0)

    # Load state
    state = load_state()

    # Check if we're in Phase 11 (Code Review)
    # Or if workflow is UI-related (component/page creation)
    workflow = state.get("workflow", "")
    is_ui_workflow = workflow in ["hustle-ui-create", "hustle-ui-create-page"]

    # Get component name
    component_name = get_component_name(file_path)

    # Queue the visual test
    queue_visual_test(file_path, component_name)

    # Check if Storybook is available for screenshots
    storybook_available = check_storybook_running()

    # If in Phase 11 or UI workflow, trigger immediate analysis
    if is_phase_11(state) or is_ui_workflow:
        # Save placeholder results (to be updated by subagent)
        save_visual_qa_results(component_name, {
            "status": "pending",
            "file": file_path,
            "storybook_available": storybook_available,
            "requested_at": datetime.now().isoformat()
        })

        # Output instructions for the visual QA subagent
        output = {
            "action": "visual_qa_required",
            "component": component_name,
            "file": file_path,
            "storybook_available": storybook_available,
            "viewports": ["mobile (375px)", "tablet (768px)", "desktop (1920px)"],
            "checks": [
                "Brand guide compliance (colors, typography, spacing)",
                "Accessibility (contrast ratios, touch targets, focus states)",
                "Responsive design (breakpoints, flexible layouts)",
                "Dark mode support"
            ]
        }

        print(f"Visual QA queued for {component_name}")
        print(json.dumps(output, indent=2))

    sys.exit(0)

if __name__ == "__main__":
    main()
