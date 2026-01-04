#!/usr/bin/env python3
"""
Showcase Generation Hook

Trigger: PostToolUse for Write (when registry.json is updated)
Action: Copy showcase templates to user's project

Templates include:
- /hustle-dev-tools/page.tsx - Main dashboard
- /hustle-dev-tools/api/ - Full interactive API showcase with APITester, APIModal
- /hustle-dev-tools/ui/ - Full interactive UI showcase with Sandpack editor
- /hustle-dev-tools/tests/ - Test results display
- /hustle-dev-tools/visual-qa/ - Visual QA results

Template components import from .devkit/registry.json dynamically.
"""

import json
import sys
import os
import shutil
from pathlib import Path
from datetime import datetime

def get_project_root():
    """Get the project root directory."""
    return os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())

def get_devkit_root():
    """Get the devkit installation directory (where templates are)."""
    # First check if we're in the devkit repo itself
    project_root = Path(get_project_root())
    if (project_root / "templates" / "api-showcase").exists():
        return project_root

    # Check common installation locations
    possible_locations = [
        project_root / "node_modules" / "@hustle-together" / "api-dev-tools",
        project_root / ".devkit" / "templates",
        Path.home() / ".claude" / "api-dev-tools",
    ]

    for loc in possible_locations:
        if (loc / "templates" / "api-showcase").exists():
            return loc

    # Fallback to project root
    return project_root

def get_template_dir():
    """Get the templates directory."""
    return get_devkit_root() / "templates"

def get_target_dir():
    """Get the target directory for showcase pages."""
    project_root = Path(get_project_root())

    # Try common Next.js app directory locations
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
    return bool(registry.get("apis") or registry.get("components") or registry.get("pages"))

def copy_template_tree(source: Path, target: Path, registry: dict):
    """
    Copy template directory to target, updating registry imports.

    Templates import from '@/../.devkit/registry.json' which works
    because Next.js resolves from the app directory.
    """
    if not source.exists():
        print(f"Warning: Template source not found: {source}")
        return False

    # Create target directory
    target.mkdir(parents=True, exist_ok=True)

    # Copy all files and directories
    for item in source.iterdir():
        target_item = target / item.name

        if item.is_file():
            # Copy file
            shutil.copy2(item, target_item)
        elif item.is_dir():
            # Recursively copy directory
            shutil.copytree(item, target_item, dirs_exist_ok=True)

    return True

def copy_shared_components(target_dir: Path):
    """Copy shared components (HeroHeader, etc.) to showcase directories."""
    template_dir = get_template_dir()
    shared_source = template_dir / "shared"

    if not shared_source.exists():
        return

    # Copy to API showcase
    api_shared = target_dir / "api" / "_components" / "shared"
    if (target_dir / "api" / "_components").exists():
        api_shared.mkdir(parents=True, exist_ok=True)
        for item in shared_source.iterdir():
            if item.is_file():
                shutil.copy2(item, api_shared / item.name)

    # Copy to UI showcase
    ui_shared = target_dir / "ui" / "_components" / "shared"
    if (target_dir / "ui" / "_components").exists():
        ui_shared.mkdir(parents=True, exist_ok=True)
        for item in shared_source.iterdir():
            if item.is_file():
                shutil.copy2(item, ui_shared / item.name)

def generate_dashboard(target_dir: Path, registry: dict):
    """Generate the main dashboard page with dynamic counts."""
    api_count = len(registry.get("apis", {}))
    component_count = len(registry.get("components", {}))
    page_count = len(registry.get("pages", {}))

    # Dashboard reads counts dynamically
    dashboard_content = f'''import Link from "next/link";
import {{ readFileSync, existsSync }} from "fs";
import {{ join }} from "path";

export const metadata = {{
  title: "Hustle Dev Tools",
  description: "Developer dashboard for APIs, components, and pages",
}};

function getRegistryCounts() {{
  try {{
    const registryPath = join(process.cwd(), ".devkit", "registry.json");
    if (existsSync(registryPath)) {{
      const content = readFileSync(registryPath, "utf-8");
      const registry = JSON.parse(content);
      return {{
        apis: Object.keys(registry.apis || {{}}).length,
        components: Object.keys(registry.components || {{}}).length,
        pages: Object.keys(registry.pages || {{}}).length,
      }};
    }}
  }} catch (e) {{
    console.error("Error reading registry:", e);
  }}
  return {{ apis: 0, components: 0, pages: 0 }};
}}

export default function HustleDevToolsPage() {{
  const counts = getRegistryCounts();

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
            <span className="text-2xl font-bold text-[#BA0C2F]">{{counts.apis}}</span>
            <span className="text-gray-500 ml-2">endpoints</span>
          </Link>

          <Link
            href="/hustle-dev-tools/ui"
            className="block p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-[#BA0C2F] transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">UI Showcase</h2>
            <p className="text-gray-400 text-sm mb-4">Component library with live preview</p>
            <span className="text-2xl font-bold text-[#BA0C2F]">{{counts.components}}</span>
            <span className="text-gray-500 ml-2">components</span>
          </Link>

          <Link
            href="/hustle-dev-tools/tests"
            className="block p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-[#BA0C2F] transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">Test Results</h2>
            <p className="text-gray-400 text-sm mb-4">Unit, E2E, and visual test results</p>
            <span className="text-2xl font-bold text-[#BA0C2F]">{{counts.pages}}</span>
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

def copy_api_showcase(target_dir: Path, registry: dict):
    """Copy the full interactive API showcase templates."""
    template_dir = get_template_dir()
    api_source = template_dir / "api-showcase"
    api_target = target_dir / "api"

    if api_source.exists():
        copy_template_tree(api_source, api_target, registry)
        print(f"  Copied API showcase templates to {api_target}")
    else:
        print(f"  Warning: API showcase templates not found at {api_source}")

def copy_ui_showcase(target_dir: Path, registry: dict):
    """Copy the full interactive UI showcase templates."""
    template_dir = get_template_dir()
    ui_source = template_dir / "ui-showcase"
    ui_target = target_dir / "ui"

    if ui_source.exists():
        copy_template_tree(ui_source, ui_target, registry)
        print(f"  Copied UI showcase templates to {ui_target}")
    else:
        print(f"  Warning: UI showcase templates not found at {ui_source}")

def copy_test_pages(target_dir: Path, registry: dict):
    """Copy test result display templates."""
    template_dir = get_template_dir()

    # Test results page
    test_source = template_dir / "test-results"
    test_target = target_dir / "tests"
    if test_source.exists():
        copy_template_tree(test_source, test_target, registry)

    # Playwright report page
    playwright_source = template_dir / "playwright-report"
    playwright_target = target_dir / "tests" / "playwright"
    if playwright_source.exists():
        copy_template_tree(playwright_source, playwright_target, registry)

def copy_visual_qa_page(target_dir: Path):
    """Copy visual QA results display template."""
    template_dir = get_template_dir()
    visual_qa_source = template_dir / "visual-qa"
    visual_qa_target = target_dir / "visual-qa"

    if visual_qa_source.exists():
        copy_template_tree(visual_qa_source, visual_qa_target, {})
    else:
        # Generate basic visual QA page if template doesn't exist
        visual_qa_target.mkdir(parents=True, exist_ok=True)
        visual_qa_content = '''import { readFileSync, existsSync } from "fs";
