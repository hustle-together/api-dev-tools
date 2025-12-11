# API Development Tools for Claude Code v3.6.1

**Interview-driven, research-first API development with 100% phase enforcement**

```
┌──────────────────────────────────────────────┐
│ ❯ npx @hustle-together/api-dev-tools         │
│         --scope=project                      │
│                                              │
│ 🚀 Installing v3.6.1...                      │
│                                              │
│ ✅ Python 3.12.0                             │
│ 📦 24 slash commands                         │
│ 🔒 18 enforcement hooks                      │
│ ⚙️  settings.json configured                 │
│ 📊 api-dev-state.json created                │
│ 📚 research cache ready                      │
│ 🔌 MCP: context7, github                     │
│                                              │
│ ═════════════════════════════════════        │
│ 🎉 Installation complete!                    │
│ ═════════════════════════════════════        │
│                                              │
│ Quick Start: /api-create my-endpoint         │
└──────────────────────────────────────────────┘
```

---

## Why This Exists

Building high-quality APIs with AI assistance requires consistency and rigor. We created this tool to solve a fundamental problem: **LLMs are powerful but unreliable without enforcement.**

This package was built with the goal of enabling teams to produce higher-quality, more consistent API implementations by enforcing a proven workflow that prevents common mistakes **before** they become production issues.

### The Core Problem

When developers use Claude (or any LLM) to build APIs, five predictable failure modes emerge:

1. **Outdated Documentation** - LLMs use training data from months or years ago. APIs change constantly - endpoints get deprecated, parameters are renamed, authentication methods evolve. Building from stale knowledge means broken code.

2. **Memory-Based Implementation** - Even after doing research, Claude often implements from memory by the time it gets to Phase 8 (writing code). It forgets the specific parameter names, error codes, and edge cases it discovered 20 messages ago.

3. **Self-Answering Questions** - Claude asks "Which format do you want?" then immediately answers "I'll use JSON" without waiting for your response. You lose control of the decision-making process.

4. **Context Dilution** - In a 50-message session, the context from Phase 3 (research) is diluted by Phase 9 (implementation). Critical details get lost. Claude starts guessing instead of referencing research.

5. **Skipped Steps** - Without enforcement, Claude jumps directly to implementation. No tests. No verification. No documentation. You get code that "works" but fails in production because edge cases weren't tested.

### Our Solution

**A 12-phase workflow enforced by Python hooks that BLOCK progress** until each phase is complete with explicit user approval. Not suggestions. Not guidelines. **Hard stops using Exit Code 2.**

This means:
- Claude cannot skip research
- Claude cannot answer its own questions
- Claude cannot implement before writing tests
- Claude cannot finish without verifying against current docs
- Claude cannot close without updating documentation

Every decision is tracked. Every phase is verified. Every step is enforced.

---

## The 12-Phase Workflow

When you run `/api-create brandfetch`, Claude is guided through 12 enforced phases. Each phase has three components:

1. **The Problem** - What goes wrong without enforcement
2. **The Solution** - How the phase prevents the problem
3. **The Hook** - Python script that blocks progress until complete

---

### Phase 0: Disambiguation

**The Problem We're Solving:**
Ambiguous terms waste hours of work. When you say "brandfetch," do you mean:
- The Brandfetch REST API at api.brandfetch.io?
- The @brandfetch/sdk npm package?
- A WordPress plugin?
- Custom code you want to write from scratch?

Without disambiguation, Claude guesses wrong, researches the wrong thing, and builds an implementation for the wrong target. You realize the mistake 90 minutes later when tests fail.

**How This Phase Works:**
Claude uses Context7 or WebSearch to discover all possible interpretations, then presents them as multiple choice options:

```
I found multiple things matching "brandfetch":
  [A] Brandfetch REST API (api.brandfetch.io)
  [B] @brandfetch/sdk npm package
  [C] Brandfetch WordPress plugin

Which interpretation matches your intent?
```

