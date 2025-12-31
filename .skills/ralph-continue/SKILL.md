---
name: ralph-continue
description: Continue or resume a paused Ralph Wiggum autonomous loop from its last state
license: MIT
compatibility: Requires Claude Code with hook_utils.py
metadata:
  version: "4.5.0"
  category: "workflow"
  tags: ['ralph', 'autonomous', 'loop', 'resume', 'continue']
  author: "Hustle Together"
allowed-tools: Read Write Task
model: sonnet
---

# Ralph Continue

Resume a paused or interrupted Ralph Wiggum autonomous loop.

## Usage

```
/ralph-continue                    # Continue current workflow
/ralph-continue [workflow-id]      # Resume specific workflow by ID
/ralph-continue --list             # List resumable workflows
```

## What It Does

1. **Clear Active Promise** - Removes any pending completion promise so the loop continues
2. **Reset Iteration Counter** - Optionally reset phase iterations if stuck
3. **Resume From Last State** - Pick up where the workflow left off
4. **Restore Archived Workflows** - Can restore from workflow-logs if session ended

## Examples

### Continue After Promise Detection

When a `<promise>DONE</promise>` was detected but you want to keep going:

```
/ralph-continue
```

This clears the active promise and lets the autonomous loop continue.

### Resume Interrupted Session

If your session ended mid-workflow:

```
/ralph-continue session-20251230-143022
```

This restores the workflow state from the archived log.

### List Available Workflows

```
/ralph-continue --list
```

Output:
```
┌─────────────────────────────────────────────────────────────────┐
│               RESUMABLE WORKFLOWS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Active:                                                        │
│  └─ session-20251230-150000 (user-api) - tdd_green phase       │
│                                                                 │
│  Archived:                                                      │
│  └─ session-20251230-143022 - last activity: 14:45:00          │
│  └─ session-20251229-091500 - last activity: 09:30:00 (stale)  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation

<claude-commands-template>
When /ralph-continue is invoked:

### Without Arguments (Continue Current)

1. Load completion-promises.json:
   ```python
   promise_state = load_promise_state()
   ```

2. Clear active promise:
   ```python
   promise_state['active_promise'] = None
   save_promise_state(promise_state)
   ```

3. Load api-dev-state.json and find current phase

4. Output continuation message:
   ```
   ✓ Cleared active promise
   ✓ Continuing from phase: {current_phase}
   ✓ Iteration {current} / {max}

   The autonomous loop will now continue.
   Output <promise>DONE</promise> when complete.
   ```

5. If in autonomous mode, re-invoke the current phase skill

### With Workflow ID (Resume Specific)

1. Use hook_utils.handle_resume(workflow_id):
   ```python
   from hook_utils import handle_resume
   state, message = handle_resume(workflow_id)
   ```

2. If state found:
   - Display what phase will resume
   - Ask user to confirm
   - If confirmed, re-invoke the workflow

3. If not found:
   - Show error and list available workflows

### With --list Flag

1. Use hook_utils.list_resumable_workflows():
   ```python
   from hook_utils import list_resumable_workflows
   workflows = list_resumable_workflows()
   ```

2. Display formatted list as shown above

### Reset Iterations (Optional Flag)

If `--reset-iterations` is passed:
```python
from hook_utils import reset_phase_iterations
reset_phase_iterations()
```

This clears all iteration counters, useful if max-iterations was hit.
</claude-commands-template>

## Related Commands

- `/ralph-status` - Check current loop status
- `/api-create --resume [id]` - Resume with full workflow context
- `/hustle-build --resume [id]` - Resume build workflow
