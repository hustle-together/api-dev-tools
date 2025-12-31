# Hustle Build v4.6 - COMPLETE Testing Checklist

## Purpose
Complete checklist of ALL expected behaviors across:
- CLI Installation (12 steps, 2060-line wizard)
- 30 Commands + 45 Skills = 75 total entry points
- 64 Python Hooks (61 main + 3 lib)
- 9 Subagents
- 47 Template files across 17 directories
- 21 Documentation files + 4 scripts
- 5 MCP Servers
- 22 Parts covering all workflow phases
- **Automations & Auto-behaviors**
- **Integration flows**
- **Error recovery**

## Programmatic Verification (Updated 2025-12-30)
All counts verified via `find` commands against source.

---

# PART 1: CLI INSTALLATION CHECKLIST

## Step 1: Prerequisites
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 1.1 | Node.js 18+ | Version shown, continues | | |
| 1.2 | Python 3 | Version shown or warning | | |

## Step 2: Slash Commands (30 files)
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 2.1 | `.claude/commands/` created | Directory exists | | |
| 2.2 | All .md files copied | 30 command files | | |

### Command Files to Verify (ACTUAL FILE NAMES):
| File | Purpose | Status | Comments |
|------|---------|--------|----------|
| `README.md` | Command documentation | | |
| `hustle-api-create.md` | 14-phase API workflow | | |
| `hustle-api-interview.md` | Research-driven interview | | |
| `hustle-api-research.md` | Adaptive research | | |
| `hustle-api-verify.md` | Re-research verification | | |
| `hustle-api-env.md` | Environment check | | |
| `hustle-api-status.md` | Progress tracking | | |
| `hustle-api-continue.md` | Continue interrupted workflow | | |
| `hustle-api-sessions.md` | Session management | | |
| `hustle-build.md` | Master orchestrator | | |
| `hustle-ui-create.md` | Component creation (14 phases) | | |
| `hustle-ui-create-page.md` | Page creation (14 phases) | | |
| `hustle-combine.md` | API combination (14 phases) | | |
| `red.md` | TDD Red phase | | |
| `green.md` | TDD Green phase | | |
| `refactor.md` | TDD Refactor phase | | |
| `cycle.md` | Full TDD cycle | | |
| `spike.md` | Exploratory coding | | |
| `tdd.md` | TDD workflow reminder | | |
| `commit.md` | Git commit | | |
| `pr.md` | Pull request creation | | |
| `busycommit.md` | Atomic commits | | |
| `plan.md` | Implementation planning | | |
| `issue.md` | GitHub issue analysis | | |
| `gap.md` | Gap analysis | | |
| `summarize.md` | Progress summary | | |
| `worktree-add.md` | Git worktree | | |
| `worktree-cleanup.md` | Worktree cleanup | | |
| `add-command.md` | New command guide | | |
| `beepboop.md` | AI attribution | | |

**NOTE:** Many features exist as SKILLS (in `.skills/`) not commands. See Part 2 for skills.

## Step 3: Hooks Installation (64 files total)
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 3.1 | `.claude/hooks/` created | Directory exists | | |
| 3.2 | `.claude/hooks/lib/` created | Utilities copied | | |
| 3.3 | All .py hooks copied | 61 main + 3 lib = 64 | | |
| 3.4 | Hooks made executable | chmod 755 | | |

### Hook Library Files (lib/):
| File | Purpose | Status | Comments |
|------|---------|--------|----------|
| `lib/__init__.py` | Package init | | |
| `lib/greptile.py` | Greptile API utilities | | |
| `lib/ntfy.py` | NTFY notification utilities | | |

### ALL 61 Hook Files:
| Hook File | Type | Phase/Trigger | Status | Comments |
|-----------|------|---------------|--------|----------|
| `session-startup.py` | SessionStart | Inject state context | | |
| `detect-interruption.py` | SessionStart | Detect interrupted workflows | | |
| `check-update.py` | SessionStart | Package update check | | |
| `orchestrator-session-startup.py` | SessionStart | Orchestrator init | | |
| `parallel-orchestrator.py` | SessionStart/UserPromptSubmit | Parallel execution | | |
| `enforce-external-research.py` | UserPromptSubmit | Require research | | |
| `completion-promise-detector.py` | UserPromptSubmit/PostToolUse | Detect promise | | |
| `enforce-dry-run.py` | PreToolUse(Write/Edit) | Validate dry-run | | |
| `enforce-disambiguation.py` | PreToolUse(Write/Edit) | Phase 1 API | | |
| `enforce-ui-disambiguation.py` | PreToolUse(Write/Edit) | Phase 1 UI | | |
| `enforce-scope.py` | PreToolUse(Write/Edit) | Phase 2 | | |
| `enforce-research.py` | PreToolUse(Write/Edit) | Phase 3 | | |
| `enforce-interview.py` | PreToolUse(Write/Edit) | Phase 4 API | | |
| `enforce-ui-interview.py` | PreToolUse(Write/Edit) | Phase 4 UI | | |
| `enforce-deep-research.py` | PreToolUse(Write/Edit) | Phase 5 | | |
| `enforce-schema.py` | PreToolUse(Write/Edit) | Phase 6 | | |
| `enforce-environment.py` | PreToolUse(Write/Edit) | Phase 7 | | |
| `enforce-tdd-red.py` | PreToolUse(Write/Edit) | Phase 8 | | |
| `verify-implementation.py` | PreToolUse(Write/Edit) | Phase 9 | | |
| `enforce-verify.py` | PreToolUse(Write/Edit) | Phase 10 | | |
| `enforce-refactor.py` | PreToolUse(Write/Edit) | Phase 12 | | |
| `enforce-documentation.py` | PreToolUse(Write/Edit) | Phase 13 | | |
| `enforce-schema-from-interview.py` | PreToolUse(Write/Edit) | Schema validation | | |
| `enforce-freshness.py` | PreToolUse(Write/Edit) | 7-day research | | |
| `enforce-brand-guide.py` | PreToolUse(Write/Edit) | Brand compliance | | |
| `check-storybook-setup.py` | PreToolUse(Write/Edit) | Storybook check | | |
| `check-playwright-setup.py` | PreToolUse(Write/Edit) | Playwright check | | |
| `check-api-routes.py` | PreToolUse(Write/Edit) | Route structure | | |
| `enforce-page-components.py` | PreToolUse(Write/Edit) | Page patterns | | |
| `enforce-page-data-schema.py` | PreToolUse(Write/Edit) | Page schema | | |
| `enforce-questions-sourced.py` | PreToolUse(AskUserQuestion) | Research-derived questions | | |
| `auto-answer.py` | PreToolUse(AskUserQuestion) | Auto mode | | |
| `orchestrator-handoff.py` | PreToolUse(Skill) | Inject shared decisions | | |
| `track-tool-use.py` | PostToolUse(WebSearch/Context7) | Log research | | |
| `periodic-reground.py` | PostToolUse(WebSearch/Context7) | 7-turn context | | |
| `track-scope-coverage.py` | PostToolUse(WebSearch/Context7) | Feature tracking | | |
| `context-capacity-warning.py` | PostToolUse(WebSearch/Context7) | Context warning | | |
| `generate-adr-options.py` | PostToolUse(WebSearch/Context7) | ADR from research | | |
| `ntfy-on-question.py` | PostToolUse(AskUserQuestion) | Push notification | | |
| `update-adr-decision.py` | PostToolUse(AskUserQuestion) | ADR update | | |
| `verify-after-green.py` | PostToolUse(Bash) | Trigger Phase 10 | | |
| `cache-research.py` | PostToolUse(Write/Edit) | Cache to .claude/research | | |
| `generate-manifest-entry.py` | PostToolUse(Write/Edit) | Manifest entry | | |
| `update-registry.py` | PostToolUse(Write/Edit) | Registry update | | |
| `update-api-showcase.py` | PostToolUse(Write/Edit) | API showcase | | |
| `update-ui-showcase.py` | PostToolUse(Write/Edit) | UI showcase | | |
| `enforce-a11y-audit.py` | PostToolUse(Write/Edit) | A11y audit | | |
| `orchestrator-completion.py` | PostToolUse(Skill) | Workflow completion | | |
| `api-workflow-check.py` | Stop | Block incomplete phases | | |
| `session-logger.py` | Stop | Save session logs | | |
| `hook_utils.py` | Utility | Shared functions | | |
| `project-document-prompt.py` | PreToolUse(Skill) | Document intake | | |
| `remote-question-proxy.py` | PreToolUse(AskUserQuestion) | Remote questions | | |
| `remote-question-server.py` | Standalone | HTTP server | | |
| `run-code-review.py` | PostToolUse | Greptile review | | |
| `run-visual-qa.py` | PostToolUse | Haiku visual QA | | |
| `notify-input-needed.py` | PostToolUse | Input notification | | |
| `notify-phase-complete.py` | PostToolUse | Phase notification | | |
| `track-token-usage.py` | PostToolUse | Token tracking | | |
| `docs-update-check.py` | PostToolUse | Docs check | | |
| `enforce-component-type-confirm.py` | PreToolUse | Component type | | |

## Step 4: Subagents (9 files)
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 4.1 | `.claude/agents/` created | Directory exists | | |

### Agent Files:
| Agent File | Model | Purpose | Status | Comments |
|------------|-------|---------|--------|----------|
| `parallel-researcher.md` | Haiku | Parallel doc scraping | | |
| `research-validator.md` | Haiku | Endpoint discovery | | |
| `docs-generator.md` | Haiku | TypeDoc generation | | |
| `visual-analyzer.md` | Haiku | Screenshot analysis | | |
| `adr-researcher.md` | Haiku | ADR option research | | |
| `schema-generator.md` | Sonnet | Zod schema creation | | |
| `test-writer.md` | Sonnet | Comprehensive tests | | |
| `implementation-reviewer.md` | Sonnet | Doc vs code comparison | | |
| `code-reviewer.md` | Sonnet | AI code review | | |

