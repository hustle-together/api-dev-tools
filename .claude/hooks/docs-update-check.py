#!/usr/bin/env python3
"""
Documentation Update Check Hook

Triggers after significant file changes to remind about documentation updates.
Runs on PostToolUse for Write/Edit operations.

Hook Type: PostToolUse
Tools: Write, Edit
"""

import json
import os
import sys
from pathlib import Path

# Import hook utilities
try:
    from hook_utils import is_source_repository
except ImportError:
    def is_source_repository():
        return Path(".git").exists() and Path("package.json").exists() and \
               "api-dev-tools" in Path("package.json").read_text()

def get_tool_input():
    """Parse tool input from environment."""
    tool_input = os.environ.get("TOOL_INPUT", "{}")
    try:
        return json.loads(tool_input)
    except json.JSONDecodeError:
        return {}

def get_file_category(file_path: str) -> str | None:
    """Categorize file by type for doc update needs."""
    path = Path(file_path)

    if ".skills/" in file_path and file_path.endswith("SKILL.md"):
        return "skill"
    if "hooks/" in file_path and file_path.endswith(".py"):
        return "hook"
    if ".claude/agents/" in file_path and file_path.endswith(".md"):
        return "agent"
    if "docs/" in file_path and file_path.endswith(".md"):
        return "doc"
    if "templates/" in file_path and file_path.endswith(".tsx"):
        return "template"
    if file_path.endswith("registry.json"):
        return "registry"

    return None

def check_needs_doc_update(file_path: str) -> dict:
    """Check if file change needs documentation update."""
    category = get_file_category(file_path)

    if not category:
        return {"needs_update": False}

    updates_needed = []

    if category == "skill":
        skill_name = Path(file_path).parent.name
        updates_needed.append(f"docs/SKILLS.md - Add {skill_name} skill")
        updates_needed.append(f"README.md - Update skills count if new")
        updates_needed.append(f"CHANGELOG.md - Add entry for new skill")

    elif category == "hook":
        hook_name = Path(file_path).stem
        updates_needed.append(f"docs/HOOKS.md - Add {hook_name} hook")
        updates_needed.append(f"README.md - Update hooks count if new")

    elif category == "agent":
        agent_name = Path(file_path).stem
        updates_needed.append(f"docs/AGENTS.md - Add {agent_name} agent")
        updates_needed.append(f"README.md - Update agents count if new")

    elif category == "doc":
        doc_name = Path(file_path).name
        updates_needed.append(f"README.md - Link to {doc_name} in Documentation section")

    elif category == "template":
        template_name = Path(file_path).stem
        updates_needed.append(f"Consider dashboard integration for {template_name}")

    elif category == "registry":
        updates_needed.append("Check if new registry sections need documentation")

    return {
        "needs_update": len(updates_needed) > 0,
        "category": category,
        "file": file_path,
        "updates_needed": updates_needed
    }

def main():
    # Skip if in source repository (we're building the tool itself)
    if is_source_repository():
        # Even in source, we want reminders - just softer ones
        pass

    tool_input = get_tool_input()
    file_path = tool_input.get("file_path", "")

    if not file_path:
        return

    result = check_needs_doc_update(file_path)

    if result["needs_update"]:
        # Output reminder (shown to user)
        print(f"\n📝 Documentation Update Reminder")
        print(f"   File: {result['file']}")
        print(f"   Category: {result['category']}")
        print(f"\n   Consider updating:")
        for update in result["updates_needed"]:
            print(f"   • {update}")
        print(f"\n   Run /docs-update to auto-check all documentation.\n")

if __name__ == "__main__":
    main()
