# Configuration Guide

**Version:** 4.6.1
**Last Updated:** 2025-12-30

Complete reference for customizing autonomous mode, interviews, and workflow behavior.

## Configuration Files

| File | Purpose |
|------|---------|
| `.claude/hustle-build-defaults.json` | Project-specific configuration (takes priority) |
| `templates/hustle-build-defaults.json` | Template defaults (fallback) |
| `.claude/api-dev-state.json` | Active workflow state |
| `.claude/registry.json` | Created APIs/components registry |
| `.claude/workflow-logs/` | Session logs and auto-answer audit trail |

## Command-Line Flags (v4.5.0)

Workflow commands support these flags:

### --dry-run

Preview a workflow without making any file changes.

```bash
/hustle-build --dry-run e-commerce checkout flow
/api-create --dry-run stripe-payments
```

**Behavior:**
- Research runs normally
- Interviews happen (or auto-answer in autonomous mode)
- Schemas are generated and displayed
- **No files are written** (Write/Edit blocked by `enforce-dry-run.py`)
- Shows what files WOULD be created

### --resume

Resume an interrupted workflow from its last state.

```bash
/hustle-build --resume build-2025-12-30-dashboard
/api-create --resume
```

**Behavior:**
- Loads workflow state from `.claude/workflow-logs/{id}.json`
- Finds last incomplete phase
- Resumes execution from that point
- Preserves all previous decisions

If no ID provided, resumes the most recent workflow.

### --max-iterations

Override the per-phase iteration limit.

```bash
/hustle-build --max-iterations 10 complex feature
/api-create --max-iterations 3 quick-endpoint
```

**Default:** 25 iterations per phase (from `hustle-build-defaults.json`)

**Per-Phase Limits:**
```json
{
  "max_iterations": {
    "default": 25,
    "phases": {
      "disambiguation": 2,
      "research": 3,
      "interview": 1,
      "schema": 3,
      "tdd_red": 5,
      "tdd_green": 10,
      "verify": 3,
      "code_review": 3,
      "refactor": 5
    }
  }
}
```

When max iterations reached:
1. Log issue to workflow-logs
2. Create partial output
3. Notify via NTFY
4. Continue with other phases

### --parallel

Run workflows in parallel across git worktrees.

```bash
/hustle-build --parallel dashboard with stats and charts
```

**Behavior:**
- Creates git worktrees per independent workflow
- Spawns up to 5 Task agents simultaneously
- Each agent runs in its own worktree
- Shared decisions injected into all agents
- Results merged back when all complete

See [PARALLEL_AUTONOMOUS_WORKFLOW.md](./PARALLEL_AUTONOMOUS_WORKFLOW.md) for details.

### --skip-document (v4.6.0)

Skip the project document intake prompt at the start of `/hustle-build`.

```bash
/hustle-build --skip-document e-commerce checkout
```

**Behavior:**
- Bypasses the project document prompt
- Workflow parses the natural language description directly
- Useful for quick builds without comprehensive specs

### --from-document (v4.6.0)

Load a project document directly from a file path.

```bash
/hustle-build --from-document ./docs/prd.md e-commerce
/hustle-build --from-document ./specs/api-spec.json payments
```

**Behavior:**
- Loads document content from the specified path
- Automatically detects format (markdown, JSON, plain text)
- Proceeds to Phase 1 parsing for AI-powered extraction
- Extracts pages, components, APIs, data models, integrations

**Supported formats:**
- `.md`, `.markdown` - PRDs, specs, design docs
- `.json` - Structured specifications
- `.txt` - Plain text outlines

## Project Documents (v4.6.0)

When `/hustle-build` starts, the `project-document-prompt.py` hook asks if you have a comprehensive project document.

### Document Flow

