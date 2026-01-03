#!/usr/bin/env python3
"""Auto-formats files after modification."""
import json
import sys
import subprocess

try:
    input_data = json.load(sys.stdin)
except json.JSONDecodeError:
    sys.exit(1)

tool_name = input_data.get("tool_name", "")
file_path = input_data.get("tool_input", {}).get("file_path", "")

if tool_name in ["Edit", "Write", "MultiEdit"]:
    if file_path.endswith((".ts", ".tsx", ".js", ".jsx")):
        try:
            subprocess.run(["npx", "prettier", "--write", file_path],
                          capture_output=True, timeout=30)
        except Exception:
            pass

sys.exit(0)
