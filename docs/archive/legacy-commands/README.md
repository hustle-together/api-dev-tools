# Legacy Commands (Archived)

These markdown command files were the original format before migration to Agent Skills (`.skills/`).

**Archived:** 2025-12-25
**Reason:** Superseded by `.skills/` directory using Agent Skills standard

## Status

| Old Command | New Skill | Notes |
|-------------|-----------|-------|
| `hustle-api-create.md` | `.skills/api-create/` | Renamed (removed hustle- prefix) |
| `hustle-api-continue.md` | `.skills/api-continue/` | Renamed |
| `hustle-api-env.md` | `.skills/api-env/` | Renamed |
| `hustle-api-interview.md` | `.skills/api-interview/` | Renamed |
| `hustle-api-research.md` | `.skills/api-research/` | Renamed |
| `hustle-api-sessions.md` | `.skills/api-sessions/` | Renamed |
| `hustle-api-status.md` | `.skills/api-status/` | Renamed |
| `hustle-api-verify.md` | `.skills/api-verify/` | Renamed |
| `hustle-combine.md` | `.skills/hustle-combine/` | Kept name |
| `hustle-ui-create.md` | `.skills/hustle-ui-create/` | Kept name |
| `hustle-ui-create-page.md` | `.skills/hustle-ui-create-page/` | Kept name |
| All others | Same name in `.skills/` | Direct migration |

## Why Archived

1. **Agent Skills Standard** - Cross-platform compatibility (Claude Code, VS Code, Cursor, ChatGPT, GitHub Copilot)
2. **SKILL.md Format** - Structured frontmatter with metadata
3. **Simplified Names** - Removed `hustle-` prefix from API commands
4. **Better Organization** - One folder per skill with potential for multiple files

## Reference

These files remain useful as detailed documentation. The content was incorporated into the corresponding SKILL.md files.

For current skills, see: [/.skills/README.md](../../../.skills/README.md)
