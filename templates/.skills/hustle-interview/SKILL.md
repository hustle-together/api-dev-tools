---
name: hustle-interview
description: Comprehensive project interview for /hustle-build orchestrator - establishes project-wide defaults stored in registry
version: 1.0.0
---

# Hustle Interview - Project Configuration

This skill conducts a comprehensive interview to understand the project scope and establish defaults that persist in the registry for all future workflows.

## When to Use

- First time using /hustle-build on a project
- When orchestrator_defaults in registry.json are empty/null
- When user wants to reconfigure project defaults

## Interview Sections

### Section 1: Project Overview

Ask about:
1. **Project Type**: What kind of application? (SaaS, E-commerce, Dashboard, Marketing, Blog, Custom)
2. **Target Audience**: Who uses this? (Developers, Business users, General public, Internal team)
3. **Scale**: Expected users/traffic? (MVP/Prototype, Small <1k, Medium <10k, Large >10k)

### Section 2: Technical Stack Confirmation

Verify and record:
1. **Framework**: Next.js version (App Router or Pages Router?)
2. **Styling**: Tailwind CSS, CSS Modules, Styled Components, Emotion, Vanilla CSS?
3. **State Management**: React Context, Zustand, Redux, Jotai, None?
4. **Database**: Supabase, Firebase, Prisma+PostgreSQL, MongoDB, None?

### Section 3: Error Handling Philosophy

Ask ONE question with options:
- **try-catch-rethrow**: Traditional try/catch with custom error classes
- **error-boundary**: React error boundaries with fallback UI
- **result-type**: Rust-style Result<T, E> pattern (neverthrow library)
- **error-codes**: Return error codes with lookup table

Store choice in: `registry.orchestrator_defaults.error_handling.style`

### Section 4: Authentication Pattern

Ask ONE question with options:
- **jwt**: JSON Web Tokens (stateless, API-friendly)
- **session**: Server-side sessions (traditional, secure)
- **api-key**: API key authentication (for services/integrations)
- **oauth**: OAuth 2.0 / OpenID Connect (social login)
- **none**: No authentication needed

Store choice in: `registry.orchestrator_defaults.authentication.method`

### Section 5: Logging & Observability

Ask ONE question with options:
- **verbose**: Log everything (development mode)
- **standard**: Log errors + warnings + key events
- **minimal**: Log errors only
- **none**: No logging (not recommended)

Store choice in: `registry.orchestrator_defaults.logging.level`

### Section 6: API Versioning Strategy

Ask ONE question with options:
- **url-prefix**: `/api/v1/`, `/api/v2/` (most common)
- **header**: `Accept: application/vnd.api.v1+json`
- **query-param**: `?version=1`
- **none**: No versioning (single version)

Store choice in: `registry.orchestrator_defaults.api_versioning.strategy`

### Section 7: Testing Preferences

Ask about:
1. **Coverage threshold**: What % code coverage is required? (50%, 70%, 80%, 90%)
2. **Visual viewports**: Which devices matter most? (Confirm all 7 or subset)
3. **E2E browsers**: Chrome only, or Chrome + Firefox + Safari?

Store in: `registry.orchestrator_defaults.testing`

### Section 8: Platform Targets

Ask ONE question:
- **web-only**: Just web browser (PWA optional)
- **web-plus-desktop**: Web + Tauri for Windows/Mac/Linux
- **web-plus-mobile**: Web + Capacitor for iOS/Android
- **full-cross-platform**: Web + Desktop + Mobile

Store choice in: `registry.orchestrator_defaults.platform_targets`

Note: If desktop/mobile selected, prompt for setup during first build.

### Section 9: Styling Approach

Already captured in Section 2, but confirm:
- **tailwind**: Utility-first CSS (default for Hustle)
- **css-modules**: Scoped CSS with .module.css
- **styled-components**: CSS-in-JS with tagged templates
- **emotion**: CSS-in-JS with object styles
- **vanilla**: Plain CSS files

Store in: `registry.orchestrator_defaults.styling.approach`

## Output

After interview completes:

1. Update `.claude/registry.json` with all choices
2. Display summary of all decisions
3. Confirm with user before saving
4. Note that these can be changed anytime with `/hustle-interview`

## Example Summary Output

```
╔═══════════════════════════════════════════════════════════════╗
║                    PROJECT CONFIGURATION                       ║
╠═══════════════════════════════════════════════════════════════╣
║ Project Type:      SaaS Dashboard                             ║
║ Framework:         Next.js 15 (App Router)                    ║
║ Styling:           Tailwind CSS                               ║
║ State:             Zustand                                    ║
║ Database:          Supabase                                   ║
╠───────────────────────────────────────────────────────────────╣
║ Error Handling:    Result Type (neverthrow)                   ║
║ Authentication:    JWT                                        ║
║ Logging:           Standard                                   ║
║ API Versioning:    URL Prefix (/api/v1/)                      ║
╠───────────────────────────────────────────────────────────────╣
║ Coverage Target:   80%                                        ║
║ Visual Viewports:  All 7                                      ║
║ E2E Browsers:      Chrome + Firefox + WebKit                  ║
║ Platform Target:   Web Only                                   ║
╚═══════════════════════════════════════════════════════════════╝

These settings will be used for ALL future /hustle-build workflows.
Run /hustle-interview anytime to change them.
```

## Registry Integration

The skill MUST update the registry file after user confirmation:

```json
{
  "orchestrator_defaults": {
    "project_type": "saas",
    "error_handling": { "style": "result-type" },
    "authentication": { "method": "jwt" },
    "logging": { "level": "standard" },
    "api_versioning": { "strategy": "url-prefix" },
    "testing": {
      "coverage_threshold": 80,
      "visual_viewports": ["all"],
      "e2e_browsers": ["chromium", "firefox", "webkit"]
    },
    "platform_targets": "web-only",
    "styling": { "approach": "tailwind" },
    "configured_at": "2025-12-29T12:00:00Z",
    "configured_by": "hustle-interview"
  }
}
```

## Re-running the Interview

Users can run `/hustle-interview` anytime to:
- View current settings
- Modify specific settings
- Reset all settings
- Export settings (for team sharing)
