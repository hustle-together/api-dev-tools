#!/usr/bin/env python3
"""
Parallel Orchestrator Hook

Coordinates parallel agent execution across git worktrees for the --parallel flag.
This enables multiple independent workflows to run simultaneously.

Hook Type: SessionStart (when --parallel detected)
           UserPromptSubmit (for /parallel-spawn command)

Features:
- Creates git worktrees for isolated parallel execution
- Injects shared interview decisions into each worktree
- Tracks agent status and merges results
- Cleans up worktrees after completion

v4.5.0: Initial implementation

References:
- docs/AUTONOMOUS_LOOPS.md - Parallel execution section
"""

import json
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

# Import shared utilities
try:
    from hook_utils import (
        log_workflow_event,
        load_state,
        save_state,
        get_project_dir
    )
    UTILS_AVAILABLE = True
except ImportError:
    UTILS_AVAILABLE = False


def get_current_branch():
    """Get the current git branch name."""
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError:
        return "main"


def setup_parallel_execution(workflows, shared_decisions=None):
    """
    Set up git worktrees for parallel agent execution.

    Args:
        workflows: List of workflow configs, each with:
            - name: Workflow identifier
            - type: "api", "component", "page"
            - config: Additional workflow config
        shared_decisions: Dict of interview decisions to share across all workflows

    Returns:
        list: Worktree info dicts
    """
    project_dir = get_project_dir()
    base_branch = get_current_branch()
    worktrees = []

    for i, workflow in enumerate(workflows):
        worktree_name = f"parallel-{workflow.get('name', 'workflow')}-{i}"
        worktree_path = str(Path(project_dir).parent / worktree_name)

        try:
            # Create worktree with new branch
            subprocess.run(
                ["git", "worktree", "add", worktree_path, "-b", worktree_name],
                cwd=project_dir,
                capture_output=True,
                check=True
            )

            # Create .claude directory in worktree
            claude_dir = Path(worktree_path) / ".claude"
            claude_dir.mkdir(parents=True, exist_ok=True)

            # Copy shared decisions to worktree state
            if shared_decisions:
                worktree_state = {
                    "workflow_id": f"parallel-{worktree_name}",
                    "workflow": workflow.get("type", "api-create"),
                    "active_endpoint": workflow.get("name"),
                    "shared_decisions": shared_decisions,
                    "parallel_execution": True,
                    "parent_worktree": project_dir
                }
                state_file = claude_dir / "api-dev-state.json"
                state_file.write_text(json.dumps(worktree_state, indent=2))

            worktrees.append({
                "name": worktree_name,
                "path": worktree_path,
                "workflow": workflow,
                "status": "pending",
                "created_at": datetime.now().isoformat()
            })

        except subprocess.CalledProcessError as e:
            # Log error but continue with other worktrees
            worktrees.append({
                "name": worktree_name,
                "path": worktree_path,
                "workflow": workflow,
                "status": "error",
                "error": str(e)
            })

    return worktrees


def generate_spawn_instructions(worktrees, shared_decisions=None):
    """
    Generate instructions for spawning parallel Task agents.

    This returns data that the AI can use to spawn multiple Task tools
    in a single message.

    Args:
        worktrees: List of worktree info from setup_parallel_execution
        shared_decisions: Shared interview decisions

    Returns:
        list: Task tool invocation configs
    """
    spawn_instructions = []

    for wt in worktrees:
        if wt.get("status") == "error":
            continue

        workflow = wt.get("workflow", {})
        workflow_type = workflow.get("type", "api-create")
        workflow_name = workflow.get("name", "unknown")

        prompt = f"""Execute workflow in parallel worktree: {wt['path']}

## Workflow Configuration
- Type: {workflow_type}
- Name: {workflow_name}
- Worktree: {wt['name']}

## Shared Decisions (DO NOT re-ask these questions)
{json.dumps(shared_decisions, indent=2) if shared_decisions else "None"}

## Instructions

1. Change to the worktree directory:
   cd {wt['path']}

2. Run the appropriate workflow:
   - For API: Execute /api-create {workflow_name} (use shared decisions)
   - For Component: Execute /ui-create-component {workflow_name}
   - For Page: Execute /ui-create-page {workflow_name}

3. When complete, signal with:
   <promise>DONE</promise>

4. Important:
   - Use the shared decisions - do NOT re-interview
   - Stay within the worktree directory
   - Report any errors clearly
"""

        spawn_instructions.append({
            "subagent_type": "general-purpose",
            "prompt": prompt,
            "description": f"Parallel: {workflow_name}",
            "run_in_background": True
        })

    return spawn_instructions


