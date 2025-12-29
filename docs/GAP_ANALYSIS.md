# Gap Analysis: Best Practices vs. API Dev Tools

**Version:** 4.0.0
**Last Updated:** 2025-12-29

> **The Problem**
>
> It's easy to claim a tool follows "best practices" without proof. Developers need honest assessment of what's implemented vs. what's missing to make informed decisions about whether a tool meets their needs.

> **The Solution**
>
> This document provides a transparent, detailed comparison of api-dev-tools against industry best practices. Every feature is marked as Solved, Partial, Gap, or Deferred with specific notes. Current coverage: **84%** with a clear roadmap for remaining improvements.

---

This document provides an honest assessment of how `@hustle-together/api-dev-tools` implements the industry best practices outlined in [CLAUDE_CODE_BEST_PRACTICES.md](./CLAUDE_CODE_BEST_PRACTICES.md), identifying what we solve, what we partially solve, and what gaps remain.

---

## Executive Summary

| Category | Solved | Partial | Gap | Deferred | Coverage |
|----------|--------|---------|-----|----------|----------|
| Context Engineering | 6 | 1 | 0 | 0 | 93% |
| Hooks | 6 | 1 | 0 | 0 | 93% |
| Ralph Wiggum / Autonomous Loops | 1 | 2 | 2 | 0 | 40% |
| Subagents | 5 | 1 | 1 | 0 | 79% |
| Skills | 4 | 1 | 0 | 0 | 90% |
| MCPs | 2 | 1 | 1 | 0 | 63% |
| CLAUDE.md | 5 | 0 | 0 | 0 | 100% |
| Agentic Patterns | 3 | 2 | 0 | 2 | 80% |
| Security | 3 | 0 | 1 | 0 | 75% |
| **Overall** | **35** | **9** | **5** | **2** | **84%** |

**Legend:**
- **Solved**: Fully implemented with equivalent or better functionality
- **Partial**: Implemented but missing features or needs improvement
- **Gap**: Not implemented, needs to be added
- **Deferred**: Intentionally postponed for future consideration

---

## Detailed Analysis

### 1. Philosophy: The Three Pillars

| Best Practice | Status | Our Implementation | Notes |
|--------------|--------|-------------------|-------|
| Stay Updated with Tooling | **Partial** | No auto-update mechanism | We rely on npm versioning |
| Upskill in Your Domain | **Solved** | Research-first workflow forces domain learning | Phase 3/5 research requirement |
| Play More with Open Mind | **N/A** | Philosophy, not implementable | - |

---

### 2. Context Engineering

| Best Practice | Status | Our Implementation | Gap/Notes |
|--------------|--------|-------------------|-----------|
| Token accumulation awareness | **Solved** | 7-turn re-grounding via `periodic-reground.py` | Injects context every 7 turns |
| Context rot mitigation | **Solved** | `periodic-reground.py` + todo list refresh | Re-injects objectives |
| `/clear` between tasks | **Partial** | No automatic clearing | User must manually clear |
| System reminders for attention | **Solved** | Hooks inject `<system-reminder>` tags | Multiple hooks do this |
| Handoff documents | **Solved** | `/summarize` skill creates handoffs | Saves context for next session |
| Registry awareness in re-grounding | **Solved** | Re-grounding includes existing APIs/components/pages | Prevents recreating elements |
| Deferred features tracking | **Solved** | Re-grounding shows deferred features | Prevents re-suggesting declined items |

**Enhanced Re-Grounding (v4.0):**
The re-grounding system now injects comprehensive context including:
- Current endpoint and phase progress
- Key interview decisions
- Existing registry elements (APIs, components, pages)
- Deferred features list
- Last test status (GREEN/RED)
- Brand guide status
- Orchestrator progress (if in /hustle-build)

See: [REGROUNDING.md](./REGROUNDING.md) for full documentation.

---

### 3. Hooks

| Best Practice | Status | Our Implementation | Gap/Notes |
|--------------|--------|-------------------|-----------|
| PreToolUse validation | **Solved** | `enforce-research.py`, `enforce-interview.py` | Block without research |
| PostToolUse auto-formatting | **Partial** | No auto-prettier/eslint | Could add formatting hook |
| Stop hook for continuous operation | **Solved** | `verify-after-green.py`, `run-code-review.py` | Continue until tests pass |
| SubagentStop validation | **Solved** | `research-validator` agent validates findings | Quality checks on research |
| Notification hooks | **Solved** | `ntfy-on-question.py`, `ntfy-on-stop.py` | Push notifications |
| SessionStart context injection | **Solved** | `session-startup.py`, `orchestrator-session-startup.py` | Full state injection |
| UserPromptSubmit validation | **Solved** | `enforce-external-research.py` | Require research for API questions |

