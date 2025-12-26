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


Part of api-dev-tools v3.12.0 - includes ntfy notifications for autonomous mode.
"""
import json
import sys
import subprocess
from pathlib import Path

# State file is in .claude/ directory (sibling to hooks/)
STATE_FILE = Path(__file__).parent.parent / "api-dev-state.json"
CONFIG_FILE = Path(__file__).parent.parent / "autonomous-config.json"


def load_config():
    """Load autonomous config if it exists."""
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE) as f:
            return json.load(f)
    return None


def send_notification(topic, title, message, priority='default'):
    """Send ntfy notification if curl is available."""
    try:
        subprocess.run([
            'curl', '-s',
            '-H', f'Title: {title}',
            '-H', f'Priority: {priority}',
            '-d', message,
            f'ntfy.sh/{topic}'
        ], capture_output=True, timeout=5)
    except:
        pass  # Notifications are best-effort


def notify_user_input_required(phase_name, reason, endpoint):
    """Send ntfy notification when user input is required."""
    config = load_config()
    if not config:
        return

    notifications = config.get('notifications', {})
    if not notifications.get('enabled', False):
        return

    if 'user_input_required' not in notifications.get('notify_on', []):
        return

    topic = notifications.get('ntfy_topic', 'hustleserver')

    # Get session ID for resume command
    session_id = endpoint or 'unknown'
    if STATE_FILE.exists():
        try:
            state = json.loads(STATE_FILE.read_text())
            session_id = state.get('session_id', endpoint or 'unknown')
        except:
            pass

    title = f"Workflow - {phase_name}"
    message = f"{reason}\n\nResume: claude --resume {session_id}"

    send_notification(topic, title, message, priority='high')

# Phases that MUST be complete before stopping
REQUIRED_PHASES = [
    ("toc_enumeration", "Feature enumeration (list ALL features first)"),
    ("research_initial", "Initial research (Context7/WebSearch)"),
    ("interview", "User interview"),
    ("tdd_red", "TDD Red phase (failing tests written)"),
    ("tdd_green", "TDD Green phase (tests passing)"),
    ("verify", "Verification phase (re-checked against docs)"),
    ("documentation", "Documentation updates (manifest/research cached)"),
]

# Phases that SHOULD be complete (warning but don't block)
RECOMMENDED_PHASES = [
    ("schema_creation", "Schema creation"),
    ("tdd_refactor", "TDD Refactor phase"),
    ("documentation", "Documentation updates"),
]

# Minimum scope coverage required (v3.12.0)
# Coverage = (implemented + deferred) / discovered
# Must be 100% - every discovered feature must be explicitly decided
MIN_SCOPE_COVERAGE_PERCENT = 100  # All features must be accounted for


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


def check_scope_coverage(state: dict) -> tuple[list[str], bool]:
    """Check if all discovered features have been decided.

    v3.12.0: Enforces that user-confirmed scope is fully decided.
    v3.12.1: Added support for 'skipped' features (intentionally excluded).

    Coverage = (implemented + deferred + skipped) / discovered = 100%
    Every feature must have an explicit decision.

    Returns (issues_list, should_block).
    """
    issues = []
    should_block = False

    # Get scope data - check both old and new state formats
    scope = state.get("scope", {})
    if not scope and "endpoints" in state:
        active = state.get("active_endpoint")
        if active and active in state["endpoints"]:
            scope = state["endpoints"][active].get("scope", {})

    if not scope:
        # No scope tracking - can't enforce
        return [], False

    discovered = scope.get("discovered_features", [])
    implemented = scope.get("implemented_features", [])
    deferred = scope.get("deferred_features", [])
    skipped = scope.get("skipped_features", [])
    coverage_percent = scope.get("coverage_percent", 0)

    # If no features discovered, skip this check
    if not discovered:
        return [], False

    # Get feature names (handle both dict and string formats)
    def get_name(f):
        return f.get("name") if isinstance(f, dict) else f

    discovered_names = set(get_name(f) for f in discovered)
    implemented_names = set(implemented)
    deferred_names = set(get_name(f) for f in deferred)
    skipped_names = set(get_name(f) for f in skipped)

    # Calculate what's missing (not decided)
    accounted_for = implemented_names | deferred_names | skipped_names
    missing = discovered_names - accounted_for

    # Build report
    total = len(discovered_names)
    impl_count = len(implemented_names)
    defer_count = len(deferred_names)
    skip_count = len(skipped_names)
    missing_count = len(missing)

    # Recalculate coverage
    if total > 0:
        actual_coverage = int(((impl_count + defer_count + skip_count) / total) * 100)
    else:
        actual_coverage = 100

    if missing_count > 0:
        issues.append(f"\n❌ SCOPE COVERAGE INCOMPLETE ({actual_coverage}%)")
        issues.append(f"   Discovered: {total} features")
        issues.append(f"   Implemented: {impl_count}")
        issues.append(f"   Deferred: {defer_count}")
        issues.append(f"   Skipped: {skip_count}")
        issues.append(f"   Undecided: {missing_count}")
        issues.append("")
        issues.append("   Features WITHOUT explicit decision:")
        for feat in list(missing)[:10]:  # Show up to 10
            issues.append(f"     • {feat}")
        if missing_count > 10:
            issues.append(f"     ... and {missing_count - 10} more")
        issues.append("")
        issues.append("   To proceed, decide for EACH feature:")
        issues.append("     • Implement: Build in this workflow")
        issues.append("     • Defer: Postpone to future version")
        issues.append("     • Skip: Intentionally exclude")

        # Block if coverage is below threshold
        if actual_coverage < MIN_SCOPE_COVERAGE_PERCENT:
            should_block = True
            issues.append(f"\n   ⛔ Coverage {actual_coverage}% is below required {MIN_SCOPE_COVERAGE_PERCENT}%")

    elif actual_coverage == 100 and (defer_count > 0 or skip_count > 0):
        # All accounted for - info only
        issues.append(f"\n✅ SCOPE COVERAGE: 100%")
        issues.append(f"   Implemented: {impl_count}")
        if defer_count > 0:
            issues.append(f"   Deferred: {defer_count} (future version)")
        if skip_count > 0:
            issues.append(f"   Skipped: {skip_count} (intentionally excluded)")
        # Don't block - all features have explicit decisions

    return issues, should_block


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

    # FIX: Check if an API workflow is explicitly active
    # This prevents blocking when user is just doing general research/questions
    workflow_active = state.get("workflow_active", False)
    endpoint = state.get("endpoint")

    if not workflow_active and not endpoint:
        # No active API workflow - allow stop without checking phases
        print(json.dumps({"decision": "approve"}))
        sys.exit(0)

    phases = state.get("phases", {})

    # Check if workflow was even started (legacy check for backward compatibility)
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

    # v3.12.0: Check scope coverage - all discovered features must be implemented or deferred
    scope_issues, scope_should_block = check_scope_coverage(state)
    if scope_issues:
        all_issues.extend(scope_issues)

    # Block if required phases incomplete OR scope coverage insufficient
    if incomplete_required or scope_should_block:
        # Build notification message
        notify_reason = f"Workflow for '{endpoint}' blocked."
        if incomplete_required:
            notify_reason += " Incomplete required phases."
        if scope_should_block:
            notify_reason += " Scope coverage below 80%."
        notify_reason += " User action needed."

        # Send ntfy notification for autonomous mode
        notify_user_input_required(
            "Workflow Blocked",
            notify_reason,
            endpoint
        )

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
