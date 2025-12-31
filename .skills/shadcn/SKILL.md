---
name: shadcn
description: ShadCN UI documentation and component installation with auto-updating docs
tools: Bash, Read, Write, Glob, WebFetch, mcp__context7__resolve-library-id, mcp__context7__get-library-docs
model: sonnet
---

# ShadCN Skill

Access latest ShadCN UI documentation, install components, and ensure docs stay fresh.

## Documentation Freshness

**Auto-Update Policy:** Every 15 days, this skill checks for documentation updates.

### Freshness Check

On every invocation, check `.claude/research/shadcn/index.json`:

```json
{
  "library": "shadcn",
  "last_fetched": "2025-12-29T10:00:00Z",
  "freshness_days": 15,
  "version": "2.1.0",
  "sources": [
    "https://ui.shadcn.com/docs",
    "context7:/vercel/ui"
  ]
}
```

**If stale (>15 days):**
```
⚠️ ShadCN docs are 18 days old. Fetching latest...
```

Then auto-fetch fresh documentation via Context7.

## Commands

### Get Documentation

```bash
# General ShadCN docs
/shadcn docs

# Specific component docs
/shadcn docs button
/shadcn docs form
/shadcn docs data-table

# Installation guide
/shadcn docs installation

# Theming docs
/shadcn docs theming
```

### Install Components

```bash
# Install single component
/shadcn add button

# Install multiple
/shadcn add button card input

# Install all form components
/shadcn add form input select checkbox radio textarea

# Install with dependencies
/shadcn add dialog --with-deps
```

### Check Status

```bash
# Show installed components
/shadcn status

# Show available components
/shadcn list

# Check for updates
/shadcn check-updates
```

## Execution Flow

### Step 1: Freshness Check

```python
# Check if docs need refresh
index_file = Path(".claude/research/shadcn/index.json")
if index_file.exists():
    data = json.load(index_file)
    last_fetched = datetime.fromisoformat(data["last_fetched"])
    days_old = (datetime.now() - last_fetched).days

    if days_old > 15:
        print(f"⚠️ ShadCN docs are {days_old} days old. Refreshing...")
        fetch_fresh_docs()
else:
    print("📚 First time setup. Fetching ShadCN documentation...")
    fetch_fresh_docs()
```

### Step 2: Fetch Documentation

Use Context7 for latest docs:

```javascript
// Resolve library ID
mcp__context7__resolve-library-id({
  libraryName: "shadcn",
  query: "ShadCN UI component library for React"
})

// Get docs
mcp__context7__get-library-docs({
  libraryId: "/shadcn/ui",
  query: "button component usage and variants"
})
```

### Step 3: Cache Locally

Save to `.claude/research/shadcn/`:
- `index.json` - Metadata and freshness
- `CURRENT.md` - Full documentation summary
- `components/` - Per-component docs

### Step 4: Respond

Return documentation with usage examples and brand guide integration.

## Component Installation

### With Brand Guide Integration

When installing components, auto-configure with brand:

```bash
/shadcn add button
```

Output:
```
Installing Button component...

✅ src/components/ui/button.tsx created

Auto-configured with your brand:
  • Primary color: #6366F1 (from BRAND_GUIDE.md)
  • Border radius: 0.5rem (from theme)
  • Font: Inter (from brand)

Usage:
  import { Button } from "@/components/ui/button"

  <Button>Default</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="destructive">Destructive</Button>

Storybook story also created:
  src/components/ui/button.stories.tsx
```

## Documentation Structure

### Available Topics

| Topic | Command | Description |
|-------|---------|-------------|
| Installation | `/shadcn docs installation` | Setup guide |
| Theming | `/shadcn docs theming` | CSS variables, dark mode |
| Typography | `/shadcn docs typography` | Font configuration |
| Components | `/shadcn docs [component]` | Component-specific |
| CLI | `/shadcn docs cli` | CLI commands |
| Changelog | `/shadcn docs changelog` | Latest changes |

### Component Categories

