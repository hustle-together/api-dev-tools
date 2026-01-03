#!/usr/bin/env python3
"""Blocks code changes until research phase complete."""
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

# Check state file for research completion
state_file = Path(cwd) / ".devkit" / "state.json"
if state_file.exists():
    state = json.loads(state_file.read_text())
    if state.get("phases", {}).get("research", {}).get("complete"):
        sys.exit(0)  # Allow - research done

# Block with message to Claude
print("BLOCKED: Research phase not complete. Run /research first.", file=sys.stderr)
sys.exit(2)
