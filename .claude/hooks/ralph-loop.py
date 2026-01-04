#!/usr/bin/env python3
"""
ralph-loop.py - Forces continuation until completion promise detected.

Enhanced with Visual QA integration:
- Checks for unfixed visual QA errors
- If errors exist, instructs Claude to fix them
- Loops until visual QA passes AND completion promise detected

Place in: .claude/hooks/ralph-loop.py
"""
import sys
import json
import os
from pathlib import Path

COMPLETION_PROMISE = "DONE"  # Or "<promise>COMPLETE</promise>"
MAX_ITERATIONS = 50


def get_project_root():
    """Get the project root directory."""
    return Path(os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd()))


def get_iteration_count(session_id):
    try:
        return int(Path(f"/tmp/ralph_{session_id}_count").read_text())
    except:
        return 0


def increment_iteration_count(session_id):
    count = get_iteration_count(session_id) + 1
    Path(f"/tmp/ralph_{session_id}_count").write_text(str(count))


def load_visual_qa_results():
    """Load visual QA results."""
    results_path = get_project_root() / ".devkit" / "visual-qa-results.json"
    if results_path.exists():
        try:
            return json.loads(results_path.read_text())
        except json.JSONDecodeError:
            pass
    return {}


def get_visual_qa_errors(results: dict) -> list:
    """Get list of visual QA errors (not warnings/info)."""
    errors = []

    for component_name, component_data in results.items():
        component_results = component_data.get("results", {})

        # Skip components that already pass
        if component_results.get("overall_status") == "pass":
            continue

        # Skip pending analyses
        if component_results.get("status") == "pending":
            continue

        issues = component_results.get("issues", [])
        for issue in issues:
            # Only include errors (blocking issues)
            if issue.get("severity") == "error":
                errors.append({
                    "component": component_name,
                    **issue
                })

    return errors


def load_devkit_state():
    """Load the devkit workflow state file."""
    state_path = get_project_root() / ".devkit" / "state.json"
    if state_path.exists():
        try:
            return json.loads(state_path.read_text())
        except json.JSONDecodeError:
            pass
    return {}


def is_ui_workflow(state: dict) -> bool:
    """Check if current workflow is UI-related."""
    workflow = state.get("workflow", "")
    return workflow in ["hustle-ui-create", "hustle-ui-create-page", "hustle-combine"]


def main():
    input_data = json.loads(sys.stdin.read())

    session_id = input_data.get("session_id", "default")
    stop_hook_active = input_data.get("stop_hook_active", False)
    transcript_path = input_data.get("transcript_path", "")

    iteration_count = get_iteration_count(session_id)

    # Safety: max iterations
    if iteration_count >= MAX_ITERATIONS:
        output = {"decision": None, "reason": f"Max iterations ({MAX_ITERATIONS}) reached"}
        print(json.dumps(output))
        sys.exit(0)

    # Read transcript for completion promise
    try:
        transcript = Path(transcript_path).read_text()
    except:
        transcript = ""

    # Check if this is a UI workflow with visual QA requirements
    devkit_state = load_devkit_state()
    if is_ui_workflow(devkit_state):
        visual_qa_results = load_visual_qa_results()
        visual_qa_errors = get_visual_qa_errors(visual_qa_results)

        if visual_qa_errors:
            # Block completion until visual QA errors are fixed
            increment_iteration_count(session_id)

            error_list = "\n".join([
                f"  - [{e.get('category', 'visual')}] {e['component']}: {e.get('description', 'Unknown')}"
                for e in visual_qa_errors[:5]  # Show first 5 errors
            ])

            if len(visual_qa_errors) > 5:
                error_list += f"\n  ... and {len(visual_qa_errors) - 5} more errors"

            print(f"""
VISUAL QA ERRORS BLOCKING COMPLETION
====================================

{len(visual_qa_errors)} visual QA error(s) must be fixed:

{error_list}

Fix these issues, then run /visual-qa to re-analyze.
Output '{COMPLETION_PROMISE}' when all errors are resolved.
""", file=sys.stderr)
            sys.exit(2)

    # Check for completion promise
    if COMPLETION_PROMISE in transcript:
        output = {"decision": None, "reason": "Completion promise detected"}
        print(json.dumps(output))
        sys.exit(0)

    # Block stop and continue
    increment_iteration_count(session_id)

    print(f"Task not complete. Continue working. Output '{COMPLETION_PROMISE}' when done.",
          file=sys.stderr)
    sys.exit(2)


if __name__ == "__main__":
    main()
