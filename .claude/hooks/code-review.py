#!/usr/bin/env python3
"""Triggers AI code review after implementation."""
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

# Only trigger after code changes
if tool_name not in ["Edit", "Write", "MultiEdit"]:
    sys.exit(0)

# Skip test files
if ".test." in file_path or ".spec." in file_path or "__tests__" in file_path:
    sys.exit(0)

# Check if we're in the right phase
state_file = Path(cwd) / ".devkit" / "state.json"
if state_file.exists():
    state = json.loads(state_file.read_text())
    current_phase = state.get("progress", {}).get("currentPhase", "")

    # Queue code review if we're past TDD green phase
    if current_phase in ["tdd-green", "verify", "code-review"]:
        pending_file = Path(cwd) / ".devkit" / "pending-reviews.json"
        pending_file.parent.mkdir(parents=True, exist_ok=True)

        with open(pending_file, "a") as f:
            f.write(json.dumps({
                "file": file_path,
                "timestamp": state.get("updatedAt", "")
            }) + "\n")

sys.exit(0)
