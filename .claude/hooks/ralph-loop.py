#!/usr/bin/env python3
"""
ralph-loop.py - Forces continuation until completion promise detected.
Place in: .claude/hooks/ralph-loop.py
"""
import sys
import json
from pathlib import Path

COMPLETION_PROMISE = "DONE"  # Or "<promise>COMPLETE</promise>"
MAX_ITERATIONS = 50

def get_iteration_count(session_id):
    try:
        return int(Path(f"/tmp/ralph_{session_id}_count").read_text())
    except:
        return 0

def increment_iteration_count(session_id):
    count = get_iteration_count(session_id) + 1
    Path(f"/tmp/ralph_{session_id}_count").write_text(str(count))

def main():
    input_data = json.loads(sys.stdin.read())

    session_id = input_data.get("session_id", "default")
    stop_hook_active = input_data.get("stop_hook_active", False)
    transcript_path = input_data.get("transcript_path", "")

    iteration_count = get_iteration_count(session_id)

    # Safety: max iterations
    if iteration_count >= MAX_ITERATIONS:
        output = {"decision": None, "reason": f"Max iterations ({MAX_ITERATIONS}) reached"}
        print(json.dumps(output))
        sys.exit(0)

    # Read transcript for completion promise
    try:
        transcript = Path(transcript_path).read_text()
    except:
        transcript = ""

    # Check for completion
    if COMPLETION_PROMISE in transcript:
        output = {"decision": None, "reason": "Completion promise detected"}
        print(json.dumps(output))
        sys.exit(0)

    # Block stop and continue
    increment_iteration_count(session_id)

    print(f"Task not complete. Continue working. Output '{COMPLETION_PROMISE}' when done.",
          file=sys.stderr)
    sys.exit(2)

if __name__ == "__main__":
    main()
