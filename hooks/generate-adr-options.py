#!/usr/bin/env python3
"""
ADR Options Generator Hook (v2.0 - Deep Research)

Automatically creates ADR research REQUESTS when research discovers
multiple options for significant decisions (database, auth, caching, etc.).

Hook Type: PostToolUse (matcher: WebSearch, WebFetch, mcp__context7)

Flow:
1. Research phase discovers options (e.g., "Supabase vs Firebase vs Postgres")
2. Hook detects multiple options for significant decision category
3. Creates RESEARCH REQUEST file (not placeholder ADR)
4. Injects context telling AI to run /adr-deep-research
5. Deep research skill spawns parallel agents to research each option
6. Real ADR with substantive pros/cons is created
7. Interview phase presents these informed options to user
"""

import json
import os
import re
from datetime import datetime
from pathlib import Path


def load_config():
    """Load ADR configuration from hustle-build-defaults.json"""
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")

    # Check project-specific config
    config_file = Path(project_dir) / ".claude" / "hustle-build-defaults.json"
    if config_file.exists():
        try:
            config = json.loads(config_file.read_text())
            return config.get("adr", {})
        except Exception:
            pass

    # Fall back to template
    template_file = Path(project_dir) / "templates" / "hustle-build-defaults.json"
    if template_file.exists():
        try:
            config = json.loads(template_file.read_text())
            return config.get("adr", {})
        except Exception:
            pass

    # Default config
    return {
        "enabled": True,
        "significant_decisions": {
            "database": ["supabase", "firebase", "postgres", "mysql", "mongodb", "sqlite", "planetscale", "neon"],
            "auth": ["api key", "oauth", "jwt", "session", "cookie", "basic auth", "api-key", "bearer"],
            "cache": ["redis", "memcached", "in-memory", "cdn", "edge", "vercel kv"],
            "hosting": ["vercel", "netlify", "aws", "cloudflare", "railway", "render", "fly.io"],
            "state": ["redux", "zustand", "jotai", "context", "mobx", "recoil", "valtio"],
            "styling": ["tailwind", "css modules", "styled-components", "emotion", "vanilla-extract"],
        },
        "min_options_for_adr": 2
    }


def load_state():
    """Load current workflow state"""
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")
    state_file = Path(project_dir) / ".claude" / "api-dev-state.json"

    if state_file.exists():
        try:
            return json.loads(state_file.read_text())
        except Exception:
            pass
    return {}


def get_next_adr_number():
    """Get the next ADR number from existing ADRs"""
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")
    adrs_dir = Path(project_dir) / ".claude" / "adrs"

    if not adrs_dir.exists():
        return 1

    existing = list(adrs_dir.glob("*.md"))
    if not existing:
        return 1

    numbers = []
    for f in existing:
        match = re.match(r"(\d+)-", f.name)
        if match:
            numbers.append(int(match.group(1)))

    return max(numbers, default=0) + 1


def detect_decision_points(content, config):
    """
    Check if research content contains multiple options for significant decisions.
    Returns list of (category, matched_options) tuples.
    """
    if not config.get("enabled", True):
        return []

    significant = config.get("significant_decisions", {})
    min_options = config.get("min_options_for_adr", 2)

    content_lower = content.lower()
    detected = []

    for category, keywords in significant.items():
        matches = [k for k in keywords if k.lower() in content_lower]
        if len(matches) >= min_options:
            detected.append((category, matches))

    return detected


