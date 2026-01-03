#!/usr/bin/env python3
"""
Remote Question Proxy Hook

When REMOTE_QUESTIONS_ENABLED=true, this hook:
1. Writes the current question to .claude/current-question.json
2. Sends NTFY notification with link to the web UI
3. Optionally waits for remote answer

Hook Type: PreToolUse (matcher: AskUserQuestion)
Version: 4.6.0
"""

import json
import os
import sys
import time
import subprocess
from pathlib import Path
from datetime import datetime

# Configuration
DEFAULT_PORT = 8765
POLL_INTERVAL = 2  # seconds
MAX_WAIT_TIME = 300  # 5 minutes


def get_project_dir():
    """Get project directory from environment."""
    return Path(os.environ.get("CLAUDE_PROJECT_DIR", "."))


def is_remote_questions_enabled():
    """Check if remote questions feature is enabled."""
    return os.environ.get("REMOTE_QUESTIONS_ENABLED", "").lower() == "true"


def get_remote_url():
    """Get the remote URL (Cloudflare tunnel or localhost)."""
    url = os.environ.get("REMOTE_QUESTIONS_URL", "")
    if url:
        return url.rstrip("/")

    port = os.environ.get("REMOTE_QUESTIONS_PORT", DEFAULT_PORT)
    return f"http://localhost:{port}"


def get_ntfy_topic():
    """Get NTFY topic from environment."""
    return os.environ.get("NTFY_TOPIC", "layers-mf-08ebf1d1")


def parse_question_input(tool_input_raw):
    """Parse the AskUserQuestion tool input."""
    try:
        data = json.loads(tool_input_raw)
        questions = data.get("questions", [])
        return questions
    except Exception:
        return []


def write_question_file(questions, phase="unknown"):
    """Write question to .claude/current-question.json for the server."""
    project_dir = get_project_dir()
    question_file = project_dir / ".claude" / "current-question.json"
    question_file.parent.mkdir(parents=True, exist_ok=True)

    # Format questions for the web UI
    formatted_questions = []
    for q in questions:
        formatted_q = {
            "id": q.get("header", "question").lower().replace(" ", "-"),
            "question": q.get("question", ""),
            "header": q.get("header", "Question"),
            "options": [],
            "multiSelect": q.get("multiSelect", False),
            "timestamp": datetime.now().isoformat()
        }

        for opt in q.get("options", []):
            formatted_q["options"].append({
                "label": opt.get("label", ""),
                "description": opt.get("description", "")
            })

        formatted_questions.append(formatted_q)

    question_data = {
        "questions": formatted_questions,
        "phase": phase,
        "created_at": datetime.now().isoformat(),
        "status": "pending"
    }

    question_file.write_text(json.dumps(question_data, indent=2))
    return question_file


def clear_answer_file():
    """Clear any existing answer file."""
    project_dir = get_project_dir()
    answer_file = project_dir / ".claude" / "pending-answer.json"
    if answer_file.exists():
        answer_file.unlink()


def send_ntfy_notification(url):
    """Send NTFY notification with link to question UI."""
    topic = get_ntfy_topic()
    message = f"[INPUT NEEDED] Answer question at: {url}"

    try:
        subprocess.run(
            ["curl", "-s", "-d", message, f"ntfy.sh/{topic}"],
            capture_output=True,
            timeout=10
        )
    except Exception:
        pass  # Don't fail if notification fails


def wait_for_answer(timeout=MAX_WAIT_TIME):
    """Wait for answer to appear in pending-answer.json."""
    project_dir = get_project_dir()
    answer_file = project_dir / ".claude" / "pending-answer.json"

    start_time = time.time()

    while time.time() - start_time < timeout:
        if answer_file.exists():
            try:
                answer_data = json.loads(answer_file.read_text())
                if answer_data.get("status") == "submitted":
                    return answer_data
            except Exception:
                pass

        time.sleep(POLL_INTERVAL)

    return None


def get_current_phase():
    """Try to determine current workflow phase from state."""
    project_dir = get_project_dir()

    # Check hustle-build state
    build_state_file = project_dir / ".claude" / "hustle-build-state.json"
    if build_state_file.exists():
        try:
            state = json.loads(build_state_file.read_text())
            phase = state.get("current_phase", "")
            if phase:
                return phase
        except Exception:
            pass

    # Check api-dev state
    api_state_file = project_dir / ".claude" / "api-dev-state.json"
    if api_state_file.exists():
        try:
            state = json.loads(api_state_file.read_text())
            phases = state.get("phases", {})
            for phase_name, phase_data in phases.items():
                if phase_data.get("status") == "in_progress":
                    return phase_name
        except Exception:
            pass

    return "workflow"


def main():
    # Check if remote questions is enabled
    if not is_remote_questions_enabled():
        # Not enabled, let the question proceed normally
        print(json.dumps({"continue": True}))
        return

    # Read tool input
    tool_input_raw = os.environ.get("CLAUDE_TOOL_INPUT", "{}")

    # Also check stdin for hook input
    try:
        if not sys.stdin.isatty():
            stdin_data = sys.stdin.read()
            if stdin_data:
                try:
                    hook_input = json.loads(stdin_data)
                    tool_input_raw = json.dumps(hook_input.get("tool_input", {}))
                except json.JSONDecodeError:
                    pass
    except Exception:
        pass

    # Parse questions
    questions = parse_question_input(tool_input_raw)

    if not questions:
        print(json.dumps({"continue": True}))
        return

    # Get current phase for context
    phase = get_current_phase()

    # Clear any existing answer
    clear_answer_file()

    # Write question to file for server
    write_question_file(questions, phase)

    # Get remote URL
    remote_url = get_remote_url()

    # Send NTFY notification
    send_ntfy_notification(remote_url)

    # Check if we should wait for remote answer
    wait_mode = os.environ.get("REMOTE_QUESTIONS_WAIT", "false").lower() == "true"

    if wait_mode:
        # Wait for remote answer
        answer = wait_for_answer()

        if answer:
            # Inject the answer as context
            answers = answer.get("answers", {})

            context = f"""
## Remote Answer Received

The user answered remotely via the question interface:

```json
{json.dumps(answers, indent=2)}
```

Use these answers to proceed with the workflow.
"""

            # Clear the question file
            project_dir = get_project_dir()
            question_file = project_dir / ".claude" / "current-question.json"
            if question_file.exists():
                question_file.unlink()

            print(json.dumps({
                "continue": True,
                "additionalContext": context
            }))
            return
        else:
            # Timeout - let the local question proceed
            context = """
## Remote Question Timeout

The remote question interface timed out waiting for an answer.
The question will be displayed locally instead.
"""
            print(json.dumps({
                "continue": True,
                "additionalContext": context
            }))
            return

    # Non-blocking mode - just notify and continue with local question
    context = f"""
## Remote Question Notification Sent

A notification was sent to answer this question remotely at:
{remote_url}

The question will also be displayed here. Answer either locally or remotely.
"""

    print(json.dumps({
        "continue": True,
        "additionalContext": context
    }))


if __name__ == "__main__":
    main()