```
┌─────────────────────────────────────────────────────────────┐
│                 PROJECT DOCUMENT FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. /hustle-build invoked                                    │
│     └─ Hook: project-document-prompt.py triggers             │
│                                                              │
│  2. User provides document                                   │
│     └─ File path: "I have a document at ./docs/spec.md"     │
│     └─ Paste: User pastes content directly                  │
│     └─ URL: "Fetch from https://..."                        │
│     └─ Skip: "No document, proceed with description"        │
│                                                              │
│  3. Phase 1: Document Parsing                                │
│     └─ AI extracts: pages, components, APIs, models         │
│     └─ Builds dependency graph                              │
│     └─ Presents decomposition for approval                  │
│                                                              │
│  4. Elements added to decomposition                          │
│     └─ Each marked with from_project_spec: true             │
│     └─ Sub-workflows receive relevant spec context          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### State Schema

When a document is loaded, state includes:

```json
{
  "project_spec": {
    "source": "file",
    "file_path": "./docs/prd.md",
    "raw_content": "[full document text]",
    "format": "markdown",
    "loaded_at": "2025-12-30T10:00:00Z",
    "word_count": 2500,
    "extracted": {
      "summary": "E-commerce platform with checkout",
      "pages": [
        {
          "name": "Checkout",
          "route": "/checkout",
          "uses_components": ["CartSummary"],
          "uses_apis": ["payments"]
        }
      ],
      "components": [...],
      "apis": [...],
      "data_models": [...],
      "integrations": [...]
    }
  },
  "decomposition": {
    "apis": [
      {
        "name": "payments",
        "from_project_spec": true,
        "spec_reference": "project_spec.extracted.apis[0]"
      }
    ]
  }
}
```

## Remote Questions (v4.6.0)

Answer interview questions remotely via a web interface accessible from your phone.

### Setup

1. **Start the question server:**
   ```bash
   python hooks/remote-question-server.py
   ```

2. **Access the dashboard:**
   - **Local:** http://localhost:8765
   - **Same network (phone/tablet):** http://YOUR_COMPUTER_IP:8765

   Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux), look for 192.168.x.x

3. **Enable notifications (optional):**
   - Click "Enable" button in dashboard header for browser notifications
   - Set NTFY topic for push notifications to your phone

4. **Run workflow as normal:**
   ```bash
   /hustle-build my-feature
   ```

When a question is asked, you'll see it on the dashboard and receive a browser notification (if enabled).

### Configuration

```json
{
  "remote_questions": {
    "enabled": false,
    "port": 8765,
    "wait_mode": false
  }
}
```

| Setting | Default | Description |
|---------|---------|-------------|
| `enabled` | `false` | Enable remote question interface |
| `port` | `8765` | HTTP server port |
| `wait_mode` | `false` | Block until remote answer received |

### Environment Variables

| Variable | Description |
|----------|-------------|
| `REMOTE_QUESTIONS_ENABLED` | Set to `true` to enable |
| `REMOTE_QUESTIONS_PORT` | Server port (default: 8765) |
| `REMOTE_QUESTIONS_WAIT` | Set to `true` for blocking mode |
| `NTFY_TOPIC` | NTFY topic for push notifications |

### Build Dashboard (v4.6.1)

The remote question server now includes a full build progress dashboard:

```
┌────────────────────────────────────────────────────────────────┐
│           HUSTLE BUILD DASHBOARD                                │
├────────────────────────────────────────────────────────────────┤
│  BUILD: e-commerce-checkout              Status: IN PROGRESS    │
│  Started: 2:30 PM    Phase: 4/10    Mode: interactive          │
├────────────────────────────────────────────────────────────────┤
│  PHASE PROGRESS                                                 │
│  [✓] 1. Document Intake & Parsing                              │
│  [✓] 2. Parse Request                                          │
│  [✓] 3. Decompose Into Workflows                               │
│  [●] 4. Orchestrator Interview (in progress)                   │
│  [ ] 5. Create Orchestration State                             │
│  [ ] 6-10...                                                   │
├────────────────────────────────────────────────────────────────┤
│  CURRENT QUESTION                                               │
│  Which authentication method should we use?                    │
│  [○] API Key (Recommended)  [○] OAuth 2.0                     │
│  [          Submit Answer          ]                           │
├────────────────────────────────────────────────────────────────┤
│  BUILD QUEUE                    │  RECENT ACTIVITY             │
│  Type   Name       Status       │  2:45 PM - Research done     │
│  API    payments   ● Building   │  2:42 PM - Interview started │
│  Comp   CartSum    ○ Pending    │  2:38 PM - cart-api done     │
└────────────────────────────────────────────────────────────────┘
```

**Dashboard Features:**
- Build header with name, status, phase counter, and mode
- 10-phase progress checklist with real-time updates
- Current question card with option selection
- Build queue showing APIs, components, pages with dependencies
- Activity log showing recent workflow events
- Mobile-responsive design for phone access
- Auto-refreshes every 2 seconds

**API Endpoints:**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Full dashboard HTML page |
| `/api/status` | GET | Build state JSON (phases, queue, activity) |
| `/api/question` | GET | Current question JSON |
| `/api/answer` | POST | Submit answer |

### Web UI Features

- Dark theme matching Claude Code aesthetic
- Current phase badge
- Option cards with descriptions
- "Other" text input for custom answers
- Answer history in localStorage
- Auto-polls every 2 seconds for new questions

### Files

| File | Purpose |
|------|---------|
| `hooks/remote-question-server.py` | HTTP server with web UI |
| `hooks/remote-question-proxy.py` | PreToolUse hook for AskUserQuestion |
| `.claude/current-question.json` | Current question (read by server) |
| `.claude/pending-answer.json` | Submitted answer (read by Claude) |

## Autonomous Mode

As of v3.0.0, autonomous mode is **ON by default**. The agent uses comprehensive defaults for all interview questions and loops iterative phases until completion.

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTONOMOUS MODE FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Agent receives task (e.g., /hustle-build)                   │
│                                                                 │
│  2. Interview question triggered                                │
│     └─ Hook: auto-answer.py intercepts AskUserQuestion          │
│     └─ Checks: autonomous.enabled + autonomous.skip_interviews  │
│                                                                 │
│  3. Answer selection (if autonomous enabled)                    │
│     └─ Look up question_key in defaults                         │
│     └─ OR: find_comprehensive_option() picks best choice        │
│                                                                 │
│  4. Log the auto-answer                                         │
│     └─ Saves to: .claude/workflow-logs/{build_id}.json          │
│                                                                 │
│  5. Inject answer into context                                  │
│     └─ Agent continues without waiting for user input           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Configuration Options

```json
{
  "autonomous": {
    "enabled": true,
    "skip_interviews": true,
    "use_defaults_for_questions": true,
    "ralph_wiggum_loops": true,
    "max_iterations": 25,
    "emit_promises": true,
    "auto_fix_visual_issues": true,
    "auto_fix_review_issues": true,
    "auto_refactor": true
  }
}
```

| Setting | Default | Description |
|---------|---------|-------------|
| `enabled` | `true` | Master switch for autonomous mode |
| `skip_interviews` | `true` | Auto-answer interview questions |
| `use_defaults_for_questions` | `true` | Use pre-configured defaults instead of AI selection |
| `ralph_wiggum_loops` | `true` | Iterative phases loop until promise emitted |
| `max_iterations` | `25` | Safety limit for loops |
| `emit_promises` | `true` | Output `<promise>DONE</promise>` signals |
| `auto_fix_visual_issues` | `true` | Fix visual QA issues without asking |
| `auto_fix_review_issues` | `true` | Fix code review issues without asking |
| `auto_refactor` | `true` | Proceed with refactoring autonomously |

### Disabling Autonomous Mode

Create `.claude/hustle-build-defaults.json`:

```json
{
  "autonomous": {
    "enabled": false,
    "skip_interviews": false
  }
}
```

With autonomous disabled:
- All interview questions prompt the user
- Iterative phases don't auto-loop
- Visual/review issues require confirmation

## Auto-Answer Selection

When autonomous mode is active, the `auto-answer.py` hook selects answers using this priority:

### 1. Pre-configured Defaults (Highest Priority)

If the question header maps to a default value in `hustle-build-defaults.json`:

```json
{
  "question_mappings": {
    "auth": "auth_required"
  },
  "api": {
    "auth_required": true
  }
}
```

Question with header "auth" → looks up `auth_required` → selects `true`

### 2. `(Recommended)` Option Detection

If no pre-configured default exists, scans options for the `(Recommended)` label:

```json
{
  "options": [
    {"label": "Yes, proceed (Recommended)", "description": "..."},
    {"label": "No, wait", "description": "..."}
  ]
}
```

The option containing `(Recommended)` is selected.

### 3. Comprehensive Keyword Fallback

If neither method works, uses keyword detection:

| Keywords | Score |
|----------|-------|
| `recommended`, `(recommended)` | +20 |
| `all`, `full`, `complete`, `comprehensive` | +10 |
| `everything`, `maximum`, `extensive` | +10 |
| `detailed`, `thorough`, `wcag-aa` | +10 |
| Longer descriptions | +proportional |

The option with highest score is selected.

### Example Flow

```
Question: "Which formats to support?"
Options:
  1. "All formats (Recommended)" → Score: 30 (recommended + all)
  2. "JSON only" → Score: 0
  3. "Custom selection" → Score: 0

