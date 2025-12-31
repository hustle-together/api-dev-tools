# API Development Tools v4.5.0

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║     ██╗  ██╗██╗   ██╗███████╗████████╗██╗     ███████╗                         ║
║     ██║  ██║██║   ██║██╔════╝╚══██╔══╝██║     ██╔════╝                         ║
║     ███████║██║   ██║███████╗   ██║   ██║     █████╗                           ║
║     ██╔══██║██║   ██║╚════██║   ██║   ██║     ██╔══╝                           ║
║     ██║  ██║╚██████╔╝███████║   ██║   ███████╗███████╗                         ║
║     ╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝   ╚══════╝╚══════╝                         ║
║                                                                                ║
║                  ╭───────────────────────────────────────╮                     ║
║                  │        A P I   D E V   T O O L S      │                     ║
║                  ╰───────────────────────────────────────╯                     ║
║                                                                                ║
║                    For Claude Code  |  VS Code  |  Cursor                      ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝
```

> **A systematic approach to building Next.js applications with AI assistance.**
>
> Instead of letting AI improvise, this package enforces a structured 14-phase workflow:
> research the API docs first, use sensible defaults (or interview you about requirements),
> write failing tests, implement, then verify against the docs again. **Autonomous mode is
> ON by default** - interviews use comprehensive defaults, iterative phases loop until
> complete. Every step is tracked through 56 hooks.

**Interview-driven, research-first development with 14-phase TDD workflow**

[![Agent Skills](https://img.shields.io/badge/Agent_Skills-Compatible-BA0C2F)](https://agentskills.io)
[![Cross-Platform](https://img.shields.io/badge/Cross--Platform-Claude%20%7C%20VS%20Code%20%7C%20Cursor-000000)](https://github.com/hustle-together/api-dev-tools)
[![License: MIT](https://img.shields.io/badge/License-MIT-white)](https://opensource.org/licenses/MIT)

---

## Why API Dev Tools?

| Problem                                 | Solution                                      |
| --------------------------------------- | --------------------------------------------- |
| AI writes code from memory, not docs    | ► Research-first workflow forces doc lookup   |
| Generic questions miss project context  | ► Interview questions generated FROM research |
| No verification after implementation    | ► Phase 10 re-researches and compares to docs |
| Easy to skip TDD steps                  | ► 56 hooks enforce phase completion           |
| Context dilutes over long conversations | ► Re-grounding every 7 turns                  |
| No visibility into AI workflow          | ► State tracking + NTFY push notifications    |

---

## Quick Start

```bash
npx @hustle-together/api-dev-tools --scope=project
```

The installer walks you through:

- ■ MCP server configuration (Context7, GitHub)
- ■ Environment variables (.env setup)
- ■ NTFY push notifications (optional)
- ■ Optional tools (Storybook, Playwright, Sandpack)

---

## Five Main Workflows

All five workflows share the same **14-phase structure** ensuring consistency across API, component, page, and orchestration development.

### 1. `/api-create [endpoint]` — Build API Endpoints

Creates a complete API endpoint with research-backed implementation:

```bash
/api-create stripe-checkout
```

**Flow:** Disambiguate → Research Stripe docs → Interview about error handling, formats → Generate Zod schemas → Write failing tests → Implement → Verify against docs → Refactor → Document

---

### 2. `/hustle-ui-create [name]` — Build Components

Creates UI components with Storybook integration and visual testing:

```bash
/hustle-ui-create ChatWindow
```

**Flow:** AI suggests Basic/Complex type → User confirms → Research component patterns → Interview about variants, states → Generate types → Write Storybook stories → Implement → Visual regression tests → Document

---

### 3. `/hustle-ui-create-page [name]` — Build Pages

Creates Next.js pages with Playwright E2E testing:

```bash
/hustle-ui-create-page Dashboard
```

**Flow:** Same 14 phases but focused on page routing, data fetching, and E2E user flows instead of component isolation.

---

### 4. `/hustle-combine [type]` — Orchestrate Existing APIs

Combines multiple existing APIs into orchestrated endpoints:

```bash
/hustle-combine api
```

**Flow:** Select from registry → Define orchestration pattern → Generate combined schemas → Test integration → Document the combined endpoint

---

### 5. `/hustle-build [description]` — Build Complete Features

Master orchestrator that builds complete features from natural language. Decomposes requests into APIs, components, and pages, then executes them in dependency order:

```bash
/hustle-build dashboard with user stats and activity charts
/hustle-build --auto --parallel e-commerce checkout flow
```

**Flow:** Parse request → Decompose into workflows → Interview once (shared decisions) → Execute in dependency order → Wire together → Unified documentation

**Flags:**
- `--auto` — Fully autonomous, auto-answers all questions
- `--parallel` — Run up to 5 Opus agents in git worktrees
- `--resume [id]` — Resume interrupted build
- `--dry-run` — Show plan without executing
- `--max-iterations [N]` — Per-phase retry limit

---

## How The Phases Work Together

```
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 1-2: CLARIFY                                                 │
│  ├─ Disambiguation: "Did you mean X or Y?"                          │
│  └─ Scope: "We're building Z with these features"                   │
├─────────────────────────────────────────────────────────────────────┤
│  PHASE 3-5: RESEARCH                                                │
│  ├─ Initial: Context7 + WebSearch for official docs                 │
│  ├─ Interview: Questions FROM discovered parameters                 │
│  └─ Deep: Propose additional searches based on answers              │
├─────────────────────────────────────────────────────────────────────┤
│  PHASE 6-7: PREPARE                                                 │
│  ├─ Schema: Zod types from research + interview decisions           │
│  └─ Environment: Verify API keys exist before coding                │
├─────────────────────────────────────────────────────────────────────┤
│  PHASE 8-9: BUILD (TDD)                                             │
│  ├─ Red: Write failing tests that define expected behavior          │
│  └─ Green: Minimal implementation to pass tests                     │
├─────────────────────────────────────────────────────────────────────┤
│  PHASE 10-12: VERIFY & REVIEW                                       │
│  ├─ Verify: Re-research docs, compare to implementation             │
│  ├─ Code Review: Greptile AI review (catches issues early)          │
│  └─ Refactor: Fix issues + clean up while tests stay green          │
├─────────────────────────────────────────────────────────────────────┤
│  PHASE 13-14: COMPLETE                                              │
│  ├─ Documentation: Update registry, cache research, TypeDoc         │
│  └─ Completion: Final verification, commit, PR                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## What Gets Installed

