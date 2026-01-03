#!/usr/bin/env python3
"""
NTFY notification hook for AskUserQuestion.

Sends a push notification via NTFY when a question is asked,
allowing the user to be notified on their phone/desktop.

Hook Type: PostToolUse (matcher: AskUserQuestion)
"""

import json
import os
import sys
from pathlib import Path

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False


def load_state():
    """Load workflow state for context"""
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")

    # Check hustle-build state first
    build_state = Path(project_dir) / ".claude" / "hustle-build-state.json"
    if build_state.exists():
        try:
            return json.loads(build_state.read_text())
        except Exception:
            pass

    # Check api-dev state
    api_state = Path(project_dir) / ".claude" / "api-dev-state.json"
    if api_state.exists():
        try:
            return json.loads(api_state.read_text())
        except Exception:
            pass

    return {}


def get_ntfy_config():
    """Get NTFY configuration from environment, .env file, or hustle-build-defaults.json"""
    topic = os.environ.get("NTFY_TOPIC")
    server = os.environ.get("NTFY_SERVER", "https://ntfy.sh")
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")

    if not topic:
        # Try loading from hustle-build-defaults.json first
        defaults_file = Path(project_dir) / ".claude" / "hustle-build-defaults.json"
        if defaults_file.exists():
            try:
                defaults = json.loads(defaults_file.read_text())
                ntfy_config = defaults.get("ntfy", {})
                if ntfy_config.get("enabled", False):
                    topic = ntfy_config.get("topic")
                    server = ntfy_config.get("server", server)
            except Exception:
                pass

    if not topic:
        # Try loading from .env
        env_file = Path(project_dir) / ".env"

        if env_file.exists():
            try:
                for line in env_file.read_text().splitlines():
                    if line.startswith("NTFY_TOPIC="):
                        topic = line.split("=", 1)[1].strip().strip('"\'')
                    elif line.startswith("NTFY_SERVER="):
                        server = line.split("=", 1)[1].strip().strip('"\'')
            except Exception:
                pass

    return topic, server


def send_notification(topic, server, title, message, priority="default", tags=None):
    """Send notification via NTFY"""
    if not HAS_REQUESTS:
        # Fallback to curl
        import subprocess
        try:
            headers = ["-H", f"Title: {title}", "-H", f"Priority: {priority}"]
            if tags:
                headers.extend(["-H", f"Tags: {','.join(tags)}"])

            subprocess.run(
                ["curl", "-s", "-d", message, *headers, f"{server}/{topic}"],
                capture_output=True,
                timeout=5
            )
            return True
        except Exception:
            return False

    try:
        headers = {
            "Title": title,
            "Priority": priority,
        }
        if tags:
            headers["Tags"] = ",".join(tags)

        response = requests.post(
            f"{server}/{topic}",
            data=message.encode("utf-8"),
            headers=headers,
            timeout=5
        )
        return response.status_code == 200
    except Exception:
        return False


def extract_question_summary(tool_input):
    """Extract question summary from tool input"""
    try:
        data = json.loads(tool_input)
        questions = data.get("questions", [])

        if not questions:
            return None, None

        # Get first question
        q = questions[0]
        header = q.get("header", "Question")
        question = q.get("question", "")
        options = q.get("options", [])

        # Truncate question for notification
        if len(question) > 100:
            question = question[:97] + "..."

        # Add option count
        option_text = f" ({len(options)} options)"

        return header, question + option_text
    except Exception:
        return None, None


def main():
    tool_input = os.environ.get("CLAUDE_TOOL_INPUT", "{}")

    # Check if in auto mode (skip notification in auto mode)
    state = load_state()
    if state.get("mode") == "auto":
        # In auto mode, questions are auto-answered
        # Only notify on errors, not questions
        print(json.dumps({"continue": True}))
        return

    # Get NTFY config
    topic, server = get_ntfy_config()

    if not topic:
        # NTFY not configured, skip
        print(json.dumps({"continue": True}))
        return

    # Extract question info
    header, message = extract_question_summary(tool_input)

    if not header or not message:
        print(json.dumps({"continue": True}))
        return

    # Build context for notification
    workflow = state.get("workflow", "")
    endpoint = state.get("active_endpoint") or state.get("active_element") or ""
    phase = ""

    # Find current phase
    phases = state.get("phases", {})
    for phase_name, phase_data in phases.items():
        if phase_data.get("status") == "in_progress":
            phase = phase_name.replace("_", " ").title()
            break

    # Build title
    title_parts = ["Hustle Dev"]
    if workflow:
        title_parts.append(workflow)
    if endpoint:
        title_parts.append(endpoint)
    title = " - ".join(title_parts)

    # Build message
    full_message = f"{header}: {message}"
    if phase:
        full_message = f"[{phase}] {full_message}"

    # Determine priority
    priority = "default"
    tags = ["question", "hustle"]

    # Higher priority for blocking questions
    if "required" in message.lower() or "must" in message.lower():
        priority = "high"
        tags.append("warning")

    # Send notification
    success = send_notification(topic, server, title, full_message, priority, tags)

    # Log notification
    if success:
        project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")
        logs_dir = Path(project_dir) / ".claude" / "workflow-logs"
        logs_dir.mkdir(parents=True, exist_ok=True)

        log_file = logs_dir / "ntfy-log.json"
        try:
            if log_file.exists():
                log = json.loads(log_file.read_text())
            else:
                log = {"notifications": []}

            from datetime import datetime
            log["notifications"].append({
                "timestamp": datetime.now().isoformat(),
                "title": title,
                "message": full_message,
                "workflow": workflow,
                "endpoint": endpoint
            })

            log_file.write_text(json.dumps(log, indent=2))
        except Exception:
            pass

    print(json.dumps({"continue": True}))


if __name__ == "__main__":
    main()
