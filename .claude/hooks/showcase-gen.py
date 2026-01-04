#!/usr/bin/env python3
"""
Showcase Generation Hook

Trigger: PostToolUse for Write (when registry.json is updated)
Action: Regenerate showcase pages from templates

Generates:
- /hustle-dev-tools/page.tsx - Main dashboard
- /hustle-dev-tools/api/page.tsx - API showcase
- /hustle-dev-tools/ui/page.tsx - UI showcase
"""

import json
import sys
import os
import shutil
from pathlib import Path

def get_project_root():
    """Get the project root directory."""
    return os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())

def get_template_dir():
    """Get the templates directory."""
    return Path(get_project_root()) / "templates"

def get_target_dir():
    """Get the target directory for showcase pages."""
    # Look for Next.js app directory
    project_root = Path(get_project_root())

    # Try common locations
    for app_dir in ["app", "src/app"]:
        target = project_root / app_dir / "hustle-dev-tools"
        if (project_root / app_dir).exists():
            return target

    # Default to src/app
    return project_root / "src" / "app" / "hustle-dev-tools"

def load_registry():
    """Load the registry file."""
    registry_path = Path(get_project_root()) / ".devkit" / "registry.json"
    if registry_path.exists():
        with open(registry_path, "r") as f:
            return json.load(f)
    return {"apis": {}, "components": {}, "pages": {}}

def should_regenerate(registry: dict) -> bool:
    """Check if we should regenerate showcases."""
    # Regenerate if there are any entries
    return bool(registry.get("apis") or registry.get("components") or registry.get("pages"))

def copy_template(template_name: str, target_path: Path):
    """Copy a template directory to target location."""
    template_path = get_template_dir() / template_name

    if not template_path.exists():
        return False

    # Create target directory
    target_path.mkdir(parents=True, exist_ok=True)

    # Copy all files
    if template_path.is_dir():
        for item in template_path.iterdir():
            if item.is_file():
                shutil.copy2(item, target_path / item.name)
            elif item.is_dir():
                shutil.copytree(item, target_path / item.name, dirs_exist_ok=True)

    return True

def generate_dashboard(target_dir: Path, registry: dict):
    """Generate the main dashboard page."""
    api_count = len(registry.get("apis", {}))
    component_count = len(registry.get("components", {}))
    page_count = len(registry.get("pages", {}))

    dashboard_content = f'''import Link from "next/link";

export const metadata = {{
  title: "Hustle Dev Tools",
  description: "Developer dashboard for APIs, components, and pages",
}};

export default function HustleDevToolsPage() {{
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Hustle Dev Tools</h1>
        <p className="text-gray-400 mb-8">Your development dashboard</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/hustle-dev-tools/api"
            className="block p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-[#BA0C2F] transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">API Showcase</h2>
            <p className="text-gray-400 text-sm mb-4">Interactive API documentation and testing</p>
            <span className="text-2xl font-bold text-[#BA0C2F]">{api_count}</span>
            <span className="text-gray-500 ml-2">endpoints</span>
          </Link>

          <Link
            href="/hustle-dev-tools/ui"
            className="block p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-[#BA0C2F] transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">UI Showcase</h2>
            <p className="text-gray-400 text-sm mb-4">Component library with live preview</p>
            <span className="text-2xl font-bold text-[#BA0C2F]">{component_count}</span>
            <span className="text-gray-500 ml-2">components</span>
          </Link>

          <Link
            href="/hustle-dev-tools/tests"
            className="block p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-[#BA0C2F] transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">Test Results</h2>
            <p className="text-gray-400 text-sm mb-4">Unit, E2E, and visual test results</p>
            <span className="text-2xl font-bold text-[#BA0C2F]">{page_count}</span>
            <span className="text-gray-500 ml-2">pages</span>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <a
            href="http://localhost:6006"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-[#BA0C2F] transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">Storybook</h2>
            <p className="text-gray-400 text-sm">Component stories and documentation</p>
          </a>

          <Link
            href="/hustle-dev-tools/visual-qa"
            className="block p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-[#BA0C2F] transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">Visual QA</h2>
            <p className="text-gray-400 text-sm">AI-powered visual analysis results</p>
          </Link>
        </div>
      </div>
    </div>
  );
}}
'''

    target_dir.mkdir(parents=True, exist_ok=True)
    with open(target_dir / "page.tsx", "w") as f:
        f.write(dashboard_content)