import { join } from "path";

export const metadata = {
  title: "Visual QA | Hustle Dev Tools",
  description: "AI-powered visual analysis results",
};

interface VisualQAIssue {
  severity: "error" | "warning" | "info";
  category: string;
  description: string;
  suggestion?: string;
}

interface ComponentAnalysis {
  timestamp: string;
  results: {
    status: string;
    issues?: VisualQAIssue[];
    summary?: {
      total_issues: number;
      errors: number;
      warnings: number;
    };
  };
}

async function getVisualQAResults(): Promise<Record<string, ComponentAnalysis> | null> {
  try {
    const resultsPath = join(process.cwd(), ".devkit", "visual-qa-results.json");
    if (existsSync(resultsPath)) {
      const content = readFileSync(resultsPath, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("Error reading visual QA results:", e);
  }
  return null;
}

function getSeverityStyles(severity: string) {
  switch (severity) {
    case "error":
      return "bg-red-900/30 border-red-700 text-red-300";
    case "warning":
      return "bg-yellow-900/30 border-yellow-700 text-yellow-300";
    default:
      return "bg-blue-900/30 border-blue-700 text-blue-300";
  }
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case "error":
      return "❌";
    case "warning":
      return "⚠️";
    default:
      return "ℹ️";
  }
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
            <p className="text-6xl mb-4">🔍</p>
            <p>No visual QA results yet.</p>
            <p className="text-sm mt-2">Run <code className="bg-gray-800 px-2 py-1 rounded">/visual-qa</code> to analyze your UI components.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(results).map(([component, analysis]) => (
              <div key={component} className="p-6 bg-gray-900 rounded-lg border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{component}</h3>
                  {analysis.results?.summary && (
                    <div className="flex gap-2">
                      {analysis.results.summary.errors > 0 && (
                        <span className="px-2 py-1 text-xs bg-red-900/50 text-red-300 rounded">
                          {analysis.results.summary.errors} errors
                        </span>
                      )}
                      {analysis.results.summary.warnings > 0 && (
                        <span className="px-2 py-1 text-xs bg-yellow-900/50 text-yellow-300 rounded">
                          {analysis.results.summary.warnings} warnings
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {analysis.results?.issues?.length ? (
                  <div className="space-y-3">
                    {analysis.results.issues.map((issue, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded border ${getSeverityStyles(issue.severity)}`}
                      >
                        <div className="flex items-start gap-2">
                          <span>{getSeverityIcon(issue.severity)}</span>
                          <div>
                            <p className="font-medium">{issue.description}</p>
                            {issue.suggestion && (
                              <p className="text-sm opacity-80 mt-1">
                                💡 {issue.suggestion}
                              </p>
                            )}
                            <span className="text-xs opacity-60 mt-1 block">
                              {issue.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-green-400">✅ No issues found</p>
                )}

                <p className="text-xs text-gray-500 mt-4">
                  Analyzed: {new Date(analysis.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
'''
        with open(visual_qa_target / "page.tsx", "w") as f:
            f.write(visual_qa_content)

def main():
    # Read hook input from stdin
    try:
        hook_input = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        sys.exit(0)

    tool_name = hook_input.get("tool_name", "")

    # Only process Write tool
    if tool_name != "Write":
        sys.exit(0)

    # Load registry
    registry = load_registry()

    # Only regenerate if there are entries
    if not should_regenerate(registry):
        sys.exit(0)

    # Get target directory
    target_dir = get_target_dir()

    print(f"Generating showcase pages at {target_dir}")

    # Generate dashboard (always custom to show counts)
    generate_dashboard(target_dir, registry)

    # Copy full interactive templates
    copy_api_showcase(target_dir, registry)
    copy_ui_showcase(target_dir, registry)
    copy_test_pages(target_dir, registry)
    copy_visual_qa_page(target_dir)

    # Copy shared components
    copy_shared_components(target_dir)

    print(f"Showcase pages generated at {target_dir}")
    sys.exit(0)

if __name__ == "__main__":
    main()