## Step 5: Configuration Files
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 5.1 | `.claude/settings.json` | Hook registrations | | |
| 5.2 | `.claude/api-dev-state.json` | State tracking | | |
| 5.3 | `.claude/registry.json` | Element registry | | |
| 5.4 | `.claude/hustle-build-defaults.json` | **CRITICAL** Auto defaults | | |
| 5.5 | `.claude/research/` | Research cache dir | | |
| 5.6 | `.claude/research/index.json` | Freshness tracking | | |
| 5.7 | `.claude/adr-requests/` | ADR pending requests | | |
| 5.8 | `.claude/adrs/` | ADR decisions | | |
| 5.9 | `.claude/visual-qa/` | Visual QA screenshots | | |

## Step 6: Templates (47 files in 17 directories)
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 6.1 | `templates/` directory | All templates copied | | |

### Template Root Files:
| File | Purpose | Status | Comments |
|------|---------|--------|----------|
| `.env.example` | Environment template | | |
| `BRAND_GUIDE.md` | Brand guide template | | |
| `CLAUDE-SECTION.md` | Claude config section | | |
| `SPEC.json` | Full specification | | |
| `api-dev-state.json` | State template | | |
| `hustle-build-defaults.json` | Auto mode defaults | | |
| `mcp-servers.json` | MCP server config | | |
| `performance-budgets.json` | Performance thresholds | | |
| `registry.json` | Element registry | | |
| `research-index.json` | Research freshness | | |
| `settings.json` | Hook registrations | | |
| `typedoc.json` | TypeDoc config | | |

### Template Directories:
| Directory | Purpose | Key Files | Status |
|-----------|---------|-----------|--------|
| `adr-viewer/` | ADR display | `_components/ADRViewer.tsx` | |
| `api-showcase/` | API dashboard | `page.tsx`, `_components/APICard.tsx`, `APITester.tsx`, `APIShowcase.tsx`, `APIModal.tsx` | |
| `api-test/` | API testing | `page.tsx`, `test-structure/route.ts` | |
| `brand-page/` | Brand display | `page.tsx` | |
| `component/` | Component templates | `Component.tsx`, `.types.ts`, `.test.tsx`, `.stories.tsx`, `.visual.spec.ts`, `index.ts` | |
| `dev-tools/` | Dev tools page | `page.tsx`, `_components/DevToolsLanding.tsx` | |
| `docs/` | Docs page | `page.tsx` | |
| `eslint-plugin-zod-schema/` | Zod ESLint plugin | `index.js`, `package.json` | |
| `github-workflows/` | CI/CD templates | `security.yml` | |
| `hustle-dev-dashboard/` | Dev dashboard | `page.tsx` | |
| `page/` | Page templates | `page.tsx`, `page.e2e.test.ts` | |
| `playwright-report/` | Test reports | `page.tsx` | |
| `review-dashboard/` | Review page | `page.tsx` | |
| `shared/` | Shared components | `HeroHeader.tsx`, `index.ts` | |
| `test-results/` | Test results page | `page.tsx` | |
| `ui-showcase/` | UI dashboard | `page.tsx`, `_components/UIShowcase.tsx`, `PreviewCard.tsx`, `PreviewModal.tsx`, `VisualTestingDashboard.tsx` | |
| `.skills/hustle-interview/` | Interview skill | `SKILL.md` | |

## Step 7: MCP Servers (5 total)
| # | Server | Command | Purpose | Status | Comments |
|---|--------|---------|---------|--------|----------|
| 7.1 | `context7` | `npx -y @upstash/context7-mcp` | Live documentation | | |
| 7.2 | `github` | `npx -y @modelcontextprotocol/server-github` | GitHub integration | | |
| 7.3 | `greptile` | `npx -y @anthropics/mcp-greptile` | AI code review | | |
| 7.4 | `supabase` | (configured) | Database integration | | |
| 7.5 | `linear` | (configured) | Issue tracking | | |

**Verification commands:**
```bash
claude mcp get context7
claude mcp get github
claude mcp get greptile
claude mcp get supabase
claude mcp get linear
```

## Step 8: Environment (.env)
| # | Variable | Purpose | Status | Comments |
|---|----------|---------|--------|----------|
| 8.1 | `GITHUB_TOKEN` | GitHub API access | | |
| 8.2 | `GREPTILE_API_KEY` | Code review | | |
| 8.3 | `BRANDFETCH_API_KEY` | Brand data fetch | | |
| 8.4 | `NTFY_TOPIC` | Push notifications | | |
| 8.5 | `NTFY_SERVER` | Notification server | | |

## Step 9: Brand Guide
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 9.1 | Brandfetch API called | Real data fetched | | |
| 9.2 | Colors as defaults | Interview pre-populated | | |
| 9.3 | `.claude/BRAND_GUIDE.md` | Complete design system | | |

## Step 10: Testing Tools
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 10.1 | Sandpack installed | `@codesandbox/sandpack-react` | | |
| 10.2 | Storybook initialized | `.storybook/` exists | | |
| 10.3 | Playwright initialized | `playwright.config.ts` exists | | |

---

# PART 2: ALL 45 SKILLS INVENTORY (44 main + 1 template)

**Location:** `.skills/[skill-name]/SKILL.md`

## Core Workflow Skills (4 Main - 14 Phases Each)
| # | Skill | Purpose | Phases | Status | Comments |
|---|-------|---------|--------|--------|----------|
| 1 | `/api-create` | Complete API development | 14 phases | | |
| 2 | `/hustle-ui-create` | Component creation | 14 phases | | |
| 3 | `/hustle-ui-create-page` | Page creation | 14 phases | | |
| 4 | `/hustle-combine` | API combination | 14 phases | | |

## Orchestrator Skills
| # | Skill | Purpose | Phases | Status | Comments |
|---|-------|---------|--------|--------|----------|
| 5 | `/hustle-build` | Master orchestrator | 10 phases | | |
| 6 | `/hustle-brand` | Brand guide management | Interview-driven | | |
| 7 | `/hustle-build-review` | Review build decisions | Audit trail | | |

## API Helper Skills
| # | Skill | Purpose | Status | Comments |
|---|-------|---------|--------|----------|
| 8 | `/api-interview` | Research-driven questions | | |
| 9 | `/api-research` | Adaptive documentation | | |
| 10 | `/api-verify` | Re-research verification | | |
| 11 | `/api-env` | Environment check | | |
| 12 | `/api-status` | Progress tracking | | |

## TDD Skills
| # | Skill | Purpose | Status | Comments |
|---|-------|---------|--------|----------|
| 13 | `/red` | Write failing test | | |
| 14 | `/green` | Minimal implementation | | |
| 15 | `/refactor` | Improve while green | | |
| 16 | `/cycle` | Full TDD cycle | | |
| 17 | `/spike` | Exploratory coding | | |
| 18 | `/tdd` | TDD workflow reminder | | |

## Testing Skills
| # | Skill | Purpose | Status | Comments |
|---|-------|---------|--------|----------|
| 19 | `/test-unit` | Vitest unit tests | | |
| 20 | `/test-e2e` | Playwright E2E | | |
| 21 | `/test-visual` | Storybook visual + Haiku | | |
| 22 | `/test-all` | Full test suite | | |
| 23 | `/test-builds` | Platform builds | | |
| 24 | `/test-review` | AI code review | | |
| 25 | `/test-debug` | Test debugging | | |

## Git Skills
| # | Skill | Purpose | Status | Comments |
|---|-------|---------|--------|----------|
| 26 | `/commit` | Semantic commit | | |
| 27 | `/pr` | Pull request | | |
| 28 | `/busycommit` | Atomic commits | | |
| 29 | `/worktree-add` | Git worktree | | |
| 30 | `/worktree-cleanup` | Worktree cleanup | | |
| 31 | `/issue` | GitHub issue | | |

## Planning Skills
| # | Skill | Purpose | Status | Comments |
|---|-------|---------|--------|----------|
| 32 | `/plan` | Implementation plan | | |
| 33 | `/gap` | Gap analysis | | |
| 34 | `/summarize` | Progress summary | | |

## ADR Skills
| # | Skill | Purpose | Status | Comments |
|---|-------|---------|--------|----------|
| 35 | `/adr-deep-research` | ADR option research | | |

## Ralph Wiggum Skills
| # | Skill | Purpose | Status | Comments |
|---|-------|---------|--------|----------|
| 36 | `/ralph-loop` | Self-terminating loops | | |
| 37 | `/ralph-status` | Loop status check | | |
| 38 | `/ralph-continue` | Override promise detection | | |

## Parallel Execution Skills
| # | Skill | Purpose | Status | Comments |
|---|-------|---------|--------|----------|
| 39 | `/parallel-spawn` | Spawn parallel agents | | |

## Utility Skills
| # | Skill | Purpose | Status | Comments |
|---|-------|---------|--------|----------|
| 40 | `/add-command` | New command guide | | |
| 41 | `/shadcn` | shadcn/ui integration | | |
| 42 | `/beepboop` | AI attribution | | |
| 43 | `/token-report` | Token usage | | |
| 44 | `/docs-sync` | Docs synchronization | | |
| 45 | `/docs-update` | Update documentation | | |
| 46 | `/publish` | npm publish | | |
| 47 | `/update-todos` | Todo management | | |

## Special Location Skills
| # | Skill | Location | Purpose | Status | Comments |
|---|-------|----------|---------|--------|----------|
| 48 | `/hustle-interview` | `templates/.skills/` | Interview template | | |

---

# PART 3: /hustle-build PHASES (10 Phases)

## Phase 1: Document Intake
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 1.1 | Prompts for document | AskUserQuestion | | |
| 1.2 | Accepts `--from-document` | File path flag | | |
| 1.3 | Reads document content | File loaded | | |
| 1.4 | Stores `project_spec.raw_content` | State updated | | |

## Phase 2: Document Parsing & Decomposition
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 2.1 | Extracts APIs | Identified correctly | | |
| 2.2 | Extracts Components | Identified correctly | | |
| 2.3 | Extracts Pages | Identified correctly | | |
| 2.4 | Builds dependency graph | Tiers 1-4 | | |
| 2.5 | Shows decomposition | AskUserQuestion | | |
| 2.6 | User approves | Proceeds after approval | | |
| 2.7 | State updated | `decomposition.*` | | |

