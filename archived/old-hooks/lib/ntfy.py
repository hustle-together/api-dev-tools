#!/usr/bin/env python3
"""
NTFY Notification Helper

Shared library for sending notifications via ntfy.sh

Usage:
    from lib.ntfy import send_notification, send_phase_update

Environment Variables:
    NTFY_ENABLED: Set to 'true' to enable notifications
    NTFY_SERVER: Server URL (default: https://ntfy.sh)
    NTFY_TOPIC: Your unique topic name

Version: 3.10.0
"""
import os
import json
import urllib.request
import urllib.error
from typing import Optional
from pathlib import Path


def get_config() -> dict:
    """Get NTFY configuration from environment or .env file."""
    config = {
        "enabled": os.environ.get("NTFY_ENABLED", "false").lower() == "true",
        "server": os.environ.get("NTFY_SERVER", "https://ntfy.sh"),
        "topic": os.environ.get("NTFY_TOPIC", ""),
    }

    # Try to read from .env if not in environment
    if not config["topic"]:
        env_file = Path.cwd() / ".env"
        if env_file.exists():
            try:
                for line in env_file.read_text().splitlines():
                    if line.startswith("NTFY_"):
                        key, _, value = line.partition("=")
                        key = key.strip()
                        value = value.strip().strip('"').strip("'")
                        if key == "NTFY_ENABLED":
                            config["enabled"] = value.lower() == "true"
                        elif key == "NTFY_SERVER":
                            config["server"] = value
                        elif key == "NTFY_TOPIC":
                            config["topic"] = value
            except IOError:
                pass

    return config


def send_notification(
    message: str,
    title: Optional[str] = None,
    priority: str = "default",
    tags: Optional[list] = None,
    include_tokens: bool = True
) -> bool:
    """
    Send a notification via NTFY.

    Args:
        message: The notification message
        title: Optional title
        priority: One of: min, low, default, high, urgent
        tags: List of emoji tags (e.g., ["rocket", "white_check_mark"])
        include_tokens: Whether to include token usage in message

    Returns:
        True if sent successfully, False otherwise
    """
    config = get_config()

    if not config["enabled"] or not config["topic"]:
        return False

    url = f"{config['server']}/{config['topic']}"

    # Build message with optional token info
    full_message = message
    if include_tokens:
        token_info = get_token_usage()
        if token_info:
            full_message += f"\n\n📊 Tokens: {token_info}"

    headers = {
        "Content-Type": "text/plain; charset=utf-8",
        "Priority": priority,
    }

    if title:
        headers["Title"] = title

    if tags:
        headers["Tags"] = ",".join(tags)

    try:
        req = urllib.request.Request(
            url,
            data=full_message.encode("utf-8"),
            headers=headers,
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            return response.status == 200
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError):
        return False


def send_phase_update(
    phase_name: str,
    status: str,
    details: Optional[str] = None,
    workflow: str = "api-create"
) -> bool:
    """
    Send a phase completion notification.

    Args:
        phase_name: Name of the phase (e.g., "Research", "Interview")
        status: One of "started", "complete", "blocked", "needs_input"
        details: Optional additional details
        workflow: The workflow name
    """
    status_emoji = {
        "started": "🔄",
        "complete": "✅",
        "blocked": "🚫",
        "needs_input": "⏳",
    }

    emoji = status_emoji.get(status, "📋")
    title = f"{emoji} {phase_name} - {status.replace('_', ' ').title()}"

    message = f"Workflow: {workflow}"
    if details:
        message += f"\n{details}"

    priority = "high" if status == "needs_input" else "default"
    tags = ["bell"] if status == "needs_input" else ["clipboard"]

    return send_notification(
        message=message,
        title=title,
        priority=priority,
        tags=tags
    )


def send_input_needed(
    question: str,
    options: Optional[list] = None,
    phase: str = "Interview"
) -> bool:
    """
    Send notification that user input is needed.

    Args:
        question: The question being asked
        options: Optional list of available options
        phase: The current phase
    """
    message = f"Question: {question}"
    if options:
        message += "\n\nOptions:\n" + "\n".join(f"  • {opt}" for opt in options)

    return send_notification(
        message=message,
        title=f"⏳ Input Needed - {phase}",
        priority="high",
        tags=["question", "bell"]
    )


def get_token_usage() -> Optional[str]:
    """Get current token usage from ccusage if available."""
    try:
        import subprocess
        result = subprocess.run(
            ["ccusage", "--json"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            data = json.loads(result.stdout)
            total = data.get("total_tokens", 0)
            cost = data.get("total_cost", 0)
            if total:
                return f"{total:,} tokens (${cost:.2f})"
    except (subprocess.TimeoutExpired, FileNotFoundError, json.JSONDecodeError):
        pass
    return None


if __name__ == "__main__":
    # Test notification
    import sys
    if len(sys.argv) > 1:
        message = " ".join(sys.argv[1:])
        if send_notification(message, title="Test Notification", tags=["test"]):
            print("✅ Notification sent!")
        else:
            print("❌ Failed to send (check NTFY_ENABLED and NTFY_TOPIC)")
    else:
        print("Usage: python ntfy.py <message>")
