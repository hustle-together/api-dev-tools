#!/usr/bin/env python3
"""
Shared utilities for Hustle Dev Tools hooks.

This module provides common functions used across multiple hooks:
- Workflow logging (events, decisions, phase transitions)
- State file management
- Configuration loading
- Path resolution
- Source repository detection

Version: 4.5.0
Updated: v3.12.13 - Added source repository detection
Updated: v4.5.0 - Added comprehensive logging, directory management, iteration tracking
"""

import json
import os
import sys
import shutil
from datetime import datetime
from pathlib import Path


# =============================================================================
# PATH UTILITIES
# =============================================================================

def get_project_dir():
    """Get the project directory from environment or current working directory."""
    return os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())


def get_state_file_path():
    """Get the path to the api-dev-state.json file."""
    project_dir = get_project_dir()
    return Path(project_dir) / ".claude" / "api-dev-state.json"


def get_config_file_path():
    """Get the path to the hustle-build-defaults.json config file."""
    project_dir = get_project_dir()
    # Check project-level first
    project_config = Path(project_dir) / ".claude" / "hustle-build-defaults.json"
    if project_config.exists():
        return project_config
    # Fall back to templates
    template_config = Path(project_dir) / "templates" / "hustle-build-defaults.json"
    if template_config.exists():
        return template_config
    return None


# =============================================================================
# STATE MANAGEMENT
# =============================================================================

def load_state():
    """Load the current workflow state, or return empty dict if not exists."""
    state_file = get_state_file_path()
    if not state_file.exists():
        return {}
    try:
        return json.loads(state_file.read_text())
    except (json.JSONDecodeError, IOError):
        return {}


def save_state(state):
    """Save the workflow state to file."""
    state_file = get_state_file_path()
    state_file.parent.mkdir(parents=True, exist_ok=True)
    state_file.write_text(json.dumps(state, indent=2))


def load_config():
    """Load the hustle-build-defaults configuration."""
    config_path = get_config_file_path()
    if not config_path or not config_path.exists():
        return {}
    try:
        return json.loads(config_path.read_text())
    except (json.JSONDecodeError, IOError):
        return {}


# =============================================================================
# WORKFLOW LOGGING
# =============================================================================

def get_workflow_id():
    """Get or create a workflow ID for the current session."""
    state = load_state()
    if "workflow_id" in state:
        return state["workflow_id"]

    # Generate new workflow ID
    workflow_id = f"session-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    state["workflow_id"] = workflow_id
    save_state(state)
    return workflow_id


def get_workflow_log_path():
    """Get the path to the current workflow's log file."""
    project_dir = get_project_dir()
    logs_dir = Path(project_dir) / ".claude" / "workflow-logs"
    logs_dir.mkdir(parents=True, exist_ok=True)

    workflow_id = get_workflow_id()
    return logs_dir / f"{workflow_id}.json"


def log_workflow_event(event_type, data=None):
    """
    Log a workflow event to the session log file.

    Event types:
    - "session_start" - Session began
    - "phase_transition" - Phase status changed
    - "interview_decision" - User answered interview question
    - "auto_answer" - Question auto-answered by defaults
    - "promise_emitted" - Ralph loop promise detected
    - "iteration_count" - Iteration count updated
    - "dry_run_block" - Write blocked by dry-run mode
    - "resume_attempt" - Attempted to resume workflow
    - "directory_created" - Directory was created
    - "registry_created" - Registry file was created

    Args:
        event_type: Type of event being logged
        data: Additional data for the event (dict)
    """
    if data is None:
        data = {}

    log_file = get_workflow_log_path()

    # Load existing or create new log
    if log_file.exists():
        try:
            log_data = json.loads(log_file.read_text())
        except (json.JSONDecodeError, IOError):
            log_data = None
    else:
        log_data = None

    if log_data is None:
        workflow_id = get_workflow_id()
        log_data = {
            "workflow_id": workflow_id,
            "started_at": datetime.now().isoformat(),
            "events": []
        }

    # Append event
    event = {
        "timestamp": datetime.now().isoformat(),
        "type": event_type
    }
    event.update(data)
    log_data["events"].append(event)

    # Update last activity
    log_data["last_activity"] = datetime.now().isoformat()

    # Write back
    log_file.write_text(json.dumps(log_data, indent=2))


# =============================================================================
# DIRECTORY & REGISTRY MANAGEMENT
# =============================================================================

