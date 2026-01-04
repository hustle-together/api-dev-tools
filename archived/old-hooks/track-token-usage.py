#!/usr/bin/env python3
"""
Hook: PostToolUse
Purpose: Track token usage per phase and display after phase completion

Logs token usage to state file and outputs summary after each phase.
Integrates with ccusage if available.

Version: 3.10.0
"""
import json
import sys
import subprocess
from pathlib import Path
from datetime import datetime


def get_token_usage() -> dict:
    """Get current token usage from ccusage."""
    try:
        result = subprocess.run(
            ["ccusage", "--json"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            return json.loads(result.stdout)
    except (subprocess.TimeoutExpired, FileNotFoundError, json.JSONDecodeError):
        pass
    return {}


def main():
    # Read hook input from stdin
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        sys.exit(0)

    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})

    # Only trigger on Write/Edit to state file
    if tool_name not in ["Write", "Edit"]:
        sys.exit(0)

    file_path = tool_input.get("file_path", "")
    if "api-dev-state.json" not in file_path:
        sys.exit(0)

    # Get current token usage
    usage = get_token_usage()
    if not usage:
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

    # Check for phase completion and log usage
    phases = state.get("phases", {})
    current_phase = None

    for phase_key, phase_data in phases.items():
        if isinstance(phase_data, dict):
            status = phase_data.get("status", "")
            if status == "complete":
                current_phase = phase_key

    if current_phase:
        # Initialize token tracking in state if needed
        if "token_usage" not in state:
            state["token_usage"] = {
                "by_phase": {},
                "total_at_start": usage.get("total_tokens", 0),
                "started_at": datetime.now().isoformat()
            }

        # Record phase completion tokens
        state["token_usage"]["by_phase"][current_phase] = {
            "total_tokens": usage.get("total_tokens", 0),
            "total_cost": usage.get("total_cost", 0),
            "timestamp": datetime.now().isoformat()
        }

        # Calculate phase delta if we have previous data
        by_phase = state["token_usage"]["by_phase"]
        phase_keys = list(by_phase.keys())

        if len(phase_keys) >= 2:
            prev_phase = phase_keys[-2]
            prev_tokens = by_phase[prev_phase].get("total_tokens", 0)
            current_tokens = usage.get("total_tokens", 0)
            delta = current_tokens - prev_tokens

            # Output phase token summary
            print(f"\n📊 Phase '{current_phase}' Token Usage:", file=sys.stderr)
            print(f"   Phase tokens: {delta:,}", file=sys.stderr)
            print(f"   Total tokens: {current_tokens:,}", file=sys.stderr)
            print(f"   Total cost: ${usage.get('total_cost', 0):.2f}", file=sys.stderr)

        # Update state file with token tracking
        try:
            state_file.write_text(json.dumps(state, indent=2))
        except IOError:
            pass

    sys.exit(0)


if __name__ == "__main__":
    main()
