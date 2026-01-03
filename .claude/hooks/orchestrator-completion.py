#!/usr/bin/env python3
"""
Orchestrator completion hook.

After a Skill completes, this hook updates the orchestration state
and determines the next workflow to execute.

Hook Type: PostToolUse (matcher: Skill)
"""

import json
import os
from pathlib import Path
from datetime import datetime

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False


def load_build_state():
    """Load hustle-build orchestration state"""
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")
    state_file = Path(project_dir) / ".claude" / "hustle-build-state.json"

    if state_file.exists():
        try:
            return json.loads(state_file.read_text())
        except Exception:
            pass
    return None


def save_build_state(state):
    """Save hustle-build orchestration state"""
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")
    state_file = Path(project_dir) / ".claude" / "hustle-build-state.json"

    try:
        state_file.write_text(json.dumps(state, indent=2))
        return True
    except Exception:
        return False


def load_api_state():
    """Load api-dev state to check completion"""
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")
    state_file = Path(project_dir) / ".claude" / "api-dev-state.json"

    if state_file.exists():
        try:
            return json.loads(state_file.read_text())
        except Exception:
            pass
    return {}


def get_skill_name(tool_input):
    """Extract skill name from tool input"""
    try:
        data = json.loads(tool_input)
        return data.get("skill", "")
    except Exception:
        return ""


def check_workflow_complete(api_state):
    """Check if the current workflow completed successfully"""
    phases = api_state.get("phases", {})

    # Check if documentation phase is complete (last phase)
    doc_phase = phases.get("documentation", {})
    if doc_phase.get("status") == "complete":
        return True

    # Alternative: check verification
    verify_phase = phases.get("verify", {})
    if verify_phase.get("status") == "complete":
        return True

    return False


def find_next_workflow(build_state):
    """Find the next pending workflow based on dependencies"""
    decomposition = build_state.get("decomposition", {})
    completed_names = set()

    # Collect completed workflow names
    for wf_type in ["apis", "components", "combined_apis", "pages"]:
        workflows = decomposition.get(wf_type, [])
        for wf in workflows:
            if wf.get("status") == "complete":
                completed_names.add(wf.get("name"))

    # Find first pending workflow with satisfied dependencies
    for wf_type in ["apis", "components", "combined_apis", "pages"]:
        workflows = decomposition.get(wf_type, [])
        for wf in workflows:
            if wf.get("status") != "pending":
                continue

            # Check dependencies
            deps = wf.get("depends_on", [])
            if all(dep in completed_names for dep in deps):
                return wf, wf_type

    return None, None


def send_ntfy(title, message, priority="default"):
    """Send NTFY notification"""
    topic = os.environ.get("NTFY_TOPIC")
    server = os.environ.get("NTFY_SERVER", "https://ntfy.sh")

    if not topic:
        return

    try:
        if HAS_REQUESTS:
            requests.post(
                f"{server}/{topic}",
                data=message.encode("utf-8"),
                headers={"Title": title, "Priority": priority, "Tags": "hustle,check"},
                timeout=5
            )
        else:
            import subprocess
            subprocess.run(
                ["curl", "-s", "-d", message, "-H", f"Title: {title}", f"{server}/{topic}"],
                capture_output=True,
                timeout=5
            )
    except Exception:
        pass


