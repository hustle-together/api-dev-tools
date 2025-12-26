#!/usr/bin/env python3
"""
enforce-budget-limit.py - PreToolUse hook to check token budget before operations

Checks current token usage against configured limits and:
- Warns when approaching limit (60% default)
- Blocks operations when at pause threshold (80% default)
- Sends ntfy notifications when configured

Part of api-dev-tools v3.12.0 autonomous mode support.
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime

def load_config():
    """Load autonomous config if it exists."""
    config_path = Path(os.environ.get('CLAUDE_PROJECT_DIR', '.')) / '.claude' / 'autonomous-config.json'
    if config_path.exists():
        with open(config_path) as f:
            return json.load(f)
    return None

def load_state():
    """Load current API dev state."""
    state_path = Path(os.environ.get('CLAUDE_PROJECT_DIR', '.')) / '.claude' / 'api-dev-state.json'
    if state_path.exists():
        with open(state_path) as f:
            return json.load(f)
    return {}

def get_session_usage():
    """Get current session token usage from state or environment."""
    state = load_state()

    # Check if we have tracked usage in state
    if 'session_metrics' in state:
        return state['session_metrics'].get('total_tokens', 0)

    # Fallback: check environment or return 0
    return int(os.environ.get('CLAUDE_SESSION_TOKENS', 0))

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

def main():
    # Load configuration
    config = load_config()
    if not config or not config.get('budget', {}).get('enabled', False):
        # Budget tracking not enabled, allow operation
        print(json.dumps({"continue": True}))
        return

    budget_config = config['budget']
    max_tokens = budget_config.get('max_tokens_per_session', 75000)
    warn_pct = budget_config.get('warn_at_percentage', 60)
    pause_pct = budget_config.get('pause_at_percentage', 80)

    # Get current usage
    current_tokens = get_session_usage()
    usage_pct = (current_tokens / max_tokens) * 100 if max_tokens > 0 else 0

    # Check thresholds
    notifications = config.get('notifications', {})
    ntfy_enabled = notifications.get('enabled', False)
    ntfy_topic = notifications.get('ntfy_topic', 'hustleserver')

    if usage_pct >= pause_pct:
        # BLOCK - at pause threshold
        message = f"Token budget exceeded: {current_tokens:,}/{max_tokens:,} ({usage_pct:.1f}%)"

        if ntfy_enabled and 'budget_pause' in notifications.get('notify_on', []):
            send_notification(
                ntfy_topic,
                "API Dev Tools - Budget Pause",
                f"Workflow paused at {usage_pct:.1f}% token usage. Resume after limit resets.",
                priority='high'
            )

        # Return blocking response
        result = {
            "error": f"BUDGET LIMIT REACHED\n\n{message}\n\nWorkflow paused to prevent exceeding token limits.\nWait for 5-hour window reset or adjust budget in .claude/autonomous-config.json"
        }
        print(json.dumps(result))
        sys.exit(2)  # Exit code 2 blocks the operation

    elif usage_pct >= warn_pct:
        # WARN - approaching limit
        message = f"Approaching token budget: {current_tokens:,}/{max_tokens:,} ({usage_pct:.1f}%)"

        if ntfy_enabled and 'budget_warning' in notifications.get('notify_on', []):
            send_notification(
                ntfy_topic,
                "API Dev Tools - Budget Warning",
                message,
                priority='default'
            )

        # Allow but inject warning into context
        result = {
            "continue": True,
            "message": f"WARNING: {message}. Consider completing current phase before limit."
        }
        print(json.dumps(result))

    else:
        # ALLOW - within budget
        print(json.dumps({"continue": True}))

if __name__ == '__main__':
    main()