## Phase 3: Orchestrator Interview
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 3.1 | Authentication question | With context | | |
| 3.2 | Error handling question | With context | | |
| 3.3 | Brand guide question | With context | | |
| 3.4 | Testing level question | With context | | |
| 3.5 | **Questions have CONTEXT** | Explains WHY | | |
| 3.6 | Stores `shared_decisions` | State updated | | |

## Phase 4-6: Sub-Workflow Execution
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 4.1 | **INVOKES /api-create** | Skill tool used! | | |
| 4.2 | Passes element name | `/api-create [name]` | | |
| 4.3 | `orchestrator-handoff.py` fires | Injects decisions | | |
| 4.4 | Sub-workflow runs 14 phases | All phases! | | |
| 4.5 | Research phase executes | Context7/WebSearch | | |
| 4.6 | Interview phase executes | User asked | | |
| 4.7 | TDD phases execute | Tests first | | |
| 4.8 | `orchestrator-completion.py` fires | Detects done | | |
| 4.9 | Updates `completed_sub_workflows[]` | State tracks | | |
| 4.10 | Proceeds to next | Automatic handoff | | |

## Phase 7: Integration & Wiring
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 7.1 | Generates imports | Components → APIs | | |
| 7.2 | Wires prop types | TypeScript connected | | |
| 7.3 | Updates registry | Relationships | | |

## Phase 8: Unified Testing
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 8.1 | Runs all test suites | API + Component + E2E | | |
| 8.2 | Reports results | Pass/fail counts | | |
| 8.3 | Loops if failures | Ralph Wiggum | | |

## Phase 9: Documentation
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 9.1 | Updates registry.json | All elements | | |
| 9.2 | Creates feature docs | `docs/features/` | | |

## Phase 10: Completion
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 10.1 | All workflows complete | `status: "complete"` | | |
| 10.2 | Summary displayed | Counts shown | | |
| 10.3 | NTFY notification | If enabled | | |

---

# PART 4: /api-create PHASES (14 Phases)

## Phase 1: Disambiguation
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 1.1 | WebSearch (2+ variations) | Multiple queries | | |
| 1.2 | `enforce-disambiguation.py` | Blocks if incomplete | | |
| 1.3 | AskUserQuestion used | User selects | | |
| 1.4 | `user_selected` stored | State tracked | | |
| 1.5 | `phase_exit_confirmed` | User approved | | |

## Phase 2: Scope Confirmation
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 2.1 | Endpoint path inferred | `/api/v2/[name]` | | |
| 2.2 | Purpose described | Functional | | |
| 2.3 | External API identified | If applicable | | |
| 2.4 | AskUserQuestion used | "Is this correct?" | | |
| 2.5 | `enforce-scope.py` | Blocks if incomplete | | |
| 2.6 | `user_confirmed` | State updated | | |

## Phase 3: Initial Research
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 3.1 | Context7 used | Official docs | | |
| 3.2 | WebSearch used | Documentation | | |
| 3.3 | **Minimum 2 sources** | `sources[]` has 2+ | | |
| 3.4 | Summary shown | Before approval | | |
| 3.5 | AskUserQuestion used | "Proceed?" | | |
| 3.6 | `enforce-research.py` | Blocks if incomplete | | |
| 3.7 | `user_approved` | State updated | | |

## Phase 4: Interview
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 4.1 | **Minimum 5 questions** | User interaction | | |
| 4.2 | **Minimum 3 structured** | Have `options` | | |
| 4.3 | Questions FROM research | Not templates | | |
| 4.4 | `enforce-interview.py` | Blocks if incomplete | | |
| 4.5 | AskUserQuestion tool | `tool_used = true` | | |
| 4.6 | Final confirmation | "Correct?" | | |
| 4.7 | Decisions stored | `interview.decisions{}` | | |

## Phase 5: Deep Research
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 5.1 | Proposals from interview | Not shotgun | | |
| 5.2 | Proposals shown | Checkbox format | | |
| 5.3 | AskUserQuestion used | "Run these?" | | |
| 5.4 | Only approved run | User controls | | |
| 5.5 | `enforce-deep-research.py` | Blocks if pending | | |

## Phase 6: Schema Creation
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 6.1 | Zod schema generated | Request + Response | | |
| 6.2 | Reflects interview | Fields match | | |
| 6.3 | Schema shown | Before proceeding | | |
| 6.4 | AskUserQuestion used | "Correct?" | | |
| 6.5 | `enforce-schema.py` | Blocks if incomplete | | |
| 6.6 | File created | `schemas/[name].schema.ts` | | |

## Phase 7: Environment Check
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 7.1 | Required keys identified | Based on endpoint | | |
| 7.2 | Environment table | ✓ found / ❌ missing | | |
| 7.3 | AskUserQuestion used | "Ready for TDD?" | | |
| 7.4 | `enforce-environment.py` | Blocks route.ts | | |
| 7.5 | `user_ready` | State updated | | |

## Phase 8: TDD Red
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 8.1 | Test matrix proposed | Success + Error + Edge | | |
| 8.2 | Matrix shown | Before writing | | |
| 8.3 | AskUserQuestion used | "Approve?" | | |
| 8.4 | `enforce-tdd-red.py` | Blocks without tests | | |
| 8.5 | Test file created | `__tests__/[name].test.ts` | | |
| 8.6 | Tests FAIL | Red state | | |

## Phase 9: TDD Green
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 9.1 | Route handler created | `route.ts` | | |
| 9.2 | Uses Zod schema | Validation | | |
| 9.3 | Calls external API | If applicable | | |
| 9.4 | Tests PASS | Green state | | |
| 9.5 | `verify-after-green.py` | PostToolUse fires | | |

## Phase 10: Verify
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 10.1 | **Re-reads original docs** | Same queries | | |
| 10.2 | Gap analysis table | Feature | Docs | Impl | | |
| 10.3 | Analysis shown | Before asking | | |
| 10.4 | AskUserQuestion used | "Fix or skip?" | | |
| 10.5 | `enforce-verify.py` | Blocks Edit | | |
| 10.6 | Loops if "fix" | Returns to Phase 8 | | |

## Phase 11: Code Review
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 11.1 | Greptile API called | If key exists | | |
| 11.2 | Review score | 0-10 | | |
| 11.3 | Issues listed | Bugs, security | | |
| 11.4 | AskUserQuestion used | "Fix issues?" | | |
| 11.5 | `run-code-review.py` | Ralph Wiggum loop | | |

## Phase 12: TDD Refactor
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 12.1 | Review issues fixed | All addressed | | |
| 12.2 | Tests stay green | After each change | | |
| 12.3 | `enforce-refactor.py` | After verify | | |

## Phase 13: Documentation
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 13.1 | Manifest updated | `api-tests-manifest.json` | | |
| 13.2 | Research cached | `.claude/research/[name]/` | | |
| 13.3 | OpenAPI updated | If applicable | | |
| 13.4 | Checklist shown | Files updated | | |
| 13.5 | AskUserQuestion used | "Complete?" | | |
| 13.6 | `enforce-documentation.py` | Blocks completion | | |

## Phase 14: Completion
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 14.1 | All tests passing | Final verification | | |
| 14.2 | TypeScript compiles | No errors | | |
| 14.3 | All 14 phases complete | State updated | | |
| 14.4 | `api-workflow-check.py` | Stop hook verifies | | |

---

# PART 5: /hustle-ui-create PHASES (14 Phases)

## Phase 1: Disambiguation
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 1.1 | Component name clarified | Is it Button or ActionButton? | | |
| 1.2 | AI suggests type | Basic/Complex component | | |
| 1.3 | `enforce-ui-disambiguation.py` | Blocks if ambiguous | | |
| 1.4 | AskUserQuestion used | User confirms name | | |
| 1.5 | `user_selected` stored | State tracked | | |

## Phase 2: Scope Confirmation
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 2.1 | Component path | `src/components/[name]/` | | |
| 2.2 | Type options shown | atom/molecule/organism/template | | |
| 2.3 | `enforce-component-type-confirm.py` | Type confirmed | | |
| 2.4 | Complexity inferred | Based on type | | |
| 2.5 | AskUserQuestion | "Confirm scope?" | | |

## Phase 3: Design Research
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 3.1 | Brand guide check | `enforce-brand-guide.py` | | |
| 3.2 | Context7 for library docs | React/Tailwind/Radix | | |
| 3.3 | WebSearch for patterns | Similar components | | |
| 3.4 | A11y guidelines fetched | WCAG compliance | | |
| 3.5 | Registry patterns | Existing similar components | | |
| 3.6 | Research summary | Shown before proceeding | | |

## Phase 4: Interview (5-10 Questions FROM Research)
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 4.1 | **Minimum 5 questions** | From research findings | | |
| 4.2 | Props questions | Discovered from patterns | | |
| 4.3 | Variant questions | Based on type/research | | |
| 4.4 | State management | Local vs lifted | | |
| 4.5 | Styling approach | Tailwind/CSS modules | | |
| 4.6 | A11y requirements | From WCAG research | | |
| 4.7 | `enforce-ui-interview.py` | Blocks incomplete | | |
| 4.8 | Final confirmation | "Decisions correct?" | | |

## Phase 5: Component Analysis
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 5.1 | Check ShadCN registry | Existing component? | | |
| 5.2 | Check project registry | Similar component exists? | | |
| 5.3 | Dependencies identified | What this component needs | | |
| 5.4 | Proposals shown | "Use ShadCN Button as base?" | | |
| 5.5 | AskUserQuestion | User approves approach | | |

## Phase 6: Props Schema
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 6.1 | TypeScript interface | Props from interview | | |
| 6.2 | Variant types | Union types | | |
| 6.3 | Default values | Sensible defaults | | |
| 6.4 | Event handlers | Callbacks typed | | |
| 6.5 | `enforce-schema.py` | Validates schema | | |
| 6.6 | Schema shown | "Props correct?" | | |