| Category | Components |
|----------|------------|
| **Forms** | button, input, textarea, select, checkbox, radio, switch, slider, form |
| **Layout** | card, separator, scroll-area, resizable |
| **Feedback** | alert, toast, sonner, progress, skeleton |
| **Overlay** | dialog, sheet, drawer, popover, tooltip, hover-card |
| **Navigation** | tabs, navigation-menu, menubar, breadcrumb |
| **Data** | table, data-table, calendar, date-picker |

## Freshness Report

```bash
/shadcn status
```

Output:
```
═══════════════════════════════════════════════════════════════════
                    SHADCN STATUS
═══════════════════════════════════════════════════════════════════

Documentation:
  Last Updated:  2025-12-29 (0 days ago) ✅
  Version:       2.1.0
  Source:        Context7 + ui.shadcn.com

Installed Components (12):
  ✅ button      ✅ card        ✅ input
  ✅ dialog      ✅ toast       ✅ tabs
  ✅ form        ✅ select      ✅ checkbox
  ✅ table       ✅ skeleton    ✅ separator

Available Updates:
  • data-table: v1.2.0 → v1.3.0 (new sorting)
  • form: v1.0.0 → v1.1.0 (zod v4 support)

Brand Integration:
  ✅ Theme configured from BRAND_GUIDE.md
  ✅ CSS variables set in globals.css
  ✅ Tailwind config extended

═══════════════════════════════════════════════════════════════════
```

## Auto-Update Trigger

The skill automatically refreshes docs when:

1. **Time-based:** >15 days since last fetch
2. **Version mismatch:** Detected newer version available
3. **Manual:** User runs `/shadcn docs --refresh`
4. **Error:** Context7 returns updated content hash

## Design System Architecture

### Brand Guide → ShadCN Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    DESIGN SYSTEM FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  .claude/BRAND_GUIDE.md                                        │
│  ├─ colors.primary: "#ba0c2f"                                  │
│  ├─ colors.secondary: "#1a1a1a"                                │
│  ├─ typography.font_sans: "system-ui"                          │
│  ├─ motion.duration_normal: "300ms"                            │
│  └─ spacing.radius: "0.5rem"                                   │
│                    │                                            │
│                    ▼                                            │
│  src/styles/globals.css                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ @layer base {                                            │   │
│  │   :root {                                                │   │
│  │     --primary: 350 87% 39%;        /* #ba0c2f → HSL */  │   │
│  │     --primary-foreground: 0 0% 100%;                    │   │
│  │     --secondary: 0 0% 10%;         /* #1a1a1a → HSL */  │   │
│  │     --radius: 0.5rem;                                   │   │
│  │     --font-sans: system-ui, sans-serif;                 │   │
│  │   }                                                      │   │
│  │ }                                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                    │                                            │
│                    ▼                                            │
│  tailwind.config.ts                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ theme: {                                                 │   │
│  │   extend: {                                              │   │
│  │     colors: {                                            │   │
│  │       primary: "hsl(var(--primary))",                   │   │
│  │       secondary: "hsl(var(--secondary))",               │   │
│  │     },                                                   │   │
│  │     borderRadius: {                                      │   │
│  │       lg: "var(--radius)",                              │   │
│  │     },                                                   │   │
│  │   }                                                      │   │
│  │ }                                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                    │                                            │
│                    ▼                                            │
│  ShadCN Components (auto-styled)                               │
│  ├─ <Button> uses primary color                                │
│  ├─ <Card> uses radius and background                          │
│  └─ All components inherit brand values                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### CSS Variable Mapping

When brand guide changes, these CSS variables are auto-updated:

| Brand Guide | CSS Variable | ShadCN Usage |
|-------------|--------------|--------------|
| `colors.primary` | `--primary` | Button, badges, links |
| `colors.secondary` | `--secondary` | Secondary buttons |
| `colors.accent` | `--accent` | Highlights, focus rings |
| `colors.background` | `--background` | Page backgrounds |
| `colors.foreground` | `--foreground` | Text color |
| `colors.muted` | `--muted` | Disabled states |
| `colors.destructive` | `--destructive` | Error states, delete |
| `typography.font_sans` | `--font-sans` | Body text |
| `typography.font_mono` | `--font-mono` | Code blocks |
| `spacing.radius` | `--radius` | Border radius |