| Component         | Count | Purpose                                      |
| ----------------- | ----- | -------------------------------------------- |
| Agent Skills      | 40+   | Cross-platform workflow commands             |
| Enforcement Hooks | 56    | Phase enforcement, ADR generation, auto-answer |
| Subagents         | 8     | Research, schemas, tests, docs, visual       |
| Test Skills       | 8     | Unit, E2E, visual, builds, review, debug     |
| State Tracking    | 1     | Track progress across sessions               |
| Research Cache    | 1     | 7-day freshness documentation cache          |
| ADR System        | 1     | Architecture Decision Records with registry  |
| Templates         | 6     | Brand page, review dashboard, showcases      |

---

## Subagents

Eight specialized agents run in parallel to speed up workflows:

| Agent                   | Model  | When Used                               |
| ----------------------- | ------ | --------------------------------------- |
| parallel-researcher     | Haiku  | Phase 3/5 - Scrape docs in parallel     |
| research-validator      | Haiku  | Phase 3/5 - Find endpoints, webhooks    |
| schema-generator        | Sonnet | Phase 6 - Generate Zod schemas          |
| test-writer             | Sonnet | Phase 8 - Write comprehensive tests     |
| implementation-reviewer | Sonnet | Phase 10 - Compare code to docs         |
| code-reviewer           | Sonnet | Phase 11 - AI code review               |
| docs-generator          | Haiku  | Phase 13 - TypeDoc generation           |
| visual-analyzer         | Haiku  | Visual testing - Screenshot AI analysis |

---

## Push Notifications

Get notified on your phone when input is needed:

```bash
/ntfy-setup    # Configure NTFY
/ntfy-test     # Send test notification
```

Notifications include:

- ○ Input needed (interview questions)
- ● Phase completions with token usage
- ◆ Workflow blocked (missing requirements)

---

## API Showcase

Interactive documentation and testing UI for all your APIs:

```bash
# Access at: http://localhost:3000/api-showcase
```

