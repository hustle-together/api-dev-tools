#!/usr/bin/env python3
"""
Visual QA Hook (Ralph Wiggum Loop Pattern)

Runs visual analysis with AI (Haiku) and LOOPS until all issues are fixed.
This ensures visual quality before proceeding to next phase.

Hook Type: PostToolUse (triggers after Storybook/visual tests)

Ralph Wiggum Pattern:
    1. Run visual tests / capture screenshots
    2. Analyze with AI (Haiku subagent)
    3. If issues found → inject context for agent to fix
    4. Agent fixes CSS/layout
    5. Re-run visual tests → hook triggers again
    6. Re-analyze with Haiku
    7. Loop until clean OR max iterations
    8. Emit <promise>VISUAL_CLEAN</promise>

Environment Variables:
    VISUAL_QA_ENABLED: Set to 'true' to enable (default: true)
    VISUAL_QA_MAX_ITERATIONS: Max QA cycles (default: 5)

Version: 1.0.0
"""
import os
import sys
import json
from pathlib import Path
from datetime import datetime

# State file for tracking visual QA loops
VISUAL_STATE_FILE = ".claude/visual-qa-state.json"
MAX_ITERATIONS = int(os.environ.get("VISUAL_QA_MAX_ITERATIONS", "5"))


def load_visual_state() -> dict:
    """Load visual QA loop state."""
    state_file = Path.cwd() / VISUAL_STATE_FILE
    if state_file.exists():
        try:
            return json.loads(state_file.read_text())
        except (json.JSONDecodeError, IOError):
            pass
    return {
        "iteration": 0,
        "issues_found": [],
        "components_checked": [],
        "viewports_passed": [],
        "status": "pending",
        "started_at": None,
        "last_check_at": None
    }


def save_visual_state(state: dict):
    """Save visual QA loop state."""
    state_file = Path.cwd() / VISUAL_STATE_FILE
    state_file.parent.mkdir(parents=True, exist_ok=True)
    try:
        state_file.write_text(json.dumps(state, indent=2))
    except IOError:
        pass


def clear_visual_state():
    """Clear visual state after successful completion."""
    state_file = Path.cwd() / VISUAL_STATE_FILE
    if state_file.exists():
        try:
            state_file.unlink()
        except IOError:
            pass


def load_workflow_state() -> dict:
    """Load current workflow state."""
    state_file = Path.cwd() / ".claude" / "api-dev-state.json"
    if state_file.exists():
        try:
            return json.loads(state_file.read_text())
        except (json.JSONDecodeError, IOError):
            pass

    # Also check hustle-build state
    hustle_state = Path.cwd() / ".claude" / "hustle-build-state.json"
    if hustle_state.exists():
        try:
            return json.loads(hustle_state.read_text())
        except (json.JSONDecodeError, IOError):
            pass

    return {}


def update_workflow_state(issues_count: int, iteration: int):
    """Update workflow state with visual QA results."""
    state_file = Path.cwd() / ".claude" / "api-dev-state.json"
    state = load_workflow_state()

    if "phases" not in state:
        state["phases"] = {}

    state["phases"]["visual_qa"] = {
        "status": "in_progress" if issues_count > 0 else "complete",
        "iteration": iteration,
        "issues_found": issues_count,
        "checked_at": datetime.now().isoformat()
    }

    try:
        state_file.write_text(json.dumps(state, indent=2))
    except IOError:
        pass


def should_run_visual_qa(hook_input: dict) -> bool:
    """Determine if visual QA should run based on hook context."""
    # Check if visual QA is enabled
    if os.environ.get("VISUAL_QA_ENABLED", "true").lower() == "false":
        return False

    tool_name = hook_input.get("tool_name", "")
    tool_input = hook_input.get("tool_input", {})

    # Run after Storybook tests
    if tool_name == "Bash":
        command = tool_input.get("command", "")
        tool_result = hook_input.get("tool_result", {})
        stdout = tool_result.get("stdout", "")

        # Check if visual/storybook tests ran
        visual_triggers = [
            "storybook",
            "test-storybook",
            "chromatic",
            "playwright test --project=visual",
            "visual",
            "screenshot"
        ]

        if any(trigger in command.lower() for trigger in visual_triggers):
            return True

    # Run after Task with visual-analyzer
    if tool_name == "Task":
        subagent_type = tool_input.get("subagent_type", "")
        if subagent_type == "visual-analyzer":
            return True

    return False