Claude uses the `AskUserQuestion` tool (Claude Code's built-in dialog) to present the options. The dialog appears in your terminal with a text input field. You type "[A]" and press enter.

**The Enforcement:**
- **Hook:** `enforce-disambiguation.py`
- **Blocks:** All Write/Edit operations until disambiguation complete
- **Requires:** `user_question_asked = true` AND `phase_exit_confirmed = true`
- **Detection:** Hook checks state file for both flags before allowing file edits

**State Tracking:**
```json
{
  "disambiguation": {
    "status": "complete",
    "user_question_asked": true,
    "user_selected": "Brandfetch REST API",
    "phase_exit_confirmed": true
  }
}
```

**Why This Matters:**
Five seconds of clarification saves an hour of wasted research. Everyone starts on the same page. No ambiguity. No guesswork.

---

<details>
<summary><strong>Phase 1: Scope Confirmation</strong></summary>

**The Problem We're Solving:**
Misunderstood requirements lead to wrong implementations. You say "fetch brand assets" but Claude thinks you want a full-featured CMS with caching, authentication, rate limiting, and database persistence. Or worse - Claude thinks you want something simpler and omits features you need.

Scope drift happens when assumptions aren't confirmed. Claude infers requirements instead of asking.

**How This Phase Works:**
Claude summarizes its understanding of the endpoint in plain language:

```
I'll create: /api/v2/brandfetch

Purpose: Fetch brand assets (logos, colors, fonts) from Brandfetch API

Input: domain name (string)
Output: JSON with brand data

Is this scope correct? [Yes / No, I need...]
```

You can correct it: "Yes, but also add a logo-only mode for faster responses."

Claude updates the scope and asks again: "Updated scope to include logo-only mode. Correct now?"

You confirm: "Yes."

**The Enforcement:**
- **Hook:** `enforce-scope.py`
- **Blocks:** Write/Edit until `phase_exit_confirmed = true`
- **Requires:** Explicit affirmative response from user ("yes", "correct", "looks good")
- **Detection:** `track-tool-use.py` monitors `AskUserQuestion` calls and responses

**State Tracking:**
```json
{
  "scope": {
    "status": "complete",
    "confirmed": true,
    "scope_description": "Fetch brand assets with optional logo-only mode",
    "phase_exit_confirmed": true
  }
}
```

**Why This Matters:**
Requirements locked in before research begins. No backtracking. No "wait, that's not what I meant" after implementation. Saves time and ensures alignment.

</details>

---

<details>
<summary><strong>Phase 2: Initial Research</strong></summary>

**The Problem We're Solving:**
Training data is stale. Claude's knowledge cutoff might be January 2024, but the Brandfetch API was updated in March 2024 with new rate limit headers. Building from outdated knowledge means broken integrations.

APIs evolve constantly:
- New endpoints added
- Parameters renamed (v1 used `format`, v2 uses `imageFormat`)
- Authentication methods changed (API key → Bearer token)
- Rate limits adjusted (100/min → 5/sec)

**How This Phase Works:**
Claude must fetch CURRENT documentation using two methods:

1. **Context7 MCP Server:**
   - Resolves package name to library ID: `/brandfetch/api-docs`
   - Fetches live docs from npm, GitHub, official sites
   - Returns 23 endpoints, 47 parameters, code examples
   - Gets version-specific documentation (v2.3 vs v2.0)

2. **WebSearch:**
   - Searches "Brandfetch API authentication 2025"
   - Confirms current auth method: Bearer token
   - Searches "Brandfetch API rate limits"
   - Finds current limits: 5 requests/second

Claude cross-references both sources before presenting findings:

```
Research Summary:
• Base URL: https://api.brandfetch.io/v2
• Auth: Bearer token (BRANDFETCH_API_KEY)
• Rate limit: 5 requests/second
• Returns: logos (SVG, PNG, JPG), colors, fonts

Sources:
  [1] Context7: /brandfetch/api-docs
  [2] WebSearch: "Brandfetch API documentation 2025"

Proceed to interview? [Yes / Search more first]
```

**The Enforcement:**
- **Hook:** `enforce-research.py`
- **Blocks:** Write/Edit until `sources.length >= 2`
- **Exit Code 2:** Triggers if Claude tries to implement without research
- **Message:** "BLOCKED: Research required. Sources consulted: 0. Required: 2."
- **Detection:** Hook checks `research_initial.sources` array in state

**State Tracking:**
```json
{
  "research_initial": {
    "status": "complete",
    "sources": [
      "context7:/brandfetch/api-docs",
      "websearch:brandfetch-api-2025"
    ],
    "findings": {
      "base_url": "https://api.brandfetch.io/v2",
      "auth_method": "bearer_token",
      "rate_limit": "5/second"
    },
    "phase_exit_confirmed": true
  }
}
```

**Why Context7 Matters:**
Context7 doesn't just fetch docs - it gets CODE EXAMPLES from real implementations. When researching Brandfetch, Context7 found:
- 15 more parameters than documented in official API reference
- Error response structure (not documented in v2.0 release notes)
- Working curl examples with actual requests/responses

Training data would have missed all of this.

**Why This Matters:**
Current, accurate documentation prevents integration failures. Cross-referencing catches discrepancies. Your implementation works with TODAY's API, not last year's.

</details>

---

<details>
<summary><strong>Phase 3: Structured Interview</strong></summary>

**The Problem We're Solving:**
Generic template questions don't reflect actual API capabilities. Without research, Claude asks:
- "What format do you want?" (doesn't know which formats exist)
- "How should errors be handled?" (hasn't seen actual error responses)
- "What caching strategy?" (hasn't checked if API supports caching)

This leads to impossible requirements ("I want XML format" when API only returns JSON) or missed opportunities (API supports SVG but Claude never mentioned it).

**How This Phase Works:**
Questions are generated FROM research findings. Claude discovered (in Phase 2) that Brandfetch returns SVG, PNG, and JPG. So those become the options:

```
Based on research, I have 5 questions:

Q1: Which response format do you need?
    [ ] JSON only
    [x] JSON with asset URLs
    [ ] Include raw base64 assets

Q2: Caching strategy?
    [ ] No caching
    [ ] Short (5 minutes)
    [x] Long (24 hours) - brand data rarely changes

Q3: Error handling approach?
    [ ] Throw errors (caller handles)
    [x] Return error objects { success: false, error: {...} }

Q4: Rate limit handling?
    [ ] Client handles retry
    [ ] Server-side retry with backoff
    [x] Expose rate limit headers (X-RateLimit-*)

Q5: Which brand assets to include?
    [x] Logos
    [x] Colors
    [ ] Fonts
    [ ] Images

Interview complete? [Yes, these answers are final / Modify answers]
```

Each question reflects discovered capabilities. The options aren't generic - they're specific to Brandfetch's actual API.

**The Enforcement:**
- **Hook:** `enforce-interview.py`
- **Blocks:** Until `structured_question_count >= 3`
- **Exit Code 2:** Triggers if Claude self-answers questions
- **Detection:** Hook checks for `AskUserQuestion` tool calls, waits for user responses
- **Prevents:** Claude from saying "I'll assume you want JSON" without asking

**How Self-Answering Detection Works:**
The hook monitors tool calls:
1. Claude calls `AskUserQuestion` → Hook sets `waiting_for_response = true`
2. Claude tries to call Write/Edit → Hook blocks with Exit Code 2
3. User provides response → Hook sets `waiting_for_response = false`
4. Now Write/Edit is allowed

**State Tracking:**
```json
{
  "interview": {
    "status": "complete",
    "structured_question_count": 5,
    "decisions": {
      "response_format": "json_with_urls",
      "caching": "24h",
      "error_handling": "return_objects",
      "rate_limiting": "expose_headers",
      "assets": ["logos", "colors"]
    },
    "phase_exit_confirmed": true
  }
}
```

**Critical Insight:**
These decisions are saved and automatically injected during implementation phases. When Claude writes tests (Phase 7), it references `decisions.error_handling = "return_objects"` to know what to test. When implementing (Phase 8), it uses `decisions.caching = "24h"` to set cache headers.

Your choices drive the entire implementation. No guessing. No forgetting.

**Why This Matters:**
Questions based on research prevent impossible requirements. Interview answers become the contract for implementation. Claude can't forget your decisions because they're in state.

</details>

---

<details>
<summary><strong>Phase 4: Deep Research</strong></summary>

**The Problem We're Solving:**
Initial research provides the overview, but your specific choices need deeper investigation. You chose "Expose rate limit headers" - but which headers does Brandfetch actually return? You chose "Return error objects" - but what's the exact structure?

Without targeted follow-up research, Claude implements from assumptions. It guesses that rate limit headers are `X-RateLimit-Limit` and `X-RateLimit-Remaining` (standard names), but Brandfetch actually uses `X-Plan-RateLimit-Limit` and `X-Plan-RateLimit-Remaining` (non-standard).

**How This Phase Works:**
Claude proposes searches based on YOUR interview answers (not shotgun exploration):

```
Based on your selections, I want to research:

[x] "Brandfetch error response format"
    Why: You chose "Return error objects" - need exact structure

[x] "Brandfetch rate limit headers"
    Why: You chose "Expose headers" - need header names

[ ] "Brandfetch font API"
    Why: SKIPPED - you don't need fonts

Approve these searches? [Yes / Add more / Skip all]
```

You can modify: "Yes, also add authentication error examples."

Claude runs approved searches and reports findings:

```
Deep Research Results:

Error Response Format:
{
  "success": false,
  "error": {
    "code": "INVALID_DOMAIN",
    "message": "Domain not found",
    "details": {}
  }
}

Rate Limit Headers:
- X-Plan-RateLimit-Limit: 5
- X-Plan-RateLimit-Remaining: 4
- X-Plan-RateLimit-Reset: 1640000000

Authentication Errors:
- 401: Missing API key
- 403: Invalid API key
- 429: Rate limit exceeded
```

**The Enforcement:**
- **Hook:** `enforce-deep-research.py`
- **Blocks:** If approved searches not executed
- **Tracks:** `proposed_searches`, `approved_searches`, `executed_searches`
- **Detection:** Compares arrays - all approved must be in executed

**State Tracking:**
```json
{
  "research_deep": {
    "status": "complete",
    "proposed_searches": ["error-format", "rate-headers", "auth-errors"],
    "approved_searches": ["error-format", "rate-headers", "auth-errors"],
    "executed_searches": ["error-format", "rate-headers", "auth-errors"],
    "findings": {
      "error_structure": { "documented": true },
      "rate_headers": ["X-Plan-RateLimit-Limit", "X-Plan-RateLimit-Remaining"],
      "auth_errors": { "401": "missing_key", "403": "invalid_key" }
    },
    "phase_exit_confirmed": true
  }
}
```

**Adaptive Research Logic:**
The hook enforces that proposed searches align with interview decisions:
- If `decisions.error_handling = "return_objects"` → Must search error format
- If `decisions.rate_limiting = "expose_headers"` → Must search rate headers
- If `decisions.assets` doesn't include "fonts" → Skip font research

Your requirements drive the research. No wasted effort on features you don't need.

**Why This Matters:**
Targeted research prevents assumption-based implementation. You get exact header names, exact error codes, exact field names. No guessing. No "close enough."

</details>

---

<details>
<summary><strong>Phase 5: Schema Creation</strong></summary>

**The Problem We're Solving:**
Without a contract between tests and implementation, they drift apart. Tests check for `logoUrl` but implementation returns `logo_url`. Tests expect 400 errors but implementation returns 500. The API "works" but doesn't match the spec.

Validation gaps emerge:
- Frontend sends `domain` (string) but backend expects `{ domain: string, tld: string }`
- API returns extra fields that aren't typed
- Optional fields marked as required (or vice versa)

**How This Phase Works:**
Claude creates Zod schemas encoding ALL research findings and interview decisions:

```typescript
// Request Schema (from research + interview)
const BrandfetchRequest = z.object({
  domain: z.string().min(1),  // From research: required field
  mode: z.enum(["full", "logo-only"]).default("full"),  // From interview Q1
  include: z.object({
    logos: z.boolean().default(true),  // From interview Q5
    colors: z.boolean().default(true), // From interview Q5
  }).optional(),
});

// Response Schema (success case)
const BrandfetchResponse = z.object({
  success: z.literal(true),
  data: z.object({
    logos: z.array(z.object({
      format: z.enum(["svg", "png", "jpg"]),  // From research: available formats
      url: z.string().url(),
      size: z.object({ width: z.number(), height: z.number() }).optional(),
    })),
    colors: z.array(z.object({
      hex: z.string().regex(/^#[0-9A-F]{6}$/i),
      type: z.enum(["primary", "secondary", "accent"]),
    })),
  }),
  cached: z.boolean(),  // From interview Q2: caching enabled
});

// Error Response Schema (from deep research)
const BrandfetchError = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.enum(["INVALID_DOMAIN", "NOT_FOUND", "RATE_LIMIT", "AUTH_FAILED"]),
    message: z.string(),
    details: z.record(z.any()).optional(),
  }),
});
```

Claude presents the schema for review:

```
Schema created from research + interview.

Does this match your expectations? [Yes / Modify]
```

**The Enforcement:**
- **Hook:** `enforce-schema.py`
- **Blocks:** Until schema shown to user and confirmed
- **Checks:** Schema file exists at expected path
- **Validates:** Schema references interview decisions

**State Tracking:**
```json
{
  "schema_creation": {
    "status": "complete",
    "schema_file": "src/lib/schemas/brandfetch.ts",
    "includes_interview_decisions": true,
    "includes_research_findings": true,
    "phase_exit_confirmed": true
  }
}
```

**Why Schema Matters:**
The schema becomes the single source of truth:
- Tests import it to validate responses
- Implementation imports it to validate inputs
- Documentation generation reads it to show types
- Frontend can generate TypeScript types from it

If schema says `logo_url` (snake_case), both tests AND implementation use `logo_url`. No drift. No mismatches.

**Why This Matters:**
Type safety from research to production. Tests verify the schema. Implementation matches the schema. Frontend types match the schema. One contract, enforced everywhere.

</details>

---

<details>
<summary><strong>Phase 6: Environment Check</strong></summary>

**The Problem We're Solving:**
Tests pass locally but fail in CI. Why? Missing `BRANDFETCH_API_KEY` environment variable. You waste 30 minutes debugging, checking logs, re-running tests, before realizing the environment isn't set up.

Or worse: You write tests that mock the API because the real API key isn't available. Tests pass with mocks but fail in production with real API calls. Mocks drift from actual behavior.

**How This Phase Works:**
Claude checks required environment variables BEFORE writing any tests:

```
Checking environment setup...

Required variables for /api/v2/brandfetch:
  ✅ BRANDFETCH_API_KEY - found in .env
  ✅ NODE_ENV - set to development

Optional variables:
  ⚠️  CACHE_TTL - not set (will use default: 24h)

Ready to begin TDD? [Yes / Need to set up keys first]
```

If keys are missing, Claude provides setup instructions:

```
Missing: BRANDFETCH_API_KEY

Setup instructions:
1. Get API key: https://brandfetch.com/dashboard/api
2. Add to .env: BRANDFETCH_API_KEY=your_key_here
3. Verify: echo $BRANDFETCH_API_KEY

Reply "ready" when complete.
```

**The Enforcement:**
- **Hook:** `enforce-environment.py`
- **Blocks:** Test file creation until env vars verified
- **Checks:** `.env` file OR environment variables
- **Validates:** Key format (not just presence)

**How Key Detection Works:**
```python
def check_environment(endpoint_name, interview_decisions):
    # Infer required keys from endpoint name
    if "brandfetch" in endpoint_name.lower():
        required_keys = ["BRANDFETCH_API_KEY"]
    elif "openai" in endpoint_name.lower():
        required_keys = ["OPENAI_API_KEY"]
    # ... etc

    for key in required_keys:
        if not os.getenv(key) and key not in read_env_file():
            return False, f"Missing: {key}"

    return True, "Environment ready"
```

**State Tracking:**
```json
{
  "environment_check": {
    "status": "complete",
    "keys_found": ["BRANDFETCH_API_KEY"],
    "keys_missing": [],
    "validated": true,
    "phase_exit_confirmed": true
  }
}
```

**Why This Matters:**
No surprises in CI. No mock/real API drift. Tests run with real API calls from day one. If tests pass locally, they pass in CI. Environment consistency from development to production.

</details>

---

<details>
<summary><strong>Phase 7: TDD Red (Write Failing Tests)</strong></summary>

**The Problem We're Solving:**
Without tests, you don't know if your code works. You ship bugs. You break things in production. You discover edge cases after users report them.

Test-after-code is reactive:
- "It works on my machine" (but breaks in production)
- "I didn't think to test that case" (user finds it)
- "I'll add tests later" (never happens)

**How This Phase Works:**
Claude writes failing tests FIRST, derived from interview decisions and research findings:

```
Test Matrix (from interview + research):

Success Scenarios:
  ✅ GET /api/v2/brandfetch?domain=google.com → 200 + brand data
  ✅ GET with mode=logo-only → 200 + logos only (no colors)
  ✅ Cache hit (second request) → 200 + cached: true
  ✅ SVG format → logo.format === "svg"

Error Scenarios (from interview Q3: return error objects):
  ✅ Invalid domain → 400 + { success: false, error: {...} }
  ✅ Missing API key → 401 + error object
  ✅ Not found → 404 + error object
  ✅ Rate limited → 429 + X-Plan-RateLimit-* headers

Edge Cases (from deep research):
  ✅ Empty colors array → 200 + [] (not error)
  ✅ Timeout (>30s) → 504 + error object

Total: 10 test scenarios

Write these tests? [Yes / Add more / Modify]
```

You confirm. Claude creates the test file:

```typescript
describe('/api/v2/brandfetch', () => {
  it('returns brand data for valid domain', async () => {
    const response = await GET('/api/v2/brandfetch?domain=google.com');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.logos).toBeInstanceOf(Array);
    expect(response.body.data.colors).toBeInstanceOf(Array);
  });

  it('returns error object for invalid domain', async () => {
    const response = await GET('/api/v2/brandfetch?domain=invalid');
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INVALID_DOMAIN');
  });

  // ... 8 more tests
});
```

Claude runs the tests:

```
⏳ Running tests...

FAIL src/app/api/v2/brandfetch/__tests__/route.test.ts
  ✗ returns brand data for valid domain (0 ms)
  ✗ returns error object for invalid domain (0 ms)
  ✗ ... 8 more failures

Tests: 0 passing, 10 failing

This is CORRECT. RED phase means tests exist and fail.
```

**The Enforcement:**
- **Hook:** `enforce-tdd-red.py`
- **Blocks:** `route.ts` creation if no `.test.ts` exists
- **Validates:** Test file has at least 3 scenarios
- **Exit Code 2:** Triggers if Claude tries to implement without tests

**State Tracking:**
```json
{
  "tdd_red": {
    "status": "complete",
    "test_file": "src/app/api/v2/brandfetch/__tests__/route.test.ts",
    "test_count": 10,
    "scenarios": ["success", "errors", "edge_cases"],
    "all_failing": true,
    "phase_exit_confirmed": true
  }
}
```

**Why RED Phase Matters:**
Failing tests define success BEFORE writing code. You know exactly what to build. Tests encode requirements. If implementation passes tests, requirements are met.

No "I think it works" - tests prove it works.

**Why This Matters:**
Tests first means bugs are caught before code is written. Requirements are encoded as assertions. Implementation is guided by tests. No guessing, no assumptions, no "it should work."

</details>

---

<details>
<summary><strong>Phase 8: TDD Green (Make Tests Pass)</strong></summary>

**The Problem We're Solving:**
Over-engineering wastes time. Developers often write more code than needed:
- Add features that weren't requested ("I'll also support XML just in case")
- Premature optimization ("I'll add connection pooling and caching layers")
- Gold-plating ("I'll make it pluggable for future extensions")

Result: More code to maintain, more bugs to fix, more complexity for no benefit.

**How This Phase Works:**
Claude writes MINIMAL implementation - just enough to pass the tests:

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');
  const mode = searchParams.get('mode') || 'full';

  // Validate input (test: invalid domain → 400)
  if (!domain || domain.length === 0) {
    return Response.json({
      success: false,
      error: { code: 'INVALID_DOMAIN', message: 'Domain required' }
    }, { status: 400 });
  }

  // Check API key (test: missing key → 401)
  const apiKey = process.env.BRANDFETCH_API_KEY;
  if (!apiKey) {
    return Response.json({
      success: false,
      error: { code: 'AUTH_FAILED', message: 'Missing API key' }
    }, { status: 401 });
  }

  // Fetch from Brandfetch (test: valid domain → 200)
  const response = await fetch(
    `https://api.brandfetch.io/v2/${domain}`,
    { headers: { 'Authorization': `Bearer ${apiKey}` } }
  );

  if (!response.ok) {
    // Test: not found → 404, rate limit → 429
    const status = response.status;
    const errorMap = {
      404: { code: 'NOT_FOUND', message: 'Domain not found' },
      429: { code: 'RATE_LIMIT', message: 'Rate limit exceeded' },
    };
    return Response.json({
      success: false,
      error: errorMap[status] || { code: 'ERROR', message: 'Request failed' }
    }, { status });
  }

  const data = await response.json();

  // Filter by mode (test: mode=logo-only → logos only)
  if (mode === 'logo-only') {
    return Response.json({
      success: true,
      data: { logos: data.logos, colors: [] },
      cached: false
    });
  }

  // Test: full mode → logos + colors
  return Response.json({
    success: true,
    data: { logos: data.logos, colors: data.colors },
    cached: false
  });
}
```

Claude runs tests:

```
✅ Running tests...

PASS src/app/api/v2/brandfetch/__tests__/route.test.ts
  ✓ returns brand data for valid domain (124 ms)
  ✓ returns error object for invalid domain (23 ms)
  ✓ returns logos only in logo-only mode (98 ms)
  ✓ returns 401 without API key (12 ms)
  ✓ returns 404 for not found (145 ms)
  ✓ returns 429 on rate limit (178 ms)
  ✓ handles empty colors array (87 ms)
  ✓ ... 3 more passing

Tests: 10 passing, 0 failing
Coverage: 100%
```

**The Enforcement:**
- **Hook:** `verify-after-green.py` (PostToolUse on Bash)
- **Detects:** "pnpm test" or "vitest" in command
- **Parses:** stdout for pass/fail counts
- **Auto-triggers:** Phase 9 when all tests pass
- **No manual step:** Workflow continues automatically

**How Auto-Trigger Works:**
```python
def on_bash_complete(command, stdout, exit_code):
    if "test" in command and exit_code == 0:
        if "✓" in stdout and "✗" not in stdout:
            # All tests passing
            state["phases"]["tdd_green"]["all_tests_passing"] = True
            print("AUTO-TRIGGERING Phase 9: Verification", file=sys.stderr)
            # Phase 9 hook will now allow verification
```

**State Tracking:**
```json
{
  "tdd_green": {
    "status": "complete",
    "all_tests_passing": true,
    "coverage": "100%",
    "auto_triggered_verify": true
  }
}
```

**Minimal Implementation Philosophy:**
- No XML support (not in tests)
- No caching layer (not required yet)
- No connection pooling (not tested)
- No extra endpoints (not requested)

Just enough code to make tests pass. Nothing more.

**Why This Matters:**
Minimal code = minimal bugs. Tests define "done." If tests pass, you're done. No over-engineering. No "just in case" features. Ship fast, iterate based on real needs.

</details>

---

<details>
<summary><strong>Phase 9: Verification (Re-Research After Green)</strong></summary>

**The Problem We're Solving:**
Even after researching in Phase 2, Claude implements from memory in Phase 8. Twenty messages have passed. Context has diluted. Claude forgets specific details:
- Used `format` parameter but docs say `imageFormat`
- Returned `logo_url` but API returns `logoUrl`
- Forgot that API supports `include_fonts` parameter

Memory-based errors are subtle. Tests pass (they test what was implemented) but implementation drifts from actual API spec.

**How This Phase Works:**
Claude RE-FETCHES documentation after tests pass and builds a feature-by-feature comparison:

```
Re-reading Brandfetch API documentation...

Verification Table:
┌────────────────┬─────────┬─────────────┬───────────────────┐
│ Feature        │ In Docs │ Implemented │ Status            │
├────────────────┼─────────┼─────────────┼───────────────────┤
│ domain param   │ ✓       │ ✓           │ ✅ Match          │
│ mode param     │ ✗       │ ✓           │ ⚠️  Extra feature │
│ logo formats   │ 4       │ 4           │ ✅ Match          │
│ colors         │ ✓       │ ✓           │ ✅ Match          │
│ include_fonts  │ ✓       │ ✗           │ ⚠️  GAP FOUND     │
│ webhook_url    │ ✓       │ ✗           │ ℹ️  Optional      │
│ auth method    │ Bearer  │ Bearer      │ ✅ Match          │
│ rate headers   │ X-Plan- │ X-Plan-     │ ✅ Match          │
└────────────────┴─────────┴─────────────┴───────────────────┘

GAPS FOUND: 1
  • include_fonts parameter (documented but not implemented)

OPTIONS:
  [A] Loop back to Phase 7 - Write tests for missing features
  [B] Skip - Document as intentional omission

Your choice?
```

You choose: "[B] - I don't need fonts."

Claude documents the omission:

```
Documented as intentional omission:
- include_fonts parameter (user confirmed not needed)

Verification complete. No gaps requiring fixes.
```

**The Enforcement:**
- **Hook:** `enforce-verify.py`
- **Blocks:** Refactoring until verification complete
- **Requires:** Gaps either fixed OR documented as omissions
- **Re-research:** Must call Context7/WebSearch again

**Loop-Back Logic:**
If gaps require fixes:
1. Hook sets `phases.verify.loop_back = true`
2. State resets to Phase 7
3. Claude writes tests for missing features
4. Phase 8 implements missing features
5. Phase 9 runs again
6. Repeat until no gaps

**State Tracking:**
```json
{
  "verify": {
    "status": "complete",
    "re_researched": true,
    "gaps_found": 1,
    "gaps_fixed": 0,
    "intentional_omissions": ["include_fonts"],
    "comparison_table": { ... },
    "phase_exit_confirmed": true
  }
}
```

**Why Re-Research Matters:**
This catches errors that slip through research → implementation gap:
- Claude researched `imageFormat` but implemented `format` (wrong)
- Claude saw `include_fonts` in docs but forgot to implement (gap)
- Claude used wrong error codes (research said 400, implemented 500)

Re-fetching current docs and comparing line-by-line catches memory errors.

**Why This Matters:**
Verification loop ensures implementation matches current docs. Memory errors caught before production. Gaps filled or explicitly documented. No silent drift from spec.

</details>

---

<details>
<summary><strong>Phase 10: TDD Refactor</strong></summary>

**The Problem We're Solving:**
First implementations are messy. Variable names are unclear. Logic is duplicated. Comments are missing. But cleaning up code might break things - you change a condition, forget a case, introduce a regression.

Without tests, refactoring is risky. You can't confidently improve code because you don't know if you broke something.

**How This Phase Works:**
Claude refactors while keeping tests green. Every change is verified:

```
Refactoring opportunities identified:

1. Extract rate limit logic to helper function
2. Add JSDoc comments for public functions
3. Rename `data` variable to `brandData` (clearer)
4. Remove duplicate error handling code

Apply these refactors? [Yes / Skip / Customize]
```

You approve. Claude makes changes:

```typescript
// Before
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');
  // ... 50 lines of logic
}

// After - extracted helper
async function fetchBrandData(domain: string, apiKey: string) {
  const response = await fetch(
    `https://api.brandfetch.io/v2/${domain}`,
    { headers: { 'Authorization': `Bearer ${apiKey}` } }
  );
  return handleBrandfetchResponse(response);
}

/**
 * GET /api/v2/brandfetch
 * Fetches brand assets from Brandfetch API
 * @param domain - Domain name (e.g., "google.com")
 * @param mode - Response mode: "full" or "logo-only"
 */
export async function GET(request: Request) {
  const { domain, mode } = parseRequest(request);
  const brandData = await fetchBrandData(domain, getApiKey());
  return formatResponse(brandData, mode);
}
```

After each change, tests run:

```
✅ Extracted fetchBrandData helper
   Tests: 10 passing

✅ Added JSDoc comments
   Tests: 10 passing

✅ Renamed variables for clarity
   Tests: 10 passing

✅ Removed duplicate error handling
   Tests: 10 passing

Refactor complete. All tests still passing.
```

**The Enforcement:**
- **Hook:** `enforce-refactor.py`
- **Blocks:** Refactoring until verify phase complete
- **Prevents:** Changing behavior (tests must stay green)
- **Validates:** Test count stays the same (no deletions)

**Allowed Changes:**
- Extract functions
- Rename variables
- Add comments
- Remove duplication
- Improve readability

**Forbidden Changes:**
- Change logic
- Add features
- Remove functionality
- Modify behavior

**State Tracking:**
```json
{
  "tdd_refactor": {
    "status": "complete",
    "changes_made": [
      "extracted_helpers",
      "added_docs",
      "renamed_variables"
    ],
    "tests_still_passing": true,
    "phase_exit_confirmed": true
  }
}
```

**Why This Matters:**
Refactor confidently. Tests prove nothing broke. Code gets cleaner without risk. Maintainability improves without regressions.

</details>

---

<details>
<summary><strong>Phase 11: Documentation</strong></summary>

**The Problem We're Solving:**
Knowledge gets lost. The next developer (or the next Claude session) starts from scratch:
- Makes the same mistakes you just fixed
- Asks the same questions you already answered
- Researches the same APIs you already researched
- Discovers the same edge cases you already handled

Without documentation, every session is reinventing the wheel.

**How This Phase Works:**
Claude updates three types of documentation:

1. **Research Cache** (7-day freshness tracking):
```markdown
# Brandfetch API Research
Last updated: 2024-12-11
Freshness: 7 days

## Base URL
https://api.brandfetch.io/v2

## Authentication
Bearer token via Authorization header
Required: BRANDFETCH_API_KEY

## Endpoints
- GET /:domain - Fetch brand data

## Parameters
- domain (required): Domain name
- include_fonts (optional): Include font data

## Rate Limits
- 5 requests/second
- Headers: X-Plan-RateLimit-Limit, X-Plan-RateLimit-Remaining

## Error Codes
- 400: Invalid domain
- 401: Missing API key
- 403: Invalid API key
- 404: Domain not found
- 429: Rate limit exceeded
```

2. **API Test Manifest** (for /api-test UI):
```json
{
  "endpoints": [
    {
      "path": "/api/v2/brandfetch",
      "method": "GET",
      "description": "Fetch brand assets from Brandfetch API",
      "request": {
        "query": {
          "domain": { "type": "string", "required": true },
          "mode": { "type": "enum", "values": ["full", "logo-only"], "default": "full" }
        }
      },
      "response": {
        "success": {
          "status": 200,
          "body": {
            "success": true,
            "data": {
              "logos": "LogoSchema[]",
              "colors": "ColorSchema[]"
            },
            "cached": "boolean"
          }
        },
        "errors": {
          "400": "Invalid domain",
          "401": "Missing API key",
          "404": "Domain not found",
          "429": "Rate limit exceeded"
        }
      },
      "examples": [
        {
          "request": "GET /api/v2/brandfetch?domain=google.com",
          "response": { ... }
        }
      ],
      "testCount": 10,
      "coverage": "100%"
    }
  ]
}
```

3. **State File** (interview decisions + phase completion):
Already tracked throughout workflow - now marked as `documentation.manifest_updated = true`

**The Enforcement:**
- **Hook:** `enforce-documentation.py`
- **Blocks:** Completion until docs updated
- **Checks:** Research cache updated OR fresh (<7 days)
- **Validates:** Manifest includes new endpoint

**Freshness Tracking:**
```json
{
  "research_index": {
    "brandfetch": {
      "last_updated": "2024-12-11T10:30:00Z",
      "freshness_days": 7,
      "is_fresh": true,
      "sources": ["context7", "websearch"]
    }
  }
}
```

When freshness expires (>7 days), hook prompts:

```
⚠️  Research cache stale (8 days old)

OPTIONS:
  [A] Re-research (fetch current docs)
  [B] Mark as reviewed (still accurate)
  [C] Skip (use stale cache)

Recommendation: [A] - APIs change frequently
```

**State Tracking:**
```json
{
  "documentation": {
    "status": "complete",
    "manifest_updated": true,
    "research_cached": true,
    "cache_freshness": "7 days",
    "phase_exit_confirmed": true
  }
}
```

**Why This Matters:**
Future sessions benefit from today's work:
- Research cached → Skip Phase 2 if fresh
- Interview decisions preserved → No re-asking same questions
- Test examples documented → Copy/paste for similar endpoints

Knowledge compounds instead of resetting.

</details>

---

<details>
<summary><strong>Phase 12: Completion</strong></summary>

**The Problem We're Solving:**
How do you know everything is actually done? Claude might claim "finished" but skip phases:
- Skipped verification (Phase 9)
- Forgot documentation (Phase 11)
- Never wrote tests (Phase 7)

Without verification, "done" means "Claude stopped talking" not "workflow complete."

**How This Phase Works:**
The `api-workflow-check.py` hook runs on Stop event (when you try to close Claude):

```
Checking workflow completion...

Phase 0: Disambiguation       ✅ Complete
Phase 1: Scope                ✅ Complete
Phase 2: Research             ✅ Complete (2 sources)
Phase 3: Interview            ✅ Complete (5 questions)
Phase 4: Deep Research        ✅ Complete (3 searches)
Phase 5: Schema               ✅ Complete
Phase 6: Environment          ✅ Complete (1 key)
Phase 7: TDD Red              ✅ Complete (10 tests)
Phase 8: TDD Green            ✅ Complete (10/10 passing)
Phase 9: Verification         ✅ Complete (1 omission)
Phase 10: Refactor            ✅ Complete
Phase 11: Documentation       ✅ Complete
Phase 12: Completion          ✅ In progress

All phases verified. Workflow complete.

Files created:
  • src/app/api/v2/brandfetch/route.ts
  • src/app/api/v2/brandfetch/__tests__/route.test.ts
  • src/lib/schemas/brandfetch.ts

Tests: 10/10 passing
Coverage: 100%

Interview decisions preserved in state.
Research cached for 7 days.

You may close this session.
```

If phases are incomplete:

```
⚠️  WORKFLOW INCOMPLETE

Phase 9: Verification         ✗ Not started
Phase 11: Documentation       ✗ Not started

BLOCKED: Cannot close until workflow complete.

Continue? [Yes / Force close anyway]
```

**The Enforcement:**
- **Hook:** `api-workflow-check.py` (Stop event)
- **Blocks:** Closing Claude until all phases complete
- **Exit Code 2:** If phases incomplete
- **Validates:** Each phase has `status = "complete"`

**Stop Hook Behavior:**
```python
def on_stop_request(state):
    incomplete = []
    for phase_name, phase_data in state["phases"].items():
        if phase_data["status"] != "complete":
            incomplete.append(phase_name)

    if incomplete:
        print(f"BLOCKED: Phases incomplete: {incomplete}", file=sys.stderr)
        sys.exit(2)  # Prevent stop

    print("Workflow complete. Safe to close.", file=sys.stderr)
    sys.exit(0)  # Allow stop
```

**State Tracking:**
```json
{
  "completion": {
    "all_phases_complete": true,
    "files_created": [
      "route.ts",
      "route.test.ts",
      "schemas/brandfetch.ts"
    ],
    "tests_passing": "10/10",
    "documentation_updated": true,
    "research_cached": true
  }
}
```

**Why This Matters:**
"Done" is verified, not claimed. All phases complete. All tests pass. All docs updated. Close confidently knowing nothing was skipped.

</details>

---

## Key Enforcement Mechanisms

### Exit Code 2 (Active Blocking)

**The Technical Mechanism:**
Python hooks exit with code 2 instead of returning JSON deny:

```python
# Old approach (passive - Claude sees reason but may continue)
print(json.dumps({
  "permissionDecision": "deny",
  "reason": "Research required before implementation"
}))
sys.exit(0)

# New approach (active - forces Claude to respond)
print("BLOCKED: Research required before implementation", file=sys.stderr)
print("Run /api-research first, then try again.", file=sys.stderr)
sys.exit(2)
```

**Why Exit Code 2 Matters:**
From [Anthropic's documentation](https://code.claude.com/docs/en/hooks):
> "Exit code 2 creates a feedback loop directly to Claude. Claude sees your error message. **Claude adjusts. Claude tries something different.**"

With JSON deny:
- Claude sees "permission denied"
- Claude might continue with alternative approach
- Block is passive

With Exit Code 2:
- Claude sees stderr message
- Claude MUST respond to error
- Claude cannot proceed without fixing
- Block is active

**Upgraded Hooks Using Exit Code 2:**
- `enforce-research.py` - Forces `/api-research` before implementation
- `enforce-interview.py` - Forces structured interview completion
- `api-workflow-check.py` - Forces all phases complete before stopping
- `verify-implementation.py` - Forces fix of critical mismatches

**Example Error Flow:**
```
1. Claude: "I'll write route.ts now"
2. Hook: BLOCKED (Exit Code 2)
   Message: "Research required. Sources: 0. Required: 2."
3. Claude: "Let me research first using Context7..."
4. Claude calls Context7
5. Hook: Allowed (research done)
6. Claude: "Now I'll write route.ts based on research"
```

### phase_exit_confirmed Enforcement

**The Problem:**
Claude calls `AskUserQuestion` but immediately self-answers without waiting:

```
Claude: "Which format do you want? [JSON / XML]"
Claude: "I'll use JSON since it's most common."
(User never had a chance to respond)
```

**The Solution:**
Every phase requires TWO things:
1. An "exit confirmation" question (detected by patterns)
2. An affirmative user response (detected by patterns)

**Detection Logic:**
```python
def _detect_question_type(question_text, options):
    """Classifies questions into types"""
    exit_patterns = [
        "proceed", "continue", "ready to", "move to",
        "approve", "confirm", "looks good", "correct"
    ]

    for pattern in exit_patterns:
        if pattern in question_text.lower():
            return "exit_confirmation"

    return "data_collection"

def _is_affirmative_response(response, options):
    """Checks if user approved"""
    affirmative = [
        "yes", "proceed", "approve", "confirm",
        "ready", "looks good", "correct", "go ahead"
    ]

    for pattern in affirmative:
        if pattern in response.lower():
            return True

    return False
```

**Enforcement Flow:**
```
1. Claude asks: "Research complete. Proceed to interview?"
2. Hook detects: exit_confirmation question
3. Hook sets: waiting_for_response = true
4. Claude tries: Write/Edit operation
5. Hook blocks: Exit Code 2 (still waiting for response)
6. User responds: "yes"
7. Hook detects: affirmative response
8. Hook sets: phase_exit_confirmed = true
9. Claude tries: Write/Edit operation
10. Hook allows: phase_exit_confirmed = true
```

**State Tracking:**
```json
{
  "research_initial": {
    "phase_exit_confirmed": false,
    "last_question_type": "exit_confirmation",
    "waiting_for_response": true
  }
}
```

After user responds "yes":
```json
{
  "research_initial": {
    "phase_exit_confirmed": true,
    "last_question_type": "exit_confirmation",
    "waiting_for_response": false,
    "user_response": "yes"
  }
}
```

### Context7 Integration

**What Context7 Is:**
Context7 is an MCP server that fetches live documentation from npm, GitHub, and official API docs. It doesn't use Claude's training data - it gets TODAY's docs.

**How It Works:**
1. **Resolve library ID:**
   ```
   Input: "brandfetch"
   Context7: Searches npm, GitHub, official sites
   Output: /brandfetch/api-docs (Context7 ID)
   ```

2. **Fetch documentation:**
   ```
   Input: /brandfetch/api-docs
   Context7: Retrieves docs, parses endpoints, extracts parameters
   Output: 23 endpoints, 47 parameters, code examples
   ```

**Why It Matters:**
Training data example (wrong):
```
Brandfetch API (from Claude's training - 2023):
- Auth: API key in query parameter
- Base URL: https://api.brandfetch.io/v1
- Format parameter: "format"
```

Context7 result (correct - 2024):
```
Brandfetch API (from Context7 - today):
- Auth: Bearer token in Authorization header
- Base URL: https://api.brandfetch.io/v2
- Format parameter: "imageFormat"
```

**Real Example:**
When researching Brandfetch, Context7 found:
- `include_fonts` parameter (added in v2.3, not in training data)
- `X-Plan-RateLimit-*` headers (non-standard names)
- Error response structure (undocumented in official API reference)

Training data would have missed all three.

**MCP Configuration:**
Automatically installed by `npx @hustle-together/api-dev-tools`:
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"]
    }
  }
}
```

### Automatic Re-grounding

**The Problem:**
Long sessions lose context. Phase 3 (interview) happens at turn 15. Phase 9 (verification) happens at turn 47. By turn 47, Claude has forgotten your interview decisions from turn 15.

**The Solution:**
`periodic-reground.py` re-injects state summary every 7 turns.

**What Gets Re-injected:**
```
Turn 7: [RE-GROUNDING]
Current phase: interview
Interview decisions so far:
  - response_format: json_with_urls
  - caching: 24h
Research sources:
  - context7:/brandfetch/api-docs
  - websearch:brandfetch-api-2025
Intentional omissions:
  - None yet
```

Turn 14, 21, 28, 35, 42, 49... same summary refreshed.

**State Tracking:**
```json
{
  "turn_count": 47,
  "reground_history": [
    { "turn": 7, "phase": "interview" },
    { "turn": 14, "phase": "tdd_red" },
    { "turn": 21, "phase": "tdd_green" },
    { "turn": 28, "phase": "verify" },
    { "turn": 35, "phase": "refactor" },
    { "turn": 42, "phase": "documentation" }
  ]
}
```

**Why Every 7 Turns:**
Research shows context dilution accelerates after 7-10 messages. Re-grounding every 7 turns keeps critical decisions fresh without overwhelming Claude with redundant information.

**What Gets Preserved:**
- Interview decisions (so implementation matches choices)
- Research sources (so verification can re-check)
- Intentional omissions (so they aren't flagged as gaps)
- Current phase (so Claude knows where it is)

---

## File Structure

```
@hustle-together/api-dev-tools v3.6.1
│
├── bin/
│   └── cli.js                         # NPX installer
│
├── commands/                          # 24 slash commands
│   ├── api-create.md                  # Main 12-phase workflow
│   ├── api-interview.md               # Structured interview
│   ├── api-research.md                # Adaptive research
│   ├── api-verify.md                  # Manual verification
│   ├── api-env.md                     # Environment check
│   ├── api-status.md                  # Progress tracking
│   ├── red.md                         # TDD Red phase
│   ├── green.md                       # TDD Green phase
│   ├── refactor.md                    # TDD Refactor phase
│   ├── cycle.md                       # Full TDD cycle
│   ├── spike.md                       # Exploration mode
│   ├── commit.md                      # Git commit
│   ├── pr.md                          # Pull request
│   ├── busycommit.md                  # Atomic commits
│   ├── plan.md                        # Implementation planning
│   ├── gap.md                         # Requirement gaps
│   ├── issue.md                       # GitHub issue workflow
│   ├── tdd.md                         # TDD reminder
│   ├── summarize.md                   # Session summary
│   ├── beepboop.md                    # AI attribution
│   ├── add-command.md                 # Create slash commands
│   ├── worktree-add.md                # Git worktree management
│   ├── worktree-cleanup.md            # Worktree cleanup
│   └── README.md                      # Command reference
│
├── hooks/                             # 18 Python enforcement hooks
│   │
│   │ # Session lifecycle
│   ├── session-startup.py             # Inject state on start
│   │
│   │ # User prompt processing
│   ├── enforce-external-research.py   # Detect API terms, require research
│   │
│   │ # PreToolUse (Write/Edit) - BLOCKING
│   ├── enforce-disambiguation.py      # Phase 0
│   ├── enforce-scope.py               # Phase 1
│   ├── enforce-research.py            # Phase 2
│   ├── enforce-interview.py           # Phase 3
│   ├── enforce-deep-research.py       # Phase 4
│   ├── enforce-schema.py              # Phase 5
│   ├── enforce-environment.py         # Phase 6
│   ├── enforce-tdd-red.py             # Phase 7
│   ├── verify-implementation.py       # Phase 8 helper
│   ├── enforce-verify.py              # Phase 9
│   ├── enforce-refactor.py            # Phase 10
│   ├── enforce-documentation.py       # Phase 11
│   │
│   │ # PostToolUse - TRACKING
│   ├── track-tool-use.py              # Log all tool usage
│   ├── periodic-reground.py           # Re-inject context every 7 turns
│   ├── verify-after-green.py          # Auto-trigger Phase 9
│   │
│   │ # Stop - BLOCKING
│   └── api-workflow-check.py          # Phase 12 (block if incomplete)
│
├── templates/
│   ├── api-dev-state.json             # 12 phases + phase_exit_confirmed
│   ├── settings.json                  # Hook registrations
│   ├── research-index.json            # 7-day freshness tracking
│   └── CLAUDE-SECTION.md              # CLAUDE.md injection
│
├── scripts/
│   ├── generate-test-manifest.ts      # Parse tests → manifest (NO LLM)
│   ├── extract-parameters.ts          # Extract Zod params
│   └── collect-test-results.ts        # Run tests → results
│
└── package.json                       # v3.6.1
```

---

## State File Structure

The `.claude/api-dev-state.json` file tracks workflow progress:

```json
{
  "version": "3.0.0",
  "endpoint": "brandfetch",
  "session_id": "abc123",
  "turn_count": 47,
  "phases": {
    "disambiguation": {
      "status": "complete",
      "user_question_asked": true,
      "user_selected": "Brandfetch REST API",
      "phase_exit_confirmed": true,
      "last_question_type": "exit_confirmation"
    },
    "scope": {
      "status": "complete",
      "confirmed": true,
      "scope_description": "Fetch brand assets with logo-only mode",
      "phase_exit_confirmed": true
    },
    "research_initial": {
      "status": "complete",
      "sources": [
        "context7:/brandfetch/api-docs",
        "websearch:brandfetch-api-2025",
        "websearch:brandfetch-rate-limits"
      ],
      "findings": {
        "base_url": "https://api.brandfetch.io/v2",
        "auth_method": "bearer_token",
        "rate_limit": "5/second"
      },
      "phase_exit_confirmed": true
    },
    "interview": {
      "status": "complete",
      "structured_question_count": 5,
      "decisions": {
        "response_format": "json_with_urls",
        "caching": "24h",
        "error_handling": "return_objects",
        "rate_limiting": "expose_headers",
        "assets": ["logos", "colors"]
      },
      "phase_exit_confirmed": true
    },
    "research_deep": {
      "status": "complete",
      "proposed_searches": ["error-format", "rate-headers", "auth-errors"],
      "approved_searches": ["error-format", "rate-headers", "auth-errors"],
      "executed_searches": ["error-format", "rate-headers", "auth-errors"],
      "findings": {
        "error_structure": { "documented": true },
        "rate_headers": ["X-Plan-RateLimit-Limit", "X-Plan-RateLimit-Remaining"]
      },
      "phase_exit_confirmed": true
    },
    "schema_creation": {
      "status": "complete",
      "schema_file": "src/lib/schemas/brandfetch.ts",
      "includes_interview_decisions": true,
      "includes_research_findings": true,
      "phase_exit_confirmed": true
    },
    "environment_check": {
      "status": "complete",
      "keys_found": ["BRANDFETCH_API_KEY"],
      "keys_missing": [],
      "validated": true,
      "phase_exit_confirmed": true
    },
    "tdd_red": {
      "status": "complete",
      "test_file": "src/app/api/v2/brandfetch/__tests__/route.test.ts",
      "test_count": 10,
      "scenarios": ["success", "errors", "edge_cases"],
      "all_failing": true,
      "phase_exit_confirmed": true
    },
    "tdd_green": {
      "status": "complete",
      "all_tests_passing": true,
      "coverage": "100%",
      "auto_triggered_verify": true
    },
    "verify": {
      "status": "complete",
      "re_researched": true,
      "gaps_found": 1,
      "gaps_fixed": 0,
      "intentional_omissions": ["include_fonts"],
      "comparison_table": { ... },
      "phase_exit_confirmed": true
    },
    "tdd_refactor": {
      "status": "complete",
      "changes_made": ["extracted_helpers", "added_docs"],
      "tests_still_passing": true,
      "phase_exit_confirmed": true
    },
    "documentation": {
      "status": "complete",
      "manifest_updated": true,
      "research_cached": true,
      "cache_freshness": "7 days",
      "phase_exit_confirmed": true
    }
  },
  "reground_history": [
    { "turn": 7, "phase": "interview" },
    { "turn": 14, "phase": "tdd_red" },
    { "turn": 21, "phase": "tdd_green" },
    { "turn": 28, "phase": "verify" }
  ]
}
```

---

## Installation

```bash
# Install in your project
npx @hustle-together/api-dev-tools --scope=project

# Team-wide auto-installation (add to package.json)
{
  "scripts": {
    "postinstall": "npx @hustle-together/api-dev-tools --scope=project"
  }
}
```

### Requirements

- **Node.js** 14.0.0+
- **Python 3** (for enforcement hooks)
- **Claude Code** CLI tool

---

## What's New in v3.6.1

### README Improvements
- Removed verbose ASCII workflow simulations (was 798 lines)
- Added comprehensive explanations for all 12 phases
- Detailed sections on Exit Code 2, Context7, phase_exit_confirmed
- Better mobile/narrow display formatting (50-char width ASCII)
- Collapsible sections for easier scanning

---

## What's New in v3.6.0

### Exit Code 2 for Stronger Enforcement

All blocking hooks now use `sys.exit(2)` instead of JSON deny. This creates an active feedback loop - Claude must respond to the error.

Upgraded hooks:
- `enforce-research.py`
- `enforce-interview.py`
- `api-workflow-check.py`
- `verify-implementation.py`

### phase_exit_confirmed Enforcement

Every phase requires an "exit confirmation" question and affirmative user response before advancing. Prevents Claude from self-answering questions.

---

## Links

- **NPM:** https://www.npmjs.com/package/@hustle-together/api-dev-tools
- **GitHub:** https://github.com/hustle-together/api-dev-tools
- **Demo:** https://hustle-together.github.io/api-dev-tools/demo/

---

## License

MIT

---

**Made with care for API developers using Claude Code**

*"Disambiguate, research, interview, verify, repeat"*