**Gap to Fix:**
- Add optional `auto-format.py` PostToolUse hook for prettier/eslint

---

### 4. Ralph Wiggum / Autonomous Loops

| Best Practice | Status | Our Implementation | Gap/Notes |
|--------------|--------|-------------------|-----------|
| Continuous iteration loops | **Partial** | `/hustle-build --auto` mode | Works but less mature than Ralph |
| Completion promise detection | **Gap** | No explicit promise detection | Could add completion markers |
| Max iterations safety | **Partial** | No configurable max iterations | Need timeout/limit |
| Prompt tuning methodology | **Solved** | Interview-driven prompts from research | Questions generated from findings |
| Git worktree parallelism | **Gap** | `/worktree-add` exists but no parallel loops | Need multi-worktree orchestration |

**Gaps to Fix:**
- Add `--max-iterations` flag to `/hustle-build`
- Add `--completion-promise` pattern for explicit success detection
- Add `/hustle-build-parallel` for multi-worktree concurrent builds

---

### 5. Subagents

| Best Practice | Status | Our Implementation | Gap/Notes |
|--------------|--------|-------------------|-----------|
| Isolated context windows | **Solved** | 7 specialized agents in `.claude/agents/` | Each has own context |
| Specialized tool access | **Solved** | Each agent has restricted tools | Research: read-only, Writer: full |
| Model selection per agent | **Solved** | Haiku for speed, Sonnet for quality | Configured per agent |
| Multi-pass review pattern | **Partial** | `code-reviewer` agent exists | Only one pass, not multi-pass |
| Background agents | **Solved** | `run_in_background` parameter supported | Async operations |
| Custom agent creation | **Solved** | Agents in `.claude/agents/` directory | Template provided |
| Explore thoroughness levels | **Gap** | Not exposing thoroughness parameter | Should pass "quick"/"thorough" |

**Gaps to Fix:**
- Add multi-pass code review (first pass finds issues, second pass validates)
- Expose Explore agent thoroughness levels in skills

---

### 6. Skills

| Best Practice | Status | Our Implementation | Gap/Notes |
|--------------|--------|-------------------|-----------|
| On-demand domain loading | **Solved** | 24+ skills in `.skills/` and `commands/` | Loaded when invoked |
| SKILL.md format | **Solved** | All skills follow format with frontmatter | Metadata + instructions |
| Under 500 lines per skill | **Solved** | Average skill is 100-200 lines | Concise by design |
| Model-invoked skills | **Partial** | Currently user-invoked via `/skill` | Could add model-invocable hints |
| Plugin bundling | **Solved** | npm package bundles all skills | Single install command |

**Gap to Fix:**
- Add `model-invocable: true` frontmatter option for auto-triggered skills

---

### 7. MCPs

| Best Practice | Status | Our Implementation | Gap/Notes |
|--------------|--------|-------------------|-----------|
| Context7 for documentation | **Solved** | Pre-configured in installation | Real-time library docs |
| GitHub MCP for PR management | **Solved** | Pre-configured in installation | Full GitHub integration |
| Puppeteer/Playwright for visual | **Partial** | Optional `--with-playwright` | Not included by default |
| MCP scope management | **Solved** | Project `.mcp.json` + user config | Team + personal configs |
| Limit to 2-3 MCPs | **Gap** | No enforcement of limit | Could get bloated |

**Gaps to Fix:**
- Add warning if more than 3 MCPs configured (context overhead)
- Consider making Playwright default for visual iteration

---

### 8. CLAUDE.md

| Best Practice | Status | Our Implementation | Gap/Notes |
|--------------|--------|-------------------|-----------|
| Concise project context | **Solved** | Template in `templates/CLAUDE-SECTION.md` | Minimal by design |
| Key directories documented | **Solved** | Generated by `/init` or installer | Auto-populated |
| Commands documented | **Solved** | All commands in CLAUDE.md template | Copy-paste ready |
| Project-specific context | **Solved** | Template has placeholders for tech stack, UI library, testing | v4.0 enhancement |
| Registry reference | **Solved** | Template references `.claude/registry.json` | v4.0 enhancement |
| Re-grounding documentation | **Solved** | Template links to REGROUNDING.md | v4.0 enhancement |