## Phase 7: Environment Check (Storybook)
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 7.1 | `check-storybook-setup.py` | Storybook exists | | |
| 7.2 | Config files present | main.ts, preview.ts | | |
| 7.3 | Addon compatibility | Verified | | |
| 7.4 | Brand theme decorator | In preview.tsx | | |
| 7.5 | AskUserQuestion | "Ready for TDD?" | | |

## Phase 8: TDD Red (Unit Tests + Stories)
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 8.1 | Test matrix proposed | Render, variants, events, a11y | | |
| 8.2 | Matrix shown | Before writing | | |
| 8.3 | AskUserQuestion | "Approve test plan?" | | |
| 8.4 | `enforce-tdd-red.py` | Blocks without tests | | |
| 8.5 | Unit tests created | Vitest | | |
| 8.6 | Stories created | All variants | | |
| 8.7 | Interaction tests | User flows | | |
| 8.8 | A11y tests | Storybook a11y addon | | |
| 8.9 | Visual regression baseline | Chromatic/Percy | | |
| 8.10 | Tests FAIL | Red state | | |

## Phase 9: TDD Green (Implementation)
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 9.1 | Component created | `[name].tsx` | | |
| 9.2 | Uses props interface | TypeScript | | |
| 9.3 | `enforce-brand-guide.py` | Uses brand colors | | |
| 9.4 | Implements variants | All from interview | | |
| 9.5 | Stories render | Visual check | | |
| 9.6 | Tests PASS | Green state | | |

## Phase 10: 5-Step Verify
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 10.1 | **Responsive check** | All 7 viewports | | |
| 10.2 | **Brand compliance** | Colors, typography | | |
| 10.3 | **Tests passing** | All tests green | | |
| 10.4 | **Performance check** | No unnecessary re-renders | | |
| 10.5 | **Visual consistency** | Matches design | | |
| 10.6 | `enforce-verify.py` | Blocks if gaps | | |
| 10.7 | Gap analysis shown | Before asking | | |
| 10.8 | AskUserQuestion | "Fix or skip gaps?" | | |

## Phase 11: Code Review
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 11.1 | Greptile API called | If key exists | | |
| 11.2 | Review score | 0-10 | | |
| 11.3 | Issues listed | Bugs, a11y, perf | | |
| 11.4 | AskUserQuestion | "Fix issues?" | | |
| 11.5 | `run-code-review.py` | Ralph Wiggum loop | | |

## Phase 12: TDD Refactor
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 12.1 | Review issues fixed | All addressed | | |
| 12.2 | A11y issues fixed | WCAG compliant | | |
| 12.3 | Performance optimized | Memoization if needed | | |
| 12.4 | Tests stay green | After each change | | |
| 12.5 | `enforce-refactor.py` | After verify | | |

## Phase 13: Documentation
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 13.1 | `update-ui-showcase.py` | Showcase updated | | |
| 13.2 | `update-registry.py` | Registry entry | | |
| 13.3 | JSDoc comments | Props documented | | |
| 13.4 | Usage examples | In story docs | | |
| 13.5 | A11y documentation | Keyboard, screen reader | | |
| 13.6 | `enforce-documentation.py` | Blocks completion | | |

## Phase 14: Completion
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 14.1 | All tests passing | Unit + Visual + A11y | | |
| 14.2 | Stories all render | No errors | | |
| 14.3 | Haiku visual QA | `<promise>VISUAL_CLEAN</promise>` | | |
| 14.4 | Registry updated | Component entry | | |
| 14.5 | State updated | `status: complete` | | |
| 14.6 | `api-workflow-check.py` | Stop hook verifies | | |

---

# PART 6: /hustle-ui-create-page PHASES (14 Phases)

## Phase 1: Page Type Selection
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 1.1 | Page type options | Landing/Dashboard/Form/List/Detail/Auth | | |
| 1.2 | Route path defined | `/weather`, `/dashboard` | | |
| 1.3 | AskUserQuestion | User selects type | | |
| 1.4 | `enforce-ui-disambiguation.py` | Type confirmed | | |

## Phase 2: Scope Confirmation
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 2.1 | Page path | `src/app/[route]/page.tsx` | | |
| 2.2 | Data requirements | What APIs needed? | | |
| 2.3 | Required components | Listed | | |
| 2.4 | AskUserQuestion | "Confirm scope?" | | |
| 2.5 | `enforce-scope.py` | Validates | | |

## Phase 3: Research (Page Patterns)
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 3.1 | Next.js App Router | Server components docs | | |
| 3.2 | Data fetching | Loading/error patterns | | |
| 3.3 | SEO metadata | Title, description patterns | | |
| 3.4 | Similar pages | From registry | | |
| 3.5 | Research summary | Shown before proceeding | | |

## Phase 4: Interview (Page-Specific Questions FROM Research)
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 4.1 | **Minimum 5 questions** | From research findings | | |
| 4.2 | Layout questions | Header/footer/sidebar | | |
| 4.3 | State management | Client vs server components | | |
| 4.4 | Loading strategy | Streaming/suspense | | |
| 4.5 | Error handling | Error boundaries | | |
| 4.6 | SEO requirements | Metadata, OG tags | | |
| 4.7 | `enforce-ui-interview.py` | Blocks incomplete | | |
| 4.8 | Final confirmation | "Decisions correct?" | | |

## Phase 5: Page Analysis
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 5.1 | Check registry components | Which exist? | | |
| 5.2 | Check registry APIs | Which exist? | | |
| 5.3 | Missing components | Need to create? | | |
| 5.4 | Missing APIs | Need to create? | | |
| 5.5 | `enforce-page-components.py` | Dependencies exist | | |
| 5.6 | AskUserQuestion | "Create missing first?" | | |

## Phase 6: Data Schema
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 6.1 | Page props defined | TypeScript interface | | |
| 6.2 | API response types | Imported from schemas | | |
| 6.3 | Server action types | If applicable | | |
| 6.4 | `enforce-page-data-schema.py` | Schema complete | | |
| 6.5 | Schema shown | "Correct?" | | |

## Phase 7: Environment Check (Playwright)
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 7.1 | `check-playwright-setup.py` | Playwright ready | | |
| 7.2 | Config files present | playwright.config.ts | | |
| 7.3 | Test utils exist | Page fixtures | | |
| 7.4 | AskUserQuestion | "Ready for TDD?" | | |

## Phase 8: TDD Red (E2E Tests)
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 8.1 | Test matrix proposed | Navigation, data, interactions | | |
| 8.2 | Matrix shown | Before writing | | |
| 8.3 | AskUserQuestion | "Approve test plan?" | | |
| 8.4 | `enforce-tdd-red.py` | Blocks without tests | | |
| 8.5 | E2E test file | User journeys | | |
| 8.6 | Tests FAIL | No page yet | | |

## Phase 9: TDD Green (Page Implementation)
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 9.1 | Page component | `page.tsx` | | |
| 9.2 | Layout component | `layout.tsx` if needed | | |
| 9.3 | Loading states | `loading.tsx` | | |
| 9.4 | Error states | `error.tsx` | | |
| 9.5 | Not found | `not-found.tsx` if needed | | |
| 9.6 | Metadata export | SEO tags | | |
| 9.7 | Tests PASS | Green state | | |

## Phase 10: Verify (5-Step Page Verify)
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 10.1 | **E2E tests pass** | All journeys | | |
| 10.2 | **Responsive check** | All 7 viewports | | |
| 10.3 | **Data flow check** | API → Component → Render | | |
| 10.4 | **Loading states** | Skeleton/spinner shows | | |
| 10.5 | **Error states** | Error boundary shows | | |
| 10.6 | `enforce-verify.py` | Blocks if gaps | | |
| 10.7 | Gap analysis shown | Before asking | | |
| 10.8 | AskUserQuestion | "Fix or skip gaps?" | | |

## Phase 11: Code Review
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 11.1 | Greptile API called | If key exists | | |
| 11.2 | Review score | 0-10 | | |
| 11.3 | Issues listed | Performance, SEO, a11y | | |
| 11.4 | AskUserQuestion | "Fix issues?" | | |
| 11.5 | `run-code-review.py` | Ralph Wiggum loop | | |

## Phase 12: TDD Refactor
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 12.1 | Review issues fixed | All addressed | | |
| 12.2 | Performance optimized | RSC usage, caching | | |
| 12.3 | SEO optimized | Metadata complete | | |
| 12.4 | Tests stay green | After each change | | |
| 12.5 | `enforce-refactor.py` | After verify | | |

## Phase 13: Documentation
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 13.1 | Route documented | In registry | | |
| 13.2 | Data flow diagram | If complex | | |
| 13.3 | Component usage | Which components used | | |
| 13.4 | API dependencies | Which APIs used | | |
| 13.5 | `update-registry.py` | Page entry | | |
| 13.6 | `enforce-documentation.py` | Blocks completion | | |

## Phase 14: Completion
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 14.1 | E2E tests pass | Full user flows | | |
| 14.2 | Page renders | No errors | | |
| 14.3 | Lighthouse score | Performance check | | |
| 14.4 | Registry updated | Page entry | | |
| 14.5 | State updated | `status: complete` | | |
| 14.6 | `api-workflow-check.py` | Stop hook verifies | | |

---

# PART 7: AUTOMATIONS & AUTO-BEHAVIORS

These happen automatically WITHOUT explicit commands:

## Research Freshness (7-day)
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 7.1 | `.claude/research/index.json` | Tracks timestamps | |
| 7.2 | `enforce-freshness.py` | Blocks stale research | |
| 7.3 | Auto-prompt | "Research is 8 days old, re-research?" | |
| 7.4 | Re-research triggers | Phase 3 restarts | |

## Context Re-grounding (7 turns)
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 7.5 | `periodic-reground.py` | Counts tool uses | |
| 7.6 | Every 7 WebSearch/Context7 | Injects context | |
| 7.7 | Includes | Active endpoint, phase, decisions | |
| 7.8 | Prevents context dilution | Maintains focus | |

