#!/usr/bin/env python3
"""Triggers screenshot testing for UI components."""
import json
import sys
from pathlib import Path

try:
    input_data = json.load(sys.stdin)
except json.JSONDecodeError:
    sys.exit(1)

tool_name = input_data.get("tool_name", "")
file_path = input_data.get("tool_input", {}).get("file_path", "")
cwd = input_data.get("cwd", "")

# Only trigger after UI file changes
if tool_name not in ["Edit", "Write", "MultiEdit"]:
    sys.exit(0)

# Check if it's a UI file
is_ui_file = any([
    ".tsx" in file_path and "components/" in file_path,
    ".stories." in file_path,
    "page.tsx" in file_path
])

if not is_ui_file:
    sys.exit(0)

# Queue visual test
pending_file = Path(cwd) / ".devkit" / "pending-visual-tests.json"
pending_file.parent.mkdir(parents=True, exist_ok=True)

with open(pending_file, "a") as f:
    f.write(json.dumps({
        "file": file_path,
        "viewports": ["375x667", "768x1024", "1920x1080"]
    }) + "\n")

sys.exit(0)
