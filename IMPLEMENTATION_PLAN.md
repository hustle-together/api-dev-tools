# Registry & Showcase System Implementation Plan

## Overview

Wire up the registry system so that every created artifact (API, component, page) is tracked and displayed in auto-generated showcases accessible via `/hustle-dev-tools/`.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER'S NEXT.JS PROJECT                          │
├─────────────────────────────────────────────────────────────────────────┤
│  app/                                                                    │
│  ├── hustle-dev-tools/           # Dashboard hub                        │
│  │   ├── page.tsx                # Main dashboard with links            │
│  │   ├── api/                    # API Showcase                         │
│  │   │   ├── page.tsx            # Grid of all APIs                     │
│  │   │   └── _components/        # APICard, APIModal, APITester         │
│  │   ├── ui/                     # UI Showcase                          │
│  │   │   ├── page.tsx            # Grid of all components               │
│  │   │   └── _components/        # PreviewCard, PreviewModal            │
│  │   ├── tests/                  # Test Results                         │
│  │   │   └── page.tsx            # Test runner status                   │
│  │   └── storybook/              # Storybook embed (iframe)             │
│  │       └── page.tsx            # Embedded Storybook                   │
│  │                                                                       │
│  .devkit/                                                                │
│  ├── state.json                  # Current workflow state               │
│  ├── registry.json               # All artifacts (APIs, components)     │
│  └── research/                   # Research cache                       │
│                                                                          │
│  .claude/                                                                │
│  ├── hooks/                      # Enforcement hooks                    │
│  │   ├── registry-update.py      # [NEW] Update registry on Write/Edit │
│  │   ├── showcase-gen.py         # [NEW] Regenerate showcases          │
│  │   ├── visual-qa.py            # [NEW] Haiku screenshot analysis     │
│  │   └── completion-links.py     # [NEW] Show links at workflow end    │
│  └── settings.json               # Hook configuration                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## New Hooks to Implement

### 1. `registry-update.py` (PostToolUse: Write|Edit)

**Trigger:** After any Write or Edit to source files
**Action:** Parse the file and update `.devkit/registry.json`

```python
# Detects file type and updates appropriate registry section:
# - src/app/api/**/*.ts → apis section
# - src/components/**/*.tsx → components section
# - src/app/**/page.tsx → pages section

# Registry entry format for APIs:
{
  "stripe-checkout": {
    "route": "/api/stripe/checkout",
    "method": "POST",
    "schema": "CheckoutSchema",
    "file": "src/app/api/stripe/checkout/route.ts",
    "tests": "src/app/api/stripe/checkout/route.test.ts",
    "created": "2025-01-03T10:30:00Z",
    "examples": {
      "basic": {
        "description": "Create checkout session",
        "body": {"priceId": "price_xxx", "quantity": 1},
        "curl": "curl -X POST ..."
      }
    }
  }
}

# Registry entry format for Components:
{
  "ChatWindow": {
    "file": "src/components/ChatWindow/ChatWindow.tsx",
    "types": "src/components/ChatWindow/ChatWindow.types.ts",
    "stories": "src/components/ChatWindow/ChatWindow.stories.tsx",
    "tests": "src/components/ChatWindow/ChatWindow.test.tsx",
    "visualTests": "src/components/ChatWindow/ChatWindow.visual.spec.ts",
    "props": ["messages", "onSend", "isLoading"],
    "variants": ["default", "compact", "fullscreen"],
    "created": "2025-01-03T10:30:00Z"
  }
}
```

### 2. `showcase-gen.py` (PostToolUse: Write)

**Trigger:** After registry.json is updated
**Action:** Regenerate showcase pages from templates

```python
# 1. Read .devkit/registry.json
# 2. For each section with entries:
#    - Copy template from templates/api-showcase/ or templates/ui-showcase/
#    - Inject registry data into components
#    - Write to user's app/hustle-dev-tools/
# 3. Only regenerate if registry changed
```

### 3. `visual-qa.py` (PostToolUse: Write for UI files)

**Trigger:** After component/page implementation (Phase 9 Green for UI)
**Action:** Run Haiku subagent for visual analysis

```python
# 1. Detect if file is UI (*.tsx in components/ or pages/)
# 2. Check if Storybook is running (or start it)
# 3. Take screenshots of all stories for the component
# 4. Send to Haiku for analysis:
#    - Brand guide compliance
#    - Accessibility issues (contrast, touch targets)
#    - Responsive breakpoint issues
#    - Visual consistency
# 5. Output findings to stderr if issues found
# 6. Store results in .devkit/visual-qa-results.json
```

### 4. `completion-links.py` (Stop event)

**Trigger:** When workflow reaches Phase 14 (Completion)
**Action:** Output all relevant links

```python
# 1. Read .devkit/state.json to get workflow type and artifact
# 2. Determine which links are relevant:
#
# For API workflows:
#   - Dashboard: http://localhost:3000/hustle-dev-tools
#   - API Showcase: http://localhost:3000/hustle-dev-tools/api
#   - Specific API: http://localhost:3000/hustle-dev-tools/api#stripe-checkout
#   - Test Results: http://localhost:3000/hustle-dev-tools/tests
#
# For Component workflows:
#   - Dashboard: http://localhost:3000/hustle-dev-tools
#   - UI Showcase: http://localhost:3000/hustle-dev-tools/ui
#   - Storybook: http://localhost:6006/?path=/docs/chatwindow
#   - Visual QA: http://localhost:3000/hustle-dev-tools/visual-qa
#   - Test Results: http://localhost:3000/hustle-dev-tools/tests
#
# For Page workflows:
#   - Dashboard: http://localhost:3000/hustle-dev-tools
#   - The Page Itself: http://localhost:3000/dashboard
#   - E2E Results: http://localhost:3000/hustle-dev-tools/tests
#
# 3. Format as clickable markdown links
# 4. Output to stdout (shown to user)
```

