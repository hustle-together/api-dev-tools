# Hustle Development Tools for Claude Code v3.9.2

**Interview-driven, research-first API and UI development with 100% phase enforcement**

## Quick Start

```bash
npx @hustle-together/api-dev-tools --scope=project
```

**Optional Installation Flags:**
```bash
# Install with optional development tools
npx @hustle-together/api-dev-tools --with-sandpack    # Live component editing
npx @hustle-together/api-dev-tools --with-storybook   # Component development env
npx @hustle-together/api-dev-tools --with-playwright  # E2E testing framework

# Or combine multiple flags
npx @hustle-together/api-dev-tools --with-sandpack --with-storybook
```

**What Gets Installed:**
- 10 Hustle slash commands (API + UI + Combine)
- 34 enforcement hooks (Python scripts)
- Multi-element state tracking (`api-dev-state.json`)
- **Central registry** (`registry.json`) - tracks all APIs, components, pages
- **Brand guide** (`BRAND_GUIDE.md`) - default branding template
- **Showcase pages** - `/dev-tools`, `/api-showcase`, `/ui-showcase` *(NEW)*
- **Component/Page templates** - Storybook stories, Playwright E2E tests *(NEW)*
- Research cache with 7-day freshness (`research/`)
- Session logging (`api-sessions/`)
- MCP server integrations (Context7, GitHub)

**Start Your First Workflow:**
```bash
/hustle-api-create my-endpoint     # For APIs
/hustle-ui-create                  # For UI components/pages (NEW)
```

## What's New in v3.9.2

