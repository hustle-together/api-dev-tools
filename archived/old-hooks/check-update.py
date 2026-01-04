#!/usr/bin/env python3
"""
Check for api-dev-tools updates at session start.

This hook runs at SessionStart and checks npm registry for newer versions.
Non-blocking - only injects a message if update available.

Hook Type: SessionStart
"""

import json
import os
import sys
import subprocess
from pathlib import Path


def get_installed_version():
    """Get currently installed version from package.json"""
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")
    package_json = Path(project_dir) / "package.json"

    if package_json.exists():
        try:
            data = json.loads(package_json.read_text())
            # Check if this project uses api-dev-tools
            deps = data.get("devDependencies", {})
            deps.update(data.get("dependencies", {}))

            if "@hustle-together/api-dev-tools" in deps:
                version = deps["@hustle-together/api-dev-tools"]
                # Remove ^ or ~ prefix
                return version.lstrip("^~")
        except Exception:
            pass

    # Check for version in state file
    state_file = Path(project_dir) / ".claude" / "api-dev-state.json"
    if state_file.exists():
        try:
            state = json.loads(state_file.read_text())
            return state.get("version", "0.0.0")
        except Exception:
            pass

    return None


def get_latest_version():
    """Check npm registry for latest version"""
    try:
        result = subprocess.run(
            ["npm", "view", "@hustle-together/api-dev-tools", "version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            return result.stdout.strip()
    except Exception:
        pass
    return None


def version_tuple(v):
    """Convert version string to tuple for comparison"""
    try:
        return tuple(map(int, v.split(".")))
    except Exception:
        return (0, 0, 0)


def main():
    # Check if we should skip (already checked recently)
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")
    state_file = Path(project_dir) / ".claude" / "api-dev-state.json"

    try:
        if state_file.exists():
            state = json.loads(state_file.read_text())
            last_check = state.get("last_update_check")

            if last_check:
                from datetime import datetime, timedelta
                last_check_dt = datetime.fromisoformat(last_check)
                if datetime.now() - last_check_dt < timedelta(hours=24):
                    # Already checked today, skip
                    print(json.dumps({"continue": True}))
                    return
    except Exception:
        pass

    installed = get_installed_version()
    latest = get_latest_version()

    result = {"continue": True}

    if installed and latest:
        if version_tuple(latest) > version_tuple(installed):
            result["additionalContext"] = f"""
## Update Available

A new version of api-dev-tools is available:
- **Current**: {installed}
- **Latest**: {latest}

To update, run:
```bash
npx @hustle-together/api-dev-tools@latest
```

This update may include new features, bug fixes, and improved workflows.
"""
            # Update state with last check time
            try:
                if state_file.exists():
                    state = json.loads(state_file.read_text())
                else:
                    state = {}

                from datetime import datetime
                state["last_update_check"] = datetime.now().isoformat()
                state["available_update"] = latest
                state_file.write_text(json.dumps(state, indent=2))
            except Exception:
                pass

    print(json.dumps(result))


if __name__ == "__main__":
    main()
