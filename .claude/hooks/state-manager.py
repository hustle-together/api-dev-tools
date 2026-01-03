#!/usr/bin/env python3
"""Updates state.json after each action."""
import json
import sys
from pathlib import Path
from datetime import datetime

try:
    input_data = json.load(sys.stdin)
except json.JSONDecodeError:
    sys.exit(1)

tool_name = input_data.get("tool_name", "")
cwd = input_data.get("cwd", "")

state_file = Path(cwd) / ".devkit" / "state.json"

# Load or create state
if state_file.exists():
    state = json.loads(state_file.read_text())
else:
    state = {
        "version": "1.0.0",
        "status": "initialized",
        "progress": {"currentPhase": "setup", "completedSteps": 0, "totalSteps": 14},
        "phases": {},
        "metrics": {"turnCount": 0, "researchQueries": 0, "testsWritten": 0, "filesCreated": 0}
    }

# Update metrics based on tool used
if tool_name in ["Edit", "Write", "MultiEdit"]:
    state["metrics"]["filesCreated"] = state["metrics"].get("filesCreated", 0) + 1
elif tool_name in ["WebSearch", "WebFetch"]:
    state["metrics"]["researchQueries"] = state["metrics"].get("researchQueries", 0) + 1

# Update turn count
state["metrics"]["turnCount"] = state["metrics"].get("turnCount", 0) + 1

# Update timestamp
state["updatedAt"] = datetime.now().isoformat()

# Save state
state_file.parent.mkdir(parents=True, exist_ok=True)
state_file.write_text(json.dumps(state, indent=2))

sys.exit(0)
