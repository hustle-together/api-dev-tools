# Architecture Decision Records (ADRs)

Point-in-time documents capturing significant design decisions with context and reasoning.

## Key Concept: Research → ADR → Interview

ADRs are created **BEFORE** the interview to give users informed options:

```
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 3: INITIAL RESEARCH                                          │
│  ├─ Discover options (Supabase vs Firebase vs Postgres)             │
│  ├─ Hook: generate-adr-options.py detects multiple options          │
│  └─ Creates ADR with status: PROPOSED                               │
├─────────────────────────────────────────────────────────────────────┤
│  PHASE 4: INTERVIEW                                                  │
│  ├─ Present options WITH context from ADR                           │
│  ├─ User makes informed decision                                     │
│  ├─ Hook: update-adr-decision.py updates ADR                        │
│  └─ ADR status: PROPOSED → ACCEPTED                                 │
├─────────────────────────────────────────────────────────────────────┤
│  REGISTRY                                                            │
│  └─ ADR tracked in .claude/registry.json → adrs section             │
└─────────────────────────────────────────────────────────────────────┘
```

## Automatic ADR Generation

ADRs are created automatically when research discovers multiple options for significant decisions.

### Configurable Decision Categories

In `hustle-build-defaults.json`:

```json
{
  "adr": {
    "enabled": true,
    "significant_decisions": {
      "database": ["supabase", "firebase", "postgres", "mysql", "mongodb"],
      "auth": ["api key", "oauth", "jwt", "session", "cookie"],
      "cache": ["redis", "memcached", "in-memory", "cdn"],
      "hosting": ["vercel", "netlify", "aws", "cloudflare"],
      "state": ["redux", "zustand", "jotai", "context", "mobx"],
      "styling": ["tailwind", "css modules", "styled-components", "emotion"]
    },
    "min_options_for_adr": 2
  }
}
```

### How Detection Works

```python
# hooks/generate-adr-options.py

# When research content contains 2+ options from a category:
"For your todo app, you could use Supabase, Firebase, or Postgres..."

# Hook detects: database category, options: [supabase, firebase, postgres]
# Creates: .claude/adrs/0001-database-choice.md
```

## ADR Lifecycle

| Phase | Status | What Happens |
|-------|--------|--------------|
| Research (Phase 3) | **PROPOSED** | ADR created with options and trade-offs |
| Interview (Phase 4) | **ACCEPTED** | User selects option, ADR updated with decision |
| Later | **DEPRECATED** | If decision is revisited |
| Later | **SUPERSEDED** | If replaced by new ADR |

## Storage

```
.claude/
├── adrs/
│   ├── 0001-database-choice.md
│   ├── 0002-auth-method.md
│   └── 0003-caching-strategy.md
└── registry.json  ← ADRs tracked here
```

### Registry Entry

```json
{
  "adrs": {
    "0001-database-choice": {
      "number": 1,
      "title": "Database Choice",
      "status": "accepted",
      "date": "2025-12-30",
      "phase": "interview",
      "endpoint": "todo-app",
      "category": "database",
      "decision": "supabase",
      "options_considered": ["supabase", "firebase", "postgres"],
      "file": ".claude/adrs/0001-database-choice.md"
    }
  }
}
```

## ADR Template

```markdown
# ADR-{number}: {title}

**Date:** {YYYY-MM-DD}
**Status:** PROPOSED | ACCEPTED | DEPRECATED | SUPERSEDED
**Context Phase:** Initial Research | Interview | Deep Research
**Endpoint:** {endpoint name}
**Category:** {database | auth | cache | hosting | state | styling}

## Context

Research discovered multiple options for {category}. This ADR documents
the options and their trade-offs to inform the interview decision.

{Research context excerpt}

## Options Discovered

### Option 1: {Name}

**Pros:**
- {Pro 1}
- {Pro 2}

**Cons:**
- {Con 1}
- {Con 2}

**Best for:**
- {Use case}

### Option 2: {Name}
...

## Decision

We will use **{chosen option}** based on user selection during interview.

**Reasoning:** {User's stated rationale}

## Consequences

### Positive
- Decision enables implementation to proceed
- Choice aligns with user's requirements

### Negative
- Alternative options not selected (may revisit if requirements change)

### Implementation Notes
- Proceed with {option} integration
- Update environment variables as needed
```

## Hooks

| Hook | Type | Trigger | Action |
|------|------|---------|--------|
| `generate-adr-options.py` | PostToolUse | WebSearch, WebFetch, Context7 | Create ADR when options detected |
| `update-adr-decision.py` | PostToolUse | AskUserQuestion | Update ADR with user's decision |

## Dashboard Integration

The ADRViewer component (`templates/adr-viewer/_components/ADRViewer.tsx`) displays:

- All ADRs with status badges
- Filter by status (proposed, accepted, deprecated)
- Filter by category (database, auth, cache, etc.)
- Link to full ADR markdown file
- Link to related endpoint

## Benefits

| Benefit | Description |
|---------|-------------|
| **Informed Decisions** | Users see trade-offs BEFORE choosing |
| **Audit Trail** | Know WHY decisions were made |
| **Onboarding** | New team members understand context |
| **Evolution** | Track how decisions change over time |

## Disabling ADRs

Set in `.claude/hustle-build-defaults.json`:

```json
{
  "adr": {
    "enabled": false
  }
}
```

## See Also

- [CONFIGURATION.md](./CONFIGURATION.md) - Full configuration options
- [AUTONOMOUS_LOOPS.md](./AUTONOMOUS_LOOPS.md) - How autonomous mode works
- [HOOKS.md](./HOOKS.md) - All hook documentation
