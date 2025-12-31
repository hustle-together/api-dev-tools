#!/usr/bin/env python3
"""
Phase 11: AI Code Review Hook (Ralph Wiggum Loop Pattern)

Triggers Greptile AI code review and LOOPS until all issues are fixed.
This ensures code quality before proceeding to refactor phase.

Hook Type: PostToolUse (triggers after tests pass)

Ralph Wiggum Pattern:
    1. Run Greptile review
    2. If issues found → inject context for agent to fix
    3. Agent fixes issues
    4. Tests re-run → hook triggers again
    5. Re-review with Greptile
    6. Loop until clean OR max iterations
    7. Emit <promise>REVIEW_CLEAN</promise>

Environment Variables:
    GREPTILE_API_KEY: Your Greptile API key (get from https://app.greptile.com)
    GITHUB_TOKEN: GitHub Personal Access Token with repo access
    CODE_REVIEW_ENABLED: Set to 'true' to enable (default: true)
    CODE_REVIEW_MAX_ITERATIONS: Max review cycles (default: 5)

Version: 2.0.0
"""
import os
import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime

# Add lib directory to path for imports
HOOK_DIR = Path(__file__).parent
LIB_DIR = HOOK_DIR / "lib"
sys.path.insert(0, str(LIB_DIR))

try:
    from greptile import (
        is_configured,
        review_changes,
        get_review_summary,
        format_review_for_display,
        get_status
    )
    GREPTILE_AVAILABLE = True
except ImportError:
    GREPTILE_AVAILABLE = False

# State file for tracking review loops
REVIEW_STATE_FILE = ".claude/code-review-state.json"
MAX_ITERATIONS = int(os.environ.get("CODE_REVIEW_MAX_ITERATIONS", "5"))


def get_git_diff() -> tuple:
    """Get the current git diff and changed files."""
    try:
        # Get list of changed files
        files_result = subprocess.run(
            ["git", "diff", "--name-only", "HEAD~1"],
            capture_output=True,
            text=True,
            timeout=30
        )
        files_changed = files_result.stdout.strip().split("\n") if files_result.stdout else []

        # Get full diff
        diff_result = subprocess.run(
            ["git", "diff", "HEAD~1"],
            capture_output=True,
            text=True,
            timeout=30
        )
        diff_content = diff_result.stdout

        return files_changed, diff_content
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return [], ""


