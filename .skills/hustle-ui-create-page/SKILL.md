---
name: hustle-ui-create-page
description: Create Next.js App Router pages with 13-phase interview-driven workflow. Includes route planning, API route verification, Playwright E2E tests, SEO metadata, and real-time TodoWrite progress tracking. Supports landing, dashboard, form, list, detail, and auth page types. Keywords: page, nextjs, app-router, playwright, e2e, seo, tdd
license: MIT
compatibility: Requires Claude Code, Next.js 14/15 with App Router, React 18+, Playwright for E2E testing
metadata:
  version: "3.11.0"
  category: "development"
  tags: ["page", "nextjs", "app-router", "playwright", "e2e", "seo", "tdd", "todowrite"]
  author: "Hustle Together"
allowed-tools: WebSearch WebFetch mcp__context7 AskUserQuestion Read Write Edit Bash TodoWrite
---

# Hustle UI Create Page - Page Development Workflow v3.11.0

**Usage:** `/hustle-ui-create-page [page-name]`

**Purpose:** Create Next.js App Router pages using interview-driven, brand-aware, test-first methodology with Playwright E2E tests.

## CRITICAL: MANDATORY USER INTERACTION

**YOU MUST USE THE `AskUserQuestion` TOOL AT EVERY CHECKPOINT.**

You are **FORBIDDEN** from:
- Self-answering questions
- Assuming user responses
- Proceeding without explicit user confirmation

---

## TodoWrite Integration (Real-Time Progress)

**At the START of this workflow**, initialize TodoWrite with all 13 phases:

```
TodoWrite([
  {content: "Phase 1: Disambiguation", status: "in_progress", activeForm: "Clarifying page type"},
  {content: "Phase 2: Scope", status: "pending", activeForm: "Confirming route structure"},
  {content: "Phase 3: Design Research", status: "pending", activeForm: "Researching patterns and brand"},
  {content: "Phase 4: Interview", status: "pending", activeForm: "Interviewing for requirements"},
  {content: "Phase 5: Component Selection", status: "pending", activeForm: "Selecting from registry"},
  {content: "Phase 6: Data Schema", status: "pending", activeForm: "Creating page data schema"},
  {content: "Phase 7: API Route Check", status: "pending", activeForm: "Verifying backend exists"},
  {content: "Phase 8: TDD Red", status: "pending", activeForm: "Writing Playwright E2E tests"},
  {content: "Phase 9: TDD Green", status: "pending", activeForm: "Implementing page"},
  {content: "Phase 10: Verify", status: "pending", activeForm: "Running E2E verification"},
  {content: "Phase 11: SEO Metadata", status: "pending", activeForm: "Adding meta tags"},
  {content: "Phase 12: Documentation", status: "pending", activeForm: "Updating route registry"},
  {content: "Phase 13: Completion", status: "pending", activeForm: "Final verification"}
])
```

**After completing each phase**, update TodoWrite:
- Mark completed phase as `"completed"`
- Mark next phase as `"in_progress"`

**On loop-back** (e.g., Phase 10 fails → back to Phase 9):
- Mark Phase 9+ as `"in_progress"` or `"pending"`

---

## Page Types

| Type | Description | Route Pattern |
|------|-------------|---------------|
| **Landing** | Marketing/showcase with hero, features, CTA | `/[name]` |
| **Dashboard** | Data display with metrics, charts, tables | `/dashboard/[name]` |
| **Form** | User input (create, edit, settings) | `/[name]/new`, `/[name]/edit` |
| **List** | Collection display (search, filter, paginate) | `/[name]` |
| **Detail** | Single item view (profile, product, article) | `/[name]/[id]` |
| **Auth** | Login, register, password reset | `/auth/[action]` |

---

## Complete Phase Flow (13 Phases)

