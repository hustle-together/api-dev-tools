---
name: update-todos
description: Update TodoWrite progress tracker for multi-phase workflows. Internal helper skill that visualizes workflow progress with checkboxes. Automatically determines status based on current phase. Keywords: todowrite, progress, tracking, workflow, visualization, helper
license: MIT
compatibility: Requires Claude Code with TodoWrite tool support
metadata:
  version: "1.0.0"
  category: "workflow"
  tags: ["todowrite", "progress", "tracking", "visualization", "helper"]
  author: "Hustle Together"
allowed-tools: TodoWrite Read
---

# Update Todos - TodoWrite Progress Helper

**Usage:** `/update-todos [workflow] [current-phase]`

**Purpose:** Updates the TodoWrite visual progress tracker for multi-phase workflows. Internal helper skill called by workflow commands.

## Parameters

- **workflow**: Which workflow to update
  - `api-create` - 13-phase API development
  - `ui-create-component` - 13-phase component development
  - `ui-create-page` - 13-phase page development
  - `combine` - 12-phase API orchestration

- **current-phase**: Phase number just completed (0 = initialization, 1-13 = phases)

## Workflow Phase Definitions

### API Create (13 phases)

```
Phase 1:  Disambiguation - Clarify ambiguous API terms
Phase 2:  Scope - Confirm endpoint understanding
Phase 3:  Initial Research - Targeted doc searches (Context7, Web)
Phase 4:  Interview - Questions FROM research findings
Phase 5:  Deep Research - Adaptive propose-approve searches
Phase 6:  Schema - Zod schema from research + interview
Phase 7:  Environment - Verify API keys exist
Phase 8:  TDD Red - Write failing tests
Phase 9:  TDD Green - Minimal implementation
Phase 10: Verify - Re-research docs vs implementation
Phase 11: Refactor - Clean up code
Phase 12: Documentation - Update manifests, cache research
Phase 13: Completion - Final verification, commit
```

### UI Create Component (13 phases)

```
Phase 1:  Component Scope - Define type (Atom/Molecule/Organism)
Phase 2:  Brand Guide - Check existing design system
Phase 3:  Research - ShadCN, Radix, Tailwind patterns
Phase 4:  Props Interview - Component API questions
Phase 5:  ShadCN Detection - Check if base exists
Phase 6:  Component Schema - Props, variants, defaults
Phase 7:  TDD Red - Write component tests
Phase 8:  TDD Green - Implement component
Phase 9:  Storybook Stories - Create interactive docs
Phase 10: Responsive Check - Test breakpoints
Phase 11: Accessibility - WCAG AA/AAA audit
Phase 12: Brand Validation - Verify design system compliance
Phase 13: Showcase Update - Add to UI showcase page
```

### UI Create Page (13 phases)

```
Phase 1:  Page Type - Landing/Dashboard/Form/List/Detail/Auth
Phase 2:  Route Planning - Define URL structure
Phase 3:  API Route Check - Verify backend exists
Phase 4:  Data Schema - Define page data requirements
Phase 5:  Component Research - Find needed UI components
Phase 6:  Layout Design - Structure with App Router patterns
Phase 7:  TDD Red - Write Playwright E2E tests
Phase 8:  TDD Green - Implement page
Phase 9:  Data Integration - Connect to API routes
Phase 10: SEO Metadata - Add meta tags, OG, Twitter cards
Phase 11: Accessibility - Keyboard nav, ARIA, focus management
Phase 12: E2E Validation - Run Playwright tests
Phase 13: Registry Update - Add to route registry
```

### Combine APIs (12 phases)

