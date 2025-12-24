#!/usr/bin/env python3
"""
Hook: PreToolUse for Write/Edit (and Stop)
Purpose: Block completion until documentation confirmed WITH USER REVIEW

Phase 21 (Documentation) requires:
  1. Update api-tests-manifest.json
  2. Cache research to .claude/research/
  3. Update OpenAPI spec if applicable
  4. SHOW documentation checklist to user
  5. USE AskUserQuestion: "Documentation complete? [Y/n]"
  6. Only allow completion when user confirms

Returns:
  - {"permissionDecision": "allow"} - Let the tool run
  - {"permissionDecision": "deny", "reason": "..."} - Block with explanation
"""
import json
import sys
from pathlib import Path

STATE_FILE = Path(__file__).parent.parent / "api-dev-state.json"


def main():
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        print(json.dumps({"permissionDecision": "allow"}))
        sys.exit(0)

    tool_input = input_data.get("tool_input", {})
    file_path = tool_input.get("file_path", "")

    # Only enforce for documentation files or when trying to mark workflow complete
    is_manifest = "api-tests-manifest.json" in file_path
    is_openapi = "openapi" in file_path.lower() and file_path.endswith((".json", ".yaml", ".yml"))
    is_readme = file_path.endswith("README.md") and "/api/" in file_path

    # Also check for state file updates (marking complete)
    is_state_update = "api-dev-state.json" in file_path

    if not is_manifest and not is_openapi and not is_readme and not is_state_update:
        print(json.dumps({"permissionDecision": "allow"}))
        sys.exit(0)

    if not STATE_FILE.exists():
        print(json.dumps({"permissionDecision": "allow"}))
        sys.exit(0)

    try:
        state = json.loads(STATE_FILE.read_text())
    except json.JSONDecodeError:
        print(json.dumps({"permissionDecision": "allow"}))
        sys.exit(0)

    endpoint = state.get("endpoint", "unknown")
    phases = state.get("phases", {})
    tdd_refactor = phases.get("tdd_refactor", {})
    documentation = phases.get("documentation", {})

    # Only enforce after refactor is complete
    if tdd_refactor.get("status") != "complete":
        # Allow documentation updates during development
        print(json.dumps({"permissionDecision": "allow"}))
        sys.exit(0)

    status = documentation.get("status", "not_started")

    phase_exit_confirmed = documentation.get("phase_exit_confirmed", False)

    if status != "complete" or not phase_exit_confirmed:
        user_question_asked = documentation.get("user_question_asked", False)
        user_confirmed = documentation.get("user_confirmed", False)
        checklist_shown = documentation.get("checklist_shown", False)
        manifest_updated = documentation.get("manifest_updated", False)
        research_cached = documentation.get("research_cached", False)
        openapi_updated = documentation.get("openapi_updated", False)

        missing = []
        if not manifest_updated:
            missing.append("api-tests-manifest.json not updated")
        if not research_cached:
            missing.append("Research not cached to .claude/research/")
        if not checklist_shown:
            missing.append("Documentation checklist not shown to user")
        if not user_question_asked:
            missing.append("User confirmation question (AskUserQuestion not used)")
        if not user_confirmed:
            missing.append("User hasn't confirmed documentation complete")
        if not phase_exit_confirmed:
            missing.append("Phase exit confirmation (user must explicitly approve to complete)")

        print(json.dumps({
            "permissionDecision": "deny",
            "reason": f"""❌ BLOCKED: Documentation (Phase 21) not complete.

Status: {status}
Manifest updated: {manifest_updated}
Research cached: {research_cached}
OpenAPI updated: {openapi_updated}
Checklist shown: {checklist_shown}
User question asked: {user_question_asked}
User confirmed: {user_confirmed}
Phase exit confirmed: {phase_exit_confirmed}

MISSING:
{chr(10).join(f"  • {m}" for m in missing)}

═══════════════════════════════════════════════════════════
⚠️  GET USER CONFIRMATION FOR DOCUMENTATION
═══════════════════════════════════════════════════════════

REQUIRED STEPS:

1. Update api-tests-manifest.json with:
   • Endpoint path, method, description
   • Request/response schemas
   • Test coverage info
   • Code examples
   • Testing notes

2. Cache research to .claude/research/{endpoint}/:
   • sources.json - URLs and summaries
   • interview.json - User decisions
   • schema.json - Final Zod schemas

3. Update OpenAPI spec (if applicable):
   • Add endpoint definition
   • Document parameters
   • Document responses

4. SHOW documentation checklist to user:
   ┌───────────────────────────────────────────────────────┐
   │ DOCUMENTATION CHECKLIST                               │
   │                                                       │
   │ ✓ api-tests-manifest.json                            │
   │   • Added {endpoint} entry                           │
   │   • 8 test scenarios documented                       │
   │   • Code examples included                            │
   │                                                       │
   │ ✓ Research Cache                                      │
   │   • .claude/research/{endpoint}/sources.json         │
   │   • .claude/research/{endpoint}/interview.json       │
   │                                                       │
   │ {'✓' if openapi_updated else '⏭'} OpenAPI Spec                                       │
   │   • {'Updated' if openapi_updated else 'Skipped (internal API)'}                                       │
   │                                                       │
   │ All documentation complete? [Y]                       │
   │ Need to add something? [n] ____                       │
   └───────────────────────────────────────────────────────┘

5. USE AskUserQuestion:
   question: "Documentation checklist complete?"
   options: [
     {{"value": "confirm", "label": "Yes, all documentation is done"}},
     {{"value": "add", "label": "No, I need to add [what]"}},
     {{"value": "skip", "label": "Skip docs for now (not recommended)"}}
   ]

6. If user says "add":
   • Ask what documentation is missing
   • Update the relevant files
   • LOOP BACK and show updated checklist

7. If user says "confirm":
   • Set documentation.user_confirmed = true
   • Set documentation.user_question_asked = true
   • Set documentation.checklist_shown = true
   • Set documentation.manifest_updated = true
   • Set documentation.research_cached = true
   • Set documentation.status = "complete"
   • Mark entire workflow as complete!

WHY: Documentation ensures next developer (or future Claude) has context."""
        }))
        sys.exit(0)

    # Documentation complete
    print(json.dumps({
        "permissionDecision": "allow",
        "message": f"""✅ Documentation complete for {endpoint}.
Manifest updated: {manifest_updated}
Research cached: {research_cached}
OpenAPI updated: {openapi_updated}
User confirmed documentation is complete."""
    }))
    sys.exit(0)


if __name__ == "__main__":
    main()
