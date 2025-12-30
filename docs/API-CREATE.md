# /api-create Command Reference

**Version:** 4.0.0
**Last Updated:** 2025-12-29

> **The Problem**
>
> Building API endpoints from memory leads to outdated implementations, missing parameters, and undocumented edge cases. Developers often skip research, testing, or verification steps under time pressure.

> **The Solution**
>
> `/api-create` enforces a complete 14-phase workflow that ensures every endpoint is researched, tested, verified against documentation, and properly documented before completion.

---

## Quick Start

```bash
/api-create stripe-checkout
```

This single command triggers a complete workflow that:
1. Researches Stripe's checkout API documentation
2. Interviews you about your specific requirements
3. Generates Zod schemas from discovered parameters
4. Writes failing tests first (TDD Red)
5. Implements minimal code to pass tests (TDD Green)
6. Verifies implementation against docs (prevents hallucination)
7. Runs AI code review for security/performance
8. Documents everything and updates the registry

---

## The 14 Phases

### Phase 1: Disambiguation

**Purpose:** Clarify ambiguous terms before research begins.

**Example:**
```
You said "stripe checkout" - did you mean:
1. Stripe Checkout (hosted payment page)
2. Stripe Elements (embedded payment form)
3. Stripe Payment Intents (custom payment flow)
```

**Hooks:** `disambiguation-check.py`

---

### Phase 2: Scope

**Purpose:** Confirm understanding of what will be built.

**Output:**
```
Building: Stripe Checkout API endpoint
- POST /api/v2/stripe-checkout
- Creates checkout sessions
- Handles success/cancel redirects
- Supports subscriptions and one-time payments

Confirm? [Y/n]
```

**Hooks:** `scope-confirmation.py`

---

### Phase 3: Initial Research

**Purpose:** 2-3 targeted searches for official documentation.

**Research Sources:**
- **Context7** - Library documentation
- **WebSearch** - Official API docs
- **WebFetch** - Specific documentation pages

**Example Queries:**
```
1. Context7: stripe checkout session create
2. WebSearch: Stripe Checkout API documentation 2025
3. WebFetch: https://stripe.com/docs/api/checkout/sessions
```

**Hooks:** `enforce-research.py`, `track-research.py`

---

### Phase 4: Interview

**Purpose:** Generate questions FROM research findings, not generic templates.

**Key Principle:** Questions are derived from discovered parameters.

**Example:**
```
Research found 12 parameters for checkout sessions. Let's narrow down:

1. Payment modes: Which do you need?
   [ ] payment (one-time)
   [ ] subscription (recurring)
   [ ] setup (save card for later)

2. Line items: How will you define them?
   [ ] Predefined products (from Stripe dashboard)
   [ ] Dynamic pricing (calculated at runtime)

3. Success/Cancel URLs: What are your redirect paths?
   > /checkout/success?session_id={CHECKOUT_SESSION_ID}
```

**Hooks:** `enforce-interview.py`, `interview-tracker.py`

---

### Phase 5: Deep Research

**Purpose:** Additional research based on interview answers.

**Example:**
```
Based on your answers, proposing additional research:

1. Stripe subscription billing cycles
2. Stripe webhook events for checkout.session.completed
3. Stripe customer portal for subscription management

Approve these searches? [Y/n]
```

**Hooks:** `deep-research-proposer.py`

---

### Phase 6: Schema Creation

**Purpose:** Generate Zod schemas from research + interview decisions.

**Output:** `src/lib/schemas/stripe-checkout.ts`
```typescript
import { z } from 'zod';

export const StripeCheckoutRequestSchema = z.object({
  mode: z.enum(['payment', 'subscription', 'setup']),
  lineItems: z.array(z.object({
    priceId: z.string().optional(),
    quantity: z.number().min(1).default(1),
    // Dynamic pricing
    priceData: z.object({
      currency: z.string().length(3),
      unitAmount: z.number().min(0),
      productData: z.object({
        name: z.string(),
        description: z.string().optional(),
      }).optional(),
    }).optional(),
  })).min(1),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  customerEmail: z.string().email().optional(),
  metadata: z.record(z.string()).optional(),
});

export const StripeCheckoutResponseSchema = z.object({
  sessionId: z.string(),
  url: z.string().url(),
});

export type StripeCheckoutRequest = z.infer<typeof StripeCheckoutRequestSchema>;
export type StripeCheckoutResponse = z.infer<typeof StripeCheckoutResponseSchema>;
```

