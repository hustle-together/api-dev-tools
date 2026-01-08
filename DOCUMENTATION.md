# Devkit - AI-Assisted Development Workflow System

> **The Scientific Method Applied to Software Development**
> 
> Research → Hypothesize → Experiment → Verify → Document → Iterate

---

## Table of Contents

1. [What is Devkit?](#what-is-devkit)
2. [Philosophy: Why 14 Phases?](#philosophy-why-14-phases)
3. [System Architecture](#system-architecture)
4. [The 14-Phase Workflow](#the-14-phase-workflow)
5. [Interactive Showcase System](#interactive-showcase-system)
6. [Visual QA with Haiku](#visual-qa-with-haiku)
7. [All 22 Hooks Explained](#all-22-hooks-explained)
8. [All 12 Agents Explained](#all-12-agents-explained)
9. [Workflows & Commands](#workflows--commands)
10. [MCP Integrations](#mcp-integrations)
11. [State Management](#state-management)
12. [Registry System](#registry-system)
13. [Practical Examples](#practical-examples)
14. [Installation & Setup](#installation--setup)
15. [Configuration Reference](#configuration-reference)
16. [Testing Hooks](#testing-hooks)

---

## What is Devkit?

Devkit is a **workflow enforcement system** for Claude Code that ensures consistent, high-quality development through structured phases. It prevents Claude from cutting corners by:

- **Enforcing research before coding** (no guessing from training data)
- **Requiring tests before implementation** (true TDD)
- **Verifying against documentation** (catching drift)
- **Registering all artifacts** (reusable, trackable)
- **Running autonomous quality loops** (visual testing, code review)

### The Problem It Solves

Without Devkit, Claude might:
- Use outdated API patterns from training data
- Skip tests and go straight to implementation
- Forget what it learned mid-conversation
- Create components that don't match existing patterns
- Leave documentation incomplete

With Devkit, Claude **must**:
- Research current documentation before writing code
- Write failing tests before any implementation
- Verify implementation against docs after coding
- Follow established patterns from the registry
- Complete all quality gates before finishing

---

## Philosophy: Why 14 Phases?

The 14 phases map to the **scientific method**:

| Scientific Method | Devkit Phases | Purpose |
|-------------------|---------------|---------|
| **Observe** | 1-2: Clarify | Understand what we're building |
| **Research** | 3-5: Research | Gather current knowledge |
| **Hypothesize** | 6: Schema | Define expected structure |
| **Experiment** | 7-9: TDD | Build with verification |
| **Analyze** | 10-11: Verify & Review | Compare results to expectations |
| **Refine** | 12: Refactor | Improve based on analysis |
| **Publish** | 13-14: Document & Complete | Share findings |

### Conditional Execution

Not every task needs all 14 phases. The system is **registry-aware**:

```
IF registry has fresh pattern (< 7 days) for similar task:
  → Skip phases 3-5 (research already done)
  
IF artifact already exists with same checksum:
  → Skip to verification only
  
IF quick fix (< 50 lines, passes review):
  → Skip phase 12 (refactor)
```

This maintains **rigor** for new work while allowing **efficiency** for known patterns.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER COMMANDS                                │
│  /create api users  │  /create component Button  │  /build feature  │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      ORCHESTRATOR (Sonnet)                           │
│  • Reads state.json for current progress                            │
│  • Checks registry.json for existing patterns                        │
│  • Determines which phases to run                                    │
│  • Delegates to specialized subagents                                │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
           ┌───────────────────────┼───────────────────────┐
           │                       │                       │
           ▼                       ▼                       ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   RESEARCHER    │   │     BUILDER     │   │    REVIEWER     │
│   (Haiku)       │   │    (Sonnet)     │   │    (Sonnet)     │
│                 │   │                 │   │                 │
│ • Context7 MCP  │   │ • TDD Red       │   │ • Code Review   │
│ • WebSearch     │   │ • TDD Green     │   │ • Security Scan │
│ • ToC Scraping  │   │ • TDD Refactor  │   │ • Pattern Check │
│ • Cache Results │   │ • Integration   │   │ • A11y Audit    │
└─────────────────┘   └─────────────────┘   └─────────────────┘
           │                       │                       │
           └───────────────────────┼───────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          22 HOOKS                                    │
│  PreToolUse: Block code changes until requirements met               │
│  PostToolUse: Format code, update registry                          │
│  Stop: Verify all tests pass, run Ralph loops                       │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        STATE FILES                                   │
│  .devkit/state.json    - Workflow progress, checkpoints             │
│  .devkit/registry.json - All created artifacts                      │
│  .devkit/research/     - Cached documentation (7-day TTL)           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## The 14-Phase Workflow

### Phase Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    THE 14 PHASES                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  CLARIFY (Phases 1-2)                                               │
│  ├── 1. Disambiguation    "What exactly are we building?"           │
│  └── 2. Scope            "What's in/out of scope?"                  │
│                                                                      │
│  RESEARCH (Phases 3-5)                                              │
│  ├── 3. Initial Research  Context7 + WebSearch + ToC scraping       │
│  ├── 4. Interview         Questions FROM research findings          │
│  └── 5. Deep Research     Follow-up based on interview answers      │
│                                                                      │
│  PREPARE (Phases 6-7)                                               │
│  ├── 6. Schema           Zod types from research + interview        │
│  └── 7. Environment      Verify API keys, packages, config          │
│                                                                      │
│  BUILD (Phases 8-9)                                                 │
│  ├── 8. TDD Red          Write FAILING tests first                  │
│  └── 9. TDD Green        MINIMAL code to pass tests                 │
│                                                                      │
│  VERIFY (Phases 10-12)                                              │
│  ├── 10. Verify          Re-research docs, compare to code          │
│  ├── 11. Code Review     Security, patterns, performance            │
│  └── 12. Refactor        Fix issues, improve code quality           │
│                                                                      │
│  COMPLETE (Phases 13-14)                                            │
│  ├── 13. Documentation   TypeDoc, registry, showcase                │
│  └── 14. Completion      Final verification, commit                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Phase Details

#### Phase 1: Disambiguation
**Purpose:** Clarify ambiguous terms before proceeding

**Example:**
```
User: "Create a Stripe checkout"

Claude asks: "Which Stripe checkout approach?
  A) Stripe Checkout (hosted page) ← Recommended
  B) Stripe Elements (embedded form)
  C) Custom integration"
```

**Gate:** `research-gate.py` blocks code changes until clarification complete

---

#### Phase 2: Scope
**Purpose:** Define what's in/out of scope

**Output:**
```json
{
  "scope": {
    "in": ["Create checkout session", "Handle success/cancel redirects"],
    "out": ["Subscription management", "Invoice handling"],
    "success_criteria": ["User can complete purchase", "Webhook confirms payment"]
  }
}
```

**Gate:** `research-gate.py` blocks code changes until scope confirmed

---

#### Phase 3: Initial Research
**Purpose:** Gather current documentation BEFORE any decisions

**Tools Used:**
- **Context7 MCP** → Library-specific docs
- **WebSearch** → Official docs, changelogs
- **ToC Scraping** → Discover ALL features (not just what we know to search for)

**Process:**
```
1. Scrape Stripe docs table of contents
2. Identify: checkout modes, webhooks, error codes, rate limits
3. Search Context7 for implementation patterns
4. WebSearch for recent changes, known issues
5. Cache results in .devkit/research/stripe-checkout/
```

**Hook:** `research-gate.py` blocks code changes until research complete

---

#### Phase 4: Interview
**Purpose:** Ask questions DERIVED from research findings

**Key Principle:** Questions come from what research discovered, not templates

**Example:**
```
Research found: Stripe has 3 checkout modes, 47 webhook events, idempotency support

Interview asks:
1. "Research shows 3 checkout modes. Which do you need?"
2. "47 webhook events available. Which are relevant?"
3. "Idempotency supported. Enable for retry safety?"
```

**Hook:** `interview-gate.py` ensures questions are research-sourced

---

#### Phase 5: Deep Research
**Purpose:** Follow-up research based on interview answers

**Example:**
```
Interview answer: "Use hosted checkout with refund webhooks"

Deep research:
1. Search specifically for hosted checkout patterns
2. Research refund webhook payload structure
3. Find edge cases in GitHub issues
4. Update research cache
```

**Gate:** `research-gate.py` ensures all research phases complete before coding

---

#### Phase 6: Schema
**Purpose:** Create Zod schemas from research + interview

**Subagent:** `schema-generator` (Sonnet)

**Output:**
```typescript
// src/lib/schemas/stripe-checkout.ts
import { z } from 'zod';

export const CheckoutSessionSchema = z.object({
  mode: z.enum(['payment', 'subscription', 'setup']),
  lineItems: z.array(LineItemSchema),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  // ... all fields from research
});
```

**Hook:** `schema-gate.py` blocks until schema matches research findings

---

#### Phase 7: Environment
**Purpose:** Verify everything needed exists before coding

**Checks:**
```bash
✓ STRIPE_SECRET_KEY exists in .env
✓ STRIPE_WEBHOOK_SECRET exists in .env
✓ stripe package installed (v14.x)
✓ API route structure ready
```

**Gate:** `schema-gate.py` blocks implementation until environment verified

---

#### Phase 8: TDD Red
**Purpose:** Write FAILING tests that define expected behavior

**Subagent:** `test-writer` (isolated context - can't "cheat")

**Output:**
```typescript
// src/app/api/checkout/__tests__/checkout.test.ts
describe('POST /api/checkout', () => {
  it('creates checkout session with valid items', async () => {
    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
    expect(await response.json()).toHaveProperty('sessionId');
  });

  it('returns 400 for empty cart', async () => {
    const response = await POST(emptyCartRequest);
    expect(response.status).toBe(400);
  });

  // ... tests for all scope items
});
```

**Hook:** `tdd-gate.py` blocks implementation until tests exist AND fail

---

#### Phase 9: TDD Green
**Purpose:** Write MINIMAL code to pass tests

**Subagent:** `implementer` (isolated - only sees failing tests)

**Rules:**
- Only write enough code to pass tests
- Don't add features not covered by tests
- Don't optimize yet

**Hook:** `tdd-gate.py` confirms tests now pass

---

#### Phase 10: Verify
**Purpose:** Re-research docs and compare to implementation

**Process:**
```
1. Fresh lookup of current Stripe docs (not cached)
2. Compare implementation to official examples
3. Check for:
   - Correct endpoints used
   - All required parameters included
   - Error handling matches docs
   - Rate limiting considered
4. Report discrepancies
```

**Hook:** `verify-gate.py` blocks if implementation drifts from docs

---

#### Phase 11: Code Review
**Purpose:** AI-powered security and quality review

**Subagent:** `reviewer` (Sonnet)

**Checks:**
```
SECURITY (OWASP Top 10):
☐ No SQL injection
☐ Input validation present
☐ No exposed credentials
☐ XSS prevention

CODE QUALITY:
☐ Follows project conventions
☐ Proper error handling
☐ No code duplication
☐ TypeScript strict mode

PERFORMANCE:
☐ No N+1 queries
☐ Appropriate caching
☐ Bundle size reasonable
```

**Gate:** `verify-gate.py` blocks completion if critical issues found

---

#### Phase 12: Refactor
**Purpose:** Improve code while keeping tests green

**Targets:**
- Fix code review issues
- Extract shared utilities
- Improve naming
- Add inline documentation

**Gate:** `verify-gate.py` blocks if tests fail after refactoring

---

#### Phase 13: Documentation
**Purpose:** Update all documentation and registry

**Outputs:**
```
1. Registry entry in .devkit/registry.json
2. OpenAPI spec in docs/api/
3. TypeDoc comments in source
4. README updates if needed
5. Showcase entry for interactive testing
```

**Hook:** `docs-gate.py` blocks if documentation incomplete

---

#### Phase 14: Completion
**Purpose:** Final verification and commit

**Checklist:**
```
☐ All tests passing (unit, E2E, visual)
☐ No TypeScript errors
☐ No ESLint errors
☐ Registry updated
☐ Documentation complete
☐ All scope items addressed
```

**Gate:** `docs-gate.py` + `ralph-loop.py` for final verification

---

## Interactive Showcase System

The Showcase System provides **full interactive testing interfaces** for all created artifacts, automatically generated and updated as you build.

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SHOWCASE SYSTEM                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  /hustle-dev-tools/                   ← Main Dashboard               │
│  ├── /api/                            ← API Showcase                 │
│  │   ├── APITester.tsx                  Interactive param builder    │
│  │   ├── APIModal.tsx                   Try-it-now modal            │
│  │   └── CurlGenerator.tsx              Auto-generated curl          │
│  │                                                                   │
│  ├── /ui/                             ← UI Showcase                  │
│  │   ├── UIShowcase.tsx                 Component grid               │
│  │   ├── PreviewModal.tsx               Live Sandpack editor         │
│  │   └── PropsEditor.tsx                Interactive props            │
│  │                                                                   │
│  ├── /tests/                          ← Test Results                 │
│  │   ├── Unit test results (Vitest)                                 │
│  │   ├── E2E results (Playwright)                                   │
│  │   └── Visual regression (Storybook)                              │
│  │                                                                   │
│  ├── /reports/                        ← Playwright Reports           │
│  │   └── Full HTML reports with screenshots & traces                │
│  │                                                                   │
│  ├── /docs/                           ← TypeDoc Documentation        │
│  │   └── Auto-generated API documentation                           │
│  │                                                                   │
│  └── /visual-qa/                      ← Visual QA Results            │
│      └── Haiku analysis with severity icons                         │
│                                                                      │
│  External:                                                           │
│  └── Storybook :6006                  ← Component Stories            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Completion Links

When a workflow completes, you get links to all outputs:

```
✅ Workflow Complete: stripe-checkout

📊 Dashboard:      http://localhost:3000/hustle-dev-tools
🔌 API Showcase:   http://localhost:3000/hustle-dev-tools/api
🎨 UI Showcase:    http://localhost:3000/hustle-dev-tools/ui
🧪 Test Results:   http://localhost:3000/hustle-dev-tools/tests
📋 Playwright:     http://localhost:3000/hustle-dev-tools/reports
📚 Docs:           http://localhost:3000/hustle-dev-tools/docs
🔍 Visual QA:      http://localhost:3000/hustle-dev-tools/visual-qa
📖 Storybook:      http://localhost:6006
```

### How It Works

1. **Registry-Driven**: All showcases read from `.devkit/registry.json`
2. **Auto-Generated**: `showcase-gen.py` hook copies templates on file changes
3. **Full Interactive**: Not static pages - real components with live testing

### API Showcase Features

```typescript
// What you get for EVERY API endpoint:

interface APIShowcaseEntry {
  name: string;                    // "stripe-checkout"
  route: string;                   // "/api/checkout"
  methods: ("GET" | "POST")[];     // ["POST"]
  endpoints: {
    default: {
      params: Array<{
        name: string;              // "domain"
        type: string;              // "string"
        required: boolean;         // true
        min?: number;              // 3
        max?: number;              // 255
        description?: string;      // "Domain to fetch brand for"
        enum?: string[];           // ["option1", "option2"]
      }>;
      examples: {
        basic_post: {
          curl: string;            // Full curl command
          body: object;            // Request body
        };
      };
    };
  };
}
```

### UI Showcase Features

```
┌─────────────────────────────────────────────────────────────────────┐
│                    UI COMPONENT SHOWCASE                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐   │
│  │   DataTable     │   │    Button       │   │    Modal        │   │
│  │   ─────────     │   │    ──────       │   │    ─────        │   │
│  │   [Preview]     │   │   [Preview]     │   │   [Preview]     │   │
│  │   [Stories: 4]  │   │   [Stories: 8]  │   │   [Stories: 3]  │   │
│  │   [Props: 12]   │   │   [Props: 6]    │   │   [Props: 5]    │   │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘   │
│                                                                      │
│  Click any component to open interactive preview with:               │
│  • Live Sandpack editor (edit code, see changes)                    │
│  • Props playground (adjust all props interactively)                │
│  • Viewport selector (mobile/tablet/desktop)                        │
│  • Dark mode toggle                                                  │
│  • Direct Storybook link                                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Showcase Generation Hook

```python
# .claude/hooks/showcase-gen.py

# Triggered: PostToolUse for Write (when registry.json updated)
# Action: Copies full interactive templates to user's project

def main():
    # 1. Load registry from .devkit/registry.json
    registry = load_registry()

    # 2. Copy template directories (NOT generate static pages)
    copy_template_tree("templates/api-showcase", "app/hustle-dev-tools/api")
    copy_template_tree("templates/ui-showcase", "app/hustle-dev-tools/ui")

    # 3. Templates import from registry dynamically
    # No code generation needed - templates read registry.json at runtime
```

### Tailwind CSS v4 Support

Showcases use Tailwind CSS v4 with the new PostCSS plugin:

```javascript
// templates/postcss.config.js (installed into user's project)
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}
  }
}
```

---

## Visual QA with Haiku

The Visual QA system uses **Claude Haiku** for fast, cost-effective visual analysis of UI components.

### Visual QA Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VISUAL QA WORKFLOW                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  STEP 1: UI File Written                                            │
│  ├── PostToolUse hook triggers                                      │
│  └── visual-qa.py creates task spec in .devkit/tasks/visual-qa/    │
│                                                                      │
│  STEP 2: /visual-qa Command Executed                                │
│  ├── Load pending task specs                                        │
│  ├── Playwright MCP captures screenshots:                           │
│  │   • Mobile (375x667)                                             │
│  │   • Tablet (768x1024)                                            │
│  │   • Desktop (1920x1080)                                          │
│  │   • Dark mode variants                                           │
│  │   • Interaction states (hover, focus)                            │
│  └── Screenshots saved to .devkit/screenshots/{component}/          │
│                                                                      │
│  STEP 3: Haiku Analysis                                             │
│  ├── Task tool spawns Haiku subagent                                │
│  ├── Haiku analyzes each screenshot for:                            │
│  │   • Color contrast (WCAG AA: 4.5:1 text, 3:1 UI)                │
│  │   • Touch targets (minimum 44x44px)                              │
│  │   • Focus state visibility                                       │
│  │   • Responsive layout issues                                     │
│  │   • Dark mode compatibility                                      │
│  │   • Visual consistency                                           │
│  └── Returns structured JSON with issues                            │
│                                                                      │
│  STEP 4: Results Saved                                              │
│  ├── .devkit/visual-qa-results.json updated                         │
│  ├── Task spec marked complete                                      │
│  └── Issues displayed in /hustle-dev-tools/visual-qa                │
│                                                                      │
│  STEP 5: Ralph Loop Integration                                     │
│  ├── If errors found, ralph-loop.py blocks completion               │
│  ├── enforce-refactor.py injects issues as checklist                │
│  ├── Claude fixes issues during refactor phase                      │
│  ├── /visual-qa re-runs to verify fixes                             │
│  └── Loop continues until all errors resolved                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Task Spec Structure

```json
// .devkit/tasks/visual-qa/abc12345-Button.json
{
  "id": "abc12345",
  "type": "visual-qa",
  "component": "Button",
  "file": "src/components/Button/Button.tsx",
  "status": "pending",
  "created_at": "2025-01-03T12:00:00Z",
  "storybook": {
    "available": true,
    "url": "http://localhost:6006/?path=/story/button--default"
  },
  "viewports": [
    {"name": "mobile", "width": 375, "height": 667},
    {"name": "tablet", "width": 768, "height": 1024},
    {"name": "desktop", "width": 1920, "height": 1080}
  ],
  "checks": [
    {"id": "contrast", "name": "Color Contrast", "severity_if_fail": "error"},
    {"id": "touch_targets", "name": "Touch Targets", "severity_if_fail": "error"},
    {"id": "focus_states", "name": "Focus States", "severity_if_fail": "error"},
    {"id": "responsive", "name": "Responsive Layout", "severity_if_fail": "warning"},
    {"id": "dark_mode", "name": "Dark Mode", "severity_if_fail": "info"}
  ],
  "screenshots_dir": ".devkit/screenshots/Button"
}
```

### Visual QA Results

```json
// .devkit/visual-qa-results.json
{
  "Button": {
    "timestamp": "2025-01-03T12:05:00Z",
    "results": {
      "overall_status": "warning",
      "summary": {
        "total_issues": 2,
        "errors": 0,
        "warnings": 2,
        "info": 0
      },
      "issues": [
        {
          "severity": "warning",
          "category": "responsive",
          "viewport": "mobile",
          "description": "Button text truncates on small screens",
          "element": ".btn-primary",
          "suggestion": "Add text-wrap or reduce font-size on mobile"
        },
        {
          "severity": "warning",
          "category": "visual",
          "viewport": "desktop",
          "description": "Inconsistent padding on hover state",
          "element": ".btn-primary:hover",
          "suggestion": "Ensure padding remains consistent during hover"
        }
      ],
      "passed_checks": [
        {"category": "contrast", "description": "All text meets WCAG AA (4.5:1)"},
        {"category": "touch_targets", "description": "Button is 48x44px, exceeds minimum"},
        {"category": "focus_states", "description": "Visible focus ring on all variants"}
      ]
    }
  }
}
```

### Refactor Phase Integration

When visual QA finds errors, they're injected into the refactor phase:

```
═══════════════════════════════════════════════════════════
VISUAL QA ISSUES - REFACTOR CHECKLIST
═══════════════════════════════════════════════════════════

ERRORS (blocking - must fix):

  1. [contrast] LoginForm
     Issue: Button text contrast 3.2:1 fails WCAG AA (need 4.5:1)
     Element: .submit-btn
     Fix: Change text color from #888 to #595959

  2. [touch_targets] NavMenu
     Issue: Menu items 32x28px below 44x44px minimum
     Element: .nav-item
     Fix: Add padding or min-height: 44px

WARNINGS (should fix):

  1. [responsive] DataTable
     Issue: Table overflows container on mobile
     Fix: Add overflow-x-auto wrapper

═══════════════════════════════════════════════════════════

After fixing issues:
1. Run /visual-qa to re-analyze components
2. Verify all errors are resolved
3. Continue with refactor
```

### Ralph Loop with Visual QA

The Ralph loop blocks completion until visual QA passes:

```python
# .claude/hooks/ralph-loop.py (enhanced)

def main():
    # Check for visual QA errors in UI workflows
    if is_ui_workflow(devkit_state):
        visual_qa_errors = get_visual_qa_errors()

        if visual_qa_errors:
            # Block completion
            print(f"""
VISUAL QA ERRORS BLOCKING COMPLETION
====================================

{len(visual_qa_errors)} error(s) must be fixed:

{format_errors(visual_qa_errors)}

Fix these issues, then run /visual-qa to re-analyze.
""")
            sys.exit(2)  # Block stop

    # Continue with normal completion check
    if COMPLETION_PROMISE in transcript:
        sys.exit(0)  # Allow stop
```

---

## All 22 Hooks Explained

The Devkit includes 22 enforcement hooks that power the workflow:

### Core Hooks Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          22 HOOKS                                    │
├─────────────────────────────────────────────────────────────────────┤
│  Gate Hooks (6)         │ Block actions until phase requirements met │
│  State Hooks (4)        │ Manage workflow state and registry         │
│  Quality Hooks (4)      │ Code review, formatting, visual QA         │
│  Autonomous Hooks (3)   │ Ralph loop, auto-answer, context           │
│  Context Hooks (2)      │ Capacity warnings, subagent verification   │
│  Utility Hooks (3)      │ Validation, notifications, completion      │
└─────────────────────────────────────────────────────────────────────┘
```

### Gate Hooks (6)

Block code changes until phase requirements are met:

| Hook | Trigger | Purpose |
|------|---------|---------|
| `research-gate.py` | PreToolUse (Edit/Write) | Blocks code changes until research phase complete |
| `interview-gate.py` | PreToolUse (Edit/Write) | Blocks until interview decisions captured |
| `schema-gate.py` | PreToolUse (Edit/Write) | Blocks until Zod schema approved |
| `tdd-gate.py` | PreToolUse (Edit/Write) | Blocks implementation until tests exist and fail |
| `verify-gate.py` | Stop | Blocks completion without verification phase |
| `docs-gate.py` | Stop | Blocks completion until documentation complete |

### State Management Hooks (4)

| Hook | Trigger | Purpose |
|------|---------|---------|
| `state-manager.py` | PostToolUse (Edit/Write) | Update state.json after each action |
| `registry-manager.py` | PostToolUse (Edit/Write) | Update registry.json with artifact checksums |
| `registry-update.py` | PostToolUse (Write) | Add APIs/components/pages with Zod parsing |
| `session-manager.py` | SessionStart | Initialize workflow state at session start |

### Quality Hooks (4)

| Hook | Trigger | Purpose |
|------|---------|---------|
| `format.py` | PostToolUse (Edit/Write) | Auto-format with Prettier after changes |
| `code-review.py` | PostToolUse (Edit/Write) | Queue files for AI code review |
| `visual-qa.py` | PostToolUse (Write) | Create visual QA task specs for Haiku analysis |
| `showcase-gen.py` | PostToolUse (Write) | Copy showcase templates when registry updated |

### Autonomous Hooks (3)

| Hook | Trigger | Purpose |
|------|---------|---------|
| `ralph-loop.py` | Stop | Force continuation until completion promise + visual QA |
| `auto-answer.py` | PreToolUse (AskUser) | Auto-select (Recommended) options |
| `reground.py` | Stop | Re-inject state to prevent context drift |

### Context Hooks (2)

| Hook | Trigger | Purpose |
|------|---------|---------|
| `capacity-warning.py` | Stop | Warn at 50/75/90% context capacity |
| `subagent-verify.py` | SubagentStop | Verify subagent deliverables match spec |

### Utility Hooks (3)

| Hook | Trigger | Purpose |
|------|---------|---------|
| `validate-bash.py` | PreToolUse (Bash) | Validate bash commands for safety |
| `notify.py` | Notification | NTFY push notification when awaiting input |
| `completion-links.py` | Stop | Show dashboard/showcase links at workflow completion |

### How Hooks Enforce Phases

```
USER: "Create the checkout API route"

┌─────────────────────────────────────────────────────────────────────┐
│ PreToolUse Hook Chain (before Claude can write code)                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. research-gate.py                                                │
│     ├── Check: state.json → phases.research.complete?               │
│     ├── If FALSE: Block with "Complete research first"              │
│     └── If TRUE: Continue to next hook                              │
│                                                                      │
│  2. interview-gate.py                                               │
│     ├── Check: state.json → phases.interview.complete?              │
│     ├── If FALSE: Block with "Complete interview first"             │
│     └── If TRUE: Continue                                           │
│                                                                      │
│  3. schema-gate.py                                                  │
│     ├── Check: schema file exists matching research?                │
│     ├── If FALSE: Block with "Create schema first"                  │
│     └── If TRUE: Continue                                           │
│                                                                      │
│  4. tdd-gate.py                                                     │
│     ├── Check: test file exists for this route?                     │
│     ├── Check: tests are currently FAILING?                         │
│     ├── If no tests: Block with "Write tests first"                 │
│     └── If tests pass already: Block with "Tests shouldn't pass yet"│
│                                                                      │
│  ALL GATES PASS → Claude can write code                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### PostToolUse Hooks (After Code Changes)

```
CLAUDE: *writes checkout route*

┌─────────────────────────────────────────────────────────────────────┐
│ PostToolUse Hook Chain (after code written)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. format.py                                                       │
│     └── Run: npx prettier --write $FILE                             │
│                                                                      │
│  2. registry-manager.py                                             │
│     └── Update registry.json with new artifact                      │
│                                                                      │
│  3. state-manager.py                                                │
│     └── Update state.json progress                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Stop Hooks (When Claude Tries to Finish)

```
CLAUDE: "I've completed the checkout API. DONE."

┌─────────────────────────────────────────────────────────────────────┐
│ Stop Hook Chain (before Claude can stop)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. verify-gate.py                                                  │
│     ├── Run: npm test                                               │
│     ├── If tests fail: Exit code 2 → "Tests failing, fix them"      │
│     └── If tests pass: Continue                                     │
│                                                                      │
│  2. ralph-loop.py                                                   │
│     ├── Check: completion promise in output? ("DONE")               │
│     ├── Check: iteration count < max (50)?                          │
│     ├── If incomplete: Exit code 2 → "Continue working"             │
│     └── If complete: Exit code 0 → Allow stop                       │
│                                                                      │
│  ALL STOP HOOKS PASS → Claude can finish                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## All 12 Agents Explained

### Agent Architecture

Agents are spawned via the Task tool with `subagent_type` parameter. All agent definitions live in `.claude/agents/`.

```
┌─────────────────────────────────────────────────────────────────────┐
│                       12 AGENTS BY CATEGORY                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ORCHESTRATION (1)                                                   │
│  └── orchestrator        Coordinate workflows, delegate to others   │
│                                                                      │
│  RESEARCH (3)                                                        │
│  ├── researcher          Gather docs before implementation          │
│  ├── parallel-researcher Fast parallel documentation scraping       │
│  └── research-validator  Deep dive API endpoint discovery           │
│                                                                      │
│  IMPLEMENTATION (2)                                                  │
│  ├── builder             TDD implementation (Red-Green-Refactor)    │
│  └── schema-generator    Generate Zod schemas from research         │
│                                                                      │
│  TESTING (1)                                                         │
│  └── test-writer         Write failing tests before implementation  │
│                                                                      │
│  REVIEW (3)                                                          │
│  ├── reviewer            General code review and pattern check      │
│  ├── code-reviewer       Security and performance focused review    │
│  └── implementation-reviewer  Compare implementation vs docs        │
│                                                                      │
│  DOCUMENTATION (1)                                                   │
│  └── docs-generator      Generate API docs, update registry         │
│                                                                      │
│  VISUAL (1)                                                          │
│  └── visual-analyzer     Screenshot testing, visual QA with Haiku   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### All 12 Agents

| Agent | Model | Purpose | Tools |
|-------|-------|---------|-------|
| `orchestrator` | Sonnet | Coordinate workflows, manage state, delegate | All |
| `researcher` | Haiku | Gather documentation before implementation | WebSearch, WebFetch, Context7, Read, Grep |
| `parallel-researcher` | Haiku | Fast parallel doc scraping for Phase 3/5 | WebSearch, WebFetch, Context7, Read |
| `research-validator` | Sonnet | Deep dive to discover ALL API endpoints | Read, WebSearch, WebFetch, Context7 |
| `builder` | Sonnet | TDD implementation with isolated context | Read, Edit, Write, Grep, Glob, Bash |
| `schema-generator` | Sonnet | Generate Zod schemas from research/interview | Read, Write, Grep, Glob |
| `test-writer` | Sonnet | Write comprehensive failing tests (TDD Red) | Read, Write, Grep, Glob |
| `reviewer` | Sonnet | General code review, pattern validation | Read, Grep, Glob, Bash |
| `code-reviewer` | Sonnet | Security vulnerabilities, performance issues | Read, Grep, Glob |
| `implementation-reviewer` | Sonnet | Compare implementation against documentation | Read, Grep, Glob |
| `docs-generator` | Haiku | Generate documentation, update registry | Read, Write, Glob |
| `visual-analyzer` | Haiku | Screenshot testing, visual regression | Playwright MCP, Read |

### Why Isolated Subagents Matter

**The Problem:** If Claude writes tests and implementation in the same context, it "cheats" by designing tests around what it plans to implement.

**The Solution:** Isolated subagent contexts

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TDD ISOLATION PATTERN                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PHASE 8: TDD RED                                                   │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  test-writer subagent (fresh context)                        │    │
│  │  • Sees: Schema, research findings, scope                    │    │
│  │  • Cannot see: Any implementation code                       │    │
│  │  • Writes: Comprehensive failing tests                       │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                              ▼                                       │
│  PHASE 9: TDD GREEN                                                 │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  implementer subagent (fresh context)                        │    │
│  │  • Sees: ONLY the failing test file                          │    │
│  │  • Cannot see: Research, interview, schema rationale         │    │
│  │  • Writes: Minimal code to pass tests                        │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                              ▼                                       │
│  PHASE 12: REFACTOR                                                 │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  refactorer subagent (fresh context)                         │    │
│  │  • Sees: Passing tests + implementation                      │    │
│  │  • Goal: Improve without changing behavior                   │    │
│  │  • Tests must stay green                                     │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Workflows & Commands

The Devkit includes **37 slash commands** organized into categories. All commands are defined in `.claude/commands/`.

### Command Categories

```
┌─────────────────────────────────────────────────────────────────────┐
│                       38 SLASH COMMANDS                              │
├─────────────────────────────────────────────────────────────────────┤
│  Main Workflows (5)    │ /create api, component, page, orchestration│
│  API Commands (6)      │ /api-create, research, interview, verify...│
│  TDD Commands (6)      │ /red, /green, /refactor, /cycle, /tdd...   │
│  Git Commands (3)      │ /commit, /busycommit, /pr                  │
│  Hustle Commands (4)   │ /hustle-build, combine, ui-create...       │
│  Utility Commands (14) │ /plan, /gap, /summarize, /test-hooks...    │
└─────────────────────────────────────────────────────────────────────┘
```

### Main Workflow Commands

| Command | Purpose | Primary Agents |
|---------|---------|----------------|
| `/create api <name>` | Create API endpoint | researcher → builder → reviewer |
| `/create component <Name>` | Create React component | researcher → builder → visual-analyzer |
| `/create page <path>` | Create Next.js page | researcher → builder → visual-analyzer |
| `/create orchestration <name>` | Combine existing APIs | orchestrator |
| `/build <description>` | Full feature (decomposed) | orchestrator → all others |

### All Commands Reference

| Category | Commands |
|----------|----------|
| **API Development** | `/api-create`, `/api-research`, `/api-interview`, `/api-verify`, `/api-env`, `/api-status` |
| **TDD Workflow** | `/red`, `/green`, `/refactor`, `/cycle`, `/tdd`, `/spike` |
| **Git & PR** | `/commit`, `/busycommit`, `/pr` |
| **Hustle Suite** | `/hustle-build`, `/hustle-combine`, `/hustle-ui-create`, `/hustle-ui-create-page` |
| **Planning** | `/plan`, `/issue`, `/gap`, `/summarize` |
| **Testing** | `/test-hooks`, `/visual-qa` |
| **Worktree** | `/worktree-add`, `/worktree-cleanup` |
| **Notifications** | `/ntfy-setup`, `/ntfy-test` |
| **Utilities** | `/add-command`, `/beepboop`, `/publish` |

### Workflow 1: `/create api`

```
/create api stripe-checkout

┌─────────────────────────────────────────────────────────────────────┐
│                    API CREATION WORKFLOW                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PHASE 1-2: CLARIFY                                                 │
│  ├── Disambiguate: REST endpoint? SDK wrapper? Webhook handler?     │
│  └── Scope: Which operations? What's excluded?                      │
│                                                                      │
│  PHASE 3-5: RESEARCH                                                │
│  ├── Context7: Search Stripe library docs                          │
│  ├── WebSearch: Official Stripe API docs                            │
│  ├── ToC Scrape: Find ALL Stripe Checkout features                  │
│  ├── Interview: Based on research findings                          │
│  │   • "3 checkout modes found. Which do you need?"                 │
│  │   • "47 webhook events. Which are relevant?"                     │
│  └── Deep Research: Specific patterns for chosen options            │
│                                                                      │
│  PHASE 6-7: PREPARE                                                 │
│  ├── Schema: Zod types from research                                │
│  │   • CheckoutSessionSchema                                        │
│  │   • WebhookEventSchema                                           │
│  └── Environment: Verify STRIPE_SECRET_KEY, stripe package          │
│                                                                      │
│  PHASE 8-9: BUILD (TDD)                                             │
│  ├── Red: Write failing tests                                       │
│  │   • POST creates session → 200 + sessionId                       │
│  │   • Empty cart → 400                                             │
│  │   • Invalid items → 400                                          │
│  └── Green: Minimal implementation to pass                          │
│                                                                      │
│  PHASE 10-12: VERIFY                                                │
│  ├── Verify: Re-check Stripe docs, compare to implementation        │
│  ├── Review: Security scan (API key handling, input validation)     │
│  └── Refactor: Fix issues, improve code quality                     │
│                                                                      │
│  PHASE 13-14: COMPLETE                                              │
│  ├── Documentation: OpenAPI spec, TypeDoc, README                   │
│  ├── Registry: Add to .devkit/registry.json                         │
│  └── Commit: Semantic commit message                                │
│                                                                      │
│  OUTPUT FILES:                                                       │
│  ├── src/app/api/checkout/route.ts                                  │
│  ├── src/app/api/checkout/__tests__/checkout.test.ts                │
│  ├── src/lib/schemas/stripe-checkout.ts                             │
│  └── docs/api/checkout.md                                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Workflow 2: `/create component`

```
/create component DataTable

┌─────────────────────────────────────────────────────────────────────┐
│                  COMPONENT CREATION WORKFLOW                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PHASE 1-2: CLARIFY                                                 │
│  ├── Disambiguate: Basic table? With sorting? Pagination? Filters?  │
│  └── Scope: Features included, excluded                             │
│                                                                      │
│  PHASE 3-5: RESEARCH                                                │
│  ├── Check: Existing components in registry                         │
│  ├── Check: ShadCN table component                                  │
│  ├── Research: TanStack Table patterns                              │
│  ├── Research: Accessibility requirements (ARIA)                    │
│  └── Interview: Props, variants, data source                        │
│                                                                      │
│  PHASE 6-7: PREPARE                                                 │
│  ├── Schema: Props interface                                        │
│  │   interface DataTableProps<T> {                                  │
│  │     data: T[];                                                   │
│  │     columns: ColumnDef<T>[];                                     │
│  │     pagination?: boolean;                                        │
│  │     sorting?: boolean;                                           │
│  │   }                                                              │
│  └── Environment: TanStack Table installed, Storybook configured    │
│                                                                      │
│  PHASE 8-9: BUILD (TDD)                                             │
│  ├── Red: Tests + Storybook stories                                 │
│  │   • Renders with data                                            │
│  │   • Sorts columns                                                │
│  │   • Paginates correctly                                          │
│  │   • Stories: Default, Empty, Loading, Error                      │
│  └── Green: Implement component                                     │
│                                                                      │
│  VISUAL TESTING:                                                    │
│  ├── Storybook: Capture all states                                  │
│  ├── Playwright: Screenshots at 7 viewports                         │
│  │   • 375px (mobile)                                               │
│  │   • 768px (tablet)                                               │
│  │   • 1024px (small desktop)                                       │
│  │   • 1280px (desktop)                                             │
│  │   • 1920px (large desktop)                                       │
│  └── Haiku: Analyze each screenshot for issues                      │
│                                                                      │
│  PHASE 10-12: VERIFY                                                │
│  ├── Verify: Check patterns match research                          │
│  ├── Review: Accessibility audit, performance check                 │
│  └── Refactor: Fix any issues                                       │
│                                                                      │
│  PHASE 13-14: COMPLETE                                              │
│  ├── Documentation: Storybook autodocs, README                      │
│  ├── Registry: Add to components array                              │
│  └── Showcase: Add to UI showcase page                              │
│                                                                      │
│  OUTPUT FILES:                                                       │
│  ├── src/components/DataTable/DataTable.tsx                         │
│  ├── src/components/DataTable/DataTable.test.tsx                    │
│  ├── src/components/DataTable/DataTable.stories.tsx                 │
│  ├── src/components/DataTable/DataTable.types.ts                    │
│  └── src/components/DataTable/index.ts                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Workflow 3: `/create page`

```
/create page dashboard

┌─────────────────────────────────────────────────────────────────────┐
│                    PAGE CREATION WORKFLOW                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PHASE 1-2: CLARIFY                                                 │
│  ├── Page type: Dashboard? Landing? Form? List? Detail?             │
│  └── Route: /dashboard, /dashboard/[id], etc.                       │
│                                                                      │
│  PHASE 3-5: RESEARCH                                                │
│  ├── Check registry: Which APIs available for data?                 │
│  ├── Check registry: Which components can be reused?                │
│  ├── Research: Next.js App Router patterns                          │
│  └── Interview: Data fetching, layout, auth, SEO                    │
│                                                                      │
│  PHASE 6-7: PREPARE                                                 │
│  ├── Schema: Page data types                                        │
│  └── Environment: API routes exist, components available            │
│                                                                      │
│  PHASE 8-9: BUILD (TDD with Playwright E2E)                         │
│  ├── Red: E2E tests                                                 │
│  │   • Page renders                                                 │
│  │   • Data displays correctly                                      │
│  │   • Navigation works                                             │
│  │   • Auth redirects if needed                                     │
│  └── Green: Implement page with registry components                 │
│                                                                      │
│  VISUAL TESTING:                                                    │
│  ├── Playwright: Full page screenshots                              │
│  ├── Responsive: All 7 viewports                                    │
│  └── Haiku: Visual analysis                                         │
│                                                                      │
│  PHASE 10-14: VERIFY & COMPLETE                                     │
│  ├── Lighthouse: Performance, accessibility, SEO                    │
│  ├── Review: Security, patterns                                     │
│  └── Documentation: Route docs, registry                            │
│                                                                      │
│  OUTPUT FILES:                                                       │
│  ├── src/app/dashboard/page.tsx                                     │
│  ├── src/app/dashboard/layout.tsx                                   │
│  ├── src/app/dashboard/loading.tsx                                  │
│  ├── src/app/dashboard/error.tsx                                    │
│  ├── src/app/dashboard/__tests__/dashboard.e2e.test.ts              │
│  └── src/app/dashboard/_components/                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Workflow 4: `/create orchestration`

```
/create orchestration order-fulfillment

┌─────────────────────────────────────────────────────────────────────┐
│                 ORCHESTRATION CREATION WORKFLOW                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PURPOSE: Combine multiple existing APIs into orchestrated flow     │
│                                                                      │
│  PHASE 1: SELECTION                                                 │
│  └── Choose APIs from registry:                                     │
│      ☑ stripe-checkout                                              │
│      ☑ inventory-reserve                                            │
│      ☑ shipping-calculate                                           │
│      ☑ notification-send                                            │
│                                                                      │
│  PHASE 4: INTERVIEW                                                 │
│  ├── Execution order? Sequential / Parallel / Conditional           │
│  ├── Error strategy? Fail-fast / Continue partial / Retry           │
│  └── Caching? None / Per-request / TTL                              │
│                                                                      │
│  PHASE 6: COMBINED SCHEMA                                           │
│  └── Compose from existing schemas:                                 │
│      import { CheckoutSessionSchema } from './stripe-checkout';     │
│      import { ReservationSchema } from './inventory';               │
│      export const OrderSchema = z.object({                          │
│        checkout: CheckoutSessionSchema,                             │
│        reservation: ReservationSchema,                              │
│        shipping: ShippingSchema,                                    │
│      });                                                            │
│                                                                      │
│  PHASE 8-9: BUILD                                                   │
│  └── Integration tests for full flow                                │
│                                                                      │
│  OUTPUT: Single endpoint that orchestrates multiple APIs            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Workflow 5: `/build`

```
/build "User can browse products, add to cart, and checkout"

┌─────────────────────────────────────────────────────────────────────┐
│                    FULL BUILD WORKFLOW                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  STEP 1: DECOMPOSITION                                              │
│  Orchestrator analyzes request and identifies needed artifacts:     │
│                                                                      │
│  APIs needed:                                                        │
│  ├── /api/products (GET)                                            │
│  ├── /api/cart (GET, POST, DELETE)                                  │
│  └── /api/checkout (POST)                                           │
│                                                                      │
│  Components needed:                                                  │
│  ├── ProductCard                                                    │
│  ├── ProductGrid                                                    │
│  ├── CartDrawer                                                     │
│  ├── CartItem                                                       │
│  └── CheckoutButton                                                 │
│                                                                      │
│  Pages needed:                                                       │
│  ├── /products                                                      │
│  ├── /products/[id]                                                 │
│  └── /checkout/success                                              │
│                                                                      │
│  STEP 2: DEPENDENCY GRAPH                                           │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  products API ──┬──► ProductCard ──► ProductGrid            │    │
│  │                 │                          │                 │    │
│  │  cart API ──────┼──► CartItem ──► CartDrawer                │    │
│  │                 │         │                │                 │    │
│  │  checkout API ──┴─────────┴──► CheckoutButton              │    │
│  │                                      │                       │    │
│  │                                      ▼                       │    │
│  │  /products page ◄── /checkout/success page                  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  STEP 3: EXECUTION                                                  │
│  Execute in topological order (dependencies first):                 │
│                                                                      │
│  Round 1 (parallel):                                                │
│  ├── /create api products                                           │
│  ├── /create api cart                                               │
│  └── /create api checkout                                           │
│                                                                      │
│  Round 2 (parallel, after APIs):                                    │
│  ├── /create component ProductCard                                  │
│  ├── /create component CartItem                                     │
│  └── /create component CheckoutButton                               │
│                                                                      │
│  Round 3 (parallel, after base components):                         │
│  ├── /create component ProductGrid                                  │
│  └── /create component CartDrawer                                   │
│                                                                      │
│  Round 4 (parallel, after all components):                          │
│  ├── /create page products                                          │
│  └── /create page checkout/success                                  │
│                                                                      │
│  STEP 4: INTEGRATION                                                │
│  Wire everything together, run full E2E tests                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## MCP Integrations

### Configured MCP Servers

```json
// .mcp.json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"],
      "description": "Library documentation lookup"
    },
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "description": "GitHub PR/issue management"
    },
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"],
      "description": "Visual testing and screenshots"
    }
  }
}
```

### How MCPs Are Used

```
┌─────────────────────────────────────────────────────────────────────┐
│                      MCP USAGE BY PHASE                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  CONTEXT7 MCP (Research Phases 3-5)                                 │
│  ├── resolve-library-id: "stripe" → "ctx7:stripe"                   │
│  └── get-library-docs: Fetch current Stripe docs                    │
│                                                                      │
│  Use: Research subagent queries library documentation               │
│       Results cached in .devkit/research/                           │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                      │
│  PLAYWRIGHT MCP (Visual Testing)                                    │
│  ├── browser_navigate: Go to component in Storybook                 │
│  ├── browser_set_viewport: Resize to each test viewport             │
│  ├── browser_take_screenshot: Capture current state                 │
│  └── browser_snapshot: Get accessibility tree                       │
│                                                                      │
│  Use: visual-analyzer subagent captures and analyzes screenshots    │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                      │
│  GITHUB MCP (Completion Phase 14)                                   │
│  ├── create_pull_request: Create PR with changes                    │
│  ├── get_issue: Fetch linked issue details                          │
│  └── add_comment: Add implementation notes                          │
│                                                                      │
│  Use: Automatic PR creation with linked issues                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## State Management

### Two-File Architecture

```
.devkit/
├── state.json      # Ephemeral - resets per workflow
├── registry.json   # Persistent - survives across workflows
└── research/       # Cached - 7-day TTL
    ├── stripe-checkout/
    │   ├── index.json
    │   ├── endpoints.json
    │   └── examples.json
    └── tanstack-table/
        └── ...
```

### state.json Structure

```json
{
  "version": "1.0.0",
  "workflowId": "wf-550e8400-e29b-41d4-a716-446655440000",
  "workflowType": "create-api",
  "target": "stripe-checkout",
  "createdAt": "2025-01-03T10:00:00Z",
  "updatedAt": "2025-01-03T11:30:00Z",
  "status": "in_progress",
  
  "progress": {
    "currentPhase": 9,
    "currentPhaseName": "tdd-green",
    "completedPhases": [1, 2, 3, 4, 5, 6, 7, 8],
    "totalPhases": 14
  },
  
  "phases": {
    "disambiguation": {
      "complete": true,
      "choice": "Stripe Checkout (hosted)",
      "completedAt": "2025-01-03T10:05:00Z"
    },
    "scope": {
      "complete": true,
      "in": ["Create session", "Handle redirects"],
      "out": ["Subscriptions"],
      "completedAt": "2025-01-03T10:10:00Z"
    },
    "research": {
      "complete": true,
      "sources": ["context7", "stripe.com/docs"],
      "cacheKey": "stripe-checkout",
      "completedAt": "2025-01-03T10:25:00Z"
    },
    "interview": {
      "complete": true,
      "answers": {
        "checkout_mode": "hosted",
        "webhook_events": ["checkout.session.completed"],
        "idempotency": true
      },
      "completedAt": "2025-01-03T10:35:00Z"
    },
    "schema": {
      "complete": true,
      "path": "src/lib/schemas/stripe-checkout.ts",
      "completedAt": "2025-01-03T10:45:00Z"
    },
    "environment": {
      "complete": true,
      "verified": ["STRIPE_SECRET_KEY", "stripe@14.x"],
      "completedAt": "2025-01-03T10:47:00Z"
    },
    "tdd_red": {
      "complete": true,
      "testPath": "src/app/api/checkout/__tests__/checkout.test.ts",
      "testCount": 5,
      "completedAt": "2025-01-03T11:00:00Z"
    },
    "tdd_green": {
      "complete": false,
      "inProgress": true
    }
  },
  
  "checkpoints": [
    {
      "id": "chk-001",
      "phase": 8,
      "timestamp": "2025-01-03T11:00:00Z",
      "resumeInstructions": "Continue with TDD Green phase"
    }
  ],
  
  "metrics": {
    "turnCount": 47,
    "researchQueries": 8,
    "testsWritten": 5,
    "filesCreated": 3
  }
}
```

### registry.json Structure

```json
{
  "version": "1.0.0",
  "updatedAt": "2025-01-03T12:00:00Z",
  
  "artifacts": {
    "apis": [
      {
        "id": "api-001",
        "name": "stripe-checkout",
        "path": "src/app/api/checkout/route.ts",
        "schemaPath": "src/lib/schemas/stripe-checkout.ts",
        "methods": ["POST"],
        "auth": "none",
        "status": "complete",
        "createdAt": "2025-01-03T12:00:00Z",
        "checksum": "sha256-abc123",
        "researchCacheKey": "stripe-checkout"
      },
      {
        "id": "api-002",
        "name": "products",
        "path": "src/app/api/products/route.ts",
        "methods": ["GET", "POST"],
        "status": "complete"
      }
    ],
    
    "components": [
      {
        "id": "cmp-001",
        "name": "DataTable",
        "path": "src/components/DataTable/",
        "hasStories": true,
        "hasTests": true,
        "props": ["data", "columns", "pagination", "sorting"],
        "status": "complete"
      }
    ],
    
    "pages": [
      {
        "id": "page-001",
        "name": "dashboard",
        "route": "/dashboard",
        "path": "src/app/dashboard/",
        "usesApis": ["api-002"],
        "usesComponents": ["cmp-001"],
        "status": "complete"
      }
    ]
  },
  
  "patterns": {
    "stripe-integration": {
      "discoveredAt": "2025-01-03T10:25:00Z",
      "expiresAt": "2025-01-10T10:25:00Z",
      "appliesTo": ["stripe-*"],
      "conventions": {
        "errorHandling": "try-catch with StripeError",
        "authentication": "API key in env",
        "types": "Zod schemas from Stripe types"
      }
    }
  },
  
  "adrs": [
    {
      "id": "adr-001",
      "title": "Stripe Checkout Mode Selection",
      "path": ".devkit/adrs/ADR-001-stripe-checkout.md",
      "status": "decided",
      "decision": "hosted",
      "createdAt": "2025-01-03T10:30:00Z"
    }
  ]
}
```

---

## Registry System

The Registry System provides **full parameter extraction** from Zod schemas, enabling interactive API testing with auto-generated curl commands and examples.

### Enhanced Registry Structure

```json
// .devkit/registry.json (enhanced with Zod parsing)
{
  "apis": {
    "brandfetch": {
      "name": "brandfetch",
      "description": "Fetch brand information from domain",
      "route": "/api/brandfetch",
      "routeFile": "src/app/api/brandfetch/route.ts",
      "schemaFile": "src/lib/schemas/brandfetch.ts",
      "methods": ["POST"],
      "endpoints": {
        "default": {
          "methods": ["POST"],
          "params": [
            {
              "name": "domain",
              "type": "string",
              "required": true,
              "min": 3,
              "max": 255,
              "description": "Domain to fetch brand information for"
            },
            {
              "name": "includeLogos",
              "type": "boolean",
              "required": false,
              "description": "Include logo URLs in response"
            },
            {
              "name": "quality",
              "type": "enum",
              "required": false,
              "enum": ["low", "medium", "high"],
              "description": "Logo quality preference"
            }
          ],
          "examples": {
            "basic_post": {
              "curl": "curl -X POST http://localhost:3000/api/brandfetch -H 'Content-Type: application/json' -d '{\"domain\":\"stripe.com\"}'",
              "body": {
                "domain": "stripe.com"
              }
            },
            "full_post": {
              "curl": "curl -X POST http://localhost:3000/api/brandfetch -H 'Content-Type: application/json' -d '{\"domain\":\"stripe.com\",\"includeLogos\":true,\"quality\":\"high\"}'",
              "body": {
                "domain": "stripe.com",
                "includeLogos": true,
                "quality": "high"
              }
            }
          }
        }
      },
      "registeredAt": "2025-01-03T12:00:00Z",
      "checksum": "sha256-abc123"
    }
  },
  "components": {
    "Button": {
      "name": "Button",
      "description": "Primary button component with variants",
      "path": "src/components/Button/Button.tsx",
      "props": ["variant", "size", "disabled", "onClick"],
      "hasStories": true,
      "hasTests": true,
      "storybookUrl": "http://localhost:6006/?path=/story/button--default",
      "registeredAt": "2025-01-03T12:00:00Z"
    }
  },
  "pages": {
    "dashboard": {
      "name": "Dashboard",
      "route": "/dashboard",
      "path": "src/app/dashboard/page.tsx",
      "usesApis": ["brandfetch"],
      "usesComponents": ["Button", "DataTable"],
      "registeredAt": "2025-01-03T12:00:00Z"
    }
  }
}
```

### Zod Schema Parsing

The `registry-update.py` hook automatically parses Zod schemas to extract full parameter information:

```python
# .claude/hooks/registry-update.py

def parse_zod_schema(schema_file: str) -> list:
    """Extract parameters from Zod schema file."""
    content = Path(schema_file).read_text()
    params = []

    # Parse z.string().min(3).max(255)
    # Parse z.boolean().optional()
    # Parse z.enum(["a", "b", "c"])
    # Parse z.number().positive().max(100)
    # Extract .describe("...") for descriptions

    for field_match in ZOD_FIELD_REGEX.finditer(content):
        param = {
            "name": field_match.group("name"),
            "type": extract_zod_type(field_match.group("type")),
            "required": ".optional()" not in field_match.group("modifiers"),
        }

        # Extract constraints
        if min_match := MIN_REGEX.search(field_match.group("modifiers")):
            param["min"] = int(min_match.group(1))
        if max_match := MAX_REGEX.search(field_match.group("modifiers")):
            param["max"] = int(max_match.group(1))
        if enum_match := ENUM_REGEX.search(field_match.group("type")):
            param["enum"] = parse_enum_values(enum_match.group(1))
        if desc_match := DESCRIBE_REGEX.search(field_match.group("modifiers")):
            param["description"] = desc_match.group(1)

        params.append(param)

    return params
```

### Curl Generation

Auto-generated curl commands for every API endpoint:

```python
def generate_curl_example(route: str, method: str, params: list, base_url: str) -> dict:
    """Generate curl command and body from params."""
    body = {}
    for param in params:
        if param.get("required"):
            body[param["name"]] = get_example_value(param)

    curl = f"curl -X {method} {base_url}{route}"
    if method in ["POST", "PUT", "PATCH"]:
        curl += f" -H 'Content-Type: application/json'"
        curl += f" -d '{json.dumps(body)}'"

    return {"curl": curl, "body": body}
```

### Registry Hook Chain

```
┌─────────────────────────────────────────────────────────────────────┐
│                    REGISTRY UPDATE FLOW                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. File Written (route.ts or component.tsx)                        │
│     └── PostToolUse triggers registry-update.py                     │
│                                                                      │
│  2. Detect Artifact Type                                            │
│     ├── /api/* route → API artifact                                 │
│     ├── /components/* → Component artifact                          │
│     └── page.tsx → Page artifact                                    │
│                                                                      │
│  3. Extract Information                                             │
│     ├── API: Find schema file, parse Zod, extract params            │
│     ├── Component: Find props, stories, tests                       │
│     └── Page: Find route, used APIs/components                      │
│                                                                      │
│  4. Generate Examples                                               │
│     └── Create curl commands with example values                    │
│                                                                      │
│  5. Update Registry                                                 │
│     ├── Add/update entry in .devkit/registry.json                   │
│     └── Calculate checksum for change detection                     │
│                                                                      │
│  6. Trigger Showcase Generation                                     │
│     └── showcase-gen.py copies updated templates                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Practical Examples

### Example 1: Creating a Complete API

```bash
# Start Claude Code
claude

# Run the create api workflow
> /create api stripe-checkout

# Claude begins 14-phase workflow...
```

**Phase 1-2: Clarification**
```
Claude: "I found 3 Stripe checkout approaches in their docs:
  A) Stripe Checkout (hosted page) ← Recommended for simplicity
  B) Stripe Elements (embedded form)
  C) Custom integration

Which approach do you need?"

You: "A"

Claude: "Great. Let me confirm scope:

IN SCOPE:
- Create checkout session endpoint
- Handle success/cancel redirects
- Basic error handling

OUT OF SCOPE:
- Subscription management
- Saved payment methods
- Custom styling

Correct?"

You: "Yes"
```

**Phase 3-5: Research**
```
Claude: "Researching Stripe Checkout...

[Context7] Searching stripe library docs...
[WebSearch] Fetching stripe.com/docs/checkout...
[ToC Scrape] Found 47 checkout-related endpoints...

Research complete. Key findings:
- 3 checkout modes: payment, subscription, setup
- 47 webhook events available
- Idempotency keys supported for retries
- Rate limit: 100 requests/second

Based on this research, I have some questions:

1. Which checkout mode? (payment/subscription/setup)
2. Which webhook events do you need?
   - checkout.session.completed (recommended)
   - payment_intent.succeeded
   - charge.refunded
3. Enable idempotency for retry safety? (recommended: yes)

You: "Payment mode, just checkout.session.completed, yes to idempotency"
```

**Phase 6-7: Preparation**
```
Claude: "Creating schema from research findings..."

// src/lib/schemas/stripe-checkout.ts
export const CreateCheckoutSchema = z.object({
  lineItems: z.array(z.object({
    priceId: z.string(),
    quantity: z.number().positive(),
  })).min(1),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  customerEmail: z.string().email().optional(),
  metadata: z.record(z.string()).optional(),
});

"Verifying environment..."
✓ STRIPE_SECRET_KEY found in .env
✓ stripe@14.21.0 installed
✓ API route structure ready
```

**Phase 8-9: TDD**
```
Claude: "Writing failing tests first..."

// checkout.test.ts
describe('POST /api/checkout', () => {
  it('creates session with valid items', async () => {
    const response = await POST(validRequest);
    expect(response.status).toBe(200);
    expect(await response.json()).toHaveProperty('sessionId');
  });

  it('returns 400 for empty cart', async () => {
    const response = await POST(emptyRequest);
    expect(response.status).toBe(400);
  });
  
  // ... 3 more tests
});

"Running tests... 5 failing as expected."

"Implementing minimal code to pass..."

// route.ts
export async function POST(request: Request) {
  const body = await request.json();
  const validated = CreateCheckoutSchema.parse(body);
  
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: validated.lineItems.map(item => ({
      price: item.priceId,
      quantity: item.quantity,
    })),
    success_url: validated.successUrl,
    cancel_url: validated.cancelUrl,
  });
  
  return NextResponse.json({ sessionId: session.id });
}

"Running tests... 5 passing!"
```

**Phase 10-12: Verification**
```
Claude: "Re-researching Stripe docs to verify implementation..."

Verification results:
✓ Using correct endpoint (checkout.sessions.create)
✓ All required parameters included
✓ Error handling matches Stripe patterns
⚠ Missing: customer_email parameter (optional but recommended)

"Running code review..."

Code Review Results:
✓ No security issues
✓ Proper input validation
✓ TypeScript strict mode
⚠ Suggestion: Add rate limiting middleware

"Applying suggestions..."
```

**Phase 13-14: Completion**
```
Claude: "Updating documentation..."

- Generated OpenAPI spec
- Updated registry.json
- Created showcase entry

"Final verification..."
✓ All tests passing
✓ No TypeScript errors
✓ Registry updated

"Ready to commit?"

You: "Yes"

Claude: "Created commit: feat(api): add stripe-checkout endpoint 🤖

API_COMPLETE"
```

---

### Example 2: Creating a Component with Visual Testing

```bash
> /create component DataTable
```

**After research and schema phases...**

```
Claude: "Writing tests and Storybook stories..."

// DataTable.stories.tsx
export default {
  title: 'Components/DataTable',
  component: DataTable,
} as Meta;

export const Default: Story = {
  args: {
    data: mockUsers,
    columns: columns,
  },
};

export const Empty: Story = {
  args: {
    data: [],
    columns: columns,
  },
};

export const Loading: Story = {
  args: {
    data: [],
    columns: columns,
    isLoading: true,
  },
};

"Implementing component..."

"Running visual tests..."

[Playwright] Navigating to Storybook...
[Playwright] Capturing Default at 375px...
[Playwright] Capturing Default at 768px...
[Playwright] Capturing Default at 1920px...
... (7 viewports × 4 stories = 28 screenshots)

[Haiku] Analyzing screenshots...

Visual Analysis Results:
✓ Desktop (1920px): Layout correct
✓ Tablet (768px): Responsive working
⚠ Mobile (375px): Table overflow detected
  - Horizontal scroll needed
  - Consider mobile-specific view

"Fixing mobile overflow..."

[Code change: Added overflow-x-auto wrapper]

"Re-running visual tests..."
✓ All viewports passing

COMPONENT_COMPLETE
```

---

### Example 3: Building a Full Feature

```bash
> /build "User authentication with magic links"
```

```
Claude: "Decomposing feature request...

Required artifacts:

APIs:
├── /api/auth/request-link (POST) - Send magic link
├── /api/auth/verify (GET) - Verify token
└── /api/auth/session (GET/DELETE) - Session management

Components:
├── LoginForm - Email input + submit
├── MagicLinkSent - Confirmation message
└── AuthProvider - Session context

Pages:
├── /login - Login page
├── /auth/verify - Token verification
└── /dashboard - Protected page (uses auth)

Dependency order:
1. APIs first (no dependencies)
2. Components (depend on API types)
3. Pages (depend on components + APIs)

Executing in parallel where possible...

[Tab 1] /create api auth/request-link
[Tab 2] /create api auth/verify
[Tab 3] /create api auth/session

... (all 3 complete)

[Tab 1] /create component LoginForm
[Tab 2] /create component MagicLinkSent
[Tab 3] /create component AuthProvider

... (all 3 complete)

[Tab 1] /create page login
[Tab 2] /create page auth/verify
[Tab 3] /create page dashboard

... (all 3 complete)

Running integration tests...

E2E Test: Full magic link flow
1. Navigate to /login
2. Enter email, submit
3. Check email sent (mocked)
4. Navigate to verify link
5. Confirm session created
6. Navigate to dashboard
7. Confirm authenticated

✓ All integration tests passing

BUILD_COMPLETE"
```

---

## Installation & Setup

### Option A: Clone from GitHub

```bash
git clone -b devkit-v4 https://github.com/hustle-together/api-dev-tools.git
cd api-dev-tools
claude
```

### Option B: Copy to existing project

```bash
cd your-project
git clone https://github.com/hustle-together/api-dev-tools.git .devkit-temp
cp -r .devkit-temp/{.claude,.devkit,templates,docs,CLAUDE.md,DOCUMENTATION.md} .
rm -rf .devkit-temp
claude
```

### What Gets Installed

```
your-project/
├── .claude/
│   ├── settings.json      # Hook configuration
│   ├── REFERENCE.md       # Quick reference (all commands/hooks/agents)
│   ├── commands/          # 37 slash commands
│   ├── agents/            # 12 specialized agents
│   └── hooks/             # 22 Python enforcement hooks
│       ├── tests/         # Hook test suite
│       └── lib/           # Shared utilities (ntfy, greptile)
├── .devkit/
│   ├── state.json         # Workflow state
│   ├── registry.json      # Artifact registry
│   └── research/          # Research cache (7-day freshness)
├── templates/
│   ├── hustle-dev-dashboard/  # Main dashboard
│   ├── api-showcase/          # API testing UI
│   ├── ui-showcase/           # Component gallery
│   ├── test-results/          # Test results page
│   ├── playwright-report/     # E2E reports
│   ├── docs/                  # TypeDoc output
│   ├── component/             # Component scaffold
│   ├── page/                  # Page scaffold
│   ├── api-test/              # API test scaffold
│   ├── dev-tools/             # Dev tools landing
│   └── shared/                # Shared utilities
├── docs/                  # Reference documentation
├── CLAUDE.md              # Project instructions
├── README.md              # Quick start guide
└── DOCUMENTATION.md       # Full documentation (this file)
```

---

## Configuration Reference

### settings.json

```json
{
  "model": "claude-sonnet-4-20250514",
  "permissions": {
    "allow": [
      "Bash(npm *)",
      "Bash(npx *)",
      "Bash(git *)",
      "Read",
      "Task"
    ],
    "deny": [
      "Read(.env*)",
      "Bash(rm -rf:*)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {"type": "command", "command": ".claude/hooks/research-gate.py"},
          {"type": "command", "command": ".claude/hooks/tdd-gate.py"}
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {"type": "command", "command": ".claude/hooks/format.py"},
          {"type": "command", "command": ".claude/hooks/registry-manager.py"}
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {"type": "command", "command": ".claude/hooks/verify-gate.py"},
          {"type": "command", "command": ".claude/hooks/ralph-loop.py"}
        ]
      }
    ],
    "SessionStart": [
      {
        "hooks": [
          {"type": "command", "command": ".claude/hooks/session-manager.py"}
        ]
      }
    ]
  }
}
```

### Environment Variables

```bash
# .env.local (not committed)
STRIPE_SECRET_KEY=sk_test_...
NTFY_TOPIC=devkit-notifications

# Optional
GREPTILE_API_KEY=...      # For code review
CONTEXT7_API_KEY=...      # If using paid tier
```

---

## Testing Hooks

Run the hook test suite to verify all enforcement hooks work correctly.

### Running Tests

```bash
# Using the slash command
/test-hooks

# Or directly with pytest
cd .claude/hooks && python3 -m pytest tests/ -v
```

### Test Coverage

The test suite includes:

| Test File | Coverage |
|-----------|----------|
| `test_registry_hooks.py` | Registry update and Zod schema parsing |
| `test_showcase_hooks.py` | Showcase template generation |
| `test_visual_qa_hooks.py` | Visual QA task creation and Haiku analysis |

### Writing New Hook Tests

```python
# tests/test_my_hook.py
import pytest
import json
import subprocess

def test_hook_blocks_when_research_incomplete(tmp_path):
    """Gate hook should block with exit code 2."""
    # Set up incomplete state
    state = {"phases": {"research": {"complete": False}}}
    state_file = tmp_path / ".devkit" / "state.json"
    state_file.parent.mkdir(parents=True)
    state_file.write_text(json.dumps(state))

    # Prepare hook input
    input_data = json.dumps({
        "tool_name": "Write",
        "tool_input": {"file_path": "/app/api/test/route.ts"}
    })

    # Run hook
    result = subprocess.run(
        ["python3", ".claude/hooks/research-gate.py"],
        input=input_data,
        capture_output=True,
        text=True,
        cwd=tmp_path
    )

    # Should block (exit 2)
    assert result.returncode == 2

def test_hook_allows_when_research_complete(tmp_path):
    """Gate hook should allow with exit code 0."""
    state = {"phases": {"research": {"complete": True}}}
    # ... similar setup with complete state
    assert result.returncode == 0
```

### Test Fixtures

Common fixtures are available in `conftest.py`:

```python
@pytest.fixture
def devkit_state(tmp_path):
    """Create a .devkit directory with state files."""
    devkit = tmp_path / ".devkit"
    devkit.mkdir()
    return devkit

@pytest.fixture
def mock_registry(devkit_state):
    """Create a mock registry.json."""
    registry = {"apis": {}, "components": {}, "pages": {}}
    (devkit_state / "registry.json").write_text(json.dumps(registry))
    return registry
```

---

## Summary

Devkit transforms Claude Code from a general-purpose assistant into a **rigorous development workflow system** that:

1. **Enforces research before coding** via gate hooks
2. **Ensures true TDD** with isolated subagent contexts
3. **Catches implementation drift** through verification phases
4. **Tracks all artifacts** in a searchable registry
5. **Enables autonomous operation** with Ralph Wiggum loops
6. **Maintains quality** through visual testing and code review

The 14-phase workflow applies the scientific method to software development:
- Form hypotheses (clarify, research)
- Design experiments (schema, TDD)
- Run experiments (implementation)
- Analyze results (verify, review)
- Publish findings (document, register)

This creates **consistent, high-quality output** regardless of task complexity.

---

## Quick Reference

```bash
# Workflows
/create api <name>           # Create API endpoint
/create component <Name>     # Create React component
/create page <path>          # Create Next.js page
/create orchestration <name> # Combine existing APIs
/build <description>         # Full feature build

# Modes
Shift+Tab                    # Cycle modes (normal → auto-accept → plan)
--permission-mode=plan       # Start in plan mode
--dangerously-skip-permissions  # YOLO mode (sandboxed only)

# State
cat .devkit/state.json       # Current workflow progress
cat .devkit/registry.json    # All created artifacts

# Resume
claude --continue            # Resume last session
claude --resume              # Pick session to resume
```

---

**Built with ❤️ for developers who believe in rigorous, reproducible software development.**
