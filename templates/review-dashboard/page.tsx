"use client";

import { useState, useEffect } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface ReviewFinding {
  id: string;
  pass: number;
  category: string;
  severity: "critical" | "warning" | "suggestion";
  file: string;
  line: number;
  code: string;
  issue: string;
  fix: string;
  aiReasoning: string;
  status: "open" | "fixed" | "wontfix" | "false-positive";
}

interface PassResult {
  name: string;
  items: {
    name: string;
    status: "pass" | "warn" | "fail";
    findings: ReviewFinding[];
  }[];
  totalPass: number;
  totalWarn: number;
  totalFail: number;
}

interface ReviewReport {
  id: string;
  timestamp: string;
  filesReviewed: number;
  duration: string;
  passes: PassResult[];
  summary: {
    critical: number;
    warning: number;
    suggestion: number;
    passRate: number;
  };
}

// ============================================================================
// MOCK DATA (Replace with actual data from .claude/review-log.json)
// ============================================================================

const MOCK_REPORT: ReviewReport = {
  id: "review-2025-12-29-001",
  timestamp: "2025-12-29T15:30:00Z",
  filesReviewed: 45,
  duration: "8m 34s",
  passes: [
    {
      name: "Pass 1: Logic & Bugs",
      items: [
        { name: "Optional properties checked", status: "pass", findings: [] },
        { name: "Spread on null values", status: "warn", findings: [
          {
            id: "f1",
            pass: 1,
            category: "Null Handling",
            severity: "warning",
            file: "src/lib/merge.ts",
            line: 23,
            code: "const result = { ...maybeNull }",
            issue: "maybeNull could be null/undefined",
            fix: "const result = { ...(maybeNull ?? {}) }",
            aiReasoning: "The variable 'maybeNull' is typed as 'T | null' but spread operator doesn't handle null. This will throw at runtime if null is passed.",
            status: "open"
          }
        ]},
        { name: "Promise rejections caught", status: "pass", findings: [] },
        { name: "Loop bounds correct", status: "pass", findings: [] },
        { name: "Pagination calculations", status: "fail", findings: [
          {
            id: "f2",
            pass: 1,
            category: "Off-by-One",
            severity: "critical",
            file: "src/app/api/users/route.ts",
            line: 67,
            code: "const offset = (page - 1) * limit + 1",
            issue: "Off-by-one error - offset should not add 1",
            fix: "const offset = (page - 1) * limit",
            aiReasoning: "Adding 1 to the offset will skip the first item on every page after page 1. For page 2 with limit 10, this returns items 12-21 instead of 11-20.",
            status: "open"
          }
        ]},
      ],
      totalPass: 3,
      totalWarn: 1,
      totalFail: 1
    },
    {
      name: "Pass 2: Security",
      items: [
        { name: "API routes check session", status: "pass", findings: [] },
        { name: "JWT tokens verified", status: "pass", findings: [] },
        { name: "Inputs validated with Zod", status: "pass", findings: [] },
        { name: "SQL parameterized", status: "pass", findings: [] },
        { name: "CORS specific origins", status: "warn", findings: [
          {
            id: "f3",
            pass: 2,
            category: "CORS",
            severity: "warning",
            file: "src/middleware.ts",
            line: 12,
            code: "origin: process.env.NODE_ENV === 'development' ? '*' : origins",
            issue: "CORS allows any origin in development",
            fix: "Use specific localhost origins even in development",
            aiReasoning: "While this is only in development, it could mask CORS issues that appear in production. Consider using 'http://localhost:3000' explicitly.",
            status: "open"
          }
        ]},
        { name: "Session cookie SameSite", status: "warn", findings: [
          {
            id: "f4",
            pass: 2,
            category: "Session",
            severity: "warning",
            file: "src/lib/auth.ts",
            line: 45,
            code: "cookies.set('session', token, { httpOnly: true })",
            issue: "Session cookie missing SameSite attribute",
            fix: "Add sameSite: 'lax' or 'strict' to cookie options",
            aiReasoning: "Without SameSite, the cookie defaults to 'None' in some browsers, which requires Secure flag. This could cause auth issues in non-HTTPS environments.",
            status: "open"
          }
        ]},
      ],
      totalPass: 4,
      totalWarn: 2,
      totalFail: 0
    },
    {
      name: "Pass 3: Performance",
      items: [
        { name: "No N+1 queries", status: "fail", findings: [
          {
            id: "f5",
            pass: 3,
            category: "N+1 Query",
            severity: "critical",
            file: "src/app/api/orders/route.ts",
            line: 34,
            code: "orders.map(async (order) => await getCustomer(order.customerId))",
            issue: "N+1 query - fetching customer for each order separately",
            fix: "Use eager loading: include: { customer: true }",
            aiReasoning: "For 100 orders, this makes 101 database queries (1 for orders + 100 for customers). With eager loading, it's just 1 query.",
            status: "open"
          }
        ]},
        { name: "Queries have indexes", status: "pass", findings: [] },
        { name: "Results paginated", status: "pass", findings: [] },
        { name: "useMemo for expensive calcs", status: "pass", findings: [] },
        { name: "useCallback for references", status: "fail", findings: [
          {
            id: "f6",
            pass: 3,
            category: "React Performance",
            severity: "critical",
            file: "src/components/Dashboard.tsx",
            line: 89,
            code: "const handleClick = () => updateData(id)",
            issue: "Missing useCallback causes child re-renders",
            fix: "const handleClick = useCallback(() => updateData(id), [id])",
            aiReasoning: "This handler is passed to DataTable which uses React.memo. Without useCallback, a new function reference is created on every render, breaking memoization.",
            status: "open"
          }
        ]},
      ],
      totalPass: 3,
      totalWarn: 0,
      totalFail: 2
    },
    {
      name: "Pass 4: Miscellaneous",
      items: [
        { name: "Code self-documenting", status: "pass", findings: [] },
        { name: "Variable names descriptive", status: "pass", findings: [] },
        { name: "Complex algorithms commented", status: "warn", findings: [
          {
            id: "f7",
            pass: 4,
            category: "Documentation",
            severity: "suggestion",
            file: "src/lib/utils.ts",
            line: 123,
            code: "function calculateScore(a, b, c, d) { ... }",
            issue: "Complex scoring function lacks explanation",
            fix: "Add JSDoc explaining the algorithm and parameters",
            aiReasoning: "This 30-line function implements a weighted scoring algorithm but doesn't explain what the weights represent or how the final score is used.",
            status: "open"
          }
        ]},
        { name: "Error handling consistent", status: "warn", findings: [
          {
            id: "f8",
            pass: 4,
            category: "Consistency",
            severity: "suggestion",
            file: "src/app/api/orders/route.ts",
            line: 15,
            code: "try { ... } catch (e) { console.error(e) }",
            issue: "Inconsistent error handling vs other routes",
            fix: "Use shared error handler: handleApiError(e)",
            aiReasoning: "Other API routes use handleApiError() which logs to monitoring and returns proper error responses. This route just console.error which loses the error in production.",
            status: "open"
          }
        ]},
        { name: "JSDoc on public APIs", status: "warn", findings: [
          {
            id: "f9",
            pass: 4,
            category: "Documentation",
            severity: "suggestion",
            file: "src/types/index.ts",
            line: 45,
            code: "export interface OrderStatus { ... }",
            issue: "Public type lacks documentation",
            fix: "Add JSDoc describing each status value",
            aiReasoning: "This type is exported and used across multiple files. Adding JSDoc would help IDE tooltips and TypeDoc generation.",
            status: "open"
          }
        ]},
      ],
      totalPass: 2,
      totalWarn: 3,
      totalFail: 0
    }
  ],
  summary: {
    critical: 3,
    warning: 6,
    suggestion: 0,
    passRate: 87
  }
};