**Features:**
- Grid view of all registered APIs with search and filtering
- Click any API to open interactive testing modal
- **Example Requests** - Pre-built, runnable examples that auto-fill query params
- **Try It** - Live API testing with real responses
- **Curl Examples** - Copy working curl commands
- **Documentation** - File locations, schemas, parameters

### How Examples Work

Examples are generated from your Zod schema parameters during Phase 13 (Documentation):

```json
// In registry.json - auto-generated from schema
"endpoints": {
  "search": {
    "params": [...],
    "examples": {
      "basic": {
        "description": "Basic search request",
        "query": "action=search&query=nature",
        "curl": "curl -X GET 'http://localhost:3000/api/v2/unsplash?action=search&query=nature'"
      }
    }
  }
}
```

The showcase reads examples from `registry.json` and displays clickable buttons that auto-fill the request.

---

## TypeDoc Integration

Generate API documentation from TSDoc comments:

```bash
pnpm typedoc           # Generate docs to docs/api/
pnpm typedoc:watch     # Watch mode for development
```

TypeDoc runs during **Phase 13 (Documentation)** and generates Markdown documentation from:
- `src/lib/schemas/*.ts` - Zod schemas with TSDoc comments
- `src/app/api/**/*.ts` - API route handlers

Configuration: `typedoc.json` (installed by the CLI)

---

## All Slash Commands

> **Complete reference:** [docs/PHASE_REFERENCE.md](./docs/PHASE_REFERENCE.md) | [docs/SKILLS.md](./docs/SKILLS.md)

### Main Workflows

```bash
/api-create [endpoint]        # Full 14-phase API workflow
/hustle-ui-create [name]      # Component with Storybook
/hustle-ui-create-page [name] # Page with Playwright E2E
/hustle-combine [type]        # Orchestrate existing APIs
/hustle-build [description]   # Auto-decompose and build
```

### Phase-Specific (API Workflow)

```bash
/api-research [library]   # Phase 3: Targeted research
/api-interview [endpoint] # Phase 4: Questions from research
/api-env [endpoint]       # Phase 7: Check API keys
/api-verify [endpoint]    # Phase 10: Re-research and verify
/api-status [endpoint]    # Any phase: Show progress
```

### TDD Commands

```bash
/red              # Phase 8: Write ONE failing test
/green            # Phase 9: Minimal implementation to pass
/refactor         # Phase 12: Clean up (tests stay green)
/cycle [desc]     # Phase 8-12: Full TDD cycle
/spike            # Pre-TDD: Exploratory coding
```

### Testing Suite

```bash
/test-unit        # Run Vitest unit tests with coverage
/test-e2e         # Run Playwright E2E across browsers
/test-visual      # Visual regression + AI screenshot analysis
/test-all         # Complete suite (unit → e2e → visual → builds → review)
/test-builds      # Verify builds across 5 platforms
/test-review      # AI code review for security/performance
/test-debug       # Diagnose test failures with traces
```

### Git Operations

```bash
/commit           # Semantic commit with attribution
/pr               # Create pull request
/busycommit       # Multiple atomic commits
/worktree-add     # Add git worktree from branch/issue
/worktree-cleanup # Clean up merged worktrees
```

### Planning & Analysis

```bash
/plan [feature]   # Create implementation plan
/gap              # Find unaddressed items
/issue [url]      # Plan from GitHub issue
/summarize        # Summarize conversation progress
```

### Autonomous Mode

```bash
/ralph-loop [task]   # Start autonomous loop with self-termination
/ralph-status        # Check current loop status
/ralph-continue      # Continue interrupted loop
/parallel-spawn      # Spawn parallel agents in git worktrees
```

### Utilities

```bash
/token-report     # Token usage by workflow phase
/docs-sync        # Update documentation (Phase 13)
/hustle-brand     # Brand guide creator
/shadcn [component] # ShadCN component documentation
/beepboop         # AI attribution disclosure
/add-command      # Guide for creating new skills
```

### Notifications

```bash
/ntfy-setup       # Configure NTFY push notifications
/ntfy-test        # Send test notification
```

---

## Documentation

### Core Reference

