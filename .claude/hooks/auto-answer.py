#!/usr/bin/env python3
"""
Auto-answer hook for --auto mode.

This hook intercepts AskUserQuestion calls when running in auto-mode
and either:
1. Uses pre-configured defaults from hustle-build-defaults.json
2. Spawns a Haiku sub-agent to pick the most comprehensive option

Hook Type: PreToolUse (matcher: AskUserQuestion)

Updated in v4.5.0:
  - Use shared hook_utils for logging
  - Log all auto-answered questions to workflow logs
"""

import json
import os
import sys
from pathlib import Path

# Import shared utilities
try:
    from hook_utils import log_workflow_event
    UTILS_AVAILABLE = True
except ImportError:
    UTILS_AVAILABLE = False


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

    # Check project-specific defaults first
    defaults_file = Path(project_dir) / ".claude" / "hustle-build-defaults.json"
    if defaults_file.exists():
        try:
            return json.loads(defaults_file.read_text())
        except Exception:
            pass

    # Fall back to template defaults
    template_defaults = Path(project_dir) / "templates" / "hustle-build-defaults.json"
    if template_defaults.exists():
        try:
            return json.loads(template_defaults.read_text())
        except Exception:
            pass

    return {}


def is_autonomous_enabled():
    """Check if autonomous mode is enabled by default in settings"""
    defaults = load_defaults()
    autonomous = defaults.get("autonomous", {})
    return autonomous.get("enabled", False) and autonomous.get("skip_interviews", False)


def find_comprehensive_option(options):
    """
    Find the most comprehensive option based on keywords.

    Comprehensive options typically include words like:
    - "all", "full", "complete", "comprehensive"
    - Higher numbers (e.g., "100%" vs "50%")
    - More features listed

    Also prioritizes affirmative options for phase exits:
    - "yes", "proceed", "continue", "approve", "confirm"
    """
    if not options:
        return None

    comprehensive_keywords = [
        "all", "full", "complete", "comprehensive", "everything",
        "maximum", "extensive", "detailed", "thorough", "wcag-aa"
    ]

    # Affirmative keywords for phase exit questions
    affirmative_keywords = [
        "yes", "proceed", "continue", "approve", "confirm",
        "accept", "ready", "go ahead", "move forward",
        "auto", "defaults", "use auto", "use defaults"
    ]

    # Negative keywords to avoid
    negative_keywords = [
        "no", "skip", "cancel", "stop", "more research", "not ready"
    ]

    # Score each option
    scored = []
    for i, opt in enumerate(options):
        label = opt.get("label", "").lower()
        description = opt.get("description", "").lower()
        text = f"{label} {description}"

        score = 0

        # Check for negative keywords first (penalize heavily)
        for keyword in negative_keywords:
            if keyword in text:
                score -= 50

        # Check for comprehensive keywords
        for keyword in comprehensive_keywords:
            if keyword in text:
                score += 10

        # Check for affirmative keywords (high priority for phase exits)
        for keyword in affirmative_keywords:
            if keyword in text:
                score += 25

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

    # Check if in auto mode (explicit flag OR defaults enabled)
    state, state_type = load_state()
    autonomous_by_default = is_autonomous_enabled()

    if not state and not autonomous_by_default:
        # Not in auto mode and autonomous not enabled, continue normally
        print(json.dumps({"continue": True}))
        return

    # If no state but autonomous is enabled, create a minimal state
    if not state and autonomous_by_default:
        state = {"mode": "auto", "source": "defaults"}

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

        # Get the first question and answer for display
        first_question = questions[0] if questions else {}
        header = first_question.get("header", "Question")
        question_text = first_question.get("question", "")
        answer = list(answers.values())[0] if answers else "Unknown"

        # BLOCK the tool and provide the answer in the reason
        # This prevents the question UI from showing and tells the AI to use this answer
        result = {
            "continue": False,
            "reason": f"""## 🤖 Auto-Selected

**{header}:** {answer}

_Question: {question_text}_

---

Autonomous mode is active. The workflow will proceed with this answer.

To review auto-selected answers: `.claude/workflow-logs/`
To disable: Set `autonomous.enabled: false` in `.claude/hustle-build-defaults.json`
"""
        }
        print(json.dumps(result))
    else:
        print(json.dumps({"continue": True}))


def log_auto_answer(state, questions, answers):
    """Log auto-answered questions to workflow log using shared utility (v4.5.0)"""
    # Use shared utility if available
    if UTILS_AVAILABLE:
        try:
            log_workflow_event("auto_answer", {
                "questions": [q.get("question") for q in questions],
                "headers": [q.get("header") for q in questions],
                "answers": answers,
                "reason": "auto-comprehensive",
                "mode": state.get("mode", "auto") if state else "auto"
            })
            return
        except Exception:
            pass

    # Fallback to legacy logging
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")
    logs_dir = Path(project_dir) / ".claude" / "workflow-logs"
    logs_dir.mkdir(parents=True, exist_ok=True)

    build_id = state.get("build_id", state.get("workflow_id", "unknown")) if state else "unknown"
    log_file = logs_dir / f"{build_id}.json"

    try:
        if log_file.exists():
            log = json.loads(log_file.read_text())
        else:
            log = {"auto_answers": [], "events": []}

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