### Animated Hero Header
All showcase pages now feature an animated 3D perspective grid hero:
- Canvas-based animation with depth effect
- Hustle red (#BA0C2F) accent highlights
- Dark mode support
- Configurable title and description

### Dev Tools Landing Page
New `/dev-tools` route with:
- Quick links to API Showcase and UI Showcase
- Registry stats (APIs, components, pages)
- Setup instructions for Storybook, Playwright, Sandpack

### Enhanced Showcase Components
Updated API and UI showcase with:
- Multi-endpoint selector (for APIs with `/tts`, `/voices`, `/models` sub-endpoints)
- Audio playback for TTS and voice API responses
- Query parameter support for GET requests
- Schema-driven default request bodies
- Full dark mode support
- Boxy 90s styling with 2px borders

### Updated BRAND_GUIDE.md
Complete Hustle Together brand guide with:
- Core colors (Hustle Red #BA0C2F)
- Status colors (success, warning, error)
- Typography and spacing guidelines
- Component styling rules
- Dark mode specifications
- Accessibility requirements

### CLI Flags for Optional Tools
New `--with-*` flags to auto-install development tools:
- `--with-sandpack` - Live component editing in UI Showcase
- `--with-storybook` - Component development environment
- `--with-playwright` - E2E testing framework

### Documentation Updates
- Added "Optional Development Tools" section explaining Storybook, Playwright, Sandpack
- Added "Showcase Pages" section with route table
- Added `--with-*` CLI flags documentation

---

## What's New in v3.9.0

### `/hustle-ui-create` Command
Create UI components and pages with the same 13-phase rigor as APIs:
```bash
/hustle-ui-create
```

This command:
1. **Mode Selection** - Choose Component (Storybook) or Page (Playwright E2E)
2. **Brand Guide Integration** - Asks "Use brand guide?" with time to update
3. **ShadCN Detection** - Phase 5 checks `src/components/ui/` for existing components
4. **4-Step Verification** - Desktop/tablet/mobile + brand + tests + memory/re-renders
5. **UI Showcase** - Auto-generated grid with modal preview at `/ui-showcase`

**Components created during page workflows ALSO get added to UI Showcase.**

### Brand Guide
Default template installed at `.claude/BRAND_GUIDE.md`:
```markdown
## Colors
- Primary: #000000
- Accent: #0066FF

## Component Styling
- Border radius: 8px
- Focus ring: 2px solid accent
```

During Phase 3, Claude prompts: *"NOW is the time to update your brand guide!"*

### 7 New UI Hooks
- `enforce-ui-disambiguation.py` - Block until component/page type clarified
- `enforce-brand-guide.py` - Inject brand guide during implementation
- `enforce-ui-interview.py` - Inject UI interview decisions
- `check-storybook-setup.py` - Verify Storybook before writing `.stories.tsx`
- `check-playwright-setup.py` - Verify Playwright before writing `.e2e.test.ts`
- `update-ui-showcase.py` - Auto-update UI Showcase registry
- `update-api-showcase.py` - Auto-update API Showcase registry

## What's in v3.8.0

### `/hustle-combine` Command
Combine existing APIs from the registry into orchestration endpoints:
```bash
/hustle-combine api
```

This command:
1. Reads from `registry.json` to show available APIs
2. Presents checkbox selection for 2+ APIs to combine
3. Runs a lighter 13-phase workflow (since APIs already exist)
4. Creates orchestration endpoints that call existing APIs

### Central Registry
All created elements are tracked in `.claude/registry.json`:
```json
{
  "apis": { "brandfetch": { "status": "complete" } },
  "components": { "Button": { "status": "complete" } },
  "pages": { "dashboard": { "status": "complete" } },
  "combined": { "brand-voice": { "combines": ["brandfetch", "elevenlabs"] } }
}
```

Registry is automatically populated when workflows complete Phase 13.

---

## Why This Exists

Building high-quality APIs with AI assistance requires consistency and rigor. We created this tool to solve a fundamental problem: **LLMs are powerful but unreliable without enforcement.**

This package was built with the goal of enabling teams to produce higher-quality, more consistent API implementations by enforcing a proven workflow that prevents common mistakes **before** they become production issues.

### The Core Problem

When developers use Claude (or any LLM) to build APIs, five predictable failure modes emerge:

1. **Outdated Documentation** - LLMs use training data from months or years ago. APIs change constantly - endpoints get deprecated, parameters are renamed, authentication methods evolve. Building from stale knowledge means broken code.

2. **Memory-Based Implementation** - Even after doing research, Claude often implements from memory by the time it gets to Phase 9 (writing code). It forgets the specific parameter names, error codes, and edge cases it discovered 20 messages ago.

3. **Self-Answering Questions** - Claude asks "Which format do you want?" then immediately answers "I'll use JSON" without waiting for your response. You lose control of the decision-making process.

4. **Context Dilution** - In a 50-message session, the context from Phase 4 (research) is diluted by Phase 10 (implementation). Critical details get lost. Claude starts guessing instead of referencing research.

5. **Skipped Steps** - Without enforcement, Claude jumps directly to implementation. No tests. No verification. No documentation. You get code that "works" but fails in production because edge cases weren't tested.

### Our Solution

**A 13-phase workflow enforced by Python hooks that BLOCK progress** until each phase is complete with explicit user approval. Not suggestions. Not guidelines. **Hard stops using Exit Code 2.**

This means:
- Claude cannot skip research
- Claude cannot answer its own questions
- Claude cannot implement before writing tests
- Claude cannot finish without verifying against current docs
- Claude cannot close without updating documentation

Every decision is tracked. Every phase is verified. Every step is enforced.

---

## The 13-Phase Workflow

When you run `/hustle-api-create brandfetch`, Claude is guided through 13 enforced phases. Each phase has three components:

1. **The Problem** - What goes wrong without enforcement
2. **The Solution** - How the phase prevents the problem
3. **The Hook** - Python script that blocks progress until complete

---

### Phase 1: Disambiguation

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
<summary><strong>Phase 2: Scope Confirmation</strong></summary>

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
<summary><strong>Phase 3: Initial Research</strong></summary>

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
<summary><strong>Phase 4: Structured Interview</strong></summary>

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
These decisions are saved and automatically injected during implementation phases. When Claude writes tests (Phase 8), it references `decisions.error_handling = "return_objects"` to know what to test. When implementing (Phase 9), it uses `decisions.caching = "24h"` to set cache headers.

Your choices drive the entire implementation. No guessing. No forgetting.

**Why This Matters:**
Questions based on research prevent impossible requirements. Interview answers become the contract for implementation. Claude can't forget your decisions because they're in state.

</details>

---

<details>
<summary><strong>Phase 5: Deep Research</strong></summary>

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
<summary><strong>Phase 6: Schema Creation</strong></summary>

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
<summary><strong>Phase 7: Environment Check</strong></summary>

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
<summary><strong>Phase 8: TDD Red (Write Failing Tests)</strong></summary>

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
<summary><strong>Phase 9: TDD Green (Make Tests Pass)</strong></summary>

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
<summary><strong>Phase 10: Verification (Re-Research After Green)</strong></summary>

**The Problem We're Solving:**
Even after researching in Phase 3, Claude implements from memory in Phase 9. Twenty messages have passed. Context has diluted. Claude forgets specific details:
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
<summary><strong>Phase 11: TDD Refactor</strong></summary>

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
<summary><strong>Phase 12: Documentation</strong></summary>

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
<summary><strong>Phase 13: Completion</strong></summary>

**The Problem We're Solving:**
How do you know everything is actually done? Claude might claim "finished" but skip phases:
- Skipped verification (Phase 10)
- Forgot documentation (Phase 12)
- Never wrote tests (Phase 8)

Without verification, "done" means "Claude stopped talking" not "workflow complete."

**How This Phase Works:**
The `api-workflow-check.py` hook runs on Stop event (when you try to close Claude):

```
Checking workflow completion...

Phase 1: Disambiguation       ✅ Complete
Phase 2: Scope                ✅ Complete
Phase 3: Research             ✅ Complete (2 sources)
Phase 4: Interview            ✅ Complete (5 questions)
Phase 5: Deep Research        ✅ Complete (3 searches)
Phase 6: Schema               ✅ Complete
Phase 7: Environment          ✅ Complete (1 key)
Phase 8: TDD Red              ✅ Complete (10 tests)
Phase 9: TDD Green            ✅ Complete (10/10 passing)
Phase 10: Verification        ✅ Complete (1 omission)
Phase 11: Refactor            ✅ Complete
Phase 12: Documentation       ✅ Complete
Phase 13: Completion          ✅ In progress

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
print("Run /hustle-api-research first, then try again.", file=sys.stderr)
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
- `enforce-research.py` - Forces `/hustle-api-research` before implementation
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
Long sessions lose context. Phase 4 (interview) happens at turn 15. Phase 10 (verification) happens at turn 47. By turn 47, Claude has forgotten your interview decisions from turn 15.

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

## Commands Reference

### All Hustle API Commands (8 Commands)

<details>
<summary><strong>/hustle-api-create</strong> - Complete 13-phase API development workflow</summary>

**Usage:** `/hustle-api-create [endpoint-name]`

**When to Use:**
- Starting a brand new API endpoint from scratch
- Building an integration with an external service (Brandfetch, Stripe, ElevenLabs, etc.)
- When you want the full guided workflow with all enforcements

**How It Works:**
1. Runs all 13 phases automatically in sequence
2. Each phase has enforcement hooks that block progress until requirements are met
3. Loops back if verification fails at any checkpoint
4. Tracks all progress in `.claude/api-dev-state.json`

**Example 1: Creating a new Brandfetch integration**
```bash
/hustle-api-create brandfetch
```
Output:
```
Starting 13-phase API development workflow for: brandfetch

Phase 1: DISAMBIGUATION
━━━━━━━━━━━━━━━━━━━━━━━━
The term "brandfetch" could refer to:
  1. Brandfetch API (brand asset retrieval service)
  2. A generic "fetch brand" operation
  3. Custom brand fetching logic

Which interpretation is correct? [1/2/3]
```

**Example 2: Creating a payment processing endpoint**
```bash
/hustle-api-create stripe-checkout
```
Output:
```
Starting 13-phase API development workflow for: stripe-checkout

Phase 1: DISAMBIGUATION
━━━━━━━━━━━━━━━━━━━━━━━━
"stripe-checkout" interpretation:
  1. Stripe Checkout Sessions API
  2. Stripe Payment Intents with custom checkout
  3. Stripe Elements integration

Please clarify which Stripe feature you're implementing.
```

**Common Use Cases:**
- Integrating third-party APIs (payment, AI, data services)
- Building new V2 API endpoints with full test coverage
- Ensuring documentation-driven development

</details>

<details>
<summary><strong>/hustle-api-status</strong> - Track progress through all phases</summary>

**Usage:** `/hustle-api-status [endpoint-name]` or `/hustle-api-status --all`

**When to Use:**
- Checking where you are in a workflow
- Seeing all in-progress endpoints across your project
- Verifying which phases are complete vs pending

**How It Works:**
1. Reads `.claude/api-dev-state.json`
2. Parses phase completion status for each endpoint
3. Displays visual progress indicator
4. Shows test counts and coverage for complete endpoints

**Example 1: Check specific endpoint status**
```bash
/hustle-api-status brandfetch
```
Output:
```
📊 Status: brandfetch

Phase Progress:
  ✅ Phase 1:  Disambiguation     (complete)
  ✅ Phase 2:  Scope              (complete)
  ✅ Phase 3:  Initial Research   (complete)
  ✅ Phase 4:  Interview          (complete)
  ✅ Phase 5:  Deep Research      (complete)
  ✅ Phase 6:  Schema             (complete)
  ✅ Phase 7:  Environment        (complete)
  🔄 Phase 8:  TDD Red            (in_progress)
  ⏳ Phase 9:  TDD Green          (not_started)
  ⏳ Phase 10: Verify             (not_started)
  ⏳ Phase 11: Refactor           (not_started)
  ⏳ Phase 12: Documentation      (not_started)
  ⏳ Phase 13: Completion         (not_started)

Progress: 7/13 phases (54%)
Current Phase: TDD Red - Writing failing tests
```

**Example 2: Check all endpoints**
```bash
/hustle-api-status --all
```
Output:
```
📊 V2 API Implementation Status

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ COMPLETE (1)
  • /api/v2/brandfetch (10 tests)

🚧 IN PROGRESS (2)
  • /api/v2/elevenlabs (Phase 6: Schema)
  • /api/v2/stripe (Phase 4: Interview)

❌ NOT STARTED (0)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary:
  Total endpoints: 3
  Complete: 1 (33%)
  In progress: 2 (67%)
```

**Common Use Cases:**
- Daily standup: "What endpoints am I working on?"
- Before resuming work: "Where did I leave off?"
- Project overview: "How much API work is done?"

</details>

<details>
<summary><strong>/hustle-api-interview</strong> - Run structured interview from research findings</summary>

**Usage:** `/hustle-api-interview [endpoint-name]`

**When to Use:**
- After completing initial research (Phase 3)
- When you need to make decisions about implementation scope
- To document user preferences for schema generation

**How It Works:**
1. Reads research findings from Phase 3
2. Generates questions BASED ON discovered parameters (not generic templates)
3. Records decisions in state file
4. Decisions are injected during TDD phases via `enforce-interview.py`

**Example 1: Interview for Brandfetch endpoint**
```bash
/hustle-api-interview brandfetch
```
Output:
```
📋 Interview: brandfetch
Based on research, I have 5 questions about your implementation:

Question 1 of 5 (enum):
━━━━━━━━━━━━━━━━━━━━━━━
Research found Brandfetch supports multiple output formats.
Which formats do you want to support?

  [a] JSON only (simplest, most common)
  [b] JSON + SVG (adds vector logo support)
  [c] All formats (JSON, SVG, PNG)

Your choice: b

✓ Recorded: format = ["json", "svg"]

Question 2 of 5 (boolean):
━━━━━━━━━━━━━━━━━━━━━━━
Research found Brandfetch can return brand colors.
Do you need color extraction? [y/n]: y

✓ Recorded: include_colors = true
```

**Example 2: Interview discovers optional features**
```bash
/hustle-api-interview stripe-checkout
```
Output:
```
📋 Interview: stripe-checkout

Question 1 of 6 (enum):
━━━━━━━━━━━━━━━━━━━━━━━
Research found Stripe supports these payment modes:
  [a] payment (one-time)
  [b] subscription (recurring)
  [c] setup (save card for later)
  [d] all of the above

Your choice: d

Question 2 of 6 (continuous):
━━━━━━━━━━━━━━━━━━━━━━━
Research found checkout sessions can specify a success URL.
What should the default success redirect be?

Your answer: /checkout/success?session_id={CHECKOUT_SESSION_ID}

✓ Recorded: success_url = "/checkout/success?session_id={CHECKOUT_SESSION_ID}"
```

**Common Use Cases:**
- Making scope decisions before implementation
- Documenting why certain features were included/excluded
- Ensuring schema matches user requirements, not assumptions

</details>

<details>
<summary><strong>/hustle-api-research</strong> - Run adaptive research with Context7 and WebSearch</summary>

**Usage:** `/hustle-api-research [library-or-service-name]`

**When to Use:**
- Before starting any new API integration
- When documentation might have changed (research >7 days old)
- To discover ALL available parameters, not just common ones

**How It Works:**
1. Uses Context7 to fetch current library documentation
2. Uses WebSearch for official docs and recent updates
3. Proposes additional searches based on findings (adaptive, not shotgun)
4. Caches results in `.claude/research/[endpoint]/`
5. Updates freshness index for 7-day tracking

**Example 1: Research Brandfetch API**
```bash
/hustle-api-research brandfetch
```
Output:
```
🔍 Research: brandfetch

Step 1: Context7 lookup
━━━━━━━━━━━━━━━━━━━━━━━
Searching for "brandfetch" in Context7...
Found: /brandfetch/brandfetch-brand-api

Fetching documentation...
✓ Retrieved 2,847 tokens of documentation

Step 2: WebSearch (3 queries)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
[1] "Brandfetch API documentation 2025"
    → Found: developers.brandfetch.com/docs
    → Key finding: API v2 with new response format

[2] "Brandfetch API parameters reference"
    → Found: Full parameter list including undocumented ones
    → Key finding: 'source' parameter for filtering

[3] "Brandfetch API rate limits authentication"
    → Found: Rate limit headers, API key format
    → Key finding: 1000 requests/day on free tier

Step 3: Propose additional searches
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Based on findings, I recommend:
  [a] "Brandfetch error codes handling"
  [b] "Brandfetch webhook integration"
  [c] Skip additional research

Approve searches? [a/b/c/skip]: a

Research cached to: .claude/research/brandfetch/CURRENT.md
```

**Example 2: Research with stale cache warning**
```bash
/hustle-api-research elevenlabs
```
Output:
```
⚠️ Existing research found (12 days old)

Last researched: 2025-11-29
Research is STALE (threshold: 7 days)

Options:
  [1] Re-research from scratch (recommended)
  [2] View existing research
  [3] Use existing + supplement

Your choice: 1

🔍 Re-researching elevenlabs...
```

**Common Use Cases:**
- Starting new integration: Always research first
- API updated: Re-research to catch changes
- Debugging issues: Research error handling patterns

</details>

<details>
<summary><strong>/hustle-api-verify</strong> - Re-research and verify implementation matches docs</summary>

**Usage:** `/hustle-api-verify [endpoint-name]`

**When to Use:**
- After completing TDD Green phase
- When you suspect implementation might not match latest docs
- Before marking an endpoint as complete

**How It Works:**
1. Re-runs research queries from Phase 3/5
2. Compares current implementation against fresh docs
3. Identifies gaps (missing params, wrong types, etc.)
4. Offers to fix gaps or document as intentional omissions

**Example 1: Verify finds no gaps**
```bash
/hustle-api-verify brandfetch
```
Output:
```
🔍 Verification: brandfetch

Re-researching documentation...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Context7: Documentation unchanged
✓ WebSearch: No breaking changes found

Comparing implementation...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Schema file: src/lib/schemas/brandfetch.ts
Route file: src/app/api/v2/brandfetch/route.ts

Parameters in docs: 8
Parameters implemented: 8
Coverage: 100%

✅ VERIFICATION PASSED
No gaps found. Implementation matches documentation.
```

**Example 2: Verify finds gaps**
```bash
/hustle-api-verify stripe-checkout
```
Output:
```
🔍 Verification: stripe-checkout

Re-researching documentation...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ Found updates since last research!

Comparing implementation...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Parameters in docs: 12
Parameters implemented: 10
Coverage: 83%

❌ GAPS FOUND (2):

1. Missing parameter: 'phone_number_collection'
   - Docs: Optional object to collect phone numbers
   - Action: [Add / Skip / Mark intentional]

2. Missing parameter: 'custom_text'
   - Docs: Custom text for checkout UI
   - Action: [Add / Skip / Mark intentional]

For gap 1, choose action: skip

Recorded as intentional omission:
  "phone_number_collection: Not needed for MVP"
```

**Common Use Cases:**
- Pre-completion check: Verify before Phase 13
- Post-deployment audit: Did we miss anything?
- API update response: Check if changes affect us

</details>

<details>
<summary><strong>/hustle-api-env</strong> - Verify API keys and environment setup</summary>

**Usage:** `/hustle-api-env [endpoint-name]`

**When to Use:**
- Before TDD phases to ensure keys are available
- When debugging "unauthorized" or "missing key" errors
- Setting up a new developer's environment

**How It Works:**
1. Reads required keys from research/interview findings
2. Checks server environment variables
3. Checks NEXT_PUBLIC_ client variables
4. Reports missing keys with setup instructions

**Example 1: All keys present**
```bash
/hustle-api-env brandfetch
```
Output:
```
🔑 Environment Check: brandfetch

Required API Keys:
━━━━━━━━━━━━━━━━━
✅ BRANDFETCH_API_KEY
   Location: Server environment
   Value: bf_live_****...****

Optional Keys:
━━━━━━━━━━━━━━━━━
✅ NEXT_PUBLIC_BRANDFETCH_API_KEY (client fallback)

Environment Status: READY
All required keys are configured.
```

**Example 2: Missing keys**
```bash
/hustle-api-env stripe-checkout
```
Output:
```
🔑 Environment Check: stripe-checkout

Required API Keys:
━━━━━━━━━━━━━━━━━
❌ STRIPE_SECRET_KEY
   Status: NOT FOUND
   Setup: Add to .env.local:
          STRIPE_SECRET_KEY=sk_test_...

✅ STRIPE_PUBLISHABLE_KEY
   Location: Server environment

Optional Keys:
━━━━━━━━━━━━━━━━━
❌ STRIPE_WEBHOOK_SECRET
   Status: NOT FOUND (optional for local dev)

Environment Status: NOT READY
Missing 1 required key. Add to .env.local before continuing.
```

**Common Use Cases:**
- New team member setup: "What keys do I need?"
- CI/CD debugging: "Why are tests failing?"
- Pre-implementation check: Avoid surprises during TDD

</details>

<details>
<summary><strong>/hustle-api-continue</strong> - Resume interrupted workflow</summary>

**Usage:** `/hustle-api-continue [endpoint-name]`

**When to Use:**
- After session timeout or computer restart
- Resuming work the next day
- Picking up where a colleague left off

**How It Works:**
1. Reads state file for endpoint
2. Identifies last completed phase
3. Shows summary of completed work
4. Offers to resume from next phase

**Example 1: Resume after interruption**
```bash
/hustle-api-continue brandfetch
```
Output:
```
🔄 Found interrupted workflow: brandfetch

Status: in_progress (started 2 hours ago)

Completed Phases:
  ✅ Phase 1: Disambiguation
  ✅ Phase 2: Scope
  ✅ Phase 3: Initial Research
  ✅ Phase 4: Interview
  ✅ Phase 5: Deep Research
  ✅ Phase 6: Schema
  ✅ Phase 7: Environment
  ✅ Phase 8: TDD Red

Next Phase: Phase 9 (TDD Green)

Interview decisions preserved:
  • format: ["json", "svg"]
  • include_colors: true
  • include_fonts: false

Resume from Phase 9? [Yes / Start over / Pick phase]
```

**Example 2: Modify completed endpoint**
```bash
/hustle-api-continue brandfetch --from=interview
```
Output:
```
🔄 Resetting brandfetch to Phase 4

Phases being reset:
  ↩️ Phase 4: Interview (will re-run)
  ↩️ Phase 5: Deep Research (will re-run)
  ↩️ Phase 6: Schema (will re-run)
  ↩️ Phase 7-13: (will re-run)

Phases preserved:
  ✅ Phase 1: Disambiguation
  ✅ Phase 2: Scope
  ✅ Phase 3: Initial Research

This will allow you to make different interview choices.
Proceed? [y/n]
```

**Common Use Cases:**
- Session interrupted: Resume seamlessly
- Adding features: Reset to interview, add new choices
- Bug discovered: Reset to appropriate phase

</details>

<details>
<summary><strong>/hustle-api-sessions</strong> - Browse and export saved session logs</summary>

**Usage:** `/hustle-api-sessions [--list|--view|--export]`

**When to Use:**
- Reviewing what happened in a previous workflow
- Creating documentation from session history
- Sharing workflow logs with team members

**How It Works:**
1. Reads `.claude/api-sessions/` directory
2. Lists all saved sessions with metadata
3. Can display full conversation or export to PDF/HTML

**Example 1: List all sessions**
```bash
/hustle-api-sessions --list
```
Output:
```
📁 Saved API Development Sessions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. brandfetch_2025-12-11_15-30-00
   Status: Complete
   Duration: 2h 34m
   Phases: 13/13
   Files: 4 created, 2 modified

2. elevenlabs_2025-12-10_09-15-00
   Status: Interrupted (Phase 8)
   Duration: 1h 12m
   Phases: 7/13
   Files: 2 created

3. stripe_2025-12-09_14-00-00
   Status: In Progress (Phase 4)
   Duration: 45m
   Phases: 3/13
   Files: 0 created

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use --view [session] to see details
Use --export [session] [format] to export
```

**Example 2: View specific session**
```bash
/hustle-api-sessions --view brandfetch_2025-12-11_15-30-00
```
Output shows full session transcript with timestamps.

**Example 3: Export session**
```bash
/hustle-api-sessions --export brandfetch_2025-12-11_15-30-00 html
```
Output:
```
Exporting session to HTML...
✓ Created: .claude/api-sessions/brandfetch_2025-12-11_15-30-00/export.html

Open in browser to view formatted session log.
```

**Common Use Cases:**
- Documentation: Export completed workflow for records
- Learning: Review how an endpoint was built
- Debugging: Find where something went wrong

</details>

### All TDD Commands (6 Commands)

<details>
<summary><strong>/red</strong> - Write ONE failing test first</summary>

**Usage:** `/red [description of what to test]`

**When to Use:**
- Starting implementation of a new feature
- Before writing ANY production code
- When you know what behavior you want but haven't coded it yet

**How It Works:**
1. You describe what should be tested
2. Claude writes exactly ONE test that fails
3. The test defines "success" before any code exists
4. Prevents over-engineering by setting a clear target

**Example 1: Testing domain validation**
```bash
/red write test for domain validation in brandfetch schema
```
Output:
```
🔴 RED PHASE: Writing failing test

Creating test file: src/lib/schemas/__tests__/brandfetch.test.ts

describe('BrandfetchSchema', () => {
  describe('domain validation', () => {
    it('should accept valid domain format', () => {
      const result = BrandfetchSchema.safeParse({
        domain: 'example.com'
      });
      expect(result.success).toBe(true);
    });
  });
});

Running test...
❌ FAIL: Cannot find module '../brandfetch'

Test is failing as expected. Ready for /green phase.
```

**Example 2: Testing API response handling**
```bash
/red test that brandfetch endpoint returns 400 for missing domain
```
Output:
```
🔴 RED PHASE: Writing failing test

Adding to: src/app/api/v2/brandfetch/__tests__/brandfetch.api.test.ts

it('should return 400 when domain is missing', async () => {
  const response = await POST(
    new Request('http://localhost/api/v2/brandfetch', {
      method: 'POST',
      body: JSON.stringify({})
    })
  );
  expect(response.status).toBe(400);
  const data = await response.json();
  expect(data.error).toContain('domain');
});

Running test...
❌ FAIL: POST is not defined

Test is failing. Proceed to /green to implement.
```

**Common Use Cases:**
- Feature development: Define expected behavior first
- Bug fixes: Write test that reproduces the bug
- Refactoring prep: Lock down current behavior before changing

</details>

<details>
<summary><strong>/green</strong> - Write minimal code to pass the failing test</summary>

**Usage:** `/green [implementation description]`

**When to Use:**
- ONLY after `/red` has created a failing test
- When you have a clear, failing test to satisfy
- To implement the simplest possible solution

**How It Works:**
1. Reads the failing test from `/red` phase
2. Writes the MINIMUM code to make it pass
3. No extra features, no premature optimization
4. Runs tests to confirm green status

**Example 1: Implementing domain validation**
```bash
/green implement domain validation for brandfetch
```
Output:
```
🟢 GREEN PHASE: Making test pass

Reading failing test...
Test expects: BrandfetchSchema to validate domain format

Writing minimal implementation:

// src/lib/schemas/brandfetch.ts
import { z } from 'zod';

export const BrandfetchSchema = z.object({
  domain: z.string().min(1)
});

Running test...
✅ PASS: should accept valid domain format

All tests passing. Ready for /refactor or next /red.
```

**Example 2: Implementing API endpoint**
```bash
/green implement POST handler for brandfetch
```
Output:
```
🟢 GREEN PHASE: Making test pass

Reading failing test...
Test expects: 400 response when domain missing

Writing minimal implementation:

// src/app/api/v2/brandfetch/route.ts
import { NextResponse } from 'next/server';
import { BrandfetchSchema } from '@/lib/schemas/brandfetch';

export async function POST(request: Request) {
  const body = await request.json();
  const result = BrandfetchSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: 'domain is required' },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}

Running test...
✅ PASS: should return 400 when domain is missing

Tests green. Continue with /red for next behavior or /refactor.
```

**Common Use Cases:**
- Passing a specific failing test
- Implementing minimal feature set
- Avoiding over-engineering temptation

</details>

<details>
<summary><strong>/refactor</strong> - Clean up code while keeping tests green</summary>

**Usage:** `/refactor [description of refactoring]`

**When to Use:**
- After tests are passing (green)
- When you see duplication or messy code
- To improve readability without changing behavior

**How It Works:**
1. Confirms all tests are currently passing
2. Makes structural improvements to code
3. Runs tests after EACH change to ensure still green
4. Never changes behavior, only structure

**Example 1: Extract helper function**
```bash
/refactor extract domain validation to reusable helper
```
Output:
```
🔵 REFACTOR PHASE: Improving structure

Confirming tests pass... ✅ All green

Current code:
  domain: z.string().min(1)

Refactoring to:
  // src/lib/validators/domain.ts
  export const domainSchema = z.string()
    .min(1, 'Domain is required')
    .regex(/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i,
      'Invalid domain format');

  // src/lib/schemas/brandfetch.ts
  import { domainSchema } from '@/lib/validators/domain';

  export const BrandfetchSchema = z.object({
    domain: domainSchema
  });

Running tests...
✅ All tests still passing

Refactoring complete. Structure improved, behavior unchanged.
```

**Example 2: Improve error messages**
```bash
/refactor add descriptive error messages to brandfetch schema
```
Output:
```
🔵 REFACTOR PHASE: Improving structure

Confirming tests pass... ✅ All green

Adding descriptive messages:

export const BrandfetchSchema = z.object({
  domain: domainSchema,
  format: z.enum(['json', 'svg']).optional()
    .describe('Output format for brand assets'),
  include_colors: z.boolean().optional()
    .default(true)
    .describe('Whether to include brand color palette')
});

Running tests...
✅ All tests still passing

Refactoring complete.
```

**Common Use Cases:**
- DRY violations: Extract repeated code
- Readability: Rename variables, add comments
- Structure: Move code to appropriate files

</details>

<details>
<summary><strong>/cycle</strong> - Complete Red → Green → Refactor loop</summary>

**Usage:** `/cycle [feature description]`

**When to Use:**
- Implementing a complete feature end-to-end
- When you want the full TDD experience in one command
- For well-defined, focused features

**How It Works:**
1. RED: Writes failing test for the feature
2. GREEN: Implements minimal code to pass
3. REFACTOR: Cleans up the implementation
4. Confirms all tests pass at the end

**Example 1: Add caching feature**
```bash
/cycle add response caching to brandfetch endpoint
```
Output:
```
🔄 TDD CYCLE: add response caching to brandfetch endpoint

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 RED PHASE
━━━━━━━━━━━
Writing test for caching behavior...

it('should return cached response for same domain', async () => {
  // First request
  await POST(createRequest({ domain: 'example.com' }));

  // Second request should be faster (cached)
  const start = Date.now();
  await POST(createRequest({ domain: 'example.com' }));
  const duration = Date.now() - start;

  expect(duration).toBeLessThan(50); // Cached = fast
});

Running test... ❌ FAIL (no caching implemented)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟢 GREEN PHASE
━━━━━━━━━━━━━
Implementing minimal caching...

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

export async function POST(request: Request) {
  const { domain } = await request.json();

  // Check cache
  const cached = cache.get(domain);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  // ... fetch and cache result
}

Running test... ✅ PASS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔵 REFACTOR PHASE
━━━━━━━━━━━━━━━━━
Extracting cache to utility...

// src/lib/cache/memory-cache.ts
export class MemoryCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();

  constructor(private ttl: number) {}

  get(key: string): T | null { ... }
  set(key: string, data: T): void { ... }
}

Running tests... ✅ All passing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ CYCLE COMPLETE
  - Test written and passing
  - Feature implemented
  - Code refactored
```

**Example 2: Add validation feature**
```bash
/cycle add email validation to user preferences endpoint
```

**Common Use Cases:**
- Feature implementation: Complete feature in one go
- Learning TDD: See the full cycle in action
- Rapid development: Efficient for small features

</details>

<details>
<summary><strong>/spike</strong> - Exploratory coding without TDD constraints</summary>

**Usage:** `/spike [exploration description]`

**When to Use:**
- Exploring unfamiliar API before committing to implementation
- Prototyping to understand problem space
- When you don't know WHAT to test yet

**How It Works:**
1. Creates experimental code without tests
2. Focuses on learning and discovery
3. Code is intentionally throwaway
4. Informs future TDD cycles with knowledge gained

**Example 1: Explore external API**
```bash
/spike explore Brandfetch API response structure
```
Output:
```
🔬 SPIKE: Exploratory coding (no tests)

