#!/usr/bin/env python3
"""
Auto-answer hook for --auto mode.

This hook intercepts AskUserQuestion calls when running in auto-mode
and either:
1. Uses pre-configured defaults from hustle-build-defaults.json
2. Spawns a Haiku sub-agent to pick the most comprehensive option

Hook Type: PreToolUse (matcher: AskUserQuestion)
"""

import json
import os
import sys
from pathlib import Path


def load_state():
    """Load workflow state to check if in auto mode"""
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")

    # Check hustle-build state first
    build_state = Path(project_dir) / ".claude" / "hustle-build-state.json"
    if build_state.exists():
        try:
            state = json.loads(build_state.read_text())
            if state.get("mode") == "auto":
                return state, "build"
        except Exception:
            pass

    # Check api-dev state
    api_state = Path(project_dir) / ".claude" / "api-dev-state.json"
    if api_state.exists():
        try:
            state = json.loads(api_state.read_text())
            if state.get("mode") == "auto":
                return state, "workflow"
        except Exception:
            pass

    return None, None


def load_defaults():
    """Load pre-configured default answers"""
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")
    defaults_file = Path(project_dir) / ".claude" / "hustle-build-defaults.json"

    if defaults_file.exists():
        try:
            return json.loads(defaults_file.read_text())
        except Exception:
            pass

    return {}


def find_comprehensive_option(options):
    """
    Find the most comprehensive option based on keywords.

    Comprehensive options typically include words like:
    - "all", "full", "complete", "comprehensive"
    - Higher numbers (e.g., "100%" vs "50%")
    - More features listed
    """
    if not options:
        return None

    comprehensive_keywords = [
        "all", "full", "complete", "comprehensive", "everything",
        "maximum", "extensive", "detailed", "thorough", "wcag-aa"
    ]

    # Score each option
    scored = []
    for i, opt in enumerate(options):
        label = opt.get("label", "").lower()
        description = opt.get("description", "").lower()
        text = f"{label} {description}"

        score = 0

        # Check for comprehensive keywords
        for keyword in comprehensive_keywords:
            if keyword in text:
                score += 10

        # Check for "(Recommended)" suffix
        if "recommended" in label.lower():
            score += 20

        # Prefer options with more content (longer descriptions = more features)
        score += len(description) / 50

        scored.append((i, score, opt))

    # Sort by score descending
    scored.sort(key=lambda x: x[1], reverse=True)

    # Return the index of the best option (0-based)
    if scored:
        return scored[0][0]

    return 0  # Default to first option


def get_question_key(questions):
    """Extract a key from the question for lookup in defaults"""
    if not questions or len(questions) == 0:
        return None

    q = questions[0]
    header = q.get("header", "").lower().replace(" ", "_")
    return header


def main():
    # Get tool input from environment
    tool_input = os.environ.get("CLAUDE_TOOL_INPUT", "{}")

    try:
        input_data = json.loads(tool_input)
    except Exception:
        print(json.dumps({"continue": True}))
        return

    # Check if in auto mode
    state, state_type = load_state()

    if not state:
        # Not in auto mode, continue normally
        print(json.dumps({"continue": True}))
        return

    # Load defaults
    defaults = load_defaults()

    questions = input_data.get("questions", [])
    if not questions:
        print(json.dumps({"continue": True}))
        return

    # Try to find pre-configured answer
    question_key = get_question_key(questions)
    answers = {}

    for q in questions:
        header = q.get("header", "")
        options = q.get("options", [])
        question_text = q.get("question", "")

        # Check defaults first
        default_answer = None
        if question_key and question_key in defaults:
            default_answer = defaults[question_key]
        elif header.lower().replace(" ", "_") in defaults:
            default_answer = defaults[header.lower().replace(" ", "_")]

        if default_answer is not None:
            # Use pre-configured default
            answers[question_text] = default_answer
        else:
            # Auto-select comprehensive option
            best_idx = find_comprehensive_option(options)
            if best_idx is not None and options:
                answers[question_text] = options[best_idx].get("label", "")

    if answers:
        # Log the auto-answer
        log_auto_answer(state, questions, answers)

        # Return the auto-selected answers
        # The hook will inject these as if the user selected them
        result = {
            "continue": True,
            "additionalContext": f"""
## Auto-Mode Active

Questions were auto-answered with comprehensive defaults:
{json.dumps(answers, indent=2)}

These selections prioritize:
- Maximum feature coverage
- Full testing
- Comprehensive documentation
- Best practices

Review in `/hustle-build-review` after completion.
"""
        }
        print(json.dumps(result))
    else:
        print(json.dumps({"continue": True}))


def log_auto_answer(state, questions, answers):
    """Log auto-answered questions to build log"""
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")
    logs_dir = Path(project_dir) / ".claude" / "workflow-logs"
    logs_dir.mkdir(parents=True, exist_ok=True)

    build_id = state.get("build_id", state.get("workflow_id", "unknown"))
    log_file = logs_dir / f"{build_id}.json"

    try:
        if log_file.exists():
            log = json.loads(log_file.read_text())
        else:
            log = {"auto_answers": []}

        from datetime import datetime
        log["auto_answers"].append({
            "timestamp": datetime.now().isoformat(),
            "questions": [q.get("question") for q in questions],
            "answers": answers,
            "reason": "auto-comprehensive"
        })

        log_file.write_text(json.dumps(log, indent=2))
    except Exception:
        pass


if __name__ == "__main__":
    main()