**Hooks:** `schema-generator` subagent

---

### Phase 7: Environment Check

**Purpose:** Verify API keys exist before implementation.

**Checks:**
```
Checking environment variables...

✅ STRIPE_SECRET_KEY - Found
✅ STRIPE_WEBHOOK_SECRET - Found (optional)
⚠️ STRIPE_PUBLISHABLE_KEY - Not found (needed for client-side)

Continue with implementation? [Y/n]
```

**Hooks:** `environment-check.py`

---

### Phase 8: TDD Red

**Purpose:** Write failing tests that define expected behavior.

**Output:** `src/app/api/v2/stripe-checkout/__tests__/stripe-checkout.api.test.ts`
```typescript
describe('POST /api/v2/stripe-checkout', () => {
  it('should create a checkout session', async () => {
    const response = await POST(createMockRequest({
      mode: 'payment',
      lineItems: [{ priceId: 'price_xxx', quantity: 1 }],
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
    }));

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.sessionId).toBeDefined();
    expect(data.url).toMatch(/^https:\/\/checkout\.stripe\.com/);
  });

  it('should reject invalid mode', async () => {
    const response = await POST(createMockRequest({
      mode: 'invalid',
      // ...
    }));

    expect(response.status).toBe(400);
  });

  // ... more tests
});
```

**Test Count:** Typically 8-15 test cases per endpoint

**Hooks:** `test-writer` subagent, `tdd-red-check.py`

---

### Phase 9: TDD Green

**Purpose:** Minimal implementation to pass all tests.

**Output:** `src/app/api/v2/stripe-checkout/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { StripeCheckoutRequestSchema } from '@/lib/schemas/stripe-checkout';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = StripeCheckoutRequestSchema.parse(body);

    const session = await stripe.checkout.sessions.create({
      mode: validated.mode,
      line_items: validated.lineItems.map(item => ({
        price: item.priceId,
        quantity: item.quantity,
        price_data: item.priceData ? {
          currency: item.priceData.currency,
          unit_amount: item.priceData.unitAmount,
          product_data: item.priceData.productData,
        } : undefined,
      })),
      success_url: validated.successUrl,
      cancel_url: validated.cancelUrl,
      customer_email: validated.customerEmail,
      metadata: validated.metadata,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    throw error;
  }
}
```

**Hooks:** `verify-tests-pass.py`

---

### Phase 10: Verification

**Purpose:** Re-research documentation and compare to implementation.

**Output:**
```
Re-checking implementation against Stripe documentation...

✅ mode parameter: Correctly implemented
✅ line_items: Correctly implemented
✅ success_url: Correctly implemented
⚠️ shipping_address_collection: Documented but not implemented
   → User deferred this in interview (Phase 4)
⚠️ phone_number_collection: Documented but not implemented
   → User deferred this in interview (Phase 4)

Implementation matches documentation with 2 intentional omissions.
```

**Hooks:** `implementation-reviewer` subagent, `verify-after-green.py`

---

### Phase 11: Code Review

**Purpose:** AI-powered review for security, performance, and best practices.

**Output:**
```
Code Review Results:
─────────────────────

✅ Security: No issues found
✅ Error Handling: Proper Zod validation
✅ Type Safety: Full TypeScript coverage

⚠️ Performance (minor):
   - Consider caching Stripe client instance
   - Add rate limiting for production

📋 Suggestions:
   - Add request logging for debugging
   - Consider adding idempotency key support
```

**Hooks:** `code-reviewer` subagent, `run-code-review.py`

---

### Phase 12: TDD Refactor

**Purpose:** Improve code while keeping tests green.

**Actions:**
- Apply code review suggestions
- Improve error messages
- Add logging
- Refactor for readability

**Hooks:** `refactor-check.py`

