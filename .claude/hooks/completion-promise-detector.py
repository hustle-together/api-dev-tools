#!/usr/bin/env python3
"""
Completion Promise Detector Hook (Ralph Wiggum Pattern)

Detects when the agent outputs a completion promise signal like:
  <promise>DONE</promise>
  <promise>FIXED</promise>
  <promise>REFACTORED</promise>
  <promise>COMPLETE</promise>

This enables autonomous loops to self-terminate gracefully when work is done,
rather than relying solely on max-iterations safety nets.

Hook Type: PostToolUse (monitors Bash, Write, Edit outputs)
           Stop (allows graceful termination)

References:
- Geoffrey Huntley's Ralph Wiggum Technique: https://ghuntley.com/ralph/
- docs/CLAUDE_CODE_BEST_PRACTICES.md - Section on autonomous loops

Updated in v4.5.0:
  - Add workflow logging for promise_emitted events
  - Add iteration counting and max-iterations enforcement
  - Log phase_transition events
"""

import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

# Import shared utilities for logging and iteration tracking (v4.5.0)
try:
    from hook_utils import (
        log_workflow_event,
        increment_phase_iteration,
        get_phase_iterations
    )
    UTILS_AVAILABLE = True
except ImportError:
    UTILS_AVAILABLE = False

# Completion promise patterns
PROMISE_PATTERNS = [
    r'<promise>(DONE|COMPLETE|FINISHED|SUCCESS)</promise>',
    r'<promise>(FIXED|RESOLVED|SOLVED)</promise>',
    r'<promise>(REFACTORED|CLEANED|IMPROVED)</promise>',
    r'<promise>(TESTED|VERIFIED|VALIDATED)</promise>',
    r'<promise>(DEPLOYED|SHIPPED|RELEASED)</promise>',
    # Custom promises defined in state
]

# State file for tracking promises
STATE_FILE = '.claude/completion-promises.json'


def load_state():
    """Load completion promise state."""
    state_path = Path(STATE_FILE)
    if state_path.exists():
        try:
            return json.loads(state_path.read_text())
        except json.JSONDecodeError:
            pass
    return {
        'active_promise': None,
        'custom_patterns': [],
        'history': []
    }


def save_state(state):
    """Save completion promise state."""
    state_path = Path(STATE_FILE)
    state_path.parent.mkdir(parents=True, exist_ok=True)
    state_path.write_text(json.dumps(state, indent=2))


def get_all_patterns(state):
    """Get all promise patterns including custom ones."""
    patterns = PROMISE_PATTERNS.copy()
    for custom in state.get('custom_patterns', []):
        patterns.append(rf'<promise>({custom})</promise>')
    return patterns


def detect_promise(text, state):
    """Detect if text contains a completion promise."""
    if not text:
        return None

    patterns = get_all_patterns(state)
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).upper()
    return None


def handle_post_tool_use():
    """Handle PostToolUse event - detect promises in tool output."""
    try:
        hook_input = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        return

    tool_name = hook_input.get('tool_name', '')
    tool_result = hook_input.get('tool_result', '')

    # Only check tools that produce output
    if tool_name not in ['Bash', 'Write', 'Edit', 'Read']:
        return

    state = load_state()

    # v4.5.0: Check iteration limits for tools that indicate phase progress
    if tool_name in ['Write', 'Edit'] and UTILS_AVAILABLE:
        try:
            # Detect current phase from context or state
            current_phase = state.get('current_phase', 'unknown')
            current_iter, max_iter, exceeded = increment_phase_iteration(current_phase)

            if exceeded:
                # Log the limit exceeded event
                log_workflow_event("iteration_limit_exceeded", {
                    "phase": current_phase,
                    "current": current_iter,
                    "limit": max_iter
                })

                print(json.dumps({
                    'result': 'block',
                    'message': f"""
{'='*60}
 MAX ITERATIONS EXCEEDED: {current_phase}
{'='*60}

Current iteration: {current_iter}
Limit: {max_iter}

The autonomous loop has exceeded the maximum iterations for this phase.
This is a safety mechanism to prevent infinite loops.

To continue:
- Run /ralph-continue to reset and proceed
- Or increase max_iterations in hustle-build-defaults.json
"""
                }))
                return
        except Exception:
            pass

    # Check for promise in output
    promise = detect_promise(str(tool_result), state)

    if promise:
        # Record the promise detection
        state['active_promise'] = promise
        state['history'].append({
            'promise': promise,
            'tool': tool_name,
            'detected_at': datetime.now().isoformat(),
        })

        # Keep only last 50 history entries
        state['history'] = state['history'][-50:]
        save_state(state)

        # v4.5.0: Log the promise detection
        if UTILS_AVAILABLE:
            try:
                log_workflow_event("promise_emitted", {
                    "promise": promise,
                    "tool": tool_name,
                    "phase": state.get('current_phase', 'unknown')
                })
            except Exception:
                pass

        # Output notification
        print(json.dumps({
            'result': 'continue',
            'message': f"\n{'='*60}\n COMPLETION PROMISE DETECTED: {promise}\n{'='*60}\n\nThe autonomous loop can now terminate gracefully.\nTo continue anyway, use: /ralph-continue\n"
        }))
        return

    # No promise detected, continue normally
    print(json.dumps({'result': 'continue'}))


