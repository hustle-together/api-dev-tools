#!/usr/bin/env python3
"""
Phase 11: AI Code Review Hook

Triggers Greptile AI code review after Phase 10 (Verify) and BEFORE Phase 12 (Refactor).
This ensures issues are caught early and can be fixed during the refactor phase,
rather than after PR creation when it's too late.

Hook Type: PostToolUse (triggers after tests pass in Phase 9/10)

Greptile API:
    POST https://api.greptile.com/v2/query
    - Analyzes code changes against entire codebase context
    - Returns issues with file:line references
    - Provides actionable fix suggestions

Environment Variables:
    GREPTILE_API_KEY: Your Greptile API key (get from https://app.greptile.com)
    GITHUB_TOKEN: GitHub Personal Access Token with repo access
    CODE_REVIEW_ENABLED: Set to 'true' to enable (default: true)

Version: 1.1.0
"""
import os
import sys
import json
import subprocess
from pathlib import Path

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


def load_state() -> dict:
    """Load current workflow state."""
    state_file = Path.cwd() / ".claude" / "api-dev-state.json"
    if state_file.exists():
        try:
            return json.loads(state_file.read_text())
        except (json.JSONDecodeError, IOError):
            pass
    return {}


def update_state_with_review(review_summary: dict):
    """Update state file with code review results."""
    state_file = Path.cwd() / ".claude" / "api-dev-state.json"
    state = load_state()

    # Add or update code_review phase
    if "phases" not in state:
        state["phases"] = {}

    state["phases"]["code_review"] = {
        "status": "complete",
        "score": review_summary.get("score", 0),
        "issues_found": review_summary.get("issue_count", 0),
        "suggestions": review_summary.get("suggestion_count", 0),
        "reviewed_at": __import__("datetime").datetime.now().isoformat()
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

    # Run after tests pass (Phase 9/10) - triggers before refactoring
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


def main():
    """Main hook entry point."""
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
            "message": "No changes detected - skipping code review"
        }))
        return

    # Run the review
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

    # Parse and display results
    summary = get_review_summary(result)
    update_state_with_review(summary)

    # Format for display
    display_output = format_review_for_display(summary)

    # Determine if we should block based on critical issues
    has_critical = summary.get("score", 10) < 5

    print(json.dumps({
        "continue": not has_critical,
        "message": display_output,
        "review_score": summary.get("score", 0),
        "issues_count": summary.get("issue_count", 0),
        "action_required": has_critical
    }))


if __name__ == "__main__":
    main()
