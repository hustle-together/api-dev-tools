# Claude Code Devkit

```
    ╔═══════════════════════════════════════════════════════════════╗
    ║                                                               ║
    ║     ██╗  ██╗██╗   ██╗███████╗████████╗██╗     ███████╗       ║
    ║     ██║  ██║██║   ██║██╔════╝╚══██╔══╝██║     ██╔════╝       ║
    ║     ███████║██║   ██║███████╗   ██║   ██║     █████╗         ║
    ║     ██╔══██║██║   ██║╚════██║   ██║   ██║     ██╔══╝         ║
    ║     ██║  ██║╚██████╔╝███████║   ██║   ███████╗███████╗       ║
    ║     ╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝   ╚══════╝╚══════╝       ║
    ║                                                               ║
    ║                  Claude Code Devkit v4.0                      ║
    ║       Hook-Enforced, Interview-Driven Development             ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝
```

**17 enforcement hooks | 6 subagents | 5 workflows | 14-phase TDD system**

[![Claude Code](https://img.shields.io/badge/Claude_Code-Compatible-BA0C2F)](https://claude.ai/code)
[![License: MIT](https://img.shields.io/badge/License-MIT-white)](https://opensource.org/licenses/MIT)

---

## Why Devkit?

| Problem | Solution |
|---------|----------|
| AI writes code from memory, not docs | Research-first workflow forces doc lookup |
| Generic questions miss project context | Interview questions generated FROM research |
| No verification after implementation | Phase 10 re-researches and compares to docs |
| Easy to skip TDD steps | 17 hooks enforce phase completion |
| Context dilutes over long conversations | Re-grounding every 7 turns |
| No visibility into what was built | Auto-generated showcases from registry |

---

## Quick Start

```bash
npx @hustle-together/api-dev-tools --scope=project
```

---

## Architecture

```
.claude/
├── hooks/              # 17 enforcement hooks (Python)
│   ├── research-gate.py
│   ├── interview-gate.py
│   ├── schema-gate.py
│   ├── tdd-gate.py
│   ├── verify-gate.py
│   ├── docs-gate.py
│   ├── registry-update.py
│   ├── showcase-gen.py
│   ├── visual-qa.py
│   ├── completion-links.py
│   └── ... (7 more)
├── commands/           # Slash commands
├── subagents/          # 6 specialized agents
├── workflows/          # 5 orchestrated workflows
└── settings.json       # Hook configuration

.devkit/
├── state.json          # Current workflow state
├── registry.json       # All artifacts (APIs, components, pages)
└── research/           # Research cache (7-day freshness)

templates/              # Project templates
├── api-showcase/       # API showcase pages
├── ui-showcase/        # UI showcase pages
├── component/          # Component scaffold
├── page/               # Page scaffold
└── hustle-dev-dashboard/  # Main dashboard
```

---

## 14-Phase Workflow

Every workflow follows the same 14-phase structure:

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1-2: CLARIFY                                             │
│  ├─ Disambiguation: "Did you mean X or Y?"                      │
│  └─ Scope: "We're building Z with these features"               │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 3-5: RESEARCH                                            │
│  ├─ Initial: Context7 + WebSearch for official docs             │
│  ├─ Interview: Questions FROM discovered parameters             │
│  └─ Deep: Follow-up searches based on answers                   │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 6-7: PREPARE                                             │
│  ├─ Schema: Zod types from research + interview decisions       │
│  └─ Environment: Verify API keys exist before coding            │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 8-9: BUILD (TDD)                                         │
│  ├─ Red: Write failing tests that define expected behavior      │
│  └─ Green: Minimal implementation to pass tests                 │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 10-12: VERIFY & REVIEW                                   │
│  ├─ Verify: Re-research docs, compare to implementation         │
│  ├─ Code Review: AI review + Visual QA (for UI)                 │
│  └─ Refactor: Fix issues while tests stay green                 │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 13-14: COMPLETE                                          │
│  ├─ Documentation: Update registry, cache research              │
│  └─ Completion: Links to dashboard + showcases                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Available Commands

### Main Workflows

| Command | Purpose |
|---------|---------|
| `/api-create [endpoint]` | Build API endpoint with full 14-phase workflow |
| `/hustle-ui-create [name]` | Build component with Storybook + visual tests |
| `/hustle-ui-create-page [name]` | Build Next.js page with E2E tests |
| `/hustle-combine [type]` | Orchestrate multiple existing APIs |
| `/hustle-build [spec]` | Full-stack feature (API + UI + page) |

### TDD Commands

| Command | Purpose |
|---------|---------|
| `/red` | Write ONE failing test |
| `/green` | Minimal implementation to pass |
| `/refactor` | Clean up while tests pass |
| `/cycle [desc]` | Complete Red → Green → Refactor |

### Utility Commands

| Command | Purpose |
|---------|---------|
| `/api-research [library]` | Research-first documentation |
| `/api-interview [endpoint]` | Interview from research findings |
| `/api-verify [endpoint]` | Verify implementation against docs |
| `/api-status` | Check current workflow progress |
| `/visual-qa` | Run Haiku visual analysis |
| `/test-hooks` | Run hook test suite |

---

## Developer Dashboard

After any workflow completes, you get links to all relevant pages:

```
┌─────────────────────────────────────────────────────────────────┐
│                    /hustle-dev-tools                            │
│                     (Main Dashboard)                            │
├─────────────────────────────────────────────────────────────────┤
│                           │                                     │
│    ┌──────────────────────┼──────────────────────┐             │
│    │                      │                      │             │
│    ▼                      ▼                      ▼             │
│ /hustle-dev-tools/api  /hustle-dev-tools/ui  /hustle-dev-tools/tests
│  (API Showcase)         (UI Showcase)         (Test Results)   │
│                              │                                  │
│                              ▼                                  │
│                      Storybook :6006                           │
│                      (Component Stories)                        │
└─────────────────────────────────────────────────────────────────┘
```

### Completion Output Example

```
✅ Workflow Complete: stripe-checkout

📊 Dashboard:     http://localhost:3000/hustle-dev-tools
🔌 API Showcase:  http://localhost:3000/hustle-dev-tools/api#stripe-checkout
🧪 Test Results:  http://localhost:3000/hustle-dev-tools/tests

Registry updated: .devkit/registry.json
Research cached: .devkit/research/stripe/CURRENT.md
```

---

## Hook Enforcement

17 hooks ensure workflow compliance:

### Gate Hooks (Block Progress)

| Hook | When | Action |
|------|------|--------|
| `research-gate` | PreToolUse: Write/Edit | Block without completed research |
| `interview-gate` | PreToolUse: Write/Edit | Block without interview decisions |
| `schema-gate` | PreToolUse: Write/Edit | Block without approved schema |
| `tdd-gate` | PreToolUse: Write/Edit | Block production code before tests |
| `verify-gate` | PostToolUse: Bash (npm test) | Trigger verification after tests pass |
| `docs-gate` | Stop | Block completion without docs |

### Management Hooks

| Hook | When | Action |
|------|------|--------|
| `state-manager` | PostToolUse | Update workflow state |
| `registry-update` | PostToolUse: Write/Edit | Add artifact to registry |
| `showcase-gen` | PostToolUse: Write | Regenerate showcase pages |
| `session-manager` | SessionStart | Inject context from state |
| `reground` | Every 7 turns | Re-inject context to prevent dilution |

### Quality Hooks

| Hook | When | Action |
|------|------|--------|
| `code-review` | Phase 11 | Run Greptile AI review |
| `visual-qa` | Phase 11 (UI) | Run Haiku screenshot analysis |
| `format` | PreToolUse: Write | Auto-format code |

### Automation Hooks

| Hook | When | Action |
|------|------|--------|
| `auto-answer` | PreToolUse: AskUserQuestion | Use defaults in --auto mode |
| `notify` | Notification | Send NTFY push notifications |
| `completion-links` | Stop (Phase 14) | Show dashboard + showcase links |

---

## Subagents

6 specialized agents run in parallel:

| Agent | Model | Purpose |
|-------|-------|---------|
| `researcher` | Haiku | Parallel documentation scraping |
| `builder` | Sonnet | Code generation from schemas |
| `reviewer` | Sonnet | Code review + implementation verification |
| `docs-generator` | Haiku | TypeDoc documentation generation |
| `visual-analyzer` | Haiku | Screenshot analysis for UI |
| `orchestrator` | Sonnet | Multi-workflow coordination |

---

## Registry System

All artifacts are tracked in `.devkit/registry.json`:

```json
{
  "version": "1.0.0",
  "updated_at": "2025-01-03T10:30:00Z",
  "apis": {
    "stripe-checkout": {
      "route": "/api/stripe/checkout",
      "method": "POST",
      "schema": "CheckoutSchema",
      "file": "src/app/api/stripe/checkout/route.ts",
      "tests": "src/app/api/stripe/checkout/route.test.ts",
      "examples": {...}
    }
  },
  "components": {
    "ChatWindow": {
      "file": "src/components/ChatWindow/ChatWindow.tsx",
      "stories": "src/components/ChatWindow/ChatWindow.stories.tsx",
      "props": ["messages", "onSend", "isLoading"],
      "variants": ["default", "compact", "fullscreen"]
    }
  },
  "pages": {
    "Dashboard": {
      "route": "/dashboard",
      "file": "src/app/dashboard/page.tsx",
      "e2eTests": "src/app/dashboard/page.e2e.test.ts"
    }
  }
}
```

The API Showcase and UI Showcase read from this registry to auto-generate interactive documentation.

---

## Testing

### Hook Tests

```bash
# Run all hook tests (52 tests)
cd .claude/hooks && python3 -m pytest tests/ -v

# Or use the slash command
/test-hooks
```

### Test Categories

```bash
pytest tests/ -k gate        # Gate hooks (research, interview, schema, tdd)
pytest tests/ -k state       # State management hooks
pytest tests/ -k registry    # Registry update hooks
pytest tests/ -k showcase    # Showcase generation hooks
```

---

## State Management

### Workflow State (`.devkit/state.json`)

```json
{
  "version": "4.0.0",
  "workflow": "api-create",
  "active_artifact": "stripe-checkout",
  "phases": {
    "disambiguation": {"status": "completed"},
    "scope": {"status": "completed"},
    "research": {"status": "completed"},
    "interview": {"status": "in_progress"},
    ...
  },
  "decisions": {
    "error_handling": "throw_with_details",
    "rate_limiting": true
  },
  "turn_count": 5
}
```

### Research Cache (`.devkit/research/`)

```
.devkit/research/
├── index.json           # Freshness tracking (7-day cache)
├── stripe/
│   └── CURRENT.md       # Latest Stripe docs
└── unsplash/
    └── CURRENT.md       # Latest Unsplash docs
```

---

## Configuration

| File | Purpose |
|------|---------|
| `.claude/settings.json` | Hook registration, tool permissions |
| `.devkit/state.json` | Current workflow state |
| `.devkit/registry.json` | All created artifacts |
| `.mcp.json` | MCP server configuration |
| `CLAUDE.md` | Project instructions for Claude |

---

## Requirements

- **Claude Code** 1.0.0+
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

## Documentation

| Document | Purpose |
|----------|---------|
| [CLAUDE.md](./CLAUDE.md) | Project instructions for Claude |
| [docs/HOOKS.md](./docs/HOOKS.md) | Complete hook reference |
| [docs/SKILLS.md](./docs/SKILLS.md) | All slash commands |
| [docs/AGENTS.md](./docs/AGENTS.md) | Subagent documentation |
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | Registry/showcase system plan |

---

## Support

- **Issues**: [GitHub Issues](https://github.com/hustle-together/api-dev-tools/issues)
- **Discussions**: [GitHub Discussions](https://github.com/hustle-together/api-dev-tools/discussions)

---

**License:** MIT | **Author:** [Hustle Together](https://github.com/hustle-together)