## Ralph Wiggum Loop Termination
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 7.9 | `<promise>DONE</promise>` | Emitted at completion | |
| 7.10 | `completion-promise-detector.py` | Detects promise | |
| 7.11 | Loop exits | Prevents infinite loops | |
| 7.12 | Max iterations | 10 default | |

## Interview Defaults Injection
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 7.13 | `.claude/hustle-build-defaults.json` | Has defaults | |
| 7.14 | `auto-answer.py` | Auto-fills answers | |
| 7.15 | Brand colors | Pre-populated in interview | |
| 7.16 | API keys status | Pre-detected | |

## Orchestrator Handoff
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 7.17 | `orchestrator-handoff.py` | PreToolUse(Skill) | |
| 7.18 | Injects | `shared_decisions` from parent | |
| 7.19 | Sub-workflow receives | Auth, error handling, etc. | |

## Orchestrator Completion Detection
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 7.20 | `orchestrator-completion.py` | PostToolUse(Skill) | |
| 7.21 | Detects | Sub-workflow completion | |
| 7.22 | Updates | `completed_sub_workflows[]` | |
| 7.23 | Triggers | Next workflow in queue | |

## Showcase Auto-Updates
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 7.24 | `update-api-showcase.py` | After route.ts written | |
| 7.25 | `update-ui-showcase.py` | After component written | |
| 7.26 | Dashboard updated | New card appears | |

## Registry Auto-Updates
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 7.27 | `update-registry.py` | After any element | |
| 7.28 | `.claude/registry.json` | Entry added | |
| 7.29 | Tracks | Name, type, path, status | |

## ADR Auto-Generation
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 7.30 | `generate-adr-options.py` | After research | |
| 7.31 | Creates | ADR skeleton with options | |
| 7.32 | `update-adr-decision.py` | After interview answer | |
| 7.33 | Records | User decision + rationale | |

## Session State Injection
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 7.34 | `session-startup.py` | At session start | |
| 7.35 | Reads | `api-dev-state.json` | |
| 7.36 | Injects | Current phase, decisions | |
| 7.37 | Agent aware | Knows where to resume | |

## Interruption Detection
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 7.38 | `detect-interruption.py` | At session start | |
| 7.39 | Checks | `status: "in_progress"` | |
| 7.40 | Prompts | "Resume from Phase X?" | |

## Version Check
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 7.41 | `check-update.py` | At session start | |
| 7.42 | Compares | npm registry version | |
| 7.43 | Notifies | "Update available: X.Y.Z" | |

---

# PART 8: INTEGRATION FLOWS

How elements connect and wire together:

## API → Component Integration
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 8.1 | Response types | Exported from schema | |
| 8.2 | Component imports | Uses API types | |
| 8.3 | Fetch hook | Custom hook or direct | |
| 8.4 | Error handling | Component shows error | |
| 8.5 | Loading state | Component shows loading | |

## Component → Page Integration
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 8.6 | Props alignment | Page passes correct props | |
| 8.7 | Import paths | Correct relative paths | |
| 8.8 | Composition | Components arranged | |
| 8.9 | State lifting | If needed between components | |

## Brand Guide → Component Integration
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 8.10 | Colors | From BRAND_GUIDE.md | |
| 8.11 | Typography | Font family, sizes | |
| 8.12 | Spacing | Consistent scale | |
| 8.13 | `enforce-brand-guide.py` | Validates usage | |

## Test → Implementation Integration
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 8.14 | Test imports | Can import SUT | |
| 8.15 | Mocks | MSW or similar | |
| 8.16 | Coverage | Tests cover implementation | |

## Storybook → Component Integration
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 8.17 | Stories import | Component correctly | |
| 8.18 | Args match | Props interface | |
| 8.19 | Decorators | Theme, routing, etc. | |

---

# PART 9: ERROR RECOVERY FLOWS

What happens when things go wrong:

## Hook Block Recovery
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 9.1 | Hook returns `"block"` | Operation prevented | |
| 9.2 | User message | Explains what's missing | |
| 9.3 | Suggested action | How to unblock | |
| 9.4 | Agent adapts | Does required step | |

## State Corruption Recovery
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 9.5 | Invalid JSON | Parse error caught | |
| 9.6 | Backup exists | `.claude/api-dev-state.backup.json` | |
| 9.7 | Reset option | `/api-status --reset` | |
| 9.8 | Manual fix | User can edit JSON | |

## Test Failure Recovery
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 9.9 | Tests fail | Red state | |
| 9.10 | Error shown | Failure reason | |
| 9.11 | Loop back | To green phase | |
| 9.12 | Max retries | 3 attempts default | |

## Research Failure Recovery
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 9.13 | Context7 fails | Falls back to WebSearch | |
| 9.14 | WebSearch fails | Manual input prompt | |
| 9.15 | Cached exists | Uses cached research | |

## Build Failure Recovery
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 9.16 | TypeScript error | Shown to user | |
| 9.17 | Suggested fix | Based on error | |
| 9.18 | Loop back | To implementation | |

---

# PART 10: HOOK REGISTRATION MATRIX

## settings.json Hook Registration

### SessionStart Hooks (5 hooks)
| Hook | Registered | Verified |
|------|------------|----------|
| `session-startup.py` | ✓ | |
| `detect-interruption.py` | ✓ | |
| `check-update.py` | ✓ | |
| `orchestrator-session-startup.py` | ✓ | |
| `parallel-orchestrator.py` | ✓ | |

### UserPromptSubmit Hooks (3 hooks)
| Hook | Registered | Verified |
|------|------------|----------|
| `enforce-external-research.py` | ✓ | |
| `parallel-orchestrator.py` | ✓ | |
| `completion-promise-detector.py` | ✓ | |

### PreToolUse(Write|Edit) Hooks (23 hooks)
| Hook | Registered | Verified |
|------|------------|----------|
| `enforce-dry-run.py` | ✓ | |
| `enforce-disambiguation.py` | ✓ | |
| `enforce-ui-disambiguation.py` | ✓ | |
| `enforce-scope.py` | ✓ | |
| `enforce-research.py` | ✓ | |
| `enforce-interview.py` | ✓ | |
| `enforce-ui-interview.py` | ✓ | |
| `enforce-deep-research.py` | ✓ | |
| `enforce-schema.py` | ✓ | |
| `enforce-environment.py` | ✓ | |
| `enforce-tdd-red.py` | ✓ | |
| `verify-implementation.py` | ✓ | |
| `enforce-verify.py` | ✓ | |
| `enforce-refactor.py` | ✓ | |
| `enforce-documentation.py` | ✓ | |
| `enforce-schema-from-interview.py` | ✓ | |
| `enforce-freshness.py` | ✓ | |
| `enforce-brand-guide.py` | ✓ | |
| `check-storybook-setup.py` | ✓ | |
| `check-playwright-setup.py` | ✓ | |
| `check-api-routes.py` | ✓ | |
| `enforce-page-components.py` | ✓ | |
| `enforce-page-data-schema.py` | ✓ | |

### PreToolUse(AskUserQuestion) Hooks (2 hooks)
| Hook | Registered | Verified |
|------|------------|----------|
| `enforce-questions-sourced.py` | ✓ | |
| `auto-answer.py` | ✓ | |

### PreToolUse(Skill) Hooks (1 hook)
| Hook | Registered | Verified |
|------|------------|----------|
| `orchestrator-handoff.py` | ✓ | |

### PostToolUse(WebSearch|WebFetch|mcp__context7.*|AskUserQuestion) Hooks (5 hooks)
| Hook | Registered | Verified |
|------|------------|----------|
| `track-tool-use.py` | ✓ | |
| `periodic-reground.py` | ✓ | |
| `track-scope-coverage.py` | ✓ | |
| `context-capacity-warning.py` | ✓ | |
| `generate-adr-options.py` | ✓ | |

### PostToolUse(AskUserQuestion) Hooks (2 hooks)
| Hook | Registered | Verified |
|------|------------|----------|
| `ntfy-on-question.py` | ✓ | |
| `update-adr-decision.py` | ✓ | |

### PostToolUse(Bash) Hooks (2 hooks)
| Hook | Registered | Verified |
|------|------------|----------|
| `verify-after-green.py` | ✓ | |
| `completion-promise-detector.py` | ✓ | |

### PostToolUse(Write|Edit) Hooks (7 hooks)
| Hook | Registered | Verified |
|------|------------|----------|
| `cache-research.py` | ✓ | |
| `generate-manifest-entry.py` | ✓ | |
| `update-registry.py` | ✓ | |
| `update-api-showcase.py` | ✓ | |
| `update-ui-showcase.py` | ✓ | |
| `enforce-a11y-audit.py` | ✓ | |
| `completion-promise-detector.py` | ✓ | |

### PostToolUse(Skill) Hooks (1 hook)
| Hook | Registered | Verified |
|------|------------|----------|
| `orchestrator-completion.py` | ✓ | |

### Stop Hooks (2 hooks)
| Hook | Registered | Verified |
|------|------------|----------|
| `api-workflow-check.py` | ✓ | |
| `session-logger.py` | ✓ | |

---

# PART 11: MCP TOOLS AVAILABLE

## context7 MCP
| Tool | Purpose | Status |
|------|---------|--------|
| `mcp__context7__resolve-library-id` | Find library ID | |
| `mcp__context7__query-docs` | Query documentation | |

## github MCP
| Tool | Purpose | Status |
|------|---------|--------|
| `mcp__github__create_or_update_file` | File operations | |
| `mcp__github__search_repositories` | Repo search | |
| `mcp__github__create_repository` | Create repo | |
| `mcp__github__get_file_contents` | Read files | |
| `mcp__github__push_files` | Push multiple | |
| `mcp__github__create_issue` | Create issue | |
| `mcp__github__create_pull_request` | Create PR | |
| `mcp__github__list_issues` | List issues | |
| `mcp__github__get_issue` | Get issue | |
| `mcp__github__get_pull_request` | Get PR | |
| `mcp__github__list_pull_requests` | List PRs | |
| `mcp__github__create_pull_request_review` | Review PR | |
| `mcp__github__merge_pull_request` | Merge PR | |
| `mcp__github__get_pull_request_files` | PR files | |
| `mcp__github__get_pull_request_status` | PR status | |

