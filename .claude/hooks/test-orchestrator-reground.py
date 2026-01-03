#!/usr/bin/env python3
"""
Test Orchestrator Re-grounding Hook

Runs every 5 turns during test orchestration to:
1. Re-inject testing goals and current progress
2. Send NTFY notification with status update
3. Prevent context dilution during long test sessions

Hook Type: PostToolUse
Trigger: Every 5 turns
NTFY Topic: test_api_devtools_alerts

Version: 1.0.0
"""

import json
import os
import sys
import subprocess
from datetime import datetime
from pathlib import Path

# Configuration
REGROUND_INTERVAL = 5  # Re-ground every 5 turns
NTFY_TOPIC = "test_api_devtools_alerts"
STATE_FILE = Path(__file__).parent.parent / "test-orchestrator-state.json"


def send_ntfy(message, title="Test Orchestrator", priority=3, tags=None):
    """Send NTFY notification."""
    try:
        headers = [
            f"Title: {title}",
            f"Priority: {priority}",
        ]
        if tags:
            headers.append(f"Tags: {','.join(tags)}")

        header_args = []
        for h in headers:
            header_args.extend(["-H", h])

        subprocess.run(
            ["curl", "-s"] + header_args + ["-d", message, f"https://ntfy.sh/{NTFY_TOPIC}"],
            capture_output=True,
            timeout=10
        )
    except Exception as e:
        # Don't fail if notification fails
        print(f"NTFY failed: {e}", file=sys.stderr)


def load_test_state():
    """Load test orchestrator state."""
    if not STATE_FILE.exists():
        return {
            "turn_count": 0,
            "started_at": datetime.now().isoformat(),
            "commands_tested": {},
            "current_command": None,
            "current_phase": None,
            "total_retries": 0,
            "reground_history": []
        }

    try:
        return json.loads(STATE_FILE.read_text())
    except Exception:
        return {
            "turn_count": 0,
            "started_at": datetime.now().isoformat(),
            "commands_tested": {},
            "current_command": None,
            "current_phase": None,
            "total_retries": 0,
            "reground_history": []
        }


def save_test_state(state):
    """Save test orchestrator state."""
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, indent=2))


