#!/usr/bin/env python3
"""
track-usage-budget.py - PostToolUse hook to track token usage per session

Tracks cumulative token usage and stores it in api-dev-state.json for:
- Budget enforcement by enforce-budget-limit.py
- Phase summaries
- Session analytics

Note: This hook estimates token usage since Claude Code doesn't expose
exact token counts to hooks. For accurate tracking, use ccusage CLI tool.

Part of api-dev-tools v3.12.0 autonomous mode support.
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime

# Rough token estimates per tool type
TOKEN_ESTIMATES = {
    'WebSearch': 2000,
    'WebFetch': 3000,
    'Read': 1500,
    'Write': 1000,
    'Edit': 500,
    'Grep': 800,
    'Glob': 300,
    'Bash': 500,
    'mcp__context7': 2500,
    'AskUserQuestion': 200,
    'Task': 5000,  # Subagents use significant tokens
    'default': 500
}

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

def get_tool_name():
    """Get the tool name from hook input."""
    try:
        hook_input = json.loads(sys.stdin.read())
        return hook_input.get('tool_name', 'default')
    except:
        return 'default'

def estimate_tokens(tool_name):
    """Estimate tokens used by a tool call."""
    # Check for partial matches (e.g., mcp__context7__resolve-library-id)
    for prefix, estimate in TOKEN_ESTIMATES.items():
        if tool_name.startswith(prefix):
            return estimate
    return TOKEN_ESTIMATES['default']

def main():
    # Load configuration
    config = load_config()
    if not config or not config.get('budget', {}).get('enabled', False):
        # Budget tracking not enabled
        print(json.dumps({"continue": True}))
        return

    # Get tool name and estimate tokens
    tool_name = get_tool_name()
    estimated_tokens = estimate_tokens(tool_name)

    # Load and update state
    state = load_state()

    # Initialize session metrics if needed
    if 'session_metrics' not in state:
        state['session_metrics'] = {
            'session_start': datetime.now().isoformat(),
            'total_tokens': 0,
            'tool_calls': 0,
            'tool_breakdown': {}
        }

    metrics = state['session_metrics']
    metrics['total_tokens'] = metrics.get('total_tokens', 0) + estimated_tokens
    metrics['tool_calls'] = metrics.get('tool_calls', 0) + 1
    metrics['last_updated'] = datetime.now().isoformat()

    # Track per-tool usage
    tool_breakdown = metrics.get('tool_breakdown', {})
    if tool_name not in tool_breakdown:
        tool_breakdown[tool_name] = {'calls': 0, 'estimated_tokens': 0}
    tool_breakdown[tool_name]['calls'] += 1
    tool_breakdown[tool_name]['estimated_tokens'] += estimated_tokens
    metrics['tool_breakdown'] = tool_breakdown

    # Track per-phase usage if we're in a workflow
    current_phase = state.get('current_phase', 0)
    if current_phase > 0 and config.get('budget', {}).get('track_per_phase', True):
        phases = state.get('phases', {})
        phase_key = str(current_phase)
        if phase_key not in phases:
            phases[phase_key] = {}
        phases[phase_key]['tokens_used'] = phases[phase_key].get('tokens_used', 0) + estimated_tokens
        state['phases'] = phases

    state['session_metrics'] = metrics
    save_state(state)

    # Log for debugging
    budget_config = config['budget']
    max_tokens = budget_config.get('max_tokens_per_session', 75000)
    usage_pct = (metrics['total_tokens'] / max_tokens) * 100

    # Output status (not blocking)
    result = {
        "continue": True,
        "usage": {
            "estimated_tokens": metrics['total_tokens'],
            "max_tokens": max_tokens,
            "percentage": round(usage_pct, 1),
            "tool": tool_name
        }
    }
    print(json.dumps(result))

if __name__ == '__main__':
    main()