def main():
    tool_input = os.environ.get("CLAUDE_TOOL_INPUT", "{}")
    tool_result = os.environ.get("CLAUDE_TOOL_RESULT", "")

    # Get skill that completed
    skill_name = get_skill_name(tool_input)

    # Check if this is a workflow skill
    workflow_skills = [
        "api-create", "hustle-ui-create", "hustle-ui-create-page",
        "hustle-combine", "cycle"
    ]

    if skill_name not in workflow_skills:
        print(json.dumps({"continue": True}))
        return

    # Check if we're in an orchestrated build
    build_state = load_build_state()

    if not build_state or build_state.get("status") != "in_progress":
        print(json.dumps({"continue": True}))
        return

    # Check if the workflow completed successfully
    api_state = load_api_state()
    workflow_complete = check_workflow_complete(api_state)

    # Get active workflow info
    active = build_state.get("active_sub_workflow", {})
    active_name = active.get("name")
    active_type = active.get("type")

    # Update workflow status
    decomposition = build_state.get("decomposition", {})

    if workflow_complete and active_name:
        # Mark workflow as complete
        for wf_type in ["apis", "components", "combined_apis", "pages"]:
            workflows = decomposition.get(wf_type, [])
            for wf in workflows:
                if wf.get("name") == active_name:
                    wf["status"] = "complete"
                    wf["completed_at"] = datetime.now().isoformat()

        # Add to completed list
        if "completed_sub_workflows" not in build_state:
            build_state["completed_sub_workflows"] = []

        build_state["completed_sub_workflows"].append({
            "type": active_type,
            "name": active_name,
            "completed_at": datetime.now().isoformat()
        })

    # Find next workflow
    next_wf, next_type = find_next_workflow(build_state)

    if next_wf:
        # Set next as active
        build_state["active_sub_workflow"] = {
            "type": next_type.rstrip("s"),
            "name": next_wf.get("name"),
            "workflow_id": f"wf-{len(build_state.get('completed_sub_workflows', []))+1:03d}"
        }

        # Mark as in progress
        next_wf["status"] = "in_progress"
        next_wf["started_at"] = datetime.now().isoformat()

        save_build_state(build_state)

        # Determine which skill to run
        skill_mapping = {
            "api": "/api-create",
            "component": "/hustle-ui-create",
            "combined_api": "/hustle-combine api",
            "page": "/hustle-ui-create-page"
        }

        next_skill = skill_mapping.get(next_type.rstrip("s"), "/api-create")
        next_name = next_wf.get("name")

        context = f"""
## Workflow Complete: {active_name}

The [{active_type}] **{active_name}** workflow has completed.

### Next Workflow: [{next_type}] {next_name}

Run: `{next_skill} {next_name}`

Progress: {len(build_state.get('completed_sub_workflows', []))}/{sum(len(decomposition.get(t, [])) for t in decomposition)} complete
"""

        result = {
            "continue": True,
            "additionalContext": context
        }

    else:
        # All workflows complete!
        build_state["status"] = "complete"
        build_state["completed_at"] = datetime.now().isoformat()
        build_state["active_sub_workflow"] = None

        save_build_state(build_state)

        # Send completion notification
        completed_count = len(build_state.get("completed_sub_workflows", []))
        build_id = build_state.get("build_id", "unknown")

        send_ntfy(
            "Hustle Build Complete!",
            f"All {completed_count} workflows finished.\nReview: /hustle-build-review {build_id}",
            "high"
        )

        context = f"""
## BUILD COMPLETE

All workflows have finished successfully!

**Build ID:** {build_id}
**Total Workflows:** {completed_count}
**Duration:** {calculate_duration(build_state)}

### Created Elements:
{format_created_elements(build_state)}

### Next Steps:
- `/hustle-build-review {build_id}` - Review all decisions and results
- `/commit` - Commit all changes
- `/pr` - Create pull request

Visit `/hustle-dev-dashboard` to see all created elements.
"""

        result = {
            "continue": True,
            "additionalContext": context
        }

    print(json.dumps(result))


def calculate_duration(build_state):
    """Calculate build duration"""
    try:
        started = datetime.fromisoformat(build_state.get("created_at", ""))
        ended = datetime.fromisoformat(build_state.get("completed_at", datetime.now().isoformat()))
        duration = ended - started
        minutes = int(duration.total_seconds() / 60)
        return f"{minutes} minutes"
    except Exception:
        return "Unknown"


def format_created_elements(build_state):
    """Format list of created elements"""
    completed = build_state.get("completed_sub_workflows", [])
    lines = []

    for wf in completed:
        wf_type = wf.get("type", "unknown")
        name = wf.get("name", "unnamed")
        lines.append(f"  - [{wf_type}] {name}")

    return "\n".join(lines) if lines else "  None"


if __name__ == "__main__":
    main()
