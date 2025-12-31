#!/usr/bin/env python3
"""
Project Document Prompt Hook

Prompts users for a project document (PRD, spec, deep research output) at the
start of /hustle-build. Stores the document in state for AI-powered decomposition.

Hook Type: PreToolUse (matcher: Skill)
Trigger: When /hustle-build is invoked
Version: 4.6.0

Flags:
  --skip-document      Skip the project document prompt
  --from-document PATH Use specified file as project document
  --no-document        Alias for --skip-document
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime

try:
    from hook_utils import load_state, save_state, get_project_dir, log_workflow_event
    UTILS_AVAILABLE = True
except ImportError:
    UTILS_AVAILABLE = False


def get_project_dir_fallback():
    """Get project directory from environment or current directory."""
    return Path(os.environ.get("CLAUDE_PROJECT_DIR", "."))


def load_hustle_build_state():
    """Load hustle-build orchestration state."""
    project_dir = get_project_dir_fallback()
    state_file = project_dir / ".claude" / "hustle-build-state.json"
    if state_file.exists():
        try:
            return json.loads(state_file.read_text())
        except Exception:
            pass
    return None


def save_hustle_build_state(state):
    """Save hustle-build orchestration state."""
    project_dir = get_project_dir_fallback()
    state_file = project_dir / ".claude" / "hustle-build-state.json"
    state_file.parent.mkdir(parents=True, exist_ok=True)
    state_file.write_text(json.dumps(state, indent=2))


def parse_flags(args):
    """Parse command-line style flags from arguments string."""
    flags = {
        "skip_document": False,
        "from_document": None,
    }

    if not args:
        return flags

    # Check for skip flags
    if "--skip-document" in args or "--no-document" in args:
        flags["skip_document"] = True

    # Check for --from-document PATH
    if "--from-document" in args:
        # Extract path after --from-document
        parts = args.split("--from-document")
        if len(parts) > 1:
            path_part = parts[1].strip().split()[0] if parts[1].strip() else None
            if path_part and not path_part.startswith("--"):
                flags["from_document"] = path_part

    return flags


def read_document_file(file_path):
    """Read a document file and detect its format."""
    path = Path(file_path)

    if not path.exists():
        # Try relative to project dir
        project_dir = get_project_dir_fallback()
        path = project_dir / file_path

    if not path.exists():
        return None, None, f"File not found: {file_path}"

    try:
        content = path.read_text()

        # Detect format
        suffix = path.suffix.lower()
        if suffix in [".md", ".markdown"]:
            fmt = "markdown"
        elif suffix == ".json":
            fmt = "json"
        elif suffix in [".txt", ".text"]:
            fmt = "text"
        else:
            # Guess based on content
            if content.strip().startswith("{") or content.strip().startswith("["):
                fmt = "json"
            elif content.startswith("#") or "##" in content[:500]:
                fmt = "markdown"
            else:
                fmt = "text"

        return content, fmt, None
    except Exception as e:
        return None, None, f"Error reading file: {e}"


def main():
    # Read tool input from stdin or environment
    tool_input_raw = os.environ.get("CLAUDE_TOOL_INPUT", "")

    # Also check stdin for hook input
    try:
        if not sys.stdin.isatty():
            stdin_data = sys.stdin.read()
            if stdin_data:
                try:
                    hook_input = json.loads(stdin_data)
                    tool_input_raw = json.dumps(hook_input.get("tool_input", {}))
                except json.JSONDecodeError:
                    pass
    except Exception:
        pass

    try:
        data = json.loads(tool_input_raw) if tool_input_raw else {}
        skill_name = data.get("skill", "")
        args = data.get("args", "")
    except Exception:
        # Not a skill invocation or invalid JSON
        print(json.dumps({"continue": True}))
        return

    # Only trigger for hustle-build skill
    if skill_name != "hustle-build":
        print(json.dumps({"continue": True}))
        return

    # Parse flags from arguments
    flags = parse_flags(args)

    # Check for skip flag
    if flags["skip_document"]:
        print(json.dumps({"continue": True}))
        return

    # Check if project_spec already exists with content
    state = load_hustle_build_state()
    if state and state.get("project_spec", {}).get("raw_content"):
        print(json.dumps({"continue": True}))
        return

    # Handle --from-document flag
    if flags["from_document"]:
        content, fmt, error = read_document_file(flags["from_document"])

        if error:
            # Inject error message
            result = {
                "continue": True,
                "additionalContext": f"""
## Project Document Error

Could not load document: {error}

Please provide the document path again or use `--skip-document` to proceed without a document.
"""
            }
            print(json.dumps(result))
            return

        # Initialize or update state with document
        if not state:
            state = {
                "version": "4.6.0",
                "build_id": f"build-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
                "status": "initializing"
            }

        state["project_spec"] = {
            "source": "file",
            "file_path": flags["from_document"],
            "raw_content": content,
            "format": fmt,
            "loaded_at": datetime.now().isoformat(),
            "word_count": len(content.split()),
            "extracted": None,  # Will be filled by Phase 0.5
            "user_modifications": {
                "added": [],
                "removed": [],
                "modified": []
            }
        }

        save_hustle_build_state(state)

        # Log the event
        if UTILS_AVAILABLE:
            log_workflow_event("project_document_loaded", {
                "source": "file",
                "file_path": flags["from_document"],
                "format": fmt,
                "word_count": len(content.split())
            })

        # Inject confirmation
        result = {
            "continue": True,
            "additionalContext": f"""
## Project Document Loaded

Successfully loaded project document:
- **Source:** `{flags["from_document"]}`
- **Format:** {fmt}
- **Size:** {len(content.split())} words

The document will be analyzed in Phase 0.5 to extract:
- Pages/routes
- Components
- APIs
- Data models
- External integrations

Proceeding to parse your build request...
"""
        }
        print(json.dumps(result))
        return

    # No document provided - inject prompt asking for one
    context = """
## Project Document Intake

Before decomposing this build request, I need to check if you have a comprehensive project document.

**Do you have a project document (PRD, spec, deep research output)?**

A project document helps me:
- Identify ALL pages, components, and APIs upfront
- Build accurate dependency graphs
- Reference the spec throughout each sub-workflow
- Ensure nothing is missed

### How to Provide a Document

**Option 1: File Path**
```
I have a document at ./docs/my-prd.md
```

**Option 2: Paste Content**
Just paste the document content directly in your next message.

**Option 3: URL**
```
Fetch the document from https://example.com/my-spec.md
```

**Option 4: No Document**
```
No document, proceed with parsing my description
```

### Supported Formats
- Markdown (`.md`) - PRDs, specs, research outputs
- Plain text (`.txt`) - Notes, outlines
- JSON (`.json`) - Structured specs, API definitions

---

_To skip this prompt in the future, use:_
```
/hustle-build --skip-document [description]
```

_Or provide a document directly:_
```
/hustle-build --from-document ./docs/spec.md [description]
```
"""

    result = {
        "continue": True,
        "additionalContext": context
    }

    print(json.dumps(result))


if __name__ == "__main__":
    main()
