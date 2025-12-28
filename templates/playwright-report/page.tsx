"use client";

import Link from "next/link";

/**
 * Playwright Report Page
 *
 * Shows Playwright E2E test results or instructions to run tests.
 * Links to the HTML report when available.
 *
 * Created with Hustle API Dev Tools (v3.12.12)
 */
export default function PlaywrightReportPage() {
  // In a real implementation, check if playwright-report/ exists
  const hasReport = false;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="border-b-4 border-black bg-[#BA0C2F] px-6 py-8 dark:border-gray-600">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2">
            <Link
              href="/hustle-dev-dashboard"
              className="text-white/80 hover:text-white"
            >
              Dashboard
            </Link>
            <span className="text-white/60">/</span>
            <span className="text-white">Playwright</span>
          </div>
          <h1 className="mt-2 text-3xl font-black text-white">
            PLAYWRIGHT REPORTS
          </h1>
          <p className="mt-2 text-white/80">End-to-end test results</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-8">
        {hasReport ? <ReportContent /> : <EmptyState />}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-black px-6 py-4 dark:border-gray-600">
        <div className="mx-auto max-w-4xl text-center text-sm text-gray-600 dark:text-gray-400">
          Built with{" "}
          <a
            href="https://github.com/hustle-together/api-dev-tools"
            className="font-bold text-[#BA0C2F] hover:underline"
          >
            Hustle API Dev Tools
          </a>
        </div>
      </footer>
    </div>
  );
}

function ReportContent() {
  return (
    <div className="space-y-6">
      <div className="border-2 border-black p-6 dark:border-gray-600">
        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
          View Report
        </h2>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          Playwright has generated an HTML report. Click below to view it:
        </p>
        <a
          href="/playwright-report/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded bg-[#BA0C2F] px-6 py-3 font-bold text-white transition-colors hover:bg-[#8a0923]"
        >
          Open HTML Report
        </a>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="border-2 border-black p-6 dark:border-gray-600">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-2xl dark:bg-gray-800">
            0
          </div>
          <div>
            <h2 className="text-xl font-bold text-black dark:text-white">
              No Playwright Reports
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Run E2E tests to generate a report
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="border-2 border-black bg-gray-50 p-6 dark:border-gray-600 dark:bg-gray-900">
        <h3 className="mb-4 font-bold text-black dark:text-white">
          Run E2E Tests
        </h3>
        <div className="space-y-4">
          <Step
            number={1}
            title="Run All E2E Tests"
            command="pnpm test:e2e"
            description="Runs all Playwright tests and generates a report"
          />
          <Step
            number={2}
            title="Run with UI"
            command="pnpm playwright test --ui"
            description="Opens Playwright's interactive test runner"
          />
          <Step
            number={3}
            title="View Report"
            command="pnpm playwright show-report"
            description="Opens the HTML report in your browser"
          />
        </div>
      </div>

      {/* Available Commands */}
      <div className="border-2 border-black p-6 dark:border-gray-600">
        <h3 className="mb-4 font-bold text-black dark:text-white">
          Playwright Commands
        </h3>
        <div className="space-y-3">
          <CommandItem
            command="pnpm test:e2e"
            description="Run all E2E tests"
          />
          <CommandItem
            command="pnpm playwright test --ui"
            description="Interactive test runner"
          />
          <CommandItem
            command="pnpm playwright test --headed"
            description="Run with visible browser"
          />
          <CommandItem
            command="pnpm playwright show-report"
            description="Open HTML report"
          />
          <CommandItem
            command="pnpm playwright codegen"
            description="Generate tests by recording"
          />
        </div>
      </div>

      {/* Test Types */}
      <div className="border-2 border-black bg-gray-50 p-6 dark:border-gray-600 dark:bg-gray-900">
        <h3 className="mb-4 font-bold text-black dark:text-white">
          E2E Test Types
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <TestTypeCard
            icon="🖥️"
            title="Page Tests"
            description="Full page navigation and interaction tests"
            pattern="*.e2e.test.ts"
          />
          <TestTypeCard
            icon="📸"
            title="Visual Tests"
            description="Screenshot comparison for UI changes"
            pattern="*.visual.spec.ts"
          />
          <TestTypeCard
            icon="♿"
            title="Accessibility"
            description="WCAG compliance and a11y checks"
            pattern="*.a11y.spec.ts"
          />
          <TestTypeCard
            icon="📱"
            title="Responsive"
            description="Mobile, tablet, and desktop viewports"
            pattern="--project=mobile"
          />
        </div>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  command,
  description,
}: {
  number: number;
  title: string;
  command: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#BA0C2F] text-sm font-bold text-white">
        {number}
      </div>
      <div>
        <p className="font-medium text-black dark:text-white">{title}</p>
        <code className="mt-1 block rounded bg-white px-3 py-1 font-mono text-sm text-[#BA0C2F] dark:bg-gray-800">
          {command}
        </code>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function CommandItem({
  command,
  description,
}: {
  command: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between rounded bg-white px-4 py-2 dark:bg-gray-800">
      <code className="font-mono text-[#BA0C2F]">{command}</code>
      <span className="text-sm text-gray-500">{description}</span>
    </div>
  );
}

function TestTypeCard({
  icon,
  title,
  description,
  pattern,
}: {
  icon: string;
  title: string;
  description: string;
  pattern: string;
}) {
  return (
    <div className="rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 text-2xl">{icon}</div>
      <h4 className="font-medium text-black dark:text-white">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      <code className="mt-2 block text-xs text-[#BA0C2F]">{pattern}</code>
    </div>
  );
}
