#!/usr/bin/env python3
"""
Hook: PreToolUse for Write/Edit
Purpose: Enforce TOC enumeration before research can proceed

v3.12.0: New phase to enumerate ALL API features before deep diving.

This prevents partial implementation by ensuring:
  1. Main docs page is fetched
  2. ALL endpoints/features are extracted from TOC/navigation
  3. User confirms the complete scope
  4. Features are stored in state.scope.discovered_features

Returns:
  - {"permissionDecision": "allow"} - Let the tool run
  - {"permissionDecision": "deny", "reason": "..."} - Block with explanation
"""
import json
import sys
from pathlib import Path

STATE_FILE = Path(__file__).parent.parent / "api-dev-state.json"
CONFIG_FILE = Path(__file__).parent.parent / "autonomous-config.json"


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


def notify_user_input_required(phase_name, reason, endpoint):
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

    title = f"Phase 0 - {phase_name}"
    message = f"{reason}\n\nResume: claude --resume {session_id}"

    send_notification(topic, title, message, priority='high')


def main():
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        print(json.dumps({"permissionDecision": "allow"}))
        sys.exit(0)

    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})

    # Only check when trying to proceed to research (WebSearch, Context7)
    # or when trying to write API files
    research_tools = ["WebSearch", "mcp__context7__get-library-docs"]

    if tool_name not in research_tools:
        # Check for Write/Edit to API files
        if tool_name in ["Write", "Edit"]:
            file_path = tool_input.get("file_path", "")
            # Only enforce for API route files, not research files
            if "/api/" not in file_path or ".claude/research" in file_path:
                print(json.dumps({"permissionDecision": "allow"}))
                sys.exit(0)
        else:
            print(json.dumps({"permissionDecision": "allow"}))
            sys.exit(0)

    if not STATE_FILE.exists():
        # No state file - could be non-API workflow, allow
        print(json.dumps({"permissionDecision": "allow"}))
        sys.exit(0)

    try:
        state = json.loads(STATE_FILE.read_text())
    except json.JSONDecodeError:
        print(json.dumps({"permissionDecision": "allow"}))
        sys.exit(0)

    # Check if we're in an API workflow
    workflow = state.get("workflow", "")
    if workflow not in ["api-create", "api-research"]:
        print(json.dumps({"permissionDecision": "allow"}))
        sys.exit(0)

    endpoint = state.get("endpoint", "unknown")
    phases = state.get("phases", {})
    toc_phase = phases.get("toc_enumeration", {})
    toc_status = toc_phase.get("status", "not_started")

    # If TOC enumeration is complete, allow
    if toc_status == "complete":
        print(json.dumps({"permissionDecision": "allow"}))
        sys.exit(0)

    # Check if this is the initial WebFetch for TOC enumeration
    # Allow WebFetch for the main docs page during enumeration
    if tool_name == "WebFetch":
        # Check if we're fetching for enumeration purposes
        prompt = tool_input.get("prompt", "").lower()
        if "toc" in prompt or "table of contents" in prompt or "navigation" in prompt or "enumerate" in prompt:
            print(json.dumps({"permissionDecision": "allow"}))
            sys.exit(0)

    # For research tools, check if TOC enumeration is done
    if tool_name in research_tools:
        # Allow if this is specifically for TOC enumeration setup
        query = ""
        if tool_name == "WebSearch":
            query = tool_input.get("query", "").lower()

        # Allow documentation discovery searches
        if "documentation" in query and "api" in query:
            print(json.dumps({"permissionDecision": "allow"}))
            sys.exit(0)

    # Get scope data
    scope = state.get("scope", {})
    discovered_features = scope.get("discovered_features", [])
    user_confirmed = toc_phase.get("user_confirmed_scope", False)

    # Send notification
    notify_user_input_required(
        "TOC Enumeration Required",
        f"Enumerate ALL features for '{endpoint}' before deep research.",
        endpoint
    )

    print(json.dumps({
        "permissionDecision": "deny",
        "reason": f"""❌ BLOCKED: TOC Enumeration (Phase 0) not complete.

Status: {toc_status}
Features discovered: {len(discovered_features)}
User confirmed scope: {user_confirmed}

═══════════════════════════════════════════════════════════
⚠️  ENUMERATE ALL API FEATURES FIRST
═══════════════════════════════════════════════════════════

Before deep research, you MUST enumerate ALL available features:

1. FETCH the main documentation page:
   • WebFetch the API docs landing page
   • Look for navigation, TOC, or sidebar

2. EXTRACT all endpoints/features from:
   • Navigation menus
   • Table of contents
   • API reference sections
   • Sidebar links

3. PRESENT complete enumeration to user:
   ┌───────────────────────────────────────────────────────┐
   │ TOC ENUMERATION: {endpoint}                           │
   │                                                       │
   │ ALL AVAILABLE ENDPOINTS/FEATURES:                     │
   │ ┌─────────────────────────────────────────────────┐   │
   │ │ Category: [name]                                │   │
   │ │   • GET /endpoint1                              │   │
   │ │   • POST /endpoint2                             │   │
   │ │   • ...                                         │   │
   │ └─────────────────────────────────────────────────┘   │
   │                                                       │
   │ Total: X endpoints across Y categories               │
   │                                                       │
   │ Research ALL? [Y] / Select specific? [n]             │
   └───────────────────────────────────────────────────────┘

4. USE AskUserQuestion to confirm scope:
   • "Research all X features? Or select specific ones?"
   • Store confirmed features in state.scope.discovered_features

5. Update state:
   • phases.toc_enumeration.status = "complete"
   • phases.toc_enumeration.user_confirmed_scope = true
   • scope.discovered_features = [list of all features]

WHY: This ensures comprehensive implementation - no features left behind."""
    }))
    sys.exit(0)


if __name__ == "__main__":
    main()
