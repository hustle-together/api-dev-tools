---
name: test-review
description: AI-powered code review for antipatterns, security, and performance
tools: Bash, Read, Glob, Grep, Task
model: sonnet
---

# Test Review Skill

Analyze code for security vulnerabilities, performance issues, antipatterns, and best practice violations using a tiered approach: deterministic ESLint rules + structured AI review.

## When to Use

- After implementing a feature
- Before creating a pull request
- To audit existing code
- During code review phase (Phase 11)

## Tiered Strategy for Large Codebases

> **Reality Check:** AI cannot hold 5000 files in context at once.
> We use a tiered approach to ensure comprehensive coverage.

### Tier 1: ESLint (ALL Files - Deterministic)

ESLint runs on **every file**, every time. This is fast pattern matching that scales infinitely.

```bash
# Run on entire codebase
pnpm eslint src/ --plugin security --plugin no-unsanitized --format json > eslint-report.json

# Count files scanned
jq '.length' eslint-report.json
```

**What ESLint Catches (100% Coverage):**
- XSS via innerHTML/insertAdjacentHTML
- eval() with user input
- Path traversal via fs calls
- Prototype pollution via bracket notation
- Regex DoS patterns
- Command injection via child_process

### Tier 2: AI Review - Changed Files (Per Commit/PR)

Only review files that changed in the current branch/PR.

```bash
# Get changed files
git diff --name-only main...HEAD | grep -E '\.(ts|tsx|js|jsx)$'
```

**Limit:** 50-100 files max per AI review session.

### Tier 3: AI Review - Critical Paths (Always Included)

Even if unchanged, always include security-critical files:

```bash
# Critical paths that ALWAYS get reviewed
CRITICAL_PATHS=(
  "src/app/api/**/*"        # All API routes
  "src/middleware*"         # Middleware
  "src/lib/auth*"           # Auth utilities
  "src/lib/db*"             # Database utilities
  "src/lib/crypto*"         # Cryptography
  "src/hooks/useAuth*"      # Auth hooks
)
```

### Tier 4: Full Scan (Weekly/Scheduled)

For complete codebase audits, batch files:

```bash
# Split files into batches of 200
find src -name "*.ts" -o -name "*.tsx" | split -l 200 - batch_

# Review each batch separately
for batch in batch_*; do
  /test-review $(cat $batch | tr '\n' ' ')
done
```

**Output:** Aggregate report with all findings across batches.

## How We Know Everything Was Reviewed

### Coverage Tracking

```bash
# Total files in codebase
TOTAL=$(find src -name "*.ts" -o -name "*.tsx" | wc -l)

# Files covered by ESLint
ESLINT_COVERED=$(jq '.length' eslint-report.json)

# Files reviewed by AI
AI_REVIEWED=$(cat .claude/review-log.json | jq '.files_reviewed | length')

# Coverage report
echo "ESLint Coverage: $ESLINT_COVERED / $TOTAL (100%)"
echo "AI Review Coverage: $AI_REVIEWED files (changed + critical)"
```

### Review Log (Written After Each Review)

```json
// .claude/review-log.json
{
  "last_full_scan": "2025-12-29T10:00:00Z",
  "last_pr_review": "2025-12-29T15:30:00Z",
  "files_reviewed": [
    "src/app/api/users/route.ts",
    "src/lib/auth.ts"
  ],
  "findings_count": {
    "critical": 0,
    "warning": 2,
    "suggestion": 5
  }
}
```

## AI Security Detection Patterns

### What AI Catches (That ESLint Cannot)

These require understanding context and data flow:

#### 1. SQL Injection

```typescript
// DETECT: Raw SQL with template literals
const result = await db.query(`SELECT * FROM users WHERE id = ${userId}`);

// SAFE: Parameterized queries
const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

**AI Pattern:** Look for SQL keywords (SELECT, INSERT, UPDATE, DELETE) with template literals containing variables.

#### 2. Authentication Bypass

```typescript
// DETECT: API route without auth check
export async function GET(request: Request) {
  const data = await fetchSensitiveData();
  return Response.json(data);
}