## supabase MCP
| Tool | Purpose | Status |
|------|---------|--------|
| `mcp__supabase__search_docs` | Search Supabase docs | |
| `mcp__supabase__list_projects` | List projects | |
| `mcp__supabase__get_project` | Get project | |
| `mcp__supabase__list_tables` | List tables | |
| `mcp__supabase__execute_sql` | Execute SQL | |
| `mcp__supabase__apply_migration` | Apply migration | |
| `mcp__supabase__get_logs` | Get logs | |
| `mcp__supabase__deploy_edge_function` | Deploy function | |

## linear MCP
| Tool | Purpose | Status |
|------|---------|--------|
| `mcp__linear__list_issues` | List issues | |
| `mcp__linear__get_issue` | Get issue | |
| `mcp__linear__create_issue` | Create issue | |
| `mcp__linear__update_issue` | Update issue | |
| `mcp__linear__list_projects` | List projects | |
| `mcp__linear__list_teams` | List teams | |

## playwright MCP (if configured)
| Tool | Purpose | Status |
|------|---------|--------|
| `mcp__playwright__*` | Browser automation | |

---

# PART 12: STATE FILE SCHEMAS

## .claude/api-dev-state.json
```json
{
  "version": "4.0.0",
  "active_endpoint": "[name]",
  "phases": {
    "disambiguation": { "status": "", "user_selected": "", "phase_exit_confirmed": false },
    "scope": { "status": "", "user_confirmed": false, "phase_exit_confirmed": false },
    "research_initial": { "status": "", "sources": [], "user_approved": false },
    "interview": { "status": "", "questions": [], "decisions": {}, "user_completed": false },
    "research_deep": { "status": "", "proposed_searches": [], "approved_searches": [] },
    "schema_creation": { "status": "", "schema_file": "", "user_confirmed": false },
    "environment_check": { "status": "", "keys_required": [], "user_ready": false },
    "tdd_red": { "status": "", "test_scenarios": [], "user_approved": false },
    "tdd_green": { "status": "", "all_tests_passing": false },
    "verify": { "status": "", "re_research_done": false, "gaps_found": 0 },
    "code_review": { "status": "", "score": 0, "issues_found": 0 },
    "tdd_refactor": { "status": "" },
    "documentation": { "status": "", "manifest_updated": false },
    "completion": { "status": "" }
  }
}
```

## .claude/hustle-build-state.json
```json
{
  "version": "4.6.0",
  "build_id": "build-[timestamp]-[name]",
  "status": "in_progress|complete",
  "mode": "interactive|auto|parallel",
  "project_spec": {
    "source": "file|paste|url|none",
    "raw_content": "",
    "extracted": { "apis": [], "components": [], "pages": [] }
  },
  "orchestrator_interview": {
    "status": "complete",
    "decisions": {}
  },
  "decomposition": {
    "apis": [{ "name": "", "status": "", "depends_on": [], "tier": 1 }],
    "components": [{ "name": "", "status": "", "depends_on": [], "tier": 2 }],
    "pages": [{ "name": "", "status": "", "depends_on": [], "tier": 4 }]
  },
  "shared_decisions": {
    "auth_required": false,
    "error_handling": "partial-success",
    "brand_guide": true,
    "testing_level": "full"
  },
  "active_sub_workflow": null,
  "completed_sub_workflows": []
}
```

## .claude/hustle-build-defaults.json
```json
{
  "orchestrator_interview": {
    "auth_required": false,
    "error_handling": "partial-success",
    "brand_guide": true,
    "testing_level": "full"
  },
  "brand_colors": {
    "primary": "#000000",
    "secondary": "#ffffff",
    "accent": "#0066cc"
  },
  "api_keys_detected": {
    "GITHUB_TOKEN": true,
    "GREPTILE_API_KEY": false
  }
}
```

---

# PART 13: ISSUES FOUND IN TEST RUN

## Critical Issues
| # | Issue | Expected | Actual | Severity |
|---|-------|----------|--------|----------|
| 1 | Sub-workflows not invoked | `/api-create` skill called | Files written directly | CRITICAL |
| 2 | 14 phases skipped | Full TDD cycle | Jumps to implementation | CRITICAL |
| 3 | State write error | State saved | "Error writing file" | CRITICAL |
| 4 | Interview UX terrible | Context-rich questions | Bare questions | HIGH |
| 5 | No pre-interview research | Research first | No research | HIGH |
| 6 | Questions lack descriptions | Options with descriptions | Label only | MEDIUM |

## Root Causes to Investigate
1. Is SKILL.md telling Claude to use `/api-create` skill or just describing what to do?
2. Why did state write fail? Permissions? Path? JSON error?
3. Why is interview not using research findings?

---

# PART 14: AMBIGUOUS AREAS / EDGE CASES

Things that might not be clear or could break:

## Sub-Workflow Invocation
| # | Question | Expected Answer | Status |
|---|----------|-----------------|--------|
| 14.1 | How does orchestrator invoke sub-workflows? | Uses Skill tool | UNKNOWN |
| 14.2 | Can SKILL.md tell Claude to use Skill tool? | Yes via instructions | UNKNOWN |
| 14.3 | What if skill doesn't exist? | Error or fallback? | UNKNOWN |

## State Persistence
| # | Question | Expected Answer | Status |
|---|----------|-----------------|--------|
| 14.4 | Where is state read from? | .claude/api-dev-state.json | |
| 14.5 | When is state written? | After each phase | |
| 14.6 | What if write fails? | Retry? Error? | UNKNOWN |
| 14.7 | Cross-session persistence | State survives restart | |

## Hook Ordering
| # | Question | Expected Answer | Status |
|---|----------|-----------------|--------|
| 14.8 | Multiple hooks same trigger | All run in order | |
| 14.9 | If one blocks, others run? | No, blocked | |
| 14.10 | Can hook modify tool params? | Yes via response | |

## Interview Flow
| # | Question | Expected Answer | Status |
|---|----------|-----------------|--------|
| 14.11 | Questions come from where? | Research findings | |
| 14.12 | What if no research done? | Hook blocks | |
| 14.13 | Default answers source? | hustle-build-defaults.json | |

## Parallel Execution
| # | Question | Expected Answer | Status |
|---|----------|-----------------|--------|
| 14.14 | Can APIs run in parallel? | If no dependencies | |
| 14.15 | How does parallel track state? | Separate worktrees | |
| 14.16 | Merge conflicts? | User resolves | |

## Error Propagation
| # | Question | Expected Answer | Status |
|---|----------|-----------------|--------|
| 14.17 | If sub-workflow fails? | Orchestrator notified | |
| 14.18 | Partial completion? | State tracks partial | |
| 14.19 | Resume after error? | From failed phase | |

---

# PART 15: /hustle-combine PHASES (14 Phases)

## Phase 1: API Selection
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 1.1 | Registry loaded | `.claude/registry.json` read | | |
| 1.2 | Available APIs shown | Checkbox multi-select | | |
| 1.3 | User selects 2+ APIs | AskUserQuestion | | |
| 1.4 | Selection stored | `selected_apis[]` | | |

## Phase 2: Scope Confirmation
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 2.1 | Combined endpoint path | `/api/v2/[combined-name]` | | |
| 2.2 | Execution order shown | Sequential/parallel | | |
| 2.3 | AskUserQuestion | "Confirm scope?" | | |
| 2.4 | `enforce-scope.py` | Validates | | |

## Phase 3: Initial Research
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 3.1 | Individual API schemas | Read from files | | |
| 3.2 | Pattern research | BFF patterns, aggregation | | |
| 3.3 | Context7/WebSearch | Composition patterns | | |
| 3.4 | Research summary | Shown to user | | |

## Phase 4: Interview
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 4.1 | Endpoint naming | Combined name options | | |
| 4.2 | Execution order | Sequential vs parallel | | |
| 4.3 | Error handling | Fail-fast vs partial | | |
| 4.4 | Data transformation | Merge strategy | | |
| 4.5 | Caching strategy | Unified or per-API | | |
| 4.6 | `enforce-interview.py` | Blocks if incomplete | | |

## Phase 5: Deep Research
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 5.1 | Proposals based on interview | Not generic | | |
| 5.2 | User approves searches | Checkbox format | | |
| 5.3 | Error composition patterns | If fail-fast chosen | | |

## Phase 6: Combined Schema Creation
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 6.1 | Imports existing schemas | From selected APIs | | |
| 6.2 | Composes Zod schemas | Using `.merge()`, `.extend()` | | |
| 6.3 | Combined request schema | Union of params | | |
| 6.4 | Combined response schema | Merged responses | | |
| 6.5 | AskUserQuestion | "Schema correct?" | | |
| 6.6 | `enforce-schema.py` | Validates | | |

## Phase 7: Environment Check
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 7.1 | All API keys identified | From each sub-API | | |
| 7.2 | Combined table | All keys status | | |
| 7.3 | AskUserQuestion | "Ready?" | | |

## Phase 8: TDD Red
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 8.1 | Test matrix | Success, partial fail, full fail, edge | | |
| 8.2 | Mocks for each sub-API | MSW handlers | | |
| 8.3 | Tests FAIL | No implementation | | |
| 8.4 | `enforce-tdd-red.py` | Validates | | |

## Phase 9: TDD Green
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 9.1 | Combined route handler | `route.ts` | | |
| 9.2 | Calls sub-APIs | In configured order | | |
| 9.3 | Error handling | As per interview | | |
| 9.4 | Data transformation | Merge logic | | |
| 9.5 | Tests PASS | Green state | | |

## Phase 10: Verify
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 10.1 | Re-read sub-API docs | Fresh research | | |
| 10.2 | Gap analysis | Combined vs individual | | |
| 10.3 | AskUserQuestion | "Fix gaps?" | | |
| 10.4 | `enforce-verify.py` | Validates | | |

## Phase 11: Code Review
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 11.1 | Greptile review | All combined code | | |
| 11.2 | Race conditions | Parallel calls | | |
| 11.3 | Error propagation | Correct handling | | |
| 11.4 | `run-code-review.py` | Ralph Wiggum loop | | |