---

## URL Structure

| Route | Purpose |
|-------|---------|
| `/hustle-dev-tools` | Main dashboard hub |
| `/hustle-dev-tools/api` | API Showcase (grid of all APIs) |
| `/hustle-dev-tools/api#[endpoint]` | Direct link to specific API |
| `/hustle-dev-tools/ui` | UI Showcase (grid of all components) |
| `/hustle-dev-tools/ui#[component]` | Direct link to specific component |
| `/hustle-dev-tools/tests` | Test results dashboard |
| `/hustle-dev-tools/tests/e2e` | Playwright E2E results |
| `/hustle-dev-tools/tests/unit` | Vitest unit test results |
| `/hustle-dev-tools/storybook` | Embedded Storybook iframe |
| `/hustle-dev-tools/visual-qa` | Visual QA results |
| `/hustle-dev-tools/docs` | Generated TypeDoc documentation |

---

## Workflow Integration

### API Workflow (`/api-create`)

```
Phase 9 (Green)  → Write route.ts
                 → registry-update.py adds to registry.apis

Phase 13 (Docs)  → showcase-gen.py regenerates /hustle-dev-tools/api

Phase 14 (Done)  → completion-links.py outputs:
                   ✅ Dashboard: /hustle-dev-tools
                   ✅ API Showcase: /hustle-dev-tools/api#stripe-checkout
                   ✅ Test Results: /hustle-dev-tools/tests
```

### Component Workflow (`/hustle-ui-create`)

```
Phase 9 (Green)  → Write Component.tsx
                 → registry-update.py adds to registry.components

Phase 11 (Review)→ visual-qa.py runs Haiku analysis
                 → Stores results in .devkit/visual-qa-results.json

Phase 13 (Docs)  → showcase-gen.py regenerates /hustle-dev-tools/ui

Phase 14 (Done)  → completion-links.py outputs:
                   ✅ Dashboard: /hustle-dev-tools
                   ✅ UI Showcase: /hustle-dev-tools/ui#ChatWindow
                   ✅ Storybook: http://localhost:6006/?path=/docs/chatwindow
                   ✅ Visual QA: /hustle-dev-tools/visual-qa
                   ✅ Test Results: /hustle-dev-tools/tests
```

### Page Workflow (`/hustle-ui-create-page`)

```
Phase 9 (Green)  → Write page.tsx
                 → registry-update.py adds to registry.pages

Phase 11 (Review)→ visual-qa.py runs Haiku analysis

Phase 13 (Docs)  → showcase-gen.py regenerates dashboard

Phase 14 (Done)  → completion-links.py outputs:
                   ✅ Dashboard: /hustle-dev-tools
                   ✅ Your Page: /dashboard
                   ✅ E2E Results: /hustle-dev-tools/tests/e2e
                   ✅ Visual QA: /hustle-dev-tools/visual-qa
```

---

## Settings.json Hook Configuration

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {"type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/registry-update.py"}
        ]
      },
      {
        "matcher": "Write",
        "hooks": [
          {"type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/showcase-gen.py"}
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {"type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/completion-links.py"}
        ]
      }
    ]
  }
}
```

---

## Files to Create/Modify

### New Files
1. `.claude/hooks/registry-update.py` - Registry update logic
2. `.claude/hooks/showcase-gen.py` - Showcase page generation
3. `.claude/hooks/visual-qa.py` - Haiku visual analysis
4. `.claude/hooks/completion-links.py` - End-of-workflow links

### Modified Files
1. `.claude/settings.json` - Add new hooks to configuration
2. `README.md` - Update for new Devkit architecture
3. `.devkit/registry.json` - Enhance schema for examples/links

### Template Files (Already Exist)
- `templates/api-showcase/` - API showcase pages
- `templates/ui-showcase/` - UI showcase pages
- `templates/hustle-dev-dashboard/` - Main dashboard
- `templates/shared/HeroHeader.tsx` - Shared header component

---

## Testing Plan

1. **Unit Tests** - Add pytest tests for each new hook
2. **Integration Test** - Run `/api-create test-endpoint` and verify:
   - Registry updated with new entry
   - Showcase page regenerated
   - Completion links displayed
3. **Visual QA Test** - Run `/hustle-ui-create TestButton` and verify:
   - Haiku analysis runs
   - Results stored in visual-qa-results.json
   - UI Showcase shows component

---

## Implementation Order

1. ✅ Create this plan
2. Update README.md for new architecture
3. Implement `registry-update.py`
4. Implement `showcase-gen.py`
5. Implement `visual-qa.py`
6. Implement `completion-links.py`
7. Update `.claude/settings.json`
8. Add tests for new hooks
9. Test complete workflow
10. Commit everything

---

## Questions Resolved

| Question | Answer |
|----------|--------|
| App location | Installed into user's project |
| URL base | `/hustle-dev-tools` |
| Visual QA timing | Phase 11 (Code Review) for UI workflows |
| Completion links | All relevant links (dashboard + showcase + storybook + tests) |
