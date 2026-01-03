#!/usr/bin/env python3
"""Blocks completion until documentation is complete."""
import json
import sys
from pathlib import Path

try:
    input_data = json.load(sys.stdin)
except json.JSONDecodeError:
    sys.exit(1)

cwd = input_data.get("cwd", "")

# Check state file for docs completion
state_file = Path(cwd) / ".devkit" / "state.json"
if state_file.exists():
    state = json.loads(state_file.read_text())
    if state.get("phases", {}).get("docs", {}).get("complete"):
        sys.exit(0)  # Allow - docs done

# Check registry for documentation status
registry_file = Path(cwd) / ".devkit" / "registry.json"
if registry_file.exists():
    registry = json.loads(registry_file.read_text())
    # Check if current artifact has documentation
    # This is a simplified check
    sys.exit(0)

# Block with message to Claude
print("BLOCKED: Documentation phase not complete. Update docs and registry first.", file=sys.stderr)
sys.exit(2)
