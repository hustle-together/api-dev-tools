"use client";

import Link from "next/link";
import { useMemo } from "react";

// Import registry for stats
import registryData from "@/../.claude/registry.json";

interface Registry {
  version: string;
  apis: Record<string, unknown>;
  components?: Record<string, unknown>;
  pages?: Record<string, unknown>;
  combined?: Record<string, unknown>;
}

/**
 * Hustle Dev Dashboard
 *
 * Central hub linking to all development tools and showcases.
 * Provides quick access to:
 * - API Showcase & Documentation
 * - UI Showcase & Storybook
 * - Test Results
 * - TypeDoc API Documentation
 *
 * Created with Hustle API Dev Tools (v3.12.11)
 */
export default function HustleDevDashboard() {
  const registry: Registry = registryData || {
    version: "1.0.0",
    apis: {},
    components: {},
    pages: {},
    combined: {},
  };

  const stats = useMemo(() => {
    return {
      apis: Object.keys(registry.apis || {}).length,
      combined: Object.keys(registry.combined || {}).length,
      components: Object.keys(registry.components || {}).length,
      pages: Object.keys(registry.pages || {}).length,
    };
  }, [registry]);

  const totalAPIs = stats.apis + stats.combined;
  const totalUI = stats.components + stats.pages;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="border-b-4 border-black bg-[#BA0C2F] px-6 py-8 dark:border-gray-600">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-black text-white">
            HUSTLE DEV DASHBOARD
          </h1>
          <p className="mt-2 text-white/80">
            Central hub for all development tools and showcases
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Stats Overview */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <StatCard label="APIs" value={stats.apis} />
          <StatCard label="Combined" value={stats.combined} />
          <StatCard label="Components" value={stats.components} />
          <StatCard label="Pages" value={stats.pages} />
        </div>

        {/* Links Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* APIs Section */}
          <DashboardSection
            icon="📡"
            title="APIs"
            description={`${totalAPIs} endpoint${totalAPIs !== 1 ? "s" : ""} registered`}
          >
            <DashboardLink
              href="/api-showcase"
              title="API Showcase"
              description="Interactive API testing and documentation"
              primary
            />
            <DashboardLink
              href="/docs/api"
              title="API Documentation"
              description="TypeDoc-generated API reference"
            />
          </DashboardSection>

          {/* UI Section */}
          <DashboardSection
            icon="🧩"
            title="Components & Pages"
            description={`${totalUI} item${totalUI !== 1 ? "s" : ""} registered`}
          >
            <DashboardLink
              href="/ui-showcase"
              title="UI Showcase"
              description="Component gallery with live previews"
              primary
            />
            <DashboardLink
              href="http://localhost:6006"
              title="Storybook"
              description="Component development environment"
              external
            />
          </DashboardSection>

          {/* Testing Section */}
          <DashboardSection
            icon="🧪"
            title="Testing"
            description="Test results and coverage reports"
          >
            <DashboardLink
              href="/test-results"
              title="Test Results"
              description="Vitest unit test results"
            />
            <DashboardLink
              href="/playwright-report"
              title="Playwright Reports"
              description="E2E test results and screenshots"
            />
          </DashboardSection>

          {/* Documentation Section */}
          <DashboardSection
            icon="📚"
            title="Documentation"
            description="Project documentation and guides"
          >
            <DashboardLink
              href="/docs"
              title="TypeDoc Documentation"
              description="Auto-generated code documentation"
            />
            <DashboardLink
              href="https://github.com/hustle-together/api-dev-tools"
              title="GitHub Repository"
              description="Source code and README"
              external
            />
          </DashboardSection>
        </div>

        {/* Quick Commands */}
        <div className="mt-8 border-2 border-black bg-gray-50 p-6 dark:border-gray-600 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-bold text-black dark:text-white">
            Quick Commands
          </h2>
          <div className="grid gap-2 font-mono text-sm sm:grid-cols-2">
            <CommandItem command="pnpm typedoc" description="Generate API docs" />
            <CommandItem command="pnpm test" description="Run all tests" />
            <CommandItem command="pnpm storybook" description="Start Storybook" />
            <CommandItem command="pnpm test:e2e" description="Run Playwright tests" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-black px-6 py-4 dark:border-gray-600">
        <div className="mx-auto max-w-6xl text-center text-sm text-gray-600 dark:text-gray-400">
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-2 border-black bg-white p-4 dark:border-gray-600 dark:bg-gray-900">
      <p className="text-3xl font-black text-[#BA0C2F]">{value}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  );
}

function DashboardSection({
  icon,
  title,
  description,
  children,
}: {
  icon: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-2 border-black dark:border-gray-600">
      <div className="border-b-2 border-black bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <div>
            <h2 className="font-bold text-black dark:text-white">{title}</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {description}
            </p>
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
        {children}
      </div>
    </div>
  );
}

function DashboardLink({
  href,
  title,
  description,
  primary,
  external,
}: {
  href: string;
  title: string;
  description: string;
  primary?: boolean;
  external?: boolean;
}) {
  const LinkComponent = external ? "a" : Link;
  const externalProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <LinkComponent
      href={href}
      className={`block px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
        primary ? "bg-[#BA0C2F]/5" : ""
      }`}
      {...externalProps}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className={`font-medium ${
              primary
                ? "text-[#BA0C2F]"
                : "text-black dark:text-white"
            }`}
          >
            {title}
            {external && (
              <span className="ml-1 text-xs text-gray-400">↗</span>
            )}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-400"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </LinkComponent>
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
    <div className="flex items-center justify-between rounded bg-white px-3 py-2 dark:bg-gray-800">
      <code className="text-[#BA0C2F]">{command}</code>
      <span className="text-xs text-gray-500">{description}</span>
    </div>
  );
}
