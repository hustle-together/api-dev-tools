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

### Step 6: Report Results (Enhanced with Haiku Reasoning + Links)

The report includes **Haiku's detailed reasoning** for any issues found, plus **clickable links** to screenshots and Storybook states:

```
═══════════════════════════════════════════════════════════════════════════════
                         VISUAL TEST RESULTS: Button
═══════════════════════════════════════════════════════════════════════════════

Viewport Tests:
┌──────────────────┬────────┬─────────────────────────────────────────────────┐
│ Viewport         │ Status │ Details                                         │
├──────────────────┼────────┼─────────────────────────────────────────────────┤
│ Mobile Portrait  │ ✅ Pass │ No issues                                       │
│ Mobile Notch     │ ⚠️ Warn │ Touch target below minimum                      │
│ Mobile Landscape │ ✅ Pass │ No issues                                       │
│ Tablet Portrait  │ ✅ Pass │ No issues                                       │
│ Tablet Landscape │ ✅ Pass │ No issues                                       │
│ Small Desktop    │ ✅ Pass │ No issues                                       │
│ Desktop          │ ✅ Pass │ No issues                                       │
└──────────────────┴────────┴─────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
                           HAIKU AI ANALYSIS
═══════════════════════════════════════════════════════════════════════════════

📱 Mobile Notch (393×852) - ⚠️ 1 Warning
───────────────────────────────────────────────────────────────────────────────
📸 Screenshot: file://__snapshots__/Button-mobile-notch.png
📖 Storybook:  http://localhost:6006/?path=/story/components-button--primary

Issue #1: Touch Target Too Small
  Type:     touch_target
  Severity: warning
  Element:  Secondary action button (bottom right)

  🤖 Haiku's Reasoning:
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ "I measured the secondary button at approximately 36px height. Apple's  │
  │ HIG recommends 44×44px minimum for touch targets to ensure reliable     │
  │ tapping, especially on notch devices where users may be adjusting grip. │
  │ The primary button meets the standard at 48px, but the secondary button │
  │ falls short. This could lead to tap frustration on real devices."       │
  └─────────────────────────────────────────────────────────────────────────┘

  💡 Suggestion: Increase button height to 44px minimum
  🔧 Fix: Add `min-h-[44px]` to secondary button variants

───────────────────────────────────────────────────────────────────────────────

🖥️ Desktop (1920×1080) - ✅ All Checks Pass
───────────────────────────────────────────────────────────────────────────────
📸 Screenshot: file://__snapshots__/Button-desktop.png
📖 Storybook:  http://localhost:6006/?path=/story/components-button--primary

  🤖 Haiku's Analysis:
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ "Layout is clean with proper alignment. Typography contrast measured    │
  │ at approximately 4.8:1 against the background, exceeding WCAG AA        │
  │ requirements (4.5:1). All interactive elements are appropriately sized  │
  │ for desktop interaction. Brand colors match the guide specification."   │
  └─────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
                              SUMMARY
═══════════════════════════════════════════════════════════════════════════════

Category Results:
───────────────────────────────────────
✅ Layout:        7/7 viewports pass
✅ Typography:    7/7 viewports pass
⚠️ Touch Targets: 6/7 viewports pass (1 warning)
✅ Safe Areas:    7/7 viewports pass
✅ Brand:         7/7 viewports pass
───────────────────────────────────────

Quick Links:
───────────────────────────────────────
📸 All Screenshots: file://__snapshots__/
📖 Storybook:       http://localhost:6006/?path=/story/components-button
🧪 Playwright:      file://playwright-report/index.html
📊 Coverage:        file://coverage/index.html

───────────────────────────────────────
Result: ⚠️ PASS WITH WARNINGS (1 warning, 0 critical)
───────────────────────────────────────
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

## Autonomous Loop Completion (Ralph Wiggum Pattern)

When running in autonomous mode (`--auto` flag or `/ralph-loop`), this skill supports
self-terminating loops for iterative visual QA cycles.

### Promise Signal

After completing visual analysis and fixing all issues, output:

```
<promise>VISUAL_CLEAN</promise>
```

This signal is detected by the `completion-promise-detector.py` hook, which:
1. Records the promise in `.claude/completion-promises.json`
2. Allows graceful workflow termination
3. Prevents infinite visual QA loops

### When to Output the Promise

Output `<promise>VISUAL_CLEAN</promise>` when:
- All 7 viewports have been tested
- All Haiku-detected issues have been fixed
- Re-analysis confirms no remaining issues
- Screenshots match expected baselines

### Iterative Visual QA Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                   VISUAL QA LOOP (Ralph Wiggum)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Capture screenshots (7 viewports)                           │
│     └─ Spawn Haiku for AI analysis                              │
│                                                                 │
│  2. Issues found?                                               │
│     └─ Fix layout, typography, touch targets, etc.              │
│                                                                 │
│  3. Re-capture and re-analyze                                   │
│     └─ Still issues? → Loop back to step 2                      │
│                                                                 │
│  4. All viewports clean?                                        │
│     └─ Output: <promise>VISUAL_CLEAN</promise>                  │
│     └─ Hook detects → Workflow terminates gracefully            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Credit:** Ralph Wiggum pattern by [Geoffrey Huntley](https://ghuntley.com/ralph/)

## Integration

Invoked during:
- `/hustle-ui-create` Phase 11 (Visual Testing)
- `/hustle-ui-create-page` Phase 11 (Visual Testing)

## See Also

- `/test-unit` - Unit tests
- `/test-e2e` - E2E tests
- `/test-debug` - Debug failures
- `/ralph-loop` - Autonomous loop execution
- [docs/AUTONOMOUS_LOOPS.md](../../docs/AUTONOMOUS_LOOPS.md) - Pattern documentation
