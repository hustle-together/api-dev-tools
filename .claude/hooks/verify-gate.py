#!/usr/bin/env python3
"""Forces continuation if verification fails."""
import json
import sys
import subprocess

try:
    input_data = json.load(sys.stdin)
except json.JSONDecodeError:
    sys.exit(1)

# Prevent infinite loops
if input_data.get("stop_hook_active", False):
    sys.exit(0)

# Run verification
try:
    result = subprocess.run(
        ["npm", "run", "test"],
        capture_output=True,
        timeout=60
    )
    if result.returncode != 0:
        output = {
            "decision": "block",
            "reason": f"Tests failing. Fix before completing:\n{result.stderr.decode()[:500]}"
        }
        print(json.dumps(output))
        sys.exit(0)
except Exception as e:
    pass

sys.exit(0)