Selected: Option 1 "All formats (Recommended)"
```

## Interview Defaults

Pre-configured answers for different workflow types:

### Orchestrator Defaults

```json
{
  "orchestrator": {
    "auth_required": true,
    "error_handling": "partial-success",
    "brand_guide": true,
    "testing_level": "full",
    "caching_strategy": "individual",
    "documentation_level": "comprehensive"
  }
}
```

### API Defaults

```json
{
  "api": {
    "include_all_params": true,
    "rate_limiting": true,
    "caching": "individual",
    "error_format": "detailed",
    "validation": "strict",
    "logging": true,
    "metrics": true
  }
}
```

### Component Defaults

```json
{
  "component": {
    "all_variants": true,
    "accessibility": "wcag-aa",
    "animations": true,
    "responsive": true,
    "dark_mode": true,
    "loading_states": true,
    "error_states": true,
    "storybook": true
  }
}
```

### Page Defaults

```json
{
  "page": {
    "layout": "responsive-grid",
    "seo": true,
    "loading_states": true,
    "error_boundary": true,
    "suspense": true,
    "prefetch": true,
    "meta_tags": true
  }
}
```

### Testing Defaults

```json
{
  "testing": {
    "unit_tests": true,
    "integration_tests": true,
    "e2e_tests": true,
    "visual_tests": true,
    "coverage_threshold": 80,
    "snapshot_tests": true
  }
}
```

## Question Mappings

Map question headers to default values:

```json
{
  "question_mappings": {
    "auth": "auth_required",
    "authentication": "auth_required",
    "error": "error_handling",
    "brand": "brand_guide",
    "styling": "brand_guide",
    "testing": "testing_level",
    "cache": "caching_strategy",
    "variant": "all_variants",
    "a11y": "accessibility",
    "accessibility": "accessibility",
    "layout": "layout",
    "seo": "seo"
  }
}
```

When a question with header "auth" is asked, the system looks up `auth` → `auth_required` → `true`.

## Logging & Audit Trail

All autonomous decisions are logged for post-hoc review.

### Log Locations

| Log | Location | Contents |
|-----|----------|----------|
| Auto-answers | `.claude/workflow-logs/{build_id}.json` | Every auto-answered question |
| Session logs | `.claude/api-sessions/{endpoint}_{timestamp}/` | Full session transcripts |
| Research cache | `.claude/research/{endpoint}/` | Sources, interviews, schemas |
| Promise history | `.claude/completion-promises.json` | Ralph Wiggum promise signals |
| Tool usage | `.claude/tool-usage.json` | Tracked tool calls |

### Auto-Answer Log Format

```json
{
  "auto_answers": [
    {
      "timestamp": "2025-12-30T10:15:00Z",
      "questions": ["Which authentication method should we use?"],
      "answers": {"Which authentication method should we use?": "API Key"},
      "reason": "auto-comprehensive"
    }
  ]
}
```

### Reviewing Autonomous Decisions

After a workflow completes:

```bash
# View auto-answered questions
cat .claude/workflow-logs/*.json | jq '.auto_answers'

# View promise completion history
cat .claude/completion-promises.json

# View research decisions
cat .claude/research/*/interview.json
```

### Session Logging

Full sessions are archived to `.claude/api-sessions/`:

```
.claude/api-sessions/
└── unsplash_2025-12-30T10-15-00/
    ├── transcript.md     # Full conversation
    ├── decisions.json    # Key decisions made
    ├── sources.json      # Research sources used
    └── artifacts/        # Generated files