// SAFE: Auth middleware applied
export async function GET(request: Request) {
  const session = await auth();
  if (!session) return new Response('Unauthorized', { status: 401 });
  const data = await fetchSensitiveData();
  return Response.json(data);
}
```

**AI Pattern:** Check every API route for authentication calls (auth(), getSession(), validateToken()).

#### 3. CSRF Vulnerabilities

```typescript
// DETECT: Mutation without CSRF token
export async function POST(request: Request) {
  const data = await request.json();
  await updateUser(data);
}

// SAFE: CSRF token validated
export async function POST(request: Request) {
  const token = request.headers.get('X-CSRF-Token');
  if (!validateCsrfToken(token)) throw new Error('Invalid CSRF');
  const data = await request.json();
  await updateUser(data);
}
```

**AI Pattern:** POST/PUT/DELETE endpoints without CSRF validation.

#### 4. Insecure Direct Object Reference (IDOR)

```typescript
// DETECT: No ownership check
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const order = await getOrder(params.id);
  return Response.json(order);
}

// SAFE: Ownership verified
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const order = await getOrder(params.id);
  if (order.userId !== session.user.id) {
    return new Response('Forbidden', { status: 403 });
  }
  return Response.json(order);
}
```

**AI Pattern:** Route handlers that fetch resources without checking ownership.

#### 5. Mass Assignment

```typescript
// DETECT: Spreading user input to database
const user = await prisma.user.update({
  where: { id: userId },
  data: { ...request.body }  // User could set role: 'admin'
});

// SAFE: Allowlist fields
const { name, email } = request.body;
const user = await prisma.user.update({
  where: { id: userId },
  data: { name, email }
});
```

**AI Pattern:** Spread operators with user input into database operations.

#### 6. Sensitive Data Exposure

```typescript
// DETECT: Password in response
return Response.json({ user });  // user object includes password field

// SAFE: Exclude sensitive fields
const { password, ...safeUser } = user;
return Response.json({ user: safeUser });
```

**AI Pattern:** API responses that include fields named password, secret, token, key.

## Multi-Pass Review System

> **Why Multi-Pass?** Each pass focuses on ONE category. This prevents context dilution
> and ensures deterministic checklist completion.

### Pass Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    MULTI-PASS REVIEW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PASS 1: Logic & Bugs                                          │
│  ├─ Null/undefined handling                                     │
│  ├─ Off-by-one errors                                          │
│  ├─ Race conditions                                             │
│  ├─ Type coercion issues                                        │
│  └─ Dead code paths                                             │
│                                                                 │
│  PASS 2: Security                                              │
│  ├─ Authentication bypass                                       │
│  ├─ Authorization gaps                                          │
│  ├─ Input validation                                            │
│  ├─ Data exposure                                               │
│  └─ Injection vulnerabilities                                   │
│                                                                 │
│  PASS 3: Performance                                           │
│  ├─ N+1 queries                                                 │
│  ├─ Missing indexes                                             │
│  ├─ Unbounded loops                                             │
│  ├─ Memory leaks                                                │
│  └─ Unnecessary re-renders                                      │
│                                                                 │
│  PASS 4: Miscellaneous (AI Judgment)                           │
│  ├─ Code clarity                                                │
│  ├─ Pattern consistency                                         │
│  ├─ Error handling gaps                                         │
│  └─ Documentation needs                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Pass 1: Logic & Bugs (Deterministic Checklist)

Each item is a YES/NO question. The AI must answer ALL items.

```markdown
## Pass 1: Logic & Bugs Checklist

### Null/Undefined Handling
- [ ] All optional properties checked before access
- [ ] Array/object spread on potentially null values
- [ ] Promise rejections properly caught
- [ ] Default values provided for destructuring

### Off-by-One Errors
- [ ] Loop bounds correct (< vs <=)
- [ ] Array indices valid (0-based accounting)
- [ ] String slice/substring bounds correct
- [ ] Pagination offset/limit calculations

### Race Conditions
- [ ] State updates batched appropriately
- [ ] Async operations don't have stale closures
- [ ] Concurrent modifications handled
- [ ] Loading states prevent double-submits

