---
name: hustle-ui-create
description: Create UI components with 13-phase interview-driven workflow. Includes brand guide integration, ShadCN detection, 4-step verification, Storybook stories, and real-time TodoWrite progress tracking. Use for reusable React components (atoms, molecules, organisms). Keywords: ui, component, react, shadcn, storybook, tdd, brand, accessibility
license: MIT
compatibility: Requires Claude Code, React 18+, Tailwind CSS, class-variance-authority, Storybook (optional), Vitest for testing
metadata:
  version: "3.11.0"
  category: "development"
  tags: ["ui", "component", "react", "shadcn", "storybook", "tdd", "accessibility", "todowrite"]
  author: "Hustle Together"
allowed-tools: WebSearch WebFetch mcp__context7 AskUserQuestion Read Write Edit Bash TodoWrite
---

# Hustle UI Create - Component Development Workflow v3.11.0

**Usage:** `/hustle-ui-create [component-name]`

**Purpose:** Create reusable UI components using interview-driven, brand-aware, test-first methodology with 4-step verification.

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
  {content: "Phase 1: Disambiguation", status: "in_progress", activeForm: "Clarifying component type"},
  {content: "Phase 2: Scope", status: "pending", activeForm: "Confirming component purpose"},
  {content: "Phase 3: Design Research", status: "pending", activeForm: "Researching patterns and brand"},
  {content: "Phase 4: Interview", status: "pending", activeForm: "Interviewing for requirements"},
  {content: "Phase 5: Component Analysis", status: "pending", activeForm: "Checking existing components"},
  {content: "Phase 6: Props Schema", status: "pending", activeForm: "Creating TypeScript interface"},
  {content: "Phase 7: Environment", status: "pending", activeForm: "Checking packages and Storybook"},
  {content: "Phase 8: TDD Red", status: "pending", activeForm: "Writing failing tests"},
  {content: "Phase 9: TDD Green", status: "pending", activeForm: "Implementing component"},
  {content: "Phase 10: Verify", status: "pending", activeForm: "Running 4-step verification"},
  {content: "Phase 11: Refactor", status: "pending", activeForm: "Cleaning up code"},
  {content: "Phase 12: Documentation", status: "pending", activeForm: "Updating docs and registry"},
  {content: "Phase 13: Completion", status: "pending", activeForm: "Final verification"}
])
```

**After completing each phase**, update TodoWrite:
- Mark completed phase as `"completed"`
- Mark next phase as `"in_progress"`

**On loop-back** (e.g., Phase 10 fails → back to Phase 9):
- Mark Phase 9+ as `"in_progress"` or `"pending"`

---

## Complete Phase Flow (13 Phases)

```
/hustle-ui-create [component]
        │
        ▼
