#!/usr/bin/env python3
"""
Auto-update TESTING_CHECKLIST.md when tests pass.

Hook Type: PostToolUse (matcher: Bash)

Detects test pass patterns and updates the checklist file with:
- Test results (PASS/FAIL)
- Timestamp
- Comments

Works by:
1. Detecting test-related Bash commands
2. Parsing output for pass/fail patterns
3. Updating the corresponding checklist rows
"""

import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path


def get_tool_result():
    """Get the tool result from environment"""
    result = os.environ.get("CLAUDE_TOOL_RESULT", "")
    return result


def get_tool_input():
    """Get the tool input from environment"""
    try:
        input_json = os.environ.get("CLAUDE_TOOL_INPUT", "{}")
        return json.loads(input_json)
    except Exception:
        return {}


def detect_test_type(command: str, output: str) -> dict:
    """Detect what type of test was run and if it passed"""
    result = {
        "is_test": False,
        "test_type": None,
        "passed": None,
        "hook_name": None,
        "details": None
    }

    command_lower = command.lower()

    # Hook compilation test
    if "python3" in command_lower and ".py" in command_lower:
        if "hooks/" in command or ".claude/hooks/" in command:
            result["is_test"] = True
            result["test_type"] = "hook_compile"
            # Extract hook name
            match = re.search(r'(?:hooks/|\.claude/hooks/)([^/\s]+\.py)', command)
            if match:
                result["hook_name"] = match.group(1)
            # Check for pass/fail
            if "Traceback" in output or "Error" in output or "SyntaxError" in output:
                result["passed"] = False
                result["details"] = "Syntax/import error"
            elif "exit code" in output.lower():
                exit_match = re.search(r'exit code[:\s]+(\d+)', output.lower())
                if exit_match:
                    result["passed"] = exit_match.group(1) == "0"
            else:
                result["passed"] = True
                result["details"] = "Compiles"

    # Hook enforcement test
    if "python3" in command_lower and ("enforce" in command_lower or "verify" in command_lower):
        result["is_test"] = True
        result["test_type"] = "hook_enforcement"
        match = re.search(r'(?:hooks/|\.claude/hooks/)([^/\s]+\.py)', command)
        if match:
            result["hook_name"] = match.group(1)

        # Check for blocking behavior
        if '"permissionDecision": "deny"' in output or "BLOCKED" in output:
            result["passed"] = True
            result["details"] = "BLOCKS correctly"
        elif '"permissionDecision": "allow"' in output:
            result["passed"] = True
            result["details"] = "ALLOWS correctly"
        elif '"continue": true' in output:
            result["passed"] = True
            result["details"] = "Continues"

    # pnpm test
    if "pnpm test" in command_lower or "npm test" in command_lower:
        result["is_test"] = True
        result["test_type"] = "unit_test"
        if "PASS" in output or "passed" in output.lower():
            result["passed"] = True
        elif "FAIL" in output or "failed" in output.lower():
            result["passed"] = False

    return result


def update_checklist(hook_name: str, status: str, comment: str):
    """Update the TESTING_CHECKLIST.md file with test results"""
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")
    checklist_path = Path(project_dir) / "TESTING_CHECKLIST.md"

    if not checklist_path.exists():
        return False

    try:
        content = checklist_path.read_text()
        today = datetime.now().strftime("%Y-%m-%d")

        # Pattern to find hook row in table (with empty Status column)
        # Format: | `hook_name` | Type | Phase/Trigger | | |
        pattern = rf'(\| `{re.escape(hook_name)}` \|[^|]+\|[^|]+\|)\s*\|\s*\|'
        replacement = rf'\1 {status} | {comment} ({today}) |'

        new_content = re.sub(pattern, replacement, content)

        if new_content != content:
            checklist_path.write_text(new_content)
            return True

        # Try alternate pattern for already-filled rows (update existing)
        pattern2 = rf'(\| `{re.escape(hook_name)}` \|[^|]+\|[^|]+\|)[^|]+\|[^|]+\|'
        replacement2 = rf'\1 {status} | {comment} ({today}) |'

        new_content = re.sub(pattern2, replacement2, content)
        if new_content != content:
            checklist_path.write_text(new_content)
            return True

    except Exception as e:
        # Log error but don't fail
        pass

    return False


def main():
    tool_input = get_tool_input()
    command = tool_input.get("command", "")
    output = get_tool_result()

    # Detect what test was run
    test_info = detect_test_type(command, output)

    if not test_info["is_test"]:
        print(json.dumps({"continue": True}))
        return

    # Update checklist if we have a hook name
    if test_info["hook_name"] and test_info["passed"] is not None:
        status = "PASS" if test_info["passed"] else "FAIL"
        comment = test_info["details"] or ("Tested" if test_info["passed"] else "Failed")

        updated = update_checklist(
            test_info["hook_name"],
            status,
            comment
        )

        if updated:
            # Log the update
            project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")
            logs_dir = Path(project_dir) / ".claude" / "workflow-logs"
            logs_dir.mkdir(parents=True, exist_ok=True)

            log_file = logs_dir / "checklist-updates.json"
            try:
                if log_file.exists():
                    log = json.loads(log_file.read_text())
                else:
                    log = {"updates": []}

                log["updates"].append({
                    "timestamp": datetime.now().isoformat(),
                    "hook": test_info["hook_name"],
                    "status": status,
                    "comment": comment
                })

                log_file.write_text(json.dumps(log, indent=2))
            except Exception:
                pass

    print(json.dumps({"continue": True}))


if __name__ == "__main__":
    main()
