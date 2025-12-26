---
name: skill-finder
description: Discover and recommend relevant agent skills for your current task. Meta-skill that searches across local skills, SkillsMP marketplace, and anthropics/skills repository. Use when you need specialized tools for API development, documentation, testing, or workflow automation. Keywords: discover, find, search, skills, tools, marketplace, registry
license: MIT
compatibility: Requires Claude Code with internet access for marketplace search
metadata:
  version: "3.11.0"
  category: "meta"
  tags: ["discovery", "search", "skills", "marketplace", "tools"]
  author: "Hustle Together"
allowed-tools: WebSearch WebFetch Read Glob Grep AskUserQuestion
---

# Skill Finder - Discover Relevant Agent Skills

**Usage:** `/skill-finder [task-description]`

**Purpose:** Meta-skill that discovers and recommends relevant agent skills for your current task. Searches local installed skills, SkillsMP marketplace, and the official anthropics/skills repository.

## When to Use

- Starting a new project and need to find relevant tools
- Looking for API documentation scrapers
- Need specialized testing or validation skills
- Want to discover workflow automation skills
- Searching for MCP server integrations

## Discovery Sources (Priority Order)

### 1. Local Skills (Fastest - No Network)
```
Search locations:
├── .skills/                    # Project skills
├── ~/.claude/skills/           # User skills
└── /usr/local/share/skills/    # System skills
```

### 2. SkillsMP Marketplace
```
https://skillsmp.com/api/search?q=[query]

Returns:
- Skill name and description
- Author and download count
- Compatibility (Claude Code, VS Code, Cursor)
- Installation command
```

### 3. Official Anthropic Skills Repository
```
https://github.com/anthropics/skills

Categories:
- development/
- documentation/
- testing/
- workflow/
- integrations/
```

## Search Algorithm

```
/skill-finder stripe payment integration

Step 1: Parse task keywords
  → ["stripe", "payment", "integration", "api"]

Step 2: Search local skills
  → Glob: .skills/**/SKILL.md
  → Grep: description for keywords
  → Match: api-create, api-research (local)

Step 3: Search SkillsMP
  → WebSearch: "skillsmp stripe payment"
  → WebFetch: skillsmp.com results
  → Match: stripe-sdk-helper, payment-validator

Step 4: Search anthropics/skills
  → WebSearch: "site:github.com/anthropics/skills stripe"
  → Match: stripe-integration

Step 5: Rank by relevance
  → Local skills get +10 bonus (already installed)
  → Higher download count = higher rank
  → More keyword matches = higher rank

Step 6: Present to user
```

## Output Format

```
═══════════════════════════════════════════════════
🔍 Skill Discovery: "stripe payment integration"
═══════════════════════════════════════════════════

📦 LOCAL SKILLS (Already Installed)
┌────────────────────────────────────────────────────┐
│ ✅ api-create                                      │
│    Complete API development workflow               │
│    Usage: /api-create stripe                       │
├────────────────────────────────────────────────────┤
│ ✅ api-research                                    │
│    Adaptive documentation research                 │
│    Usage: /api-research stripe                     │
└────────────────────────────────────────────────────┘

🌐 SKILLSMP MARKETPLACE
┌────────────────────────────────────────────────────┐
│ 📦 stripe-sdk-helper                               │
│    By: payments-dev | ⬇️ 1.2k downloads            │
│    Stripe SDK type generation and validation       │
│    Install: /plugin install stripe-sdk-helper      │
├────────────────────────────────────────────────────┤
│ 📦 payment-flow-tester                             │
│    By: fintech-tools | ⬇️ 890 downloads            │
│    End-to-end payment flow testing                 │
│    Install: /plugin install payment-flow-tester    │
└────────────────────────────────────────────────────┘

🏛️ ANTHROPIC OFFICIAL
┌────────────────────────────────────────────────────┐
│ 📦 integrations/stripe                             │
│    Official Stripe integration patterns            │
│    GitHub: anthropics/skills/integrations/stripe   │
└────────────────────────────────────────────────────┘

💡 RECOMMENDATION
Based on your task, I recommend:
1. Use /api-create stripe (already installed)
2. Consider stripe-sdk-helper for advanced type generation
```

## Interactive Mode

After displaying results, ask user for next action:

```json
{
  "questions": [{
    "question": "Which skills would you like to install or use?",
    "header": "Skills",
    "multiSelect": true,
    "options": [
      {"label": "Use api-create", "description": "Start API workflow with local skill"},
      {"label": "Install stripe-sdk-helper", "description": "Add from SkillsMP"},
      {"label": "Search more", "description": "Refine search with different keywords"},
      {"label": "Done", "description": "No action needed"}
    ]
  }]
}
```

## Search Modifiers

```bash
# Search by category
/skill-finder category:testing api

# Search marketplace only
/skill-finder source:marketplace documentation

# Search with minimum downloads
/skill-finder stripe downloads:>500

# Search official only
/skill-finder source:anthropic workflow
```

## Integration with API Create

When `/api-create` runs Phase 3 (Research), it can invoke `/skill-finder` to discover specialized documentation tools:

```
Phase 3: Research
  ├─> Context7: [library] documentation
  ├─> WebSearch: [library] API reference
  └─> /skill-finder [library] documentation scraper
       → Discovers: openapi-discoverer, sdk-method-extractor
       → User chooses to install/skip
       → If installed, uses in Deep Research
```

## Caching

Search results are cached in `.claude/skill-finder-cache.json`:

```json
{
  "version": "1.0.0",
  "cache": {
    "stripe payment": {
      "results": [...],
      "timestamp": "2025-12-24T10:30:00Z",
      "ttl_hours": 24
    }
  }
}
```

Cache expires after 24 hours to ensure fresh marketplace results.

## Error Handling

| Scenario | Behavior |
|----------|----------|
| No internet | Search local skills only, show warning |
| SkillsMP down | Skip marketplace, search anthropics/skills |
| No matches | Suggest broadening search terms |
| Too many matches | Ask user to add keywords to narrow |

## Related Skills

- `/api-research` - Documentation research workflow
- `/api-create` - Complete API development workflow
- `/add-command` - Create new skills