```
Phase 1:  API Selection - Choose 2+ existing APIs from registry
Phase 2:  Registry Verification - Confirm APIs are complete
Phase 3:  Flow Type - Sequential/Parallel/Conditional
Phase 4:  Data Mapping - Define transformations between APIs
Phase 5:  Error Strategy - Fail-fast/Fallback/Retry
Phase 6:  Schema Design - Combined Zod schema
Phase 7:  TDD Red - Write orchestration tests
Phase 8:  TDD Green - Implement orchestration
Phase 9:  Curl Examples - Generate test commands
Phase 10: Performance Test - Verify latency acceptable
Phase 11: Documentation - Update manifests with examples
Phase 12: Showcase Update - Add to API showcase
```

## Implementation

You are a TodoWrite progress updater. Your job is to:

1. **Read the workflow parameter** to determine which phase structure to use
2. **Build the todos array** with proper status for each phase
3. **Call TodoWrite** with the complete array
4. **Return silently** without output to the user

### Status Logic

For a given `current_phase` number:
- Phases < current_phase: `"completed"`
- Phase == current_phase: `"in_progress"`
- Phases > current_phase: `"pending"`

### Example Call

User calls: `/update-todos api-create 3`

You build:
```json
[
  {"content": "Phase 1: Disambiguation", "status": "completed", "activeForm": "Clarified API terms"},
  {"content": "Phase 2: Scope", "status": "completed", "activeForm": "Confirmed endpoint understanding"},
  {"content": "Phase 3: Initial Research", "status": "in_progress", "activeForm": "Researching documentation"},
  {"content": "Phase 4: Interview", "status": "pending", "activeForm": "Interviewing user for requirements"},
  ...
]
```

Then call TodoWrite with this array.

## Special Cases

### Initialization (phase 0)
When `current_phase = 0`, all phases are `"pending"` with one `"in_progress"`:
- Phase 1: `"in_progress"` (starting workflow)
- Phases 2-13: `"pending"`

### Completion (phase 13 for 13-phase workflows)
When `current_phase = 13`:
- All phases: `"completed"`
- Display completion message

### Loop-Back Scenarios
If a verification phase fails (e.g., Phase 10 requires going back to Phase 8):
- The calling workflow will call `/update-todos` with the looped-back phase number
- Example: After Phase 10 fails verification → `/update-todos api-create 8`
- Phase 8 becomes `"in_progress"` again
- Phases 9-13 revert to `"pending"`

## Error Handling

If invalid parameters:
- Invalid workflow name → Use `api-create` as default, warn user
- Invalid phase number → Clamp to valid range (0-13 or 0-12)
- Missing parameters → Ask user to provide them

## Silent Operation

**CRITICAL:** This is a helper skill. After calling TodoWrite, you MUST:
- **NOT output any text to the user**
- **NOT explain what you did**
- **NOT ask follow-up questions**
- Simply update the todos and return control to the calling workflow

The calling workflow (e.g., `/api-create`) will handle all user communication.

## Usage Examples

### From api-create workflow
```markdown
# Start of workflow
/update-todos api-create 0

# After Phase 1 completes
/update-todos api-create 1

# After Phase 10 verification fails (loop back to Phase 8)
/update-todos api-create 8
```

### From ui-create-component workflow
```markdown
# Start of workflow
/update-todos ui-create-component 0

# After completing Brand Guide check
/update-todos ui-create-component 2
```

### From combine workflow
```markdown
# Start of workflow (note: only 12 phases)
/update-todos combine 0

# After Flow Type selection
/update-todos combine 3
```

## Integration Points

This skill is called by:
- `.skills/api-create/SKILL.md` (or `/hustle-api-create`)
- `.skills/hustle-ui-create/SKILL.md` (component mode)
- `.skills/hustle-ui-create-page/SKILL.md` (page mode)
- `.skills/hustle-combine/SKILL.md` (orchestration)

## Testing

To test this helper independently:
```bash
/update-todos api-create 5
# Should show phases 1-4 completed, phase 5 in_progress, 6-13 pending

/update-todos combine 12
# Should show all 12 phases completed

/update-todos ui-create-component 0
# Should show phase 1 in_progress, rest pending
```

---

**Now execute the TodoWrite update based on the provided parameters.**
