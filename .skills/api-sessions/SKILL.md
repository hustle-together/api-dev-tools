---
name: api-sessions
version: 3.11.0
description: Browse, search, and export saved session logs from API development workflows
author: Hustle Together
tags: [api, sessions, history, export]
---

# API Sessions

Browse and export saved session logs from previous API development workflows.

## Usage

```
/api-sessions [options]
```

## Options

| Option | Description |
|--------|-------------|
| `--list` | List all saved sessions |
| `--view [endpoint]` | View a specific session's details |
| `--export [endpoint] [format]` | Export session to md/html/json |
| `--search [term]` | Search across all sessions |
| `--cleanup` | Remove old sessions (>30 days) |

## Examples

```bash
# List all sessions
/api-sessions --list

# View most recent brandfetch session
/api-sessions --view brandfetch

# Export to markdown
/api-sessions --export brandfetch md

# Search for "rate limit" across all sessions
/api-sessions --search "rate limit"

# Clean up old sessions
/api-sessions --cleanup
```

## Session Storage Structure

Sessions are stored in `.claude/sessions/`:

```
.claude/sessions/
├── brandfetch_2025-12-11_15-30-00/
│   ├── state-snapshot.json     # State at completion
│   ├── files-created.txt       # List of files created
│   ├── summary.md              # Executive summary
│   └── research/               # Copy of research files
│       ├── sources.json
│       ├── interview.json
│       └── CURRENT.md
├── elevenlabs_2025-12-11_18-45-00/
│   └── ...
└── index.json                  # Session index
```

## Implementation Steps

### --list

```
READ .claude/sessions/index.json
IF not exists:
  MESSAGE "No sessions saved yet."
  EXIT

FOR each session in index:
  DISPLAY: endpoint, date, phases completed, status

SORT by date descending

OUTPUT:
┌─────────────────────────────────────────────────────┐
│ SAVED SESSIONS                                       │
├────┬─────────────┬────────────┬────────┬────────────┤
│ #  │ Endpoint    │ Date       │ Phases │ Status     │
├────┼─────────────┼────────────┼────────┼────────────┤
│ 1  │ brandfetch  │ 2025-12-11 │ 13/13  │ complete   │
│ 2  │ elevenlabs  │ 2025-12-10 │ 8/13   │ incomplete │
│ 3  │ stripe      │ 2025-12-09 │ 13/13  │ complete   │
└────┴─────────────┴────────────┴────────┴────────────┘
```

### --view [endpoint]

```
FIND most recent session for endpoint
READ summary.md from session folder
READ state-snapshot.json for details

DISPLAY:
┌─────────────────────────────────────────────────────┐
│ SESSION: brandfetch                                  │
├─────────────────────────────────────────────────────┤
│ Date: 2025-12-11 15:30:00                           │
│ Status: complete                                     │
│ Phases: 13/13                                        │
│                                                      │
│ Files Created:                                       │
│   • src/app/api/v2/brandfetch/route.ts              │
│   • src/lib/schemas/brandfetch.ts                   │
│   • __tests__/brandfetch.api.test.ts                │
│                                                      │
│ Interview Decisions:                                 │
│   • format: json, svg                               │
│   • authentication: api_key                         │
│                                                      │
│ Research Sources:                                    │
│   • https://docs.brandfetch.com/reference/          │
└─────────────────────────────────────────────────────┘
```

### --export [endpoint] [format]

```
FIND session folder for endpoint
LOAD all session files:
  - state-snapshot.json
  - summary.md
  - files-created.txt
  - research/*

FORMAT to requested output:
  md   → Markdown document
  html → HTML report with styling
  json → Raw JSON export

WRITE to: .claude/sessions/exports/{endpoint}.{format}
MESSAGE "Exported to: {path}"
```

### --search [term]

```
FOR each session in .claude/sessions/:
  SEARCH summary.md for term
  SEARCH state-snapshot.json for term
  SEARCH research/*.md for term

  IF match found:
    ADD to results with context snippet

DISPLAY results with highlighted matches
```

### --cleanup

```
FOR each session in .claude/sessions/:
  IF session date > 30 days old:
    ADD to cleanup list

IF cleanup list empty:
  MESSAGE "No sessions older than 30 days."
ELSE:
  SHOW sessions to remove
  ASK for confirmation
  IF confirmed:
    DELETE session folders
    UPDATE index.json
```

## Automatic Session Saving

Sessions are automatically saved when:
- `/api-create` workflow completes (Phase 13)
- User explicitly runs `/api-status --save`
- Context window limit approached (checkpoint save)

## Related Skills

- `/api-create` - Start new workflow
- `/api-continue` - Resume interrupted workflow
- `/api-status` - Check current workflow progress
