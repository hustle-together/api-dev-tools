#!/usr/bin/env python3
"""Validates bash commands for safety."""
import json
import sys

try:
    input_data = json.load(sys.stdin)
except json.JSONDecodeError:
    sys.exit(1)

tool_name = input_data.get("tool_name", "")
if tool_name != "Bash":
    sys.exit(0)

command = input_data.get("tool_input", {}).get("command", "")

# Dangerous patterns to block
DANGEROUS_PATTERNS = [
    "rm -rf /",
    "rm -rf ~",
    "rm -rf /*",
    "> /dev/sda",
    "mkfs",
    "dd if=",
    ":(){:|:&};:",  # Fork bomb
]

for pattern in DANGEROUS_PATTERNS:
    if pattern in command:
        print(f"BLOCKED: Dangerous command pattern detected: {pattern}", file=sys.stderr)
        sys.exit(2)

# Warn about potentially destructive commands
WARN_PATTERNS = [
    "rm -rf",
    "git push --force",
    "git reset --hard",
    "DROP TABLE",
    "DELETE FROM",
]

for pattern in WARN_PATTERNS:
    if pattern in command:
        print(f"WARNING: Potentially destructive command: {pattern}")

sys.exit(0)