### Type Coercion
- [ ] === used instead of == for comparisons
- [ ] Number parsing handles NaN
- [ ] Boolean coercion is intentional
- [ ] String concatenation vs addition clear

### Dead Code
- [ ] No unreachable code after returns
- [ ] Switch cases have breaks/returns
- [ ] Conditional logic can be triggered
- [ ] Unused variables and imports
```

### Pass 2: Security (Deterministic Checklist)

```markdown
## Pass 2: Security Checklist

### Authentication
- [ ] All API routes check session/token validity
- [ ] JWT tokens verified for expiration
- [ ] Sensitive routes require re-authentication
- [ ] Password reset tokens are single-use

### Authorization
- [ ] Role-based access enforced
- [ ] Resource ownership verified (IDOR prevention)
- [ ] Admin routes protected
- [ ] Elevated actions logged

### Input Validation
- [ ] User inputs validated with Zod/joi/yup
- [ ] SQL queries use parameterized statements
- [ ] File uploads checked (type, size, content)
- [ ] URL parameters sanitized

### Data Protection
- [ ] Passwords excluded from API responses
- [ ] Error messages don't leak internals
- [ ] Logs sanitized of PII/secrets
- [ ] HTTPS enforced

### Session Security
- [ ] Session tokens HTTP-only cookies
- [ ] CSRF tokens on mutations
- [ ] Session expiration enforced
- [ ] Logout invalidates server-side

### API Security
- [ ] Rate limiting on auth endpoints
- [ ] CORS allows specific origins only
- [ ] API keys are environment variables
- [ ] Webhook signatures verified
```

### Pass 3: Performance (Deterministic Checklist)

```markdown
## Pass 3: Performance Checklist

### Database
- [ ] No N+1 queries (use eager loading)
- [ ] Queries have appropriate indexes
- [ ] Large result sets paginated
- [ ] Expensive queries cached

### Memory
- [ ] Event listeners cleaned up
- [ ] Large objects garbage collected
- [ ] Streams used for large files
- [ ] Subscriptions unsubscribed

### Rendering (React)
- [ ] useMemo for expensive calculations
- [ ] useCallback for stable references
- [ ] Keys on list items are stable
- [ ] Components split for isolation

### Network
- [ ] Requests debounced/throttled
- [ ] Responses compressed
- [ ] Assets lazy loaded
- [ ] API calls batched when possible

### Async
- [ ] Parallel execution where possible
- [ ] Timeouts on external calls
- [ ] Retries with backoff
- [ ] Loading states prevent waterfalls
```

### Pass 4: Miscellaneous (AI Judgment)

> Unlike Passes 1-3, this pass uses AI judgment for subjective items.

```markdown
## Pass 4: Miscellaneous

### Code Clarity
- Is the code self-documenting?
- Are variable names descriptive?
- Are complex algorithms commented?
- Could any logic be simplified?

### Pattern Consistency
- Does it follow project conventions?
- Is error handling consistent?
- Are similar operations handled similarly?
- Does it match surrounding code style?

### Error Handling
- Are all error cases covered?
- Are errors user-friendly?
- Is error context preserved?
- Are failures graceful?

### Documentation Needs
- Do public APIs have JSDoc?
- Are complex types documented?
- Are edge cases noted?
- Is the README updated if needed?
```

## Review Execution

### Sequential Pass Execution

```bash
# Each pass runs independently and reports findings
/test-review --pass logic     # Pass 1
/test-review --pass security  # Pass 2
/test-review --pass perf      # Pass 3
/test-review --pass misc      # Pass 4

# Or run all passes in sequence
/test-review --all-passes
```

### Pass Output Format

```
═══════════════════════════════════════════════════════════════
                    PASS 1: LOGIC & BUGS
═══════════════════════════════════════════════════════════════

Files Reviewed: 45
Time: 2m 34s