```
/hustle-ui-create-page [page]
        │
        ▼
┌─ PHASE 1: DISAMBIGUATION ─────────────────────────────────┐
│                                                           │
│ Use AskUserQuestion:                                      │
│ "What type of page is [name]?"                            │
│                                                           │
│ Options:                                                  │
│   - Landing Page (hero, features, CTA)                    │
│   - Dashboard (metrics, charts, tables)                   │
│   - Form Page (create, edit, settings)                    │
│   - List/Grid (collection with filters)                   │
│   - Detail Page (single item view)                        │
│   - Auth Page (login, register)                           │
│                                                           │
│ WAIT for user response.                                   │
│ Update TodoWrite: Phase 1 completed, Phase 2 in_progress  │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 2: SCOPE CONFIRMATION ─────────────────────────────┐
│                                                           │
│ Present understanding, then AskUserQuestion:              │
│ "I understand [page] is a [type] at route /[path].        │
│  Data sources: [list]. Is this correct?"                  │
│                                                           │
│ Options:                                                  │
│   - Yes, proceed                                          │
│   - No, let me clarify                                    │
│                                                           │
│ Loop back if user selects "No"                            │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 3: DESIGN RESEARCH ────────────────────────────────┐
│                                                           │
│ Step 3a: Brand Guide Check                                │
│   Read .claude/BRAND_GUIDE.md                             │
│   AskUserQuestion: "Use project brand guide?"             │
│                                                           │
│ Step 3b: Next.js Pattern Research                         │
│   Search based on page type:                              │
│   - Landing: "Next.js 15 landing page hero section"       │
│   - Dashboard: "Next.js dashboard layout data table"      │
│   - Form: "Next.js server actions form handling"          │
│   - List: "Next.js pagination App Router"                 │
│   - Detail: "Next.js dynamic routes [id]"                 │
│                                                           │
│ Context7: Next.js and ShadCN documentation                │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 4: INTERVIEW ──────────────────────────────────────┐
│                                                           │
│ Ask 5-10 questions FROM research findings:                │
│                                                           │
│ AskUserQuestion (each question separately):               │
│   - Data fetching? (Server/Client/Hybrid)                 │
│   - Layout? (Root/Dashboard/Sidebar)                      │
│   - Auth required? (Public/Protected/Mixed)               │
│   - Loading states? (Skeleton/Spinner/Suspense)           │
│   - [Research-derived questions]                          │
│                                                           │
│ Store all decisions in state file                         │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 5: COMPONENT SELECTION ────────────────────────────┐
│                                                           │
│ Check registry for existing components:                   │
│   cat .claude/registry.json | jq '.components'            │
│                                                           │
│ Present available components:                             │
│   "Your page could use: [Button, Card, DataTable]"        │
│                                                           │
│ AskUserQuestion: "Use these components?"                  │
│ Options: Yes (recommended), Select specific, Create new   │
│                                                           │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 6: DATA SCHEMA ────────────────────────────────────┐
│                                                           │
│ Create Zod schema for page data:                          │
│   src/app/[name]/schema.ts                                │
│                                                           │
│ Define:                                                   │
│   - API response types                                    │
│   - Form input types (if applicable)                      │
│   - Search params types                                   │
│                                                           │
│ AskUserQuestion: "Data schema looks correct?"             │
│ Loop back if schema needs changes                         │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 7: API ROUTE CHECK ────────────────────────────────┐
│                                                           │
│ Check if required API routes exist:                       │
│   ls src/app/api/v2/ | grep -i [related-api]              │
│                                                           │
│ If API routes missing:                                    │
│   AskUserQuestion: "API route not found. Create first?"   │
│   Options:                                                │
│     - Yes, run /api-create first                          │
│     - No, use mock data for now                           │
│     - Skip, I'll connect later                            │
│                                                           │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 8: TDD RED (Playwright E2E Tests) ─────────────────┐
│                                                           │
│ Create Playwright test file:                              │
│   e2e/[name].spec.ts                                      │
│                                                           │
│ Generate 10-15 test cases based on page type:             │
│   - Page loads successfully                               │
│   - All sections render                                   │
│   - Navigation works                                      │
│   - Forms validate (if applicable)                        │
│   - Mobile responsive                                     │
│   - A11y (axe-core integration)                           │
│                                                           │
│ Run tests (expect failure):                               │
│   pnpm exec playwright test e2e/[name].spec.ts            │
│                                                           │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 9: TDD GREEN (Implementation) ─────────────────────┐
│                                                           │
│ Create page files:                                        │
│   src/app/[name]/page.tsx                                 │
│   src/app/[name]/layout.tsx (if needed)                   │
│   src/app/[name]/loading.tsx                              │
│   src/app/[name]/error.tsx                                │
│                                                           │
│ Apply brand guide styling                                 │
│ Use components from registry                              │
│ Connect to API routes                                     │
│                                                           │
│ Run tests (expect pass):                                  │
│   pnpm exec playwright test e2e/[name].spec.ts            │
│                                                           │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 10: VERIFY (E2E Validation) ───────────────────────┐
│                                                           │
│ Run full Playwright suite:                                │
│   pnpm exec playwright test e2e/[name].spec.ts --headed   │
│                                                           │
│ Check:                                                    │
│   - All E2E tests pass                                    │
│   - Mobile viewport works                                 │
│   - A11y audit passes (axe-core)                          │
│   - Performance acceptable (< 3s LCP)                     │
│                                                           │
│ AskUserQuestion: "E2E validation complete. Any issues?"   │
│                                                           │
│ Loop back to Phase 9 if issues found                      │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 11: SEO METADATA ──────────────────────────────────┐
│                                                           │
│ Add metadata to page:                                     │
│   - Title and description                                 │
│   - Open Graph tags                                       │
│   - Twitter card                                          │
│   - Canonical URL                                         │
│   - Structured data (if applicable)                       │
│                                                           │
│ Use Next.js Metadata API:                                 │
│   export const metadata: Metadata = { ... }               │
│                                                           │
│ AskUserQuestion: "SEO metadata complete?"                 │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 12: DOCUMENTATION ─────────────────────────────────┐
│                                                           │
│ Update:                                                   │
│   - .claude/registry.json with page entry                 │
│   - Route documentation                                   │
│   - API integration notes                                 │
│                                                           │
│ AskUserQuestion: "Documentation complete?"                │
│                                                           │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 13: COMPLETION ────────────────────────────────────┐
│                                                           │
│ Final output:                                             │
│   - List all created files                                │
│   - E2E test results summary                              │
│   - SEO metadata summary                                  │
│   - Page URL: http://localhost:3000/[name]                │
│                                                           │
│ Mark all TodoWrite phases as completed                    │
│                                                           │
│ AskUserQuestion: "Create another page?"                   │
└───────────────────────────────────────────────────────────┘
```