┌─ PHASE 1: DISAMBIGUATION ─────────────────────────────────┐
│                                                           │
│ Use AskUserQuestion:                                      │
│ "What type of component is [name]?"                       │
│                                                           │
│ Options:                                                  │
│   - Atom (Button, Input, Icon, Badge)                     │
│   - Molecule (FormField, Card, SearchBar)                 │
│   - Organism (Header, Sidebar, DataTable, Modal)          │
│                                                           │
│ WAIT for user response.                                   │
│ Update TodoWrite: Phase 1 completed, Phase 2 in_progress  │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 2: SCOPE CONFIRMATION ─────────────────────────────┐
│                                                           │
│ Present understanding, then AskUserQuestion:              │
│ "I understand [component] is a [type] that [purpose].     │
│  Is this correct?"                                        │
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
│ Step 3b: Pattern Research                                 │
│   Search: "[component] best practices accessibility"      │
│   Search: "shadcn [component] implementation"             │
│   Context7: ShadCN/Radix documentation                    │
│                                                           │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 4: INTERVIEW ──────────────────────────────────────┐
│                                                           │
│ Ask 5-10 questions FROM research findings:                │
│                                                           │
│ AskUserQuestion (each question separately):               │
│   - Which design system? (ShadCN/Radix/Custom)            │
│   - Which variants? (size, color, state) [multiSelect]    │
│   - Accessibility level? (WCAG AA/AAA/Basic)              │
│   - [Research-derived questions]                          │
│                                                           │
│ Store all decisions in state file                         │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 5: COMPONENT ANALYSIS ─────────────────────────────┐
│                                                           │
│ Check existing ShadCN components:                         │
│   ls src/components/ui/                                   │
│                                                           │
│ Check registry for custom components:                     │
│   cat .claude/registry.json | jq '.components'            │
│                                                           │
│ AskUserQuestion: "Use these existing components?"         │
│ Options: Yes (recommended), No, Some (specify)            │
│                                                           │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 6: PROPS SCHEMA ───────────────────────────────────┐
│                                                           │
│ Create TypeScript interface from interview:               │
│   src/components/[Name]/[Name].types.ts                   │
│                                                           │
│ AskUserQuestion: "Props schema looks correct?"            │
│ Options: Yes, No (needs changes)                          │
│                                                           │
│ Loop back if schema needs changes                         │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 7: ENVIRONMENT CHECK ──────────────────────────────┐
│                                                           │
│ Check packages:                                           │
│   radix, class-variance-authority, clsx, tailwind         │
│                                                           │
│ Check Storybook:                                          │
│   ls .storybook/                                          │
│                                                           │
│ AskUserQuestion if Storybook not found:                   │
│ "Initialize Storybook?"                                   │
│                                                           │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 8: TDD RED (Failing Tests) ────────────────────────┐
│                                                           │
│ Create test file:                                         │
│   src/components/[Name]/__tests__/[Name].test.tsx         │
│                                                           │
│ Create Storybook stories:                                 │
│   src/components/[Name]/[Name].stories.tsx                │
│                                                           │
│ Run tests (expect failure):                               │
│   pnpm test src/components/[Name]                         │
│                                                           │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 9: TDD GREEN (Implementation) ─────────────────────┐
│                                                           │
│ Create component files:                                   │
│   src/components/[Name]/[Name].tsx                        │
│   src/components/[Name]/index.ts                          │
│                                                           │
│ Use class-variance-authority for variants                 │
│ Apply brand guide colors/spacing                          │
│                                                           │
│ Run tests (expect pass):                                  │
│   pnpm test src/components/[Name]                         │
│                                                           │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 10: VERIFY (4-Step Mandatory) ─────────────────────┐
│                                                           │
│ Step 1: Responsive Check                                  │
│   Desktop (1920px), Tablet (768px), Mobile (375px)        │
│                                                           │
│ Step 2: Brand Guide Match                                 │
│   Colors, Typography, Spacing, Border Radius              │
│                                                           │
│ Step 3: All Tests Passed                                  │
│   Unit tests, Storybook stories, A11y audit               │
│                                                           │
│ Step 4: Performance Metrics                               │
│   Memory, Re-renders, Bundle size impact                  │
│                                                           │
│ AskUserQuestion: "All 4 checks passed. Any issues?"       │
│                                                           │
│ Loop back to Phase 9 if issues found                      │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 11: TDD REFACTOR ──────────────────────────────────┐
│                                                           │
│ Clean up while tests pass:                                │
│   - Extract repeated logic to hooks                       │
│   - Optimize re-renders                                   │
│   - Add JSDoc comments                                    │
│                                                           │
│ Run tests after each refactor                             │
│ Update TodoWrite on completion                            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─ PHASE 12: DOCUMENTATION ─────────────────────────────────┐
│                                                           │
│ Update:                                                   │
│   - Storybook autodocs                                    │
│   - JSDoc comments on exported functions                  │
│   - .claude/registry.json with component entry            │
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
│   - Test results summary                                  │
│   - A11y compliance status                                │
│   - Brand guide match status                              │
│   - Showcase URL: http://localhost:3000/ui-showcase       │
│                                                           │
│ Mark all TodoWrite phases as completed                    │
│                                                           │
│ AskUserQuestion: "Create another component?"              │
└───────────────────────────────────────────────────────────┘
```

---

## State File Structure

```json
{
  "version": "3.11.0",
  "workflow": "ui-create-component",
  "active_element": "[name]",
  "elements": {
    "[name]": {
      "type": "component",
      "status": "in_progress",
      "started_at": "2025-12-25T10:00:00Z",
      "ui_config": {
        "mode": "component",
        "component_type": "atom|molecule|organism",
        "design_system": "shadcn",
        "variants": ["size", "color"],
        "accessibility_level": "wcag2aa",
        "use_brand_guide": true
      },
      "phases": {
        "disambiguation": { "status": "complete" },
        "scope": { "status": "complete" },
        "design_research": { "status": "complete", "brand_guide_applied": true },
        "interview": { "status": "complete", "decisions": {} },
        "component_analysis": { "status": "complete", "dependencies": [] },
        "props_schema": { "status": "complete" },
        "environment_check": { "status": "complete" },
        "tdd_red": { "status": "complete" },
        "tdd_green": { "status": "complete" },
        "verify": { "status": "complete", "four_step_passed": true },
        "tdd_refactor": { "status": "complete" },
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

1. **Component File**: `src/components/[Name]/[Name].tsx`
2. **Types File**: `src/components/[Name]/[Name].types.ts`
3. **Stories File**: `src/components/[Name]/[Name].stories.tsx`
4. **Test File**: `src/components/[Name]/__tests__/[Name].test.tsx`
5. **Barrel Export**: `src/components/[Name]/index.ts`
6. **Registry Entry**: Updated `.claude/registry.json`

---

## Key Principles

1. **ALWAYS ask user** - Never proceed without explicit response
2. **Brand guide first** - Check and apply before implementation
3. **ShadCN detection** - Reuse existing components when available
4. **4-Step verification** - All 4 checks MUST pass
5. **TodoWrite tracking** - Update progress at every phase
6. **Showcase link** - Always output at completion

---

**Version:** 3.11.0
**Last Updated:** 2025-12-25
