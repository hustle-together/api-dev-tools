# Greptile Integration Guide

> **Version:** 3.12.0
> **Last Updated:** December 26, 2025

AI-powered code review and codebase intelligence for api-dev-tools.

---

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [MCP Server](#mcp-server)
4. [GitHub PR Reviews](#github-pr-reviews)
5. [Context & CLAUDE.md](#context--claudemd)
6. [Configuration](#configuration)
7. [Usage Patterns](#usage-patterns)
8. [Troubleshooting](#troubleshooting)

---

## Overview

[Greptile](https://greptile.com) provides AI-powered codebase intelligence:

- **Semantic Search**: Query codebase in natural language
- **PR Reviews**: Automated code review comments on pull requests
- **MCP Server**: Direct integration with Claude Code
- **Context-Aware**: Reads CLAUDE.md for project-specific guidance

### Pricing

| Plan | Cost | Features |
|------|------|----------|
| Free Trial | $0 (3 months) | Full features, limited usage |
| Pro | $30/dev/month | Unlimited queries, PR reviews |
| Enterprise | Custom | SSO, dedicated support |

---

## Setup

### 1. Create Greptile Account

1. Visit [greptile.com](https://greptile.com)
2. Sign up with GitHub account
3. Authorize repository access

### 2. Get API Keys

1. Go to [Dashboard → API Keys](https://app.greptile.com/api-keys)
2. Generate new API key
3. Copy and store securely

### 3. Configure Environment

```bash
# Add to your shell profile (~/.bashrc, ~/.zshrc)
export GREPTILE_API_KEY="your-greptile-api-key"
export GITHUB_TOKEN="your-github-personal-access-token"
```

**GitHub Token Requirements:**
- Scope: `repo` (full access to private repos)
- Or: `public_repo` (for public repos only)

### 4. Index Your Repository

Greptile automatically indexes repositories when:
- You connect them in the dashboard
- You make queries against them
- PRs are opened (if GitHub App installed)

Manual indexing:
```bash
curl -X POST "https://api.greptile.com/v2/repositories" \
  -H "Authorization: Bearer $GREPTILE_API_KEY" \
  -H "X-GitHub-Token: $GITHUB_TOKEN" \
  -d '{"remote": "github", "repository": "owner/repo", "branch": "main"}'
```

---

## MCP Server

Greptile provides an MCP (Model Context Protocol) server for direct Claude Code integration.

### Installation

```bash
# Add to Claude Code MCP config
claude mcp add greptile -- npx greptile-mcp-server \
  --api-key "$GREPTILE_API_KEY" \
  --github-token "$GITHUB_TOKEN"
```

### MCP Tools Available

| Tool | Description |
|------|-------------|
| `greptile_query` | Natural language codebase search |
| `greptile_search` | Semantic code search |
| `greptile_explain` | Explain code sections |

### Usage in Claude Code

Once configured, Claude can use Greptile directly:

```
User: "How does authentication work in this codebase?"

Claude: [Uses greptile_query to search codebase]
        [Returns relevant code snippets and explanations]
```

### Configuration in autonomous-config.json

```json
{
  "integrations": {
    "greptile": {
      "enabled": true,
      "api_key_env": "GREPTILE_API_KEY",
      "github_token_env": "GITHUB_TOKEN",
      "auto_index_on_commit": false,
      "review_on_pr": true
    }
  }
}
```

---

## GitHub PR Reviews

Greptile can automatically review pull requests with inline comments.

### Install GitHub App

1. Visit [Greptile GitHub App](https://github.com/apps/greptile)
2. Install on your repository/organization
3. Select repositories to enable

### Review Behavior

When a PR is opened or updated:

1. Greptile indexes the changes
2. Analyzes code against codebase patterns
3. Posts inline comments for:
   - Potential bugs
   - Style inconsistencies
   - Security concerns
   - Missing tests
   - Documentation gaps

### Customizing Reviews

Create `.greptile.json` in repository root:

```json
{
  "reviews": {
    "enabled": true,
    "severity": "medium",
    "categories": [
      "bugs",
      "security",
      "performance",
      "style"
    ],
    "ignore_paths": [
      "*.test.ts",
      "*.spec.ts",
      "node_modules/**",
      "dist/**"
    ]
  }
}
```

### Severity Levels

| Level | Description |
|-------|-------------|
| `low` | All suggestions, including nitpicks |
| `medium` | Important issues, skip minor style |
| `high` | Critical bugs and security only |

---

## Context & CLAUDE.md

Greptile reads your `CLAUDE.md` file to understand project context.

### What Greptile Uses

- **Project conventions**: Coding style, patterns
- **Architecture decisions**: How code is organized
- **API guidelines**: Endpoint patterns, validation rules
- **Testing requirements**: TDD approach, coverage expectations

### Optimizing for Greptile

Add a section to your CLAUDE.md:

```markdown
## Code Review Guidelines

### Must Check
- All API endpoints have input validation
- Tests accompany new features
- No secrets in code (use environment variables)
- Error handling follows project patterns

### Style
- Use TypeScript strict mode
- Prefer functional patterns
- Document public APIs with JSDoc

### Security
- Validate all user input
- Use parameterized queries
- Rate limit API endpoints
```

Greptile uses these guidelines when reviewing PRs.

---

## Configuration

### .greptile.json Full Reference

```json
{
  "$schema": "https://greptile.com/schemas/config.json",
  "version": "1.0.0",

  "indexing": {
    "branches": ["main", "develop"],
    "include_patterns": ["src/**", "lib/**"],
    "exclude_patterns": ["node_modules/**", "dist/**", "*.test.ts"]
  },

  "reviews": {
    "enabled": true,
    "severity": "medium",
    "categories": ["bugs", "security", "performance", "style", "docs"],
    "auto_approve": false,
    "require_tests": true,
    "ignore_paths": ["*.md", "package-lock.json"]
  },

  "context": {
    "claude_md_path": "CLAUDE.md",
    "additional_context": [
      "docs/ARCHITECTURE.md",
      "docs/API_GUIDELINES.md"
    ]
  },

  "notifications": {
    "slack_webhook": "",
    "notify_on": ["critical", "security"]
  }
}
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GREPTILE_API_KEY` | Yes | API key from dashboard |
| `GITHUB_TOKEN` | Yes | GitHub PAT with repo access |
| `GREPTILE_BASE_URL` | No | Custom API endpoint (enterprise) |

---

## Usage Patterns

### Pattern 1: Pre-Commit Review

Before committing, ask Claude to review using Greptile:

```
/commit

# Claude will:
# 1. Use Greptile to analyze changes against codebase patterns
# 2. Identify potential issues
# 3. Suggest improvements before commit
```

### Pattern 2: Architecture Questions

```
User: "What's the best place to add a new payment provider?"

Claude: [Uses greptile_query]
        "Based on the codebase, payment providers are in src/providers/
         following the PaymentProvider interface. See stripe.ts for pattern."
```

### Pattern 3: Bug Investigation

```
User: "Users report checkout failing intermittently"

Claude: [Uses greptile_search for checkout-related code]
        [Analyzes error handling patterns]
        [Identifies potential race conditions]
```

### Pattern 4: Onboarding

```
User: "Explain how the API authentication works"

Claude: [Uses greptile_explain]
        [Returns comprehensive explanation with code references]
```

---

## Integration with api-dev-tools

### During /api-create Workflow

Greptile enhances several phases:

| Phase | Greptile Enhancement |
|-------|---------------------|
| Phase 3 (Research) | Search codebase for existing patterns |
| Phase 6 (Schema) | Find similar schemas for consistency |
| Phase 10 (Verify) | Cross-reference implementation with patterns |
| Phase 12 (Documentation) | Generate accurate API descriptions |

### Hook Integration

The `enforce-research.py` hook can use Greptile for codebase search:

```python
# In hook code
if greptile_enabled():
    results = greptile_query(f"How does {endpoint} pattern work?")
    inject_context(results)
```

---

## Troubleshooting

### API Key Issues

```bash
# Test API key
curl -X GET "https://api.greptile.com/v2/repositories" \
  -H "Authorization: Bearer $GREPTILE_API_KEY" \
  -H "X-GitHub-Token: $GITHUB_TOKEN"

# Should return list of indexed repositories
```

### Repository Not Indexed

```bash
# Check indexing status
curl -X GET "https://api.greptile.com/v2/repositories/github:owner:repo" \
  -H "Authorization: Bearer $GREPTILE_API_KEY"

# Trigger re-index
curl -X POST "https://api.greptile.com/v2/repositories/github:owner:repo/index" \
  -H "Authorization: Bearer $GREPTILE_API_KEY"
```

### MCP Server Not Responding

```bash
# Check if MCP server is running
claude mcp list

# Restart MCP server
claude mcp remove greptile
claude mcp add greptile -- npx greptile-mcp-server \
  --api-key "$GREPTILE_API_KEY" \
  --github-token "$GITHUB_TOKEN"
```

### PR Reviews Not Appearing

1. Check GitHub App is installed on repository
2. Verify repository is indexed in Greptile dashboard
3. Check `.greptile.json` has `reviews.enabled: true`
4. Look at Greptile dashboard for review logs

### Rate Limiting

Free tier has usage limits. If hitting limits:

```bash
# Check current usage
curl -X GET "https://api.greptile.com/v2/usage" \
  -H "Authorization: Bearer $GREPTILE_API_KEY"
```

---

## See Also

- [AUTONOMOUS_MODE.md](./AUTONOMOUS_MODE.md) - Autonomous execution guide
- [GRAPHITE_WORKFLOW.md](./GRAPHITE_WORKFLOW.md) - Stacked PRs workflow
- [CLAUDE_CODE_FEATURES.md](./CLAUDE_CODE_FEATURES.md) - Claude Code features reference
- [Greptile Documentation](https://docs.greptile.com)

---

**Version:** 3.12.0
**Author:** Hustle Together