**Enhanced CLAUDE.md Template (v4.0):**
The template now includes:
- Project context section (tech stack, UI library, testing)
- Existing elements section (registry reference)
- Re-grounding system documentation
- Brand guide integration notes
- Hook summary by category

---

### 9. Commands and Workflows

| Best Practice | Status | Our Implementation | Gap/Notes |
|--------------|--------|-------------------|-----------|
| `/clear` between tasks | **N/A** | Built-in Claude Code command | Available |
| `/compact` for capacity | **N/A** | Built-in Claude Code command | Available |
| `/context` monitoring | **N/A** | Built-in Claude Code command | Available |
| Custom slash commands | **Solved** | 23+ custom commands | Full coverage |
| Thinking mode triggers | **Solved** | Skills can request "think hard" | Used in complex phases |
| Plan mode for complex tasks | **Solved** | `/plan` skill + Phase 2 scope | Planning built-in |
| Handoff command | **Solved** | `/summarize` skill | Session transitions |

---

### 10. Agentic Coding Patterns

| Best Practice | Status | Our Implementation | Gap/Notes |
|--------------|--------|-------------------|-----------|
| Test-driven development | **Solved** | `/red`, `/green`, `/refactor`, `/cycle` | Full TDD workflow |
| Visual iteration with screenshots | **Partial** | Playwright optional | Not integrated into feedback loop |
| Speculative branching | **Deferred** | Not needed for core workflow | Future consideration |
| Multi-instance workflow | **Partial** | `/worktree-add` but manual | No orchestrated parallel |
| Throw-away first draft | **Solved** | Can run `/hustle-build --dry-run` | Preview before commit |
| Two-model review | **Deferred** | Claude models sufficient | Future consideration |
| Universal workflow (Read→Plan→Execute) | **Solved** | 14-phase workflow enforces this | Research→Interview→Build |

**Future Considerations:**
- Integrate screenshot feedback loop for UI development

---

### 11. Prompt Engineering

| Best Practice | Status | Our Implementation | Gap/Notes |
|--------------|--------|-------------------|-----------|
| Specificity in prompts | **Solved** | Interview generates specific prompts | Questions FROM research |
| Thinking mode triggers | **Solved** | Skills invoke thinking for complex phases | Phase 6, 10, 11 |
| Plan mode philosophy | **Solved** | Built into Phase 2 (Scope) | Required before coding |
| Pseudocode technique | **N/A** | User practice, not automatable | - |

---

### 12. Security

| Best Practice | Status | Our Implementation | Gap/Notes |
|--------------|--------|-------------------|-----------|
| Read-only by default | **Solved** | Research phases are read-only | Write only in Phase 9 |
| Deny dangerous operations | **Solved** | Settings template includes deny rules | rm -rf, sudo, force push blocked |
| Environment variable protection | **Solved** | `/api-env` checks without exposing | Safe key verification |
| Sandbox mode | **Gap** | Not using `/sandbox` integration | Could reduce prompts |

**Security Deny Rules (in templates/settings.json):**
```json
"deny": [
  "Read(.env*)", "Read(**/.env*)", "Read(**/secrets/**)",
  "Bash(rm -rf *)", "Bash(sudo *)",
  "Bash(git push --force *)", "Bash(git reset --hard *)",
  "Bash(curl * | bash)", "Bash(wget * | bash)"
]
```

**Gap to Fix:**
- Consider sandbox mode integration for reduced permission prompts

---

### 13. Performance and Cost

| Best Practice | Status | Our Implementation | Gap/Notes |
|--------------|--------|-------------------|-----------|
| Token management | **Solved** | Re-grounding, subagents for exploration | Efficient context use |
| Concise CLAUDE.md | **Solved** | Template is minimal | Under 100 lines |
| Subagents for exploration | **Solved** | `parallel-researcher`, `research-validator` | Offload to subagents |
| Monitor with /context | **Partial** | No automatic monitoring | Could add hook |

**Gap to Fix:**
- Add hook that warns at 50% context capacity

---

## Priority Gap List

### High Priority (Core Functionality)

| Gap | Impact | Effort | Recommendation |
|-----|--------|--------|----------------|
| No max-iterations for autonomous mode | Risk of infinite loops | Low | Add `--max-iterations` flag |
| No multi-pass code review | Miss bugs | Medium | Add second-pass validation agent |
| No context capacity warning | Performance degradation | Low | Add hook at 50% capacity |