// ============================================================================
// COMPONENTS
// ============================================================================

function StatusBadge({ status }: { status: "pass" | "warn" | "fail" }) {
  const styles = {
    pass: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    warn: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    fail: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  };
  const labels = { pass: "Pass", warn: "Warn", fail: "Fail" };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: "critical" | "warning" | "suggestion" }) {
  const styles = {
    critical: "bg-red-600 text-white",
    warning: "bg-yellow-500 text-black",
    suggestion: "bg-blue-100 text-blue-800"
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${styles[severity]}`}>
      {severity}
    </span>
  );
}

function FindingCard({ finding }: { finding: ReviewFinding }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-lg p-4 mb-3 bg-white dark:bg-zinc-900">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <SeverityBadge severity={finding.severity} />
            <span className="text-sm text-zinc-500">{finding.category}</span>
          </div>
          <p className="font-medium text-zinc-900 dark:text-zinc-100">{finding.issue}</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">{finding.file}:{finding.line}</code>
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-blue-600 hover:underline"
        >
          {expanded ? "Hide Details" : "Show Details"}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3">
          <div>
            <h4 className="text-xs font-semibold uppercase text-zinc-500 mb-1">Code</h4>
            <pre className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded text-sm overflow-x-auto">
              <code>{finding.code}</code>
            </pre>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase text-zinc-500 mb-1">Suggested Fix</h4>
            <pre className="bg-green-50 dark:bg-green-900/20 p-3 rounded text-sm overflow-x-auto border-l-4 border-green-500">
              <code>{finding.fix}</code>
            </pre>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase text-zinc-500 mb-1">AI Reasoning</h4>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm border-l-4 border-blue-500">
              <p className="italic">&ldquo;{finding.aiReasoning}&rdquo;</p>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
              Mark Fixed
            </button>
            <button className="px-3 py-1 text-sm bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">
              Won&apos;t Fix
            </button>
            <button className="px-3 py-1 text-sm bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">
              False Positive
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PassSection({ pass }: { pass: PassResult }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border rounded-lg mb-4 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700"
      >
        <h3 className="font-semibold text-lg">{pass.name}</h3>
        <div className="flex items-center gap-4">
          <span className="text-green-600">{pass.totalPass} ✓</span>
          <span className="text-yellow-600">{pass.totalWarn} ⚠</span>
          <span className="text-red-600">{pass.totalFail} ✗</span>
          <span className="text-zinc-400">{expanded ? "▼" : "▶"}</span>
        </div>
      </button>

      {expanded && (
        <div className="p-4">
          <table className="w-full mb-4">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-sm font-medium text-zinc-500">Checklist Item</th>
                <th className="text-right py-2 text-sm font-medium text-zinc-500 w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              {pass.items.map((item, idx) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="py-2">{item.name}</td>
                  <td className="py-2 text-right">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pass.items.some(item => item.findings.length > 0) && (
            <div className="mt-4">
              <h4 className="font-medium mb-3 text-zinc-700 dark:text-zinc-300">Findings</h4>
              {pass.items.flatMap(item => item.findings).map(finding => (
                <FindingCard key={finding.id} finding={finding} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ report }: { report: ReviewReport }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white dark:bg-zinc-900 border rounded-lg p-4">
        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{report.summary.passRate}%</p>
        <p className="text-sm text-zinc-500">Pass Rate</p>
      </div>
      <div className="bg-white dark:bg-zinc-900 border rounded-lg p-4">
        <p className="text-3xl font-bold text-red-600">{report.summary.critical}</p>
        <p className="text-sm text-zinc-500">Critical</p>
      </div>
      <div className="bg-white dark:bg-zinc-900 border rounded-lg p-4">
        <p className="text-3xl font-bold text-yellow-600">{report.summary.warning}</p>
        <p className="text-sm text-zinc-500">Warnings</p>
      </div>
      <div className="bg-white dark:bg-zinc-900 border rounded-lg p-4">
        <p className="text-3xl font-bold text-zinc-600">{report.filesReviewed}</p>
        <p className="text-sm text-zinc-500">Files Reviewed</p>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function ReviewDashboard() {
  const [report, setReport] = useState<ReviewReport | null>(null);
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "suggestion">("all");

  useEffect(() => {
    // In production, fetch from .claude/review-log.json
    setReport(MOCK_REPORT);
  }, []);

  if (!report) {
    return (
      <div className="container mx-auto p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-zinc-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-zinc-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Code Review Dashboard
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Multi-pass review results from <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">{report.id}</code>
        </p>
        <p className="text-sm text-zinc-500 mt-1">
          {new Date(report.timestamp).toLocaleString()} • {report.duration} • {report.filesReviewed} files
        </p>
      </div>

      {/* Summary Cards */}
      <SummaryCard report={report} />

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {["all", "critical", "warning", "suggestion"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as typeof filter)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              filter === f
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Pass Sections */}
      <div>
        {report.passes.map((pass, idx) => (
          <PassSection key={idx} pass={pass} />
        ))}
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
          Mark All Fixed
        </button>
        <button className="px-6 py-3 bg-zinc-200 dark:bg-zinc-700 rounded-lg font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600">
          Export Report
        </button>
        <button className="px-6 py-3 bg-zinc-200 dark:bg-zinc-700 rounded-lg font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600">
          Re-run Review
        </button>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t text-center text-sm text-zinc-500">
        <p>Generated by <code>/test-review --all-passes</code></p>
        <p className="mt-1">
          <a href="/hustle-dev-dashboard" className="text-blue-600 hover:underline">← Back to Dashboard</a>
        </p>
      </div>
    </div>
  );
}