| Document | Purpose |
| -------- | ------- |
| **[docs/PHASE_REFERENCE.md](./docs/PHASE_REFERENCE.md)** | **MASTER** Complete 14-phase matrix with hooks, skills, docs, and implementation status |
| **[docs/SKILLS.md](./docs/SKILLS.md)** | Complete slash command reference - all 38+ skills with usage and examples |
| **[docs/HOOKS.md](./docs/HOOKS.md)** | All 24 enforcement hooks - what they do and when they run |
| **[docs/AGENTS.md](./docs/AGENTS.md)** | Specialized subagents - parallel-researcher, schema-generator, visual-analyzer |
| **[docs/ORCHESTRATOR.md](./docs/ORCHESTRATOR.md)** | Master workflow controller - /hustle-build, decomposition, shared decisions |
| **[docs/PARALLEL_AUTONOMOUS_WORKFLOW.md](./docs/PARALLEL_AUTONOMOUS_WORKFLOW.md)** | Up to 5 Opus agents in parallel with git worktrees |
| **[docs/AUTONOMOUS_LOOPS.md](./docs/AUTONOMOUS_LOOPS.md)** | Ralph Wiggum pattern - self-terminating agent loops |
| **[docs/CONFIGURATION.md](./docs/CONFIGURATION.md)** | All configurable options, autonomous mode, logging & audit trail |
| **[docs/ARCHITECTURE_DECISION_RECORDS.md](./docs/ARCHITECTURE_DECISION_RECORDS.md)** | ADRs for significant decisions during research/interview phases |
| **[docs/REGROUNDING.md](./docs/REGROUNDING.md)** | 7-turn context refresh system - prevents "lost in the middle" problem |
| **[docs/PLUGIN_ARCHITECTURE.md](./docs/PLUGIN_ARCHITECTURE.md)** | How the plugin system works - installation, state, lifecycle |
| **[docs/BRAND_GUIDE.md](./docs/BRAND_GUIDE.md)** | Brand guide setup and ShadCN integration |
| **[docs/CLAUDE_CODE_BEST_PRACTICES.md](./docs/CLAUDE_CODE_BEST_PRACTICES.md)** | Industry best practices for Claude Code - hooks, subagents, context engineering |

### Workflow Guides

| Document | Purpose |
| -------- | ------- |
| **[docs/API-CREATE.md](./docs/API-CREATE.md)** | Complete 14-phase API workflow reference with examples |
| **[docs/HUSTLE-UI-CREATE.md](./docs/HUSTLE-UI-CREATE.md)** | UI component workflow with Storybook integration |
| **[docs/HUSTLE-UI-CREATE-PAGE.md](./docs/HUSTLE-UI-CREATE-PAGE.md)** | Page workflow with Playwright E2E tests |
| **[docs/HUSTLE-COMBINE.md](./docs/HUSTLE-COMBINE.md)** | API orchestration patterns (sequential, parallel, conditional) |

### Testing & Quality Assurance

Comprehensive testing documentation for verifying all 75 skills, 64 hooks, and 9 agents:

| Document | Purpose |
| -------- | ------- |
| **[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)** | Complete checklist of 150+ behaviors to verify |
| **[AUTONOMOUS_TESTING.md](./AUTONOMOUS_TESTING.md)** | Self-healing test runner for overnight execution |

Quick verification after installation:
```bash
ls .claude/commands/ | wc -l          # Should be 30
find .skills -name "SKILL.md" | wc -l  # Should be 44
find .claude/hooks -name "*.py" | wc -l # Should be 64
ls .claude/agents/ | wc -l             # Should be 9
```

### Code Quality

| Document | Purpose |
| -------- | ------- |
| **[docs/PRE-COMMIT-SETUP.md](./docs/PRE-COMMIT-SETUP.md)** | Husky + lint-staged configuration for automated checks |
| **[docs/ESLINT-CONFIG.md](./docs/ESLINT-CONFIG.md)** | Type-aware ESLint with TypeScript integration |
| **[docs/SCHEMA-LINT.md](./docs/SCHEMA-LINT.md)** | Zod schema validation and linting rules |
| **[docs/SECURITY-AUDIT.md](./docs/SECURITY-AUDIT.md)** | Dependency audit, license check, secret scanning |

### Guides