def generate_api_showcase(target_dir: Path, registry: dict):
    """Generate the API showcase page."""
    apis = registry.get("apis", {})

    # Generate API cards JSON
    api_data = json.dumps(apis, indent=2)

    api_showcase_content = f'''import {{ Suspense }} from "react";

export const metadata = {{
  title: "API Showcase | Hustle Dev Tools",
  description: "Interactive API documentation and testing",
}};

const apiRegistry = {api_data};

function APICard({{ name, api }}: {{ name: string; api: any }}) {{
  return (
    <div className="p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-[#BA0C2F] transition-colors">
      <div className="flex items-center gap-2 mb-2">
        {{api.methods?.map((method: string) => (
          <span
            key={{method}}
            className={{`px-2 py-1 text-xs font-mono rounded ${{
              method === "GET" ? "bg-green-900 text-green-300" :
              method === "POST" ? "bg-blue-900 text-blue-300" :
              method === "PUT" ? "bg-yellow-900 text-yellow-300" :
              method === "DELETE" ? "bg-red-900 text-red-300" :
              "bg-gray-800 text-gray-300"
            }}`}}
          >
            {{method}}
          </span>
        ))}}
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">{{name}}</h3>
      <code className="text-sm text-gray-400 font-mono">{{api.route}}</code>
      {{api.schema && (
        <p className="text-xs text-gray-500 mt-2">Schema: {{api.schema}}</p>
      )}}
    </div>
  );
}}

export default function APIShowcasePage() {{
  const apis = Object.entries(apiRegistry);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">API Showcase</h1>
        <p className="text-gray-400 mb-8">{{apis.length}} endpoints registered</p>

        {{apis.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No APIs registered yet.</p>
            <p className="text-sm mt-2">Run /api-create to add your first endpoint.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {{apis.map(([name, api]) => (
              <APICard key={{name}} name={{name}} api={{api}} />
            ))}}
          </div>
        )}}
      </div>
    </div>
  );
}}
'''

    api_dir = target_dir / "api"
    api_dir.mkdir(parents=True, exist_ok=True)
    with open(api_dir / "page.tsx", "w") as f:
        f.write(api_showcase_content)

def generate_ui_showcase(target_dir: Path, registry: dict):
    """Generate the UI showcase page."""
    components = registry.get("components", {})

    component_data = json.dumps(components, indent=2)

    ui_showcase_content = f'''export const metadata = {{
  title: "UI Showcase | Hustle Dev Tools",
  description: "Component library with live preview",
}};

const componentRegistry = {component_data};

function ComponentCard({{ name, component }}: {{ name: string; component: any }}) {{
  return (
    <div className="p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-[#BA0C2F] transition-colors">
      <h3 className="text-lg font-semibold text-white mb-2">{{name}}</h3>

      {{component.props?.length > 0 && (
        <div className="mb-2">
          <span className="text-xs text-gray-500">Props: </span>
          <span className="text-xs text-gray-400">{{component.props.join(", ")}}</span>
        </div>
      )}}

      {{component.variants?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {{component.variants.map((variant: string) => (
            <span
              key={{variant}}
              className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded"
            >
              {{variant}}
            </span>
          ))}}
        </div>
      )}}

      <div className="mt-4 flex gap-2">
        {{component.stories && (
          <a
            href={{`http://localhost:6006/?path=/docs/${{name.toLowerCase()}}`}}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#BA0C2F] hover:underline"
          >
            Storybook
          </a>
        )}}
      </div>
    </div>
  );
}}

export default function UIShowcasePage() {{
  const components = Object.entries(componentRegistry);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">UI Showcase</h1>
        <p className="text-gray-400 mb-8">{{components.length}} components registered</p>

        {{components.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No components registered yet.</p>
            <p className="text-sm mt-2">Run /hustle-ui-create to add your first component.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {{components.map(([name, component]) => (
              <ComponentCard key={{name}} name={{name}} component={{component}} />
            ))}}
          </div>
        )}}
      </div>
    </div>
  );
}}
'''

    ui_dir = target_dir / "ui"
    ui_dir.mkdir(parents=True, exist_ok=True)
    with open(ui_dir / "page.tsx", "w") as f:
        f.write(ui_showcase_content)

