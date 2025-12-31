---
name: adr-deep-research
description: Research technology options for Architecture Decision Records. Spawns parallel agents to fetch official docs, extract pros/cons, pricing, and best-use cases. Creates substantive ADRs before interview phase.
license: MIT
compatibility: Requires Claude Code with MCP servers (Context7, GitHub), Python 3.9+ for hooks
metadata:
  version: "1.0.0"
  category: "research"
  tags: ['adr', 'research', 'architecture', 'decisions']
  author: "Hustle Together"
allowed-tools: WebSearch WebFetch mcp__context7 Task Read Write Edit TodoWrite
---

# ADR Deep Research - Technology Option Investigation

**Usage:** `/adr-deep-research [category]`

**Purpose:** Research each option for an Architecture Decision Record with real documentation, creating substantive pros/cons before the interview phase.

## When This Skill Runs

This skill is triggered when:

1. `generate-adr-options.py` hook detects a significant decision during research
2. A pending request exists in `.claude/adr-requests/pending-{category}.json`
3. User needs informed choices before the interview phase

## What It Does

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADR DEEP RESEARCH FLOW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Read pending request:                                       │
│     .claude/adr-requests/pending-database.json                  │
│     {                                                           │
│       "category": "database",                                   │
│       "options": ["supabase", "firebase", "postgres"],          │
│       "context": "User building todo app with React"            │
│     }                                                           │
│                                                                 │
│  2. Spawn parallel adr-researcher agents (one per option):      │
│     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│     │ Agent #1     │ │ Agent #2     │ │ Agent #3     │         │
│     │ supabase     │ │ firebase     │ │ postgres     │         │
│     │ → docs       │ │ → docs       │ │ → docs       │         │
│     │ → pros/cons  │ │ → pros/cons  │ │ → pros/cons  │         │
│     └──────────────┘ └──────────────┘ └──────────────┘         │
│                                                                 │
│  3. Merge results into ADR document:                            │
│     .claude/adrs/ADR-NNNN-database-choice.md                    │
│     - Real pros/cons from official docs                         │
│     - Pricing information                                       │
│     - Best-for recommendations                                  │
│     - Source URLs for verification                              │
│                                                                 │
│  4. Update state and registry:                                  │
│     - Mark request as processed                                 │
│     - Add ADR to registry                                       │
│     - Inject context for interview                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Process Steps

### Step 1: Read Pending Request

```bash
# Check for pending request
cat .claude/adr-requests/pending-{category}.json
```

Expected format:

```json
{
  "category": "database",
  "options": ["supabase", "firebase", "postgres"],
  "context": "User building todo app with React frontend",
  "endpoint": "todo-api",
  "status": "pending",
  "created_at": "2025-12-30T10:00:00Z"
}
```

### Step 2: Spawn Parallel Research Agents

For each option in the request, spawn an `adr-researcher` agent in parallel:

```
Use Task tool with subagent_type="adr-researcher" for each option.

Spawn ALL agents in a SINGLE message (parallel execution).
```

**Agent prompt template:**

```
Research the following technology option for an ADR decision:

Option: {option}
Category: {category}
Context: {context}
Comparison Options: {other_options}

Return structured JSON with:
- pros (3-5 specific, factual)
- cons (3-5 specific, factual)
- best_for (1-2 ideal use cases)
- pricing (free tier, paid tiers)
- limitations (technical constraints)
- sources (documentation URLs)
```

### Step 3: Collect and Merge Results

Wait for all agents to complete, then merge results into a unified ADR:

```markdown
# ADR-{NNNN}: {Category} Choice

**Status:** PROPOSED
**Date:** {date}
**Category:** {category}
**Context:** {context}
**Endpoint:** {endpoint}

## Options Considered

### Option 1: {Option A} (Recommended)

**Pros:**
- {Real pro from research}
- {Real pro from research}
- {Real pro from research}

**Cons:**
- {Real con from research}
- {Real con from research}

**Best For:** {Use cases from research}

**Pricing:** {Pricing from research}

**Source:** {URL from research}

### Option 2: {Option B}

... (same structure)

## Decision

_Awaiting user selection in interview phase_

## Consequences

_Will be filled after decision is made_
```

### Step 4: Determine Recommendation

Based on research, mark ONE option as `(Recommended)` using these criteria:

1. **Match to context** - Which fits user's stated project best?
2. **Developer experience** - Which has better docs, easier setup?
3. **Cost effectiveness** - Which has best free tier for MVPs?
4. **Community/support** - Which has more active community?

