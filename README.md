# Claude Code Devkit

**22 hooks | 12 agents | 38 commands | 14-phase TDD workflow**

A hook-enforced, interview-driven development system for Claude Code.

---

## What It Does

| Problem | Solution |
|---------|----------|
| AI writes code from memory, not docs | Research-first workflow forces doc lookup |
| Generic questions miss project context | Questions generated FROM research findings |
| No verification after implementation | Phase 10 re-researches and compares to docs |
| Easy to skip TDD steps | 22 hooks enforce phase completion |
| Context dilutes over long conversations | Re-grounding every 7 turns |

---

## Quick Start

### Option A: Install from GitHub

```bash
# From your project root
git clone https://github.com/hustle-together/api-dev-tools.git
```

### Option B: Install from local copy

```bash
# Copy entire devkit to your project
cp -r /path/to/api-dev-tools/* /path/to/your-project/
cp -r /path/to/api-dev-tools/.* /path/to/your-project/  # Hidden files
```

### 2. Install hook dependencies

```bash
pip3 install pytest  # For running hook tests
```

### 3. Start using

```bash
# Open Claude Code in your project
claude

# Create an API endpoint
/api-create stripe-checkout

# Create a UI component
/hustle-ui-create Button

# Run TDD cycle
/red        # Write failing test
/green      # Make it pass
/refactor   # Clean up
```

---

## How It Works

Every workflow follows 14 phases:

```
Phase 1-2:   CLARIFY     → Disambiguation + Scope
Phase 3-5:   RESEARCH    → Docs lookup + Interview + Deep research
Phase 6-7:   PREPARE     → Schema + Environment check
Phase 8-9:   BUILD       → TDD Red + Green
Phase 10-12: VERIFY      → Re-research + Code review + Refactor
Phase 13-14: COMPLETE    → Documentation + Completion
```

Hooks enforce each phase - you can't skip steps.

---

## Key Commands

| Command | Purpose |
|---------|---------|
| `/api-create [name]` | Full 14-phase API workflow |
| `/hustle-ui-create [name]` | Full 14-phase UI workflow |
| `/red` | Write ONE failing test |
| `/green` | Minimal code to pass |
| `/refactor` | Clean up, tests stay green |
| `/commit` | Git commit with standards |
| `/pr` | Create pull request |

See all 38 commands: [.claude/REFERENCE.md](.claude/REFERENCE.md)

---

## Project Structure

```
your-project/
├── .claude/
│   ├── hooks/           # 22 enforcement hooks
│   ├── commands/        # 38 slash commands
│   ├── agents/          # 12 specialized agents
│   ├── settings.json    # Hook configuration
│   └── REFERENCE.md     # Quick reference
├── .devkit/
│   ├── state.json       # Current workflow state
│   ├── registry.json    # Artifact registry
│   └── research/        # Research cache (7-day)
├── templates/
│   ├── hustle-dev-dashboard/  # Main dashboard
│   ├── api-showcase/          # API testing UI
│   ├── ui-showcase/           # Component gallery
│   ├── test-results/          # Test results page
│   ├── playwright-report/     # E2E test reports
│   ├── docs/                  # Generated TypeDoc
│   ├── component/             # Component scaffold
│   ├── page/                  # Page scaffold
│   └── shared/                # Shared utilities
└── CLAUDE.md            # Project instructions
```

---

## Generated Outputs

After completing a workflow, you get a full developer dashboard:

```
┌─────────────────────────────────────────────────────────────────┐
│                    /hustle-dev-tools                            │
│                      (Main Dashboard)                           │
├──────────┬──────────┬──────────┬──────────┬────────────────────┤
│          │          │          │          │                    │
▼          ▼          ▼          ▼          ▼                    │
/api       /ui        /tests     /reports   /docs                │
API        UI         Test       Playwright  TypeDoc             │
Showcase   Showcase   Results    Reports     Docs                │
│          │                                                     │
│          └──────────────► Storybook :6006                      │
└─────────────────────────────────────────────────────────────────┘
```

**Completion links:**
```
✅ Workflow Complete: stripe-checkout

📊 Dashboard:      http://localhost:3000/hustle-dev-tools
🔌 API Showcase:   http://localhost:3000/hustle-dev-tools/api
🎨 UI Showcase:    http://localhost:3000/hustle-dev-tools/ui
🧪 Test Results:   http://localhost:3000/hustle-dev-tools/tests
📋 Playwright:     http://localhost:3000/hustle-dev-tools/reports
📚 Docs:           http://localhost:3000/hustle-dev-tools/docs
📖 Storybook:      http://localhost:6006
```

---

## Testing the Hooks

```bash
# Run hook tests
cd .claude/hooks && python3 -m pytest tests/ -v

# Or use the slash command
/test-hooks
```

---

## Full Documentation

For complete details on all phases, hooks, agents, and workflows:

**[devkit-readme.md](./devkit-readme.md)** - Full 2400-line documentation

---

## Requirements

- Claude Code 1.0.0+
- Python 3.9+ (for hooks)
- Node.js 18+ (for your project)

---

## License

MIT - [Hustle Together](https://github.com/hustle-together)
