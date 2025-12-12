#!/usr/bin/env python3
"""
Hook: PreToolUse for Write/Edit
Purpose: Inject brand guide content during UI implementation

This hook runs before writing component/page files. When use_brand_guide=true
in the state, it logs the brand guide summary to remind Claude to apply
consistent branding.

Version: 3.9.0

Returns:
  - {"continue": true} - Always continues
  - May include "notify" with brand guide summary
"""
import json
import sys
from pathlib import Path

# State file is in .claude/ directory (sibling to hooks/)
STATE_FILE = Path(__file__).parent.parent / "api-dev-state.json"
BRAND_GUIDE_FILE = Path(__file__).parent.parent / "BRAND_GUIDE.md"


def extract_brand_summary(content):
    """Extract key brand values from brand guide markdown."""
    summary = []

    lines = content.split("\n")
    current_section = ""

    for line in lines:
        line = line.strip()

        # Track section
        if line.startswith("## "):
            current_section = line[3:].lower()
            continue

        # Extract key values
        if line.startswith("- **") and ":" in line:
            # Parse "- **Key:** Value" format
            try:
                key_part = line.split(":**")[0].replace("- **", "")
                value_part = line.split(":**")[1].strip()

                # Only include primary brand values
                if current_section == "colors" and key_part in ["Primary", "Accent", "Background"]:
                    summary.append(f"{key_part}: {value_part}")
                elif current_section == "typography" and key_part in ["Headings", "Body"]:
                    summary.append(f"{key_part}: {value_part}")
                elif current_section == "component styling" and key_part in ["Border Radius", "Focus Ring"]:
                    summary.append(f"{key_part}: {value_part}")
            except IndexError:
                continue

    return summary


def main():
    # Read hook input from stdin
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        print(json.dumps({"continue": True}))
        sys.exit(0)

    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})

    # Only check Write/Edit operations
    if tool_name not in ["Write", "Edit"]:
        print(json.dumps({"continue": True}))
        sys.exit(0)

    # Check if targeting component or page files
    file_path = tool_input.get("file_path", "")
    is_component = "/components/" in file_path and file_path.endswith(".tsx")
    is_page = "/app/" in file_path and "page.tsx" in file_path

    if not is_component and not is_page:
        print(json.dumps({"continue": True}))
        sys.exit(0)

    # Check if state file exists
    if not STATE_FILE.exists():
        print(json.dumps({"continue": True}))
        sys.exit(0)

    # Load state
    try:
        state = json.loads(STATE_FILE.read_text())
    except json.JSONDecodeError:
        print(json.dumps({"continue": True}))
        sys.exit(0)

    workflow = state.get("workflow", "")

    # Only apply for UI workflows
    if workflow not in ["ui-create-component", "ui-create-page"]:
        print(json.dumps({"continue": True}))
        sys.exit(0)

    # Check if brand guide is enabled
    ui_config = state.get("ui_config", {})
    use_brand_guide = ui_config.get("use_brand_guide", False)

    if not use_brand_guide:
        print(json.dumps({"continue": True}))
        sys.exit(0)

    # Check if brand guide file exists
    if not BRAND_GUIDE_FILE.exists():
        print(json.dumps({"continue": True}))
        sys.exit(0)

    # Extract brand summary
    brand_content = BRAND_GUIDE_FILE.read_text()
    summary = extract_brand_summary(brand_content)

    if summary:
        notify_msg = "Applying brand guide: " + " | ".join(summary[:5])
        print(json.dumps({"continue": True, "notify": notify_msg}))
    else:
        print(json.dumps({"continue": True}))

    sys.exit(0)


if __name__ == "__main__":
    main()
