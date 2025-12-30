---
name: test-review
description: AI-powered code review for antipatterns, security, and performance
tools: Bash, Read, Glob, Grep, Task
model: sonnet
---

# Test Review Skill

Analyze code for security vulnerabilities, performance issues, antipatterns, and best practice violations using AI.

## When to Use

- After implementing a feature
- Before creating a pull request
- To audit existing code
- During code review phase (Phase 11)

## Execution Steps

### Step 1: Identify Changed Files

```bash
# Get files changed in current branch
git diff --name-only main...HEAD | grep -E '\.(ts|tsx|js|jsx)$'

# Or get recently modified files
git diff --name-only HEAD~5 | grep -E '\.(ts|tsx|js|jsx)$'
```

### Step 2: Spawn Code Reviewer Agent

```
Task({
  subagent_type: "code-reviewer",
  model: "sonnet",
  prompt: `Review these files for:
    1. Security vulnerabilities (OWASP Top 10)
    2. Performance issues
    3. Antipatterns
    4. Best practice violations
    5. Type safety issues

    Files to review:
    ${changedFiles.join('\n')}

    Return structured findings.`
})
```

### Step 3: Analyze Results

Categorize findings by severity:

```
Code Review Results
═══════════════════════════════════════

🔴 Critical (Block PR)
─────────────────────────────────────
1. SQL Injection Risk
   File: src/app/api/users/route.ts:45
   Code: `SELECT * FROM users WHERE id = ${userId}`
   Fix: Use parameterized queries

2. Exposed API Key
   File: src/lib/api.ts:12
   Code: apiKey: "sk_live_xxx"
   Fix: Move to environment variable

🟠 Warning (Should Fix)
─────────────────────────────────────
1. Missing Error Boundary
   File: src/app/dashboard/page.tsx
   Issue: Async component without error handling
   Fix: Wrap in ErrorBoundary or try/catch

2. N+1 Query Pattern
   File: src/lib/data.ts:28
   Issue: Query inside loop
   Fix: Batch queries or use JOIN

🟡 Suggestion (Nice to Have)
─────────────────────────────────────
1. Consider Memoization
   File: src/components/DataTable.tsx:15
   Issue: Expensive sort on every render
   Fix: Use useMemo for sorted data

2. Add Loading State
   File: src/hooks/useData.ts:8
   Issue: No loading indicator
   Fix: Return isLoading from hook
```

## Security Checks

| Check | Description | Severity |
|-------|-------------|----------|
| SQL Injection | Raw SQL with user input | Critical |
| XSS | Unsanitized HTML output | Critical |
| Auth Bypass | Missing auth checks | Critical |
| Exposed Secrets | API keys in code | Critical |
| CSRF | Missing CSRF protection | High |
| Path Traversal | Unsanitized file paths | High |
| Rate Limiting | Missing rate limits | Medium |
| Input Validation | Missing Zod validation | Medium |

## Performance Checks

| Check | Description | Severity |
|-------|-------------|----------|
| N+1 Queries | Queries in loops | High |
| Missing Indexes | Slow DB queries | Medium |
| Large Bundle | Unnecessary imports | Medium |
| Memory Leaks | Uncleared intervals | Medium |
| Sync Operations | Blocking main thread | Low |

## Output Format

```
═══════════════════════════════════════
Code Review: ✅ PASS / ⚠️ WARNINGS / ❌ BLOCKED
═══════════════════════════════════════
Files Reviewed: 12
Findings:
  🔴 Critical: 0
  🟠 Warning:  3
  🟡 Suggestion: 5

Time: 5.2s
═══════════════════════════════════════
```

## Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `[files]` | Specific files to review | Changed files |
| `--security` | Security-focused review | false |
| `--performance` | Performance-focused review | false |
| `--all` | Review all files | false |

## Examples

```bash
# Review changed files
/test-review

# Security audit only
/test-review --security

# Performance audit
/test-review --performance

# Review specific file
/test-review src/app/api/users/route.ts
```

## Integration

This skill is invoked during:
- Phase 11 (Code Review) of all workflows
- `/test-all` final step

## See Also

- `/test-all` - Complete test suite
- `/test-debug` - Debug issues
