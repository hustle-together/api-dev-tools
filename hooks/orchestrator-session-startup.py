#!/usr/bin/env python3
"""
Orchestrator session startup hook.

Injects hustle-build orchestration state into context at session start.
This ensures Claude has awareness of multi-workflow builds in progress.

Hook Type: SessionStart
"""

import json
import os
from pathlib import Path
from datetime import datetime


def load_build_state():
    """Load hustle-build orchestration state if exists"""
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")
    state_file = Path(project_dir) / ".claude" / "hustle-build-state.json"

    if state_file.exists():
        try:
            return json.loads(state_file.read_text())
        except Exception:
            pass
    return None


def format_workflow_status(workflows):
    """Format workflow list for context injection"""
    if not workflows:
        return "No sub-workflows defined yet."

    lines = []
    for wf in workflows:
        status_emoji = {
            "complete": "✅",
            "in_progress": "🔄",
            "pending": "⏳",
            "failed": "❌"
        }.get(wf.get("status", "pending"), "⏳")

        wf_type = wf.get("type", "unknown")
        name = wf.get("name", "unnamed")
        deps = wf.get("depends_on", [])

        line = f"  {status_emoji} [{wf_type}] {name}"
        if deps:
            line += f" (depends on: {', '.join(deps)})"
        lines.append(line)

    return "\n".join(lines)


def format_shared_decisions(decisions):
    """Format shared decisions for context injection"""
    if not decisions:
        return "No shared decisions configured."

    lines = []
    for key, value in decisions.items():
        lines.append(f"  - {key}: {value}")

    return "\n".join(lines)


def main():
    state = load_build_state()

    if not state:
        # No active build, continue normally
        print(json.dumps({"continue": True}))
        return

    # Check if build is in progress
    status = state.get("status", "unknown")

    if status not in ["in_progress", "paused"]:
        print(json.dumps({"continue": True}))
        return

    # Build context for injection
    build_id = state.get("build_id", "unknown")
    mode = state.get("mode", "interactive")
    request = state.get("request", {}).get("original", "Unknown request")

    # Get workflow statuses
    decomposition = state.get("decomposition", {})
    all_workflows = []

    for wf_type in ["apis", "components", "combined_apis", "pages"]:
        workflows = decomposition.get(wf_type, [])
        for wf in workflows:
            wf["type"] = wf_type.rstrip("s")
            all_workflows.append(wf)

    # Count progress
    completed = len([w for w in all_workflows if w.get("status") == "complete"])
    total = len(all_workflows)
    in_progress = [w for w in all_workflows if w.get("status") == "in_progress"]

    # Get active sub-workflow
    active = state.get("active_sub_workflow", {})
    active_name = active.get("name", "None")
    active_type = active.get("type", "unknown")

    # Format shared decisions
    shared_decisions = state.get("shared_decisions", {})

    context = f"""
## Hustle Build In Progress

**Build ID:** {build_id}
**Mode:** {mode}
**Original Request:** "{request}"

### Progress: {completed}/{total} workflows complete

**Currently Active:** [{active_type}] {active_name}

### Sub-Workflows:
{format_workflow_status(all_workflows)}

### Shared Decisions (applied to all):
{format_shared_decisions(shared_decisions)}

---

**Commands:**
- Continue current workflow
- `/hustle-build-review {build_id}` - View build log
- Set `mode: "paused"` in state to pause

"""

    result = {
        "continue": True,
        "additionalContext": context
    }

    print(json.dumps(result))


if __name__ == "__main__":
    main()
