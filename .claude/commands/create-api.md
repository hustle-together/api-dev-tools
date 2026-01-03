---
description: Create a new API endpoint with TDD
allowed-tools: Read, Edit, Write, Grep, Glob, Bash, Task
argument-hint: <resource-name>
---

# Create API: $ARGUMENTS

## Context

- Existing APIs: !`ls -la src/app/api/ 2>/dev/null || echo "No APIs yet"`
- Registry: !`cat .devkit/registry.json 2>/dev/null | jq '.artifacts.apis' || echo "[]"`

## Workflow

1. **Check Registry** - Skip if API already exists for $ARGUMENTS
2. **Research Phase** - Spawn researcher subagent for API patterns
3. **Interview Phase** - Confirm requirements (methods, auth, validation)
4. **Schema Phase** - Define request/response types
5. **TDD Phase** - Write tests, implement, refactor
6. **Docs Phase** - Generate OpenAPI spec
7. **Verify Phase** - Run all tests, update registry

## Output

Update `.devkit/registry.json` with new API artifact.
Output <promise>API_COMPLETE</promise> when finished.