def merge_parallel_results(worktrees):
    """
    Merge completed worktrees back to main branch.

    Args:
        worktrees: List of worktree info with status updates

    Returns:
        dict: Merge results
    """
    project_dir = get_project_dir()
    results = {
        "merged": [],
        "failed": [],
        "cleaned": []
    }

    for wt in worktrees:
        if wt.get("status") != "complete":
            continue

        try:
            # Merge worktree branch
            subprocess.run(
                ["git", "merge", wt["name"], "--no-ff", "-m", f"Merge parallel workflow: {wt['name']}"],
                cwd=project_dir,
                capture_output=True,
                check=True
            )
            results["merged"].append(wt["name"])

            # Remove worktree
            subprocess.run(
                ["git", "worktree", "remove", wt["path"]],
                cwd=project_dir,
                capture_output=True,
                check=True
            )
            results["cleaned"].append(wt["name"])

        except subprocess.CalledProcessError as e:
            results["failed"].append({
                "name": wt["name"],
                "error": str(e)
            })

    return results


def check_parallel_status():
    """
    Check the status of parallel execution.

    Returns:
        dict: Current parallel execution status
    """
    if not UTILS_AVAILABLE:
        return {"error": "hook_utils not available"}

    state = load_state()
    parallel = state.get("parallel_execution", {})

    if not parallel.get("enabled"):
        return {"active": False, "message": "No parallel execution in progress"}

    worktrees = parallel.get("worktrees", [])
    status_counts = {"pending": 0, "in_progress": 0, "complete": 0, "error": 0}

    for wt in worktrees:
        status = wt.get("status", "pending")
        status_counts[status] = status_counts.get(status, 0) + 1

    return {
        "active": True,
        "worktree_count": len(worktrees),
        "status_counts": status_counts,
        "worktrees": worktrees,
        "shared_decisions": parallel.get("shared_decisions", {}),
        "merge_status": parallel.get("merge_status", "pending")
    }


def handle_session_start():
    """Handle SessionStart event - detect --parallel flag."""
    try:
        hook_input = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        print(json.dumps({"result": "continue"}))
        return

    # The --parallel flag would be detected from the user's initial message
    # For now, just initialize the parallel state structure if needed
    if UTILS_AVAILABLE:
        state = load_state()
        if "parallel_execution" not in state:
            state["parallel_execution"] = {
                "enabled": False,
                "worktrees": [],
                "shared_decisions": {},
                "merge_status": "pending"
            }
            save_state(state)

    print(json.dumps({"result": "continue"}))


