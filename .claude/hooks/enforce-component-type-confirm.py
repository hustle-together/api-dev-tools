#!/usr/bin/env python3
"""
Hook: PreToolUse for Write/Edit
Purpose: Ensure user has confirmed component type before proceeding

This hook checks that:
1. AI has suggested a component type (basic/complex)
2. User has explicitly confirmed the type
3. The confirmation is recorded in state

If not confirmed, blocks the write and reminds to get user confirmation.

Version: 3.10.0
"""
import json
import sys
from pathlib import Path


def main():
    # Read hook input from stdin
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        print(json.dumps({"continue": True}))
        sys.exit(0)

    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})

    # Only check Write/Edit operations
    if tool_name not in ["Write", "Edit"]:
        print(json.dumps({"continue": True}))
        sys.exit(0)

    # Check if writing to a component file
    file_path = tool_input.get("file_path", "")
    if "/components/" not in file_path:
        print(json.dumps({"continue": True}))
        sys.exit(0)

    # Check for state file
    cwd = Path.cwd()
    state_file = cwd / ".claude" / "api-dev-state.json"

    if not state_file.exists():
        print(json.dumps({"continue": True}))
        sys.exit(0)

    try:
        state = json.loads(state_file.read_text())
    except (json.JSONDecodeError, IOError):
        print(json.dumps({"continue": True}))
        sys.exit(0)

    # Check if this is a UI workflow
    workflow = state.get("workflow", "")
    if "ui-create" not in workflow:
        print(json.dumps({"continue": True}))
        sys.exit(0)

    # Check for component type confirmation
    ui_config = state.get("ui_config", {})
    user_confirmed = ui_config.get("user_confirmed", False)
    component_type = ui_config.get("component_type", "")
    ai_suggested = ui_config.get("ai_suggested", "")

    if not user_confirmed:
        print(json.dumps({
            "continue": False,
            "reason": (
                "⚠️ Component type not confirmed by user.\n\n"
                "Before writing component files, you must:\n\n"
                "1. Analyze the component and suggest a type (Basic or Complex)\n"
                "2. Present your suggestion to the user\n"
                "3. Get explicit confirmation\n"
                "4. Update state with user_confirmed: true\n\n"
                "Example state update:\n"
                "{\n"
                '  "ui_config": {\n'
                f'    "component_type": "{component_type or "basic"}",\n'
                f'    "ai_suggested": "{ai_suggested or "basic"}",\n'
                '    "user_confirmed": true\n'
                "  }\n"
                "}\n\n"
                "Use AskUserQuestion to get confirmation."
            )
        }))
        sys.exit(0)

    # All checks passed
    print(json.dumps({"continue": True}))
    sys.exit(0)


if __name__ == "__main__":
    main()
