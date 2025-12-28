"use client";

import Link from "next/link";

/**
 * Test Results Page
 *
 * Shows Vitest unit test results or instructions to run tests.
 * Designed to work with vitest --reporter=json output.
 *
 * Created with Hustle API Dev Tools (v3.12.12)
 */
export default function TestResultsPage() {
  // In a real implementation, this would fetch test results from a JSON file
  // For now, we show the empty state with instructions
  const hasResults = false;

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
            <span className="text-white">Test Results</span>
          </div>
          <h1 className="mt-2 text-3xl font-black text-white">TEST RESULTS</h1>
          <p className="mt-2 text-white/80">Vitest unit test results</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-8">
        {hasResults ? <TestResults /> : <EmptyState />}
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

function TestResults() {
  // Placeholder for actual test results display
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Passed" value={0} color="green" />
        <StatCard label="Failed" value={0} color="red" />
        <StatCard label="Skipped" value={0} color="yellow" />
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
              No Test Results
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Run your tests to see results here
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="border-2 border-black bg-gray-50 p-6 dark:border-gray-600 dark:bg-gray-900">
        <h3 className="mb-4 font-bold text-black dark:text-white">Run Tests</h3>
        <div className="space-y-4">
          <Step
            number={1}
            title="Run Unit Tests"
            command="pnpm test"
            description="Runs Vitest in watch mode for development"
          />
          <Step
            number={2}
            title="Run Tests Once"
            command="pnpm test:run"
            description="Runs all tests once and exits"
          />
          <Step
            number={3}
            title="Run with Coverage"
            command="pnpm test:coverage"
            description="Generates code coverage report"
          />
        </div>
      </div>

      {/* Test Commands Reference */}
      <div className="border-2 border-black p-6 dark:border-gray-600">
        <h3 className="mb-4 font-bold text-black dark:text-white">
          Available Commands
        </h3>
        <div className="space-y-3">
          <CommandItem
            command="pnpm test"
            description="Watch mode - reruns on file changes"
          />
          <CommandItem
            command="pnpm test:run"
            description="Single run - CI/CD friendly"
          />
          <CommandItem
            command="pnpm test:coverage"
            description="With coverage report"
          />
          <CommandItem
            command="pnpm test [file]"
            description="Run specific test file"
          />
        </div>
      </div>

      {/* Test File Conventions */}
      <div className="border-2 border-black bg-gray-50 p-6 dark:border-gray-600 dark:bg-gray-900">
        <h3 className="mb-4 font-bold text-black dark:text-white">
          Test File Conventions
        </h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-center gap-2">
            <code className="rounded bg-white px-2 py-0.5 text-[#BA0C2F] dark:bg-gray-800">
              *.test.ts
            </code>
            Unit tests
          </li>
          <li className="flex items-center gap-2">
            <code className="rounded bg-white px-2 py-0.5 text-[#BA0C2F] dark:bg-gray-800">
              *.api.test.ts
            </code>
            API route tests
          </li>
          <li className="flex items-center gap-2">
            <code className="rounded bg-white px-2 py-0.5 text-[#BA0C2F] dark:bg-gray-800">
              __tests__/
            </code>
            Test directory convention
          </li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "green" | "red" | "yellow";
}) {
  const colorClasses = {
    green: "text-green-600",
    red: "text-red-600",
    yellow: "text-yellow-600",
  };

  return (
    <div className="border-2 border-black bg-white p-4 dark:border-gray-600 dark:bg-gray-900">
      <p className={`text-3xl font-black ${colorClasses[color]}`}>{value}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
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
