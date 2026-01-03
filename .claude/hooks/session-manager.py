#!/usr/bin/env python3
"""Loads development context at session start."""
import json
import sys
import subprocess
from pathlib import Path

try:
    input_data = json.load(sys.stdin)
except json.JSONDecodeError:
    sys.exit(1)

cwd = input_data.get("cwd", "")
context_parts = []

# Load workflow state
state_file = Path(cwd) / ".devkit" / "state.json"
if state_file.exists():
    state = json.loads(state_file.read_text())
    current_phase = state.get("progress", {}).get("currentPhase", "unknown")
    context_parts.append(f"Current workflow phase: {current_phase}")

# Load registry
registry_file = Path(cwd) / ".devkit" / "registry.json"
if registry_file.exists():
    registry = json.loads(registry_file.read_text())
    apis = len(registry.get("artifacts", {}).get("apis", []))
    components = len(registry.get("artifacts", {}).get("components", []))
    context_parts.append(f"Registry: {apis} APIs, {components} components")

# Git status
try:
    result = subprocess.run(["git", "status", "--short"],
                           capture_output=True, text=True, timeout=5)
    if result.stdout.strip():
        context_parts.append(f"Git changes:\n{result.stdout.strip()}")
except Exception:
    pass

if context_parts:
    output = {
        "hookSpecificOutput": {
            "hookEventName": "SessionStart",
            "additionalContext": "\n\n".join(context_parts)
        }
    }
    print(json.dumps(output))

sys.exit(0)