def ensure_directories():
    """
    Ensure all required .claude/ directories exist.

    Creates:
    - .claude/workflow-logs/
    - .claude/adrs/
    - .claude/adr-requests/
    - .claude/research/

    Returns:
        list: Directories that were created (not already existing)
    """
    project_dir = get_project_dir()
    created = []

    directories = [
        ".claude/workflow-logs",
        ".claude/adrs",
        ".claude/adr-requests",
        ".claude/research"
    ]

    for dir_path in directories:
        full_path = Path(project_dir) / dir_path
        if not full_path.exists():
            full_path.mkdir(parents=True, exist_ok=True)
            created.append(dir_path)

    return created


def ensure_registry():
    """
    Ensure .claude/registry.json exists, creating from template if needed.

    Returns:
        tuple: (success: bool, created: bool) - success and whether it was newly created
    """
    project_dir = get_project_dir()
    registry_path = Path(project_dir) / ".claude" / "registry.json"

    if registry_path.exists():
        return True, False  # Exists, not created

    # Try to copy from template
    template_path = Path(project_dir) / "templates" / "registry.json"
    if template_path.exists():
        try:
            # Ensure parent directory exists
            registry_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy(template_path, registry_path)
            return True, True  # Success, created from template
        except IOError:
            pass

    # Create minimal registry
    try:
        registry_path.parent.mkdir(parents=True, exist_ok=True)
        registry = {
            "version": "1.0.0",
            "updated_at": datetime.now().isoformat(),
            "apis": {},
            "components": {},
            "pages": {},
            "combined": {},
            "adrs": {}
        }
        registry_path.write_text(json.dumps(registry, indent=2))
        return True, True  # Success, created minimal
    except IOError:
        return False, False  # Failed


# =============================================================================
# DRY-RUN MODE
# =============================================================================

def check_dry_run_mode():
    """Check if dry-run mode is active."""
    state = load_state()
    return state.get("dry_run_mode", False)


def set_dry_run_mode(enabled=True):
    """Set dry-run mode in state."""
    state = load_state()
    state["dry_run_mode"] = enabled
    save_state(state)


# =============================================================================
# ITERATION TRACKING
# =============================================================================

def get_phase_iterations(phase):
    """Get current iteration count for a phase."""
    state = load_state()
    iterations = state.get("phase_iterations", {})
    return iterations.get(phase, 0)


def increment_phase_iteration(phase):
    """
    Increment and return the iteration count for a phase.

    Returns:
        tuple: (current_iteration, max_iterations, limit_exceeded)
    """
    state = load_state()
    config = load_config()

    # Get max iterations
    max_iterations = config.get("autonomous", {}).get("max_iterations", 25)
    phase_limits = config.get("max_iterations", {}).get("phases", {})
    phase_limit = phase_limits.get(phase, max_iterations)

    # Increment
    iterations = state.get("phase_iterations", {})
    current = iterations.get(phase, 0) + 1
    iterations[phase] = current
    state["phase_iterations"] = iterations
    save_state(state)

    return current, phase_limit, current > phase_limit


def reset_phase_iterations():
    """Reset all phase iteration counters."""
    state = load_state()
    state["phase_iterations"] = {}
    save_state(state)


# =============================================================================
# HOOK I/O HELPERS
# =============================================================================

def get_input_from_stdin():
    """Read and parse JSON input from stdin."""
    try:
        return json.load(sys.stdin)
    except json.JSONDecodeError:
        return {}


def output_result(result):
    """Output a hook result as JSON."""
    print(json.dumps(result))


def allow_continue():
    """Output a simple continue result."""
    output_result({"continue": True})


def block_with_reason(reason):
    """Output a blocking result with a reason."""
    output_result({
        "continue": False,
        "reason": reason
    })


# =============================================================================
# RESUME FUNCTIONALITY (v4.5.0)
# =============================================================================

