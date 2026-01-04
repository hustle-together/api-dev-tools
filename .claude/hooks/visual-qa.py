#!/usr/bin/env python3
"""
Visual QA Hook

Trigger: PostToolUse for Write (UI files during Phase 11)
Action: Create task specs for Haiku visual analysis subagent

Analyzes:
- Brand guide compliance (colors, typography, spacing)
- Accessibility issues (contrast, touch targets, focus states)
- Responsive breakpoint issues
- Visual consistency across viewports
- Dark mode support

Task specs are created in .devkit/tasks/visual-qa/ and processed by
the /visual-qa slash command which spawns Haiku subagents.
"""

import json
import sys
import os
import uuid
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
    results_path.parent.mkdir(parents=True, exist_ok=True)

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

def get_storybook_url(component_name: str) -> str:
    """Get the Storybook URL for a component."""
    # Convert PascalCase to kebab-case for Storybook URLs
    kebab = ""
    for i, c in enumerate(component_name):
        if c.isupper() and i > 0:
            kebab += "-"
        kebab += c.lower()
    return f"http://localhost:6006/?path=/story/{kebab}--default"

def create_task_spec(
    component_name: str,
    file_path: str,
    storybook_available: bool,
    brand_guide: str | None
) -> dict:
    """Create a visual QA task specification for Haiku subagent."""
    task_id = str(uuid.uuid4())[:8]

    viewports = [
        {"name": "mobile", "width": 375, "height": 667},
        {"name": "tablet", "width": 768, "height": 1024},
        {"name": "desktop", "width": 1920, "height": 1080}
    ]

    checks = [
        {
            "id": "brand",
            "name": "Brand Compliance",
            "description": "Check colors, typography, and spacing against brand guide",
            "severity_if_fail": "warning"
        },
        {
            "id": "contrast",
            "name": "Color Contrast",
            "description": "Verify WCAG AA contrast ratios (4.5:1 for text, 3:1 for large text)",
            "severity_if_fail": "error"
        },
        {
            "id": "touch_targets",
            "name": "Touch Targets",
            "description": "Ensure interactive elements are at least 44x44px",
            "severity_if_fail": "error"
        },
        {
            "id": "focus_states",
            "name": "Focus States",
            "description": "Verify visible focus indicators on interactive elements",
            "severity_if_fail": "error"
        },
        {
            "id": "responsive",
            "name": "Responsive Layout",
            "description": "Check layout adapts properly across breakpoints",
            "severity_if_fail": "warning"
        },
        {
            "id": "dark_mode",
            "name": "Dark Mode",
            "description": "Verify dark mode styling if supported",
            "severity_if_fail": "info"
        },
        {
            "id": "visual_consistency",
            "name": "Visual Consistency",
            "description": "Check alignment, spacing, and visual hierarchy",
            "severity_if_fail": "warning"
        }
    ]

    return {
        "id": task_id,
        "type": "visual-qa",
        "component": component_name,
        "file": file_path,
        "status": "pending",
        "created_at": datetime.now().isoformat(),
        "storybook": {
            "available": storybook_available,
            "url": get_storybook_url(component_name) if storybook_available else None
        },
        "viewports": viewports,
        "checks": checks,
        "brand_guide": brand_guide[:2000] if brand_guide else None,  # Truncate if too long
        "screenshots_dir": f".devkit/screenshots/{component_name}",
        "analysis_prompt": f"""Analyze the UI component "{component_name}" for visual quality.

IMPORTANT: You are a visual QA specialist. Analyze the screenshots carefully.

For each check, provide:
1. status: "pass", "fail", or "warning"
2. description: What you observed
3. suggestion: How to fix (if applicable)

Focus on:
- Color contrast (WCAG AA: 4.5:1 for normal text, 3:1 for large text/UI)
- Touch target sizes (minimum 44x44px)
- Focus state visibility
- Responsive behavior across viewports
- Visual alignment and consistency

Return structured JSON with your analysis."""
    }

def save_task_spec(task_spec: dict):
    """Save task spec to tasks directory."""
    tasks_dir = Path(get_project_root()) / ".devkit" / "tasks" / "visual-qa"
    tasks_dir.mkdir(parents=True, exist_ok=True)

    task_file = tasks_dir / f"{task_spec['id']}-{task_spec['component']}.json"
    with open(task_file, "w") as f:
        json.dump(task_spec, f, indent=2)

    return task_file

def queue_visual_test(file_path: str, component_name: str, storybook_available: bool, brand_guide: str | None):
    """Create and save a visual QA task spec."""
    task_spec = create_task_spec(component_name, file_path, storybook_available, brand_guide)
    task_file = save_task_spec(task_spec)
    return task_spec, task_file

def get_pending_tasks_count() -> int:
    """Get count of pending visual QA tasks."""
    tasks_dir = Path(get_project_root()) / ".devkit" / "tasks" / "visual-qa"
    if not tasks_dir.exists():
        return 0

    count = 0
    for task_file in tasks_dir.glob("*.json"):
        try:
            with open(task_file) as f:
                task = json.load(f)
                if task.get("status") == "pending":
                    count += 1
        except:
            pass
    return count

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

    # Check if we're in Phase 11 (Code Review) or UI workflow
    workflow = state.get("workflow", "")
    is_ui_workflow = workflow in ["hustle-ui-create", "hustle-ui-create-page"]

    # Get component name
    component_name = get_component_name(file_path)

    # Check if Storybook is available
    storybook_available = check_storybook_running()

    # Load brand guide if available
    brand_guide = load_brand_guide()

    # Create task spec for visual QA
    task_spec, task_file = queue_visual_test(
        file_path,
        component_name,
        storybook_available,
        brand_guide
    )

    # Save placeholder results
    save_visual_qa_results(component_name, {
        "status": "pending",
        "task_id": task_spec["id"],
        "file": file_path,
        "storybook_available": storybook_available,
        "requested_at": datetime.now().isoformat()
    })

    # Get pending tasks count
    pending_count = get_pending_tasks_count()

    # Output status
    print(f"Visual QA task created for {component_name}")
    print(f"  Task ID: {task_spec['id']}")
    print(f"  Task file: {task_file}")
    print(f"  Storybook: {'Available' if storybook_available else 'Not running'}")
    print(f"  Pending tasks: {pending_count}")

    if pending_count >= 1:
        print(f"\nRun /visual-qa to process pending visual QA tasks with Haiku analysis.")

    sys.exit(0)

if __name__ == "__main__":
    main()