### Globals.css Complete Template

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Colors - From BRAND_GUIDE.md */
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 350 87% 39%;           /* Hustle Red #ba0c2f */
    --primary-foreground: 0 0% 100%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 350 87% 39%;              /* Match primary */

    /* Spacing */
    --radius: 0.5rem;

    /* Typography */
    --font-sans: system-ui, -apple-system, sans-serif;
    --font-mono: ui-monospace, monospace;

    /* Motion - From BRAND_GUIDE.md */
    --animation-duration-fast: 150ms;
    --animation-duration-normal: 300ms;
    --animation-duration-slow: 500ms;
    --animation-easing: ease-out;
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 350 87% 45%;           /* Slightly lighter for dark */
    --primary-foreground: 0 0% 100%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 350 87% 45%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-family: var(--font-sans);
  }
}
```

### Registry Integration

Brand guide elements tracked in `registry.json`:

```json
{
  "brand_guide": {
    "file": ".claude/BRAND_GUIDE.md",
    "globals_css": "src/styles/globals.css",
    "tailwind_config": "tailwind.config.ts",
    "theme_file": "src/lib/theme.ts",
    "css_variables": {
      "--primary": "350 87% 39%",
      "--secondary": "0 0% 96.1%",
      "--radius": "0.5rem",
      "--font-sans": "system-ui"
    },
    "shadcn": {
      "initialized": true,
      "components_installed": ["button", "card", "input"],
      "theme_configured": true,
      "last_sync": "2025-12-29T10:00:00Z"
    }
  }
}
```

## Brand Guide Sync

When brand guide is edited, components auto-update:

### Sync Command

```bash
/shadcn sync
```

This command:
1. Reads `.claude/BRAND_GUIDE.md`
2. Converts colors to HSL for CSS variables
3. Updates `globals.css`
4. Updates `tailwind.config.ts`
5. Updates registry with new values

### Auto-Sync on Brand Edit

The `brand-sync.py` hook triggers sync when:
- `BRAND_GUIDE.md` is edited
- `/hustle-brand --edit` is run
- New brand guide is created

### Sync Output

```
═══════════════════════════════════════════════════════════════
                    BRAND → SHADCN SYNC
═══════════════════════════════════════════════════════════════

Reading Brand Guide...
  Primary: #ba0c2f → hsl(350, 87%, 39%)
  Secondary: #1a1a1a → hsl(0, 0%, 10%)
  Font: system-ui

Updating globals.css...
  ✅ --primary updated
  ✅ --secondary updated
  ✅ --font-sans updated
  ✅ --radius updated

Updating tailwind.config.ts...
  ✅ Colors extended
  ✅ Font family set

Updating registry.json...
  ✅ CSS variables recorded
  ✅ Sync timestamp updated

All 12 installed components will now use updated brand values.

═══════════════════════════════════════════════════════════════
```

## Integration with Brand Guide

ShadCN components automatically use brand values:

```tsx
// Button uses brand primary color
<Button>Primary Action</Button>

// Card uses brand radius and background
<Card>
  <CardHeader>
    <CardTitle>Brand-Styled Card</CardTitle>
  </CardHeader>
</Card>
```

Theme variables in `globals.css`:
```css
@layer base {
  :root {
    /* From BRAND_GUIDE.md */
    --primary: 350 87% 39%;
    --primary-foreground: 0 0% 100%;
    --radius: 0.5rem;
    /* ... */
  }
}
```

## Examples

```bash
# Get button documentation
/shadcn docs button

# Install form components for a signup page
/shadcn add form input button checkbox

# Check what's installed
/shadcn status

# Force refresh documentation
/shadcn docs --refresh

# Get theming help
/shadcn docs theming
```

## See Also

- `/hustle-brand` - Create brand guide (configures ShadCN theme)
- `/hustle-ui-create` - Create components using ShadCN
- Context7 MCP - Documentation source
