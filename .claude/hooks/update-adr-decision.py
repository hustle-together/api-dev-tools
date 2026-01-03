#!/usr/bin/env python3
"""
ADR Decision Updater Hook

Updates Architecture Decision Records when user makes a decision during interview.
Changes status from PROPOSED to ACCEPTED and records the decision with reasoning.

Hook Type: PostToolUse (matcher: AskUserQuestion)

Flow:
1. Interview phase presents options to user (referencing ADR)
2. User selects an option
3. Hook detects the answer relates to a PROPOSED ADR
4. Updates ADR with decision, reasoning, and consequences
5. Updates registry with decision
"""

import json
import os
import re
from datetime import datetime
from pathlib import Path


def load_config():
    """Load ADR configuration"""
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")

    config_file = Path(project_dir) / ".claude" / "hustle-build-defaults.json"
    if config_file.exists():
        try:
            config = json.loads(config_file.read_text())
            return config.get("adr", {})
        except Exception:
            pass

    return {"enabled": True}


def load_registry():
    """Load current registry"""
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")
    registry_file = Path(project_dir) / ".claude" / "registry.json"

    if registry_file.exists():
        try:
            return json.loads(registry_file.read_text())
        except Exception:
            pass
    return {}


def save_registry(registry):
    """Save registry"""
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")
    registry_file = Path(project_dir) / ".claude" / "registry.json"
    registry_file.parent.mkdir(parents=True, exist_ok=True)
    registry_file.write_text(json.dumps(registry, indent=2))


def find_matching_adr(question_text, answer_text, registry):
    """
    Find a PROPOSED ADR that matches the question/answer.
    Matches based on category keywords in question and answer options.
    """
    adrs = registry.get("adrs", {})

    for adr_key, adr in adrs.items():
        if adr.get("status") != "proposed":
            continue

        category = adr.get("category", "")
        options = adr.get("options_considered", [])

        # Check if question mentions the category
        if category.lower() in question_text.lower():
            # Check if answer matches one of the options
            for opt in options:
                if opt.lower() in answer_text.lower():
                    return adr_key, adr, opt

        # Check if answer directly matches an option
        for opt in options:
            if opt.lower() in answer_text.lower():
                # Verify category is relevant to question
                category_keywords = {
                    "database": ["database", "storage", "data", "db"],
                    "auth": ["auth", "authentication", "login", "security"],
                    "cache": ["cache", "caching", "performance"],
                    "hosting": ["host", "deploy", "platform"],
                    "state": ["state", "store", "management"],
                    "styling": ["style", "css", "design", "ui"],
                }
                keywords = category_keywords.get(category, [category])
                if any(kw in question_text.lower() for kw in keywords):
                    return adr_key, adr, opt

    return None, None, None


def update_adr_file(adr, decision):
    """Update the ADR markdown file with the decision"""
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")
    adr_file = Path(project_dir) / adr.get("file", "")

    if not adr_file.exists():
        return False

    content = adr_file.read_text()

    # Update status
    content = re.sub(
        r"\*\*Status:\*\* PROPOSED",
        "**Status:** ACCEPTED",
        content
    )

    # Update decision section
    decision_section = f"""## Decision

We will use **{decision.title()}** based on user selection during interview.

**Reasoning:** User prioritized this option based on project requirements.
"""

    content = re.sub(
        r"## Decision\n\n_Pending user selection during interview phase\._",
        decision_section,
        content
    )

    # Update consequences section
    consequences_section = f"""## Consequences

### Positive
- Decision has been made, enabling implementation to proceed
- Choice aligns with user's stated requirements

### Negative
- Alternative options were not selected (may revisit if requirements change)

### Implementation Notes
- Proceed with {decision.title()} integration
- Update environment variables as needed
- Follow {decision.title()} best practices
"""

    content = re.sub(
        r"## Consequences\n\n_To be documented after decision is made\._",
        consequences_section,
        content
    )

    # Add decision timestamp
    content = content.replace(
        "_This ADR was auto-generated during research.",
        f"_Decision recorded: {datetime.now().strftime('%Y-%m-%d %H:%M')}_\n\n_This ADR was auto-generated during research."
    )

    adr_file.write_text(content)
    return True


def main():
    # Get tool info
    tool_name = os.environ.get("CLAUDE_TOOL_NAME", "")
    tool_output = os.environ.get("CLAUDE_TOOL_OUTPUT", "")
    tool_input = os.environ.get("CLAUDE_TOOL_INPUT", "{}")

    # Only process AskUserQuestion results
    if tool_name != "AskUserQuestion":
        print(json.dumps({"continue": True}))
        return

    # Load config
    config = load_config()
    if not config.get("enabled", True):
        print(json.dumps({"continue": True}))
        return

    # Parse question and answer
    try:
        input_data = json.loads(tool_input)
        questions = input_data.get("questions", [])
        if not questions:
            print(json.dumps({"continue": True}))
            return

        question_text = questions[0].get("question", "")
    except Exception:
        question_text = ""

    # The answer is in tool_output
    answer_text = tool_output

    if not question_text or not answer_text:
        print(json.dumps({"continue": True}))
        return

    # Load registry and find matching ADR
    registry = load_registry()
    adr_key, adr, decision = find_matching_adr(question_text, answer_text, registry)

    if not adr_key:
        print(json.dumps({"continue": True}))
        return

    # Update ADR file
    update_adr_file(adr, decision)

    # Update registry
    registry["adrs"][adr_key]["status"] = "accepted"
    registry["adrs"][adr_key]["decision"] = decision
    registry["adrs"][adr_key]["phase"] = "interview"
    registry["adrs"][adr_key]["decided_at"] = datetime.now().isoformat()
    save_registry(registry)

    # Notify about ADR update
    result = {
        "continue": True,
        "additionalContext": f"""## ADR Updated

**ADR-{adr.get('number', 0):04d}: {adr.get('title', '')}** has been updated.

- **Status:** PROPOSED → ACCEPTED
- **Decision:** {decision.title()}
- **File:** {adr.get('file', '')}

This decision is now recorded for future reference.
"""
    }
    print(json.dumps(result))


if __name__ == "__main__":
    main()
