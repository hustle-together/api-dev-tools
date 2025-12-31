#!/usr/bin/env python3
"""
Hook: PostToolUse (for periodic re-grounding)
Purpose: Inject context reminders every N turns to prevent context dilution

This hook tracks turn count and periodically injects a comprehensive summary of:
  - Current endpoint and phase
  - Key decisions from interview
  - Existing registry elements (APIs, components, pages)
  - Deferred features (don't re-suggest)
  - Last test status
  - Brand guide status
  - Research cache status
  - Orchestrator context (if in /hustle-build)

The goal is to keep Claude grounded during long sessions where
the original CLAUDE.md context may get diluted ("lost in the middle").

Based on best practices from:
  - Manus: "Manipulate Attention Through Recitation"
  - Sankalp: "Context as limited attention budget"

Configuration:
  - REGROUND_INTERVAL: Number of turns between re-grounding (default: 7)

Returns:
  - {"continue": true} with optional additionalContext on reground turns
"""
import json
import sys
import os
from datetime import datetime
from pathlib import Path

# Configuration
REGROUND_INTERVAL = 7  # Re-ground every N turns

# State files (in .claude/ directory)
PROJECT_DIR = Path(os.environ.get("CLAUDE_PROJECT_DIR", "."))
STATE_FILE = PROJECT_DIR / ".claude" / "api-dev-state.json"
REGISTRY_FILE = PROJECT_DIR / ".claude" / "registry.json"
BUILD_STATE_FILE = PROJECT_DIR / ".claude" / "hustle-build-state.json"
BRAND_GUIDE_FILE = PROJECT_DIR / ".claude" / "BRAND_GUIDE.md"


def load_json_file(filepath):
    """Safely load a JSON file"""
    if filepath.exists():
        try:
            return json.loads(filepath.read_text())
        except (json.JSONDecodeError, Exception):
            pass
    return None


def format_list(items, max_items=5, max_chars=80):
    """Format a list of items with truncation"""
    if not items:
        return "None"
    truncated = list(items)[:max_items]
    result = ", ".join(str(item)[:20] for item in truncated)
    if len(items) > max_items:
        result += f" (+{len(items) - max_items} more)"
    return result[:max_chars]


def get_registry_summary(registry):
    """Get summary of existing registry elements"""
    if not registry:
        return None

    summary = {}
    # Core elements
    for category in ["apis", "components", "pages", "combined"]:
        items = registry.get(category, {})
        if items:
            summary[category] = list(items.keys())

    # Infrastructure tracking (v1.3.0+)
    routes = registry.get("routes", {})
    if routes and not routes.get("_description"):
        # Has actual routes, not just template
        actual_routes = [k for k in routes.keys() if not k.startswith("_")]
        if actual_routes:
            summary["routes"] = actual_routes

    env_vars = registry.get("env_vars", {})
    if env_vars:
        actual_vars = [k for k in env_vars.keys() if not k.startswith("_")]
        if actual_vars:
            summary["env_vars"] = actual_vars

    services = registry.get("services", {})
    if services:
        actual_services = [k for k in services.keys() if not k.startswith("_")]
        if actual_services:
            summary["services"] = actual_services

    webhooks = registry.get("webhooks", {})
    if webhooks:
        actual_webhooks = [k for k in webhooks.keys() if not k.startswith("_")]
        if actual_webhooks:
            summary["webhooks"] = actual_webhooks

    return summary if summary else None


def get_test_status(state):
    """Get last test run status"""
    test_run = state.get("last_test_run", {})
    if not test_run:
        return None

    passed = test_run.get("passed", 0)
    failed = test_run.get("failed", 0)
    timestamp = test_run.get("timestamp", "")

    if passed or failed:
        return {
            "passed": passed,
            "failed": failed,
            "total": passed + failed,
            "status": "GREEN" if failed == 0 else "RED",
            "timestamp": timestamp
        }
    return None


def get_brand_guide_status():
    """Check if brand guide exists and get key info"""
    if not BRAND_GUIDE_FILE.exists():
        return None

    try:
        content = BRAND_GUIDE_FILE.read_text()
        # Extract key colors if present
        colors = []
        for line in content.split("\n"):
            if "primary" in line.lower() and "#" in line:
                colors.append("primary found")
                break
        return {"exists": True, "has_colors": len(colors) > 0}
    except Exception:
        return {"exists": True}


def get_orchestrator_status(build_state):
    """Get orchestrator build status if active"""
    if not build_state:
        return None

    status = build_state.get("status")
    if status not in ["in_progress", "paused"]:
        return None

    build_id = build_state.get("build_id", "unknown")
    decomposition = build_state.get("decomposition", {})

    total = 0
    completed = 0
    for wf_type in ["apis", "components", "combined_apis", "pages"]:
        workflows = decomposition.get(wf_type, [])
        total += len(workflows)
        completed += len([w for w in workflows if w.get("status") == "complete"])

    active = build_state.get("active_sub_workflow", {})

    return {
        "build_id": build_id,
        "progress": f"{completed}/{total}",
        "active_type": active.get("type", "none"),
        "active_name": active.get("name", "none")
    }


