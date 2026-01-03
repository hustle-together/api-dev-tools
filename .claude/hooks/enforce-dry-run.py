#!/usr/bin/env python3
"""
Enforce Dry-Run Mode Hook

This hook blocks Write and Edit operations when --dry-run mode is active.
It allows the workflow to run completely (research, interviews, schema generation)
but prevents any files from being written.

Hook Type: PreToolUse (matcher: Write, Edit)

Use Cases:
- Preview what a workflow will create before committing
- Test autonomous mode without modifying files
- Validate workflow logic without side effects

v4.5.0: Initial implementation
"""

import json
import os
import sys
from pathlib import Path

# Import shared utilities
try:
    from hook_utils import (
        check_dry_run_mode,
        log_workflow_event,
        load_state
    )
    UTILS_AVAILABLE = True
except ImportError:
    UTILS_AVAILABLE = False


def get_file_path_from_env():
    """Extract file path from tool input environment variable."""
    tool_input = os.environ.get("CLAUDE_TOOL_INPUT", "{}")
    try:
        data = json.loads(tool_input)
        return data.get("file_path", "unknown")
    except json.JSONDecodeError:
        return "unknown"


def main():
    """Main hook entry point."""
    tool_name = os.environ.get("CLAUDE_TOOL_NAME", "")

    # Only enforce for Write and Edit tools
    if tool_name not in ["Write", "Edit"]:
        print(json.dumps({"continue": True}))
        return

    # Check if dry-run mode is active
    dry_run_active = False

    if UTILS_AVAILABLE:
        try:
            dry_run_active = check_dry_run_mode()
        except Exception:
            pass
    else:
        # Fallback: check state file directly
        try:
            project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")
            state_file = Path(project_dir) / ".claude" / "api-dev-state.json"
            if state_file.exists():
                state = json.loads(state_file.read_text())
                dry_run_active = state.get("dry_run_mode", False) or state.get("flags", {}).get("dry_run", False)
        except Exception:
            pass

    if not dry_run_active:
        # Normal mode - allow the operation
        print(json.dumps({"continue": True}))
        return

    # Dry-run mode active - block the write
    file_path = get_file_path_from_env()

    # Log the blocked operation
    if UTILS_AVAILABLE:
        try:
            log_workflow_event("dry_run_block", {
                "tool": tool_name,
                "file_path": file_path,
                "action": "blocked"
            })
        except Exception:
            pass

    # Return blocking result with informative message
    result = {
        "continue": False,
        "reason": f"""## 🔒 Dry-Run Mode Active

**Tool:** {tool_name}
**Would write to:** `{file_path}`

In dry-run mode, no files are modified. The workflow continues to show
what WOULD be created, but Write and Edit operations are blocked.

### To Execute For Real:
1. Run the same command without `--dry-run`
2. Or disable dry-run: Update state with `dry_run_mode: false`

### Preview Summary:
This operation would {_get_operation_description(tool_name, file_path)}

---
_Dry-run preview - no files were modified_
"""
    }
    print(json.dumps(result))


def _get_operation_description(tool_name, file_path):
    """Generate a human-readable description of the blocked operation."""
    path = Path(file_path)

    if tool_name == "Write":
        if not path.exists() if file_path != "unknown" else True:
            return f"create a new file at `{file_path}`"
        return f"overwrite the file at `{file_path}`"

    if tool_name == "Edit":
        return f"modify the file at `{file_path}`"

    return f"perform a {tool_name} operation on `{file_path}`"


if __name__ == "__main__":
    main()
