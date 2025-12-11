#!/usr/bin/env python3
"""
Hook: PostToolUse (after test runs)
Purpose: Trigger Phase 9 (Verify) after tests pass - force re-research

This hook detects when tests pass (TDD Green phase complete) and:
  1. Reminds Claude to re-research the original documentation
  2. Compares implemented features to documented features
  3. Requires user confirmation before proceeding

The goal is to catch cases where Claude implemented from memory
instead of from the researched documentation.

Triggers on: Bash commands containing "test" that exit successfully

Returns:
  - {"continue": true} with additionalContext prompting verification
"""
import json
import sys
import os
from datetime import datetime
from pathlib import Path

# State file is in .claude/ directory (sibling to hooks/)
STATE_FILE = Path(__file__).parent.parent / "api-dev-state.json"


def main():
    # Read hook input from stdin
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        print(json.dumps({"continue": True}))
        sys.exit(0)

    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})
    tool_output = input_data.get("tool_output", {})

    # Only trigger on Bash commands
    if tool_name != "Bash":
        print(json.dumps({"continue": True}))
        sys.exit(0)

    # Check if this is a test command
    command = tool_input.get("command", "")
    is_test_command = any(test_keyword in command.lower() for test_keyword in [
        "pnpm test", "npm test", "vitest", "jest", "pytest", "test:run"
    ])

    if not is_test_command:
        print(json.dumps({"continue": True}))
        sys.exit(0)

    # Check if tests passed (exit code 0 or output indicates success)
    output_text = ""
    if isinstance(tool_output, str):
        output_text = tool_output
    elif isinstance(tool_output, dict):
        output_text = tool_output.get("output", tool_output.get("stdout", ""))

    # Look for success indicators
    tests_passed = any(indicator in output_text.lower() for indicator in [
        "tests passed", "all tests passed", "test suites passed",
        "✓", "passed", "0 failed", "pass"
    ]) and not any(fail in output_text.lower() for fail in [
        "failed", "error", "fail"
    ])

    if not tests_passed:
        print(json.dumps({"continue": True}))
        sys.exit(0)

    # Tests passed - check state file
    if not STATE_FILE.exists():
        print(json.dumps({"continue": True}))
        sys.exit(0)

    try:
        state = json.loads(STATE_FILE.read_text())
    except json.JSONDecodeError:
        print(json.dumps({"continue": True}))
        sys.exit(0)

    phases = state.get("phases", {})
    tdd_green = phases.get("tdd_green", {})
    verify = phases.get("verify", {})

    # Check if we're in TDD Green phase
    if tdd_green.get("status") != "in_progress":
        print(json.dumps({"continue": True}))
        sys.exit(0)

    # Check if verify phase already done
    if verify.get("status") == "complete":
        print(json.dumps({"continue": True}))
        sys.exit(0)

    # Mark TDD Green as complete
    tdd_green["status"] = "complete"
    tdd_green["all_tests_passing"] = True
    tdd_green["completed_at"] = datetime.now().isoformat()

    # Start verify phase
    verify["status"] = "in_progress"
    verify["started_at"] = datetime.now().isoformat()

    # Save state
    STATE_FILE.write_text(json.dumps(state, indent=2))

    # Build verification prompt
    endpoint = state.get("endpoint", "the endpoint")

    context_parts = []
    context_parts.append("## Phase 9: Implementation Verification Required")
    context_parts.append("")
    context_parts.append("Tests are passing. Before proceeding, you MUST verify your implementation:")
    context_parts.append("")
    context_parts.append("**Required Actions:**")
    context_parts.append("1. Re-read the original API documentation (use Context7 or WebSearch)")
    context_parts.append("2. Compare EVERY documented parameter/feature to your implementation")
    context_parts.append("3. Report any discrepancies in this format:")
    context_parts.append("")
    context_parts.append("```")
    context_parts.append("| Feature          | In Docs | Implemented | Status          |")
    context_parts.append("|------------------|---------|-------------|-----------------|")
    context_parts.append("| param_name       | Yes     | Yes         | Match           |")
    context_parts.append("| missing_param    | Yes     | No          | MISSING         |")
    context_parts.append("| extra_param      | No      | Yes         | EXTRA (OK)      |")
    context_parts.append("```")
    context_parts.append("")
    context_parts.append("**After comparison, ask the user:**")
    context_parts.append("- Fix gaps? [Y] - Loop back to Red phase")
    context_parts.append("- Skip (intentional omissions)? [n] - Document and proceed")
    context_parts.append("")
    context_parts.append("DO NOT proceed to Refactor until verification is complete.")

    output = {
        "continue": True,
        "hookSpecificOutput": {
            "hookEventName": "PostToolUse",
            "additionalContext": "\n".join(context_parts)
        }
    }

    print(json.dumps(output))
    sys.exit(0)


if __name__ == "__main__":
    main()
