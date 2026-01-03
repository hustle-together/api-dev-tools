#!/usr/bin/env python3
"""PostToolUse hook for visual verification - queues visual tests after component edits."""
import json
import sys

try:
    input_data = json.load(sys.stdin)
except json.JSONDecodeError:
    sys.exit(1)

tool_name = input_data.get("tool_name", "")
file_path = input_data.get("tool_input", {}).get("file_path", "")

# Trigger visual test after component edits
if tool_name in ["Edit", "Write"] and ".tsx" in file_path:
    if "components/" in file_path:
        # Queue visual test
        with open(".devkit/pending-visual-tests.json", "a") as f:
            f.write(json.dumps({"file": file_path}) + "\n")

sys.exit(0)