---

## State File Structure

```json
{
  "version": "3.11.0",
  "workflow": "ui-create-page",
  "active_element": "[name]",
  "elements": {
    "[name]": {
      "type": "page",
      "status": "in_progress",
      "started_at": "2025-12-25T10:00:00Z",
      "ui_config": {
        "mode": "page",
        "page_type": "landing|dashboard|form|list|detail|auth",
        "route": "/[name]",
        "data_fetching": "server|client|hybrid",
        "auth_required": false,
        "use_brand_guide": true
      },
      "phases": {
        "disambiguation": { "status": "complete" },
        "scope": { "status": "complete" },
        "design_research": { "status": "complete" },
        "interview": { "status": "complete", "decisions": {} },
        "component_selection": { "status": "complete", "components": [] },
        "data_schema": { "status": "complete" },
        "api_route_check": { "status": "complete" },
        "tdd_red": { "status": "complete" },
        "tdd_green": { "status": "complete" },
        "verify": { "status": "complete" },
        "seo_metadata": { "status": "complete" },
        "documentation": { "status": "complete" },
        "completion": { "status": "complete" }
      }
    }
  }
}
```

---

## Output Artifacts

This command creates:

1. **Page File**: `src/app/[name]/page.tsx`
2. **Layout File**: `src/app/[name]/layout.tsx` (if needed)
3. **Loading File**: `src/app/[name]/loading.tsx`
4. **Error File**: `src/app/[name]/error.tsx`
5. **Schema File**: `src/app/[name]/schema.ts`
6. **E2E Tests**: `e2e/[name].spec.ts`
7. **Registry Entry**: Updated `.claude/registry.json`

---

## Key Principles

1. **ALWAYS ask user** - Never proceed without explicit response
2. **Brand guide first** - Check and apply before implementation
3. **Component reuse** - Select from registry before creating new
4. **API route check** - Verify backend exists before page
5. **Playwright E2E** - Full user flow testing
6. **SEO mandatory** - Metadata for all pages
7. **TodoWrite tracking** - Update progress at every phase

---

**Version:** 3.11.0
**Last Updated:** 2025-12-25
