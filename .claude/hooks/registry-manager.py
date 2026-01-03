#!/usr/bin/env python3
"""Updates registry after file modifications."""
import json
import sys
import hashlib
from pathlib import Path
from datetime import datetime

try:
    input_data = json.load(sys.stdin)
except json.JSONDecodeError:
    sys.exit(1)

tool_name = input_data.get("tool_name", "")
file_path = input_data.get("tool_input", {}).get("file_path", "")
cwd = input_data.get("cwd", "")

if tool_name not in ["Edit", "Write", "MultiEdit"]:
    sys.exit(0)

if not file_path:
    sys.exit(0)

registry_file = Path(cwd) / ".devkit" / "registry.json"

# Load or create registry
if registry_file.exists():
    registry = json.loads(registry_file.read_text())
else:
    registry = {"artifacts": {"apis": [], "components": [], "pages": []}}

# Determine artifact type from path
artifact_type = None
if "/api/" in file_path or "route.ts" in file_path:
    artifact_type = "apis"
elif "/components/" in file_path:
    artifact_type = "components"
elif "page.tsx" in file_path:
    artifact_type = "pages"

if artifact_type:
    # Calculate checksum
    try:
        content = Path(file_path).read_text()
        checksum = hashlib.sha256(content.encode()).hexdigest()[:12]
    except:
        checksum = "unknown"

    # Extract name from path
    name = Path(file_path).stem
    if name in ["route", "page", "index"]:
        name = Path(file_path).parent.name

    # Update or add artifact
    artifacts = registry["artifacts"][artifact_type]
    existing = next((a for a in artifacts if a.get("path") == file_path), None)

    if existing:
        existing["checksum"] = checksum
        existing["updatedAt"] = datetime.now().isoformat()
    else:
        artifacts.append({
            "id": f"{artifact_type[:3]}-{len(artifacts)+1:03d}",
            "name": name,
            "path": file_path,
            "createdAt": datetime.now().isoformat(),
            "status": "in_progress",
            "checksum": checksum
        })

    # Save registry
    registry_file.parent.mkdir(parents=True, exist_ok=True)
    registry_file.write_text(json.dumps(registry, indent=2))

sys.exit(0)
