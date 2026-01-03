---
description: Full build workflow with all phases
allowed-tools: Read, Edit, Write, Grep, Glob, Bash, Task
argument-hint: <feature-description>
---

# Build Feature: $ARGUMENTS

## Current State

!`cat .devkit/state.json 2>/dev/null || echo '{"status": "not initialized"}'`

## Registry

!`cat .devkit/registry.json 2>/dev/null || echo '{"artifacts": {}}'`

## 14-Phase Build Process

Execute phases conditionally based on registry state:

1. **Research** - Technology and pattern research (cache: 7 days)
2. **Interview** - Requirements clarification
3. **Schema** - Type definitions and data models
4. **TDD-Red** - Write failing tests (isolated subagent)
5. **TDD-Green** - Minimal implementation (isolated subagent)
6. **TDD-Refactor** - Code quality improvements (isolated subagent)
7. **Integration** - Connect components
8. **Visual Test** - Screenshot verification
9. **Code Review** - Security and quality review
10. **Docs** - Generate documentation
11. **Registry Update** - Record all artifacts
12. **Verification** - Full test suite
13. **Commit Prep** - Stage changes, generate message
14. **Completion** - Final checks

## Phase Skipping Logic

Before each phase, check registry.json. Skip if:

- Artifact already exists with matching checksum
- Previous build completed this phase < 24 hours ago
- Dependencies unchanged

Update state.json after each phase.

Output <promise>BUILD_COMPLETE</promise> when all phases done.
