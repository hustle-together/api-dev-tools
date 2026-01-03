#!/usr/bin/env python3
"""Re-injects state context every 7 turns to prevent drift."""
import json
import sys
from pathlib import Path

try:
    input_data = json.load(sys.stdin)
except json.JSONDecodeError:
    sys.exit(1)

cwd = input_data.get("cwd", "")
REGROUND_INTERVAL = 7

# Load state
state_file = Path(cwd) / ".devkit" / "state.json"
if not state_file.exists():
    sys.exit(0)

state = json.loads(state_file.read_text())
turn_count = state.get("metrics", {}).get("turnCount", 0)

# Check if we need to reground
if turn_count > 0 and turn_count % REGROUND_INTERVAL == 0:
    # Build context injection
    context_parts = []

    # Current phase
    current_phase = state.get("progress", {}).get("currentPhaseName", "unknown")
    context_parts.append(f"Current Phase: {current_phase}")

    # Completed phases
    completed = [k for k, v in state.get("phases", {}).items() if v.get("complete")]
    if completed:
        context_parts.append(f"Completed: {', '.join(completed)}")

    # Research findings if available
    if state.get("phases", {}).get("research", {}).get("complete"):
        cache_key = state.get("phases", {}).get("research", {}).get("cacheKey")
        if cache_key:
            context_parts.append(f"Research cached as: {cache_key}")

    # Interview answers if available
    if state.get("phases", {}).get("interview", {}).get("answers"):
        answers = state["phases"]["interview"]["answers"]
        context_parts.append(f"Interview decisions: {json.dumps(answers)}")

    # Output context for injection
    if context_parts:
        output = {
            "hookSpecificOutput": {
                "hookEventName": "Reground",
                "additionalContext": "\n".join(context_parts)
            }
        }
        print(json.dumps(output))

sys.exit(0)
