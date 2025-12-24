---
name: api-env
description: Check required API keys and environment variables. Supports server env vars, NEXT_PUBLIC_ vars, and custom headers. Use before starting implementation. Keywords: environment, api-keys, configuration, setup, validation
license: MIT
compatibility: Requires Claude Code with MCP servers (Context7, GitHub), Python 3.9+ for hooks, pnpm 10.11.0+
metadata:
  version: "3.0.0"
  category: "development"
  tags: ['environment', 'api-keys', 'configuration', 'setup']
  author: "Hustle Together"
allowed-tools: WebSearch WebFetch mcp__context7 mcp__github AskUserQuestion Read Write Edit Bash TodoWrite
---

# API Environment - Check API Keys & Configuration

**Usage:** `/api-env [endpoint-name]`

**Purpose:** Quick check for required API keys and environment setup before implementation.

## What This Checks

1. **Reads endpoint documentation** to identify required services
2. **Checks .env.local** for API keys
3. **Verifies .env.example** has templates
4. **Reports missing keys** with setup instructions

## Output

```
🔑 Environment Check: [endpoint-name]

Required API Keys:
✅ OPENAI_API_KEY (found)
❌ FIRECRAWL_API_KEY (missing)

Action Required:
1. Get key from https://firecrawl.dev
2. Add to .env.local: FIRECRAWL_API_KEY=fc-...
3. Add to .env.example template

Status: BLOCKED - Cannot proceed without FIRECRAWL_API_KEY
```

## Usage in Workflow

```bash
# Before starting implementation
/api-interview generate-css
/api-research firecrawl
/api-env generate-css  ← Check keys
/red                   ← Start TDD if ready
```

<claude-commands-template>
## API Key Support

The project supports three methods:
1. Server env: `OPENAI_API_KEY=sk-...`
2. Client env: `NEXT_PUBLIC_OPENAI_API_KEY=sk-...`
3. Custom headers: `X-OpenAI-Key: sk-...`

Check src/lib/api-keys.ts for implementation.
</claude-commands-template>
