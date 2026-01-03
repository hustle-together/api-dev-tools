    ╔═══════════════════════════════════════════════════════════════╗
    ║                                                               ║
    ║     ██╗  ██╗██╗   ██╗███████╗████████╗██╗     ███████╗       ║
    ║     ██║  ██║██║   ██║██╔════╝╚══██╔══╝██║     ██╔════╝       ║
    ║     ███████║██║   ██║███████╗   ██║   ██║     █████╗         ║
    ║     ██╔══██║██║   ██║╚════██║   ██║   ██║     ██╔══╝         ║
    ║     ██║  ██║╚██████╔╝███████║   ██║   ███████╗███████╗       ║
    ║     ╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝   ╚══════╝╚══════╝       ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝

                        HUSTLE
                    API Dev Tools
        Interview-driven, research-first API development
                        v3.12.6

Choose installation mode Custom Setup (configure each option)

━━━ API Keys ━━━
These keys enable advanced features like code review and brand fetching

Get your keys (all have free tiers):

GITHUB_TOKEN
→ https://github.com/settings/tokens
Purpose: Create issues, PRs, search code
Scope needed: 'repo' for private repos

GREPTILE_API_KEY
→ https://app.greptile.com/settings/api
Purpose: AI code review in Phase 11
Free tier: 100 reviews/month

BRANDFETCH_API_KEY
→ https://brandfetch.com/developers
Purpose: Auto-fetch logos, colors, fonts from domains
Free tier: 50 requests/month (basic assets)

Configure API keys now? Yes, enter them now
GITHUB_TOKEN: \***\*OR6R
GREPTILE_API_KEY: \*\***AuC
BRANDFETCH_API_KEY (optional, for auto brand guide):

━━━ Testing Tools ━━━
Required for component development and E2E testing

What each tool does:
Playwright → E2E browser testing (required for /hustle-ui-create-page)
Storybook → Component development & visual testing (required for /hustle-ui-create)
Sandpack → Live code preview in browser (optional)

Select testing tools to install Playwright (E2E testing), Storybook (component development), Sandpack (live code preview)

━━━ Push Notifications (NTFY) ━━━
Get notified on your phone when long tasks complete

How it works:

1. Install NTFY app: iOS App Store / Android Play Store
2. Subscribe to your topic in the app
3. Receive push notifications when builds/tests finish

Free service, no account required. Learn more: https://ntfy.sh

Enable NTFY push notifications? (y/N): y

Topic name = channel for your notifications (must match the app)
NTFY Topic name (test-api-dev-tools-alerts):
Server URL = ntfy.sh (public) or your self-hosted server
NTFY Server URL (ntfy.sh):

━━━ Brand Guide ━━━
Design system that enforces consistent UI across all components

Why you need a brand guide:
• Consistent look across all pages and components
• Faster development (no color/font decisions each time)
• Enforced by hooks during /hustle-ui-create
• Professional, cohesive user experience

Create brand guide? (Y/n): y

How would you like to create your brand guide?

Brand guide source Manual Interview - Answer questions about your brand preferences

━━━ Brand Interview ━━━
Let's define your brand's visual identity

Brand/Project name (test-api-dev-tools): Hustle Together

Color Palette
Define colors that represent your brand

Primary color (main CTAs, links) - hex (#E11D48): Blue
Secondary color (accents, secondary buttons) - hex (#1E40AF): Beige
Accent color (highlights, badges) - hex (#8B5CF6): idk

Typography
Fonts define your brand's personality

Primary body font Other - Enter custom font
Custom font family name (Inter): a nice serif sophisticated font

Heading font Other - Enter custom font
Custom heading font (a nice serif sophisticated font): sans-serif fonts that pairs nicely

UI Style Preferences
Define the overall look and feel

Button style Subtle (4px) - Professional, slightly softened

Card style Flat - Minimal, no depth

Visual Content
Preferences for images and icons

Preferred image style Abstract - Shapes, gradients, patterns

Icon style Duotone - Two-tone, distinctive

Animation level Expressive - Bold animations, personality
Include dark mode support? (Y/n): y

━━━ Installing ━━━

[1/10] Checking prerequisites
Verifying Node.js 18+ and Python 3 are installed
● Node.js v23.10.0
● Python 3.14.0

[2/10] Installing slash commands
Copying 29 commands including /hustle-api-create, /hustle-ui-create
● 0 commands installed to .claude/commands/

[3/10] Installing enforcement hooks
Python hooks that enforce TDD workflow and prevent skipping phases
● 0 hooks installed to .claude/hooks/
○ Includes: enforce-_, notify-_, track-token-usage.py

[4/10] Installing subagents
AI agents for parallel research, schema generation, code review
● 0 subagents installed to .claude/agents/
○ Haiku: parallel-researcher, research-validator, docs-generator
○ Sonnet: schema-generator, test-writer, implementation-reviewer, code-reviewer

[5/10] Setting up configuration
Creating settings.json, state tracking, and research cache
● Merged settings.json
○ State file preserved

[6/10] Setting up environment
Creating .env.example template for API keys
● Created templates/.env.example
○ Copy to .env and configure your API keys

[7/10] Configuring MCP servers
Setting up AI-powered integrations for research and code review
○ context7 already configured
Live documentation lookup (npm, APIs, frameworks)
○ github already configured
GitHub integration (issues, PRs, code search)
○ greptile already configured
AI code review for Phase 11 verification
● Added brandfetch
Auto-fetch brand assets (logos, colors, fonts)

MCP Server Benefits:
• Context7: Always get latest docs, no hallucinated APIs
• GitHub: Create issues/PRs directly from Claude
• Greptile: AI-powered code review catches bugs before merge
• Brandfetch: Auto-generate brand guide from company domain

[8/10] Configuring environment
Writing API keys and notification settings to .env
● Updated .env with API keys

[9/10] Brand guide
Creating comprehensive design system documentation
○ Brand guide already exists

[10/10] Testing tools
Installing Playwright, Storybook, and Sandpack (this may take a few minutes)
● Sandpack installedk...
○ Storybook init failed - run: pnpm dlx storybook@latest init
○ Playwright init failed - run: pnpm create playwright

═══════════════════════════════════════════════════════════════
HUSTLE
Installation Complete
═══════════════════════════════════════════════════════════════

Core Components:
✓ Commands .claude/commands/ (29 slash commands)
✓ Hooks .claude/hooks/ (enforcement hooks)
✓ Subagents .claude/agents/ (parallel processing)
✓ Config .claude/ (settings, state, registry)

Configuration:
✓ GITHUB_TOKEN configured
✓ GREPTILE_API_KEY configured
○ BRANDFETCH_API_KEY not set
✓ NTFY Notifications test-api-dev-tools-alerts
✓ Brand Guide manual

Testing Tools:
✓ Playwright installed
✓ Storybook installed
✓ Sandpack installed

Ready to Use:
$ /hustle-api-create [endpoint] # Build API endpoint
$ /hustle-ui-create [component] # Build component
$ /hustle-ui-create-page [page] # Build page
$ /hustle-combine [apis] # Orchestrate APIs

Next Steps:
→ Restart Claude Code to load MCP servers

Documentation: https://github.com/hustle-together/api-dev-tools
