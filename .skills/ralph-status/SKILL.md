---
name: ralph-status
description: Show current Ralph Wiggum loop status - phase, iteration count, elapsed time, and promises emitted
license: MIT
compatibility: Requires Claude Code with hook_utils.py
metadata:
  version: "4.5.0"
  category: "workflow"
  tags: ['ralph', 'autonomous', 'loop', 'status']
  author: "Hustle Together"
allowed-tools: Read
model: haiku
---

# Ralph Status

Show the current status of autonomous Ralph Wiggum loops.

## Usage

```
/ralph-status
```

## What It Shows

1. **Current Phase** - Which workflow phase is active
2. **Iteration Count** - How many iterations in current phase
3. **Max Iterations** - The limit before safety cutoff
4. **Active Promise** - Any completion promise waiting to be fulfilled
5. **Recent History** - Last 5 promise detections
6. **Elapsed Time** - How long the current session has been running

## Output Format

```
┌─────────────────────────────────────────────────────────────────┐
│                    RALPH WIGGUM STATUS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Workflow ID: session-20251230-143022                           │
│  Current Phase: tdd_green                                       │
│  Iteration: 7 / 25 (max)                                        │
│  Active Promise: None                                           │
│  Elapsed: 12m 34s                                               │
│                                                                 │
│  Recent Promises:                                               │
│  └─ DONE via Write at 14:28:15                                  │
│  └─ TESTED via Bash at 14:25:42                                 │
│                                                                 │
│  Phase Iterations:                                              │
│  └─ tdd_red: 3                                                  │
│  └─ tdd_green: 7                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation

<claude-commands-template>
When /ralph-status is invoked:

1. Read the workflow state files:
   - `.claude/api-dev-state.json` - Main workflow state
   - `.claude/completion-promises.json` - Ralph loop state

2. Extract and display:
   - workflow_id from state
   - Current phase from state.phases (find "in_progress")
   - phase_iterations from state
   - active_promise from completion-promises.json
   - history from completion-promises.json (last 5)

3. Calculate elapsed time:
   - Read workflow log from `.claude/workflow-logs/{workflow_id}.json`
   - Get started_at timestamp
   - Calculate difference from now

4. Format output as shown above

5. If no active workflow:
```
No active workflow. Start one with:
- /api-create [endpoint]
- /hustle-build [prompt]
```
</claude-commands-template>