def build_reground_context(state, turn_count):
    """Build comprehensive re-grounding context"""
    parts = []
    parts.append(f"## Re-Grounding Reminder (Turn {turn_count})")
    parts.append("")

    # === Current Workflow ===
    endpoint = state.get("endpoint", "unknown")
    parts.append(f"**Active Endpoint:** `{endpoint}`")

    # Get current phase
    phases = state.get("phases", {})
    phase_order = [
        "disambiguation", "scope", "research_initial", "interview",
        "research_deep", "schema_creation", "environment_check",
        "tdd_red", "tdd_green", "verify", "code_review", "tdd_refactor",
        "documentation", "completion"
    ]

    current_phase = None
    completed_phases = []
    for phase_name in phase_order:
        phase = phases.get(phase_name, {})
        status = phase.get("status", "not_started")
        if status == "complete":
            completed_phases.append(phase_name)
        elif status == "in_progress" and not current_phase:
            current_phase = phase_name

    if not current_phase:
        for phase_name in phase_order:
            phase = phases.get(phase_name, {})
            if phase.get("status", "not_started") == "not_started":
                current_phase = phase_name
                break

    parts.append(f"**Current Phase:** {current_phase or 'completion'}")
    parts.append(f"**Completed:** {len(completed_phases)}/{len(phase_order)} phases")

    # === Key Decisions ===
    interview = phases.get("interview", {})
    decisions = interview.get("decisions", {})
    if decisions:
        parts.append("")
        parts.append("**Key Decisions:**")
        for key, value in list(decisions.items())[:5]:
            response = value.get("value", value.get("response", "N/A"))
            if response:
                parts.append(f"  - {key}: {str(response)[:40]}")

    # === Registry Summary ===
    registry = load_json_file(REGISTRY_FILE)
    registry_summary = get_registry_summary(registry)
    if registry_summary:
        parts.append("")
        parts.append("**Existing Elements (don't recreate):**")
        if registry_summary.get("apis"):
            parts.append(f"  - APIs: {format_list(registry_summary['apis'])}")
        if registry_summary.get("components"):
            parts.append(f"  - Components: {format_list(registry_summary['components'])}")
        if registry_summary.get("pages"):
            parts.append(f"  - Pages: {format_list(registry_summary['pages'])}")
        if registry_summary.get("routes"):
            parts.append(f"  - Routes: {format_list(registry_summary['routes'])}")

    # === Infrastructure Awareness ===
    if registry_summary:
        if registry_summary.get("services"):
            parts.append("")
            parts.append(f"**External Services:** {format_list(registry_summary['services'])}")
        if registry_summary.get("webhooks"):
            parts.append(f"**Webhooks:** {format_list(registry_summary['webhooks'])}")
        if registry_summary.get("env_vars"):
            parts.append(f"**Env Vars Tracked:** {len(registry_summary['env_vars'])} variables")

    # === Deferred Features ===
    deferred = state.get("deferred_features", [])
    if deferred:
        parts.append("")
        parts.append(f"**Deferred (don't re-suggest):** {format_list(deferred, max_items=3)}")

    # === Test Status ===
    test_status = get_test_status(state)
    if test_status:
        parts.append("")
        status_emoji = "GREEN" if test_status["status"] == "GREEN" else "RED"
        parts.append(f"**Last Tests:** {status_emoji} ({test_status['passed']} passed, {test_status['failed']} failed)")

    # === Brand Guide ===
    brand_status = get_brand_guide_status()
    if brand_status and brand_status.get("exists"):
        parts.append("")
        parts.append("**Brand Guide:** Active - use `.claude/BRAND_GUIDE.md` for styling")

    # === Research Freshness ===
    research_index = state.get("research_index", {})
    if endpoint in research_index:
        entry = research_index[endpoint]
        days_old = entry.get("days_old", 0)
        if days_old > 7:
            parts.append("")
            parts.append(f"**WARNING:** Research is {days_old} days old. Consider `/api-research`.")

    # === Orchestrator Context ===
    build_state = load_json_file(BUILD_STATE_FILE)
    orchestrator = get_orchestrator_status(build_state)
    if orchestrator:
        parts.append("")
        parts.append(f"**Orchestrated Build:** {orchestrator['build_id']}")
        parts.append(f"  - Progress: {orchestrator['progress']} workflows")
        parts.append(f"  - Active: [{orchestrator['active_type']}] {orchestrator['active_name']}")

    # === Quick Reminders ===
    parts.append("")
    parts.append("**Remember:** Research-first | Questions FROM findings | Verify after green")

    return "\n".join(parts)


def main():
    # Read hook input from stdin
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        print(json.dumps({"continue": True}))
        sys.exit(0)

    # Check if state file exists
    if not STATE_FILE.exists():
        print(json.dumps({"continue": True}))
        sys.exit(0)

    try:
        state = json.loads(STATE_FILE.read_text())
    except json.JSONDecodeError:
        print(json.dumps({"continue": True}))
        sys.exit(0)

    # Increment turn count
    turn_count = state.get("turn_count", 0) + 1
    state["turn_count"] = turn_count
    state["last_turn_timestamp"] = datetime.now().isoformat()

    # Check if we should re-ground
    should_reground = turn_count % REGROUND_INTERVAL == 0

    if should_reground and state.get("endpoint"):
        # Build comprehensive re-grounding context
        context = build_reground_context(state, turn_count)

        # Add to reground history
        reground_history = state.setdefault("reground_history", [])
        reground_history.append({
            "turn": turn_count,
            "timestamp": datetime.now().isoformat(),
            "phase": state.get("phases", {}).get("current_phase", "unknown")
        })
        # Keep only last 10 reground events
        state["reground_history"] = reground_history[-10:]

        # Save state
        STATE_FILE.write_text(json.dumps(state, indent=2))

        # Output with context injection
        output = {
            "continue": True,
            "hookSpecificOutput": {
                "hookEventName": "PostToolUse",
                "additionalContext": context
            }
        }
        print(json.dumps(output))
    else:
        # Just update turn count and continue
        STATE_FILE.write_text(json.dumps(state, indent=2))
        print(json.dumps({"continue": True}))

    sys.exit(0)


if __name__ == "__main__":
    main()
