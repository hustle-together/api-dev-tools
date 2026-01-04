#!/usr/bin/env python3
"""
Completion Links Hook

Trigger: Stop event (when workflow reaches Phase 14)
Action: Output all relevant links for the completed artifact

Links include:
- Dashboard: /hustle-dev-tools
- API Showcase: /hustle-dev-tools/api#[endpoint]
- UI Showcase: /hustle-dev-tools/ui#[component]
- Storybook: http://localhost:6006/?path=/docs/[component]
- Test Results: /hustle-dev-tools/tests
- Visual QA: /hustle-dev-tools/visual-qa
"""

import json
import sys
import os
from pathlib import Path

def get_project_root():
    """Get the project root directory."""
    return os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())

def load_state():
    """Load the workflow state file."""
    state_path = Path(get_project_root()) / ".devkit" / "state.json"
    if state_path.exists():
        with open(state_path, "r") as f:
            return json.load(f)
    return {}

def load_registry():
    """Load the registry file."""
    registry_path = Path(get_project_root()) / ".devkit" / "registry.json"
    if registry_path.exists():
        with open(registry_path, "r") as f:
            return json.load(f)
    return {"apis": {}, "components": {}, "pages": {}}

def is_phase_14(state: dict) -> bool:
    """Check if workflow is at Phase 14 (Completion)."""
    phases = state.get("phases", {})

    # Check if completion phase is in_progress or completed
    completion = phases.get("completion", {})
    if completion.get("status") in ["in_progress", "completed"]:
        return True

    # Alternative: check if all previous phases are completed
    required_phases = [
        "disambiguation", "scope", "research", "interview",
        "deep_research", "schema", "environment", "tdd_red",
        "tdd_green", "verify", "code_review", "refactor", "documentation"
    ]

    all_completed = all(
        phases.get(phase, {}).get("status") == "completed"
        for phase in required_phases
    )

    return all_completed

def get_base_url():
    """Get the base URL for the application."""
    # Check for custom port in environment
    port = os.environ.get("PORT", "3000")
    return f"http://localhost:{port}"

def generate_api_links(artifact_name: str, registry: dict) -> list:
    """Generate links for API workflow completion."""
    base_url = get_base_url()
    api_info = registry.get("apis", {}).get(artifact_name, {})

    links = [
        {
            "label": "Dashboard",
            "url": f"{base_url}/hustle-dev-tools",
            "icon": "dashboard"
        },
        {
            "label": "API Showcase",
            "url": f"{base_url}/hustle-dev-tools/api#{artifact_name}",
            "icon": "api"
        },
        {
            "label": "Test Results",
            "url": f"{base_url}/hustle-dev-tools/tests",
            "icon": "test"
        }
    ]

    # Add direct API endpoint link if available
    if api_info.get("route"):
        links.append({
            "label": "API Endpoint",
            "url": f"{base_url}{api_info['route']}",
            "icon": "endpoint"
        })

    return links

def generate_component_links(artifact_name: str, registry: dict) -> list:
    """Generate links for component workflow completion."""
    base_url = get_base_url()
    component_info = registry.get("components", {}).get(artifact_name, {})

    links = [
        {
            "label": "Dashboard",
            "url": f"{base_url}/hustle-dev-tools",
            "icon": "dashboard"
        },
        {
            "label": "UI Showcase",
            "url": f"{base_url}/hustle-dev-tools/ui#{artifact_name}",
            "icon": "ui"
        },
        {
            "label": "Storybook",
            "url": f"http://localhost:6006/?path=/docs/{artifact_name.lower()}",
            "icon": "storybook"
        },
        {
            "label": "Visual QA",
            "url": f"{base_url}/hustle-dev-tools/visual-qa",
            "icon": "visual"
        },
        {
            "label": "Test Results",
            "url": f"{base_url}/hustle-dev-tools/tests",
            "icon": "test"
        }
    ]

    return links

def generate_page_links(artifact_name: str, registry: dict) -> list:
    """Generate links for page workflow completion."""
    base_url = get_base_url()
    page_info = registry.get("pages", {}).get(artifact_name, {})
    page_route = page_info.get("route", f"/{artifact_name.lower()}")

    links = [
        {
            "label": "Dashboard",
            "url": f"{base_url}/hustle-dev-tools",
            "icon": "dashboard"
        },
        {
            "label": "Your Page",
            "url": f"{base_url}{page_route}",
            "icon": "page"
        },
        {
            "label": "Visual QA",
            "url": f"{base_url}/hustle-dev-tools/visual-qa",
            "icon": "visual"
        },
        {
            "label": "E2E Results",
            "url": f"{base_url}/hustle-dev-tools/tests",
            "icon": "test"
        }
    ]

    return links

def format_completion_output(workflow: str, artifact_name: str, links: list) -> str:
    """Format the completion output with all links."""
    workflow_names = {
        "api-create": "API Endpoint",
        "hustle-ui-create": "Component",
        "hustle-ui-create-page": "Page",
        "hustle-combine": "Orchestration"
    }

    workflow_label = workflow_names.get(workflow, "Artifact")

    output = f"""
{'=' * 60}
WORKFLOW COMPLETE: {artifact_name}
{'=' * 60}

{workflow_label} successfully created and registered.

LINKS:
"""

    for link in links:
        output += f"  {link['label']}: {link['url']}\n"

    output += f"""
{'=' * 60}

Registry updated: .devkit/registry.json
Research cached: .devkit/research/

Next steps:
- Visit the dashboard to see all your artifacts
- Use /api-status to check workflow progress
- Run /commit to commit your changes
"""

    return output

def main():
    # Read hook input from stdin
    try:
        hook_input = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        sys.exit(0)

    # This is a Stop hook, so we check the current state
    state = load_state()
    registry = load_registry()

    # Check if we're at Phase 14
    if not is_phase_14(state):
        sys.exit(0)  # Not at completion yet

    # Get workflow type and artifact name
    workflow = state.get("workflow", "")
    artifact_name = state.get("active_artifact", "")

    if not workflow or not artifact_name:
        sys.exit(0)

    # Generate appropriate links based on workflow type
    if workflow == "api-create":
        links = generate_api_links(artifact_name, registry)
    elif workflow == "hustle-ui-create":
        links = generate_component_links(artifact_name, registry)
    elif workflow == "hustle-ui-create-page":
        links = generate_page_links(artifact_name, registry)
    else:
        # Generic links for other workflows
        base_url = get_base_url()
        links = [
            {"label": "Dashboard", "url": f"{base_url}/hustle-dev-tools", "icon": "dashboard"},
            {"label": "Test Results", "url": f"{base_url}/hustle-dev-tools/tests", "icon": "test"}
        ]

    # Format and output the completion message
    output = format_completion_output(workflow, artifact_name, links)
    print(output)

    sys.exit(0)

if __name__ == "__main__":
    main()
