# Agents Reference

**Version:** 4.0.0
**Last Updated:** 2025-12-29

> **The Problem**
>
> Long-running tasks in a single conversation consume context rapidly and slow down responses. Researching multiple documentation sources sequentially wastes time, and using a powerful model for simple tasks wastes resources.

> **The Solution**
>
> Agents are specialized sub-processes that run in parallel with isolated context windows. Each agent has restricted tools for its specific task, uses the appropriate model (Haiku for speed, Sonnet for quality), and returns structured results without bloating the main conversation.

---

## Table of Contents

- [What Are Agents?](#what-are-agents)
- [Available Agents](#available-agents)
- [Agent Architecture](#agent-architecture)
- [Creating Custom Agents](#creating-custom-agents)

---

## What Are Agents?

Agents are Claude instances specialized for specific tasks:

- **Parallel Execution** - Run alongside main conversation
- **Specialized Tools** - Limited to relevant tools only
- **Model Selection** - Haiku for speed, Sonnet for quality, Opus for complex reasoning
- **Structured Output** - Return formatted results

### When to Use Agents

| Situation                              | Agent Type            |
| -------------------------------------- | --------------------- |
| Need to research multiple docs at once | `parallel-researcher` |
| Need schema generated from research    | `schema-generator`    |
| Need tests written from schema         | `test-writer`         |
| Need code review                       | `code-reviewer`       |
| Need docs generated                    | `docs-generator`      |

---

## Available Agents

### parallel-researcher

**Purpose:** Fast parallel documentation scraper
**Model:** Haiku (for speed)
**Tools:** Read, WebSearch, WebFetch, mcp\_\_context7

Used during Phase 3 (Initial Research) and Phase 5 (Deep Research) to scrape multiple documentation pages simultaneously.

**Input:**

```json
{
  "url": "https://docs.example.com/api",
  "api_name": "Example API",
  "extract": ["endpoints", "parameters", "webhooks"]
}
```

**Output:**

```json
{
  "source_url": "https://docs.example.com/api",
  "api_name": "Example API",
  "extracted": {
    "endpoints": [
      { "method": "GET", "path": "/users", "description": "List users" }
    ],
    "parameters": [{ "name": "limit", "type": "number", "required": false }],
    "webhooks": [],
    "code_examples": []
  }
}
```

**Usage in Skills:**

```markdown
Launch 3 parallel-researcher agents:

1. Official API reference
2. SDK documentation
3. Webhook documentation
```

---

### schema-generator

**Purpose:** Create Zod schemas from research findings
**Model:** Sonnet
**Tools:** Read, Write

Takes research summary and interview decisions, produces Zod schema.

**Input:**

- Research findings (endpoints, parameters)
- Interview decisions (which params to include)
- Error handling preferences

**Output:**

- `src/lib/schemas/[endpoint].schema.ts`
- Zod schema with full validation
- TypeScript types exported

**Example Output:**

```typescript
import { z } from "zod";

export const SearchRequestSchema = z.object({
  query: z.string().min(1).describe("Search query"),
  page: z.number().int().min(1).default(1),
  per_page: z.number().int().min(1).max(100).default(10),
});

export type SearchRequest = z.infer<typeof SearchRequestSchema>;
```

---

### test-writer

**Purpose:** Write tests from schema
**Model:** Sonnet
**Tools:** Read, Write, Glob

Creates test files during TDD Red phase.

**Input:**

- Zod schema file
- Endpoint details
- Test scenarios from interview

**Output:**

- `src/app/api/[endpoint]/__tests__/route.test.ts`
- Vitest test file
- Covers success and error cases

**Example Output:**

```typescript
import { describe, it, expect } from "vitest";
import { GET } from "../route";

describe("GET /api/search", () => {
  it("returns results for valid query", async () => {
    const req = new Request("http://localhost/api/search?query=test");
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it("returns 400 for missing query", async () => {
    const req = new Request("http://localhost/api/search");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });
});
```

---

### code-reviewer

**Purpose:** AI-powered code review
**Model:** Opus (for deep reasoning)
**Tools:** Read, Grep

Reviews code for:

- Bugs and logic errors
- Security vulnerabilities
- Performance issues
- Best practices

**Input:**

- File paths to review
- Review focus (bugs, security, performance, all)

**Output:**

```json
{
  "summary": "Found 2 issues",
  "critical": [],
  "high": [
    {
      "file": "route.ts",
      "line": 45,
      "issue": "SQL injection vulnerability",
      "fix": "Use parameterized queries"
    }
  ],
  "medium": [
    {
      "file": "route.ts",
      "line": 12,
      "issue": "Missing error boundary",
      "fix": "Wrap in try-catch"
    }
  ],
  "low": []
}
```

---

### implementation-reviewer

**Purpose:** Compare implementation to documentation
**Model:** Sonnet
**Tools:** Read, WebSearch, WebFetch, mcp\_\_context7

Used in Phase 10 (Verify) to catch implementation gaps.

**Input:**

- Implementation file paths
- Original research cache
- Schema file

**Output:**

```markdown
| Feature      | Documented | Implemented | Status  |
| ------------ | ---------- | ----------- | ------- |
| query param  | Yes        | Yes         | Match   |
| page param   | Yes        | Yes         | Match   |
| color filter | Yes        | No          | MISSING |
| safe_search  | Yes        | No          | MISSING |

Recommendation: Add missing color and safe_search params
```

---

### docs-generator

**Purpose:** Generate documentation from code
**Model:** Haiku
**Tools:** Read, Write

Creates documentation artifacts:

- TSDoc comments
- README sections
- Manifest entries
- Changelog entries

**Input:**

- Source file paths
- Documentation type (tsdoc, readme, manifest)

**Output:**

- Formatted documentation strings
- Ready to insert into files

---

### research-validator

**Purpose:** Validate research quality
**Model:** Haiku
**Tools:** Read

Checks research findings before proceeding:

- Source authority (official vs blog)
- Completeness (all endpoints found)
- Freshness (recent documentation)
- Consistency (no contradictions)

**Output:**

```json
{
  "quality_score": 85,
  "issues": [
    "Blog source found - prefer official docs",
    "Missing webhook documentation"
  ],
  "recommendation": "proceed" | "research_more"
}
```

---

## Agent Architecture

### Agent Definition File

Agents are defined in `.claude/agents/[name].md`:

```markdown
---
name: agent-name
description: What this agent does
tools: Read, Write, Edit
model: haiku | sonnet | opus
---

# Agent Name

You are a specialized agent that...

## Your Role

1. Do this
2. Then that
3. Return this

## Input Format

You will receive...

## Output Format

Return your findings as...
```

### Model Selection

| Model      | Use Case                        | Speed   | Cost    |
| ---------- | ------------------------------- | ------- | ------- |
| **Haiku**  | Fast scraping, simple tasks     | Fastest | Lowest  |
| **Sonnet** | Schema generation, code writing | Medium  | Medium  |
| **Opus**   | Complex reasoning, code review  | Slower  | Highest |

### Tool Restrictions

Agents only have access to specified tools:

```yaml
# Research agent - read-only
tools: Read, WebSearch, WebFetch, mcp__context7

# Code generator - can write
tools: Read, Write, Edit, Glob

# Reviewer - read and analyze only
tools: Read, Grep, Glob
```

---

## Creating Custom Agents

### Step 1: Create Agent File

```bash
touch .claude/agents/my-agent.md
```

### Step 2: Define Agent

```markdown
---
name: my-agent
description: Does a specific thing really well
tools: Read, Write
model: sonnet
---

# My Agent

You are a specialized agent for [specific task].

## Your Role

[Clear description of what this agent does]

## Input Format

You will receive:

- Thing 1
- Thing 2

## Output Format

Return structured JSON:

\`\`\`json
{
"result": "...",
"metadata": {}
}
\`\`\`

## Guidelines

1. Be specific
2. Stay focused
3. Return structured data
```

### Step 3: Use in Skills

Reference the agent in your skill:

```markdown
Launch the my-agent agent with:

- Input 1
- Input 2

Wait for results before proceeding.
```

### Step 4: Invoke Programmatically

Agents are invoked via the Task tool:

```typescript
// In a skill or hook
{
  "tool": "Task",
  "input": {
    "subagent_type": "my-agent",
    "prompt": "Process this: ...",
    "model": "sonnet"
  }
}
```

---

## Agent Best Practices

1. **Single Responsibility** - One agent, one job
2. **Minimal Tools** - Only give tools actually needed
3. **Structured Output** - Always return parseable results
4. **Fast Models First** - Use Haiku unless you need reasoning
5. **Parallel When Possible** - Launch multiple agents at once
6. **Clear Instructions** - Agents work best with explicit guidance

---

## See Also

- [HOOKS.md](./HOOKS.md) - Enforcement hook reference
- [SKILLS.md](./SKILLS.md) - Slash command reference
- [PLUGIN_ARCHITECTURE.md](./PLUGIN_ARCHITECTURE.md) - How the plugin system works
