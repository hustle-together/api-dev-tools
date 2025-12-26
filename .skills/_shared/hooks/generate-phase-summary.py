#!/usr/bin/env python3
"""
generate-phase-summary.py - PostToolUse hook to generate phase summaries

After each phase completion, generates a concise summary including:
- Phase name and status
- Key decisions made
- Files modified
- Token usage for this phase
- Time elapsed

Summaries are stored in .claude/sessions/{session_id}/phase-summaries.md

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

def save_state(state):
    """Save API dev state."""
    state_path = Path(os.environ.get('CLAUDE_PROJECT_DIR', '.')) / '.claude' / 'api-dev-state.json'
    with open(state_path, 'w') as f:
        json.dump(state, f, indent=2)

def get_phase_name(phase_num):
    """Get human-readable phase name."""
    phases = {
        1: "DISAMBIGUATION",
        2: "SCOPE",
        3: "INITIAL_RESEARCH",
        4: "INTERVIEW",
        5: "DEEP_RESEARCH",
        6: "SCHEMA",
        7: "ENVIRONMENT",
        8: "TDD_RED",
        9: "TDD_GREEN",
        10: "VERIFY",
        11: "TDD_REFACTOR",
        12: "DOCUMENTATION",
        13: "COMPLETION"
    }
    return phases.get(phase_num, f"PHASE_{phase_num}")

def generate_summary(state, config):
    """Generate summary for the current phase."""
    current_phase = state.get('current_phase', 0)
    phase_name = get_phase_name(current_phase)
    endpoint = state.get('endpoint', 'unknown')

    # Get phase-specific data
    phase_data = state.get('phases', {}).get(str(current_phase), {})
    files_modified = phase_data.get('files_modified', [])
    decisions = phase_data.get('decisions', [])
    tokens_used = phase_data.get('tokens_used', 0)
    start_time = phase_data.get('start_time', '')
    end_time = datetime.now().isoformat()

    # Calculate duration if we have start time
    duration = "N/A"
    if start_time:
        try:
            start = datetime.fromisoformat(start_time)
            end = datetime.now()
            delta = end - start
            minutes = int(delta.total_seconds() / 60)
            seconds = int(delta.total_seconds() % 60)
            duration = f"{minutes}m {seconds}s"
        except:
            pass

    max_lines = config.get('summaries', {}).get('summary_max_lines', 10)

    # Build summary
    summary_lines = [
        f"## Phase {current_phase}: {phase_name}",
        f"**Endpoint:** {endpoint}",
        f"**Status:** Completed",
        f"**Duration:** {duration}",
        ""
    ]

    if config.get('summaries', {}).get('include_token_usage', True) and tokens_used:
        summary_lines.append(f"**Tokens Used:** {tokens_used:,}")

    if decisions:
        summary_lines.append("")
        summary_lines.append("**Key Decisions:**")
        for decision in decisions[:3]:  # Limit to 3 decisions
            summary_lines.append(f"- {decision}")

    if config.get('summaries', {}).get('include_files_modified', True) and files_modified:
        summary_lines.append("")
        summary_lines.append("**Files Modified:**")
        for f in files_modified[:5]:  # Limit to 5 files
            summary_lines.append(f"- `{f}`")

    summary_lines.append("")
    summary_lines.append(f"---")
    summary_lines.append("")

    return '\n'.join(summary_lines[:max_lines * 2])  # Rough line limit

def append_summary(summary, session_id, config):
    """Append summary to the phase summaries file."""
    project_dir = Path(os.environ.get('CLAUDE_PROJECT_DIR', '.'))

    # Get summary location from config
    location_template = config.get('summaries', {}).get(
        'summary_location',
        '.claude/sessions/{session_id}/phase-summaries.md'
    )
    summary_path = project_dir / location_template.format(session_id=session_id)

    # Create directory if needed
    summary_path.parent.mkdir(parents=True, exist_ok=True)

    # Append summary
    with open(summary_path, 'a') as f:
        if not summary_path.exists() or summary_path.stat().st_size == 0:
            f.write("# Phase Summaries\n\n")
            f.write(f"**Session ID:** {session_id}\n")
            f.write(f"**Started:** {datetime.now().isoformat()}\n\n")
            f.write("---\n\n")
        f.write(summary)

def send_notification(topic, title, message, priority='default'):
    """Send ntfy notification if configured."""
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
        pass

def main():
    # Load configuration
    config = load_config()
    if not config or not config.get('summaries', {}).get('generate_phase_summaries', False):
        # Summaries not enabled
        print(json.dumps({"continue": True}))
        return

    # Load state
    state = load_state()

    # Check if a phase just completed
    current_phase = state.get('current_phase', 0)
    phases = state.get('phases', {})
    phase_data = phases.get(str(current_phase), {})

    # Only generate summary if phase is marked complete and we haven't already summarized
    if phase_data.get('status') == 'complete' and not phase_data.get('summarized'):
        # Generate and save summary
        session_id = state.get('session_id', datetime.now().strftime('%Y%m%d_%H%M%S'))
        summary = generate_summary(state, config)
        append_summary(summary, session_id, config)

        # Mark as summarized
        phase_data['summarized'] = True
        phase_data['summary_generated_at'] = datetime.now().isoformat()
        phases[str(current_phase)] = phase_data
        state['phases'] = phases
        save_state(state)

        # Send notification if configured
        notifications = config.get('notifications', {})
        if notifications.get('enabled') and 'phase_complete' in notifications.get('notify_on', []):
            send_notification(
                notifications.get('ntfy_topic', 'hustleserver'),
                f"Phase {current_phase} Complete",
                f"{get_phase_name(current_phase)} completed for {state.get('endpoint', 'endpoint')}",
                priority='default'
            )

    print(json.dumps({"continue": True}))

if __name__ == '__main__':
    main()
