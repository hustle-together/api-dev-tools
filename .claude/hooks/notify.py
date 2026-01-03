#!/usr/bin/env python3
"""Sends NTFY push notification when waiting for user input."""
import json
import sys
import os
import urllib.request
import urllib.error

try:
    input_data = json.load(sys.stdin)
except json.JSONDecodeError:
    sys.exit(1)

# Get NTFY topic from environment
ntfy_topic = os.environ.get("NTFY_TOPIC", "devkit-notifications")

# Check what triggered the notification
tool_name = input_data.get("tool_name", "")
notification_type = input_data.get("notification_type", "info")

# Build message based on context
if tool_name == "AskUserQuestion":
    message = "Claude Code is waiting for your input"
    title = "Input Needed"
    priority = "high"
else:
    message = input_data.get("message", "Notification from Claude Code")
    title = "Devkit"
    priority = "default"

# Send notification via NTFY
try:
    url = f"https://ntfy.sh/{ntfy_topic}"
    data = message.encode("utf-8")
    headers = {
        "Title": title,
        "Priority": priority,
        "Tags": "robot"
    }

    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=5) as response:
        pass  # Notification sent
except (urllib.error.URLError, TimeoutError):
    pass  # Fail silently - notification is optional

sys.exit(0)
