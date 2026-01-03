# Testing Architecture for api-dev-tools

## The Problem

Testing api-dev-tools requires running the package in a separate environment while being able to fix bugs in the source code.

## Directory Structure

```
┌─────────────────────────────────────────────────────────────┐
│ SOURCE REPOSITORY (fix bugs here)                          │
│ /Users/alfonso/Documents/GitHub/api-dev-tools               │
├─────────────────────────────────────────────────────────────┤
│ - Source code for the package                               │
│ - Hooks, commands, skills                                   │
│ - When tests fail, edit code HERE                           │
│ - After fixes, rebuild and reinstall in test directory      │
└─────────────────────────────────────────────────────────────┘
                           ↓ git commit after fixes
┌─────────────────────────────────────────────────────────────┐
│ TEST ORCHESTRATOR (coordinate from here)                    │
│ /Users/alfonso/test-orchestrator                            │
├─────────────────────────────────────────────────────────────┤
│ - CLAUDE.md with orchestration instructions                 │
│ - .claude/test-orchestrator-state.json                      │
│ - .claude/hooks/test-orchestrator-reground.py (5-turn)      │
│ - scripts/                                                   │
│   ├── auto-answer-bot.py                                    │
│   ├── completion-detector.py                                │
│   └── run-test-suite.sh                                     │
│ - test-results/                                              │
│   └── WORKFLOW_CHECKLIST.md (tracking results)              │
└─────────────────────────────────────────────────────────────┘
                           ↓ monitors & executes
┌─────────────────────────────────────────────────────────────┐
│ TEST SUBJECT (run tests here)                               │
│ /Users/alfonso/test-api-dev-tools-auto                      │
├─────────────────────────────────────────────────────────────┤
│ - Clean Next.js project                                     │
│ - api-dev-tools installed from source                       │
│ - .env file with API keys                                   │
│ - Workflow executes here                                    │
│ - State files created here (.claude/api-dev-state.json)     │
└─────────────────────────────────────────────────────────────┘
```

## Test Orchestration Flow

1. **Start from test-orchestrator directory**
2. **Initialize state** tracking all 5 commands
3. **For each command:**
   - Execute workflow in test-api-dev-tools-auto
   - Monitor .claude/api-dev-state.json for progress
   - Auto-answer questions via auto-answer-bot
   - Verify completion with completion-detector
4. **On failure:**
   - Analyze logs
   - Research error (WebSearch)
   - Edit source in api-dev-tools directory
   - Git commit as savepoint
   - Rebuild and reinstall
   - Retry test
5. **On success:**
   - Update WORKFLOW_CHECKLIST.md
   - Move to next command
6. **Every 5 turns:**
   - Re-ground with current progress
   - Send NTFY notification
   - Update test-orchestrator-state.json

## Key Principles

- **Never mix source and test contexts**
- **Always know which directory I'm operating in**
- **Source fixes happen in api-dev-tools/**
- **Test execution happens in test-api-dev-tools-auto/**
- **Coordination happens in test-orchestrator/**

## How to Resume

If session is interrupted:

1. Read test-orchestrator/.claude/test-orchestrator-state.json
2. See which command failed and why
3. Continue from that point
4. All context preserved in state files
