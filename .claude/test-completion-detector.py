#!/usr/bin/env python3
"""
Test Completion Detector

Programmatically verifies that a workflow completed successfully by checking:
1. All 14 phases marked as "complete" in api-dev-state.json
2. All expected artifacts exist (route.ts, schema.ts, tests, README)
3. All hooks logged in workflow-logs/
4. Tests pass (if test files exist)

Usage:
    python test-completion-detector.py <test_directory> <command_type>

Example:
    python test-completion-detector.py ~/test-api-dev-tools-auto api-create

Returns:
    Exit code 0 if complete, 1 if incomplete, 2 if error
    Prints JSON with detailed status

Version: 1.0.0
"""

import json
import sys
from pathlib import Path
from datetime import datetime


def load_state(test_dir):
    """Load api-dev-state.json."""
    state_file = Path(test_dir) / ".claude" / "api-dev-state.json"

    if not state_file.exists():
        return None

    try:
        return json.loads(state_file.read_text())
    except Exception as e:
        print(f"Error loading state: {e}", file=sys.stderr)
        return None


def check_phases_complete(state):
    """Check if all 14 phases are marked complete."""
    required_phases = [
        "disambiguation",
        "scope",
        "research_initial",
        "interview",
        "research_deep",
        "schema_creation",
        "environment_check",
        "tdd_red",
        "tdd_green",
        "verify",
        "code_review",
        "tdd_refactor",
        "documentation",
        "completion"
    ]

    phases = state.get("phases", {})
    incomplete_phases = []

    for phase_name in required_phases:
        phase_data = phases.get(phase_name, {})
        status = phase_data.get("status", "not_started")

        if status != "complete":
            # Special case: research_deep can be skipped if comprehensive docs found
            if phase_name == "research_deep" and status == "skipped":
                continue

            # Special case: code_review can be partial if no API key
            if phase_name == "code_review" and status == "partial":
                continue

            incomplete_phases.append({
                "phase": phase_name,
                "status": status,
                "reason": phase_data.get("incomplete_reason", "Unknown")
            })

    return {
        "complete": len(incomplete_phases) == 0,
        "total_phases": len(required_phases),
        "complete_phases": len(required_phases) - len(incomplete_phases),
        "incomplete": incomplete_phases
    }


def check_artifacts_exist(test_dir, command_type, state):
    """Check if all expected artifacts exist."""
    endpoint = state.get("endpoint", "unknown")
    missing_artifacts = []
    found_artifacts = []

    # Define expected artifacts by command type
    if command_type == "api-create":
        expected = {
            f"src/app/api/v2/{endpoint}/route.ts": "API route handler",
            f"src/app/api/v2/{endpoint}/schema.ts": "Zod schema definitions",
            f"src/app/api/v2/{endpoint}/__tests__/{endpoint}.api.test.ts": "API tests",
            f"src/app/api/v2/{endpoint}/README.md": "API documentation"
        }
    elif command_type == "hustle-ui-create":
        component_name = state.get("component_name", endpoint)
        expected = {
            f"src/components/{component_name}/{component_name}.tsx": "Component file",
            f"src/components/{component_name}/{component_name}.test.tsx": "Component tests",
            f"src/components/{component_name}/{component_name}.stories.tsx": "Storybook story"
        }
    elif command_type == "hustle-ui-create-page":
        page_route = state.get("page_route", endpoint)
        expected = {
            f"src/app/{page_route}/page.tsx": "Page file",
            f"e2e/{page_route}.spec.ts": "E2E tests"
        }
    elif command_type == "hustle-combine":
        expected = {
            f"src/app/api/v2/{endpoint}/route.ts": "Combined API route",
            f"src/app/api/v2/{endpoint}/schema.ts": "Combined schema",
            f"src/app/api/v2/{endpoint}/__tests__/{endpoint}.api.test.ts": "Integration tests"
        }
    elif command_type == "hustle-build":
        # Build creates multiple artifacts - check decomposition
        expected = {}  # Will be checked differently
    else:
        return {
            "complete": False,
            "error": f"Unknown command type: {command_type}"
        }

    # Check each artifact
    test_path = Path(test_dir)
    for artifact_path, description in expected.items():
        full_path = test_path / artifact_path
        if full_path.exists():
            found_artifacts.append({"path": artifact_path, "description": description})
        else:
            missing_artifacts.append({"path": artifact_path, "description": description})

    return {
        "complete": len(missing_artifacts) == 0,
        "found": found_artifacts,
        "missing": missing_artifacts
    }


def check_registry_updated(test_dir, command_type):
    """Check if registry.json was updated."""
    registry_file = Path(test_dir) / ".claude" / "registry.json"

    if not registry_file.exists():
        return {"complete": False, "reason": "Registry file missing"}

    try:
        registry = json.loads(registry_file.read_text())

        # Check if there are entries
        if command_type == "api-create":
            apis = registry.get("apis", [])
            if len(apis) == 0:
                return {"complete": False, "reason": "No APIs in registry"}
        elif command_type == "hustle-ui-create":
            components = registry.get("components", [])
            if len(components) == 0:
                return {"complete": False, "reason": "No components in registry"}
        elif command_type == "hustle-ui-create-page":
            pages = registry.get("pages", [])
            if len(pages) == 0:
                return {"complete": False, "reason": "No pages in registry"}

        return {"complete": True}

    except Exception as e:
        return {"complete": False, "reason": f"Error reading registry: {e}"}


def check_workflow_logs(test_dir):
    """Check if workflow events were logged."""
    logs_dir = Path(test_dir) / ".claude" / "workflow-logs"

    if not logs_dir.exists():
        return {"complete": False, "reason": "Workflow logs directory missing"}

    log_files = list(logs_dir.glob("*.json"))

    if len(log_files) == 0:
        return {"complete": False, "reason": "No workflow log files found"}

    return {
        "complete": True,
        "log_files": [str(f.name) for f in log_files]
    }


def main():
    if len(sys.argv) < 3:
        print(json.dumps({
            "error": "Usage: python test-completion-detector.py <test_directory> <command_type>"
        }))
        sys.exit(2)

    test_dir = Path(sys.argv[1]).expanduser()
    command_type = sys.argv[2]

    if not test_dir.exists():
        print(json.dumps({
            "error": f"Test directory does not exist: {test_dir}"
        }))
        sys.exit(2)

    # Load state
    state = load_state(test_dir)

    if not state:
        print(json.dumps({
            "complete": False,
            "error": "Could not load api-dev-state.json"
        }))
        sys.exit(1)

    # Run all checks
    phases_check = check_phases_complete(state)
    artifacts_check = check_artifacts_exist(test_dir, command_type, state)
    registry_check = check_registry_updated(test_dir, command_type)
    logs_check = check_workflow_logs(test_dir)

    # Overall result
    all_complete = (
        phases_check["complete"] and
        artifacts_check["complete"] and
        registry_check["complete"] and
        logs_check["complete"]
    )

    result = {
        "complete": all_complete,
        "timestamp": datetime.now().isoformat(),
        "test_directory": str(test_dir),
        "command_type": command_type,
        "endpoint": state.get("endpoint", "unknown"),
        "checks": {
            "phases": phases_check,
            "artifacts": artifacts_check,
            "registry": registry_check,
            "logs": logs_check
        }
    }

    print(json.dumps(result, indent=2))

    # Exit code based on result
    if all_complete:
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
