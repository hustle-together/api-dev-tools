#!/usr/bin/env python3
"""
Auto-Answer Bot for Test Orchestration

Monitors .claude/current-question.json in test directory and automatically
answers questions by writing to .claude/pending-answer.json.

This enables autonomous testing by auto-selecting "comprehensive" options
without manual intervention.

Usage:
    python test-auto-answer-bot.py <test_directory>

Example:
    python test-auto-answer-bot.py ~/test-api-dev-tools-auto

Version: 1.0.0
"""

import json
import sys
import time
from pathlib import Path
from datetime import datetime

# Configuration
POLL_INTERVAL = 2  # seconds
MAX_WAIT_TIME = 3600  # 1 hour max
AFFIRMATIVE_KEYWORDS = [
    "comprehensive", "all", "yes", "proceed", "continue",
    "recommended", "auto", "defaults", "use auto", "use defaults"
]


def find_best_answer(question_data):
    """
    Find the best answer for a question.

    Strategy:
    1. Look for options with affirmative keywords (comprehensive, all, yes, etc.)
    2. If multiple match, prefer first one
    3. If none match, select first option

    Args:
        question_data: Parsed question data from current-question.json

    Returns:
        dict: Answer data with selected option
    """
    questions = question_data.get("questions", [])

    if not questions:
        return None

    # For now, handle first question (can extend to handle multiple)
    first_q = questions[0]
    options = first_q.get("options", [])

    if not options:
        return None

    # Find option with affirmative keyword
    selected_index = 0
    selected_label = None

    for i, opt in enumerate(options):
        label = opt.get("label", "") if isinstance(opt, dict) else str(opt)
        label_lower = label.lower()

        # Check for affirmative keywords
        for keyword in AFFIRMATIVE_KEYWORDS:
            if keyword in label_lower:
                selected_index = i
                selected_label = label
                break

        if selected_label:
            break

    # If no affirmative found, use first option
    if not selected_label:
        first_opt = options[0]
        selected_label = first_opt.get("label", "") if isinstance(first_opt, dict) else str(first_opt)

    return {
        "question_id": first_q.get("id", "question"),
        "question": first_q.get("question", ""),
        "header": first_q.get("header", "Question"),
        "answer": selected_label,
        "option_index": selected_index,
        "phase": question_data.get("phase", "unknown"),
        "status": "submitted",
        "submitted_at": datetime.now().isoformat(),
        "auto_answered": True,
        "answers": {
            first_q.get("header", "Question"): selected_label
        }
    }


def watch_and_answer(test_dir):
    """
    Watch for questions and auto-answer them.

    Args:
        test_dir: Path to test directory
    """
    test_path = Path(test_dir).expanduser()
    question_file = test_path / ".claude" / "current-question.json"
    answer_file = test_path / ".claude" / "pending-answer.json"

    print(f"Auto-Answer Bot started")
    print(f"Monitoring: {question_file}")
    print(f"Writing answers to: {answer_file}")
    print(f"Poll interval: {POLL_INTERVAL}s")
    print()

    start_time = time.time()
    answered_count = 0

    while True:
        # Check timeout
        if time.time() - start_time > MAX_WAIT_TIME:
            print(f"Max wait time ({MAX_WAIT_TIME}s) exceeded. Exiting.")
            break

        # Check for question
        if question_file.exists():
            try:
                # Read question
                question_data = json.loads(question_file.read_text())

                # Skip if already answered recently
                if answer_file.exists():
                    answer_data = json.loads(answer_file.read_text())
                    answer_time = answer_data.get("submitted_at", "")
                    question_time = question_data.get("created_at", "")

                    # If answer is newer than question, skip
                    if answer_time > question_time:
                        time.sleep(POLL_INTERVAL)
                        continue

                # Find best answer
                answer_data = find_best_answer(question_data)

                if answer_data:
                    # Write answer
                    answer_file.parent.mkdir(parents=True, exist_ok=True)
                    answer_file.write_text(json.dumps(answer_data, indent=2))

                    answered_count += 1
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] Answered question #{answered_count}")
                    print(f"  Question: {answer_data.get('question', '')[:80]}...")
                    print(f"  Answer: {answer_data.get('answer', '')}")
                    print(f"  Phase: {answer_data.get('phase', 'unknown')}")
                    print()

                    # Clear the question file
                    question_file.unlink()

            except Exception as e:
                print(f"Error processing question: {e}")

        time.sleep(POLL_INTERVAL)

    print(f"Bot finished. Answered {answered_count} questions.")


def main():
    if len(sys.argv) < 2:
        print("Usage: python test-auto-answer-bot.py <test_directory>")
        print()
        print("Example:")
        print("  python test-auto-answer-bot.py ~/test-api-dev-tools-auto")
        sys.exit(1)

    test_dir = sys.argv[1]
    watch_and_answer(test_dir)


if __name__ == "__main__":
    main()
