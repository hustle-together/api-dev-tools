# Re-Grounding System Reference

**Version:** 4.0.0
**Last Updated:** 2025-12-29

> **The Problem**
>
> LLMs suffer from "context dilution" - as conversations grow longer, the original instructions (CLAUDE.md, system prompts) get pushed to the "middle" of the context where attention is weakest. Claude starts forgetting the endpoint name, re-asking answered questions, and recreating existing components.

> **The Solution**
>
> The Re-Grounding System injects a comprehensive state reminder every 7 turns, pushing critical context to the END where attention is strongest. This includes current phase, key decisions, existing registry elements, and deferred features - preventing the "lost in the middle" problem.

---

## Table of Contents

- [The Problem: Context Dilution](#the-problem-context-dilution)
- [The Solution: Periodic Re-Grounding](#the-solution-periodic-re-grounding)
- [How It Works](#how-it-works)
- [What Gets Injected](#what-gets-injected)
- [Configuration](#configuration)
- [Best Practices Research](#best-practices-research)
- [Example Output](#example-output)

---

## The Problem: Context Dilution

### Why LLMs "Forget"

LLMs are stateless - they don't have persistent memory. Everything must fit in the context window. As conversations grow:

```
┌─────────────────────────────────────────────────────────────┐
│                     Context Window                          │
├─────────────────────────────────────────────────────────────┤
│ Turn 1:  [System prompt + CLAUDE.md]  ████████░░░░░░░░░░░░  │
│ Turn 5:  [+ tool calls + results]     ██████████████░░░░░░  │
│ Turn 10: [+ more conversation]        ████████████████████  │
│ Turn 15: [CLAUDE.md pushed out]       ░░░░████████████████  │
│                                       ↑                     │
│                              Original instructions          │
│                              now in "lost middle"           │
└─────────────────────────────────────────────────────────────┘
```

### The "Lost in the Middle" Problem

Research shows LLMs perform worse on information in the middle of long contexts:

> "Performance degrades as every new token is introduced. Think of context as a limited 'attention budget'."
> — Sankalp, Claude Code Deep Dive

The initial instructions (CLAUDE.md, system prompts) get pushed to the "middle" where attention is weakest.

### Real-World Symptoms

| Symptom | Cause |
|---------|-------|
| Claude forgets the endpoint name | Original scope diluted |
| Re-asks questions already answered | Interview decisions lost |
| Recreates existing components | Registry not in attention |
| Suggests deferred features again | Deferred list forgotten |
| Ignores brand guide | Style instructions diluted |

---

## The Solution: Periodic Re-Grounding

### The Insight

From Manus AI's context engineering lessons:

> "By constantly rewriting the todo list, Manus is reciting its objectives into the end of the context. This pushes the global plan into the model's recent attention span."

We apply the same principle: **periodically inject critical state at the END of context** where attention is strongest.

### How api-dev-tools Implements This

```
┌─────────────────────────────────────────────────────────────┐
│                     Context Window                          │
├─────────────────────────────────────────────────────────────┤
│ [Old content...]                      ░░░░░░░░░░░░░░░░░░░░  │
│                                                             │
│ Turn 14 (re-ground):                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ## Re-Grounding Reminder (Turn 14)                      │ │
│ │ **Active Endpoint:** stripe-checkout                    │ │
│ │ **Current Phase:** tdd_green                            │ │
│ │ **Key Decisions:** auth=Bearer, caching=5min            │ │
│ │ **Existing APIs:** user-auth, unsplash-search           │ │
│ │ **Deferred:** webhooks, batch processing                │ │
│ │ **Last Tests:** GREEN (12 passed)                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                       ████████████████████  │
│                                       ↑                     │
│                              Fresh reminder at END          │
│                              = strongest attention          │
└─────────────────────────────────────────────────────────────┘
```

---

## How It Works

### Hook Details

| Property | Value |
|----------|-------|
| Hook File | `hooks/periodic-reground.py` |
| Event Type | `PostToolUse` |
| Trigger | Every 7th turn (configurable) |
| Condition | Only if `endpoint` is set in state |

### Execution Flow

```
┌──────────────────┐
│ Tool completes   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Increment turn   │
│ count in state   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     No
│ turn % 7 == 0?   │────────────► Continue normally
└────────┬─────────┘
         │ Yes
         ▼
┌──────────────────┐
│ Load all state:  │
│ - api-dev-state  │
│ - registry.json  │
│ - build-state    │
│ - BRAND_GUIDE    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Build context    │
│ reminder string  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Inject via       │
│ additionalContext│
└──────────────────┘
```

### State Files Read

| File | Purpose |
|------|---------|
| `.claude/api-dev-state.json` | Workflow state, phases, decisions |
| `.claude/registry.json` | Existing APIs, components, pages |
| `.claude/hustle-build-state.json` | Orchestrator progress |
| `.claude/BRAND_GUIDE.md` | Brand guide existence check |

---

## What Gets Injected

### Complete Context Reminder

Every 7 turns, the following is injected:

```markdown
## Re-Grounding Reminder (Turn 14)

**Active Endpoint:** `stripe-checkout`
**Current Phase:** tdd_green
**Completed:** 9/14 phases

**Key Decisions:**
  - authentication: Bearer token
  - error_handling: Partial success
  - pagination: Enabled
  - caching: 5 minutes
  - rate_limiting: 100 req/min

**Existing Elements (don't recreate):**
  - APIs: user-auth, unsplash-search, geocoding
  - Components: Hero, StatCard, ChartWidget
  - Pages: Dashboard, Settings

**Deferred (don't re-suggest):** webhooks, batch-processing, admin-panel

**Last Tests:** GREEN (12 passed, 0 failed)

**Brand Guide:** Active - use `.claude/BRAND_GUIDE.md` for styling

**Orchestrated Build:** build-2025-12-29-dashboard
  - Progress: 3/7 workflows
  - Active: [component] ChartWidget

**Remember:** Research-first | Questions FROM findings | Verify after green
```

### Field Explanations

| Field | Purpose | Why It Matters |
|-------|---------|----------------|
| **Active Endpoint** | Current work target | Prevents confusion about what we're building |
| **Current Phase** | Progress indicator | Ensures we don't skip phases |
| **Key Decisions** | Top 5 interview answers | Prevents re-asking same questions |
| **Existing Elements** | Registry summary | Prevents recreating existing work |
| **Deferred** | Explicitly postponed features | Prevents re-suggesting declined features |
| **Last Tests** | Test suite status | Shows if we're GREEN or RED |
| **Brand Guide** | Styling reminder | Ensures consistent UI |
| **Orchestrated Build** | Multi-workflow progress | Context for sub-workflows |
| **Remember** | Core principles | Quick principle refresh |

---

## Configuration

### Changing the Interval

Edit `hooks/periodic-reground.py`:

```python
# Configuration
REGROUND_INTERVAL = 7  # Re-ground every N turns
```

**Recommendations:**

| Context Size | Recommended Interval |
|--------------|---------------------|
| Short tasks (<20 turns) | 10 turns |
| Medium tasks (20-50 turns) | 7 turns (default) |
| Long tasks (50+ turns) | 5 turns |
| Complex orchestrated builds | 5 turns |

### Disabling Re-Grounding

Remove from `settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "WebSearch|WebFetch|mcp__context7.*|AskUserQuestion",
        "hooks": [
          // Remove this line to disable:
          // {"type": "command", "command": "...periodic-reground.py"}
        ]
      }
    ]
  }
}
```

---

## Best Practices Research

### Sources

This implementation is based on research from industry leaders:

#### Manus AI - Context Engineering

> "Manipulate Attention Through Recitation: By constantly rewriting the todo list, Manus is reciting its objectives into the end of the context."

Source: [Manus Context Engineering Blog](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)

#### Sankalp - Claude Code Deep Dive

> "Think of context as a limited 'attention budget'. Performance degrades as every new token is introduced."

Source: [Claude Code 2.0 Guide](https://sankalp.bearblog.dev/my-experience-with-claude-code-20-and-how-to-get-better-at-using-coding-agents/)

#### Chroma Research - Context Rot

Research showing performance degradation as context grows:

> "Effective context windows are 50-60% of stated capacity."

Source: [Chroma Context Rot Research](https://research.trychroma.com/context-rot)

#### Boris Cherny - Claude Code Creator

On the importance of maintaining context:

> "Better judgement helps find shorter paths, acting as a multiplier."

Source: [Boris Cherny Interview](https://www.developing.dev/p/boris-cherny-creator-of-claude-code)

---

## Example Output

### Turn 7 - First Re-Ground

```markdown
## Re-Grounding Reminder (Turn 7)

**Active Endpoint:** `stripe-checkout`
**Current Phase:** interview
**Completed:** 3/14 phases

**Key Decisions:**
  - (gathering in progress)

**Remember:** Research-first | Questions FROM findings | Verify after green
```

### Turn 14 - Mid-Development

```markdown
## Re-Grounding Reminder (Turn 14)

**Active Endpoint:** `stripe-checkout`
**Current Phase:** tdd_green
**Completed:** 9/14 phases

**Key Decisions:**
  - authentication: Bearer token
  - error_handling: Partial success
  - supported_currencies: USD, EUR, GBP

**Existing Elements (don't recreate):**
  - APIs: user-auth

**Deferred (don't re-suggest):** subscription-billing

**Last Tests:** RED (8 passed, 2 failed)

**Remember:** Research-first | Questions FROM findings | Verify after green
```

### Turn 21 - Near Completion

```markdown
## Re-Grounding Reminder (Turn 21)

**Active Endpoint:** `stripe-checkout`
**Current Phase:** documentation
**Completed:** 12/14 phases

**Key Decisions:**
  - authentication: Bearer token
  - error_handling: Partial success
  - supported_currencies: USD, EUR, GBP
  - webhook_events: checkout.session.completed

**Existing Elements (don't recreate):**
  - APIs: user-auth, stripe-checkout

**Last Tests:** GREEN (15 passed, 0 failed)

**Remember:** Research-first | Questions FROM findings | Verify after green
```

---

## Comparison: With vs Without Re-Grounding

### Without Re-Grounding

| Turn | Issue |
|------|-------|
| 15 | Claude asks "what authentication method should we use?" (already answered) |
| 22 | Claude creates a new `UserCard` component (one already exists) |
| 28 | Claude suggests adding webhooks (explicitly deferred) |
| 35 | Claude forgets we're building `stripe-checkout`, references wrong endpoint |

### With Re-Grounding

| Turn | Behavior |
|------|----------|
| 7 | Reminder injected - phase and scope refreshed |
| 14 | Reminder injected - decisions and registry visible |
| 21 | Reminder injected - deferred features explicit |
| 28 | Reminder injected - all context maintained |

---

## Troubleshooting

### Re-Grounding Not Firing

1. Check if `endpoint` is set in `api-dev-state.json`
2. Verify hook is registered in `settings.json`
3. Check hook has execute permission: `chmod +x hooks/periodic-reground.py`

### Too Frequent / Infrequent

Adjust `REGROUND_INTERVAL` in the hook file.

### Missing Information

The hook reads from multiple state files. Ensure they exist:
- `.claude/api-dev-state.json`
- `.claude/registry.json`

---

## See Also

- [HOOKS.md](./HOOKS.md) - All enforcement hooks reference
- [GAP_ANALYSIS.md](./GAP_ANALYSIS.md) - Best practices coverage
- [CLAUDE_CODE_BEST_PRACTICES.md](./CLAUDE_CODE_BEST_PRACTICES.md) - Industry best practices
- [ORCHESTRATOR.md](./ORCHESTRATOR.md) - Multi-workflow orchestration