Checklist Results:
┌────────────────────────────────────────────────────┬─────────┐
│ Item                                               │ Status  │
├────────────────────────────────────────────────────┼─────────┤
│ Null/Undefined Handling                            │         │
│   ├─ Optional properties checked                   │ ✅ Pass │
│   ├─ Spread on null values                         │ ⚠️ Warn │
│   ├─ Promise rejections caught                     │ ✅ Pass │
│   └─ Default values for destructuring              │ ✅ Pass │
├────────────────────────────────────────────────────┼─────────┤
│ Off-by-One Errors                                  │         │
│   ├─ Loop bounds correct                           │ ✅ Pass │
│   ├─ Array indices valid                           │ ✅ Pass │
│   ├─ String slice bounds                           │ ✅ Pass │
│   └─ Pagination calculations                       │ ❌ Fail │
└────────────────────────────────────────────────────┴─────────┘

Findings:
───────────────────────────────────────────────────────────────

❌ FAIL: Pagination calculations
   File: src/app/api/users/route.ts:67
   Code: const offset = (page - 1) * limit + 1
   Issue: Off-by-one error - offset should not add 1
   Fix: const offset = (page - 1) * limit

⚠️ WARN: Spread on null values
   File: src/lib/merge.ts:23
   Code: const result = { ...maybeNull }
   Issue: maybeNull could be null/undefined
   Fix: const result = { ...(maybeNull ?? {}) }

═══════════════════════════════════════════════════════════════
Pass 1 Complete: 1 Failure, 1 Warning
═══════════════════════════════════════════════════════════════
```

### Combined Report

After all passes:

```
═══════════════════════════════════════════════════════════════
                    MULTI-PASS REVIEW SUMMARY
═══════════════════════════════════════════════════════════════

Pass Results:
───────────────────────────────────────────────────────────────
Pass 1 - Logic & Bugs:    1 ❌  1 ⚠️  18 ✅
Pass 2 - Security:        0 ❌  2 ⚠️  22 ✅
Pass 3 - Performance:     2 ❌  0 ⚠️  14 ✅
Pass 4 - Miscellaneous:   0 ❌  3 ⚠️   4 ✅
───────────────────────────────────────────────────────────────
TOTAL:                    3 ❌  6 ⚠️  58 ✅  (87% Pass Rate)
───────────────────────────────────────────────────────────────

Critical Issues (Must Fix):
  1. [Logic] Off-by-one in pagination (users/route.ts:67)
  2. [Perf] N+1 query in orders loop (orders/route.ts:34)
  3. [Perf] Missing useCallback causing re-renders (Dashboard.tsx:89)

Warnings (Should Fix):
  1. [Logic] Spread on potential null (merge.ts:23)
  2. [Security] CORS allows localhost in prod (middleware.ts:12)
  3. [Security] Session cookie missing SameSite (auth.ts:45)
  4. [Misc] Complex function needs comment (utils.ts:123)
  5. [Misc] Inconsistent error handling (api/orders)
  6. [Misc] Missing JSDoc on public API (types.ts)

═══════════════════════════════════════════════════════════════
```

## Execution Steps

### Step 1: Run ESLint Security Scan (All Files)

```bash
# Ensure security plugins installed
pnpm add -D eslint-plugin-security eslint-plugin-no-unsanitized

# Run full scan
pnpm eslint src/ --plugin security --plugin no-unsanitized --format json > eslint-security.json

# Count issues
CRITICAL=$(jq '[.[] | .messages[] | select(.severity == 2)] | length' eslint-security.json)
echo "ESLint found $CRITICAL critical issues"
```

### Step 2: Identify Files for AI Review

```bash
# Changed files
CHANGED=$(git diff --name-only main...HEAD | grep -E '\.(ts|tsx|js|jsx)$')

# Critical paths (always review)
CRITICAL_PATHS="src/app/api src/middleware src/lib/auth"

# Combine and deduplicate
FILES_TO_REVIEW=$(echo "$CHANGED" "$CRITICAL_PATHS" | tr ' ' '\n' | sort -u)
```

### Step 3: Spawn AI Review (Batched if Needed)

```javascript
// If > 100 files, batch
const batches = chunk(filesToReview, 100);

