"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Documentation Page
 *
 * Shows TypeDoc-generated documentation or instructions to generate it.
 * Links to the generated markdown files in docs/api/.
 *
 * Created with Hustle API Dev Tools (v3.12.12)
 */
export default function DocsPage() {
  const [hasContent, setHasContent] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if docs exist by trying to fetch the index
    fetch("/docs/api/README.md")
      .then((res) => {
        setHasContent(res.ok);
      })
      .catch(() => {
        setHasContent(false);
      });
  }, []);

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
            <span className="text-white">Documentation</span>
          </div>
          <h1 className="mt-2 text-3xl font-black text-white">
            API DOCUMENTATION
          </h1>
          <p className="mt-2 text-white/80">
            TypeDoc-generated code documentation
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-8">
        {hasContent === null ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#BA0C2F] border-t-transparent" />
          </div>
        ) : hasContent ? (
          <DocsContent />
        ) : (
          <EmptyState />
        )}
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

function DocsContent() {
  return (
    <div className="space-y-6">
      <div className="border-2 border-black p-6 dark:border-gray-600">
        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
          Generated Documentation
        </h2>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          Documentation has been generated. Browse the API reference:
        </p>
        <div className="space-y-2">
          <DocLink href="/docs/api" title="API Reference" description="Full API documentation" />
        </div>
      </div>

      <div className="border-2 border-black bg-gray-50 p-6 dark:border-gray-600 dark:bg-gray-900">
        <h3 className="mb-2 font-bold text-black dark:text-white">
          Regenerate Documentation
        </h3>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Run this command to update the documentation:
        </p>
        <code className="block rounded bg-white px-4 py-2 font-mono text-[#BA0C2F] dark:bg-gray-800">
          pnpm typedoc
        </code>
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
              No Documentation Generated
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Run TypeDoc to generate API documentation
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="border-2 border-black bg-gray-50 p-6 dark:border-gray-600 dark:bg-gray-900">
        <h3 className="mb-4 font-bold text-black dark:text-white">
          Generate Documentation
        </h3>
        <div className="space-y-4">
          <Step
            number={1}
            title="Run TypeDoc"
            command="pnpm typedoc"
            description="Generates Markdown documentation from TSDoc comments"
          />
          <Step
            number={2}
            title="View Output"
            command="ls docs/api/"
            description="Documentation files are generated in the docs/api/ folder"
          />
          <Step
            number={3}
            title="Refresh Page"
            description="Refresh this page to see your documentation"
          />
        </div>
      </div>

      {/* Requirements */}
      <div className="border-2 border-black p-6 dark:border-gray-600">
        <h3 className="mb-4 font-bold text-black dark:text-white">
          Requirements
        </h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-center gap-2">
            <span className="text-[#BA0C2F]">*</span>
            typedoc.json configuration file in project root
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#BA0C2F]">*</span>
            TSDoc comments in your TypeScript files
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#BA0C2F]">*</span>
            typedoc and typedoc-plugin-markdown installed
          </li>
        </ul>
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
  command?: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#BA0C2F] text-sm font-bold text-white">
        {number}
      </div>
      <div>
        <p className="font-medium text-black dark:text-white">{title}</p>
        {command && (
          <code className="mt-1 block rounded bg-white px-3 py-1 font-mono text-sm text-[#BA0C2F] dark:bg-gray-800">
            {command}
          </code>
        )}
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function DocLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
    >
      <p className="font-medium text-[#BA0C2F]">{title}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </Link>
  );
}