⚠️ This code is for exploration only. Delete before implementing.

Creating: src/experiments/brandfetch-spike.ts

import fetch from 'node-fetch';

async function exploreBrandfetch() {
  const response = await fetch('https://api.brandfetch.io/v2/brands/example.com', {
    headers: { 'Authorization': `Bearer ${process.env.BRANDFETCH_API_KEY}` }
  });

  const data = await response.json();

  console.log('Response structure:');
  console.log(JSON.stringify(data, null, 2));

  console.log('\nAvailable fields:', Object.keys(data));
  console.log('Logo formats:', data.logos?.map(l => l.format));
  console.log('Color count:', data.colors?.length);
}

exploreBrandfetch();

Running spike...

Response structure:
{
  "name": "Example Inc",
  "domain": "example.com",
  "logos": [
    { "format": "svg", "src": "..." },
    { "format": "png", "src": "..." }
  ],
  "colors": [
    { "hex": "#FF5733", "type": "primary" }
  ]
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Spike Findings:
- Response includes logos array with format/src
- Colors have hex and type properties
- Main fields: name, domain, logos, colors, fonts

Ready to delete spike and start /red with this knowledge.
```

**Example 2: Prototype caching approach**
```bash
/spike prototype different caching strategies
```

**Common Use Cases:**
- API exploration: Understand response shapes
- Algorithm testing: Try different approaches
- Learning: Understand a library before using it

</details>

<details>
<summary><strong>/tdd</strong> - Remind about TDD approach and get back on track</summary>

**Usage:** `/tdd [optional context]`

**When to Use:**
- When you've drifted from TDD discipline
- To get guidance on next TDD step
- When unsure whether to /red, /green, or /refactor

**How It Works:**
1. Analyzes current code and test state
2. Identifies where you are in the TDD cycle
3. Recommends next action
4. Reminds of TDD principles

**Example 1: Lost track of where I am**
```bash
/tdd
```
Output:
```
📋 TDD Status Check

Current State Analysis:
━━━━━━━━━━━━━━━━━━━━━
Test file: src/lib/schemas/__tests__/brandfetch.test.ts
  - 5 tests total
  - 4 passing ✅
  - 1 failing ❌

Failing test:
  "should validate domain has valid TLD"
  Expected: validation error for "example"
  Received: validation passed

Implementation file: src/lib/schemas/brandfetch.ts
  - Has domain validation
  - Missing TLD check

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 You are in: RED phase (test failing)

Recommended action: /green implement TLD validation

TDD Reminder:
  🔴 RED: Write failing test (DONE)
  🟢 GREEN: Make it pass (← YOU ARE HERE)
  🔵 REFACTOR: Clean up
```

**Example 2: Check before writing code**
```bash
/tdd I want to add format parameter support
```
Output:
```
📋 TDD Guidance

You want to: add format parameter support

Current test coverage for format: NONE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ TDD VIOLATION WARNING

You're about to write code without a failing test!

Recommended action: /red write test for format parameter

Example test to write:
  it('should accept format parameter with valid values', () => {
    const result = BrandfetchSchema.safeParse({
      domain: 'example.com',
      format: 'svg'
    });
    expect(result.success).toBe(true);
  });

Start with /red, then /green, then /refactor.
```

**Common Use Cases:**
- Discipline reminder: Stay on TDD track
- Status check: Where am I in the cycle?
- Guidance: What should I do next?

</details>

### All Git Commands (6 Commands)

<details>
<summary><strong>/commit</strong> - Create semantic git commit with AI-generated message</summary>

**Usage:** `/commit [optional description]`

**When to Use:**
- After completing a feature or fix
- When ready to save your work to git history
- To generate consistent, semantic commit messages

**How It Works:**
1. Runs `git status` and `git diff` to analyze changes
2. Reads recent commit history for style consistency
3. Generates semantic commit message (feat/fix/docs/refactor/test)
4. Creates commit with proper formatting and attribution

**Example 1: Standard feature commit**
```bash
/commit
```
Output:
```
📝 Analyzing changes...

Staged changes:
  M src/lib/schemas/brandfetch.ts
  A src/lib/schemas/__tests__/brandfetch.test.ts
  M src/app/api/v2/brandfetch/route.ts

Generating commit message...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

feat(brandfetch): add domain validation with Zod schema

- Add BrandfetchSchema with domain, format, and include_colors fields
- Implement POST handler with validation error responses
- Add comprehensive test coverage for schema validation

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create this commit? [y/n]: y

✅ Commit created: abc1234
```

**Example 2: Commit with custom context**
```bash
/commit fixes the rate limiting bug reported in issue #42
```
Output:
```
📝 Analyzing changes...

fix(brandfetch): resolve rate limiting causing 429 errors

Addresses issue #42 where requests were failing due to
improper rate limit handling. Added exponential backoff
and request queuing.

🤖 Generated with Claude Code
```

**Common Use Cases:**
- Feature complete: Commit the finished work
- Bug fixed: Document what was resolved
- Refactoring done: Explain structural changes

</details>

<details>
<summary><strong>/pr</strong> - Create pull request with AI-generated description</summary>

**Usage:** `/pr [optional title and description]`

**When to Use:**
- After pushing your branch to remote
- When ready for code review
- To create well-documented pull requests

**How It Works:**
1. Checks branch status and remote tracking
2. Analyzes all commits since branching from main
3. Generates PR title and description with summary
4. Creates PR using GitHub CLI (gh)

**Example 1: Standard PR creation**
```bash
/pr
```
Output:
```
📋 Creating Pull Request...

Branch: feature/brandfetch-integration
Base: main
Commits: 5 commits ahead of main

Analyzing changes:
  - src/lib/schemas/brandfetch.ts (new)
  - src/app/api/v2/brandfetch/route.ts (new)
  - src/app/api/v2/brandfetch/__tests__/brandfetch.api.test.ts (new)
  - package.json (modified - new dependency)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Title: feat(api): Add Brandfetch brand asset integration

## Summary
- Add /api/v2/brandfetch endpoint for brand asset retrieval
- Implement Zod schema validation with domain, format options
- Add comprehensive test suite with 10 test cases
- Support JSON and SVG output formats

## Test plan
- [ ] Run `pnpm test -- brandfetch` to verify all tests pass
- [ ] Test with valid domain: `curl -X POST .../brandfetch -d '{"domain":"google.com"}'`
- [ ] Test validation: Send request without domain, expect 400
- [ ] Verify rate limiting headers in response

🤖 Generated with Claude Code

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create this PR? [y/n]: y

✅ PR created: https://github.com/user/repo/pull/123
```

**Example 2: PR with custom description**
```bash
/pr Adds Stripe checkout integration for subscription billing
```

**Common Use Cases:**
- Feature ready for review
- Bug fix needs verification
- Documentation updates to share

</details>

<details>
<summary><strong>/busycommit</strong> - Create multiple atomic commits for complex changes</summary>

**Usage:** `/busycommit [optional description]`

**When to Use:**
- When you have many changes that should be separate commits
- After a long coding session with multiple features
- To create clean, reviewable git history

**How It Works:**
1. Analyzes all staged and unstaged changes
2. Groups changes by logical unit (file, feature, type)
3. Creates separate commits for each group
4. Maintains atomic, reviewable commit history

**Example 1: Split large changeset**
```bash
/busycommit
```
Output:
```
📦 Analyzing changes for atomic commits...

Found changes across 8 files in 3 logical groups:

Group 1: Schema changes
  M src/lib/schemas/brandfetch.ts
  A src/lib/schemas/stripe.ts

Group 2: API routes
  A src/app/api/v2/brandfetch/route.ts
  A src/app/api/v2/stripe/route.ts

Group 3: Tests
  A src/lib/schemas/__tests__/brandfetch.test.ts
  A src/lib/schemas/__tests__/stripe.test.ts
  A src/app/api/v2/brandfetch/__tests__/brandfetch.api.test.ts
  A src/app/api/v2/stripe/__tests__/stripe.api.test.ts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Creating 3 atomic commits:

[1/3] feat(schemas): add Brandfetch and Stripe Zod schemas
      ✅ Committed: abc1234

[2/3] feat(api): add Brandfetch and Stripe v2 endpoints
      ✅ Committed: def5678

[3/3] test: add comprehensive tests for new endpoints
      ✅ Committed: ghi9012

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Created 3 atomic commits
```

**Example 2: With custom grouping hint**
```bash
/busycommit separate the refactoring from new features
```

**Common Use Cases:**
- End of day: Clean up messy work session
- Before PR: Make history reviewable
- Large refactor: Show progression of changes

</details>

<details>
<summary><strong>/issue</strong> - Start work from GitHub issue</summary>

**Usage:** `/issue [issue-number or URL]`

**When to Use:**
- Starting work on a tracked issue
- When you want context from the issue description
- To automatically link commits to issues

**How It Works:**
1. Fetches issue details from GitHub
2. Parses requirements and acceptance criteria
3. Creates feature branch named after issue
4. Sets up tracking for automated closing

**Example 1: Start from issue number**
```bash
/issue 42
```
Output:
```
📋 Fetching issue #42...

Issue: Add Brandfetch integration for brand assets
Labels: enhancement, api
Assignee: @username

Description:
  We need an endpoint to fetch brand assets (logos, colors)
  from the Brandfetch API.

  Acceptance criteria:
  - [ ] POST /api/v2/brandfetch endpoint
  - [ ] Accept domain parameter
  - [ ] Return logo URLs and brand colors
  - [ ] Handle rate limiting gracefully

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Creating branch: feature/42-brandfetch-integration

✅ Branch created and checked out
✅ Issue #42 will be linked in commits

Ready to start. Suggested first step:
  /hustle-api-create brandfetch
```

**Example 2: Start from issue URL**
```bash
/issue https://github.com/user/repo/issues/42
```

**Common Use Cases:**
- Sprint work: Start from backlog items
- Bug fixes: Work from reported issues
- Feature requests: Implement user suggestions

</details>

<details>
<summary><strong>/worktree-add</strong> - Create git worktree for parallel work</summary>

**Usage:** `/worktree-add [branch-name or issue-URL] [optional base-branch]`

**When to Use:**
- Working on multiple features simultaneously
- Need to context-switch without stashing
- Reviewing PR while working on another feature

**How It Works:**
1. Creates new worktree directory (sibling to current)
2. Checks out or creates the specified branch
3. Copies IDE settings and config files
4. Runs dependency installation
5. Opens in your IDE

**Example 1: Create worktree for new feature**
```bash
/worktree-add feature/stripe-webhooks
```
Output:
```
🌳 Creating worktree...

Source: /Users/dev/project (main)
Target: /Users/dev/project-stripe-webhooks

Steps:
  [1/5] Creating worktree directory...
        ✅ /Users/dev/project-stripe-webhooks

  [2/5] Checking out branch...
        ✅ Created: feature/stripe-webhooks (from main)

  [3/5] Copying IDE settings...
        ✅ .vscode/settings.json
        ✅ .claude/settings.json

  [4/5] Installing dependencies...
        ✅ pnpm install completed

  [5/5] Opening in VS Code...
        ✅ code /Users/dev/project-stripe-webhooks

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Worktree ready at: /Users/dev/project-stripe-webhooks

You now have two independent working directories.
Switch between them freely without stashing.
```

**Example 2: Create from GitHub issue**
```bash
/worktree-add https://github.com/user/repo/issues/42
```
Output:
```
🌳 Creating worktree from issue #42...

Issue: Add Brandfetch integration
Branch: feature/42-brandfetch-integration
Target: /Users/dev/project-42-brandfetch

✅ Worktree created and IDE opened
```

**Common Use Cases:**
- Parallel features: Work on multiple things at once
- Code review: Check out PR without affecting current work
- Hotfix: Create separate space for urgent fix

</details>

<details>
<summary><strong>/worktree-cleanup</strong> - Clean up merged worktrees</summary>

**Usage:** `/worktree-cleanup`

**When to Use:**
- After PRs have been merged
- To reclaim disk space from old worktrees
- Regular maintenance of development environment

**How It Works:**
1. Lists all existing worktrees
2. Checks if each branch has been merged to main
3. Verifies associated PRs/issues are closed
4. Consolidates any settings changes
5. Removes stale worktrees and branches

**Example 1: Clean up after sprint**
```bash
/worktree-cleanup
```
Output:
```
🧹 Analyzing worktrees...

Current worktrees:
  [main] /Users/dev/project (active)
  [feature/brandfetch] /Users/dev/project-brandfetch
  [feature/stripe] /Users/dev/project-stripe
  [feature/old-feature] /Users/dev/project-old-feature

Checking merge status...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ready to clean (merged to main):
  ✅ feature/brandfetch - PR #45 merged 3 days ago
  ✅ feature/old-feature - PR #38 merged 2 weeks ago

Keep (not merged):
  🔄 feature/stripe - PR #47 still open

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Consolidating settings from merged worktrees...
  ✅ No new settings to merge

Remove 2 merged worktrees? [y/n]: y

Cleaning up:
  [1/2] Removing project-brandfetch...
        ✅ Worktree removed
        ✅ Branch deleted

  [2/2] Removing project-old-feature...
        ✅ Worktree removed
        ✅ Branch deleted

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Cleanup complete
   Removed: 2 worktrees
   Recovered: ~450 MB disk space
```

**Common Use Cases:**
- Sprint end: Clean up completed features
- Disk space: Recover space from old worktrees
- Hygiene: Keep git state clean and manageable

</details>

### All Utility Commands (5 Commands)

<details>
<summary><strong>/plan</strong> - Create implementation plan for complex features</summary>

**Usage:** `/plan [feature or requirement description]`

**When to Use:**
- Before implementing a complex feature
- When you need to break down work into steps
- To document approach before coding

**How It Works:**
1. Analyzes the feature request
2. Breaks into discrete implementation steps
3. Identifies dependencies and risks
4. Creates actionable checklist

**Example 1: Plan user authentication**
```bash
/plan add user authentication with OAuth
```
Output:
```
📋 Implementation Plan: User Authentication with OAuth

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Overview:
  Add OAuth-based authentication supporting Google and GitHub providers.

Steps:

1. Research & Setup
   - [ ] Research NextAuth.js configuration
   - [ ] Set up OAuth apps in Google/GitHub consoles
   - [ ] Add required environment variables

2. Core Implementation
   - [ ] Install next-auth package
   - [ ] Create [...nextauth]/route.ts handler
   - [ ] Configure Google provider
   - [ ] Configure GitHub provider

3. User Experience
   - [ ] Create sign-in page component
   - [ ] Add session provider to app layout
   - [ ] Create protected route middleware

4. Testing
   - [ ] Write tests for auth flow
   - [ ] Test token refresh handling
   - [ ] Test logout functionality

5. Documentation
   - [ ] Update API documentation
   - [ ] Add setup instructions to README

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dependencies:
  - next-auth ^4.24.0
  - Environment: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, etc.

Risks:
  - OAuth callback URL misconfiguration
  - Token refresh edge cases

Start with step 1? [y/n]
```

**Example 2: Plan API migration**
```bash
/plan migrate legacy endpoints to v2 structure
```

**Common Use Cases:**
- Complex features: Break down before starting
- Team alignment: Document approach for review
- Estimation: Understand scope of work

</details>

<details>
<summary><strong>/gap</strong> - Find missing requirements and unaddressed items</summary>

**Usage:** `/gap [optional additional context]`

**When to Use:**
- Before finishing a feature to check completeness
- When reviewing code for missing pieces
- To identify what was discussed but not implemented

**How It Works:**
1. Analyzes conversation history
2. Compares discussed requirements vs implemented code
3. Identifies gaps, TODOs, and deferred items
4. Reports what still needs attention

**Example 1: Check for gaps after implementation**
```bash
/gap
```
Output:
```
🔍 Gap Analysis

Analyzing conversation and code changes...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Discussed but NOT implemented:

1. Rate Limiting (HIGH priority)
   Mentioned: "We should add rate limiting to prevent abuse"
   Status: Not found in implementation
   Location: src/app/api/v2/brandfetch/route.ts

2. Error Retry Logic (MEDIUM priority)
   Mentioned: "Handle transient failures with retry"
   Status: Partially implemented (no exponential backoff)
   Location: src/lib/brandfetch-client.ts

3. Caching Layer (LOW priority)
   Mentioned: "Consider caching frequent domains"
   Status: Deferred (user said "do later")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TODOs in code:

1. src/app/api/v2/brandfetch/route.ts:45
   // TODO: Add proper error classification

2. src/lib/schemas/brandfetch.ts:12
   // TODO: Add URL validation for logo sources

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Recommendations:
  - Address HIGH priority gap before shipping
  - Create issues for MEDIUM/LOW priority items
  - Resolve TODOs or convert to tracked issues
```

**Example 2: Check specific area**
```bash
/gap check error handling coverage
```

**Common Use Cases:**
- Pre-PR review: Ensure nothing was missed
- Feature completion: Verify all requirements met
- Quality check: Find TODOs and incomplete work

</details>

<details>
<summary><strong>/summarize</strong> - Summarize session progress and next steps</summary>

**Usage:** `/summarize [optional additional context]`

**When to Use:**
- End of work session
- Before handing off to teammate
- To document what was accomplished

**How It Works:**
1. Reviews conversation and changes made
2. Lists files created/modified
3. Summarizes decisions and progress
4. Identifies next steps

**Example 1: End of session summary**
```bash
/summarize
```
Output:
```
📊 Session Summary

Duration: 2 hours 15 minutes
Messages: 47 exchanges

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What was accomplished:

1. Brandfetch API Integration
   - Created Zod schema with domain, format, include_colors
   - Implemented POST endpoint with validation
   - Added 10 comprehensive tests (all passing)
   - Verified against current Brandfetch documentation

2. Code Quality
   - Extracted domain validation to reusable helper
   - Added TypeScript strict types throughout
   - 100% test coverage achieved

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Files changed:

Created (4):
  + src/lib/schemas/brandfetch.ts
  + src/lib/validators/domain.ts
  + src/app/api/v2/brandfetch/route.ts
  + src/app/api/v2/brandfetch/__tests__/brandfetch.api.test.ts

Modified (2):
  ~ package.json (added brandfetch dependency)
  ~ src/app/api-test/api-tests-manifest.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Decisions made:
  - Use JSON + SVG formats (not PNG)
  - Include colors by default
  - Skip font support for MVP

Next steps:
  1. Run /commit to save work
  2. Add rate limiting (deferred from this session)
  3. Consider caching layer for production
```

**Example 2: Summary for handoff**
```bash
/summarize for teammate handoff
```

**Common Use Cases:**
- Session end: Document before closing
- Handoff: Brief teammate on progress
- Standup prep: Know what you did yesterday

</details>

<details>
<summary><strong>/beepboop</strong> - AI attribution marker for generated content</summary>

**Usage:** `/beepboop [task description]`

**When to Use:**
- When generating content that should be attributed to AI
- For transparent communication about AI involvement
- Team protocols requiring AI disclosure

**How It Works:**
1. Marks the current task as AI-generated
2. Adds attribution to outputs
3. Maintains transparency about AI assistance

**Example 1: Mark documentation as AI-generated**
```bash
/beepboop generate API documentation for brandfetch endpoint
```
Output:
```
🤖 BEEPBOOP: AI-Generated Content

Task: generate API documentation for brandfetch endpoint

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Brandfetch API Endpoint

## POST /api/v2/brandfetch

Retrieve brand assets (logos, colors) for any domain.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| domain | string | Yes | Domain to fetch brand for |
| format | enum | No | Output format: json, svg |
| include_colors | boolean | No | Include color palette |

### Response

```json
{
  "name": "Company Name",
  "logos": [...],
  "colors": [...]
}
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 This content was generated with AI assistance.
   Model: Claude (Anthropic)
   Generated: 2025-12-11
```

**Example 2: Mark code review as AI-assisted**
```bash
/beepboop review this PR for potential issues
```

**Common Use Cases:**
- Transparency: Clear attribution of AI work
- Policy compliance: Meet disclosure requirements
- Documentation: Mark AI-generated content

</details>

<details>
<summary><strong>/add-command</strong> - Create new custom slash command</summary>

**Usage:** `/add-command [command-name] [description]`

**When to Use:**
- Creating a reusable workflow
- Standardizing team processes
- Automating repetitive tasks

**How It Works:**
1. Creates new .md file in `.claude/commands/`
2. Sets up command template with description
3. Registers command for immediate use

**Example 1: Create a deployment command**
```bash
/add-command deploy-staging "Deploy current branch to staging environment"
```
Output:
```
📝 Creating new slash command...

Command: /deploy-staging
Description: Deploy current branch to staging environment

Creating file: .claude/commands/deploy-staging.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Template created with the following structure:

# /deploy-staging

Deploy current branch to staging environment.

## Steps

1. Verify all tests pass
2. Build production bundle
3. Deploy to staging server
4. Run smoke tests
5. Report deployment status

## Usage

```
/deploy-staging
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Command created!

Edit .claude/commands/deploy-staging.md to customize.
Command is available immediately as /deploy-staging
```

**Example 2: Create code review command**
```bash
/add-command security-review "Run security-focused code review"
```

**Common Use Cases:**
- Team workflows: Standardize common processes
- Automation: Create shortcuts for complex tasks
- Documentation: Self-documenting procedures

</details>

---

### Legacy Section: Using `/hustle-api-continue` - Detailed Examples

> **Note:** This section contains additional detailed examples. The main documentation for `/hustle-api-continue` is in the Hustle API Commands section above.

The `/hustle-api-continue` command is essential for:
- Resuming interrupted workflows
- **Modifying completed endpoints**
- Picking up from a specific phase

<details>
<summary><strong>Example 1: Resume After Interruption</strong></summary>

Your session was interrupted mid-workflow (computer restart, timeout, etc.):

```bash
/hustle-api-continue brandfetch
```

**What Happens:**
1. Hook reads `api-dev-state.json`
2. Finds `brandfetch` with `status: "in_progress"`, last completed phase: `tdd_red`
3. Shows summary:
   ```
   Found interrupted workflow: brandfetch

   Completed phases:
     ✅ Phase 1: Disambiguation
     ✅ Phase 2: Scope
     ✅ Phase 3: Initial Research
     ✅ Phase 4: Interview
     ✅ Phase 5: Deep Research
     ✅ Phase 6: Schema
     ✅ Phase 7: Environment
     ✅ Phase 8: TDD Red

   Next phase: Phase 9 (TDD Green)

   Resume from Phase 9? [Yes / Start over / Pick different phase]
   ```
4. You say "Yes", workflow continues from Phase 9

</details>

<details>
<summary><strong>Example 2: Modify a Complete Endpoint (Add New Feature)</strong></summary>

Your `brandfetch` endpoint is marked "complete" but you want to add font support:

**Step 1: Check current status**
```bash
/hustle-api-status brandfetch
```
Output shows `status: complete`

**Step 2: Reset specific phases**
Edit `.claude/api-dev-state.json`:
```json
{
  "endpoints": {
    "brandfetch": {
      "status": "in_progress",
      "phases": {
        "interview": { "status": "in_progress" },
        "research_deep": { "status": "not_started" },
        "schema_creation": { "status": "not_started" },
        "tdd_red": { "status": "not_started" },
        "tdd_green": { "status": "not_started" },
        "verify": { "status": "not_started" }
      }
    }
  }
}
```

**Step 3: Continue from interview**
```bash
/hustle-api-continue brandfetch
```

Claude will:
1. Re-interview you about the new font feature
2. Research font-related parameters
3. Update the schema
4. Add tests for font functionality
5. Implement the changes
6. Verify against docs

</details>

<details>
<summary><strong>Example 3: Re-verify After API Changes</strong></summary>

The Brandfetch API updated and you need to ensure your implementation matches:

**Option A: Quick verification only**
```bash
/hustle-api-verify brandfetch
```
This runs Phase 10 only - re-researches and compares to your implementation.

**Option B: Full re-research and potential updates**
Edit state file to reset from research:
```json
{
  "endpoints": {
    "brandfetch": {
      "status": "in_progress",
      "phases": {
        "research_initial": { "status": "not_started" },
        "verify": { "status": "not_started" }
      }
    }
  }
}
```

Then:
```bash
/hustle-api-continue brandfetch
```

Claude will:
1. Re-research the API with fresh Context7/WebSearch calls
2. Compare against your current implementation
3. Identify gaps or changes needed
4. Update tests and implementation if required

</details>

<details>
<summary><strong>Example 4: Start Over Completely</strong></summary>

You want to rebuild `brandfetch` from scratch:

```bash
/hustle-api-create brandfetch
```

Claude detects the existing endpoint:
```
Endpoint 'brandfetch' already exists with status: complete

Options:
  [A] Reset all phases and start fresh
  [B] Resume from last incomplete phase
  [C] Pick specific phase to restart from

Your choice?
```

Choose `[A]` to completely rebuild with fresh research.

</details>

---

## Understanding the Two Cache Systems

The workflow creates TWO distinct cache systems. Understanding the difference is critical:

### 1. Research Cache (`.claude/research/`)

**Purpose:** Store research findings for REUSE across sessions. Prevents re-researching the same API.

**When Created:** During Phase 3 (Initial Research) and Phase 5 (Deep Research)

**Freshness Checking:** YES - checked at session start

```
.claude/research/
├── index.json                    # Tracks freshness of ALL APIs
└── brandfetch/
    ├── CURRENT.md                # Human-readable research summary
    ├── sources.json              # What was researched, when, from where
    ├── interview.json            # User's decisions from Phase 4
    └── schema.json               # Zod schema snapshot
```

**Freshness Logic (in `session-startup.py`):**
```
When you start a new Claude session:
1. Hook reads .claude/research/index.json
2. For each API, calculates days since last_updated
3. If > 7 days: Warns "⚠️ Research is X days old. Consider re-researching."
4. This warning appears in Claude's context at session start
```

**Example Freshness Warning:**
```
**Research Cache:**
  - Location: .claude/research/brandfetch/CURRENT.md
  - Last Updated: 2025-12-04T15:30:00Z
  - ⚠️ WARNING: Research is 8 days old. Consider re-researching.
```

**What Triggers Re-research:**
- You see the warning and run `/hustle-api-research brandfetch`
- Phase 10 (Verification) detects gaps and loops back to research
- You manually decide documentation has changed

**Freshness Enforcement (v3.7.0+):**
By default, stale research **blocks** API-related Write/Edit operations for the active endpoint:

```
🔄 STALE RESEARCH DETECTED

Research for 'brandfetch' is 9 days old (threshold: 7 days).

Action Required:
Run `/hustle-api-research brandfetch` to refresh the research.
```

**To Disable Enforcement** (not recommended):
Set `enforce_freshness: false` in the endpoint config in `api-dev-state.json`:

```json
{
  "endpoints": {
    "brandfetch": {
      "enforce_freshness": false,
      "freshness_threshold_days": 7
    }
  }
}
```

**To Customize Threshold:**
Change `freshness_threshold_days` (default: 7) per endpoint.

### 2. Session Logs (`.claude/api-sessions/`)

**Purpose:** Store HISTORY of what happened. Audit trail, debugging, learning.

**When Created:** At Phase 13 completion (by `session-logger.py` Stop hook)

**Freshness Checking:** NO - these are historical records, not reused

```
.claude/api-sessions/
├── index.json                    # Index of all sessions
└── brandfetch_2025-12-11_15-30-00/
    ├── session.jsonl             # Raw Claude conversation
    ├── session.md                # Human-readable transcript
    ├── state-snapshot.json       # State at completion
    └── summary.md                # Executive summary
```

**When You'd Use Session Logs:**
- "What decisions did I make for brandfetch?" → Read `summary.md`
- "Why did I skip include_fonts?" → Search `session.md` for the discussion
- "What was the exact state when I finished?" → Read `state-snapshot.json`
- "Need to debug what went wrong" → Read `session.jsonl`

### Key Difference

| Aspect | Research Cache | Session Logs |
|--------|---------------|--------------|
| **Purpose** | Reuse knowledge | Record history |
| **When used** | Every session | Debugging/review |
| **Freshness check** | YES (7 days) | NO |
| **Format** | Structured data | Transcript/logs |
| **Updated** | During research phases | At workflow completion |

---

## Documentation Types

The workflow generates THREE types of documentation:

### 1. Research Cache (Machine + Human Readable)

**Location:** `.claude/research/brandfetch/`

**Audience:** Claude (for context injection) + Humans (for review)

**Generated By:** `cache-research.py` PostToolUse hook

**Example `CURRENT.md`:**
```markdown
# Brandfetch API Research

**Last Updated:** 2025-12-11
**Freshness:** Fresh (0 days)

## Base URL
https://api.brandfetch.io/v2

## Authentication
Bearer token via Authorization header

## Endpoints
- GET /:domain - Fetch brand data

## Parameters Discovered
- domain (required): Domain name to look up
- include_fonts (optional): Include font data
- imageFormat (optional): svg, png, jpg

## Rate Limits
- 5 requests/second
- Headers: X-Plan-RateLimit-Limit, X-Plan-RateLimit-Remaining
```

### 2. API Test Manifest (Machine Readable)

**Location:** `src/app/api-test/api-tests-manifest.json`

**Audience:** Test UI, automated systems, API documentation generators

**Generated By:** `generate-manifest-entry.py` PostToolUse hook

**Example Entry:**
```json
{
  "endpoints": [{
    "path": "/api/v2/brandfetch",
    "method": "GET",
    "description": "Fetch brand assets",
    "parameters": [...],
    "curlExamples": [...],
    "testCases": [...]
  }]
}
```

### 3. Phase 13 Completion Output (Human Readable)

**Location:** Printed to terminal at workflow completion

**Audience:** Human developer

**Generated By:** `api-workflow-check.py` Stop hook - **YES, this is programmatic**

**What Gets Generated:**
```markdown
============================================================
# ✅ API Implementation Complete: brandfetch
============================================================

## Summary
- **Status:** PRODUCTION READY
- **Phases:** 13/13 Complete
- **Tests:** 10 test scenarios
- **Completed:** 2025-12-11T16:45:00Z

## Files Created
- src/app/api/v2/brandfetch/route.ts
- src/app/api/v2/brandfetch/__tests__/route.test.ts
- src/lib/schemas/brandfetch.ts

## Test Commands                          ← PROGRAMMATICALLY GENERATED
```bash
# Run endpoint tests
pnpm test -- brandfetch

# Run with coverage
pnpm test:coverage -- brandfetch

# Run specific test file
pnpm test:run src/app/api/v2/brandfetch/__tests__/route.test.ts
```

## API Usage (curl)                       ← PROGRAMMATICALLY GENERATED
```bash
curl -X GET "http://localhost:3001/api/v2/brandfetch?domain=google.com"
```

## Parameters Discovered                  ← PROGRAMMATICALLY GENERATED
| Name | Type | Required | Description |
|------|------|----------|-------------|
| domain | string | ✓ | Domain to look up |
| mode | enum | - | full or logo-only |
```

---

## Output Determinism: What's Fixed vs Variable

### ALWAYS THE SAME (Deterministic)

| Output | Location | Why |
|--------|----------|-----|
| Route file | `src/app/api/v2/{endpoint}/route.ts` | Enforced by hooks |
| Test file | `src/app/api/v2/{endpoint}/__tests__/*.test.ts` | Enforced by hooks |
| Schema file | `src/lib/schemas/{endpoint}.ts` | Enforced by schema phase |
| Research cache | `.claude/research/{endpoint}/` | Enforced by cache-research.py |
| Session folder | `.claude/api-sessions/{endpoint}_{timestamp}/` | Enforced by session-logger.py |

### VARIABLE (Depends on Workflow)

| Output | What Varies | Why |
|--------|-------------|-----|
| `sources.json` content | Which sources were consulted | Depends on what Claude searched |
| `interview.json` content | User's decisions | User answers differ per workflow |
| Test count | How many tests | Depends on discovered parameters |
| Curl examples | Parameters used | Depends on schema complexity |
| `summary.md` duration | Time taken | Depends on conversation length |
| `state-snapshot.json` | Phase details | Depends on workflow path |

### WHY THIS MATTERS

**Consistent Structure:** You can build automation knowing files are always in the same locations:
```javascript
// This path is GUARANTEED
const routeFile = `src/app/api/v2/${endpoint}/route.ts`;
const testFile = `src/app/api/v2/${endpoint}/__tests__/${endpoint}.api.test.ts`;
const researchCache = `.claude/research/${endpoint}/CURRENT.md`;
```

**Variable Content:** The content reflects YOUR workflow:
- Your interview decisions
- Your research sources
- Your parameter choices
- Your intentional omissions

---

## File Structure

When you install with `npx @hustle-together/api-dev-tools --scope=project`, the following files are created in your project's `.claude/` directory:

```
@hustle-together/api-dev-tools v3.7.0
│
├── bin/
│   └── cli.js                              # NPX installer
│
├── commands/                               # 26 slash commands
│   │
│   │ # Hustle API Development Commands (8)
│   ├── hustle-api-create.md                # Main 13-phase workflow
│   ├── hustle-api-interview.md             # Structured interview
│   ├── hustle-api-research.md              # Adaptive research
│   ├── hustle-api-verify.md                # Manual verification
│   ├── hustle-api-env.md                   # Environment check
│   ├── hustle-api-status.md                # Progress tracking
│   ├── hustle-api-continue.md              # Resume interrupted workflow
│   ├── hustle-api-sessions.md              # Browse saved sessions
│   │
│   │ # TDD Commands (6)
│   ├── red.md                              # TDD Red phase
│   ├── green.md                            # TDD Green phase
│   ├── refactor.md                         # TDD Refactor phase
│   ├── cycle.md                            # Full TDD cycle
│   ├── spike.md                            # Exploration mode
│   ├── tdd.md                              # TDD reminder
│   │
│   │ # Git Commands (6)
│   ├── commit.md                           # Git commit
│   ├── pr.md                               # Pull request
│   ├── busycommit.md                       # Atomic commits
│   ├── issue.md                            # GitHub issue workflow
│   ├── worktree-add.md                     # Git worktree management
│   ├── worktree-cleanup.md                 # Worktree cleanup
│   │
│   │ # Utility Commands (6)
│   ├── plan.md                             # Implementation planning
│   ├── gap.md                              # Requirement gaps
│   ├── summarize.md                        # Session summary
│   ├── beepboop.md                         # AI attribution
│   ├── add-command.md                      # Create slash commands
│   └── README.md                           # Command reference
│
├── hooks/                                  # 25 Python enforcement hooks
│   │
│   │ # Session lifecycle (2)
│   ├── session-startup.py                  # Inject state on start
│   ├── detect-interruption.py              # Detect interrupted workflows
│   │
│   │ # User prompt processing (1)
│   ├── enforce-external-research.py        # Detect API terms, require research
│   │
│   │ # PreToolUse (Write/Edit) - BLOCKING (15)
│   ├── enforce-disambiguation.py           # Phase 1
│   ├── enforce-scope.py                    # Phase 2
│   ├── enforce-research.py                 # Phase 3
│   ├── enforce-interview.py                # Phase 4
│   ├── enforce-deep-research.py            # Phase 5
│   ├── enforce-schema.py                   # Phase 6
│   ├── enforce-environment.py              # Phase 7
│   ├── enforce-tdd-red.py                  # Phase 8
│   ├── verify-implementation.py            # Phase 9 helper
│   ├── enforce-verify.py                   # Phase 10
│   ├── enforce-refactor.py                 # Phase 11
│   ├── enforce-documentation.py            # Phase 12
│   ├── enforce-questions-sourced.py        # Validate questions from research
│   ├── enforce-schema-from-interview.py    # Validate schema matches interview
│   ├── enforce-freshness.py                # Block if research >7 days old
│   ├── check-storybook-setup.py            # Verify Storybook installed (NEW)
│   ├── check-playwright-setup.py           # Verify Playwright installed (NEW)
│   │
│   │ # PostToolUse - TRACKING (9)
│   ├── track-tool-use.py                   # Log all tool usage
│   ├── periodic-reground.py                # Re-inject context every 7 turns
│   ├── verify-after-green.py               # Auto-trigger Phase 10
│   ├── cache-research.py                   # Create research cache files
│   ├── track-scope-coverage.py             # Track feature decisions
│   ├── generate-manifest-entry.py          # Auto-generate manifest entry
│   ├── update-registry.py                  # Update central registry
│   ├── update-api-showcase.py              # Update API Showcase (NEW)
│   ├── update-ui-showcase.py               # Update UI Showcase (NEW)
│   │
│   │ # Stop - BLOCKING (2)
│   ├── api-workflow-check.py               # Phase 13 (block if incomplete)
│   └── session-logger.py                   # Save session logs
│
├── templates/
│   ├── api-dev-state.json                  # State file template (13 phases)
│   ├── settings.json                       # Hook registrations
│   ├── research-index.json                 # 7-day freshness tracking
│   ├── SPEC.json                           # Single source of truth
│   └── CLAUDE-SECTION.md                   # CLAUDE.md injection section
│
├── scripts/
│   ├── generate-test-manifest.ts           # Parse tests → manifest (NO LLM)
│   ├── extract-parameters.ts               # Extract Zod params
│   └── collect-test-results.ts             # Run tests → results
│
└── package.json                            # v3.9.2
```

### Files Installed to Your Project

After running the installer, your project will have:

```
your-project/
└── .claude/
    ├── commands/                           # 28 slash commands
    │   ├── hustle-api-create.md
    │   ├── hustle-api-interview.md
    │   ├── hustle-api-research.md
    │   ├── hustle-api-verify.md
    │   ├── hustle-api-env.md
    │   ├── hustle-api-status.md
    │   ├── hustle-api-continue.md
    │   ├── hustle-api-sessions.md
    │   ├── red.md, green.md, refactor.md...
    │   └── README.md
    │
    ├── hooks/                              # 34 Python enforcement hooks
    │   ├── session-startup.py
    │   ├── enforce-*.py                    # 17 blocking hooks (API + UI)
    │   ├── check-*.py                      # 2 setup verification hooks
    │   ├── track-*.py                      # 3 tracking hooks
    │   ├── verify-*.py                     # 2 verification hooks
    │   ├── update-*.py                     # 3 registry update hooks
    │   ├── cache-research.py
    │   ├── generate-manifest-entry.py
    │   ├── api-workflow-check.py
    │   └── session-logger.py
    │
    ├── templates/                          # Component & Page templates (NEW)
    │   ├── component/
    │   │   ├── Component.tsx
    │   │   ├── Component.types.ts
    │   │   ├── Component.stories.tsx
    │   │   ├── Component.test.tsx
    │   │   └── index.ts
    │   └── page/
    │       ├── page.tsx
    │       └── page.e2e.test.ts
    │
    ├── settings.json                       # Hook registrations + permissions
    ├── BRAND_GUIDE.md                      # Default branding template (NEW)
    ├── registry.json                       # Central registry (created on use)
    ├── api-dev-state.json                  # Workflow state (created on use)
    │
    ├── research/                           # Research cache (created on use)
    │   ├── index.json                      # Freshness tracking
    │   └── {endpoint}/                     # Per-endpoint research
    │       ├── CURRENT.md
    │       ├── sources.json
    │       ├── interview.json
    │       └── schema.json
    │
    └── api-sessions/                       # Session logs (created on use)
        ├── index.json
        └── {endpoint}_{timestamp}/
            ├── session.jsonl
            ├── session.md
            ├── state-snapshot.json
            └── summary.md

src/app/                                    # Showcase Pages (NEW)
├── shared/
│   ├── HeroHeader.tsx
│   └── index.ts
├── dev-tools/
│   ├── page.tsx
│   └── _components/DevToolsLanding.tsx
├── api-showcase/
│   ├── page.tsx
│   └── _components/
│       ├── APIShowcase.tsx
│       ├── APICard.tsx
│       ├── APIModal.tsx
│       └── APITester.tsx
└── ui-showcase/
    ├── page.tsx
    └── _components/
        ├── UIShowcase.tsx
        ├── PreviewCard.tsx
        └── PreviewModal.tsx
```

---

## Output Files Explained (Using Brandfetch Example)

When you complete `/hustle-api-create brandfetch`, the workflow produces a **deterministic** set of output files. This section explains exactly what each file contains using Brandfetch as a concrete example.

### Source Code Files (Always Created)

These files are created in your project's `src/` directory:

| File | Purpose |
|------|---------|
| `src/app/api/v2/brandfetch/route.ts` | The API route handler with request/response logic |
| `src/app/api/v2/brandfetch/__tests__/route.test.ts` | Vitest test file with all test scenarios |
| `src/lib/schemas/brandfetch.ts` | Zod request/response schemas |

### Research Cache Files

Located in `.claude/research/brandfetch/`:

| File | Purpose | Example Content |
|------|---------|-----------------|
| `CURRENT.md` | Human-readable aggregated research summary | Markdown document with base URL, auth method, rate limits, endpoints, parameters |
| `sources.json` | Machine-readable list of research sources with timestamps | `{ "sources": [{ "type": "context7", "id": "/brandfetch/api-docs", "fetched_at": "..." }] }` |
| `interview.json` | All interview decisions made by user | `{ "decisions": { "response_format": "json_with_urls", "caching": "24h", "assets": ["logos", "colors"] } }` |
| `schema.json` | Snapshot of the Zod schema structure | `{ "request": { "domain": "string", "mode": "enum" }, "response": { "logos": "array", "colors": "array" } }` |

**sources.json Example (Brandfetch):**
```json
{
  "created_at": "2025-12-11T15:30:00Z",
  "freshness_days": 7,
  "sources": [
    {
      "type": "context7",
      "id": "/brandfetch/api-docs",
      "fetched_at": "2025-12-11T15:32:00Z",
      "findings": ["base_url", "auth_method", "rate_limits", "endpoints"]
    },
    {
      "type": "websearch",
      "query": "Brandfetch API authentication 2025",
      "fetched_at": "2025-12-11T15:33:00Z",
      "findings": ["bearer_token", "api_key_header"]
    }
  ]
}
```

**interview.json Example (Brandfetch):**
```json
{
  "created_at": "2025-12-11T15:45:00Z",
  "endpoint_name": "brandfetch",
  "questions_asked": 5,
  "decisions": {
    "response_format": "json_with_urls",
    "caching": "24h",
    "error_handling": "return_objects",
    "rate_limiting": "expose_headers",
    "assets": ["logos", "colors"]
  }
}
```

### Session Log Files

Located in `.claude/api-sessions/brandfetch_2025-12-11_15-30-00/`:

| File | Purpose | When Used |
|------|---------|-----------|
| `session.jsonl` | Raw Claude conversation in JSON Lines format | Debugging, audit trails |
| `session.md` | Human-readable markdown transcript of entire session | Reading what happened |
| `state-snapshot.json` | Complete copy of api-dev-state.json at workflow completion | Restoring state if needed |
| `summary.md` | Executive summary: duration, phases, files, decisions | Quick reference |

**session.md** contains the full conversation including:
- All Claude messages
- All tool calls and results
- All user responses
- Timestamps for each turn

**state-snapshot.json** is an exact copy of the state file at the moment Phase 13 completed. This allows you to:
- See exactly what state looked like when the workflow finished
- Compare with current state if you've modified the API
- Restore state if needed

**summary.md Example (Brandfetch):**
```markdown
# Session Summary: brandfetch

**Completed:** 2025-12-11T16:45:00Z
**Duration:** 1h 15m
**Turns:** 47

## Phases Completed
- [x] Phase 1: Disambiguation (3m)
- [x] Phase 2: Scope (2m)
- [x] Phase 3: Initial Research (8m)
- [x] Phase 4: Interview (5m)
- [x] Phase 5: Deep Research (10m)
- [x] Phase 6: Schema (5m)
- [x] Phase 7: Environment (1m)
- [x] Phase 8: TDD Red (15m)
- [x] Phase 9: TDD Green (20m)
- [x] Phase 10: Verification (5m)
- [x] Phase 11: Refactor (3m)
- [x] Phase 12: Documentation (3m)
- [x] Phase 13: Completion (1m)

## Files Created
- src/app/api/v2/brandfetch/route.ts
- src/app/api/v2/brandfetch/__tests__/route.test.ts
- src/lib/schemas/brandfetch.ts

## Interview Decisions
- Response format: JSON with asset URLs
- Caching: 24 hours
- Error handling: Return error objects
- Assets: logos, colors

## Intentional Omissions
- include_fonts parameter (user confirmed not needed)

## Test Results
- Total: 10 tests
- Passing: 10
- Coverage: 100%
```

### State File (`api-dev-state.json`)

The state file tracks ALL workflow progress. When you add a second API (e.g., ElevenLabs), both endpoints appear in the same file:

```json
{
  "version": "3.7.0",
  "active_endpoint": "elevenlabs",
  "endpoints": {
    "brandfetch": {
      "started_at": "2025-12-11T15:30:00Z",
      "status": "complete",
      "phases": { "...": "..." }
    },
    "elevenlabs": {
      "started_at": "2025-12-11T18:00:00Z",
      "status": "in_progress",
      "phases": { "...": "..." }
    }
  }
}
```

### Modifying a "Complete" Endpoint

Once an endpoint is marked `"status": "complete"`, you can still modify it:

**Option A: Run `/hustle-api-create` again**
```bash
/hustle-api-create brandfetch
```
The workflow will detect the existing endpoint and offer:
- Reset all phases and start fresh
- Resume from a specific phase
- Skip completed phases

**Option B: Manually reset phases in state file**
Edit `.claude/api-dev-state.json`:
```json
{
  "endpoints": {
    "brandfetch": {
      "status": "in_progress",
      "phases": {
        "tdd_red": { "status": "not_started" },
        "tdd_green": { "status": "not_started" }
      }
    }
  }
}
```
Then run `/hustle-api-continue brandfetch` to resume.

**Option C: Use `/hustle-api-verify` for updates**
```bash
/hustle-api-verify brandfetch
```
This re-researches and compares current implementation to latest docs, identifying gaps to address.

### What Dictates "complete" vs "in_progress"

An endpoint's status is **programmatically determined** by checking all 13 phases:

| Status | Condition |
|--------|-----------|
| `not_started` | No phases have `status: "complete"` |
| `in_progress` | At least one phase has `status: "complete"` but not all 13 |
| `complete` | ALL 13 phases have `status: "complete"` AND `phase_exit_confirmed: true` |

**The user does NOT manually mark complete.** The `api-workflow-check.py` Stop hook automatically:
1. Iterates through all 13 phases
2. Checks each has `status: "complete"` and `phase_exit_confirmed: true`
3. If all pass → sets endpoint `status: "complete"`
4. If any fail → blocks with Exit Code 2 and lists incomplete phases

**Phase completion requires:**
- Phase-specific work done (research fetched, tests written, etc.)
- User explicitly confirmed via `AskUserQuestion` response
- `phase_exit_confirmed: true` set by hook

This means the workflow cannot be marked complete unless the user actively participated in confirming each phase transition.

### Research Index (`index.json`)

Located at `.claude/research/index.json`, this tracks freshness for ALL researched APIs:

```json
{
  "apis": {
    "brandfetch": {
      "last_updated": "2025-12-11T15:30:00Z",
      "freshness_days": 7,
      "is_fresh": true,
      "source_count": 2,
      "cache_path": ".claude/research/brandfetch/"
    },
    "elevenlabs": {
      "last_updated": "2025-12-11T18:00:00Z",
      "freshness_days": 7,
      "is_fresh": true,
      "source_count": 3,
      "cache_path": ".claude/research/elevenlabs/"
    }
  }
}
```

When research is older than 7 days, `session-startup.py` warns:
```
⚠️ Research for brandfetch is 8 days old. Consider re-researching.
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

### Optional Development Tools

After running the installer, you may want to set up additional development tools:

**Storybook (Component Development)**
```bash
npx storybook@latest init
```
Used for:
- Interactive component development
- Visual testing of variants
- Component documentation

The installer creates Storybook story templates (`Component.stories.tsx`) but does **not** install Storybook itself. The `check-storybook-setup.py` hook will detect if Storybook is installed and guide you through setup.

**Playwright (E2E Testing)**
```bash
npm init playwright@latest
```
Used for:
- Page-level E2E tests
- Accessibility testing
- Cross-browser verification

The installer creates Playwright test templates (`page.e2e.test.ts`) but does **not** install Playwright itself. The `check-playwright-setup.py` hook will detect if Playwright is installed and guide you through setup.

**Sandpack (Live UI Previews)**
```bash
pnpm add @codesandbox/sandpack-react
```
Used for:
- Live component editing in UI Showcase
- Interactive code previews
- No server required

The UI Showcase page uses Sandpack for live component previews. Without it, components will display in a static iframe.

### Showcase Pages

The installer creates three showcase pages in your Next.js app directory:

| Route | Description |
|-------|-------------|
| `/dev-tools` | Landing page with registry stats and setup links |
| `/api-showcase` | Interactive API testing and documentation |
| `/ui-showcase` | Live component previews with Sandpack |

**Installation Structure:**
```
src/app/
├── shared/
│   ├── HeroHeader.tsx      # Animated 3D grid hero
│   └── index.ts
├── dev-tools/
│   ├── page.tsx
│   └── _components/
│       └── DevToolsLanding.tsx
├── api-showcase/
│   ├── page.tsx
│   └── _components/
│       ├── APIShowcase.tsx
│       ├── APICard.tsx
│       ├── APIModal.tsx
│       └── APITester.tsx
└── ui-showcase/
    ├── page.tsx
    └── _components/
        ├── UIShowcase.tsx
        ├── PreviewCard.tsx
        └── PreviewModal.tsx
```

**Features:**
- Animated 3D grid hero header (canvas-based, 60fps)
- Hustle Together branding (#BA0C2F)
- Full dark mode support
- Multi-endpoint API testing (e.g., `/tts`, `/voices`, `/models`)
- Audio response playback for voice APIs
- Schema-driven default request bodies
- Route existence checking for page previews
- Sandpack live code editor for components

**Auto-populated from `registry.json`** - no manual configuration needed.

### Component & Page Templates

Templates for creating new UI elements (installed to `.claude/templates/`):

**Component Template (`templates/component/`):**
```
Component.tsx         # Main component file
Component.types.ts    # TypeScript interfaces
Component.stories.tsx # Storybook story
Component.test.tsx    # Vitest unit test
index.ts              # Barrel export
```

**Page Template (`templates/page/`):**
```
page.tsx              # Next.js page component
page.e2e.test.ts      # Playwright E2E test
```

**Usage:**
When `/hustle-ui-create` runs, it uses these templates as starting points, customizing them based on your interview answers and brand guide.

---

## What's New in v3.7.0

### Hustle Branding
- **All API commands renamed** to `/hustle-api-*` prefix for brand consistency
- Command files renamed: `hustle-api-create.md`, `hustle-api-interview.md`, etc.
- 8 total Hustle API commands:
  - `/hustle-api-create` - Complete 13-phase workflow
  - `/hustle-api-interview` - Structured interview
  - `/hustle-api-research` - Adaptive research
  - `/hustle-api-verify` - Manual verification
  - `/hustle-api-env` - Environment check
  - `/hustle-api-status` - Progress tracking
  - `/hustle-api-continue` - Resume interrupted workflow
  - `/hustle-api-sessions` - Browse saved sessions

### Comprehensive File Structure Documentation
- Detailed documentation of exact files installed
- Shows both package structure and project installation structure
- Clear separation: commands (28), hooks (34), templates (16)

### Multi-API State Support
- State file now supports multiple concurrent API workflows
- Switch between workflows without losing progress
- New `active_endpoint` pointer with `endpoints` object
- Automatic migration from single-endpoint state format

### Session Logging
- Every `/hustle-api-create` workflow saved to `.claude/hustle-api-sessions/`
- Browse with `/hustle-api-sessions --list`
- View session details with `/hustle-api-sessions --view [endpoint]`
- Session includes: state snapshot, files created, research cache, summary

### Session Continuation
- New `/hustle-api-continue [endpoint]` command to resume interrupted workflows
- `detect-interruption.py` hook prompts at session start
- Automatically restores context and interview decisions
- Resume from any phase

### Research Cache Creation
- New `cache-research.py` PostToolUse hook
- Creates missing `sources.json`, `interview.json`, `schema.json`
- Updates research `index.json` for freshness tracking
- Fixes critical gap where cache files were expected but never created

### Feature Scope Tracking
- New `track-scope-coverage.py` hook tracks feature decisions
- Records implemented vs deferred features
- Calculates scope coverage percentage
- Included in Phase 13 completion output

### Question Validation
- New `enforce-questions-sourced.py` hook
- Validates interview questions reference research terms
- Prevents generic template questions
- Ensures questions come FROM discovered parameters

### Automatic Manifest Generation
- New `generate-manifest-entry.py` PostToolUse hook
- Auto-generates `api-tests-manifest.json` entry from Zod schema
- Parses schema to extract ALL parameters with types, required flags, descriptions
- Generates multiple curl examples (minimal, full, with auth)
- Creates test case definitions from schema
- Complete documentation automation - no manual manifest updates needed

### SPEC.json Single Source of Truth
- New `templates/SPEC.json` defines entire system
- All 13 phases with state keys, hooks, completion conditions
- All 24 hooks with events and actions
- All 9 commands with usage and phases
- Prevents drift between README, hooks, and state

### New Hooks (8 total)
| Hook | Event | Purpose |
|------|-------|---------|
| `detect-interruption.py` | SessionStart | Prompt to resume workflows |
| `cache-research.py` | PostToolUse | Create research cache files |
| `session-logger.py` | Stop | Save session logs |
| `enforce-questions-sourced.py` | PreToolUse | Validate questions from research |
| `enforce-schema-from-interview.py` | PreToolUse | Validate schema matches interview |
| `track-scope-coverage.py` | PostToolUse | Track feature decisions |
| `generate-manifest-entry.py` | PostToolUse | Auto-generate api-tests-manifest.json entry |
| `enforce-freshness.py` | PreToolUse | Block writes if research >7 days old for active endpoint |

### Bug Fixes
- `session-startup.py`: Fixed to read research index from `.claude/research/index.json` file (not state)
- `enforce-documentation.py`: No longer blocks on missing cache files
- `track-tool-use.py`: Now populates research index.json for freshness tracking

---

## What's New in v3.6.5

### 1-Indexed Phase Numbering
- Changed from 0-indexed (Phase 0-12) to 1-indexed (Phase 1-13)
- More human-readable: Phase 1 starts the workflow, Phase 13 completes it
- All documentation, hooks, and demo updated consistently

## What's New in v3.6.1

### README Improvements
- Removed verbose ASCII workflow simulations (was 798 lines)
- Added comprehensive explanations for all 13 phases
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

## All Hooks Reference (34 Hooks)

This section documents every hook in the system with detailed explanations, examples, and troubleshooting guidance. Hooks are organized by event type.

### Hook Event Types

| Event | When It Fires | Purpose |
|-------|--------------|---------|
| **SessionStart** | When Claude Code session begins | Inject context, detect interrupted workflows |
| **UserPromptSubmit** | When user sends a message | Detect API-related requests, require research |
| **PreToolUse** | Before Claude calls a tool | Block operations until requirements met |
| **PostToolUse** | After Claude calls a tool | Track progress, cache data, trigger next phases |
| **Stop** | When conversation ends | Verify completion, save session logs |

---

### SessionStart Hooks (2)

<details>
<summary><strong>session-startup.py</strong> - Inject State Context</summary>

**Event:** SessionStart
**Purpose:** Inject workflow state and research freshness warnings at session start

**The Problem It Solves:**
When you start a new Claude session, Claude has no memory of previous workflows. Without context injection:
- Claude doesn't know which endpoint you're working on
- Claude forgets your interview decisions
- Claude doesn't know which phases are complete
- Research freshness warnings are missed

**How It Works:**
1. Reads `.claude/api-dev-state.json` to find active endpoint
2. Reads `.claude/research/index.json` to check research freshness
3. Injects summary into Claude's context:
   - Active endpoint name and status
   - Current phase and next steps
   - Interview decisions (if any)
   - Research freshness warnings (if >7 days old)

**Example 1: Fresh Session with In-Progress Workflow**
```
Starting Claude session...

📊 WORKFLOW STATE INJECTED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Active endpoint: brandfetch
Status: in_progress
Current phase: Phase 8 (TDD Red)
Next: Write failing tests

Interview decisions:
- response_format: json_with_urls
- caching: 24h
- assets: logos, colors

Research freshness: 2 days old (fresh)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 2: Session with Stale Research**
```
Starting Claude session...

📊 WORKFLOW STATE INJECTED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Active endpoint: brandfetch
Status: complete

⚠️ WARNING: Research is 9 days old
Consider running: /hustle-api-research brandfetch
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 3: Fresh Session with No Active Workflow**
```
Starting Claude session...

📊 No active API workflow detected.
Use /hustle-api-create [endpoint] to start a new workflow.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Troubleshooting:**
- If state isn't injected: Check that `.claude/api-dev-state.json` exists
- If research freshness wrong: Verify `.claude/research/index.json` has correct timestamps

</details>

<details>
<summary><strong>detect-interruption.py</strong> - Resume Interrupted Workflows</summary>

**Event:** SessionStart
**Purpose:** Detect and prompt to resume interrupted workflows

**The Problem It Solves:**
Sessions get interrupted - computer restarts, timeouts, crashes. Without detection:
- You forget where you left off
- You start over unnecessarily
- Work is duplicated

**How It Works:**
1. Reads state file for endpoints with `status: "in_progress"`
2. Checks for `session.interrupted_at` timestamp
3. If found, injects prompt asking user to resume

**Example 1: Detecting Interrupted Mid-Phase**
```
🔄 INTERRUPTED WORKFLOW DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Endpoint: brandfetch
Last activity: 2025-12-11T15:30:00Z (2 hours ago)
Interrupted at: Phase 9 (TDD Green)

Completed phases: 1-8
Next phase: Continue TDD Green

Resume this workflow?
  [Yes] - Continue from Phase 9
  [No]  - Start fresh with /hustle-api-create
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 2: Multiple Interrupted Workflows**
```
🔄 MULTIPLE INTERRUPTED WORKFLOWS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[A] brandfetch - Phase 9 (TDD Green) - 2h ago
[B] elevenlabs - Phase 4 (Interview) - 1d ago
[C] Start fresh workflow

Which would you like to resume?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 3: No Interrupted Workflows**
```
✅ No interrupted workflows detected.
All endpoints: complete or not_started.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Troubleshooting:**
- Not detecting interruption: Check `session.interrupted_at` in state file
- Wrong phase shown: Verify phase statuses in state file

</details>

---

### UserPromptSubmit Hooks (1)

<details>
<summary><strong>enforce-external-research.py</strong> - Require Research for API Terms</summary>

**Event:** UserPromptSubmit
**Purpose:** Detect API-related terms in user prompts and require research before proceeding

**The Problem It Solves:**
Users ask "add Stripe payment support" and Claude jumps straight to implementation using training data. Without enforcement:
- Claude uses outdated API knowledge
- No research phase happens
- Implementation uses wrong endpoints/parameters

**How It Works:**
1. Scans user prompt for API-related keywords (SDK names, API terms, library names)
2. Checks if research exists in `.claude/research/` for detected terms
3. If no research found, injects warning requiring `/hustle-api-research` first

**Detection Keywords:**
- SDK/API names: "Stripe", "Brandfetch", "ElevenLabs", "OpenAI", etc.
- Generic terms: "API", "SDK", "integration", "webhook", "endpoint"
- Package patterns: "@scope/package", "npm package", "library"

**Example 1: Detecting API Request Without Research**
```
User: "Add Stripe payment processing to the checkout"

⚠️ EXTERNAL API DETECTED: Stripe
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
No research found for "Stripe" in .claude/research/

Action required:
Run /hustle-api-research stripe before implementation.

Why this matters:
- Stripe API changes frequently
- Payment APIs require exact parameter names
- Auth methods vary by region
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 2: API Already Researched (Fresh)**
```
User: "Add Brandfetch integration"

✅ Research found: brandfetch
Last updated: 2 days ago (fresh)
Proceeding with workflow...
```

**Example 3: API Researched But Stale**
```
User: "Update the ElevenLabs voice endpoint"

⚠️ STALE RESEARCH: elevenlabs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Last researched: 12 days ago

Recommended: Run /hustle-api-research elevenlabs
Or continue with stale cache (not recommended)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Troubleshooting:**
- False positives: Add terms to ignore list in hook
- Missing detection: Add new API names to keyword list

</details>

---

### PreToolUse Hooks - Write/Edit Blocking (20)

These hooks block Write/Edit operations until their phase requirements are met.

<details>
<summary><strong>enforce-disambiguation.py</strong> - Phase 1 Enforcement</summary>

**Event:** PreToolUse (Write|Edit)
**Purpose:** Block all file writes until disambiguation is complete

**The Problem It Solves:**
"Brandfetch" could mean multiple things. Without disambiguation:
- Claude picks wrong interpretation
- Hours wasted on wrong implementation
- User discovers mismatch too late

**How It Works:**
1. Checks state for `phases.disambiguation.status`
2. If not "complete", blocks Write/Edit with Exit Code 2
3. Requires `user_question_asked = true` AND `phase_exit_confirmed = true`

**Example 1: Blocking Before Disambiguation**
```
Claude: "I'll start writing the route.ts file..."

🚫 BLOCKED: Phase 1 (Disambiguation) incomplete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Before writing any code, we need to clarify what
"brandfetch" means in your context.

Possible interpretations:
- Brandfetch REST API
- @brandfetch/sdk npm package
- Custom brand fetching logic

Please run disambiguation first.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 2: Blocking Self-Answered Disambiguation**
```
Claude: "I'll assume you mean the REST API and start coding..."

🚫 BLOCKED: User confirmation required
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 1 requires explicit user selection.
Claude cannot self-answer disambiguation questions.

user_question_asked: false
phase_exit_confirmed: false

Ask the user which interpretation they need.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 3: Allowed After Proper Disambiguation**
```
State file shows:
{
  "disambiguation": {
    "status": "complete",
    "user_question_asked": true,
    "user_selected": "Brandfetch REST API",
    "phase_exit_confirmed": true
  }
}

Claude: "Now writing route.ts..."
✅ Write operation allowed
```

</details>

<details>
<summary><strong>enforce-scope.py</strong> - Phase 2 Enforcement</summary>

**Event:** PreToolUse (Write|Edit)
**Purpose:** Block writes until scope is confirmed by user

**The Problem It Solves:**
Claude assumes scope without confirmation. User says "fetch brands" but Claude builds entire CMS with auth, caching, database. Without scope enforcement:
- Scope drift happens silently
- Requirements are misunderstood
- Wasted effort on unwanted features

**How It Works:**
1. Checks `phases.scope.status` and `phase_exit_confirmed`
2. Blocks until user explicitly confirms scope description
3. Requires affirmative response ("yes", "correct", "looks good")

**Example 1: Blocking Before Scope Confirmation**
```
Claude: "I'll write the endpoint now..."

🚫 BLOCKED: Phase 2 (Scope) not confirmed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Before implementation, confirm the endpoint scope.

Current understanding:
"Fetch brand assets from Brandfetch API"

Is this scope correct? User must confirm.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 2: User Correction Flow**
```
Claude: "Scope: Fetch brand logos from Brandfetch API"
User: "No, I also need colors and fonts"

State updates:
{
  "scope": {
    "status": "in_progress",
    "description": "Fetch logos, colors, and fonts",
    "confirmed": false
  }
}

Claude: "Updated: Fetch logos, colors, and fonts. Correct now?"
User: "Yes"

State updates to complete, writes now allowed.
```

**Example 3: Preventing Assumed Scope**
```
Claude: "I'll add caching, rate limiting, and database persistence..."

🚫 BLOCKED: These features not in confirmed scope
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Confirmed scope: "Fetch brand assets"

Attempting to add: caching, rate limiting, database

These features must be explicitly confirmed in scope.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

</details>

<details>
<summary><strong>enforce-research.py</strong> - Phase 3 Enforcement</summary>

**Event:** PreToolUse (Write|Edit)
**Purpose:** Block implementation until research is complete

**The Problem It Solves:**
Claude implements from training data instead of current documentation. APIs change constantly - endpoints renamed, auth methods updated, parameters deprecated. Without research enforcement:
- Implementations use outdated knowledge
- Integration failures in production
- Debugging nightmare

**How It Works:**
1. Checks `phases.research_initial.sources` array
2. Requires at least 2 sources (Context7 + WebSearch)
3. Blocks Write/Edit with Exit Code 2 if sources < 2

**Example 1: Blocking Without Research**
```
Claude: "I'll implement the Brandfetch API call..."

🚫 BLOCKED: Phase 3 (Research) incomplete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Research sources: 0
Required: 2 (Context7 + WebSearch)

Cannot implement without current documentation.

Run these first:
1. Context7: resolve-library-id "brandfetch"
2. WebSearch: "Brandfetch API authentication 2025"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 2: Partial Research (Only WebSearch)**
```
Claude: "I searched the web, now I'll code..."

🚫 BLOCKED: Insufficient research
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Research sources: 1
Required: 2

Sources found:
  ✓ websearch:brandfetch-api-2025
  ✗ context7 (missing)

Also run Context7 to get code examples and
parameter details from npm/GitHub.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 3: Research Complete, Implementation Allowed**
```
State shows:
{
  "research_initial": {
    "sources": [
      "context7:/brandfetch/api-docs",
      "websearch:brandfetch-api-2025"
    ],
    "phase_exit_confirmed": true
  }
}

Claude: "Based on research, I'll implement..."
✅ Write operation allowed
```

</details>

<details>
<summary><strong>enforce-interview.py</strong> - Phase 4 Enforcement</summary>

**Event:** PreToolUse (Write|Edit)
**Purpose:** Block implementation until interview decisions are made

**The Problem It Solves:**
Claude makes decisions without asking. "What format?" - "I'll use JSON." Without waiting for your answer:
- You lose control of requirements
- Assumptions don't match needs
- Rework required later

**How It Works:**
1. Checks `phases.interview.structured_question_count >= 3`
2. Checks `phases.interview.decisions` has required keys
3. Blocks Write/Edit until interview complete
4. Also INJECTS interview decisions during implementation

**Example 1: Blocking Self-Answered Questions**
```
Claude: "Which format do you want?"
Claude: "I'll use JSON since it's standard..."

🚫 BLOCKED: Interview self-answer detected
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Claude asked a question but answered it without
waiting for user response.

Question: "Which format do you want?"
Expected: User response
Got: Claude self-answered with "JSON"

User must answer interview questions.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 2: Decision Injection During Implementation**
```
State contains:
{
  "interview": {
    "decisions": {
      "response_format": "json_with_urls",
      "caching": "24h"
    }
  }
}

When Claude writes route.ts, hook injects:

📋 INTERVIEW DECISIONS (use these):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- response_format: json_with_urls
- caching: 24h (set Cache-Control header)

Implement according to these decisions.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 3: Insufficient Questions**
```
Claude: "I asked 1 question, now implementing..."

🚫 BLOCKED: Insufficient interview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Questions asked: 1
Required: 3 minimum

Research discovered 5 configurable parameters:
- response_format (not asked)
- caching (not asked)
- error_handling (asked)
- rate_limiting (not asked)
- assets_to_include (not asked)

Ask about discovered parameters.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

</details>

<details>
<summary><strong>enforce-deep-research.py</strong> - Phase 5 Enforcement</summary>

**Event:** PreToolUse (Write|Edit)
**Purpose:** Block implementation until deep research on interview answers is complete

**The Problem It Solves:**
Initial research provides overview. But your specific choices need deeper investigation. You chose "expose rate headers" - but which headers exactly? Without deep research:
- Implementation uses wrong header names
- Edge cases missed
- Integration breaks on specifics

**How It Works:**
1. Compares `proposed_searches` to `executed_searches`
2. All approved searches must be executed
3. Blocks if approved searches remain unexecuted

**Example 1: Approved Search Not Executed**
```
State shows:
{
  "research_deep": {
    "proposed_searches": ["rate-headers", "error-format"],
    "approved_searches": ["rate-headers", "error-format"],
    "executed_searches": ["rate-headers"]
  }
}

Claude: "Time to write the implementation..."

🚫 BLOCKED: Deep research incomplete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Approved searches: 2
Executed searches: 1

Missing:
  ✗ error-format (approved but not searched)

Execute remaining searches before implementing.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 2: Adaptive Search Based on Decisions**
```
Interview decisions:
{
  "error_handling": "return_objects",
  "rate_limiting": "expose_headers"
}

Hook auto-proposes related searches:
- "Brandfetch error response structure" (from error_handling)
- "Brandfetch rate limit headers" (from rate_limiting)

These must be approved and executed.
```

**Example 3: Skip Feature = Skip Search**
```
Interview decisions:
{
  "assets": ["logos", "colors"]  // fonts NOT included
}

Hook does NOT propose:
- "Brandfetch font API" (not needed)

Skipped searches don't block implementation.
```

</details>

<details>
<summary><strong>enforce-schema.py</strong> - Phase 6 Enforcement</summary>

**Event:** PreToolUse (Write|Edit)
**Purpose:** Block route implementation until Zod schema exists

**The Problem It Solves:**
Tests and implementation drift apart when there's no contract. Tests expect `logoUrl`, implementation returns `logo_url`. Without schema enforcement:
- Type mismatches
- Validation gaps
- Runtime errors in production

**How It Works:**
1. Checks for schema file at `src/lib/schemas/{endpoint}.ts`
2. Validates schema includes request AND response types
3. Blocks route.ts writes until schema exists

**Example 1: Blocking Route Without Schema**
```
Claude: "I'll write the route handler..."

🚫 BLOCKED: Phase 6 (Schema) not complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Expected schema file:
  src/lib/schemas/brandfetch.ts

Status: Does not exist

Create Zod schema first with:
- Request validation (query params, body)
- Response structure (success and error)
- Type exports for tests

Then route.ts can import and use it.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 2: Schema Missing Response Types**
```
Schema exists but incomplete:

// src/lib/schemas/brandfetch.ts
export const BrandfetchRequest = z.object({...})
// Missing: BrandfetchResponse, BrandfetchError

🚫 BLOCKED: Schema incomplete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Schema file exists but missing:
  ✗ Response schema (success case)
  ✗ Error schema (error cases)

Add these before implementing route.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 3: Complete Schema Allows Implementation**
```
Schema file contains:
- BrandfetchRequest
- BrandfetchResponse
- BrandfetchError
- Type exports

✅ Schema validation passed
Route implementation allowed.
```

</details>

<details>
<summary><strong>enforce-environment.py</strong> - Phase 7 Enforcement</summary>

**Event:** PreToolUse (Write|Edit)
**Purpose:** Block implementation until required API keys are verified

**The Problem It Solves:**
Implementation uses `process.env.BRANDFETCH_API_KEY` but the key doesn't exist. Tests fail with auth errors. Without environment check:
- Confusing test failures
- "Works on my machine" issues
- Missing keys discovered too late

**How It Works:**
1. Reads schema to identify required env vars
2. Checks if keys exist in environment
3. Blocks implementation if keys missing

**Example 1: Missing API Key**
```
Claude: "I'll implement the API call..."

🚫 BLOCKED: Phase 7 (Environment) failed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Required keys:
  ✗ BRANDFETCH_API_KEY (not found)

Add to .env.local:
BRANDFETCH_API_KEY=your-key-here

Or run: /hustle-api-env brandfetch
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 2: Multiple Keys Required**
```
Schema indicates multiple services:

🚫 BLOCKED: Missing API keys
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ OPENAI_API_KEY (found)
  ✗ BRANDFETCH_API_KEY (missing)
  ✗ REDIS_URL (missing)

Add missing keys before implementing.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 3: All Keys Present**
```
✅ Environment check passed
  ✓ BRANDFETCH_API_KEY (found)
  ✓ Length: 32 characters

Implementation allowed.
```

</details>

<details>
<summary><strong>enforce-tdd-red.py</strong> - Phase 8 Enforcement</summary>

**Event:** PreToolUse (Write|Edit)
**Purpose:** Block route implementation until failing tests exist

**The Problem It Solves:**
TDD requires tests BEFORE implementation. Without this order:
- Tests written to match buggy implementation
- Requirements not encoded as tests
- "It works" isn't provable

**How It Works:**
1. Checks for test file at `__tests__/*.test.ts`
2. Verifies tests exist and are failing (RED state)
3. Blocks route.ts writes until tests written

**Example 1: No Test File**
```
Claude: "I'll implement the endpoint..."

🚫 BLOCKED: Phase 8 (TDD Red) incomplete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
No test file found.
Expected: src/app/api/v2/brandfetch/__tests__/*.test.ts

TDD requires:
1. Write failing tests first (RED)
2. Then implement to pass (GREEN)
3. Then refactor

Run /red to write failing tests.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 2: Tests Exist But Already Passing**
```
Test file exists but tests pass (no implementation yet??)

🚫 BLOCKED: Tests not in RED state
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tests found: 5
Passing: 5
Failing: 0

TDD Red phase requires FAILING tests.
Tests should fail because route.ts doesn't exist.

Check: Are tests actually testing the right endpoint?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 3: Tests Properly Failing**
```
✅ TDD Red phase complete
Tests: 10
Failing: 10 (expected - no implementation yet)

Now implement route.ts to make them pass.
```

</details>

<details>
<summary><strong>verify-implementation.py</strong> - Phase 9 Helper</summary>

**Event:** PreToolUse (Write|Edit)
**Purpose:** Validate implementation matches research findings

**The Problem It Solves:**
Claude implements from memory, not research. Research said `imageFormat`, Claude writes `format`. Without verification:
- Parameter names wrong
- Implementation drifts from docs
- Subtle bugs in production

**How It Works:**
1. Compares implementation against research findings
2. Checks parameter names, types, endpoints match
3. Blocks or warns on critical mismatches

**Example 1: Wrong Parameter Name**
```
Research found: imageFormat
Implementation uses: format

⚠️ MISMATCH DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Parameter name differs from documentation:
  Research: imageFormat
  Code: format

This will cause API errors.

Fix the parameter name before continuing.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 2: Wrong Endpoint URL**
```
Research found: https://api.brandfetch.io/v2/{domain}
Implementation uses: https://api.brandfetch.io/v1/{domain}

🚫 BLOCKED: Wrong API version
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Research indicates v2 endpoint.
Code uses v1 (deprecated).

Update to: api.brandfetch.io/v2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 3: Implementation Matches Research**
```
✅ Implementation verification passed
- Endpoint URL: matches
- Parameters: all 4 match
- Auth method: matches

Implementation aligned with documentation.
```

</details>

<details>
<summary><strong>enforce-verify.py</strong> - Phase 10 Enforcement</summary>

**Event:** PreToolUse (Write|Edit)
**Purpose:** Block refactoring until post-implementation verification is complete

**The Problem It Solves:**
Even after researching in Phase 3, Claude forgets details by Phase 9. Twenty messages of context dilution. Without re-verification:
- Memory-based implementation errors
- Gaps not caught
- Silent drift from current docs

**How It Works:**
1. Requires re-research after tests pass (GREEN)
2. Compares implementation to FRESH documentation
3. Identifies gaps: documented but not implemented
4. Blocks refactoring until gaps addressed or documented

**Example 1: Verification Not Done**
```
Claude: "Tests pass! Now I'll refactor..."

🚫 BLOCKED: Phase 10 (Verify) not complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
After TDD Green, verification is required.

This phase:
1. Re-fetches current documentation
2. Compares against your implementation
3. Identifies gaps or mismatches

Run /hustle-api-verify brandfetch
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 2: Gaps Found, Decision Required**
```
Verification found gaps:

🔍 GAP ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Feature         | Docs | Impl | Status
----------------|------|------|--------
include_fonts   | ✓    | ✗    | GAP
webhook_url     | ✓    | ✗    | GAP

Options:
  [A] Loop back - implement missing features
  [B] Skip - document as intentional omissions

Your choice required to continue.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 3: Verification Complete**
```
✅ Verification complete
- Re-researched: yes
- Gaps found: 1
- Gaps fixed: 0
- Intentional omissions: ["include_fonts"]

Refactoring now allowed.
```

</details>

<details>
<summary><strong>enforce-refactor.py</strong> - Phase 11 Enforcement</summary>

**Event:** PreToolUse (Write|Edit)
**Purpose:** Ensure refactoring doesn't change behavior (tests stay green)

**The Problem It Solves:**
Refactoring can accidentally change behavior. Without enforcement:
- "Just cleaning up" introduces bugs
- Tests deleted to make refactor "work"
- Behavior changes go unnoticed

**How It Works:**
1. Checks tests are passing before refactor
2. Blocks if tests start failing during refactor
3. Prevents test deletion

**Example 1: Tests Failing During Refactor**
```
Claude refactors code...
Tests now failing: 3

🚫 BLOCKED: Refactor broke tests
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Refactoring must not change behavior.

Before refactor: 10/10 passing
After refactor: 7/10 passing

Failing tests:
- should return error object for invalid domain
- should handle rate limits
- should include colors in response

Revert changes or fix the implementation.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 2: Preventing Test Deletion**
```
Claude: "I'll remove redundant tests..."

🚫 BLOCKED: Cannot delete tests during refactor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test count before: 10
Test count after: 7

Refactor phase allows:
  ✓ Code restructuring
  ✓ Variable renaming
  ✓ Comment additions
  ✓ Helper extraction

Refactor phase forbids:
  ✗ Test deletion
  ✗ Behavior changes
  ✗ Feature additions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 3: Successful Refactor**
```
Refactoring changes:
- Extracted fetchBrandData helper
- Renamed variables for clarity
- Added JSDoc comments

Tests: 10/10 passing (unchanged)

✅ Refactor validated - behavior preserved
```

</details>

<details>
<summary><strong>enforce-documentation.py</strong> - Phase 12 Enforcement</summary>

**Event:** PreToolUse (Write|Edit)
**Purpose:** Block completion until documentation is updated

**The Problem It Solves:**
Implementation done but docs forgotten. Next developer (or Claude session) has no context. Without doc enforcement:
- Knowledge lost
- Research repeated
- Decisions forgotten

**How It Works:**
1. Checks research cache exists (`.claude/research/{endpoint}/`)
2. Checks API manifest updated
3. Blocks completion until docs current

**Example 1: Missing Research Cache**
```
Claude: "All done! Workflow complete..."

🚫 BLOCKED: Phase 12 (Documentation) incomplete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Research cache not found:
  ✗ .claude/research/brandfetch/CURRENT.md
  ✗ .claude/research/brandfetch/sources.json

Cache preserves research for future sessions.
Run cache-research.py or complete doc phase.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 2: Manifest Not Updated**
```
🚫 BLOCKED: API manifest not updated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
New endpoint "brandfetch" not found in:
  src/app/api-test/api-tests-manifest.json

Manifest must include:
- Endpoint path
- Request schema
- Response examples
- Test cases

Update manifest to complete documentation.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 3: Documentation Complete**
```
✅ Documentation phase complete
  ✓ Research cached
  ✓ Manifest updated
  ✓ Freshness: 0 days

Ready for Phase 13 (Completion).
```

</details>

<details>
<summary><strong>enforce-questions-sourced.py</strong> - Validate Interview Questions</summary>

**Event:** PreToolUse (AskUserQuestion)
**Purpose:** Ensure interview questions come from research, not generic templates

**The Problem It Solves:**
Generic questions don't reflect actual API capabilities. "What format do you want?" when API only supports JSON. Without validation:
- Impossible requirements set
- Options don't match reality
- Wasted interview time

**How It Works:**
1. Parses question for parameter references
2. Compares to parameters discovered in research
3. Blocks questions not grounded in research

**Example 1: Generic Question Blocked**
```
Claude: "What caching strategy do you prefer?"

🚫 BLOCKED: Question not grounded in research
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Question asks about: caching
Research findings: No caching parameters found

Brandfetch API doesn't support caching parameters.
Caching would be client-side implementation choice.

Rephrase as: "Should we implement client-side caching?"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 2: Question With Invalid Options**
```
Claude: "Which format: JSON, XML, or CSV?"

🚫 BLOCKED: Options don't match API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Question offers: JSON, XML, CSV
API supports: JSON only

Research shows Brandfetch returns JSON exclusively.
Don't offer XML/CSV as options.

Valid question: "JSON response with URLs or embedded base64?"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 3: Valid Research-Based Question**
```
Research found: imageFormat supports "svg", "png", "jpg"

Claude: "Which image formats do you need? [svg/png/jpg/all]"

✅ Question validated
- Parameter: imageFormat
- Options: match research findings
```

</details>

<details>
<summary><strong>enforce-schema-from-interview.py</strong> - Validate Schema Matches Decisions</summary>

**Event:** PreToolUse (Write|Edit on schema files)
**Purpose:** Ensure schema reflects interview decisions

**The Problem It Solves:**
Interview says "JSON with URLs", schema defines base64. Decisions get forgotten. Without validation:
- Schema doesn't match requirements
- Tests test wrong behavior
- Implementation doesn't match decisions

**How It Works:**
1. Reads interview decisions from state
2. Parses schema being written
3. Validates schema fields match decisions

**Example 1: Schema Missing Decided Fields**
```
Interview decided: assets = ["logos", "colors"]

Schema being written:
{
  response: {
    logos: z.array(...)
    // colors missing!
  }
}

🚫 BLOCKED: Schema doesn't match interview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Interview decision: Include colors
Schema: Colors field missing

Add colors field to match your decisions.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 2: Schema With Undecided Fields**
```
Interview decided: assets = ["logos"]

Schema includes fonts (not decided):

⚠️ WARNING: Schema includes undecided field
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Field "fonts" not in interview decisions.

If you need fonts:
1. Return to interview phase
2. Confirm fonts inclusion with user

Or remove fonts from schema.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 3: Schema Matches Interview**
```
Interview: response_format = "json_with_urls"
Schema: Uses .url() for asset URLs

Interview: caching = "24h"
Schema: Includes cached: z.boolean()

✅ Schema matches all interview decisions
```

</details>

<details>
<summary><strong>enforce-freshness.py</strong> - Block Stale Research (v3.7.0+)</summary>

**Event:** PreToolUse (Write|Edit on API-related files)
**Purpose:** Block implementation when research is stale (>7 days old)

**The Problem It Solves:**
APIs change constantly. Research from 2 weeks ago may be outdated. Without freshness enforcement:
- Implementations use old parameters
- Breaking changes missed
- Silent integration failures

**How It Works:**
1. Checks if file being written is API-related
2. Gets active endpoint from state
3. Checks research freshness from index.json
4. Blocks if research > threshold days old

**Example 1: Stale Research Blocks Write**
```
Claude: "I'll update the route handler..."

🔄 STALE RESEARCH DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Research for 'brandfetch' is 9 days old (threshold: 7)

Action Required:
Run /hustle-api-research brandfetch to refresh.

Why This Matters:
- API documentation may have changed
- New parameters may be available
- Breaking changes may exist
- Your implementation may not match current docs

Last researched: 2025-12-02T15:30:00Z
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 2: Configurable Threshold**
```json
{
  "endpoints": {
    "brandfetch": {
      "freshness_threshold_days": 14
    }
  }
}

Research is 10 days old but threshold is 14.
✅ Write allowed (within custom threshold)
```

**Example 3: Disable Enforcement**
```json
{
  "endpoints": {
    "brandfetch": {
      "enforce_freshness": false
    }
  }
}

Research is 30 days old.
✅ Write allowed (enforcement disabled)

⚠️ Not recommended - use at your own risk
```

</details>

<details>
<summary><strong>check-storybook-setup.py</strong> - Verify Storybook Installed (v3.9.0+)</summary>

**Event:** PreToolUse (Write on `.stories.tsx` files)
**Purpose:** Block story file creation until Storybook is configured

**The Problem It Solves:**
Creating story files without Storybook installed is pointless. Without this check:
- Story files created but can't run
- Confusing error messages later
- Wasted development effort

**How It Works:**
1. Detects Write operation on `*.stories.tsx` files
2. Checks for `.storybook/` directory
3. Verifies `main.ts` or `main.js` config exists
4. If missing, blocks with installation instructions

**Example: Storybook Not Installed**
```
Claude: "I'll create the Button story file..."

🚫 STORYBOOK NOT CONFIGURED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Storybook is not configured in this project.

Before writing story files, please install Storybook:

  npx storybook@latest init

This will create the .storybook/ directory and configuration.
After installation, run 'pnpm storybook' to start the dev server.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example: Storybook Configured**
```
.storybook/main.ts found.
✅ Write allowed - Storybook is configured.
```

</details>

<details>
<summary><strong>check-playwright-setup.py</strong> - Verify Playwright Installed (v3.9.0+)</summary>

**Event:** PreToolUse (Write on `.e2e.test.ts` files)
**Purpose:** Block E2E test file creation until Playwright is configured

**The Problem It Solves:**
Creating E2E test files without Playwright installed is pointless. Without this check:
- Test files created but can't run
- CI/CD failures
- Wasted development effort

**How It Works:**
1. Detects Write operation on `*.e2e.test.ts` files
2. Checks for `playwright.config.ts` or `playwright.config.js`
3. If missing, blocks with installation instructions

**Example: Playwright Not Installed**
```
Claude: "I'll create the dashboard E2E tests..."

🚫 PLAYWRIGHT NOT CONFIGURED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Playwright is not configured in this project.

Before writing E2E test files, please install Playwright:

  npm init playwright@latest

This will create playwright.config.ts and test examples.
After installation, run 'npx playwright test' to run tests.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example: Playwright Configured**
```
playwright.config.ts found.
✅ Write allowed - Playwright is configured.
```

</details>

---

### PostToolUse Hooks - Tracking (9)

These hooks run after tool calls to track progress and trigger next phases.

<details>
<summary><strong>track-tool-use.py</strong> - Log All Tool Usage</summary>

**Event:** PostToolUse (WebSearch|WebFetch|mcp__context7.*|AskUserQuestion)
**Purpose:** Track research queries and increment turn counter

**The Problem It Solves:**
Without tracking, we can't know:
- What was researched
- How many turns have passed
- When to re-ground context

**How It Works:**
1. Logs tool name and parameters to state
2. Increments turn_count
3. Updates research_queries array
4. Updates research index.json for freshness

**Example 1: Research Query Logged**
```
Claude calls: mcp__context7__get-library-docs
Parameter: /brandfetch/api-docs

State updated:
{
  "research_queries": [
    {
      "tool": "context7",
      "query": "/brandfetch/api-docs",
      "timestamp": "2025-12-11T15:32:00Z"
    }
  ]
}
```

**Example 2: Turn Counter Incremented**
```
Before: turn_count = 14
Claude sends message
After: turn_count = 15

(Re-grounding will trigger at turn 21)
```

**Example 3: Research Index Updated**
```
.claude/research/index.json updated:
{
  "apis": {
    "brandfetch": {
      "last_updated": "2025-12-11T15:32:00Z",
      "source_count": 2
    }
  }
}
```

</details>

<details>
<summary><strong>periodic-reground.py</strong> - Context Refresh Every 7 Turns</summary>

**Event:** PostToolUse (WebSearch|WebFetch|mcp__context7.*|AskUserQuestion)
**Purpose:** Re-inject state context every 7 turns to prevent dilution

**The Problem It Solves:**
Long conversations lose context. By turn 40, Claude forgets turn 10 decisions. Without re-grounding:
- Interview decisions forgotten
- Research findings diluted
- Implementation drifts from requirements

**How It Works:**
1. Checks turn_count % 7 === 0
2. If true, injects state summary
3. Logs re-grounding event to history

**Example 1: Turn 7 Re-grounding**
```
Turn 7 reached...

📋 RE-GROUNDING CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current phase: interview
Active endpoint: brandfetch

Interview decisions so far:
- response_format: json_with_urls

Research sources:
- context7:/brandfetch/api-docs
- websearch:brandfetch-api-2025

Intentional omissions: none yet
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 2: Turn 28 Re-grounding (Mid-Implementation)**
```
Turn 28 reached...

📋 RE-GROUNDING CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current phase: tdd_green
Active endpoint: brandfetch

Interview decisions:
- response_format: json_with_urls
- caching: 24h
- error_handling: return_objects
- assets: logos, colors

Tests: 10 written, 3 passing

Implement these features to pass remaining tests.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 3: Re-ground History Tracking**
```
State records all re-grounds:
{
  "reground_history": [
    { "turn": 7, "phase": "interview" },
    { "turn": 14, "phase": "tdd_red" },
    { "turn": 21, "phase": "tdd_green" },
    { "turn": 28, "phase": "tdd_green" }
  ]
}
```

</details>

<details>
<summary><strong>verify-after-green.py</strong> - Auto-Trigger Verification</summary>

**Event:** PostToolUse (Bash - test commands)
**Purpose:** Automatically trigger Phase 10 when all tests pass

**The Problem It Solves:**
Manual phase transitions get forgotten. Tests pass, developer moves on, verification skipped. Without auto-trigger:
- Verification phase forgotten
- Memory errors not caught
- Implementation drifts unnoticed

**How It Works:**
1. Detects test commands (pnpm test, vitest)
2. Parses stdout for pass/fail counts
3. If all passing, triggers Phase 10

**Example 1: Tests All Passing - Trigger Verification**
```
Claude runs: pnpm test

Output:
✓ returns brand data (124ms)
✓ handles errors (23ms)
✓ ... 8 more passing
Tests: 10 passing, 0 failing

🔄 AUTO-TRIGGERING PHASE 10
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
All tests passing!
Now verifying implementation against current docs.

This catches memory-based errors from
research → implementation drift.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 2: Tests Failing - No Trigger**
```
Claude runs: pnpm test

Output:
✓ returns brand data (124ms)
✗ handles rate limit
✗ returns error object
Tests: 8 passing, 2 failing

No auto-trigger. Continue fixing failing tests.
```

**Example 3: Non-Test Command Ignored**
```
Claude runs: pnpm build

Output: Build successful

Not a test command - no verification triggered.
```

</details>

<details>
<summary><strong>cache-research.py</strong> - Create Research Cache Files</summary>

**Event:** PostToolUse (Write|Edit)
**Purpose:** Create research cache files for future sessions

**The Problem It Solves:**
Research happens but files aren't created. Next session can't access findings. Without cache creation:
- Research repeated every session
- Freshness tracking broken
- Knowledge not preserved

**How It Works:**
1. Detects documentation phase completion
2. Creates `.claude/research/{endpoint}/` directory
3. Generates CURRENT.md, sources.json, interview.json, schema.json
4. Updates index.json for freshness tracking

**Example 1: Cache Files Created**
```
Documentation phase complete...

Creating research cache:
  ✓ .claude/research/brandfetch/CURRENT.md
  ✓ .claude/research/brandfetch/sources.json
  ✓ .claude/research/brandfetch/interview.json
  ✓ .claude/research/brandfetch/schema.json
  ✓ .claude/research/index.json (updated)

Research preserved for future sessions.
```

**Example 2: sources.json Content**
```json
{
  "created_at": "2025-12-11T16:00:00Z",
  "freshness_days": 7,
  "sources": [
    {
      "type": "context7",
      "id": "/brandfetch/api-docs",
      "fetched_at": "2025-12-11T15:32:00Z",
      "findings": ["base_url", "auth", "endpoints"]
    }
  ]
}
```

**Example 3: index.json Updated**
```json
{
  "apis": {
    "brandfetch": {
      "last_updated": "2025-12-11T16:00:00Z",
      "freshness_days": 7,
      "is_fresh": true,
      "cache_path": ".claude/research/brandfetch/"
    }
  }
}
```

</details>

<details>
<summary><strong>track-scope-coverage.py</strong> - Track Feature Implementation</summary>

**Event:** PostToolUse (Write|Edit|AskUserQuestion)
**Purpose:** Track implemented vs deferred features

**The Problem It Solves:**
API supports 10 features but you implement 6. Which 4 were skipped and why? Without tracking:
- No record of scope decisions
- Coverage unknown
- Intentional omissions undocumented

**How It Works:**
1. Tracks features discovered in research
2. Records user's implement/defer decisions
3. Calculates coverage percentage
4. Includes in completion output

**Example 1: Feature Decisions Tracked**
```
Interview question:
"Include fonts in response?"
User: "No, skip fonts for MVP"

State updated:
{
  "scope": {
    "discovered_features": ["logos", "colors", "fonts", "images"],
    "implemented_features": ["logos", "colors"],
    "deferred_features": [
      { "name": "fonts", "reason": "MVP scope" },
      { "name": "images", "reason": "Not needed" }
    ],
    "coverage_percent": 50
  }
}
```

**Example 2: Coverage Report**
```
📊 SCOPE COVERAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Discovered: 4 features
Implemented: 2 features (50%)
Deferred: 2 features

Implemented:
  ✓ logos
  ✓ colors

Deferred:
  ↷ fonts (MVP scope)
  ↷ images (not needed)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 3: Phase 13 Output Includes Coverage**
```
## Implementation Scope

Full API Capability: 4 features
This Implementation: 2 features (50%)

| Feature | Status | Reason |
|---------|--------|--------|
| logos | ✓ | - |
| colors | ✓ | - |
| fonts | deferred | MVP scope |
| images | deferred | Not needed |
```

</details>

<details>
<summary><strong>generate-manifest-entry.py</strong> - Auto-Generate API Documentation</summary>

**Event:** PostToolUse (Write|Edit on schema files)
**Purpose:** Automatically generate api-tests-manifest.json entry from schema

**The Problem It Solves:**
Manual manifest updates are tedious and error-prone. Schema and manifest drift apart. Without auto-generation:
- Documentation outdated
- Test UI missing endpoints
- Duplicate work

**How It Works:**
1. Parses Zod schema file
2. Extracts all parameters with types, required flags
3. Generates curl examples
4. Creates test case definitions
5. Updates api-tests-manifest.json

**Example 1: Manifest Entry Generated**
```
Schema file written: src/lib/schemas/brandfetch.ts

Auto-generating manifest entry...
  ✓ Parameters extracted: 4
  ✓ Curl examples: 3
  ✓ Test cases: 15
  ✓ Manifest updated

Generated entry added to api-tests-manifest.json
```

**Example 2: Generated Curl Examples**
```json
{
  "curlExamples": [
    {
      "name": "Minimal",
      "command": "curl 'http://localhost:3001/api/v2/brandfetch?domain=google.com'"
    },
    {
      "name": "Full",
      "command": "curl 'http://localhost:3001/api/v2/brandfetch?domain=google.com&mode=logo-only'"
    },
    {
      "name": "With Auth",
      "command": "curl -H 'X-Brandfetch-Key: YOUR_KEY' 'http://localhost:3001/api/v2/brandfetch?domain=google.com'"
    }
  ]
}
```

**Example 3: Generated Test Cases**
```json
{
  "testCases": [
    { "name": "Valid domain returns brand data", "type": "success" },
    { "name": "Missing domain returns 400", "type": "validation" },
    { "name": "Invalid domain format returns 400", "type": "validation" },
    { "name": "Rate limit returns 429", "type": "error" }
  ]
}
```

</details>

<details>
<summary><strong>update-registry.py</strong> - Update Central Registry</summary>

**Event:** PostToolUse (Write|Edit)
**Purpose:** Automatically update registry.json when API/component/page files are created

**The Problem It Solves:**
Manual registry updates are forgotten. Without auto-update:
- Registry out of sync with actual files
- Showcase pages show stale data
- `/hustle-combine` can't find new APIs

**How It Works:**
1. Detects when route.ts, Component.tsx, or page.tsx is written
2. Extracts endpoint name from file path
3. Updates appropriate registry section (apis, components, pages)
4. Sets status to "complete" when workflow finishes

**Example: API Added to Registry**
```
File written: src/app/api/v2/brandfetch/route.ts

Updating registry...
  ✓ Added brandfetch to registry.apis
  ✓ registry.json saved

Registry now contains 15 APIs, 8 components, 3 pages.
```

</details>

<details>
<summary><strong>update-api-showcase.py</strong> - Update API Showcase (v3.9.2)</summary>

**Event:** PostToolUse (Write|Edit)
**Purpose:** Ensure API Showcase page reflects new APIs

**The Problem It Solves:**
After creating APIs, the showcase page needs to display them. Without this hook:
- Users manually update showcase
- New APIs not visible in testing UI
- Documentation gaps

**How It Works:**
1. Detects API route file creation
2. Verifies registry.json was updated
3. Triggers showcase page re-render notification
4. Logs update for session tracking

**Example: API Added to Showcase**
```
API route created: brandfetch
Registry updated with new endpoint.

API Showcase will display:
  - Endpoint: /api/v2/brandfetch
  - Methods: GET
  - Description: Fetch brand data

Visit /api-showcase to test the new API.
```

</details>

<details>
<summary><strong>update-ui-showcase.py</strong> - Update UI Showcase (v3.9.2)</summary>

**Event:** PostToolUse (Write|Edit)
**Purpose:** Ensure UI Showcase page reflects new components/pages

**The Problem It Solves:**
After creating components or pages, the UI showcase needs to display them. Without this hook:
- Manual showcase updates required
- New components not visible in preview grid
- Page previews broken

**How It Works:**
1. Detects component or page file creation
2. Verifies registry.json was updated
3. Determines type (component vs page)
4. Logs preview availability

**Example: Component Added to Showcase**
```
Component created: Button
Registry updated with new component.

UI Showcase will display:
  - Name: Button
  - Variants: primary, secondary, outline
  - Preview: Sandpack live editor

Visit /ui-showcase to preview the component.
```

**Example: Page Added to Showcase**
```
Page created: dashboard
Registry updated with new page.

UI Showcase will display:
  - Name: Dashboard
  - Route: /dashboard
  - Preview: Scaled iframe

Visit /ui-showcase to preview the page.
```

</details>

---

### Stop Hooks (2)

These hooks run when the conversation ends.

<details>
<summary><strong>api-workflow-check.py</strong> - Phase 13 Completion Check</summary>

**Event:** Stop
**Purpose:** Block conversation end until all phases complete

**The Problem It Solves:**
Claude says "done" but phases were skipped. Without completion check:
- Incomplete workflows
- Missing tests
- Undocumented endpoints

**How It Works:**
1. Iterates all 13 phases
2. Checks each has `status: "complete"` and `phase_exit_confirmed: true`
3. If incomplete, blocks with Exit Code 2
4. If complete, generates completion output

**Example 1: Blocking Incomplete Workflow**
```
User: "Looks good, bye"

🚫 WORKFLOW INCOMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cannot close session with incomplete phases.

Phase Status:
  ✅ 1. Disambiguation
  ✅ 2. Scope
  ✅ 3. Initial Research
  ✅ 4. Interview
  ✅ 5. Deep Research
  ✅ 6. Schema
  ✅ 7. Environment
  ✅ 8. TDD Red
  ✓ 9. TDD Green
  ✗ 10. Verify (NOT STARTED)
  ✗ 11. Refactor (NOT STARTED)
  ✗ 12. Documentation (NOT STARTED)

Complete remaining phases or use force-close.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 2: Completion Output Generated**
```
============================================================
# ✅ API Implementation Complete: brandfetch
============================================================

## Summary
- Status: PRODUCTION READY
- Phases: 13/13 Complete
- Tests: 10 passing
- Coverage: 100%

## Files Created
- src/app/api/v2/brandfetch/route.ts
- src/app/api/v2/brandfetch/__tests__/route.test.ts
- src/lib/schemas/brandfetch.ts

## Test Commands
pnpm test -- brandfetch

## Curl Examples
curl 'http://localhost:3001/api/v2/brandfetch?domain=google.com'

## Research Cache
.claude/research/brandfetch/CURRENT.md
============================================================
```

**Example 3: Force Close Option**
```
🚫 WORKFLOW INCOMPLETE

Options:
  [A] Continue and complete remaining phases
  [B] Force close (NOT RECOMMENDED)
      - Endpoint marked incomplete
      - No completion output generated
      - Session still logged

Your choice?
```

</details>

<details>
<summary><strong>session-logger.py</strong> - Save Session Logs</summary>

**Event:** Stop
**Purpose:** Save complete session to `.claude/api-sessions/`

**The Problem It Solves:**
Sessions are ephemeral. What happened is lost. Without logging:
- No audit trail
- Decisions can't be reviewed
- Debugging impossible

**How It Works:**
1. Gets endpoint name from state
2. Creates timestamped folder
3. Copies conversation from Claude's storage
4. Converts to markdown
5. Snapshots state file
6. Generates summary

**Example 1: Session Saved**
```
Session complete. Saving logs...

📁 Session saved:
.claude/api-sessions/brandfetch_2025-12-11_16-45-00/
  ✓ session.jsonl (raw conversation)
  ✓ session.md (readable transcript)
  ✓ state-snapshot.json (final state)
  ✓ summary.md (executive summary)

Browse sessions: /hustle-api-sessions --list
```

**Example 2: Session Summary Content**
```markdown
# Session Summary: brandfetch

**Completed:** 2025-12-11T16:45:00Z
**Duration:** 1h 15m
**Turns:** 47

## Phases Completed
- [x] All 13 phases

## Files Created
- route.ts
- route.test.ts
- brandfetch.ts (schema)

## Interview Decisions
- response_format: json_with_urls
- caching: 24h

## Intentional Omissions
- include_fonts (user confirmed not needed)
```

**Example 3: Session Index Updated**
```json
// .claude/api-sessions/index.json
{
  "sessions": [
    {
      "endpoint": "brandfetch",
      "timestamp": "2025-12-11T16:45:00Z",
      "folder": "brandfetch_2025-12-11_16-45-00",
      "status": "complete",
      "phases_completed": 13,
      "duration_minutes": 75
    }
  ]
}
```

</details>

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
