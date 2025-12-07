#!/usr/bin/env python3
"""
Hook: Stop
Purpose: Check if all required phases are complete before allowing stop

This hook runs when Claude tries to stop/end the conversation.
It checks api-dev-state.json to ensure critical workflow phases completed.

Gap Fixes Applied:
- Gap 2: Shows files_created vs files_modified to verify all claimed changes
- Gap 3: Warns if there are verification_warnings that weren't addressed
- Gap 4: Requires explicit verification that implementation matches interview

Returns:
  - {"decision": "approve"} - Allow stopping
  - {"decision": "block", "reason": "..."} - Prevent stopping with explanation
"""
import json
import sys
import subprocess
from pathlib import Path

# State file is in .claude/ directory (sibling to hooks/)
STATE_FILE = Path(__file__).parent.parent / "api-dev-state.json"

# Phases that MUST be complete before stopping
REQUIRED_PHASES = [
    ("research_initial", "Initial research (Context7/WebSearch)"),
    ("interview", "User interview"),
    ("tdd_red", "TDD Red phase (failing tests written)"),
    ("tdd_green", "TDD Green phase (tests passing)"),
]

# Phases that SHOULD be complete (warning but don't block)
RECOMMENDED_PHASES = [
    ("schema_creation", "Schema creation"),
    ("tdd_refactor", "TDD Refactor phase"),
    ("documentation", "Documentation updates"),
]


def get_git_modified_files() -> list[str]:
    """Get list of modified files from git.

    Gap 2 Fix: Verify which files actually changed.
    """
    try:
        result = subprocess.run(
            ["git", "diff", "--name-only", "HEAD"],
            capture_output=True,
            text=True,
            cwd=STATE_FILE.parent.parent  # Project root
        )
        if result.returncode == 0:
            return [f.strip() for f in result.stdout.strip().split("\n") if f.strip()]
    except Exception:
        pass
    return []


def check_verification_warnings(state: dict) -> list[str]:
    """Check for unaddressed verification warnings.

    Gap 3 Fix: Don't accept "skipped" or warnings without explanation.
    """
    warnings = state.get("verification_warnings", [])
    if warnings:
        return [
            "⚠️ Unaddressed verification warnings:",
            *[f"  - {w}" for w in warnings[-5:]],  # Show last 5
            "",
            "Please review and address these warnings before completing."
        ]
    return []


def check_interview_implementation_match(state: dict) -> list[str]:
    """Verify implementation matches interview requirements.

    Gap 4 Fix: Define specific "done" criteria based on interview.
    """
    issues = []

    interview = state.get("phases", {}).get("interview", {})
    questions = interview.get("questions", [])

    # Extract key requirements from interview
    all_text = " ".join(str(q) for q in questions)

    # Check files_created includes expected patterns
    files_created = state.get("files_created", [])

    # Look for route files if interview mentioned endpoints
    if "endpoint" in all_text.lower() or "/api/" in all_text.lower():
        route_files = [f for f in files_created if "route.ts" in f]
        if not route_files:
            issues.append("⚠️ Interview mentioned endpoints but no route.ts files were created")

    # Look for test files
    test_files = [f for f in files_created if ".test." in f or "__tests__" in f]
    if not test_files:
        issues.append("⚠️ No test files tracked in files_created")

    return issues


def main():
    # If no state file, we're not in an API workflow - allow stop
    if not STATE_FILE.exists():
        print(json.dumps({"decision": "approve"}))
        sys.exit(0)

    # Load state
    try:
        state = json.loads(STATE_FILE.read_text())
    except json.JSONDecodeError:
        # Corrupted state, allow stop
        print(json.dumps({"decision": "approve"}))
        sys.exit(0)

    phases = state.get("phases", {})

    # Check if workflow was even started
    research = phases.get("research_initial", {})
    if research.get("status") == "not_started":
        # Workflow not started, allow stop
        print(json.dumps({"decision": "approve"}))
        sys.exit(0)

    # Collect all issues
    all_issues = []

    # Check required phases
    incomplete_required = []
    for phase_key, phase_name in REQUIRED_PHASES:
        phase = phases.get(phase_key, {})
        status = phase.get("status", "not_started")
        if status != "complete":
            incomplete_required.append(f"  - {phase_name} ({status})")

    if incomplete_required:
        all_issues.append("❌ REQUIRED phases incomplete:")
        all_issues.extend(incomplete_required)

    # Check recommended phases
    incomplete_recommended = []
    for phase_key, phase_name in RECOMMENDED_PHASES:
        phase = phases.get(phase_key, {})
        status = phase.get("status", "not_started")
        if status != "complete":
            incomplete_recommended.append(f"  - {phase_name} ({status})")

    # Gap 2: Check git diff vs tracked files
    git_files = get_git_modified_files()
    tracked_files = state.get("files_created", []) + state.get("files_modified", [])

    if git_files and tracked_files:
        # Find files in git but not tracked
        untracked_changes = []
        for gf in git_files:
            if not any(gf.endswith(tf) or tf in gf for tf in tracked_files):
                if gf.endswith(".ts") and ("/api/" in gf or "/lib/" in gf):
                    untracked_changes.append(gf)

        if untracked_changes:
            all_issues.append("\n⚠️ Gap 2: Files changed but not tracked:")
            all_issues.extend([f"  - {f}" for f in untracked_changes[:5]])

    # Gap 3: Check for unaddressed warnings
    warning_issues = check_verification_warnings(state)
    if warning_issues:
        all_issues.append("\n" + "\n".join(warning_issues))

    # Gap 4: Check interview-implementation match
    match_issues = check_interview_implementation_match(state)
    if match_issues:
        all_issues.append("\n⚠️ Gap 4: Implementation verification:")
        all_issues.extend([f"  {i}" for i in match_issues])

    # Block if required phases incomplete
    if incomplete_required:
        all_issues.append("\n\nTo continue:")
        all_issues.append("  1. Complete required phases above")
        all_issues.append("  2. Use /api-status to see detailed progress")
        all_issues.append("  3. Run `git diff --name-only` to verify changes")

        print(json.dumps({
            "decision": "block",
            "reason": "\n".join(all_issues)
        }))
        sys.exit(0)

    # Build completion message
    message_parts = ["✅ API workflow completing"]

    if incomplete_recommended:
        message_parts.append("\n⚠️ Optional phases skipped:")
        message_parts.extend(incomplete_recommended)

    # Show summary of tracked files
    files_created = state.get("files_created", [])
    if files_created:
        message_parts.append(f"\n📁 Files created: {len(files_created)}")
        for f in files_created[:5]:
            message_parts.append(f"  - {f}")
        if len(files_created) > 5:
            message_parts.append(f"  ... and {len(files_created) - 5} more")

    # Show any remaining warnings
    if warning_issues or match_issues:
        message_parts.append("\n⚠️ Review suggested:")
        if warning_issues:
            message_parts.extend(warning_issues[:3])
        if match_issues:
            message_parts.extend(match_issues[:3])

    print(json.dumps({
        "decision": "approve",
        "message": "\n".join(message_parts)
    }))
    sys.exit(0)


if __name__ == "__main__":
    main()