def generate_tests_page(target_dir: Path, registry: dict):
    """Generate the test results page."""
    tests_content = '''export const metadata = {
  title: "Test Results | Hustle Dev Tools",
  description: "Unit, E2E, and visual test results",
};

export default function TestResultsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Test Results</h1>
        <p className="text-gray-400 mb-8">View test execution results</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Unit Tests (Vitest)</h2>
            <p className="text-gray-400 text-sm mb-4">Run: pnpm test:unit</p>
            <a
              href="http://localhost:51204/__vitest__"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#BA0C2F] hover:underline"
            >
              Open Vitest UI
            </a>
          </div>

          <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">E2E Tests (Playwright)</h2>
            <p className="text-gray-400 text-sm mb-4">Run: pnpm test:e2e</p>
            <a
              href="./playwright-report/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#BA0C2F] hover:underline"
            >
              View Report
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
'''

    tests_dir = target_dir / "tests"
    tests_dir.mkdir(parents=True, exist_ok=True)
    with open(tests_dir / "page.tsx", "w") as f:
        f.write(tests_content)

def generate_visual_qa_page(target_dir: Path):
    """Generate the visual QA results page."""
    visual_qa_content = '''import { readFileSync, existsSync } from "fs";
import { join } from "path";

export const metadata = {
  title: "Visual QA | Hustle Dev Tools",
  description: "AI-powered visual analysis results",
};

async function getVisualQAResults() {
  const resultsPath = join(process.cwd(), ".devkit", "visual-qa-results.json");
  if (existsSync(resultsPath)) {
    const content = readFileSync(resultsPath, "utf-8");
    return JSON.parse(content);
  }
  return null;
}

export default async function VisualQAPage() {
  const results = await getVisualQAResults();

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Visual QA Results</h1>
        <p className="text-gray-400 mb-8">AI-powered visual analysis by Haiku</p>

        {!results ? (
          <div className="text-center py-12 text-gray-500">
            <p>No visual QA results yet.</p>
            <p className="text-sm mt-2">Run /visual-qa to analyze your UI components.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(results).map(([component, analysis]: [string, any]) => (
              <div key={component} className="p-6 bg-gray-900 rounded-lg border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">{component}</h3>
                <pre className="text-sm text-gray-400 whitespace-pre-wrap">
                  {JSON.stringify(analysis, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
'''

    visual_qa_dir = target_dir / "visual-qa"
    visual_qa_dir.mkdir(parents=True, exist_ok=True)
    with open(visual_qa_dir / "page.tsx", "w") as f:
        f.write(visual_qa_content)

def main():
    # Read hook input from stdin
    try:
        hook_input = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        sys.exit(0)

    tool_name = hook_input.get("tool_name", "")
    tool_input = hook_input.get("tool_input", {})

    # Only process Write tool
    if tool_name != "Write":
        sys.exit(0)

    # Check if registry was updated (this runs after registry-update.py)
    file_path = tool_input.get("file_path", "")

    # Load registry
    registry = load_registry()

    # Only regenerate if there are entries
    if not should_regenerate(registry):
        sys.exit(0)

    # Get target directory
    target_dir = get_target_dir()

    # Generate all showcase pages
    generate_dashboard(target_dir, registry)
    generate_api_showcase(target_dir, registry)
    generate_ui_showcase(target_dir, registry)
    generate_tests_page(target_dir, registry)
    generate_visual_qa_page(target_dir)

    print(f"Showcase pages regenerated at {target_dir}")
    sys.exit(0)

if __name__ == "__main__":
    main()
