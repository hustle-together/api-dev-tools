---
name: api-continue
version: 3.11.0
description: Resume an interrupted API development workflow from where it left off
author: Hustle Together
tags: [api, workflow, resume, recovery]
---

# API Continue

Resume an interrupted API development workflow from the last completed phase.

## Usage

```
/api-continue [endpoint-name]
```

## Arguments

- `endpoint-name` (optional): The endpoint to resume. If not provided, lists available interrupted workflows.

## What This Skill Does

1. **Check for Interrupted Workflows**
   - Read `.claude/api-dev-state.json`
   - Find endpoints with `workflow_active: true` or phases `in_progress`
   - Identify the last completed phase

2. **Restore Context**
   - Load all interview decisions from state
   - Load research cache from `.claude/research/{endpoint}/`
   - Inject phase-specific context

3. **Resume Workflow**
   - Set `active_endpoint` to the resumed endpoint
   - Continue from the interrupted phase
   - Re-inject any needed context

## Example

```bash
# List interrupted workflows
/api-continue

# Resume specific workflow
/api-continue brandfetch
```

## Implementation Steps

### Step 1: Load State

```
READ .claude/api-dev-state.json
IF endpoint argument provided:
  VALIDATE endpoint exists in state
ELSE:
  FIND all endpoints with incomplete phases
  IF multiple found:
    ASK user which to resume
  IF none found:
    MESSAGE "No interrupted workflows. Use /api-create to start."
```

### Step 2: Identify Resume Point

```
FOR each phase in order (disambiguation → completion):
  IF phase.status == "in_progress":
    RESUME from this phase
  IF phase.status == "not_started" AND previous phase == "completed":
    RESUME from this phase
```

### Step 3: Restore Context

```
LOAD interview decisions from state.phases.interview.decisions
LOAD research from .claude/research/{endpoint}/CURRENT.md
CHECK research freshness (warn if >7 days old)

INJECT context summary:
  - Endpoint name and purpose
  - Completed phases
  - Key interview decisions
  - Research highlights
```

### Step 4: Show Resume Summary

```
DISPLAY:
┌────────────────────────────────────────────────────────┐
│ RESUMING: {endpoint}                                   │
│                                                        │
│ Completed: Phase 1-5                                   │
│ Resuming at: Phase 6 (Schema Creation)                 │
│                                                        │
│ Interview Decisions:                                   │
│   • format: json                                       │
│   • authentication: api_key                            │
│                                                        │
│ Research Status: Fresh (2 days old)                    │
└────────────────────────────────────────────────────────┘
```

### Step 5: Continue Workflow

```
SET state.workflow_active = true
SET state.endpoint = endpoint
TRIGGER appropriate phase based on resume point
```

## Phase Order Reference

1. Disambiguation
2. Scope
3. Initial Research
4. Interview
5. Deep Research
6. Schema Creation
7. Environment Check
8. TDD Red
9. TDD Green
10. Verify
11. TDD Refactor
12. Documentation
13. Completion

## Error Handling

| Error | Resolution |
|-------|------------|
| No interrupted workflows | "No interrupted workflows. Use /api-create to start." |
| Endpoint not found | List available endpoints |
| Research cache stale (>7 days) | Warn user, offer to re-run research |
| State file missing | "No state file. Use /api-create to start." |

## Related Skills

- `/api-create` - Start new workflow
- `/api-status` - Check workflow progress
- `/api-sessions` - View session history