## Phase 12: TDD Refactor
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 12.1 | Issues fixed | From review | | |
| 12.2 | Shared utilities | Extracted if needed | | |
| 12.3 | Tests stay green | After each change | | |

## Phase 13: Documentation
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 13.1 | Registry updated | Combined API entry | | |
| 13.2 | Dependencies recorded | Links to sub-APIs | | |
| 13.3 | API showcase | Updated with combined | | |

## Phase 14: Completion
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 14.1 | All tests passing | Combined + sub-APIs | | |
| 14.2 | State updated | `status: complete` | | |
| 14.3 | `api-workflow-check.py` | Stop hook verifies | | |

---

# PART 16: ADR (Architecture Decision Records) FLOW

The ADR system automatically captures significant architectural decisions during research.

## ADR Detection & Generation
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 16.1 | `generate-adr-options.py` | PostToolUse(WebSearch) | | |
| 16.2 | Detects decision patterns | Database, auth, cache, etc. | | |
| 16.3 | Creates pending request | `.claude/adr-requests/pending-{category}.json` | | |
| 16.4 | Categories detected | database, auth, cache, hosting, state, styling | | |

## ADR Categories
| Category | Trigger Patterns | Example |
|----------|-----------------|---------|
| `database` | postgres, mysql, mongodb, supabase | Database choice |
| `auth` | authentication, oauth, jwt, session | Auth strategy |
| `cache` | redis, memcached, caching | Cache layer |
| `hosting` | vercel, aws, cloudflare | Deployment target |
| `state` | redux, zustand, context | State management |
| `styling` | tailwind, styled-components, css modules | Styling approach |

## /adr-deep-research Skill
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 16.5 | Reads pending request | From `.claude/adr-requests/` | | |
| 16.6 | Spawns parallel agents | `adr-researcher.md` | | |
| 16.7 | Each agent researches | Different options | | |
| 16.8 | Results compiled | Comparison matrix | | |
| 16.9 | AskUserQuestion | "Which option?" | | |
| 16.10 | Decision recorded | `.claude/adrs/ADR-NNNN-{category}.md` | | |

## ADR Decision Recording
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 16.11 | `update-adr-decision.py` | PostToolUse(AskUserQuestion) | | |
| 16.12 | Matches ADR categories | In question options | | |
| 16.13 | Updates ADR file | With selected option | | |
| 16.14 | Records rationale | From research findings | | |
| 16.15 | Links to sources | Research URLs | | |

## ADR File Structure
```markdown
# ADR-0001: Database Selection

## Status
Accepted

## Context
[Auto-generated from research findings]

## Options Considered
1. PostgreSQL (via Supabase)
2. MongoDB Atlas
3. PlanetScale (MySQL)

## Decision
PostgreSQL via Supabase

## Rationale
[From user selection + research]

## Sources
- [Link 1]
- [Link 2]
```

## ADR Integration Points
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 16.16 | ADR influences schema | Types reflect decision | | |
| 16.17 | ADR influences implementation | Uses chosen stack | | |
| 16.18 | ADR in documentation | Referenced in docs | | |

---

# PART 17: HAIKU VISUAL QA FLOW

AI-powered visual testing using Claude Haiku for screenshot analysis.

## /test-visual Skill Flow
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 17.1 | Skill invoked | `/test-visual` or `/test-visual [component]` | | |
| 17.2 | Storybook running | Dev server started | | |
| 17.3 | Component identified | From args or context | | |

## Viewport Testing Matrix (7 Viewports)
| Viewport | Dimensions | Purpose |
|----------|------------|---------|
| `mobile-portrait` | 375x667 | iPhone SE |
| `mobile-notch` | 390x844 | iPhone 14 |
| `mobile-landscape` | 667x375 | Landscape phone |
| `tablet-portrait` | 768x1024 | iPad portrait |
| `tablet-landscape` | 1024x768 | iPad landscape |
| `small-desktop` | 1280x800 | Laptop |
| `desktop` | 1920x1080 | Full desktop |

## Screenshot Capture
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 17.4 | Each viewport captured | 7 screenshots total | | |
| 17.5 | Each variant captured | Default, hover, focus, etc. | | |
| 17.6 | Screenshots saved | `.claude/visual-qa/[component]/` | | |

## AI Analysis (Haiku)
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 17.7 | Task tool invoked | `subagent_type: visual-analyzer` | | |
| 17.8 | Model is Haiku | Cost-effective | | |
| 17.9 | Analyzes alignment | Pixel-perfect check | | |
| 17.10 | Analyzes spacing | Consistent margins/padding | | |
| 17.11 | Analyzes typography | Font size, weight, line-height | | |
| 17.12 | Analyzes colors | Brand compliance | | |
| 17.13 | Analyzes responsive | Cross-viewport consistency | | |
| 17.14 | Analyzes accessibility | Contrast, touch targets | | |

## Visual Issue Categories
| Category | Examples | Severity |
|----------|----------|----------|
| Alignment | Off-center text, uneven gaps | Medium |
| Spacing | Inconsistent padding | Medium |
| Typography | Wrong font, size mismatch | High |
| Color | Not brand colors, contrast fail | High |
| Responsive | Overflow, clipping | High |
| Accessibility | Small touch target, low contrast | Critical |

## Ralph Wiggum Visual Loop
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 17.15 | Issues found? | List shown to user | | |
| 17.16 | AskUserQuestion | "Fix these issues?" | | |
| 17.17 | If "yes" | Fixes applied | | |
| 17.18 | Re-screenshot | After fixes | | |
| 17.19 | Re-analyze | Haiku checks again | | |
| 17.20 | Loop continues | Until clean or max iterations | | |
| 17.21 | `<promise>VISUAL_CLEAN</promise>` | Emitted when no issues | | |
| 17.22 | `run-visual-qa.py` | Detects promise, exits loop | | |

## Visual QA Output
```
Visual QA Report - SearchBar Component
=======================================

✓ mobile-portrait: PASS
✗ mobile-notch: FAIL - Button clipped on notch overlap
✓ mobile-landscape: PASS
✓ tablet-portrait: PASS
✓ tablet-landscape: PASS
✗ small-desktop: FAIL - Search icon misaligned 2px left
✓ desktop: PASS

Issues Found: 2
- [HIGH] Button clipping in notch viewport
- [MEDIUM] Icon alignment on small-desktop

Recommended Fixes:
1. Add safe-area-inset padding for notch
2. Adjust icon flex alignment
```

---

# PART 18: RALPH WIGGUM LOOPS

Self-terminating autonomous loops for iterative refinement tasks.

## Core Concept
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 18.1 | Named after Ralph | Wiggum catches himself | | |
| 18.2 | Loop executes task | Fix, verify, repeat | | |
| 18.3 | Emits promise | `<promise>DONE</promise>` when done | | |
| 18.4 | `completion-promise-detector.py` | Detects promise | | |
| 18.5 | Loop exits | No more iterations | | |

## Built-in Promise Keywords
| Promise | Used For |
|---------|----------|
| `DONE` | Generic completion |
| `COMPLETE` | Task finished |
| `FINISHED` | All work done |
| `FIXED` | Bug/issue fixed |
| `RESOLVED` | Problem resolved |
| `SOLVED` | Solution implemented |
| `REFACTORED` | Code cleanup done |
| `CLEANED` | Cleanup complete |
| `IMPROVED` | Enhancement done |
| `TESTED` | Tests passing |
| `VERIFIED` | Verification passed |
| `VALIDATED` | Validation passed |
| `DEPLOYED` | Deployment done |
| `SHIPPED` | Release complete |
| `RELEASED` | Version released |
| `VISUAL_CLEAN` | Visual QA passed |
| `REVIEW_APPROVED` | Code review passed |

## /ralph-loop Skill
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 18.6 | Loop started | With task description | | |
| 18.7 | Max iterations | Default 10 | | |
| 18.8 | Each iteration | Performs task | | |
| 18.9 | Self-evaluation | "Am I done?" | | |
| 18.10 | If done | Emit promise | | |
| 18.11 | If not done | Continue loop | | |
| 18.12 | Max reached | Exit with warning | | |

## /ralph-status Skill
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 18.13 | Shows current iteration | X of Y | | |
| 18.14 | Shows task | What loop is doing | | |
| 18.15 | Shows progress | What's been fixed | | |

## /ralph-continue Skill
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 18.16 | Overrides detected promise | User wants to continue | | |
| 18.17 | Resets promise detection | Clears flag | | |
| 18.18 | Loop resumes | Continues iterations | | |

## Loops That Use Ralph Wiggum
| Loop | Trigger | Promise | Max |
|------|---------|---------|-----|
| Code Review | `run-code-review.py` | `REVIEW_APPROVED` | 5 |
| Visual QA | `run-visual-qa.py` | `VISUAL_CLEAN` | 5 |
| Test Fixing | `verify-after-green.py` | `TESTED` | 10 |
| Refactoring | `/refactor` | `REFACTORED` | 5 |
| Bug Fixing | Error detection | `FIXED` | 10 |

## Loop State Tracking
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 18.19 | Current iteration stored | In state | | |
| 18.20 | History preserved | What was tried | | |
| 18.21 | Exit reason recorded | Promise or max | | |

---

# PART 19: AUTO MODE TESTING

Testing everything automatically with `--auto` flag.

## Auto Mode Behavior
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 19.1 | `--auto` flag | Activates auto mode | | |
| 19.2 | `auto-answer.py` | PreToolUse(AskUserQuestion) | | |
| 19.3 | Reads defaults | `.claude/hustle-build-defaults.json` | | |
| 19.4 | Auto-selects answers | Based on defaults | | |