---

### Phase 13: Documentation

**Purpose:** Update registry, cache research, generate TypeDoc.

**Updates:**
1. `.claude/registry.json` - Add new API entry
2. `.claude/research/stripe-checkout/` - Cache research
3. `docs/api/stripe-checkout.md` - TypeDoc output (if enabled)

**Registry Entry:**
```json
{
  "apis": {
    "stripe-checkout": {
      "path": "/api/v2/stripe-checkout",
      "method": "POST",
      "schema": "src/lib/schemas/stripe-checkout.ts",
      "route": "src/app/api/v2/stripe-checkout/route.ts",
      "tests": "src/app/api/v2/stripe-checkout/__tests__/",
      "created": "2025-12-29",
      "researchCache": ".claude/research/stripe-checkout/"
    }
  }
}
```

**Hooks:** `docs-generator` subagent, `update-registry.py`

---

### Phase 14: Completion

**Purpose:** Final verification and commit.

**Output:**
```
═══════════════════════════════════════════════════════════
✅ API Implementation Complete: stripe-checkout
═══════════════════════════════════════════════════════════

Summary:
- Status: PRODUCTION READY
- Phases: 14/14 Complete
- Tests: 12 test scenarios (all passing)

Files Created:
- src/lib/schemas/stripe-checkout.ts
- src/app/api/v2/stripe-checkout/route.ts
- src/app/api/v2/stripe-checkout/__tests__/stripe-checkout.api.test.ts

Test Commands:
  pnpm test -- stripe-checkout

Curl Example:
  curl -X POST http://localhost:3000/api/v2/stripe-checkout \
    -H "Content-Type: application/json" \
    -d '{"mode":"payment","lineItems":[...]}'

Ready to commit? [Y/n]
```

**Hooks:** `api-workflow-check.py`, `commit-helper.py`

---

## State Tracking

All progress is tracked in `.claude/api-dev-state.json`:

```json
{
  "endpoint": "stripe-checkout",
  "phases": {
    "disambiguation": { "status": "complete" },
    "scope": { "status": "complete" },
    "research_initial": { "status": "complete", "sources": [...] },
    "interview": { "status": "complete", "decisions": {...} },
    "research_deep": { "status": "complete" },
    "schema_creation": { "status": "complete", "schema_file": "..." },
    "environment_check": { "status": "complete" },
    "tdd_red": { "status": "complete", "test_count": 12 },
    "tdd_green": { "status": "complete", "all_tests_passing": true },
    "verify": { "status": "complete", "gaps_found": 0 },
    "code_review": { "status": "complete" },
    "tdd_refactor": { "status": "complete" },
    "documentation": { "status": "complete" },
    "completion": { "status": "complete" }
  }
}
```

---

## Hooks Reference

| Hook | Phase | Purpose |
|------|-------|---------|
| `enforce-research.py` | 3 | Block writes without research |
| `track-research.py` | 3, 5 | Log research queries |
| `enforce-interview.py` | 4 | Inject interview decisions |
| `environment-check.py` | 7 | Verify API keys |
| `tdd-red-check.py` | 8 | Ensure tests exist and fail |
| `verify-tests-pass.py` | 9 | Block until tests pass |
| `verify-after-green.py` | 10 | Trigger verification |
| `run-code-review.py` | 11 | Run AI review |
| `update-registry.py` | 13 | Update registry.json |
| `api-workflow-check.py` | 14 | Block stop until complete |

---

## Related Commands

| Command | Purpose |
|---------|---------|
| `/api-research [library]` | Research a library without full workflow |
| `/api-interview [endpoint]` | Run interview phase standalone |
| `/api-verify [endpoint]` | Re-verify an existing endpoint |
| `/api-env [endpoint]` | Check environment variables |
| `/api-status [endpoint]` | Show phase progress |

---

## See Also

- [SKILLS.md](./SKILLS.md) - All slash commands
- [HOOKS.md](./HOOKS.md) - Hook reference
- [AGENTS.md](./AGENTS.md) - Subagent reference
- [ORCHESTRATOR.md](./ORCHESTRATOR.md) - Master orchestrator