def handle_user_prompt():
    """Handle UserPromptSubmit - detect parallel commands."""
    try:
        hook_input = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        print(json.dumps({"result": "continue"}))
        return

    prompt = hook_input.get("prompt", "").lower()

    # Check for parallel spawn command
    if "/parallel-spawn" in prompt:
        # Extract workflows from the prompt
        # Format: /parallel-spawn api:users api:products component:chart
        workflows = parse_workflow_list(prompt)

        if workflows:
            status = check_parallel_status()

            if status.get("active"):
                print(json.dumps({
                    "result": "continue",
                    "message": f"""
⚠️ Parallel execution already in progress!

Current status:
- Worktrees: {status.get('worktree_count', 0)}
- Pending: {status.get('status_counts', {}).get('pending', 0)}
- In Progress: {status.get('status_counts', {}).get('in_progress', 0)}
- Complete: {status.get('status_counts', {}).get('complete', 0)}

Use /parallel-status to see details.
Use /parallel-merge when all are complete.
"""
                }))
                return

            # Ready to start parallel execution
            print(json.dumps({
                "result": "continue",
                "message": f"""
Ready to spawn {len(workflows)} parallel workflows:

{chr(10).join(f"  - {w['type']}: {w['name']}" for w in workflows)}

Next steps:
1. The AI will create git worktrees for each workflow
2. Spawn background Task agents for each
3. Monitor progress with /parallel-status
4. Merge results with /parallel-merge when complete

Proceeding with parallel setup...
"""
            }))
            return

    # Check for parallel status command
    if "/parallel-status" in prompt:
        status = check_parallel_status()

        if not status.get("active"):
            print(json.dumps({
                "result": "continue",
                "message": "No parallel execution in progress.\nStart with: /parallel-spawn api:name1 api:name2 ..."
            }))
            return

        worktree_lines = []
        for wt in status.get("worktrees", []):
            status_icon = {"pending": "⏳", "in_progress": "🔄", "complete": "✓", "error": "❌"}.get(wt.get("status"), "?")
            worktree_lines.append(f"  {status_icon} {wt.get('name')}: {wt.get('status')}")

        print(json.dumps({
            "result": "continue",
            "message": f"""
┌─────────────────────────────────────────────────────────────────┐
│               PARALLEL EXECUTION STATUS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Worktrees: {status.get('worktree_count', 0):<50} │
│  Pending: {status.get('status_counts', {}).get('pending', 0):<51} │
│  In Progress: {status.get('status_counts', {}).get('in_progress', 0):<47} │
│  Complete: {status.get('status_counts', {}).get('complete', 0):<50} │
│                                                                 │
│  Worktree Details:                                              │
{chr(10).join(f"│{line:<64}│" for line in worktree_lines) if worktree_lines else "│  (none)                                                        │"}
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
"""
        }))
        return

    # Check for parallel merge command
    if "/parallel-merge" in prompt:
        status = check_parallel_status()

        if not status.get("active"):
            print(json.dumps({
                "result": "continue",
                "message": "No parallel execution to merge."
            }))
            return

        incomplete = status.get("status_counts", {}).get("pending", 0) + status.get("status_counts", {}).get("in_progress", 0)
        if incomplete > 0:
            print(json.dumps({
                "result": "continue",
                "message": f"⚠️ Cannot merge: {incomplete} workflows still in progress.\nWait for all to complete or use /parallel-abort."
            }))
            return

        print(json.dumps({
            "result": "continue",
            "message": "Ready to merge parallel results. Proceeding with merge..."
        }))
        return

    print(json.dumps({"result": "continue"}))


def parse_workflow_list(prompt):
    """
    Parse workflow list from prompt.

    Format: /parallel-spawn api:users api:products component:chart
    """
    workflows = []

    # Pattern: type:name
    pattern = r'(api|component|page):(\w+)'
    matches = re.findall(pattern, prompt, re.IGNORECASE)

    for match in matches:
        workflow_type, name = match
        workflows.append({
            "type": f"{workflow_type.lower()}-create",
            "name": name.lower()
        })

    return workflows


def main():
    """Main entry point - determine hook type from environment."""
    hook_type = os.environ.get("CLAUDE_HOOK_TYPE", "SessionStart")

    if hook_type == "SessionStart":
        handle_session_start()
    elif hook_type == "UserPromptSubmit":
        handle_user_prompt()
    else:
        print(json.dumps({"result": "continue"}))


if __name__ == "__main__":
    main()