def get_repo_info() -> tuple:
    """Get repository owner and name from git remote."""
    try:
        result = subprocess.run(
            ["git", "remote", "get-url", "origin"],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0:
            url = result.stdout.strip()
            # Parse GitHub URL (handles both HTTPS and SSH)
            if "github.com" in url:
                if url.startswith("git@"):
                    # SSH format: git@github.com:owner/repo.git
                    parts = url.split(":")[-1].replace(".git", "").split("/")
                else:
                    # HTTPS format: https://github.com/owner/repo.git
                    parts = url.replace(".git", "").split("/")[-2:]

                if len(parts) >= 2:
                    return parts[-2], parts[-1]
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass
    return None, None


def load_review_state() -> dict:
    """Load code review loop state."""
    state_file = Path.cwd() / REVIEW_STATE_FILE
    if state_file.exists():
        try:
            return json.loads(state_file.read_text())
        except (json.JSONDecodeError, IOError):
            pass
    return {
        "iteration": 0,
        "issues_found": [],
        "status": "pending",
        "started_at": None,
        "last_review_at": None
    }


def save_review_state(state: dict):
    """Save code review loop state."""
    state_file = Path.cwd() / REVIEW_STATE_FILE
    state_file.parent.mkdir(parents=True, exist_ok=True)
    try:
        state_file.write_text(json.dumps(state, indent=2))
    except IOError:
        pass


def clear_review_state():
    """Clear review state after successful completion."""
    state_file = Path.cwd() / REVIEW_STATE_FILE
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
    return {}


def update_workflow_state_with_review(review_summary: dict, iteration: int):
    """Update workflow state file with code review results."""
    state_file = Path.cwd() / ".claude" / "api-dev-state.json"
    state = load_workflow_state()

    # Add or update code_review phase
    if "phases" not in state:
        state["phases"] = {}

    state["phases"]["code_review"] = {
        "status": "in_progress" if review_summary.get("issue_count", 0) > 0 else "complete",
        "iteration": iteration,
        "score": review_summary.get("score", 0),
        "issues_found": review_summary.get("issue_count", 0),
        "suggestions": review_summary.get("suggestion_count", 0),
        "reviewed_at": datetime.now().isoformat()
    }

    try:
        state_file.write_text(json.dumps(state, indent=2))
    except IOError:
        pass


def should_run_review(hook_input: dict) -> bool:
    """Determine if code review should run based on hook context."""
    # Check if code review is enabled
    if os.environ.get("CODE_REVIEW_ENABLED", "true").lower() == "false":
        return False

    tool_name = hook_input.get("tool_name", "")

    # Run after tests pass (Phase 9/10)
    if tool_name == "Bash":
        tool_input = hook_input.get("tool_input", {})
        command = tool_input.get("command", "")
        tool_result = hook_input.get("tool_result", {})
        stdout = tool_result.get("stdout", "")

        # Check if tests just passed
        if ("pnpm test" in command or "npm test" in command or "vitest" in command):
            # Only run if tests passed (look for success indicators)
            if "pass" in stdout.lower() or "✓" in stdout or "PASS" in stdout:
                return True

    # Also run if verify-after-green hook triggered
    if "verify" in tool_name.lower():
        return True

    return False


def format_issues_for_context(issues: list) -> str:
    """Format issues as context for the agent to fix."""
    if not issues:
        return ""

    lines = [
        "",
        "=" * 60,
        "CODE REVIEW ISSUES TO FIX (Ralph Wiggum Loop)",
        "=" * 60,
        "",
        "The following issues were found by Greptile code review.",
        "Please fix ALL issues, then run tests again.",
        "The review will re-run automatically after tests pass.",
        "",
        "ISSUES:",
    ]

    for i, issue in enumerate(issues, 1):
        lines.append(f"  {i}. {issue}")

    lines.extend([
        "",
        "After fixing all issues, run: pnpm test",
        "Review will loop until all issues are resolved.",
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
    if not should_run_review(hook_input):
        # Pass through - no review needed
        print(json.dumps({"continue": True}))
        return

    # Check if Greptile is available and configured
    if not GREPTILE_AVAILABLE:
        print(json.dumps({
            "continue": True,
            "message": "Greptile library not found - skipping code review"
        }))
        return

    if not is_configured():
        status = get_status()
        print(json.dumps({
            "continue": True,
            "message": f"Phase 11 Code Review skipped: {status['message']}"
        }))
        return

    # Load current review loop state
    review_state = load_review_state()

    # Increment iteration
    review_state["iteration"] += 1
    iteration = review_state["iteration"]

    # Check max iterations
    if iteration > MAX_ITERATIONS:
        print(json.dumps({
            "continue": True,
            "message": f"Code review max iterations ({MAX_ITERATIONS}) reached. Proceeding with warnings.\n\n<promise>REVIEW_CLEAN</promise>"
        }))
        clear_review_state()
        return

    # Track start time on first iteration
    if iteration == 1:
        review_state["started_at"] = datetime.now().isoformat()

    review_state["last_review_at"] = datetime.now().isoformat()

    # Get repository info
    repo_owner, repo_name = get_repo_info()
    if not repo_owner or not repo_name:
        print(json.dumps({
            "continue": True,
            "message": "Could not determine repository info - skipping code review"
        }))
        return

    # Get changes to review
    files_changed, diff_content = get_git_diff()
    if not diff_content:
        print(json.dumps({
            "continue": True,
            "message": "No changes detected - code review complete.\n\n<promise>REVIEW_CLEAN</promise>"
        }))
        clear_review_state()
        return

    # Run the Greptile review
    result = review_changes(
        repo_owner=repo_owner,
        repo_name=repo_name,
        files_changed=files_changed,
        diff_content=diff_content
    )

    if not result:
        print(json.dumps({
            "continue": True,
            "message": "Greptile review failed - check API credentials"
        }))
        return

    # Parse results
    summary = get_review_summary(result)
    update_workflow_state_with_review(summary, iteration)

    # Format for display
    display_output = format_review_for_display(summary)

    # Check if issues found
    issue_count = summary.get("issue_count", 0)
    issues = summary.get("issues", [])

    if issue_count == 0:
        # All clean! Emit promise and proceed
        review_state["status"] = "complete"
        save_review_state(review_state)

        output = f"""
{display_output}

================================================================================
REVIEW LOOP COMPLETE (Iteration {iteration}/{MAX_ITERATIONS})
================================================================================
All code review checks passed!
Proceeding to next phase.

<promise>REVIEW_CLEAN</promise>
"""
        print(json.dumps({
            "continue": True,
            "message": output
        }))
        clear_review_state()
        return

    # Issues found - save state and block for fixes
    review_state["status"] = "needs_fixing"
    review_state["issues_found"] = issues
    save_review_state(review_state)

    # Format issues as context for agent
    issues_context = format_issues_for_context(issues)

    output = f"""
{display_output}

================================================================================
REVIEW LOOP - ITERATION {iteration}/{MAX_ITERATIONS}
================================================================================
{issue_count} issue(s) found. Fix them and run tests again.
Review will re-run automatically after tests pass.
{issues_context}
"""

    # Block workflow - agent needs to fix issues
    print(json.dumps({
        "continue": False,  # Block until fixed
        "message": output,
        "review_score": summary.get("score", 0),
        "issues_count": issue_count,
        "iteration": iteration,
        "action_required": True,
        "next_action": "Fix the issues above, then run tests again"
    }))


if __name__ == "__main__":
    main()