def handle_stop():
    """Handle Stop event - check if we should allow graceful termination."""
    try:
        hook_input = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        print(json.dumps({'result': 'continue'}))
        return

    state = load_state()
    active_promise = state.get('active_promise')

    if active_promise:
        # Clear the active promise
        state['active_promise'] = None
        save_state(state)

        # Allow graceful termination with summary
        print(json.dumps({
            'result': 'continue',
            'message': f"\n AUTONOMOUS LOOP COMPLETE \n\nCompletion promise '{active_promise}' was fulfilled.\nThe agent has signaled that the task is done.\n"
        }))
    else:
        # No active promise, continue with normal stop behavior
        print(json.dumps({'result': 'continue'}))


def handle_user_prompt():
    """Handle UserPromptSubmit - detect promise configuration."""
    try:
        hook_input = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        print(json.dumps({'result': 'continue'}))
        return

    prompt = hook_input.get('prompt', '').lower()
    state = load_state()

    # Check for Ralph Wiggum loop start
    if '/ralph-loop' in prompt or '--completion-promise' in prompt:
        # Extract custom promise if specified
        match = re.search(r'--completion-promise\s+["\']?(\w+)["\']?', prompt, re.IGNORECASE)
        if match:
            custom_promise = match.group(1).upper()
            if custom_promise not in state.get('custom_patterns', []):
                state.setdefault('custom_patterns', []).append(custom_promise)
                save_state(state)

        print(json.dumps({
            'result': 'continue',
            'message': f"\n RALPH WIGGUM LOOP INITIALIZED \n\nListening for completion promises:\n- DONE, COMPLETE, FINISHED, SUCCESS\n- FIXED, RESOLVED, SOLVED\n- REFACTORED, CLEANED, IMPROVED\n- TESTED, VERIFIED, VALIDATED\n- DEPLOYED, SHIPPED, RELEASED\n{f'- {custom_promise} (custom)' if match else ''}\n\nOutput <promise>DONE</promise> when the task is complete.\n"
        }))
        return

    # Check for continue command
    if '/ralph-continue' in prompt:
        state['active_promise'] = None
        save_state(state)
        print(json.dumps({
            'result': 'continue',
            'message': "Cleared active promise. Autonomous loop will continue."
        }))
        return

    # Check for status command
    if '/ralph-status' in prompt:
        active = state.get('active_promise', 'None')
        history = state.get('history', [])[-5:]

        status_msg = f"\n RALPH WIGGUM STATUS \n\nActive Promise: {active}\n\nRecent History:\n"
        for h in history:
            status_msg += f"  - {h.get('promise')} via {h.get('tool')} at {h.get('detected_at', 'unknown')[:19]}\n"

        if not history:
            status_msg += "  (no promises detected yet)\n"

        print(json.dumps({
            'result': 'continue',
            'message': status_msg
        }))
        return

    print(json.dumps({'result': 'continue'}))


def main():
    """Main entry point - determine hook type from environment."""
    hook_type = os.environ.get('CLAUDE_HOOK_TYPE', 'PostToolUse')

    if hook_type == 'PostToolUse':
        handle_post_tool_use()
    elif hook_type == 'Stop':
        handle_stop()
    elif hook_type == 'UserPromptSubmit':
        handle_user_prompt()
    else:
        # Unknown hook type, pass through
        print(json.dumps({'result': 'continue'}))


if __name__ == '__main__':
    main()
