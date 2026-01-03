#!/usr/bin/env python3
"""Warns at 50/75/90% context capacity."""
import json
import sys

try:
    input_data = json.load(sys.stdin)
except json.JSONDecodeError:
    sys.exit(1)

# Get context usage from input
context_used = input_data.get("context_tokens_used", 0)
context_limit = input_data.get("context_limit", 200000)  # Default Claude limit

if context_limit == 0:
    sys.exit(0)

# Calculate percentage
usage_percent = (context_used / context_limit) * 100

# Warning thresholds
warnings = {
    90: "CRITICAL: 90% context capacity used. Consider summarizing or starting new session.",
    75: "WARNING: 75% context capacity used. Consider wrapping up current task.",
    50: "INFO: 50% context capacity used."
}

for threshold, message in sorted(warnings.items(), reverse=True):
    if usage_percent >= threshold:
        output = {
            "hookSpecificOutput": {
                "hookEventName": "CapacityWarning",
                "capacityPercent": round(usage_percent, 1),
                "warning": message
            }
        }
        print(json.dumps(output))
        break

sys.exit(0)