def create_adr_research_request(category, options, context, endpoint):
    """Create a research REQUEST file for deep ADR research.

    Instead of creating a placeholder ADR with empty pros/cons,
    we create a request file that triggers /adr-deep-research skill.
    """
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")
    requests_dir = Path(project_dir) / ".claude" / "adr-requests"
    requests_dir.mkdir(parents=True, exist_ok=True)

    # Check if request already exists for this category
    pending_file = requests_dir / f"pending-{category}.json"
    if pending_file.exists():
        return None  # Already pending

    # Check if ADR already exists for this category
    adrs_dir = Path(project_dir) / ".claude" / "adrs"
    if adrs_dir.exists():
        existing = list(adrs_dir.glob(f"*-{category}-choice.md"))
        if existing:
            return None  # ADR already created

    # Create research request
    request = {
        "category": category,
        "options": options,
        "context": context[:1000] if context else "",
        "endpoint": endpoint,
        "status": "pending",
        "created_at": datetime.now().isoformat(),
        "adr_number": get_next_adr_number()
    }

    pending_file.write_text(json.dumps(request, indent=2))

    return request


def update_registry(adr_number, category, options, endpoint, filename):
    """Add ADR to registry"""
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")
    registry_file = Path(project_dir) / ".claude" / "registry.json"

    if registry_file.exists():
        try:
            registry = json.loads(registry_file.read_text())
        except Exception:
            registry = {}
    else:
        registry = {}

    if "adrs" not in registry:
        registry["adrs"] = {}

    adr_key = f"{adr_number:04d}-{category}-choice"
    registry["adrs"][adr_key] = {
        "number": adr_number,
        "title": f"{category.title()} Choice",
        "status": "proposed",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "phase": "initial_research",
        "endpoint": endpoint,
        "category": category,
        "decision": None,
        "options_considered": options,
        "file": f".claude/adrs/{filename}"
    }

    registry_file.parent.mkdir(parents=True, exist_ok=True)
    registry_file.write_text(json.dumps(registry, indent=2))


def main():
    # Get tool output from environment
    tool_output = os.environ.get("CLAUDE_TOOL_OUTPUT", "")
    tool_name = os.environ.get("CLAUDE_TOOL_NAME", "")

    # Only process research tools
    if tool_name not in ["WebSearch", "WebFetch", "mcp__context7__get-library-docs"]:
        print(json.dumps({"continue": True}))
        return

    # Load config
    config = load_config()
    if not config.get("enabled", True):
        print(json.dumps({"continue": True}))
        return

    # Get current workflow context
    state = load_state()
    current_phase = state.get("current_phase", "")
    endpoint = state.get("current_endpoint", state.get("workflow_id", "unknown"))

    # Only generate ADRs during research phases
    if current_phase not in ["initial_research", "deep_research", ""]:
        print(json.dumps({"continue": True}))
        return

    # Detect decision points in research content
    decision_points = detect_decision_points(tool_output, config)

    if not decision_points:
        print(json.dumps({"continue": True}))
        return

    # Create research requests for each decision point
    created_requests = []
    for category, options in decision_points:
        request = create_adr_research_request(
            category=category,
            options=options,
            context=tool_output[:1000],
            endpoint=endpoint
        )

        if request:
            created_requests.append({
                "category": category,
                "options": options,
                "adr_number": request["adr_number"]
            })

    if created_requests:
        # Build list of research commands to run
        research_commands = "\n".join([
            f"- `/adr-deep-research {r['category']}` - Research {', '.join(r['options'])}"
            for r in created_requests
        ])

        # Build summary of what was detected
        detection_summary = "\n".join([
            f"- **{r['category'].title()}**: {', '.join(r['options'])}"
            for r in created_requests
        ])

        result = {
            "continue": True,
            "additionalContext": f"""## ADR Research Needed

Research discovered significant decision points that require deeper investigation:

{detection_summary}

**Next Step:** Run deep research to get real pros/cons before the interview:

{research_commands}

This will:
1. Spawn parallel research agents (one per option)
2. Fetch official documentation for each technology
3. Extract real pros, cons, pricing, and best-use cases
4. Create a substantive ADR with informed recommendations

The ADR will then be referenced during the interview phase.
"""
        }
        print(json.dumps(result))
    else:
        print(json.dumps({"continue": True}))


if __name__ == "__main__":
    main()
