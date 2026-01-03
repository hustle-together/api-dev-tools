---
description: Create a multi-agent workflow orchestration
allowed-tools: Read, Edit, Write, Grep, Glob, Task
argument-hint: <workflow-name>
---

# Create Orchestration: $ARGUMENTS

## Context

- Existing workflows: !`ls .claude/commands/ 2>/dev/null`
- Current state: !`cat .devkit/state.json 2>/dev/null | jq '.status' || echo "not initialized"`

## Workflow

1. **Define phases** for the workflow
2. **Create subagents** if needed
3. **Set up hooks** for phase gates
4. **Create slash command** for triggering
5. **Test end-to-end**
6. **Document workflow**

Output <promise>ORCHESTRATION_COMPLETE</promise> when finished.
