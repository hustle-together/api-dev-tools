#!/usr/bin/env python3
"""
Hook: PostToolUse
Purpose: Warn when context capacity reaches thresholds

Monitors estimated context usage and warns at:
- 50% capacity: Suggest summarizing or compacting
- 75% capacity: Urgent warning, recommend /summarize
- 90% capacity: Critical, workflow may be interrupted

Uses token tracking from api-dev-state.json to estimate context size.

Version: 4.0.0
"""
import json
import sys
from pathlib import Path
from datetime import datetime

# Context window sizes for Claude models (approximate)
MODEL_CONTEXT_LIMITS = {
    "claude-3-opus": 200000,
    "claude-opus-4": 200000,
    "claude-opus-4-5": 200000,
    "claude-3-sonnet": 200000,
    "claude-sonnet-4": 200000,
    "claude-3-haiku": 200000,
    "claude-3-5-sonnet": 200000,
    "claude-3-5-haiku": 200000,
    "default": 200000,
}

# Warning thresholds
THRESHOLDS = {
    "info": 0.50,      # 50% - informational
    "warning": 0.75,   # 75% - warning
    "critical": 0.90,  # 90% - critical
}


def estimate_context_usage(state: dict) -> int:
    """
    Estimate current context usage from state file.

    Uses token tracking data to estimate how much of the
    context window has been consumed.
    """
    token_usage = state.get("token_usage", {})
    by_phase = token_usage.get("by_phase", {})

    if not by_phase:
        return 0

    # Get latest phase token count
    phase_keys = list(by_phase.keys())
    if phase_keys:
        latest = by_phase[phase_keys[-1]]
        return latest.get("total_tokens", 0)

    return 0


def get_context_limit() -> int:
    """Get the context limit for the current model."""
    # Default to 200k for Opus/Sonnet
    return MODEL_CONTEXT_LIMITS.get("default", 200000)


def format_warning(level: str, usage_pct: float, tokens: int, limit: int) -> str:
    """Format the warning message based on level."""
    remaining = limit - tokens

    if level == "info":
        return f"""
📊 Context Usage: {usage_pct:.0%}
   Tokens used: ~{tokens:,} / {limit:,}
   Remaining: ~{remaining:,}

   💡 Consider running /summarize to reduce context usage.
"""
    elif level == "warning":
        return f"""
⚠️  CONTEXT WARNING: {usage_pct:.0%} CAPACITY
   Tokens used: ~{tokens:,} / {limit:,}
   Remaining: ~{remaining:,}

   🔧 Recommended actions:
   1. Run /summarize to compact conversation
   2. Complete current phase before starting new work
   3. Consider splitting remaining work into new session
"""
    else:  # critical
        return f"""
🚨 CRITICAL: CONTEXT AT {usage_pct:.0%} CAPACITY
   Tokens used: ~{tokens:,} / {limit:,}
   Remaining: ~{remaining:,}

   ⚡ IMMEDIATE ACTION REQUIRED:
   1. Run /summarize NOW
   2. Complete or save current work
   3. Context may auto-compact soon
   4. Risk of work interruption if limit reached
"""


def main():
    # Read hook input from stdin
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        sys.exit(0)

    # Read state file
    cwd = Path.cwd()
    state_file = cwd / ".claude" / "api-dev-state.json"

    if not state_file.exists():
        sys.exit(0)

    try:
        state = json.loads(state_file.read_text())
    except (json.JSONDecodeError, IOError):
        sys.exit(0)

    # Estimate context usage
    tokens_used = estimate_context_usage(state)
    context_limit = get_context_limit()
    usage_pct = tokens_used / context_limit if context_limit > 0 else 0

    # Check if we've already warned at this level
    capacity_state = state.get("capacity_warnings", {})
    last_warning_level = capacity_state.get("last_level", "")

    # Determine warning level
    warning_level = None
    if usage_pct >= THRESHOLDS["critical"]:
        warning_level = "critical"
    elif usage_pct >= THRESHOLDS["warning"]:
        warning_level = "warning"
    elif usage_pct >= THRESHOLDS["info"]:
        warning_level = "info"

    # Only warn if level has increased
    level_order = {"": 0, "info": 1, "warning": 2, "critical": 3}
    should_warn = (
        warning_level and
        level_order.get(warning_level, 0) > level_order.get(last_warning_level, 0)
    )

    if should_warn:
        # Output warning
        warning_msg = format_warning(warning_level, usage_pct, tokens_used, context_limit)
        print(warning_msg, file=sys.stderr)

        # Update state to track warning
        state["capacity_warnings"] = {
            "last_level": warning_level,
            "last_warning_at": datetime.now().isoformat(),
            "tokens_at_warning": tokens_used,
        }

        try:
            state_file.write_text(json.dumps(state, indent=2))
        except IOError:
            pass

    sys.exit(0)


if __name__ == "__main__":
    main()