for (const batch of batches) {
  Task({
    subagent_type: "code-reviewer",
    model: "sonnet",
    prompt: `Review these files using the security checklist:
      ${batch.join('\n')}

      Check for:
      1. SQL Injection (template literals with SQL)
      2. Auth Bypass (API routes without auth)
      3. CSRF (mutations without token validation)
      4. IDOR (no ownership verification)
      5. Mass Assignment (spreading user input)
      6. Data Exposure (passwords in responses)

      Return JSON: {findings: [{file, line, type, severity, detail, fix}]}`
  });
}
```

### Step 4: Generate Coverage Report

```
═══════════════════════════════════════════════════════════════
                    SECURITY REVIEW REPORT
═══════════════════════════════════════════════════════════════

Coverage:
───────────────────────────────────────────────────────────────
ESLint (Deterministic):     1,234 / 1,234 files (100%)
AI Review (Changed):           45 files
AI Review (Critical Paths):    12 files
───────────────────────────────────────────────────────────────

ESLint Findings:
───────────────────────────────────────────────────────────────
✅ No critical issues
⚠️  2 warnings (see eslint-security.json)
───────────────────────────────────────────────────────────────

AI Review Findings:
───────────────────────────────────────────────────────────────
🔴 Critical: 1
   - src/app/api/users/route.ts:45 - SQL Injection
     Code: `SELECT * FROM users WHERE id = ${userId}`
     Fix: Use parameterized query

🟠 Warning: 2
   - src/app/api/orders/route.ts:23 - Missing ownership check
   - src/lib/auth.ts:89 - Session token not HTTP-only

🟡 Suggestion: 3
   - src/hooks/useData.ts:12 - Add error boundary
───────────────────────────────────────────────────────────────

Last Full Scan: 2025-12-29
Next Scheduled: 2026-01-05 (weekly)

═══════════════════════════════════════════════════════════════
```

## Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `[files]` | Specific files to review | Changed files |
| `--security` | Security-focused review | false |
| `--performance` | Performance-focused review | false |
| `--all` | Review all files (batched) | false |
| `--full-scan` | Force full codebase scan | false |

## Examples

```bash
# Review changed files + critical paths
/test-review

# Security audit only
/test-review --security

# Full codebase scan (batched)
/test-review --full-scan

# Review specific file
/test-review src/app/api/users/route.ts
```

## Autonomous Loop Completion (Ralph Wiggum Pattern)

When running in autonomous mode (`--auto` flag or `/ralph-loop`), this skill supports
self-terminating loops for iterative code review cycles.

### Promise Signal

After completing all passes and addressing all findings, output:

```
<promise>REVIEW_CLEAN</promise>
```

This signal is detected by the `completion-promise-detector.py` hook, which:
1. Records the promise in `.claude/completion-promises.json`
2. Allows graceful workflow termination
3. Prevents infinite review loops

### When to Output the Promise

Output `<promise>REVIEW_CLEAN</promise>` when:
- All 4 passes have been executed
- All critical issues have been fixed
- Re-review confirms no new issues
- The codebase is ready for merge

### Iterative Review Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                    REVIEW LOOP (Ralph Wiggum)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Run multi-pass review                                       │
│     └─ Findings? → Fix issues                                   │
│                                                                 │
│  2. Re-run review on changed files                              │
│     └─ New findings? → Loop back to step 1                      │
│                                                                 │
│  3. All clean?                                                  │
│     └─ Output: <promise>REVIEW_CLEAN</promise>                  │
│     └─ Hook detects → Workflow terminates gracefully            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Credit:** Ralph Wiggum pattern by [Geoffrey Huntley](https://ghuntley.com/ralph/)

## Integration

This skill is invoked during:
- Phase 11 (Code Review) of all workflows
- `/test-all` final step
- Weekly scheduled audits (CI/CD)

## See Also

- `/test-all` - Complete test suite
- `/test-debug` - Debug issues
- `/ralph-loop` - Autonomous loop execution
- [docs/AUTONOMOUS_LOOPS.md](../../docs/AUTONOMOUS_LOOPS.md) - Pattern documentation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