### Medium Priority (Enhanced Workflows)

| Gap | Impact | Effort | Recommendation |
|-----|--------|--------|----------------|
| No screenshot feedback loop | Slower UI iteration | Medium | Integrate Playwright into UI workflow |
| No modular rules directory | Harder to maintain | Low | Split CLAUDE.md into `.claude/rules/` |
| No auto-format hook | Inconsistent code style | Low | Add prettier/eslint PostToolUse hook |

### Low Priority (Nice to Have)

| Gap | Impact | Effort | Recommendation |
|-----|--------|--------|----------------|
| No parallel worktree orchestration | Slower multi-feature | High | Add `/hustle-build-parallel` |
| No MCP count warning | Context bloat | Low | Warn at >3 MCPs |
| No Explore thoroughness control | Less control | Low | Expose parameter in skills |

---

## What We Do Better

Some areas where api-dev-tools exceeds the best practices guide:

### 1. Research-First Enforcement
The guide recommends research but doesn't enforce it. We have:
- `enforce-research.py` - Blocks writes without research
- `enforce-external-research.py` - Requires web/Context7 lookups
- Phase 10 verification - Re-researches after implementation

### 2. Interview-Driven Development
The guide doesn't cover dynamic question generation. We have:
- Questions generated FROM research findings
- Shared decisions across orchestrated workflows
- Interview decisions injected during implementation

### 3. State Persistence Across Sessions
The guide mentions handoffs but we have:
- Full state tracking in `api-dev-state.json`
- 7-day research cache with freshness tracking
- Registry of all created elements
- Resume capability for interrupted builds

### 4. 14-Phase Structured Workflow
The guide's "Universal Workflow" is 5 steps. We have:
- 14 explicit phases with hooks at each
- Phase gates that block progress
- Status tracking per phase
- Loop-back on verification failures

### 5. Orchestration Layer
The guide covers subagents but not orchestration. We have:
- `/hustle-build` master orchestrator
- Dependency-aware execution order
- Shared decisions across sub-workflows
- Automatic wiring of completed elements

---

## Recommended Roadmap

### Phase 1: Quick Wins
1. Add context capacity warning hook (50%)
2. Add `--max-iterations` flag to `/hustle-build`
3. Add auto-format PostToolUse hook (optional)

### Phase 2: Enhanced Safety (3-5 days)
1. Add multi-pass code review agent
2. Add Explore agent lossy summary warning
3. Add MCP count warning
4. Integrate sandbox mode option

### Phase 3: Advanced Features
1. Add screenshot feedback loop for UI workflow
2. Add parallel worktree orchestration
3. Split CLAUDE.md into modular rules

### Phase 4: Future Considerations
1. Completion promise detection for Ralph-style loops
2. Auto-update mechanism for tooling

---

## Conclusion

**api-dev-tools covers 84% of industry best practices** with strong implementations in:
- CLAUDE.md and project context (100%)
- Context engineering and re-grounding (93%)
- Hooks and enforcement (93%)
- Skills and on-demand loading (90%)
- Agentic patterns (80%)
- Subagents and specialized agents (79%)
- Security (75%)

Key gaps remaining:
- Autonomous loop safety (max iterations, completion detection)
- Multi-pass code review
- Sandbox mode integration

**Deferred Features** (not needed for core workflow):
- Speculative branching (`/speculate`)
- Multi-model review (GPT/Codex integration)

**Recent v4.0 Improvements:**
- Enhanced re-grounding with registry, deferred features, test status, brand guide
- Improved CLAUDE.md template with project context sections
- Comprehensive documentation (REGROUNDING.md, ORCHESTRATOR.md)
- Security deny rules for dangerous operations
- `/docs-sync` skill for automatic documentation synchronization
- Problem/Solution headers on all documentation

The project's unique strengths (research enforcement, interview-driven development, 14-phase workflow, orchestration) go beyond what the best practices guide covers, making it a comprehensive system for "building applications of a lifetime."

---

## See Also

- [CLAUDE_CODE_BEST_PRACTICES.md](./CLAUDE_CODE_BEST_PRACTICES.md) - Source best practices guide
- [REGROUNDING.md](./REGROUNDING.md) - 7-turn context refresh system
- [SKILLS.md](./SKILLS.md) - All 24+ skills reference (includes `/docs-sync`)
- [HOOKS.md](./HOOKS.md) - All 45+ hooks reference
- [ORCHESTRATOR.md](./ORCHESTRATOR.md) - Orchestration system reference
