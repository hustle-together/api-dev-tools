"use client";

import { useState, useMemo } from "react";

// Import registry for component/page data
import registry from "@/../.claude/registry.json";

/**
 * 7 Viewport Definitions
 * These match the viewports defined in performance-budgets.json
 */
const VIEWPORTS = [
  { id: "mobile-portrait", label: "Mobile", width: 375, height: 667, icon: "📱" },
  { id: "mobile-notch", label: "Notch", width: 393, height: 852, icon: "📲" },
  { id: "mobile-landscape", label: "M-Land", width: 667, height: 375, icon: "📱" },
  { id: "tablet-portrait", label: "Tablet", width: 768, height: 1024, icon: "📋" },
  { id: "tablet-landscape", label: "T-Land", width: 1024, height: 768, icon: "📋" },
  { id: "small-desktop", label: "Laptop", width: 1280, height: 720, icon: "💻" },
  { id: "desktop", label: "Desktop", width: 1920, height: 1080, icon: "🖥️" },
] as const;

type TestStatus = "pass" | "warning" | "fail" | "pending" | "skipped";

interface ViewportResult {
  status: TestStatus;
  screenshot?: string;
  issues?: Array<{
    type: string;
    severity: "error" | "warning" | "info";
    element?: string;
    detail: string;
  }>;
  haikuAnalysis?: string;
}

interface ComponentTestResult {
  id: string;
  name: string;
  type: "component" | "page";
  state: string;
  route?: string;
  file?: string;
  viewports: Record<string, ViewportResult>;
  lastTested?: string;
}

// Mock data generator - in production, this would come from actual test results
function generateMockResults(): ComponentTestResult[] {
  const typedRegistry = registry as any;
  const results: ComponentTestResult[] = [];

  // Add components with their variants as states
  Object.entries(typedRegistry.components || {}).forEach(([id, data]: [string, any]) => {
    const variants = data.variants || ["default"];
    variants.forEach((variant: string) => {
      results.push({
        id: `${id}-${variant}`,
        name: data.name || id,
        type: "component",
        state: variant,
        file: data.file,
        viewports: generateViewportResults(),
        lastTested: new Date().toISOString(),
      });
    });
  });

  // Add pages
  Object.entries(typedRegistry.pages || {}).forEach(([id, data]: [string, any]) => {
    results.push({
      id,
      name: data.name || id,
      type: "page",
      state: "default",
      route: data.route,
      file: data.file,
      viewports: generateViewportResults(),
      lastTested: new Date().toISOString(),
    });
  });

  return results;
}

