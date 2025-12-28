#!/usr/bin/env python3
"""
Hook: PostToolUse
Purpose: Send NTFY notification when a phase completes

Triggers after state file is updated with phase completion.
Includes token usage in notification.

Version: 3.10.0
"""
import json
import sys
from pathlib import Path

# Add lib to path
sys.path.insert(0, str(Path(__file__).parent))
from lib.ntfy import send_phase_update


def main():
    # Read hook input from stdin
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        sys.exit(0)

    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})

    # Only trigger on Write/Edit to state file
    if tool_name not in ["Write", "Edit"]:
        sys.exit(0)

    file_path = tool_input.get("file_path", "")
    if "api-dev-state.json" not in file_path:
        sys.exit(0)

    # Read the updated state
    cwd = Path.cwd()
    state_file = cwd / ".claude" / "api-dev-state.json"

    if not state_file.exists():
        sys.exit(0)

    try:
        state = json.loads(state_file.read_text())
    except (json.JSONDecodeError, IOError):
        sys.exit(0)

    # Check for recently completed phases
    phases = state.get("phases", {})
    workflow = state.get("workflow", "unknown")
    element = state.get("element_name", state.get("endpoint", "unknown"))

    phase_names = {
        "disambiguation": "Disambiguation",
        "scope": "Scope",
        "research_initial": "Initial Research",
        "interview": "Interview",
        "research_deep": "Deep Research",
        "schema_creation": "Schema Creation",
        "environment_check": "Environment Check",
        "tdd_red": "TDD Red",
        "tdd_green": "TDD Green",
        "verify": "Verification",
        "tdd_refactor": "Refactor",
        "documentation": "Documentation",
        "completion": "Completion",
    }

    for phase_key, phase_data in phases.items():
        if isinstance(phase_data, dict):
            status = phase_data.get("status", "")
            notified = phase_data.get("ntfy_notified", False)

            if status == "complete" and not notified:
                phase_name = phase_names.get(phase_key, phase_key.title())
                send_phase_update(
                    phase_name=phase_name,
                    status="complete",
                    details=f"Element: {element}",
                    workflow=workflow
                )
                # Mark as notified (would need to update state, but we avoid writes in hooks)

    sys.exit(0)


if __name__ == "__main__":
    main()
