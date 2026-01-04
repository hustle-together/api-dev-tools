#!/usr/bin/env python3
"""
Hook: PreToolUse for AskUserQuestion
Purpose: Send NTFY notification when user input is needed

Triggers before AskUserQuestion tool is called.
Sends push notification so user knows to check Claude Code.

Version: 3.10.0
"""
import json
import sys
from pathlib import Path

# Add lib to path
sys.path.insert(0, str(Path(__file__).parent))
from lib.ntfy import send_input_needed


def main():
    # Read hook input from stdin
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        # Always allow the tool to proceed
        print(json.dumps({"continue": True}))
        sys.exit(0)

    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})

    # Only trigger on AskUserQuestion
    if tool_name != "AskUserQuestion":
        print(json.dumps({"continue": True}))
        sys.exit(0)

    # Extract question info
    questions = tool_input.get("questions", [])
    if not questions:
        print(json.dumps({"continue": True}))
        sys.exit(0)

    # Get first question details
    q = questions[0]
    question_text = q.get("question", "Input needed")
    header = q.get("header", "Question")
    options = q.get("options", [])

    # Extract option labels
    option_labels = []
    for opt in options:
        if isinstance(opt, dict):
            option_labels.append(opt.get("label", str(opt)))
        else:
            option_labels.append(str(opt))

    # Determine phase from header
    phase = header if len(header) <= 20 else "Interview"

    # Send notification
    send_input_needed(
        question=question_text,
        options=option_labels if option_labels else None,
        phase=phase
    )

    # Always allow the tool to proceed
    print(json.dumps({"continue": True}))
    sys.exit(0)


if __name__ == "__main__":
    main()
