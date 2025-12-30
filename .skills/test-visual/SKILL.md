---
name: test-visual
description: Run Storybook visual and interaction tests with component coverage
tools: Bash, Read, Glob, TodoWrite, Task
model: sonnet
---

# Test Visual Skill

Run visual regression tests using Storybook and Playwright across 7 viewports.

## When to Use

- After creating or modifying UI components
- Before merging component changes
- To detect unintended visual changes
- To verify responsive design

## Execution Steps

### Step 1: Check Storybook Configuration

```bash
# Check for Storybook config
ls .storybook/main.* 2>/dev/null

# Check for test-runner
cat package.json | grep -E "storybook|chromatic"
```

### Step 2: Build Storybook (if needed)

```bash
# Build static Storybook for testing
pnpm storybook:build

# Or run dev server
pnpm storybook &
```

### Step 3: Run Visual Tests

Execute visual regression tests:

```bash
# Run Storybook test runner
pnpm test-storybook

# Or with Playwright visual comparisons
npx playwright test --project=visual
```

### Step 4: Test Across 7 Viewports

For each component, capture screenshots at:

| Viewport | Dimensions | Safe Areas |
|----------|------------|------------|
| Mobile Portrait | 375×667 | None |
| Mobile Notch | 393×852 | Top: 47px, Bottom: 34px |
| Mobile Landscape | 667×375 | None |
| Tablet Portrait | 768×1024 | None |
| Tablet Landscape | 1024×768 | None |
| Small Desktop | 1280×720 | None |
| Desktop | 1920×1080 | None |

### Step 5: AI-Powered Analysis (Haiku)

For each viewport screenshot, spawn a Haiku subagent to analyze:

```
Task({
  subagent_type: "visual-analyzer",
  model: "haiku",
  prompt: `Analyze screenshot for:
    1. Layout issues (overlapping, clipping)
    2. Typography (readability, contrast)
    3. Touch targets (min 44x44px)
    4. Safe area compliance
    5. Brand consistency

    Return: {issues: [{type, severity, element, detail}]}`
})
```

### Step 6: Report Results

```
Visual Test Results:
═══════════════════════════════════════

Component: Button

Viewport Tests:
───────────────────────────────────
Mobile Portrait  | ✅ Pass | No issues
Mobile Notch     | ✅ Pass | No issues
Mobile Landscape | ✅ Pass | No issues
Tablet Portrait  | ✅ Pass | No issues
Tablet Landscape | ✅ Pass | No issues
Small Desktop    | ✅ Pass | No issues
Desktop          | ✅ Pass | No issues
───────────────────────────────────

AI Analysis:
✅ Layout: Elements properly aligned
✅ Typography: 4.8:1 contrast ratio (passes AA)
✅ Touch targets: All buttons 44px+ height
✅ Safe areas: No content in notch zone
✅ Brand: Colors match brand guide

Screenshots saved to:
  __snapshots__/Button-mobile-portrait.png
  __snapshots__/Button-mobile-notch.png
  ...
```

## Handling Visual Diffs

When visual differences are detected:

```
⚠️ Visual Differences Detected

Component: Card
Viewport: Desktop

Changes:
- Border radius changed from 4px to 8px
- Shadow depth increased

Expected: __snapshots__/Card-desktop-expected.png
Actual:   __snapshots__/Card-desktop-actual.png
Diff:     __snapshots__/Card-desktop-diff.png

Actions:
1. [u] Update baseline (accept change)
2. [r] Reject change (fix code)
3. [i] Ignore this viewport

Choice? >
```

## Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `[component]` | Component to test | All components |
| `--update` | Update baselines | false |
| `--viewport` | Specific viewport | All 7 |
| `--ai` | Include AI analysis | true |

## Examples

```bash
# Run all visual tests
/test-visual

# Test specific component
/test-visual Button

# Update baselines
/test-visual --update

# Single viewport
/test-visual --viewport=mobile-portrait
```

## Output Format

```
═══════════════════════════════════════
Visual Test Results: ✅ PASS / ❌ FAIL
═══════════════════════════════════════
Components: 12 tested
Viewports:  7 each (84 total screenshots)
AI Analysis: ✅ No issues found
Duration:   28s
═══════════════════════════════════════
```

## Integration

Invoked during:
- `/hustle-ui-create` Phase 11 (Visual Testing)
- `/hustle-ui-create-page` Phase 11 (Visual Testing)

## See Also

- `/test-unit` - Unit tests
- `/test-e2e` - E2E tests
- `/test-debug` - Debug failures
