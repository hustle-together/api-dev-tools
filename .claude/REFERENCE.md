# Devkit Quick Reference

> Read this file to understand all available commands, hooks, and agents.

## 38 Slash Commands

### API Development (14-Phase Workflow)
| Command | Purpose |
|---------|---------|
| `/api-create [endpoint]` | Complete 14-phase API workflow with interview-driven development |
| `/api-research [library]` | Research-first documentation discovery (Phase 3/5) |
| `/api-interview [endpoint]` | Generate questions FROM research findings (Phase 4) |
| `/api-verify [endpoint]` | Re-research docs, compare to implementation (Phase 10) |
| `/api-env [endpoint]` | Check API keys and environment variables (Phase 7) |
| `/api-status [endpoint]` | Track progress through all phases |

### UI Development (14-Phase Workflow)
| Command | Purpose |
|---------|---------|
| `/hustle-ui-create [component]` | Create UI components with 14-phase interview-driven workflow |
| `/hustle-ui-create-page [page]` | Create Next.js pages with 14-phase workflow |
| `/create-component [name]` | Create React component with tests and stories |
| `/create-page [name]` | Create page with routing and data fetching |
| `/visual-qa [component]` | Full visual QA audit - screenshot stories, analyze with Haiku |

### TDD Commands
| Command | Purpose |
|---------|---------|
| `/red` | Execute TDD Red Phase - write ONE failing test |
| `/green` | Execute TDD Green Phase - minimal implementation to pass |
| `/refactor` | Execute TDD Refactor Phase - improve structure, keep tests green |
| `/cycle [description]` | Execute complete TDD cycle (Red + Green + Refactor) |
| `/spike` | Exploratory coding to understand problem space before TDD |
| `/tdd` | Remind agent about TDD approach and continue |

### Git & GitHub
| Command | Purpose |
|---------|---------|
| `/commit` | Create git commit following project standards |
| `/busycommit` | Create multiple atomic commits, one logical change at a time |
| `/pr` | Create pull request using GitHub MCP |
| `/issue [url]` | Analyze GitHub issue and create TDD implementation plan |
| `/worktree-add [branch]` | Add git worktree, copy settings, install deps, open IDE |
| `/worktree-cleanup` | Clean up merged worktrees, verify PR status |

### Orchestration & Build
| Command | Purpose |
|---------|---------|
| `/hustle-build` | Master orchestrator for full build workflow |
| `/hustle-combine` | API and UI orchestration workflow |
| `/build` | Full build workflow with all phases |
| `/create-orchestration` | Create multi-agent workflow orchestration |
| `/create-api [name]` | Create new API endpoint with TDD |
| `/publish [patch\|minor\|major]` | Publish npm package with versioning |

### Utilities
| Command | Purpose |
|---------|---------|
| `/plan [feature]` | Create implementation plan with PRD-style discovery |
| `/summarize` | Summarize conversation progress and next steps |
| `/gap` | Analyze conversation for unaddressed items and gaps |
| `/beepboop` | Communicate AI-generated content with attribution |
| `/add-command` | Guide for creating new slash commands |
| `/test-hooks` | Run hook test suite |
| `/ntfy-setup` | Configure NTFY push notifications |
| `/ntfy-test` | Send test notification via NTFY |

---

## 22 Hooks

### Gate Hooks (Block Until Condition Met)
| Hook | Trigger | Purpose |
|------|---------|---------|
| `research-gate.py` | PreToolUse | Block code changes until research complete |
| `interview-gate.py` | PreToolUse | Block until interview decisions made |
| `schema-gate.py` | PreToolUse | Block until schema approved |
| `tdd-gate.py` | PreToolUse | Block production code until failing tests exist |
| `verify-gate.py` | Stop | Trigger verification after tests pass |
| `docs-gate.py` | Stop | Block completion until documentation done |

### State & Registry
| Hook | Trigger | Purpose |
|------|---------|---------|
| `state-manager.py` | PostToolUse | Update .devkit/state.json after actions |
| `registry-manager.py` | PostToolUse | Manage artifact registry |
| `registry-update.py` | PostToolUse | Update registry.json with Zod parsing |
| `session-manager.py` | SessionStart | Initialize state at session start |

### Automation
| Hook | Trigger | Purpose |
|------|---------|---------|
| `ralph-loop.py` | Stop | Force continuation until completion |
| `auto-answer.py` | UserPromptSubmit | Auto-select recommended options |
| `reground.py` | PostToolUse | Re-inject state every 7 turns |
| `notify.py` | Notification | Push notification when awaiting input |

### Quality & Validation
| Hook | Trigger | Purpose |
|------|---------|---------|
| `format.py` | PostToolUse | Auto-format with Prettier |
| `code-review.py` | Stop | AI review for bugs, security, performance |
| `visual-qa.py` | PostToolUse | Create visual QA task specs |
| `validate-bash.py` | PreToolUse | Validate bash commands |
| `subagent-verify.py` | SubagentStop | Verify subagent output |

### UI & Feedback
| Hook | Trigger | Purpose |
|------|---------|---------|
| `showcase-gen.py` | PostToolUse | Copy showcase templates |
| `completion-links.py` | Stop | Show completion links and results |
| `capacity-warning.py` | PostToolUse | Warn when context capacity low |

---

## 12 Agents

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| `researcher` | Research technologies and documentation | Before implementation, /create workflows |
| `parallel-researcher` | Fast parallel documentation scraper | Phase 3/5, scrape multiple pages simultaneously |
| `research-validator` | Deep dive documentation validator | Phase 3/5, discover ALL endpoints/webhooks/params |
| `schema-generator` | Zod schema generator from research | Phase 6, create TypeScript schemas |
| `test-writer` | Test case generator from schemas | Phase 8 (TDD Red), create failing tests |
| `builder` | Implement features following TDD | After research phase |
| `implementation-reviewer` | Compare implementation to docs | Phase 10, after tests pass |
| `code-reviewer` | Security and performance review | After significant code changes |
| `reviewer` | Quality, security, best practices | Before completing features |
| `visual-analyzer` | Analyze UI screenshots | Visual QA with Playwright |
| `docs-generator` | Generate documentation | APIs, components, workflows |
| `orchestrator` | Coordinate multi-phase workflows | Manage subagent delegation |

---

## State Files

| File | Purpose |
|------|---------|
| `.devkit/state.json` | Current workflow state (ephemeral) |
| `.devkit/registry.json` | Artifact registry (persistent) |
| `.devkit/research/index.json` | Research cache with 7-day freshness |

---

## Generated Outputs

After completing workflows, you get a full developer dashboard:

| Route | Purpose |
|-------|---------|
| `/hustle-dev-tools` | Main dashboard |
| `/hustle-dev-tools/api` | API Showcase - test endpoints interactively |
| `/hustle-dev-tools/ui` | UI Showcase - component gallery |
| `/hustle-dev-tools/tests` | Test Results - Vitest, Playwright, Visual |
| `/hustle-dev-tools/reports` | Playwright Reports - HTML with screenshots |
| `/hustle-dev-tools/docs` | TypeDoc - auto-generated API docs |
| `/hustle-dev-tools/visual-qa` | Visual QA - Haiku analysis results |
| `localhost:6006` | Storybook - component stories |

---

## Quick Start

```bash
# API Development
/api-create stripe-checkout

# UI Development
/hustle-ui-create Button

# TDD Cycle
/red        # Write failing test
/green      # Make it pass
/refactor   # Clean up

# Git
/commit     # Commit changes
/pr         # Create pull request
```