def handle_resume(workflow_id):
    """
    Resume a previous workflow by ID.

    Looks for the workflow in:
    1. Current api-dev-state.json (if workflow_id matches)
    2. Archived workflow logs in .claude/workflow-logs/

    Args:
        workflow_id: The workflow ID to resume (e.g., "session-20251230-143022")

    Returns:
        tuple: (state_dict or None, message_string)
    """
    project_dir = get_project_dir()

    # Check current state file
    state_file = get_state_file_path()
    if state_file.exists():
        try:
            state = json.loads(state_file.read_text())
            if state.get("workflow_id") == workflow_id:
                # Find last incomplete phase
                phases = state.get("phases", {})
                in_progress_phase = None
                for phase_name, phase_data in phases.items():
                    if isinstance(phase_data, dict) and phase_data.get("status") == "in_progress":
                        in_progress_phase = phase_name
                        break

                if in_progress_phase:
                    return state, f"Resuming from phase: {in_progress_phase}"
                return state, "Workflow found but all phases complete"
        except (json.JSONDecodeError, IOError):
            pass

    # Check workflow logs archive
    logs_dir = Path(project_dir) / ".claude" / "workflow-logs"
    log_file = logs_dir / f"{workflow_id}.json"

    if log_file.exists():
        try:
            log_data = json.loads(log_file.read_text())

            # Check if this log has state information
            if "state_snapshot" in log_data:
                # Restore state from snapshot
                restored_state = log_data["state_snapshot"]
                save_state(restored_state)

                # Log the resume attempt
                log_workflow_event("resume_attempt", {
                    "workflow_id": workflow_id,
                    "source": "workflow_log",
                    "success": True
                })

                return restored_state, f"Restored workflow {workflow_id} from archive"

            # If no state snapshot, we can at least provide the log info
            events = log_data.get("events", [])
            last_event = events[-1] if events else {}

            return None, f"Found log for {workflow_id} but no resumable state. Last event: {last_event.get('type', 'unknown')}"

        except (json.JSONDecodeError, IOError):
            pass

    return None, f"Workflow {workflow_id} not found in state or logs"


def list_resumable_workflows():
    """
    List all workflows that can potentially be resumed.

    Returns:
        list: List of dicts with workflow info
    """
    project_dir = get_project_dir()
    workflows = []

    # Check current state
    state_file = get_state_file_path()
    if state_file.exists():
        try:
            state = json.loads(state_file.read_text())
            if "workflow_id" in state:
                workflows.append({
                    "workflow_id": state["workflow_id"],
                    "source": "active",
                    "endpoint": state.get("active_endpoint"),
                    "last_modified": state_file.stat().st_mtime
                })
        except Exception:
            pass

    # Check workflow logs
    logs_dir = Path(project_dir) / ".claude" / "workflow-logs"
    if logs_dir.exists():
        for log_file in logs_dir.glob("*.json"):
            try:
                log_data = json.loads(log_file.read_text())
                workflow_id = log_data.get("workflow_id", log_file.stem)

                # Skip if already in list
                if any(w["workflow_id"] == workflow_id for w in workflows):
                    continue

                workflows.append({
                    "workflow_id": workflow_id,
                    "source": "archived",
                    "started_at": log_data.get("started_at"),
                    "last_activity": log_data.get("last_activity"),
                    "has_state_snapshot": "state_snapshot" in log_data
                })
            except Exception:
                continue

    return workflows


def snapshot_state_to_log():
    """
    Save a snapshot of the current state to the workflow log.
    This enables resume functionality for interrupted workflows.
    """
    state = load_state()
    if not state:
        return False

    log_file = get_workflow_log_path()
    try:
        if log_file.exists():
            log_data = json.loads(log_file.read_text())
        else:
            log_data = {"workflow_id": get_workflow_id(), "events": []}

        log_data["state_snapshot"] = state
        log_data["snapshot_at"] = datetime.now().isoformat()
        log_file.write_text(json.dumps(log_data, indent=2))
        return True
    except Exception:
        return False


# =============================================================================
# SOURCE REPOSITORY DETECTION (v3.12.13)
# =============================================================================

def is_source_repository() -> bool:
    """
    Check if we're running in the api-dev-tools source repository.
    If so, hooks should NOT enforce workflow - we're developing, not using.

    Detection methods:
    1. package.json name = @hustle-together/api-dev-tools
    2. templates/ folder exists (only in source repo, not installed)

    Returns:
        True if in source repository (skip enforcement)
        False if in a target project (enforce normally)
    """
    try:
        package_json = Path.cwd() / "package.json"
        if package_json.exists():
            data = json.loads(package_json.read_text())
            # If this is the source repo, skip enforcement
            if data.get("name") == "@hustle-together/api-dev-tools":
                return True

        # Also check for templates/ folder (only exists in source repo)
        if (Path.cwd() / "templates").is_dir():
            return True

    except Exception:
        pass
    return False


def skip_if_source_repo() -> bool:
    """
    Convenience function for hooks to call early.
    Returns True if hook should exit immediately (we're in source repo).

    Usage at top of hook:
        from hook_utils import skip_if_source_repo
        if skip_if_source_repo():
            print(json.dumps({"decision": "approve"}))
            sys.exit(0)
    """
    return is_source_repository()
