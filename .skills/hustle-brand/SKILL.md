---
name: hustle-brand
description: Create and edit comprehensive brand guide with interview-driven discovery
tools: Bash, Read, Write, Glob, Grep, Task, AskUserQuestion, TodoWrite
model: sonnet
---

# Hustle Brand - Brand Guide Creator

Create a comprehensive brand guide through interview-driven discovery. The brand guide becomes the single source of truth for all UI development, ensuring consistency across every component, page, and interaction.

## Why This Matters

> **Without a brand guide**, every AI-generated component looks slightly different.
> Colors drift, fonts vary, animations feel inconsistent.
> **With a brand guide**, every element feels like it belongs.

## When to Use

- During initial project setup (Installation Wizard Phase 3)
- Anytime with `/hustle-brand` to create or edit
- Before any UI development work
- When rebranding or updating visual identity

## What Gets Created

### 1. Brand Guide Document (`.claude/BRAND_GUIDE.md`)

The comprehensive brand specification including:
- Colors (primary, secondary, accent, semantic, gradients)
- Typography (fonts, sizes, weights, line heights)
- Spacing system (consistent padding/margins)
- Border radius conventions
- Shadows and elevation
- Animation principles (timing, easing, motion style)
- Voice and tone guidelines
- Terminology dictionary
- Do's and Don'ts

### 2. Brand Page (`src/app/brand/page.tsx`)

A living showcase of your brand including:
- Color palette with copy-to-clipboard
- Typography scale demonstration
- Button states (default, hover, active, disabled, loading)
- Form elements (inputs, selects, checkboxes, radios)
- Card variations
- Animation examples (GSAP, Framer Motion, CSS)
- Custom elements from interview (Three.js, terminal effects, etc.)
- Voice examples

### 3. ShadCN Theme (`src/lib/theme.ts`)

All brand values as CSS variables for ShadCN:
```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  /* ... full theme */
}
```

### 4. Registry Entry

Brand tracked in `registry.json`:
```json
{
  "brand_guide": {
    "created_at": "2025-12-29T10:00:00Z",
    "last_updated": "2025-12-29T10:00:00Z",
    "version": 1,
    "interview_completed": true,
    "sections": ["colors", "typography", "animations", "voice"],
    "custom_elements": ["terminal-animation", "gradient-text"]
  }
}
```

## Interview Flow

### Phase 1: Foundation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BRAND GUIDE CREATOR                                   │
│                                                                              │
│  Let's create your brand guide. This will be the foundation for all UI.     │
│                                                                              │
│  You can either:                                                             │
│  [1] Answer interview questions (Recommended)                                │
│  [2] Fill out a quick form (faster, uses defaults)                          │
│  [3] Import from Figma/existing brand kit                                   │
│                                                                              │
│  Choice? >                                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Phase 2: Visual Identity

**Colors:**
- What's your primary brand color? (hex or description)
- What mood should the secondary colors convey? (professional, playful, bold)
- Do you want gradients? What style? (subtle, vibrant, aurora)
- Dark mode: mirror light, or distinct personality?

**Typography:**
- What font family? (Inter, system fonts, custom Google Font)
- What's the personality? (modern, classic, technical, friendly)
- Do you need code/monospace fonts?

**Spacing & Sizing:**
- Prefer compact or spacious layouts?
- Border radius style? (sharp, subtle, fully rounded)
- Shadow depth? (flat, subtle, elevated)

### Phase 3: Motion & Animation

**Animation Style:**
- What's the motion personality? (snappy, smooth, bouncy, minimal)
- Preferred library? (CSS, Framer Motion, GSAP, none)
- Special effects wanted? (parallax, 3D, particles, terminal)

**Loading States:**
- Skeleton loaders or spinners?
- Progress bars style?
- Micro-interactions level? (subtle, noticeable, delightful)

### Phase 4: Voice & Tone

**Share of Voice:**
```
How should the UI communicate?

[1] Professional & Informative (Recommended)
    "Your report is ready for download."

[2] Friendly & Casual
    "Hey! Your report's all done. Grab it here!"

[3] Technical & Precise
    "Report generated. 847 records processed. Download available."

[4] Playful & Character-driven
    "Beep boop! I crunched those numbers for you!"

[5] Custom (describe your voice)
```

