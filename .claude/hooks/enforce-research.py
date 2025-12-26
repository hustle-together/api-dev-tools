#!/usr/bin/env python3
"""
Hook: PreToolUse for Write/Edit
Purpose: Block writing API code if research phase not complete WITH USER CHECKPOINT

Phase 3 requires:
  1. Execute 2-3 initial searches (Context7, WebSearch)
  2. Present summary TABLE to user
  3. USE AskUserQuestion: "Proceed? [Y] / Search more? [n]"
  4. Loop back if user wants more research

Returns:
  - {"permissionDecision": "allow"} - Let the tool run
  - {"permissionDecision": "deny", "reason": "..."} - Block with explanation


Part of api-dev-tools v3.12.0 - includes ntfy notifications for autonomous mode.
"""
import json
import sys
from pathlib import Path

STATE_FILE = Path(__file__).parent.parent / "api-dev-state.json"
CONFIG_FILE = Path(__file__).parent.parent / "autonomous-config.json"

# Minimum sources required
MIN_SOURCES = 2


def load_config():
    """Load autonomous config if it exists."""
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE) as f:
            return json.load(f)
    return None


def send_notification(topic, title, message, priority='default'):
    """Send ntfy notification if curl is available."""
    import subprocess
    try:
        subprocess.run([
            'curl', '-s',
            '-H', f'Title: {title}',
            '-H', f'Priority: {priority}',
            '-d', message,
            f'ntfy.sh/{topic}'
        ], capture_output=True, timeout=5)
    except:
        pass  # Notifications are best-effort


def notify_user_input_required(phase_num, phase_name, reason, endpoint):
    """Send ntfy notification when user input is required."""
    config = load_config()
    if not config:
        return

    notifications = config.get('notifications', {})
    if not notifications.get('enabled', False):
        return

    if 'user_input_required' not in notifications.get('notify_on', []):
        return

    topic = notifications.get('ntfy_topic', 'hustleserver')

    # Get session ID for resume command
    session_id = endpoint or 'unknown'
    if STATE_FILE.exists():
        try:
            state = json.loads(STATE_FILE.read_text())
            session_id = state.get('session_id', endpoint or 'unknown')
        except:
            pass

    title = f"Phase {phase_num} - {phase_name}"
    message = f"{reason}\n\nResume: claude --resume {session_id}"

    send_notification(topic, title, message, priority='high')


def main():
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        print(json.dumps({"permissionDecision": "allow"}))
        sys.exit(0)

    tool_input = input_data.get("tool_input", {})
    file_path = tool_input.get("file_path", "")

    # Only enforce for API route files
    if "/api/" not in file_path and "/api-test/" not in file_path:
        print(json.dumps({"permissionDecision": "allow"}))
        sys.exit(0)

    # Skip test files - TDD Red allows tests before research complete
    if ".test." in file_path or "/__tests__/" in file_path:
        print(json.dumps({"permissionDecision": "allow"}))
        sys.exit(0)

    if file_path.endswith(".md") or file_path.endswith(".json"):
        print(json.dumps({"permissionDecision": "allow"}))
        sys.exit(0)

    if not STATE_FILE.exists():
        print(json.dumps({
            "permissionDecision": "deny",
            "reason": """❌ API development state not initialized.

Run /api-create [endpoint-name] to start the workflow."""
        }))
        sys.exit(0)

    try:
        state = json.loads(STATE_FILE.read_text())
    except json.JSONDecodeError:
        print(json.dumps({"permissionDecision": "allow"}))
        sys.exit(0)

    endpoint = state.get("endpoint", "unknown")
    phases = state.get("phases", {})
    research = phases.get("research_initial", {})
    status = research.get("status", "not_started")

    if status != "complete":
        sources = research.get("sources", [])
        user_question_asked = research.get("user_question_asked", False)
        user_approved = research.get("user_approved", False)
        summary_shown = research.get("summary_shown", False)

        missing = []
        if len(sources) < MIN_SOURCES:
            missing.append(f"Sources ({len(sources)}/{MIN_SOURCES} minimum)")
        if not summary_shown:
            missing.append("Research summary table not shown to user")
        if not user_question_asked:
            missing.append("User checkpoint (AskUserQuestion not used)")
        if not user_approved:
            missing.append("User approval to proceed")

        # Send ntfy notification for autonomous mode
        notify_user_input_required(
            3,
            "Research Approval Needed",
            f"Research summary ready for '{endpoint}'. User approval needed to proceed.",
            endpoint
        )

        print(json.dumps({
            "permissionDecision": "deny",
            "reason": f"""❌ BLOCKED: Initial research (Phase 3) not complete.

Status: {status}
Sources consulted: {len(sources)}
Summary shown: {summary_shown}
User question asked: {user_question_asked}
User approved: {user_approved}

MISSING:
{chr(10).join(f"  • {m}" for m in missing)}

═══════════════════════════════════════════════════════════
⚠️  COMPLETE RESEARCH WITH USER CHECKPOINT
═══════════════════════════════════════════════════════════

REQUIRED STEPS:

1. Execute 2-3 initial searches:
   • Context7: "{endpoint}"
   • WebSearch: "{endpoint} official documentation"
   • WebSearch: "site:[official-domain] {endpoint} API reference"

2. Present summary TABLE to user:
   ┌───────────────────────────────────────────────────────┐
   │ RESEARCH SUMMARY                                      │
   │                                                       │
   │ │ Source         │ Found                              │
   │ ├────────────────┼────────────────────────────────────│
   │ │ Official docs  │ ✓ [URL]                            │
   │ │ API Reference  │ ✓ REST v2                          │
   │ │ Auth method    │ ✓ Bearer token                     │
   │ │ NPM package    │ ? Not found                        │
   │                                                       │
   │ Proceed? [Y] / Search more? [n] ____                  │
   └───────────────────────────────────────────────────────┘

3. USE AskUserQuestion:
   question: "Research summary above. Proceed or search more?"
   options: [
     {{"value": "proceed", "label": "Proceed to interview"}},
     {{"value": "more", "label": "Search more - I need [topic]"}},
     {{"value": "specific", "label": "Search for something specific"}}
   ]

4. If user says "more" or "specific":
   • Ask what they want to research
   • Execute additional searches
   • LOOP BACK and show updated summary

5. If user says "proceed":
   • Set research_initial.user_approved = true
   • Set research_initial.user_question_asked = true
   • Set research_initial.summary_shown = true
   • Set research_initial.status = "complete"

WHY: Implementation must match CURRENT API documentation."""
        }))
        sys.exit(0)

    # Research complete - inject context
    sources = research.get("sources", [])
    print(json.dumps({
        "permissionDecision": "allow",
        "message": f"""✅ Initial research complete.
Sources: {len(sources)}
User approved proceeding to interview."""
    }))
    sys.exit(0)


if __name__ == "__main__":
    main()
