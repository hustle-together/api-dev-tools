#!/usr/bin/env python3
"""
Hook: PostToolUse
Purpose: Track session metrics (time, turns, costs) for all API development workflows

Tracks:
  - Session start/end time
  - Turn count
  - Phase durations
  - Async agents used
  - Estimated token costs

Writes to: .claude/api-sessions/[endpoint]/session.json

Usage: Registered as PostToolUse hook in settings.json
"""
import json
import sys
import os
from pathlib import Path
from datetime import datetime

# Session storage location
SESSIONS_DIR = Path(".claude/api-sessions")
STATE_FILE = Path(".claude/api-dev-state.json")

# Approximate cost per 1K tokens (Claude Sonnet 4.5)
COST_PER_1K_INPUT = 0.003  # $3/1M input
COST_PER_1K_OUTPUT = 0.015  # $15/1M output

# Rough token estimates per tool type
TOKEN_ESTIMATES = {
    "WebSearch": {"input": 500, "output": 2000},
    "WebFetch": {"input": 500, "output": 5000},
    "mcp__context7__get-library-docs": {"input": 300, "output": 3000},
    "mcp__context7__resolve-library-id": {"input": 100, "output": 200},
    "Read": {"input": 200, "output": 2000},
    "Write": {"input": 1500, "output": 100},
    "Edit": {"input": 1000, "output": 100},
    "Bash": {"input": 300, "output": 500},
    "AskUserQuestion": {"input": 200, "output": 50},
    "TodoWrite": {"input": 300, "output": 50},
    "Task": {"input": 500, "output": 1000},
}


def get_or_create_session(endpoint: str) -> dict:
    """Get existing session or create new one."""
    session_dir = SESSIONS_DIR / endpoint
    session_file = session_dir / "session.json"

    if session_file.exists():
        return json.loads(session_file.read_text())

    # Create new session
    session_dir.mkdir(parents=True, exist_ok=True)
    session = {
        "version": "3.11.0",
        "endpoint": endpoint,
        "started_at": datetime.utcnow().isoformat() + "Z",
        "ended_at": None,
        "duration_seconds": 0,
        "turn_count": 0,
        "async_agents_used": 0,
        "phases": {},
        "tool_usage": {},
        "cost_breakdown": {
            "research": 0.0,
            "implementation": 0.0,
            "code_review": 0.0,
            "total": 0.0
        },
        "tokens": {
            "input": 0,
            "output": 0
        }
    }
    session_file.write_text(json.dumps(session, indent=2))
    return session


def save_session(endpoint: str, session: dict):
    """Save session to file."""
    session_dir = SESSIONS_DIR / endpoint
    session_file = session_dir / "session.json"
    session_dir.mkdir(parents=True, exist_ok=True)
    session_file.write_text(json.dumps(session, indent=2))


def estimate_cost(tool_name: str) -> tuple:
    """Estimate token usage and cost for a tool invocation."""
    estimates = TOKEN_ESTIMATES.get(tool_name, {"input": 300, "output": 300})
    input_tokens = estimates["input"]
    output_tokens = estimates["output"]

    cost = (input_tokens / 1000 * COST_PER_1K_INPUT) + \
           (output_tokens / 1000 * COST_PER_1K_OUTPUT)

    return input_tokens, output_tokens, cost


def categorize_cost(tool_name: str) -> str:
    """Determine which category a tool's cost belongs to."""
    research_tools = ["WebSearch", "WebFetch", "mcp__context7__get-library-docs",
                      "mcp__context7__resolve-library-id"]
    review_tools = ["mcp__greptile__search", "mcp__coderabbit__review"]

    if tool_name in research_tools:
        return "research"
    elif tool_name in review_tools:
        return "code_review"
    else:
        return "implementation"


def main():
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        # No input, allow the operation
        print(json.dumps({}))
        sys.exit(0)

    tool_name = input_data.get("tool_name", "unknown")
    tool_input = input_data.get("tool_input", {})

    # Skip if no state file (not in API workflow)
    if not STATE_FILE.exists():
        print(json.dumps({}))
        sys.exit(0)

    try:
        state = json.loads(STATE_FILE.read_text())
    except (json.JSONDecodeError, FileNotFoundError):
        print(json.dumps({}))
        sys.exit(0)

    # Get endpoint from state
    endpoint = state.get("endpoint") or state.get("active_element")
    if not endpoint:
        print(json.dumps({}))
        sys.exit(0)

    # Get or create session
    session = get_or_create_session(endpoint)

    # Increment turn count
    session["turn_count"] += 1

    # Track tool usage
    if tool_name not in session["tool_usage"]:
        session["tool_usage"][tool_name] = 0
    session["tool_usage"][tool_name] += 1

    # Track async agents
    if tool_name == "Task":
        if tool_input.get("run_in_background", False):
            session["async_agents_used"] += 1

    # Estimate cost
    input_tokens, output_tokens, cost = estimate_cost(tool_name)
    session["tokens"]["input"] += input_tokens
    session["tokens"]["output"] += output_tokens

    # Categorize and add cost
    category = categorize_cost(tool_name)
    session["cost_breakdown"][category] += cost
    session["cost_breakdown"]["total"] += cost

    # Update duration
    started = datetime.fromisoformat(session["started_at"].replace("Z", "+00:00"))
    now = datetime.utcnow()
    session["duration_seconds"] = int((now - started.replace(tzinfo=None)).total_seconds())

    # Save session
    save_session(endpoint, session)

    # Return empty response (don't modify tool behavior)
    print(json.dumps({}))


if __name__ == "__main__":
    main()
