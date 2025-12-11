#!/usr/bin/env python3
"""
Hook: SessionStart
Purpose: Inject current state and context at the beginning of each session

This hook runs when Claude Code starts a new session or resumes.
It reads the api-dev-state.json and injects a summary into Claude's context,
helping to re-ground Claude on:
  - Current endpoint being developed
  - Which phases are complete/in-progress
  - Key decisions from interviews
  - Research cache location and freshness

Returns:
  - JSON with additionalContext to inject into Claude's context
"""
import json
import sys
import os
from datetime import datetime
from pathlib import Path

# State file is in .claude/ directory (sibling to hooks/)
STATE_FILE = Path(__file__).parent.parent / "api-dev-state.json"
RESEARCH_INDEX = Path(__file__).parent.parent / "research" / "index.json"


def main():
    # Read hook input from stdin
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        input_data = {}

    cwd = input_data.get("cwd", os.getcwd())

    # Check if state file exists
    if not STATE_FILE.exists():
        # No active workflow - just continue without injection
        print(json.dumps({"continue": True}))
        sys.exit(0)

    try:
        state = json.loads(STATE_FILE.read_text())
    except json.JSONDecodeError:
        print(json.dumps({"continue": True}))
        sys.exit(0)

    # Check if there's an active workflow
    endpoint = state.get("endpoint")
    if not endpoint:
        # No active endpoint - just continue
        print(json.dumps({"continue": True}))
        sys.exit(0)

    # Build context summary
    context_parts = []
    context_parts.append("## API Development Session Context")
    context_parts.append("")
    context_parts.append(f"**Active Endpoint:** {endpoint}")

    # Get phase status
    phases = state.get("phases", {})
    completed = []
    in_progress = []
    not_started = []

    phase_order = [
        "disambiguation", "scope", "research_initial", "interview",
        "research_deep", "schema_creation", "environment_check",
        "tdd_red", "tdd_green", "verify", "tdd_refactor", "documentation"
    ]

    for phase_name in phase_order:
        phase = phases.get(phase_name, {})
        status = phase.get("status", "not_started")
        if status == "complete":
            completed.append(phase_name)
        elif status == "in_progress":
            in_progress.append(phase_name)
        else:
            not_started.append(phase_name)

    context_parts.append("")
    context_parts.append("**Phase Status:**")
    if completed:
        context_parts.append(f"  - Completed: {', '.join(completed)}")
    if in_progress:
        context_parts.append(f"  - In Progress: {', '.join(in_progress)}")

    # Current phase (first in_progress or first not_started)
    current_phase = in_progress[0] if in_progress else (not_started[0] if not_started else "documentation")
    context_parts.append(f"  - Current: **{current_phase}**")

    # Key decisions from interview
    interview = phases.get("interview", {})
    decisions = interview.get("decisions", {})
    if decisions:
        context_parts.append("")
        context_parts.append("**Key Interview Decisions:**")
        for key, value in decisions.items():
            response = value.get("response", value.get("value", "N/A"))
            if response:
                context_parts.append(f"  - {key}: {str(response)[:100]}")

    # Research cache info
    research_index = state.get("research_index", {})
    if endpoint in research_index:
        entry = research_index[endpoint]
        days_old = entry.get("days_old", 0)
        context_parts.append("")
        context_parts.append("**Research Cache:**")
        context_parts.append(f"  - Location: .claude/research/{endpoint}/CURRENT.md")
        context_parts.append(f"  - Last Updated: {entry.get('last_updated', 'Unknown')}")
        if days_old > 7:
            context_parts.append(f"  - WARNING: Research is {days_old} days old. Consider re-researching.")

    # Turn count for re-grounding awareness
    turn_count = state.get("turn_count", 0)
    if turn_count > 0:
        context_parts.append("")
        context_parts.append(f"**Session Info:** Turn {turn_count} of previous session")

    # Important file locations
    context_parts.append("")
    context_parts.append("**Key Files:**")
    context_parts.append("  - State: .claude/api-dev-state.json")
    context_parts.append("  - Research: .claude/research/")
    context_parts.append("  - Manifest: src/app/api-test/api-tests-manifest.json (if exists)")

    # Workflow reminder
    context_parts.append("")
    context_parts.append("**Workflow Reminder:** This project uses interview-driven API development.")
    context_parts.append("Phases loop back if verification fails. Research before answering API questions.")

    # Build the output
    additional_context = "\n".join(context_parts)

    output = {
        "hookSpecificOutput": {
            "hookEventName": "SessionStart",
            "additionalContext": additional_context
        }
    }

    print(json.dumps(output))
    sys.exit(0)


if __name__ == "__main__":
    main()