### Step 5: Update State and Registry

Mark request as processed:

```json
{
  "status": "completed",
  "completed_at": "2025-12-30T10:15:00Z",
  "adr_file": ".claude/adrs/ADR-0001-database-choice.md"
}
```

Add to registry:

```json
{
  "adrs": {
    "0001-database-choice": {
      "number": 1,
      "title": "Database Choice",
      "status": "proposed",
      "date": "2025-12-30",
      "category": "database",
      "options_considered": ["supabase", "firebase", "postgres"],
      "recommended": "supabase",
      "file": ".claude/adrs/ADR-0001-database-choice.md",
      "endpoint": "todo-api"
    }
  }
}
```

### Step 6: Output Summary

```
═══════════════════════════════════════════════════════════════════
                    ADR RESEARCH COMPLETE
═══════════════════════════════════════════════════════════════════

Category: database
Options Researched: 3
  • Supabase (Recommended)
  • Firebase
  • PostgreSQL + Prisma

ADR Created: .claude/adrs/ADR-0001-database-choice.md

Key Findings:
───────────────────────────────────────
  Supabase:   Real-time + Auth built-in, free tier generous
  Firebase:   Google ecosystem, NoSQL only
  PostgreSQL: Full control, more setup required
───────────────────────────────────────

This ADR will be referenced during the interview phase.
The user can review options and select their preference.

═══════════════════════════════════════════════════════════════════
```

## ADR Output Template

Use this template for the generated ADR:

```markdown
# ADR-{NUMBER}: {Title}

**Status:** PROPOSED | ACCEPTED | DEPRECATED | SUPERSEDED
**Date:** YYYY-MM-DD
**Category:** {category}
**Context:** {user's project context}
**Endpoint:** {related endpoint if any}

## Context

{Why this decision needs to be made}

## Options Considered

### Option 1: {Name} (Recommended)

**Pros:**
- {Specific, factual pro with detail}
- {Specific, factual pro with detail}
- {Specific, factual pro with detail}

**Cons:**
- {Specific, factual con with detail}
- {Specific, factual con with detail}

**Best For:** {Ideal use cases}

**Pricing:**
- Free: {limits}
- Paid: {tiers}

**Source:** {URL}

### Option 2: {Name}

{Same structure}

### Option 3: {Name}

{Same structure}

## Decision

_Awaiting user selection in interview phase_

## Consequences

_Will be filled after decision is made_

## Research Metadata

| Aspect | Details |
|--------|---------|
| Researched | {timestamp} |
| Sources | {count} official docs |
| Agents | {count} parallel researchers |
| Duration | {time} |
```

## Configuration

ADR categories and keywords are configured in `.claude/hustle-build-defaults.json`:

```json
{
  "adr": {
    "enabled": true,
    "significant_decisions": {
      "database": ["supabase", "firebase", "postgres", "mysql", "mongodb"],
      "auth": ["api key", "oauth", "jwt", "session", "cookie"],
      "cache": ["redis", "memcached", "in-memory", "cdn"],
      "hosting": ["vercel", "netlify", "aws", "cloudflare"],
      "state": ["redux", "zustand", "jotai", "context"],
      "styling": ["tailwind", "css modules", "styled-components"]
    },
    "min_options_for_adr": 2
  }
}
```

## Directory Structure

```
.claude/
├── adr-requests/
│   ├── pending-database.json      # Awaiting research
│   ├── pending-auth.json          # Awaiting research
│   └── completed-database.json    # Research done
├── adrs/
│   ├── ADR-0001-database-choice.md
│   ├── ADR-0002-auth-method.md
│   └── index.json                 # ADR catalog
└── registry.json                  # Includes adrs section
```

## Integration Points

- **Triggered by:** `hooks/generate-adr-options.py` (PostToolUse)
- **Uses agent:** `.claude/agents/adr-researcher.md`
- **Updates:** `.claude/registry.json` with ADR entries
- **Referenced by:** `/api-interview` for informed user choices

## Error Handling

| Error | Action |
|-------|--------|
| No pending request | Log warning, exit gracefully |
| Agent fails | Use fallback research (WebSearch directly) |
| Partial results | Create ADR with available data, mark incomplete |
| Rate limited | Retry with backoff, continue with other options |

## See Also

- `/api-research` - General API documentation research
- `/api-interview` - Interview phase that uses ADR context
- `docs/ARCHITECTURE_DECISION_RECORDS.md` - Full ADR documentation