**Terminology:**
- What do you call your users? (users, members, customers, friends)
- CTA language preference? (Get Started, Begin, Let's Go, Start Free)
- Error tone? (apologetic, matter-of-fact, helpful)

### Phase 5: Custom Elements

Based on your answers, I'll suggest custom elements:

```
Based on your "technical + snappy" preferences, consider:

[x] Terminal-style code animations
[x] Typing effect for hero text
[ ] Matrix rain background
[x] Syntax-highlighted code blocks
[ ] ASCII art elements
[ ] Glitch effects

Select the ones you want (comma-separated): > 1,2,4
```

### Phase 6: Generation

After interview completion:

1. Generate `BRAND_GUIDE.md` with all specifications
2. Create Brand Page with live examples
3. Configure ShadCN theme variables
4. Update registry with brand metadata
5. Add to dashboard navigation

## Brand Page Structure

```tsx
// src/app/brand/page.tsx
export default function BrandPage() {
  return (
    <div className="container py-12 space-y-16">
      {/* Header */}
      <BrandHeader />

      {/* Color Palette */}
      <ColorPalette />

      {/* Typography Scale */}
      <TypographyShowcase />

      {/* Components */}
      <section>
        <h2>Components</h2>
        <ButtonStates />
        <FormElements />
        <CardVariations />
        <NavigationExamples />
      </section>

      {/* Animations */}
      <section>
        <h2>Motion</h2>
        <AnimationExamples />
        <LoadingStates />
        <MicroInteractions />
      </section>

      {/* Custom Elements */}
      <section>
        <h2>Custom Elements</h2>
        {/* Based on interview: terminal, gradients, etc. */}
        <CustomElementShowcase />
      </section>

      {/* Voice Examples */}
      <section>
        <h2>Voice & Tone</h2>
        <VoiceExamples />
        <TerminologyGuide />
        <DosAndDonts />
      </section>
    </div>
  );
}
```

## ShadCN Integration

All UI uses ShadCN components configured with brand values:

```bash
# Initialize ShadCN with brand theme
npx shadcn@latest init

# Components auto-use brand colors
npx shadcn@latest add button input card
```

Theme enforced via `tailwind.config.ts`:
```ts
theme: {
  extend: {
    colors: {
      // Generated from brand interview
      primary: "hsl(var(--primary))",
      secondary: "hsl(var(--secondary))",
      accent: "hsl(var(--accent))",
    },
    fontFamily: {
      // From brand interview
      sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
    },
    animation: {
      // Brand-specific animations
      "fade-in": "fadeIn var(--animation-duration) var(--animation-easing)",
    }
  }
}
```

## Freshness & Updates

Brand guide tracked with freshness:
- Last updated timestamp in registry
- `/hustle-brand` shows time since last update
- Prompts for review if >30 days old
- Version history for rollback

## Commands

```bash
# Create new brand guide (full interview)
/hustle-brand

# Quick edit specific section
/hustle-brand --edit colors
/hustle-brand --edit typography
/hustle-brand --edit voice

# View current brand summary
/hustle-brand --status

# Export brand kit
/hustle-brand --export

# Reset and start over
/hustle-brand --reset
```

## Dashboard Integration

Brand page linked from Hustle Dev Dashboard:
- "Brand Guide" card with last updated date
- Quick preview of primary colors
- Link to full brand page
- Edit button launching `/hustle-brand --edit`

## Installation Wizard Integration

During initial setup:

```
═══════════════════════════════════════════════════════════════════
                    HUSTLE DEV TOOLS - SETUP
═══════════════════════════════════════════════════════════════════

Step 3 of 8: Brand Guide Setup

  A brand guide ensures all AI-generated UI looks consistent.
  This is HIGHLY RECOMMENDED but can be done later.

  [1] Create brand guide now (5-10 min interview)
  [2] Use defaults (can customize later with /hustle-brand)
  [3] Skip for now (warning: UI may be inconsistent)

  Choice? >
═══════════════════════════════════════════════════════════════════
```

## Example Output

After completing the interview:

```
═══════════════════════════════════════════════════════════════════
                    BRAND GUIDE CREATED
═══════════════════════════════════════════════════════════════════

Files Created:
  ✅ .claude/BRAND_GUIDE.md (comprehensive spec)
  ✅ src/app/brand/page.tsx (live showcase)
  ✅ src/lib/theme.ts (ShadCN config)
  ✅ src/styles/brand.css (CSS variables)

Brand Summary:
───────────────────────────────────────
  Primary:     #6366F1 (Indigo)
  Secondary:   #F1F5F9 (Slate)
  Font:        Inter
  Motion:      Snappy (200ms ease-out)
  Voice:       Professional & Helpful
───────────────────────────────────────

Custom Elements Included:
  • Terminal-style code animations
  • Gradient text effects
  • Skeleton loaders

Quick Links:
  📖 Brand Page:  http://localhost:3000/brand
  📝 Edit Brand:  /hustle-brand --edit
  🎨 Dashboard:   http://localhost:3000/hustle-dev-dashboard

═══════════════════════════════════════════════════════════════════
```

## See Also

- `/hustle-ui-create` - Uses brand guide for components
- `/hustle-ui-create-page` - Uses brand guide for pages
- `/shadcn` - ShadCN documentation and component installation