| Document | Purpose |
| -------- | ------- |
| **[INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)** | Step-by-step setup including MCP config, environment variables, troubleshooting |
| **[BEST_PRACTICES_ANALYSIS.md](./BEST_PRACTICES_ANALYSIS.md)** | Phase documentation with workflow diagrams and enforcement logic |
| **[.skills/README.md](./.skills/README.md)** | Agent Skills format compatibility and cross-platform notes |

### Project Info

| Document | Purpose |
| -------- | ------- |
| **[CHANGELOG.md](./CHANGELOG.md)** | Version history with features and release notes |
| **[ROADMAP.md](./ROADMAP.md)** | Future features and enhancement plans |

---

## Configuration

> **Complete reference:** [docs/CONFIGURATION.md](./docs/CONFIGURATION.md)

| File                                 | Purpose                                      |
| ------------------------------------ | -------------------------------------------- |
| `.claude/settings.json`              | Hook registration, tool permissions          |
| `.claude/hustle-build-defaults.json` | Autonomous mode, ADR settings, defaults      |
| `.claude/api-dev-state.json`         | Current workflow state, phase progress       |
| `.claude/research/`                  | Cached documentation with freshness tracking |
| `.claude/registry.json`              | APIs, components, pages, ADRs registry       |
| `.claude/workflow-logs/`             | Auto-answer audit logs for post-hoc review   |
| `.claude/adrs/`                      | Architecture Decision Records                |
| `templates/.env.example`             | Environment variable template                |

---

## Requirements

- **Claude Code** 1.0.0+ (or compatible platform)
- **Node.js** 18+
- **Python** 3.9+ (for hooks)
- **pnpm** 10.11.0+

---

## Optional Tools

```bash
npx @hustle-together/api-dev-tools --with-storybook   # Component development
npx @hustle-together/api-dev-tools --with-playwright  # E2E testing
npx @hustle-together/api-dev-tools --with-sandpack    # Live code editing
```

---

## FAQ

### General

**Q: What's the main purpose of this package?**

A: To provide a systematic, research-first approach to building Next.js applications with AI. Instead of letting AI improvise from memory, this package enforces a 14-phase workflow that researches documentation first, interviews you about requirements, writes tests before code, and verifies the implementation against docs.

**Q: Does this work with Claude Code only?**

A: It's designed for Claude Code but works with any AI assistant that supports the Agent Skills format (VS Code, Cursor, etc). The hooks require Python 3.9+.

**Q: Is this for Next.js only?**

A: The workflows are optimized for Next.js (App Router), but the TDD patterns and research-first approach work with any framework. Component workflows assume React.

---

### Workflows

**Q: What's the difference between `/api-create` and `/hustle-build`?**

A: `/api-create` builds a single API endpoint through all 14 phases. `/hustle-build` is an orchestrator that can decompose complex requests ("build a dashboard with auth and payments") into multiple coordinated workflows.

**Q: Why 14 phases? Isn't that too many?**

A: Each phase serves a specific purpose. The research phases (3, 5) ensure we use current docs, not outdated training data. The interview phase (4) captures YOUR requirements, not generic assumptions. The verification phase (10) catches implementation drift. Skipping phases leads to bugs and rework.

**Q: Can I skip the interview phase?**

A: Yes, with autonomous mode (enabled by default). Set `autonomous.skip_interviews: true` in `.claude/hustle-build-defaults.json`. The system will auto-select comprehensive defaults based on "(Recommended)" options in skills. All auto-answers are logged to `.claude/workflow-logs/` for post-hoc review.

**Q: What are Architecture Decision Records (ADRs)?**

A: ADRs capture significant design decisions with context. During research, when multiple options are discovered (e.g., Supabase vs Firebase vs Postgres), an ADR is auto-generated with trade-offs. This gives users informed context BEFORE the interview. After selection, the ADR is updated with the decision. See [docs/ARCHITECTURE_DECISION_RECORDS.md](./docs/ARCHITECTURE_DECISION_RECORDS.md).

---

### Testing

**Q: What's the difference between E2E, Visual, and Storybook tests?**