def format_progress_summary(state):
    """Format a progress summary for re-grounding."""
    commands = state.get("commands_tested", {})

    summary_lines = []
    summary_lines.append("## Test Orchestrator Progress")
    summary_lines.append("")

    # Overall stats
    turn = state.get("turn_count", 0)
    started = state.get("started_at", "unknown")
    summary_lines.append(f"**Turn:** {turn}")
    summary_lines.append(f"**Started:** {started}")
    summary_lines.append(f"**Total Retries:** {state.get('total_retries', 0)}")
    summary_lines.append("")

    # Command progress
    summary_lines.append("**Command Progress:**")
    all_commands = [
        "/api-create",
        "/hustle-ui-create",
        "/hustle-ui-create-page",
        "/hustle-combine",
        "/hustle-build"
    ]

    for cmd in all_commands:
        cmd_state = commands.get(cmd, {})
        status = cmd_state.get("status", "NOT STARTED")

        icon = {
            "PASSED": "✅",
            "FAILED": "❌",
            "IN PROGRESS": "🔄",
            "NOT STARTED": "⏳"
        }.get(status, "❓")

        phases = cmd_state.get("phases_complete", 0)
        retries = cmd_state.get("retries", 0)

        if status == "PASSED":
            summary_lines.append(f"- {icon} {cmd}: PASSED ({phases}/14 phases)")
        elif status == "FAILED":
            summary_lines.append(f"- {icon} {cmd}: FAILED at phase {phases}/14 (retry {retries}/∞)")
        elif status == "IN PROGRESS":
            summary_lines.append(f"- {icon} {cmd}: IN PROGRESS (phase {phases}/14)")
        else:
            summary_lines.append(f"- {icon} {cmd}: NOT STARTED")

    summary_lines.append("")

    # Current task
    current_cmd = state.get("current_command")
    current_phase = state.get("current_phase")
    if current_cmd:
        summary_lines.append(f"**Current Task:** {current_cmd} - Phase {current_phase}")
    else:
        summary_lines.append("**Current Task:** Initializing test harness")

    summary_lines.append("")
    summary_lines.append("## Primary Goal")
    summary_lines.append("")
    summary_lines.append("Test ALL 5 commands until they work perfectly:")
    summary_lines.append("1. Run each command in isolated test directory")
    summary_lines.append("2. Auto-answer questions via pending-answer.json")
    summary_lines.append("3. Verify ALL 14 phases complete")
    summary_lines.append("4. Verify ALL hooks fire correctly")
    summary_lines.append("5. If tests fail: research, fix code, rebuild, retry")
    summary_lines.append("6. NEVER STOP until all 5 commands pass")
    summary_lines.append("")
    summary_lines.append("## Key Resources")
    summary_lines.append("")
    summary_lines.append("- Test directory: ~/test-api-dev-tools-auto/")
    summary_lines.append("- .env file: Copy from /Users/alfonso/Documents/GitHub/api-dev-tools/.env.example")
    summary_lines.append("- WORKFLOW_CHECKLIST.md: Track results")
    summary_lines.append("- NTFY topic: test_api_devtools_alerts")
    summary_lines.append("")
    summary_lines.append("## Failure Strategy")
    summary_lines.append("")
    summary_lines.append("If stuck after 5 retries:")
    summary_lines.append("1. Use WebSearch to research the error")
    summary_lines.append("2. Find similar issues and solutions")
    summary_lines.append("3. Try new approaches")
    summary_lines.append("4. Use git commits as savepoints")
    summary_lines.append("5. NEVER give up - keep iterating")

    return "\n".join(summary_lines)


def main():
    # Load state
    state = load_test_state()

    # Increment turn count
    turn_count = state.get("turn_count", 0) + 1
    state["turn_count"] = turn_count
    state["last_turn_timestamp"] = datetime.now().isoformat()

    # Check if we should re-ground
    should_reground = turn_count % REGROUND_INTERVAL == 0

    if should_reground:
        # Generate progress summary
        summary = format_progress_summary(state)

        # Send NTFY notification
        commands = state.get("commands_tested", {})
        passed = sum(1 for c in commands.values() if c.get("status") == "PASSED")
        in_progress = sum(1 for c in commands.values() if c.get("status") == "IN PROGRESS")
        failed = sum(1 for c in commands.values() if c.get("status") == "FAILED")

        ntfy_msg = f"""Turn {turn_count} Update:
✅ Passed: {passed}/5
🔄 In Progress: {in_progress}/5
❌ Failed: {failed}/5

Current: {state.get('current_command', 'Initializing')}
Retries: {state.get('total_retries', 0)}
"""

        send_ntfy(
            ntfy_msg,
            title=f"🔄 Turn {turn_count} - Test Orchestrator",
            priority=3,
            tags=["robot", "test"]
        )

        # Add to reground history
        reground_history = state.setdefault("reground_history", [])
        reground_history.append({
            "turn": turn_count,
            "timestamp": datetime.now().isoformat(),
            "current_command": state.get("current_command"),
            "current_phase": state.get("current_phase"),
            "passed": passed,
            "failed": failed
        })
        # Keep only last 20 reground events
        state["reground_history"] = reground_history[-20:]

        # Save state
        save_test_state(state)

        # Output with context injection
        output = {
            "continue": True,
            "hookSpecificOutput": {
                "hookEventName": "PostToolUse",
                "additionalContext": summary
            }
        }
        print(json.dumps(output))
    else:
        # Just update turn count
        save_test_state(state)
        print(json.dumps({"continue": True}))

    sys.exit(0)


if __name__ == "__main__":
    main()