```

## Workflow State

Active workflow state in `.claude/api-dev-state.json`:

```json
{
  "workflow_id": "unsplash-api-v1",
  "current_phase": "tdd_green",
  "mode": "auto",
  "phases": {
    "disambiguation": "completed",
    "scope": "completed",
    "initial_research": "completed",
    "interview": "completed",
    "deep_research": "completed",
    "schema": "completed",
    "environment": "completed",
    "tdd_red": "completed",
    "tdd_green": "in_progress"
  },
  "interview_decisions": {
    "auth_method": "API Key via header",
    "rate_limiting": "50 req/hour"
  },
  "research_sources": [
    {"url": "https://unsplash.com/documentation", "fetched": "2025-12-30"}
  ]
}
```

## Registry

Created artifacts tracked in `.claude/registry.json`:

```json
{
  "version": "1.4.0",
  "apis": {
    "unsplash": {
      "route": "/api/v2/unsplash",
      "schema_path": "lib/schemas/unsplash.ts",
      "test_path": "tests/api/unsplash.test.ts"
    }
  },
  "components": {},
  "pages": {},
  "brand_guide": {
    "completed": true,
    "custom_elements": ["terminal", "gradients"]
  }
}
```

## Customization Examples

### Minimal Testing (Speed)

```json
{
  "autonomous": {
    "enabled": true,
    "skip_interviews": true
  },
  "testing": {
    "unit_tests": true,
    "integration_tests": false,
    "e2e_tests": false,
    "visual_tests": false,
    "coverage_threshold": 50
  }
}
```

### Maximum Documentation

```json
{
  "autonomous": {
    "enabled": true
  },
  "documentation": {
    "tsdoc": true,
    "readme": true,
    "changelog": true,
    "storybook_docs": true,
    "api_reference": true,
    "architecture_diagrams": true
  }
}
```

### Manual Interviews Only

```json
{
  "autonomous": {
    "enabled": false,
    "skip_interviews": false
  }
}
```

## Environment Variables

Hooks respect these environment variables:

| Variable | Purpose |
|----------|---------|
| `CLAUDE_PROJECT_DIR` | Project root directory |
| `CLAUDE_TOOL_INPUT` | Current tool input (set by Claude) |
| `CLAUDE_TOOL_NAME` | Current tool name (set by Claude) |
| `REMOTE_QUESTIONS_ENABLED` | Enable remote question interface |
| `REMOTE_QUESTIONS_PORT` | Question server port (default: 8765) |
| `REMOTE_QUESTIONS_WAIT` | Block until remote answer received |
| `NTFY_TOPIC` | NTFY notification topic |

## See Also

- [AUTONOMOUS_LOOPS.md](./AUTONOMOUS_LOOPS.md) - Ralph Wiggum pattern details
- [HOOKS.md](./HOOKS.md) - All hook documentation
- [SKILLS.md](./SKILLS.md) - Available slash commands