| Test Type | Tool | What It Tests | When to Use |
|-----------|------|---------------|-------------|
| **E2E** | Playwright | Full user flows (click, type, navigate) | Critical paths: login, checkout |
| **Visual** | Playwright + Haiku | Screenshot comparison across viewports | UI regressions, responsive design |
| **Storybook** | Storybook | Component states in isolation | Component props, variants |
| **Unit** | Vitest | Functions, hooks, utilities | Business logic, data transforms |

**Q: How many viewports does visual testing cover?**

A: 7 viewports: Mobile (375px), Mobile Notch (393px), Mobile Landscape (667px), Tablet Portrait (768px), Tablet Landscape (1024px), Small Desktop (1280px), Desktop (1920px). Each includes safe area insets for notched devices.

**Q: What browsers does Playwright test?**

A: Chromium, Firefox, and WebKit. This covers all desktop browsers plus mobile webviews (Capacitor/Tauri use these same engines).

---

### Security

**Q: How does `/test-review` detect security issues?**

A: Two layers:
1. **ESLint rules** (deterministic): `eslint-plugin-security` and `eslint-plugin-no-unsanitized` catch XSS, injection, path traversal, etc.
2. **AI checklist** (structured): Follows a security checklist for auth, input validation, data exposure, OWASP Top 10.

**Q: What security vulnerabilities can it catch?**

SQL Injection, XSS, Command Injection, Path Traversal, Prototype Pollution, Auth Bypass, Exposed Secrets, CSRF, Rate Limiting gaps, ReDoS, and more.

---

### Multi-Platform

**Q: Can I build desktop/mobile apps?**

A: The package focuses on web-first development. For desktop, we recommend Tauri (lighter than Electron). For mobile, we recommend Capacitor (wraps your web app). Both use web technologies, so your Playwright tests cover them.

**Q: Do I need Expo or React Native?**

A: No. Expo/React Native are different codebases. Capacitor wraps your existing Next.js app in a native shell, no code rewrite needed.

---

### Registry & State

**Q: Are my settings saved between sessions?**

A: Yes. The `.claude/registry.json` persists project-wide and stores:
- All APIs, components, pages you've created
- Orchestrator defaults (error handling, auth method, etc.)
- Visual test results

The `.claude/api-dev-state.json` tracks current workflow progress (resets per workflow).

**Q: What does the registry track?**

APIs, Components, Pages, Hooks, Utils, Types, Context Providers, and Orchestrator Defaults.

---

### Token Usage

**Q: How do I track token costs?**

A: Run `/token-report` to see estimated token usage by phase. Uses ccusage to parse Claude Code logs. Note: Estimates may vary ±10% from actual billing.

**Q: Which phases use the most tokens?**

A: Typically Research phases (3, 5) use 40-50% of tokens. If this is too high, use more targeted search queries.

---

### Troubleshooting

**Q: Hooks aren't running - what's wrong?**

A: Check:
1. Python 3.9+ is installed: `python3 --version`
2. Hooks are executable: `chmod +x .claude/hooks/*.py`
3. Settings.json has correct hook paths

**Q: Research is outdated - how do I refresh?**

A: Delete `.claude/research/[api-name]/` folder. Next workflow will re-research. Or wait 7 days (auto-refresh).

**Q: Workflow stopped mid-phase - how do I resume?**

A: Run `/api-status` to see current state, then run the appropriate phase command (e.g., `/green` if stopped during TDD Green).

---

## Support

- **Issues**: [GitHub Issues](https://github.com/hustle-together/api-dev-tools/issues)
- **Discussions**: [GitHub Discussions](https://github.com/hustle-together/api-dev-tools/discussions)

---

## Credits & Acknowledgments

This project incorporates patterns and techniques from the AI engineering community:

| Pattern | Credit | Reference |
|---------|--------|-----------|
| **Ralph Wiggum Pattern** | Geoffrey Huntley | [ghuntley.com/ralph](https://ghuntley.com/ralph/) |
| **TDD Workflow** | Kent Beck | Test-Driven Development methodology |
| **Context7 MCP** | Upstash | [context7.com](https://context7.com) |
| **GitHub MCP** | GitHub/Anthropic | Model Context Protocol |

See [docs/CLAUDE_CODE_BEST_PRACTICES.md](./docs/CLAUDE_CODE_BEST_PRACTICES.md) for complete acknowledgments.

---

**License:** MIT | **Author:** [Hustle Together](https://github.com/hustle-together)
