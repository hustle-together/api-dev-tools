---
description: Full visual QA audit - screenshot ALL stories, analyze with Haiku, fix with Opus
argument-hint: [component-name or "all"]
---

# Visual QA - Haiku Analysis Workflow

Process pending visual QA tasks using Haiku for visual analysis.

## Target: $ARGUMENTS

If no argument provided, process ALL pending visual QA tasks.

## Workflow

### Step 1: Load Pending Tasks

Read all pending task specs from `.devkit/tasks/visual-qa/`:

```
For each *.json file in .devkit/tasks/visual-qa/:
  - Load task spec
  - If status == "pending", add to processing queue
```

If no pending tasks found:
- Check if component name was provided in $ARGUMENTS
- If yes, create a task spec for that component manually
- If no, report "No pending visual QA tasks. Run /hustle-ui-create to create components first."

### Step 2: Capture Screenshots (Playwright MCP)

For EACH pending task, capture screenshots at multiple viewports:

**Prerequisites:**
1. Check if Storybook is running: `curl -s http://localhost:6006 > /dev/null`
2. If not running, suggest: `pnpm storybook` in another terminal

**Screenshot Process:**
Using Playwright MCP tools:

1. Navigate to component's Storybook story:
   - Use `mcp__playwright__browser_navigate` to go to story URL
   - URL format: `http://localhost:6006/iframe.html?id={component-kebab}--default&viewMode=story`

2. For each viewport (mobile: 375x667, tablet: 768x1024, desktop: 1920x1080):
   - Use `mcp__playwright__browser_resize` to set viewport size
   - Wait for render: `mcp__playwright__browser_wait_for` (500ms)
   - Take screenshot: `mcp__playwright__browser_take_screenshot`
   - Save to: `.devkit/screenshots/{component}/{viewport}.png`

3. Capture dark mode (if supported):
   - Execute: `mcp__playwright__browser_evaluate` with `document.documentElement.classList.add('dark')`
   - Screenshot each viewport again with `-dark` suffix

4. Capture interaction states (hover, focus):
   - Find interactive elements via `mcp__playwright__browser_snapshot`
   - Hover/focus and screenshot

### Step 3: Analyze with Haiku (Task tool)

For EACH component's screenshots, spawn a Haiku subagent:

```
Use Task tool with:
- subagent_type: "general-purpose"
- model: "haiku"
- prompt: (see below)
```

**Haiku Analysis Prompt:**

```
You are a visual QA specialist. Analyze these UI screenshots for quality issues.

Component: {component_name}
Screenshots: {list of screenshot paths}
Brand Guide: {brand_guide_excerpt if available}

ANALYZE EACH SCREENSHOT FOR:

1. **Color Contrast (WCAG AA)**
   - Normal text: 4.5:1 minimum
   - Large text (18px+ or 14px+ bold): 3:1 minimum
   - UI components: 3:1 minimum

2. **Touch Targets**
   - Interactive elements must be at least 44x44px
   - Adequate spacing between targets

3. **Focus States**
   - All interactive elements must have visible focus indicator
   - Focus ring should be clearly visible (not just color change)

4. **Responsive Design**
   - Layout should adapt naturally across breakpoints
   - No horizontal scrolling on mobile
   - Text readable without zooming

5. **Visual Consistency**
   - Alignment of elements
   - Consistent spacing
   - Typography hierarchy

6. **Dark Mode** (if applicable)
   - Proper color inversion
   - Sufficient contrast maintained
   - No unreadable elements

OUTPUT FORMAT (JSON):
{
  "component": "{component_name}",
  "overall_status": "pass" | "fail" | "warning",
  "summary": {
    "total_issues": <number>,
    "errors": <number>,
    "warnings": <number>,
    "info": <number>
  },
  "issues": [
    {
      "severity": "error" | "warning" | "info",
      "category": "contrast" | "touch_targets" | "focus" | "responsive" | "visual" | "dark_mode",
      "viewport": "mobile" | "tablet" | "desktop",
      "description": "Specific issue description",
      "element": "Element selector or description",
      "suggestion": "How to fix this issue",
      "wcag_criterion": "WCAG criterion if applicable (e.g., '1.4.3')"
    }
  ],
  "passed_checks": [
    {
      "category": "...",
      "description": "What passed"
    }
  ]
}

Be thorough but pragmatic. Only flag genuine issues.
```

### Step 4: Save Results

After Haiku analysis completes:

1. Parse Haiku's JSON response
2. Update `.devkit/visual-qa-results.json`:

```json
{
  "{component_name}": {
    "timestamp": "ISO-8601",
    "results": {
      "overall_status": "pass|fail|warning",
      "summary": {...},
      "issues": [...],
      "passed_checks": [...]
    }
  }
}
```

3. Update task spec status to "completed" in `.devkit/tasks/visual-qa/`

### Step 5: Report Results

Output a summary:

```
VISUAL QA RESULTS
=================

Component: {name}
Status: {PASS|FAIL|WARNING}

Issues Found:
  Errors:   {count}
  Warnings: {count}
  Info:     {count}

{If errors > 0}
BLOCKING ISSUES (must fix):
  - [contrast] Button text contrast 3.2:1 fails WCAG AA (need 4.5:1)
    Fix: Change text color from #888 to #595959

  - [touch_targets] Submit button 32x28px below 44x44px minimum
    Fix: Add padding or min-height/min-width

{If warnings > 0}
WARNINGS (should fix):
  - [responsive] Text truncates on mobile at 320px
    Fix: Add text-wrap or reduce font size

PASSED CHECKS:
  - Focus states visible on all interactive elements
  - Dark mode contrast maintained
```

### Step 6: Trigger Refactor (if issues found)

If `errors > 0`:
1. Update workflow state to require refactor
2. Inject issues into refactor checklist
3. Output: "Run /refactor to fix visual QA issues"

The refactor phase will:
1. Read visual-qa-results.json
2. Fix each error issue
3. Re-run /visual-qa to verify fixes
4. Loop until all errors resolved (Ralph loop)

## Error Handling

**Storybook not running:**
```
Storybook is not running on port 6006.

To start Storybook:
  pnpm storybook

Then re-run /visual-qa
```

**No stories for component:**
```
No Storybook story found for {component}.

Create a story file:
  {component}.stories.tsx

Then re-run /visual-qa
```

**Screenshot capture failed:**
```
Failed to capture screenshots for {component}.

Possible causes:
- Component has render errors
- Story file has syntax errors
- Storybook build failed

Check Storybook console for errors.
```

## Integration with Workflow

This command integrates with:
- **visual-qa.py hook**: Creates task specs when UI files are written
- **enforce-refactor.py hook**: Injects issues into refactor phase
- **ralph-loop.py hook**: Re-runs visual QA until issues resolved
- **completion-links.py hook**: Shows visual QA results link at completion

## Example Usage

```bash
# Process all pending visual QA tasks
/visual-qa

# Process specific component
/visual-qa Button

# After fixing issues
/visual-qa Button  # Re-run to verify fixes
```
