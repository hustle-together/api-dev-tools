#!/usr/bin/env python3
"""
Hook: PreToolUse for Write/Edit
Purpose: Block writing API code if research phase not complete

This hook runs BEFORE Claude can write or edit files in /api/ directories.
It checks the api-dev-state.json file to ensure research was completed first.

Returns:
  - {"permissionDecision": "allow"} + exit 0 - Let the tool run
  - stderr message + exit 2 - Block and force Claude to address the issue
"""
import json
import sys
from pathlib import Path

# State file is in .claude/ directory (sibling to hooks/)
STATE_FILE = Path(__file__).parent.parent / "api-dev-state.json"


def main():
    # Read hook input from stdin (Claude Code passes tool info as JSON)
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        # If we can't parse input, allow (fail open for safety)
        print(json.dumps({"permissionDecision": "allow"}))
        sys.exit(0)

    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})

    # Get the file path being written/edited
    file_path = tool_input.get("file_path", "")

    # Only enforce for API route files
    # Check for both /api/ and /api-test/ patterns
    if "/api/" not in file_path and "/api-test/" not in file_path:
        # Not an API file, allow without checking
        print(json.dumps({"permissionDecision": "allow"}))
        sys.exit(0)

    # Also skip for test files - tests should be written before research completes
    # (TDD Red phase)
    if ".test." in file_path or "/__tests__/" in file_path:
        print(json.dumps({"permissionDecision": "allow"}))
        sys.exit(0)

    # Skip for documentation/config files
    if file_path.endswith(".md") or file_path.endswith(".json"):
        print(json.dumps({"permissionDecision": "allow"}))
        sys.exit(0)

    # Check if state file exists
    if not STATE_FILE.exists():
        print("""BLOCKED: API development state not initialized.

Before writing API implementation code, you must:
  1. Run /api-create [endpoint-name] to start the workflow
  OR
  2. Run /api-research [library-name] to research dependencies

This ensures you're working with current documentation, not outdated training data.""", file=sys.stderr)
        sys.exit(2)

    # Load and check state
    try:
        state = json.loads(STATE_FILE.read_text())
    except json.JSONDecodeError:
        # Corrupted state file, allow but warn
        print(json.dumps({"permissionDecision": "allow"}))
        sys.exit(0)

    # Check research phase status
    phases = state.get("phases", {})
    research = phases.get("research_initial", {})
    research_status = research.get("status", "not_started")

    if research_status != "complete":
        sources_count = len(research.get("sources", []))
        print(f"""BLOCKED: Cannot write API implementation code yet.

RESEARCH PHASE INCOMPLETE
Current status: {research_status}
Sources consulted: {sources_count}

REQUIRED ACTIONS:
  1. Complete research phase first
  2. Run: /api-research [library-name]
  3. Ensure Context7 or WebSearch has been used

WHY THIS MATTERS:
  - Implementation must match CURRENT API documentation
  - Training data may be outdated
  - All parameters must be discovered before coding

Once research is complete, you can proceed with implementation.""", file=sys.stderr)
        sys.exit(2)

    # Research complete, allow writing
    print(json.dumps({"permissionDecision": "allow"}))
    sys.exit(0)


if __name__ == "__main__":
    main()