function generateViewportResults(): Record<string, ViewportResult> {
  const results: Record<string, ViewportResult> = {};
  VIEWPORTS.forEach((vp) => {
    // Random status for demo - in production, read from actual test results
    const statuses: TestStatus[] = ["pass", "pass", "pass", "warning", "fail"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    results[vp.id] = {
      status,
      screenshot: `/__snapshots__/${vp.id}.png`,
      issues: status !== "pass" ? [{
        type: status === "fail" ? "touch-target" : "contrast",
        severity: status === "fail" ? "error" : "warning",
        element: "button.primary",
        detail: status === "fail"
          ? "Touch target too small (32x32px, min 44x44px)"
          : "Contrast ratio 3.8:1 (min 4.5:1 for AA)",
      }] : [],
      haikuAnalysis: status !== "pass"
        ? `${status === "fail" ? "Critical" : "Minor"} accessibility issue detected in ${vp.label} viewport.`
        : undefined,
    };
  });
  return results;
}

/**
 * Visual Testing Dashboard
 *
 * Displays a matrix of all components × states × 7 viewports
 * with pass/warning/fail indicators and AI analysis results.
 *
 * Features:
 * - Table with components/states as rows
 * - 7 viewport columns with status indicators
 * - Click any cell to see screenshot and Haiku analysis
 * - Filter by status (all, passing, issues)
 * - Links to component files and routes
 */
export function VisualTestingDashboard() {
  const [selectedCell, setSelectedCell] = useState<{
    result: ComponentTestResult;
    viewport: typeof VIEWPORTS[number];
    data: ViewportResult;
  } | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pass" | "issues">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "component" | "page">("all");

  // Get test results (mock for now, would be from file in production)
  const testResults = useMemo(() => generateMockResults(), []);

  // Filter results
  const filteredResults = useMemo(() => {
    return testResults.filter((result) => {
      // Type filter
      if (typeFilter !== "all" && result.type !== typeFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === "all") return true;

      const hasIssues = Object.values(result.viewports).some(
        (vp) => vp.status === "fail" || vp.status === "warning"
      );

      return statusFilter === "issues" ? hasIssues : !hasIssues;
    });
  }, [testResults, statusFilter, typeFilter]);

  // Summary stats
  const stats = useMemo(() => {
    let total = 0;
    let passing = 0;
    let warnings = 0;
    let failing = 0;

    testResults.forEach((result) => {
      Object.values(result.viewports).forEach((vp) => {
        total++;
        if (vp.status === "pass") passing++;
        else if (vp.status === "warning") warnings++;
        else if (vp.status === "fail") failing++;
      });
    });

    return { total, passing, warnings, failing };
  }, [testResults]);

  const getStatusColor = (status: TestStatus) => {
    switch (status) {
      case "pass": return "bg-green-500";
      case "warning": return "bg-yellow-500";
      case "fail": return "bg-red-500";
      case "pending": return "bg-gray-400";
      case "skipped": return "bg-gray-300";
      default: return "bg-gray-300";
    }
  };

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case "pass": return "✓";
      case "warning": return "⚠";
      case "fail": return "✗";
      case "pending": return "○";
      case "skipped": return "−";
      default: return "?";
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505]">
      {/* Header */}
      <div className="border-b-2 border-black bg-white dark:border-gray-600 dark:bg-[#050505]">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Visual Testing Dashboard
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Screenshot analysis across 7 viewports with AI-powered issue detection
          </p>

          {/* Stats Bar */}
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 border-2 border-black px-3 py-1.5 dark:border-gray-600">
              <span className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-sm font-bold">{stats.passing}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">passing</span>
            </div>
            <div className="flex items-center gap-2 border-2 border-black px-3 py-1.5 dark:border-gray-600">
              <span className="h-3 w-3 rounded-full bg-yellow-500" />
              <span className="text-sm font-bold">{stats.warnings}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">warnings</span>
            </div>
            <div className="flex items-center gap-2 border-2 border-black px-3 py-1.5 dark:border-gray-600">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-sm font-bold">{stats.failing}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">failing</span>
            </div>
            <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
              {stats.total} tests across {testResults.length} elements
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-10 border-b-2 border-black bg-white/95 backdrop-blur dark:border-gray-600 dark:bg-[#050505]/95">
        <div className="container mx-auto flex flex-wrap gap-4 px-4 py-3">
          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`border-2 px-3 py-1 text-sm font-bold transition-colors ${
                statusFilter === "all"
                  ? "border-[#BA0C2F] bg-[#BA0C2F] text-white"
                  : "border-black bg-white hover:border-[#BA0C2F] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("pass")}
              className={`border-2 px-3 py-1 text-sm font-bold transition-colors ${
                statusFilter === "pass"
                  ? "border-green-600 bg-green-600 text-white"
                  : "border-black bg-white hover:border-green-600 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              }`}
            >
              Passing
            </button>
            <button
              onClick={() => setStatusFilter("issues")}
              className={`border-2 px-3 py-1 text-sm font-bold transition-colors ${
                statusFilter === "issues"
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-black bg-white hover:border-red-600 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              }`}
            >
              Issues
            </button>
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setTypeFilter("all")}
              className={`border-2 px-3 py-1 text-sm font-bold transition-colors ${
                typeFilter === "all"
                  ? "border-[#BA0C2F] bg-[#BA0C2F] text-white"
                  : "border-black bg-white hover:border-[#BA0C2F] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter("component")}
              className={`border-2 px-3 py-1 text-sm font-bold transition-colors ${
                typeFilter === "component"
                  ? "border-[#BA0C2F] bg-[#BA0C2F] text-white"
                  : "border-black bg-white hover:border-[#BA0C2F] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              }`}
            >
              Components
            </button>
            <button
              onClick={() => setTypeFilter("page")}
              className={`border-2 px-3 py-1 text-sm font-bold transition-colors ${
                typeFilter === "page"
                  ? "border-[#BA0C2F] bg-[#BA0C2F] text-white"
                  : "border-black bg-white hover:border-[#BA0C2F] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              }`}
            >
              Pages
            </button>
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <main className="container mx-auto px-4 py-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-2 border-black dark:border-gray-600">
            {/* Header */}
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="border-2 border-black px-4 py-3 text-left font-bold dark:border-gray-600">
                  Element
                </th>
                <th className="border-2 border-black px-4 py-3 text-left font-bold dark:border-gray-600">
                  State
                </th>
                {VIEWPORTS.map((vp) => (
                  <th
                    key={vp.id}
                    className="border-2 border-black px-2 py-3 text-center font-bold dark:border-gray-600"
                    title={`${vp.width}×${vp.height}`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span>{vp.icon}</span>
                      <span className="text-xs">{vp.label}</span>
                      <span className="text-[10px] text-gray-500">{vp.width}px</span>
                    </div>
                  </th>
                ))}
                <th className="border-2 border-black px-4 py-3 text-left font-bold dark:border-gray-600">
                  Links
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {filteredResults.length === 0 ? (
                <tr>
                  <td
                    colSpan={VIEWPORTS.length + 3}
                    className="border-2 border-black px-4 py-8 text-center text-gray-500 dark:border-gray-600"
                  >
                    No test results found. Run /test-visual to generate results.
                  </td>
                </tr>
              ) : (
                filteredResults.map((result) => (
                  <tr
                    key={result.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    {/* Element Name */}
                    <td className="border-2 border-black px-4 py-2 dark:border-gray-600">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs font-bold ${
                            result.type === "component"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          }`}
                        >
                          {result.type === "component" ? "C" : "P"}
                        </span>
                        <span className="font-medium">{result.name}</span>
                      </div>
                    </td>

                    {/* State */}
                    <td className="border-2 border-black px-4 py-2 text-sm text-gray-600 dark:border-gray-600 dark:text-gray-400">
                      {result.state}
                    </td>

                    {/* Viewport Results */}
                    {VIEWPORTS.map((vp) => {
                      const vpResult = result.viewports[vp.id];
                      return (
                        <td
                          key={vp.id}
                          className="border-2 border-black px-2 py-2 text-center dark:border-gray-600"
                        >
                          <button
                            onClick={() =>
                              setSelectedCell({
                                result,
                                viewport: vp,
                                data: vpResult,
                              })
                            }
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-white transition-transform hover:scale-110 ${getStatusColor(
                              vpResult.status
                            )}`}
                            title={`${vpResult.status} - Click for details`}
                          >
                            {getStatusIcon(vpResult.status)}
                          </button>
                        </td>
                      );
                    })}

                    {/* Links */}
                    <td className="border-2 border-black px-4 py-2 dark:border-gray-600">
                      <div className="flex gap-2">
                        {result.file && (
                          <a
                            href={`vscode://file/${result.file}`}
                            className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                            title="Open in VS Code"
                          >
                            Code
                          </a>
                        )}
                        {result.route && (
                          <a
                            href={result.route}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-green-600 hover:underline dark:text-green-400"
                            title="View page"
                          >
                            View
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Detail Modal */}
      {selectedCell && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedCell(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:border-gray-600 dark:bg-[#050505]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-black px-4 py-3 dark:border-gray-600">
              <div>
                <h2 className="text-lg font-bold">
                  {selectedCell.result.name} - {selectedCell.result.state}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedCell.viewport.icon} {selectedCell.viewport.label} ({selectedCell.viewport.width}×{selectedCell.viewport.height})
                </p>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="border-2 border-black p-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            {/* Status Badge */}
            <div className="border-b-2 border-black px-4 py-3 dark:border-gray-600">
              <span
                className={`inline-flex items-center gap-2 rounded px-3 py-1 text-sm font-bold text-white ${getStatusColor(
                  selectedCell.data.status
                )}`}
              >
                {getStatusIcon(selectedCell.data.status)} {selectedCell.data.status.toUpperCase()}
              </span>
            </div>

            {/* Screenshot Placeholder */}
            <div className="border-b-2 border-black p-4 dark:border-gray-600">
              <div
                className="flex items-center justify-center border-2 border-dashed border-gray-400 bg-gray-100 dark:bg-gray-800"
                style={{
                  aspectRatio: `${selectedCell.viewport.width}/${selectedCell.viewport.height}`,
                  maxHeight: "300px",
                }}
              >
                <div className="text-center text-gray-500">
                  <p className="text-4xl">🖼️</p>
                  <p className="mt-2 text-sm">Screenshot</p>
                  <p className="text-xs">{selectedCell.data.screenshot}</p>
                </div>
              </div>
            </div>

            {/* Issues */}
            {selectedCell.data.issues && selectedCell.data.issues.length > 0 && (
              <div className="border-b-2 border-black p-4 dark:border-gray-600">
                <h3 className="mb-2 font-bold">Issues Found</h3>
                <ul className="space-y-2">
                  {selectedCell.data.issues.map((issue, i) => (
                    <li
                      key={i}
                      className={`border-l-4 p-2 ${
                        issue.severity === "error"
                          ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                          : issue.severity === "warning"
                          ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                          : "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-sm font-bold">
                        <span className="uppercase">{issue.type}</span>
                        {issue.element && (
                          <code className="rounded bg-gray-200 px-1 text-xs dark:bg-gray-700">
                            {issue.element}
                          </code>
                        )}
                      </div>
                      <p className="mt-1 text-sm">{issue.detail}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Haiku Analysis */}
            {selectedCell.data.haikuAnalysis && (
              <div className="p-4">
                <h3 className="mb-2 font-bold">AI Analysis (Haiku)</h3>
                <p className="rounded border-2 border-black bg-gray-50 p-3 text-sm dark:border-gray-600 dark:bg-gray-800">
                  {selectedCell.data.haikuAnalysis}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 border-t-2 border-black p-4 dark:border-gray-600">
              <button className="border-2 border-black px-4 py-2 font-bold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800">
                View Full Screenshot
              </button>
              <button className="border-2 border-black px-4 py-2 font-bold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800">
                Re-run Test
              </button>
              {selectedCell.result.file && (
                <a
                  href={`vscode://file/${selectedCell.result.file}`}
                  className="border-2 border-[#BA0C2F] bg-[#BA0C2F] px-4 py-2 font-bold text-white hover:bg-[#8A0921]"
                >
                  Open in VS Code
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="border-t-2 border-black bg-gray-50 py-4 dark:border-gray-600 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <span className="font-bold">Legend:</span>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">✓</span>
              <span>Pass</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-white">⚠</span>
              <span>Warning (accessibility/contrast)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white">✗</span>
              <span>Fail (layout/touch target)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-400 text-white">○</span>
              <span>Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