## What Auto Mode DOES Test
| Category | Tested | How |
|----------|--------|-----|
| Phase progression | ✓ | All 14 phases execute |
| Research | ✓ | Context7/WebSearch called |
| Schema creation | ✓ | Zod schemas generated |
| Environment check | ✓ | Keys verified |
| TDD Red | ✓ | Tests written |
| TDD Green | ✓ | Implementation done |
| Verification | ✓ | Re-research runs |
| Code review | ✓ | Greptile called |
| Documentation | ✓ | Files updated |
| Hooks | ✓ | All enforcement hooks fire |
| Loops | ✓ | Ralph Wiggum terminates |
| ADR | ✓ | Decisions recorded automatically |
| Visual QA | ✓ | Haiku runs on components |

## What Auto Mode SKIPS
| Category | Skipped | Why |
|----------|---------|-----|
| Interview questions | ✓ | Uses defaults |
| User confirmations | ✓ | Auto-confirms |
| Deep research approval | ✓ | Runs all proposed |
| Schema review | ✓ | Auto-accepts |

## Auto Mode Defaults File
```json
{
  "orchestrator_interview": {
    "auth_required": false,
    "error_handling": "partial-success",
    "brand_guide": true,
    "testing_level": "full"
  },
  "api_interview_defaults": {
    "response_format": "json",
    "error_strategy": "structured",
    "caching": "client-side",
    "rate_limiting": "standard"
  },
  "component_interview_defaults": {
    "variants": ["default"],
    "sizes": ["md"],
    "accessibility": "wcag-aa"
  }
}
```

## Verifying Auto Mode Coverage
| # | Check | Expected | Status | Comments |
|---|-------|----------|--------|----------|
| 19.5 | Run full workflow | `/hustle-build --auto --from-document prd.md` | | |
| 19.6 | All phases complete | State shows complete | | |
| 19.7 | All hooks fired | Logs show hook executions | | |
| 19.8 | All tests pass | Green state reached | | |
| 19.9 | All loops terminated | Promises detected | | |
| 19.10 | Documentation generated | Files created | | |
| 19.11 | No user input needed | Fully autonomous | | |

---

# PART 20: CLI INSTALLER (bin/cli.js - 2060 lines)

The CLI installer is an interactive wizard that sets up api-dev-tools in a project.

## CLI Structure
| Section | Lines | Purpose |
|---------|-------|---------|
| ANSI Colors | ~20 | Red/black/white branding |
| ASCII Banner | ~30 | HUSTLE logo art |
| Spinner Animation | ~20 | Progress feedback |
| Logging Utilities | ~30 | Colored output |
| File Operations | ~200 | Copy, merge, detect |
| Interactive Prompts | ~100 | User questions |
| Installation Steps | ~1500 | All copy/setup logic |

## Installation Wizard Steps
| # | Step | Prompt/Action | Expected | Status |
|---|------|---------------|----------|--------|
| 20.1 | Prerequisites | Check Node 18+, Python 3 | Version displayed | |
| 20.2 | Scope selection | `--scope=project` flag | Project-level install | |
| 20.3 | Directory creation | Create `.claude/` dirs | All subdirs created | |
| 20.4 | Commands copy | Copy 30 command files | All copied to `.claude/commands/` | |
| 20.5 | Skills copy | Copy 44+ SKILL.md files | All copied to `.claude/.skills/` | |
| 20.6 | Hooks copy | Copy 64 Python files | All copied to `.claude/hooks/` | |
| 20.7 | Agents copy | Copy 9 agent files | All copied to `.claude/agents/` | |
| 20.8 | Templates copy | Copy 47 template files | All copied to appropriate locations | |
| 20.9 | Settings merge | Merge settings.json | Hooks registered | |
| 20.10 | MCP setup | Configure MCP servers | context7, github, greptile | |
| 20.11 | Brand fetch | Brandfetch API call | Colors pre-populated | |
| 20.12 | Env template | Copy .env.example | Template created | |

## CLI Flags
| Flag | Purpose | Default |
|------|---------|---------|
| `--scope=project` | Install to project | Required |
| `--with-storybook` | Initialize Storybook | false |
| `--with-playwright` | Initialize Playwright | false |
| `--with-sandpack` | Install Sandpack | false |
| `--silent` | Skip banner, minimal output | false |

## Interactive Questions
| # | Question | Options | Default |
|---|----------|---------|---------|
| 20.13 | Storybook init? | Yes/No | No |
| 20.14 | Playwright init? | Yes/No | No |
| 20.15 | Configure brand? | Yes/No | Yes |
| 20.16 | Brand domain? | text input | Detected from package.json |

## Installation Verification
| # | Check | How to Verify | Status |
|---|-------|---------------|--------|
| 20.17 | Commands installed | `ls .claude/commands/` | |
| 20.18 | Skills installed | `ls .claude/.skills/` | |
| 20.19 | Hooks installed | `ls .claude/hooks/` | |
| 20.20 | Settings correct | `cat .claude/settings.json` | |
| 20.21 | MCP configured | `claude mcp list` | |
| 20.22 | Hooks executable | `ls -la .claude/hooks/*.py` | |

---

# PART 21: COMPLETE FILE INVENTORY

## Summary Counts
| Category | Count | Verified |
|----------|-------|----------|
| Commands | 30 | ✓ |
| Skills (.skills/) | 44 | ✓ |
| Skills (templates/.skills/) | 1 | ✓ |
| **Total Skills** | **45** | ✓ |
| Hooks (main) | 61 | ✓ |
| Hooks (lib) | 3 | ✓ |
| Agents | 9 | ✓ |
| Template dirs | 17 | ✓ |
| Template files | 47 | ✓ |
| MCP servers | 5 | |
| Scripts | 4 | ✓ |
| Docs | 21 | ✓ |

## Additional Directories
| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `.claude-plugin/` | Claude plugin | `marketplace.json` |
| `.skills/_shared/` | Shared skill utilities | `convert-commands.py`, `install.sh`, `settings.json`, `hooks/` |
| `Example-Outputs/` | Sample outputs | `install-wizard-12-28-25.md` |
| `scripts/` | Utility scripts | 4 .ts/.cjs files |
| `docs/` | Documentation | 21 .md files |
| `demo/` | Demo projects | Sample implementations |

## .claude/ Directory Files
| File/Dir | Purpose |
|----------|---------|
| `api-dev-state.json` | Workflow state |
| `registry.json` | Element registry |
| `settings.json` | Hook registrations |
| `settings.local.json` | Local overrides |
| `documentation-audit.json` | Docs tracking |
| `adr-requests/` | Pending ADR requests |
| `adrs/` | Recorded decisions |
| `workflow-logs/` | Session logs |
| `research/` | Research cache |
| `agents/` | 9 agent definitions |
| `commands/` | 29 command files |
| `hooks/` | 20 hook files |

## Scripts Directory
| Script | Purpose |
|--------|---------|
| `collect-test-results.ts` | Aggregate test results |
| `extract-parameters.ts` | Extract API parameters |
| `extract-schema-docs.cjs` | Extract schema documentation |
| `generate-test-manifest.ts` | Generate test manifest |

## Documentation Directory (docs/)
| Doc | Purpose |
|-----|---------|
| `AGENTS.md` | Subagent documentation |
| `API-CREATE.md` | API workflow details |
| `ARCHITECTURE_DECISION_RECORDS.md` | ADR system |
| `AUTONOMOUS_LOOPS.md` | Ralph Wiggum loops |
| `BRAND_GUIDE.md` | Brand system docs |
| `CLAUDE_CODE_BEST_PRACTICES.md` | Best practices |
| `CONFIGURATION.md` | Configuration guide |
| `ESLINT-CONFIG.md` | ESLint setup |
| `HOOKS.md` | Hook system docs |
| `HUSTLE-COMBINE.md` | Combine workflow |
| `HUSTLE-UI-CREATE-PAGE.md` | Page workflow |
| `HUSTLE-UI-CREATE.md` | Component workflow |
| `ORCHESTRATOR.md` | Orchestrator details |
| `PARALLEL_AUTONOMOUS_WORKFLOW.md` | Parallel execution |
| `PHASE_REFERENCE.md` | Phase details |
| `PLUGIN_ARCHITECTURE.md` | Plugin system |
| `PRE-COMMIT-SETUP.md` | Git hooks |
| `REGROUNDING.md` | Context injection |
| `SCHEMA-LINT.md` | Schema linting |
| `SECURITY-AUDIT.md` | Security review |
| `SKILLS.md` | Skills documentation |

## Root-Level Documentation
| Doc | Purpose |
|-----|---------|
| `README.md` | Main readme |
| `CLAUDE.md` | Project instructions |
| `INSTALLATION_GUIDE.md` | Install guide |
| `CHANGELOG.md` | Version history |
| `ROADMAP.md` | Future plans |
| `BEST_PRACTICES_ANALYSIS.md` | Code analysis |
| `TESTING_CHECKLIST.md` | This file |

## File Count Verification Commands
```bash
# Commands
find commands -name "*.md" | wc -l  # Should be 30

# Skills (main)
find .skills -name "SKILL.md" | wc -l  # Should be 44

# Skills (templates)
find templates/.skills -name "SKILL.md" | wc -l  # Should be 1

# Hooks
find hooks -name "*.py" | wc -l  # Should be 64

# Agents
ls .claude/agents/ | wc -l  # Should be 9

# Docs
ls docs/*.md | wc -l  # Should be 21

# Scripts
ls scripts/ | wc -l  # Should be 4
```

---

# PART 22: NEXT STEPS

1. [ ] Read actual `.skills/hustle-build/SKILL.md` to check sub-workflow invocation
2. [ ] Investigate state write error
3. [ ] Fix SKILL.md to explicitly use Skill tool for sub-workflows
4. [ ] Add pre-interview research phase to orchestrator
5. [ ] Improve interview UX with context and descriptions
6. [ ] Re-test with fixes applied
7. [ ] Verify all hooks are registered correctly
8. [ ] Test each automation triggers correctly
9. [ ] Test error recovery flows
10. [ ] Validate integration flows work end-to-end
11. [ ] Run full auto mode test
12. [ ] Verify ADR generation works
13. [ ] Verify Haiku visual QA works
14. [ ] Verify all Ralph Wiggum loops terminate correctly
15. [ ] Run CLI installer in fresh project
16. [ ] Verify all file counts match expected
