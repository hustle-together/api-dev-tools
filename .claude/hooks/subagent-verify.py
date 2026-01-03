#!/usr/bin/env python3
"""Verifies subagent completion before allowing stop."""
import json
import sys
from pathlib import Path

try:
    input_data = json.load(sys.stdin)
except json.JSONDecodeError:
    sys.exit(1)

# Get subagent info
subagent_name = input_data.get("subagent_name", "")
cwd = input_data.get("cwd", "")

# Check state for expected outputs
state_file = Path(cwd) / ".devkit" / "state.json"
if not state_file.exists():
    sys.exit(0)

state = json.loads(state_file.read_text())

# Define expected outputs per subagent
EXPECTED_OUTPUTS = {
    "researcher": ["research_report"],
    "builder": ["tests_written", "implementation_complete"],
    "reviewer": ["review_complete"],
    "docs-generator": ["docs_generated"],
    "visual-analyzer": ["screenshots_captured"],
    "orchestrator": ["phase_complete"]
}

if subagent_name in EXPECTED_OUTPUTS:
    expected = EXPECTED_OUTPUTS[subagent_name]
    outputs = state.get("subagent_outputs", {}).get(subagent_name, [])

    missing = [e for e in expected if e not in outputs]
    if missing:
        print(f"BLOCKED: Subagent {subagent_name} missing outputs: {missing}", file=sys.stderr)
        sys.exit(2)

sys.exit(0)
