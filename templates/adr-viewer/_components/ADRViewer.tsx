'use client';

import { useState, useEffect } from 'react';

interface ADR {
  number: number;
  title: string;
  status: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
  date: string;
  phase: 'initial_research' | 'interview' | 'deep_research';
  endpoint: string;
  file: string;
  supersededBy?: number;
}

interface ADRIndex {
  adrs: ADR[];
}

const statusColors: Record<ADR['status'], string> = {
  proposed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  deprecated: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  superseded: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

const phaseLabels: Record<ADR['phase'], string> = {
  initial_research: 'Initial Research',
  interview: 'Interview',
  deep_research: 'Deep Research',
};

function StatusBadge({ status }: { status: ADR['status'] }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function PhaseBadge({ phase }: { phase: ADR['phase'] }) {
  const phaseColors: Record<ADR['phase'], string> = {
    initial_research: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    interview: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    deep_research: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${phaseColors[phase]}`}>
      {phaseLabels[phase]}
    </span>
  );
}

function ADRCard({ adr, onClick }: { adr: ADR; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-mono text-gray-500">
              ADR-{adr.number.toString().padStart(4, '0')}
            </span>
            <StatusBadge status={adr.status} />
          </div>
          <h3 className="text-lg font-semibold">{adr.title}</h3>
        </div>
        <span className="text-sm text-gray-500">{adr.date}</span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <PhaseBadge phase={adr.phase} />
        <span className="text-sm text-gray-500">→</span>
        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
          {adr.endpoint}
        </span>
      </div>

      {adr.supersededBy && (
        <div className="mt-2 text-sm text-gray-500">
          Superseded by ADR-{adr.supersededBy.toString().padStart(4, '0')}
        </div>
      )}
    </div>
  );
}

function ADRDetail({ adr, content, onBack }: { adr: ADR; content: string; onBack: () => void }) {
  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to list
      </button>

      <div className="flex items-center gap-4 mb-4">
        <span className="text-lg font-mono text-gray-500">
          ADR-{adr.number.toString().padStart(4, '0')}
        </span>
        <StatusBadge status={adr.status} />
        <PhaseBadge phase={adr.phase} />
      </div>

      <h1 className="text-2xl font-bold mb-2">{adr.title}</h1>

      <div className="text-sm text-gray-500 mb-6">
        {adr.date} • {adr.endpoint}
      </div>

      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No ADRs yet</h3>
      <p className="mt-1 text-sm text-gray-500">
        ADRs are created during Interview and Deep Research phases.
      </p>
      <p className="mt-2 text-xs text-gray-400">
        Run <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">/api-create</code> to generate your first ADR.
      </p>
    </div>
  );
}

function FilterBar({
  statusFilter,
  setStatusFilter,
  phaseFilter,
  setPhaseFilter,
  searchQuery,
  setSearchQuery,
}: {
  statusFilter: ADR['status'] | 'all';
  setStatusFilter: (v: ADR['status'] | 'all') => void;
  phaseFilter: ADR['phase'] | 'all';
  setPhaseFilter: (v: ADR['phase'] | 'all') => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <input
        type="text"
        placeholder="Search ADRs..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1 min-w-[200px] px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
      />

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as ADR['status'] | 'all')}
        className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
      >
        <option value="all">All Statuses</option>
        <option value="proposed">Proposed</option>
        <option value="accepted">Accepted</option>
        <option value="deprecated">Deprecated</option>
        <option value="superseded">Superseded</option>
      </select>

      <select
        value={phaseFilter}
        onChange={(e) => setPhaseFilter(e.target.value as ADR['phase'] | 'all')}
        className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
      >
        <option value="all">All Phases</option>
        <option value="initial_research">Initial Research</option>
        <option value="interview">Interview</option>
        <option value="deep_research">Deep Research</option>
      </select>
    </div>
  );
}

export default function ADRViewer() {
  const [adrs, setAdrs] = useState<ADR[]>([]);
  const [selectedAdr, setSelectedAdr] = useState<ADR | null>(null);
  const [adrContent, setAdrContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ADR['status'] | 'all'>('all');
  const [phaseFilter, setPhaseFilter] = useState<ADR['phase'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // In production, fetch from .claude/adrs/index.json
    // For now, use mock data or empty state
    const fetchADRs = async () => {
      try {
        const res = await fetch('/.claude/adrs/index.json');
        if (res.ok) {
          const data: ADRIndex = await res.json();
          setAdrs(data.adrs);
        }
      } catch {
        // No ADRs yet - show empty state
        setAdrs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchADRs();
  }, []);

  const handleSelectAdr = async (adr: ADR) => {
    setSelectedAdr(adr);
    try {
      const res = await fetch(`/.claude/adrs/${adr.file}`);
      if (res.ok) {
        const text = await res.text();
        // Basic markdown to HTML (in production, use a proper markdown parser)
        const html = text
          .replace(/^### (.+)$/gm, '<h3>$1</h3>')
          .replace(/^## (.+)$/gm, '<h2>$1</h2>')
          .replace(/^# (.+)$/gm, '<h1>$1</h1>')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\n\n/g, '</p><p>')
          .replace(/^- (.+)$/gm, '<li>$1</li>');
        setAdrContent(`<p>${html}</p>`);
      }
    } catch {
      setAdrContent('<p>Failed to load ADR content.</p>');
    }
  };

  const filteredAdrs = adrs.filter((adr) => {
    if (statusFilter !== 'all' && adr.status !== statusFilter) return false;
    if (phaseFilter !== 'all' && adr.phase !== phaseFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        adr.title.toLowerCase().includes(query) ||
        adr.endpoint.toLowerCase().includes(query) ||
        `adr-${adr.number}`.includes(query)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (selectedAdr) {
    return (
      <ADRDetail
        adr={selectedAdr}
        content={adrContent}
        onBack={() => setSelectedAdr(null)}
      />
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Architecture Decision Records</h1>
        <p className="text-gray-500 mt-1">
          Significant decisions made during research and interview phases
        </p>
      </div>

      {adrs.length > 0 && (
        <FilterBar
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          phaseFilter={phaseFilter}
          setPhaseFilter={setPhaseFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}

      {filteredAdrs.length === 0 ? (
        adrs.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No ADRs match your filters
          </div>
        )
      ) : (
        <div className="space-y-4">
          {filteredAdrs.map((adr) => (
            <ADRCard key={adr.number} adr={adr} onClick={() => handleSelectAdr(adr)} />
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-medium mb-2">About ADRs</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Architecture Decision Records capture significant decisions made during the development workflow.
          They are created automatically during Interview (Phase 4) and Deep Research (Phase 5)
          when you make choices about authentication, error handling, caching, and other architectural concerns.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          See <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">docs/ARCHITECTURE_DECISION_RECORDS.md</code> for details.
        </p>
      </div>
    </div>
  );
}
