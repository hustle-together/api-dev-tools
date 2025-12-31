# Autonomous Testing System for API Dev Tools v4.6

## Overview

This document describes a **self-healing, autonomous test runner** that uses Ralph Wiggum patterns to iterate through all tests until everything passes - capable of running overnight without human intervention.

---

## Table of Contents

1. [Architecture Decision](#architecture-decision)
2. [System Components](#system-components)
3. [How It Works](#how-it-works)
4. [State Management](#state-management)
5. [Overnight Execution](#overnight-execution)
6. [Recovery & Resilience](#recovery--resilience)
7. [Test Categories](#test-categories)
8. [Containerization (Optional)](#containerization-optional)
9. [CI/CD Integration](#cicd-integration)
10. [Implementation Files](#implementation-files)

---

## Architecture Decision

### Should This Be a Separate Project?

**Decision: NO - Keep it IN api-dev-tools**

| Option | Pros | Cons |
|--------|------|------|
| **Separate project** | Clean separation, independent versioning | Duplicates infrastructure, harder to sync |
| **Inside api-dev-tools** | Dogfooding, uses own hooks/skills, single source of truth | Tests are coupled to implementation |

**Rationale:**
- The test runner uses api-dev-tools' own infrastructure (hooks, skills, state files)
- This is intentional **dogfooding** - we're using api-dev-tools to test api-dev-tools
- The test manifest directly references TESTING_CHECKLIST.md
- Single repository = single source of truth

### Do We Need Containerization?

**Decision: OPTIONAL - Not required for basic testing, useful for CI/CD**

| Use Case | Containerization Needed? |
|----------|-------------------------|
| Local overnight testing | No - Fresh project is sufficient isolation |
| CI/CD pipelines | Yes - Reproducibility across environments |
| Parallel test suites | Yes - Multiple isolated environments |
| Team testing | Yes - Consistent environment for all |

**For overnight local testing:** A fresh project at `~/test-api-dev-tools` provides sufficient isolation. State persists in JSON files, allowing session recovery.

**For production CI/CD:** Containerization ensures reproducibility. See [Containerization section](#containerization-optional).

---

## System Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AUTONOMOUS TEST RUNNER                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────┐                                                      │
│  │ TEST MANIFEST  │  Source of truth for all tests                       │
│  │ test-suite.json│  - Test definitions from TESTING_CHECKLIST.md       │
│  └───────┬────────┘  - Progress tracking                                 │
│          │           - Pass/fail status                                  │
│          ▼                                                               │
│  ┌────────────────┐                                                      │
│  │ TEST RUNNER    │  Orchestrates test execution                         │
│  │ /test-suite    │  - Reads manifest                                    │
│  │ skill          │  - Runs tests sequentially                           │
│  └───────┬────────┘  - Invokes Ralph Wiggum on failures                  │
│          │                                                               │
│          ▼                                                               │
│  ┌────────────────┐                                                      │
│  │ RALPH WIGGUM   │  Self-healing loop for failures                      │
│  │ FIX LOOP       │  - Diagnose failure                                  │
│  │                │  - Attempt fix                                       │
│  └───────┬────────┘  - Retry (max 3 attempts)                            │
│          │                                                               │
│          ▼                                                               │
│  ┌────────────────┐                                                      │
│  │ STATE          │  Persistence layer                                   │
│  │ PERSISTENCE    │  - Saves after each test                             │
│  │                │  - Enables session recovery                          │
│  └───────┬────────┘  - Tracks attempts per test                          │
│          │                                                               │
│          ▼                                                               │
│  ┌────────────────┐                                                      │
│  │ COMPLETION     │  Termination detection                               │
│  │ DETECTOR       │  - All tests processed                               │
│  │                │  - Generate final report                             │
│  └────────────────┘                                                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Details

| Component | File | Purpose |
|-----------|------|---------|
| Test Manifest | `.claude/test-suite.json` | All test definitions + state |
| Test Runner Skill | `.skills/test-suite/SKILL.md` | Main orchestrator |
| Resume Hook | `hooks/test-suite-resume.py` | Auto-resume on session start |
| Report Generator | `hooks/test-suite-report.py` | Generate final report |
| Test PRD | `templates/test-prd.md` | Sample PRD for workflow tests |

---

## How It Works

### The Test Loop

```
SESSION START
     │
     ▼
┌─────────────────────┐
│ test-suite-resume.py│  Hook checks for incomplete test suite
│ (SessionStart hook) │
└──────────┬──────────┘
           │
           ▼
     ┌───────────┐
     │ Incomplete│──────────────────┐
     │ suite?    │                  │
     └─────┬─────┘                  │
           │ Yes                    │ No
           ▼                        ▼
┌─────────────────────┐    ┌─────────────────────┐
│ Inject resume       │    │ Normal session      │
│ prompt: "Continue   │    │ (no test suite)     │
│ /test-suite"        │    └─────────────────────┘
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ /test-suite skill   │  Main test runner
│ loads manifest      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Get next pending    │
│ test from manifest  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Execute test        │
│ (bash/skill/verify) │
└──────────┬──────────┘
           │
           ▼
     ┌───────────┐
     │ PASSED?   │
     └─────┬─────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
   PASS        FAIL
     │           │
     ▼           ▼
┌─────────┐  ┌─────────────────┐
│ Mark    │  │ attempts < max? │
│ PASSED  │  └────────┬────────┘
└────┬────┘           │
     │          ┌─────┴─────┐
     │          │           │
     │          ▼           ▼
     │    ┌───────────┐  ┌───────────┐
     │    │ Ralph     │  │ Mark      │
     │    │ Wiggum:   │  │ FAILED    │
     │    │ Diagnose  │  │ (skip)    │
     │    │ Fix       │  └─────┬─────┘
     │    │ Retry     │        │
     │    └─────┬─────┘        │
     │          │              │
     │          ▼              │
     │    ┌───────────┐        │
     │    │ Retry     │        │
     │    │ test      │────────┘
     │    └───────────┘
     │
     ▼
┌─────────────────────┐
│ Save manifest       │  Persist state after each test
│ (state persisted)   │
└──────────┬──────────┘
           │
           ▼
     ┌───────────┐
     │ More      │
     │ tests?    │
     └─────┬─────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
    YES          NO
     │           │
     ▼           ▼
┌─────────┐  ┌─────────────────┐
│ Loop    │  │ Generate report │
│ back    │  │ NTFY notify     │
└─────────┘  │ Mark complete   │
             └─────────────────┘
```

### Test Types

| Type | How Executed | Example |
|------|--------------|---------|
| `bash` | Run command, check output | `ls .claude/commands/ \| wc -l` → "30" |
| `skill` | Invoke skill, check completion | `/hustle-build --auto` → state.status == "complete" |
| `verify` | Check file exists/contents | `.claude/settings.json` exists |
| `hook` | Trigger condition, check block | Try write without research → blocked |

---

## State Management

### Test Manifest Schema

```json
{
  "version": "1.0.0",
  "created_at": "2025-12-30T22:00:00Z",
  "updated_at": "2025-12-30T23:45:00Z",
  "status": "in_progress",

  "config": {
    "max_attempts_per_test": 3,
    "timeout_per_test_ms": 300000,
    "continue_on_failure": true,
    "notify_on_complete": true,
    "ntfy_topic": "layers-mf-08ebf1d1"
  },

  "summary": {
    "total": 150,
    "passed": 45,
    "failed": 2,
    "skipped": 0,
    "pending": 103
  },

  "current_test_index": 47,

  "tests": [
    {
      "id": "L1.01",
      "layer": 1,
      "category": "installation",
      "name": "Commands directory exists",
      "type": "bash",
      "command": "ls -d .claude/commands/",
      "expected": ".claude/commands/",
      "status": "passed",
      "attempts": 1,
      "last_result": ".claude/commands/",
      "duration_ms": 45
    },
    {
      "id": "L1.02",
      "layer": 1,
      "category": "installation",
      "name": "Command count",
      "type": "bash",
      "command": "ls .claude/commands/ | wc -l | tr -d ' '",
      "expected": "30",
      "status": "passed",
      "attempts": 1,
      "last_result": "30",
      "duration_ms": 52
    },
    {
      "id": "L2.01",
      "layer": 2,
      "category": "workflow",
      "name": "hustle-build completes",
      "type": "skill",
      "command": "/hustle-build --auto --from-document test-prd.md",
      "expected": "state:hustle-build-state.json:status=complete",
      "status": "pending",
      "attempts": 0,
      "last_result": null,
      "duration_ms": null
    }
  ],

  "failures": [
    {
      "test_id": "L2.05",
      "attempts": [
        {
          "attempt": 1,
          "error": "Schema validation failed",
          "fix_attempted": "Re-ran research phase",
          "timestamp": "2025-12-30T23:30:00Z"
        },
        {
          "attempt": 2,
          "error": "Schema validation failed",
          "fix_attempted": "Updated Zod schema manually",
          "timestamp": "2025-12-30T23:32:00Z"
        },
        {
          "attempt": 3,
          "error": "Schema validation failed",
          "fix_attempted": "Skipped - max attempts reached",
          "timestamp": "2025-12-30T23:34:00Z"
        }
      ]
    }
  ]
}
```

### State Persistence Points

| Event | Action |
|-------|--------|
| Test starts | Update `current_test_index` |
| Test passes | Update test status, increment `passed` |
| Test fails | Update test status, log to `failures[]` |
| Attempt made | Increment test `attempts`, log fix |
| Session ends | State already persisted (file-based) |
| Session starts | Load manifest, resume from `current_test_index` |

---

## Overnight Execution

### Starting the Test Suite

```bash
# 1. Create fresh test environment
mkdir ~/test-api-dev-tools && cd ~/test-api-dev-tools
npm init -y

# 2. Copy environment variables
cp /path/to/weather-app-test/.env .env

# 3. Install api-dev-tools
npx @hustle-together/api-dev-tools --scope=project

# 4. Start test suite (in Claude Code)
/test-suite --full
```

### What Happens Overnight

1. **Test runner starts** - Loads/creates manifest
2. **Tests execute sequentially** - Each test runs with Ralph Wiggum retry
3. **State persists after each test** - Survives session timeouts
4. **On session timeout** - Context limit reached, session ends
5. **On next interaction** - SessionStart hook detects incomplete suite
6. **Auto-resume prompt** - "Continue /test-suite" injected
7. **Testing continues** - From where it left off
8. **Completion** - NTFY notification sent when all tests processed

### Session Recovery

The system is designed to survive Claude Code session limits:

```
┌─────────────────────────────────────────────────────────┐
│ Session 1 (Tests 1-50)                                  │
│ ─────────────────────────────────────────────────────── │
│ [✓] [✓] [✓] [✓] [✓] ... [✓] [✓] [✓] [⟳] [Context Limit]│
│                                           │             │
│                                           ▼             │
│                                    Save state           │
└─────────────────────────────────────────────────────────┘
                                           │
                                           ▼ (Resume)
┌─────────────────────────────────────────────────────────┐
│ Session 2 (Tests 51-100)                                │
│ ─────────────────────────────────────────────────────── │
│ [✓] [✓] [✗→✓] [✓] [✓] ... [✓] [✓] [⟳] [Context Limit]  │
│                                           │             │
│                                           ▼             │
│                                    Save state           │
└─────────────────────────────────────────────────────────┘
                                           │
                                           ▼ (Resume)
┌─────────────────────────────────────────────────────────┐
│ Session 3 (Tests 101-150)                               │
│ ─────────────────────────────────────────────────────── │
│ [✓] [✓] [✓] [✓] [✓] ... [✓] [✓] [✓] [COMPLETE]         │
│                                           │             │
│                                           ▼             │
│                              Generate report + NTFY     │
└─────────────────────────────────────────────────────────┘
```

---

## Recovery & Resilience

### Failure Handling

| Failure Type | Recovery Strategy |
|--------------|-------------------|
| Test fails | Ralph Wiggum: diagnose → fix → retry (max 3) |
| Session timeout | State persisted, auto-resume on next interaction |
| Hook error | Log error, skip test, continue suite |
| Skill not found | Log error, mark test failed, continue |
| Network error | Retry with exponential backoff |

### Ralph Wiggum Fix Strategies

When a test fails, the Ralph Wiggum loop attempts intelligent fixes:

| Test Type | Fix Strategy |
|-----------|--------------|
| File count wrong | Check what's missing, re-run installer for that category |
| Workflow fails | Check state file for failed phase, re-run from that phase |
| Hook not firing | Verify hook registered in settings.json, fix registration |
| Skill error | Check skill file exists, verify syntax |
| Schema validation | Re-run research, regenerate schema |

### Promise Detection

The test is "done" when:
- Test output matches expected (for bash/verify)
- State file shows completion (for skill tests)
- Max attempts reached (mark failed, continue)

---

## Test Categories

### Layer 1: Installation (Automated - ~15 min)

| Category | Tests | Type |
|----------|-------|------|
| File counts | 9 tests | bash |
| Directory structure | 5 tests | verify |
| Settings validation | 3 tests | verify |
| MCP configuration | 5 tests | bash |

### Layer 2: Workflows (Automated with --auto - ~2-3 hrs)

| Category | Tests | Type |
|----------|-------|------|
| /hustle-build phases | 10 tests | skill |
| /api-create phases | 14 tests | skill |
| /hustle-ui-create phases | 14 tests | skill |
| /hustle-ui-create-page phases | 14 tests | skill |
| /hustle-combine phases | 14 tests | skill |
| Auto mode | 5 tests | skill |

### Layer 3: Standalone Skills (Automated - ~1-2 hrs)

| Category | Tests | Type |
|----------|-------|------|
| Git skills | 6 tests | skill |
| TDD skills | 6 tests | skill |
| Testing skills | 7 tests | skill |
| Planning skills | 4 tests | skill |
| Utility skills | 8 tests | skill |
| Ralph Wiggum skills | 3 tests | skill |
| Notification skills | 2 tests | skill |

### Layer 4: Hook Verification (Automated - ~30 min)

| Category | Tests | Type |
|----------|-------|------|
| Hook registration | 7 tests | verify |
| SessionStart hooks | 5 tests | hook |
| PreToolUse hooks | 26 tests | hook |
| PostToolUse hooks | 17 tests | hook |
| Stop hooks | 2 tests | hook |

---

## Containerization (Optional)

### When to Use Containers

| Use Case | Recommendation |
|----------|----------------|
| Local overnight testing | **No container** - Fresh project sufficient |
| CI/CD pipelines | **Yes** - Reproducibility required |
| Team testing | **Yes** - Consistent environment |
| Parallel test suites | **Yes** - Isolated environments |

### Docker Configuration

```dockerfile
# Dockerfile.test
FROM node:20-slim

# Install Python for hooks
RUN apt-get update && apt-get install -y python3 python3-pip git

# Install Claude Code CLI
RUN npm install -g @anthropic-ai/claude-code

# Create test directory
WORKDIR /test-project
RUN npm init -y

# Copy environment (secrets via Docker secrets/env)
COPY .env.example .env

# Install api-dev-tools
RUN npx @hustle-together/api-dev-tools --scope=project --silent

# Copy test PRD
COPY templates/test-prd.md ./test-prd.md

# Entry point runs test suite
CMD ["claude", "--prompt", "/test-suite --full"]
```

### Docker Compose for Parallel Testing

```yaml
# docker-compose.test.yml
version: '3.8'

services:
  test-layer1:
    build:
      context: .
      dockerfile: Dockerfile.test
    environment:
      - CLAUDE_API_KEY=${CLAUDE_API_KEY}
      - TEST_LAYER=1
    volumes:
      - ./results/layer1:/test-project/.claude/test-results

  test-layer2:
    build:
      context: .
      dockerfile: Dockerfile.test
    environment:
      - CLAUDE_API_KEY=${CLAUDE_API_KEY}
      - TEST_LAYER=2
    volumes:
      - ./results/layer2:/test-project/.claude/test-results

  test-layer3:
    build:
      context: .
      dockerfile: Dockerfile.test
    environment:
      - CLAUDE_API_KEY=${CLAUDE_API_KEY}
      - TEST_LAYER=3
    volumes:
      - ./results/layer3:/test-project/.claude/test-results

  test-layer4:
    build:
      context: .
      dockerfile: Dockerfile.test
    environment:
      - CLAUDE_API_KEY=${CLAUDE_API_KEY}
      - TEST_LAYER=4
    volumes:
      - ./results/layer4:/test-project/.claude/test-results
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test-suite.yml
name: API Dev Tools Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * *'  # Nightly at 2 AM

jobs:
  test-installation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Create test project
        run: |
          mkdir -p ~/test-project
          cd ~/test-project
          npm init -y

      - name: Install api-dev-tools
        run: |
          cd ~/test-project
          npx @hustle-together/api-dev-tools --scope=project --silent

      - name: Verify installation
        run: |
          cd ~/test-project
          echo "Commands: $(ls .claude/commands/ | wc -l)"
          echo "Skills: $(find .skills -name 'SKILL.md' | wc -l)"
          echo "Hooks: $(find .claude/hooks -name '*.py' | wc -l)"
          echo "Agents: $(ls .claude/agents/ | wc -l)"

      - name: Upload results
        uses: actions/upload-artifact@v4
        with:
          name: installation-results
          path: ~/test-project/.claude/

  test-workflows:
    runs-on: ubuntu-latest
    needs: test-installation
    steps:
      # Similar setup, but runs /test-suite --layer=2

  test-skills:
    runs-on: ubuntu-latest
    needs: test-installation
    steps:
      # Similar setup, but runs /test-suite --layer=3

  test-hooks:
    runs-on: ubuntu-latest
    needs: test-installation
    steps:
      # Similar setup, but runs /test-suite --layer=4
```

---

## Implementation Files

### Files to Create

| File | Purpose | Priority |
|------|---------|----------|
| `.skills/test-suite/SKILL.md` | Main test runner skill | P0 |
| `hooks/test-suite-resume.py` | SessionStart auto-resume | P0 |
| `hooks/test-suite-report.py` | Generate final report | P1 |
| `templates/test-suite.json` | Test manifest template | P0 |
| `templates/test-prd.md` | Sample PRD for workflow tests | P0 |
| `scripts/generate-test-manifest.ts` | Generate manifest from TESTING_CHECKLIST.md | P1 |
| `Dockerfile.test` | Container for CI/CD | P2 |
| `.github/workflows/test-suite.yml` | GitHub Actions | P2 |

### Estimated Implementation Time

| Phase | Time | Deliverable |
|-------|------|-------------|
| Phase 1: Core Runner | 2 hrs | Skill + Resume Hook + Manifest |
| Phase 2: Ralph Wiggum | 1 hr | Fix loop integration |
| Phase 3: Reporting | 30 min | Report generator |
| Phase 4: Testing | 1 hr | Verify the system works |
| **Total** | **4.5 hrs** | Complete autonomous test runner |

---

## Usage

### Full Test Suite

```bash
/test-suite --full
```

Runs all 4 layers, ~150 tests, self-healing with Ralph Wiggum.

### Layer-Specific Testing

```bash
/test-suite --layer=1   # Installation only (15 min)
/test-suite --layer=2   # Workflows only (2-3 hrs)
/test-suite --layer=3   # Standalone skills (1-2 hrs)
/test-suite --layer=4   # Hook verification (30 min)
```

### Resume Interrupted Suite

```bash
/test-suite --resume
```

Continues from last saved state.

### Generate Report

```bash
/test-suite --report
```

Generates report from current manifest without running tests.

---

## Related Documentation

- [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) - Complete test specifications
- [docs/AUTONOMOUS_LOOPS.md](./docs/AUTONOMOUS_LOOPS.md) - Ralph Wiggum pattern details
- [docs/HOOKS.md](./docs/HOOKS.md) - Hook system documentation

---

## Summary

This autonomous testing system:

1. **Runs overnight without intervention** - State persists across sessions
2. **Self-heals failures** - Ralph Wiggum diagnoses and fixes issues
3. **Covers everything** - All 150+ tests from TESTING_CHECKLIST.md
4. **Reports results** - NTFY notification + detailed report on completion
5. **Optionally containerized** - For CI/CD and team testing
6. **Lives in api-dev-tools** - Dogfooding the tool to test itself

Total implementation time: ~4.5 hours
Total test execution time: ~5-7 hours (can run overnight)