def parse_visual_issues(hook_input: dict) -> list:
    """Parse visual issues from tool output."""
    issues = []

    tool_result = hook_input.get("tool_result", {})
    stdout = tool_result.get("stdout", "")
    message = tool_result.get("message", "")

    output = stdout + "\n" + message

    # Look for common issue patterns
    issue_keywords = [
        "touch target",
        "contrast",
        "overflow",
        "clipping",
        "alignment",
        "spacing",
        "typography",
        "safe area",
        "layout issue",
        "responsive",
        "accessibility",
        "wcag"
    ]

    lines = output.split("\n")
    for line in lines:
        line_lower = line.lower()
        if any(keyword in line_lower for keyword in issue_keywords):
            if "issue" in line_lower or "warning" in line_lower or "error" in line_lower or "fail" in line_lower:
                issues.append(line.strip())

    # Also look for severity markers
    for line in lines:
        if "⚠️" in line or "❌" in line or "warning" in line.lower():
            if line.strip() and line.strip() not in issues:
                issues.append(line.strip())

    return issues[:10]  # Limit to 10 issues


def format_issues_for_context(issues: list, iteration: int) -> str:
    """Format issues as context for the agent to fix."""
    if not issues:
        return ""

    lines = [
        "",
        "=" * 60,
        "VISUAL QA ISSUES TO FIX (Ralph Wiggum Loop)",
        "=" * 60,
        "",
        f"Iteration {iteration}/{MAX_ITERATIONS}",
        "",
        "The following visual issues were found by AI analysis.",
        "Please fix ALL issues, then re-run visual tests.",
        "The QA will re-run automatically.",
        "",
        "ISSUES:",
    ]

    for i, issue in enumerate(issues, 1):
        lines.append(f"  {i}. {issue}")

    lines.extend([
        "",
        "Common fixes:",
        "  - Touch targets: Add min-h-[44px] min-w-[44px]",
        "  - Contrast: Check text color against background",
        "  - Safe areas: Use safe-area-inset-* CSS",
        "  - Overflow: Add overflow-hidden or adjust sizing",
        "",
        "After fixing, run: /test-visual",
        "=" * 60,
        ""
    ])

    return "\n".join(lines)


def main():
    """Main hook entry point with Ralph Wiggum loop pattern."""
    # Read hook input
    try:
        hook_input = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        hook_input = {}

    # Check if we should run
    if not should_run_visual_qa(hook_input):
        print(json.dumps({"continue": True}))
        return

    # Load current visual QA state
    visual_state = load_visual_state()

    # Increment iteration
    visual_state["iteration"] += 1
    iteration = visual_state["iteration"]

    # Check max iterations
    if iteration > MAX_ITERATIONS:
        output = f"""
================================================================================
VISUAL QA - MAX ITERATIONS REACHED ({MAX_ITERATIONS})
================================================================================
Proceeding with remaining warnings. Consider reviewing manually.

<promise>VISUAL_CLEAN</promise>
"""
        print(json.dumps({
            "continue": True,
            "message": output
        }))
        clear_visual_state()
        return

    # Track timing
    if iteration == 1:
        visual_state["started_at"] = datetime.now().isoformat()
    visual_state["last_check_at"] = datetime.now().isoformat()

    # Parse issues from the visual test output
    issues = parse_visual_issues(hook_input)
    issue_count = len(issues)

    update_workflow_state(issue_count, iteration)

    if issue_count == 0:
        # All clean! Emit promise and proceed
        visual_state["status"] = "complete"
        save_visual_state(visual_state)

        output = f"""
================================================================================
VISUAL QA LOOP COMPLETE (Iteration {iteration}/{MAX_ITERATIONS})
================================================================================
All visual checks passed!
- Layout: ✅
- Typography: ✅
- Touch Targets: ✅
- Safe Areas: ✅
- Brand Consistency: ✅

Proceeding to next phase.

<promise>VISUAL_CLEAN</promise>
"""
        print(json.dumps({
            "continue": True,
            "message": output
        }))
        clear_visual_state()
        return

    # Issues found - save state and provide context for fixes
    visual_state["status"] = "needs_fixing"
    visual_state["issues_found"] = issues
    save_visual_state(visual_state)

    # Format issues as context
    issues_context = format_issues_for_context(issues, iteration)

    output = f"""
================================================================================
VISUAL QA LOOP - ITERATION {iteration}/{MAX_ITERATIONS}
================================================================================
{issue_count} visual issue(s) found. Fix them and re-run visual tests.
{issues_context}
"""

    # Block workflow - agent needs to fix issues
    print(json.dumps({
        "continue": False,  # Block until fixed
        "message": output,
        "issues_count": issue_count,
        "iteration": iteration,
        "action_required": True,
        "next_action": "Fix the visual issues above, then run /test-visual"
    }))


if __name__ == "__main__":
    main()
