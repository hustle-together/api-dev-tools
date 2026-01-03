#!/usr/bin/env python3
"""Blocks code changes until interview phase complete."""
import json
import sys
from pathlib import Path

try:
    input_data = json.load(sys.stdin)
except json.JSONDecodeError:
    sys.exit(1)

tool_name = input_data.get("tool_name", "")
cwd = input_data.get("cwd", "")

# Only check for code-modifying tools
if tool_name not in ["Edit", "Write", "MultiEdit"]:
    sys.exit(0)

# Check state file for interview completion
state_file = Path(cwd) / ".devkit" / "state.json"
if state_file.exists():
    state = json.loads(state_file.read_text())
    if state.get("phases", {}).get("interview", {}).get("complete"):
        sys.exit(0)  # Allow - interview done

# Block with message to Claude
print("BLOCKED: Interview phase not complete. Complete requirements interview first.", file=sys.stderr)
sys.exit(2)
