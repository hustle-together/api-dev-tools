#!/usr/bin/env python3
"""Enforces TDD - blocks implementation without failing tests."""
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

# Only check implementation files (not test files)
if tool_name not in ["Edit", "Write", "MultiEdit"]:
    sys.exit(0)

if not file_path:
    sys.exit(0)

# Skip if this is a test file
if ".test." in file_path or ".spec." in file_path or "__tests__" in file_path:
    sys.exit(0)

# Check state for TDD red phase completion
state_file = Path(cwd) / ".devkit" / "state.json"
if state_file.exists():
    state = json.loads(state_file.read_text())
    tdd_phase = state.get("phases", {}).get("tdd-red", {})
    if tdd_phase.get("complete"):
        sys.exit(0)  # Allow - tests written first

# Block with message
print("BLOCKED: TDD requires writing failing tests first. Use /red command.", file=sys.stderr)
sys.exit(2)
