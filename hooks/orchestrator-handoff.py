#!/usr/bin/env python3
"""
Orchestrator handoff hook.

When a Skill is invoked, this hook checks if we're in an orchestrated build
and injects shared_decisions into the sub-workflow's state.

Hook Type: PreToolUse (matcher: Skill)
"""

import json
import os
from pathlib import Path
from datetime import datetime


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


def load_api_state():
    """Load api-dev state"""
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")
    state_file = Path(project_dir) / ".claude" / "api-dev-state.json"

    if state_file.exists():
        try:
            return json.loads(state_file.read_text())
        except Exception:
            pass
    return {}


def save_api_state(state):
    """Save api-dev state with shared decisions"""
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")
    state_file = Path(project_dir) / ".claude" / "api-dev-state.json"

    try:
        state_file.write_text(json.dumps(state, indent=2))
        return True
    except Exception:
        return False


def get_skill_name(tool_input):
    """Extract skill name from tool input"""
    try:
        data = json.loads(tool_input)
        return data.get("skill", "")
    except Exception:
        return ""


def main():
    tool_input = os.environ.get("CLAUDE_TOOL_INPUT", "{}")

    # Get skill being invoked
    skill_name = get_skill_name(tool_input)

    # Check if this is a workflow skill
    workflow_skills = [
        "api-create", "hustle-ui-create", "hustle-ui-create-page",
        "hustle-combine", "red", "green", "refactor", "cycle"
    ]

    if skill_name not in workflow_skills:
        print(json.dumps({"continue": True}))
        return

    # Check if we're in an orchestrated build
    build_state = load_build_state()

    if not build_state or build_state.get("status") != "in_progress":
        print(json.dumps({"continue": True}))
        return

    # Get shared decisions
    shared_decisions = build_state.get("shared_decisions", {})
    mode = build_state.get("mode", "interactive")

    if not shared_decisions and mode != "auto":
        print(json.dumps({"continue": True}))
        return

    # Load current api-dev state
    api_state = load_api_state()

    # Inject shared decisions
    api_state["orchestrated"] = True
    api_state["build_id"] = build_state.get("build_id")
    api_state["mode"] = mode

    # Pre-fill interview decisions from shared decisions
    if "phases" not in api_state:
        api_state["phases"] = {}

    if "interview" not in api_state["phases"]:
        api_state["phases"]["interview"] = {"status": "not_started", "decisions": {}}

    # Map shared decisions to interview decisions
    decision_mappings = {
        "auth_required": "authentication",
        "error_handling": "error_strategy",
        "brand_guide": "use_brand_guide",
        "testing_level": "testing_thoroughness",
        "caching_strategy": "caching"
    }

    for shared_key, interview_key in decision_mappings.items():
        if shared_key in shared_decisions:
            api_state["phases"]["interview"]["decisions"][interview_key] = shared_decisions[shared_key]

    # Mark which decisions are from orchestrator (so sub-workflow knows not to re-ask)
    api_state["shared_decisions_applied"] = list(shared_decisions.keys())

    # Save updated state
    save_api_state(api_state)

    # Update build state with current active workflow
    decomposition = build_state.get("decomposition", {})

    # Find the workflow being started
    for wf_type in ["apis", "components", "combined_apis", "pages"]:
        workflows = decomposition.get(wf_type, [])
        for wf in workflows:
            if wf.get("status") == "pending":
                # This might be the one being started
                # We'll rely on the skill to update status
                break

    # Log the handoff
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")
    logs_dir = Path(project_dir) / ".claude" / "workflow-logs"
    logs_dir.mkdir(parents=True, exist_ok=True)

    log_file = logs_dir / f"{build_state.get('build_id', 'unknown')}.json"

    try:
        if log_file.exists():
            log = json.loads(log_file.read_text())
        else:
            log = {"handoffs": []}

        log["handoffs"].append({
            "timestamp": datetime.now().isoformat(),
            "skill": skill_name,
            "shared_decisions_applied": list(shared_decisions.keys()),
            "mode": mode
        })

        log_file.write_text(json.dumps(log, indent=2))
    except Exception:
        pass

    # Build context about orchestration
    context_parts = [f"""
## Orchestrated Workflow

This workflow is part of a larger build: **{build_state.get('build_id')}**

### Pre-Filled Decisions (from orchestrator):
{json.dumps(shared_decisions, indent=2)}

These decisions are already applied. **Do not re-ask** questions about:
{', '.join(shared_decisions.keys())}

Only ask workflow-specific questions not covered above.
"""]

    # Check for project_spec and inject relevant portion
    project_spec = build_state.get("project_spec", {})
    extracted = project_spec.get("extracted", {})

    if extracted:
        # Try to find the relevant spec for this workflow
        relevant_spec = None
        spec_type = None

        # Get the element name from tool input
        try:
            data = json.loads(tool_input)
            args = data.get("args", "")
            element_name = args.split()[0] if args else ""
        except Exception:
            element_name = ""

        # Search in extracted elements
        for api in extracted.get("apis", []):
            if api.get("name", "").lower() == element_name.lower():
                relevant_spec = api
                spec_type = "API"
                break

        if not relevant_spec:
            for comp in extracted.get("components", []):
                if comp.get("name", "").lower() == element_name.lower():
                    relevant_spec = comp
                    spec_type = "Component"
                    break

        if not relevant_spec:
            for page in extracted.get("pages", []):
                if page.get("name", "").lower() == element_name.lower():
                    relevant_spec = page
                    spec_type = "Page"
                    break

        # Inject relevant spec if found
        if relevant_spec:
            context_parts.append(f"""
### Project Spec ({spec_type})

This element was extracted from the project document. Use this as the primary source of truth:

```json
{json.dumps(relevant_spec, indent=2)}
```

**Important:** Implement according to this specification. If you need to deviate, ask the user first.
""")

        # Also inject high-level summary if available
        summary = extracted.get("summary", "")
        if summary:
            context_parts.append(f"""
### Project Summary

{summary}
""")

        # Inject related elements for context
        uses_apis = relevant_spec.get("uses_apis", []) if relevant_spec else []
        uses_components = relevant_spec.get("uses_components", []) if relevant_spec else []

        if uses_apis or uses_components:
            context_parts.append(f"""
### Related Elements

This element depends on:
- APIs: {', '.join(uses_apis) if uses_apis else 'none'}
- Components: {', '.join(uses_components) if uses_components else 'none'}

Ensure types and interfaces align with these dependencies.
""")

    context = "\n".join(context_parts)

    result = {
        "continue": True,
        "additionalContext": context
    }

    print(json.dumps(result))


if __name__ == "__main__":
    main()
