import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

import { listReports, type ReportDto } from '../reports/reportService';

type ReportStatus = 'Verified' | 'Pending' | 'Mismatch';

type ReportRow = {
  id: string; // MUST be the backend id used by /api/reports/:id
  project: string;
  location: string;
  contractor: string;
  date: string; // display string for now
  status: ReportStatus;

  inspection?: {
    apartmentId?: string;
    roomId?: string;
  };
};

function statusPillClass(status: ReportStatus) {
  if (status === 'Verified')
    return 'bg-green-50 text-green-700 border-green-200';
  if (status === 'Pending')
    return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-700 border-red-200';
}

// Minimal mapping: adjust once backend status semantics are confirmed
function mapDtoStatusToUi(status?: string): ReportStatus {
  const s = (status ?? '').toLowerCase();
  if (s === 'approved' || s === 'verified') return 'Verified';
  if (s === 'rejected' || s === 'mismatch') return 'Mismatch';
  return 'Pending';
}

function mapDtoToRow(dto: ReportDto): ReportRow {
  return {
    id: dto.id, // critical: used for /api/reports/:id
    project: dto.project ?? '—',
    location: dto.location ?? '—',
    contractor: dto.contractor ?? '—',
    date: dto.createdAt
      ? new Date(dto.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
        })
      : '—',
    status: mapDtoStatusToUi(dto.status),

    inspection: dto.inspection, // ← DETTA SAKNADES
  };
}

export default function ManagerHomePage() {
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ReportStatus>('All');

  const [reports, setReports] = useState<ReportRow[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const dtos = await listReports();
        if (!isMounted) return;

        setReports(dtos.map(mapDtoToRow));
        setIsLoading(false);
      } catch (e) {
        if (!isMounted) return;

        const msg = e instanceof Error ? e.message : 'Unknown error';
        setLoadError(msg);
        setIsLoading(false);
      }
    }

    run();

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return reports.filter((r) => {
      const matchesStatus =
        statusFilter === 'All' ? true : r.status === statusFilter;

      const matchesQuery =
        q.length === 0
          ? true
          : [r.id, r.project, r.location, r.contractor, r.date, r.status]
              .join(' ')
              .toLowerCase()
              .includes(q);

      return matchesStatus && matchesQuery;
    });
  }, [query, statusFilter, reports]);

  const goToReport = (reportId: string) => {
    navigate(`/reports/${encodeURIComponent(reportId)}`);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            {/* Icon block */}
            <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 border border-slate-200">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-slate-700"
                aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M8 13h8" />
                <path d="M8 17h8" />
              </svg>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">
                Inspection Reports
              </h1>
              <p className="text-sm text-muted-foreground">
                Search and verify construction quality control reports.
              </p>
            </div>
          </div>
        </header>

        {/* Search / Filters bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              {/* Search input with icon */}
              <div className="relative w-full flex-1">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>

                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by ID, project, or contractor..."
                  className="pl-10"
                />
              </div>

              {/* Status dropdown */}
              <div className="w-full md:w-56">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as 'All' | ReportStatus)
                    }
                    className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-white px-3 pr-9 text-sm outline-none focus:ring-2 focus:ring-slate-200">
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Verified">Verified</option>
                    <option value="Mismatch">Mismatch</option>
                  </select>

                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Filters button (placeholder) */}
              <Button
                type="button"
                variant="outline"
                className="w-full md:w-auto"
                onClick={() => {
                  // placeholder för framtida filter-panel
                }}>
                <span className="inline-flex items-center gap-2">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true">
                    <polygon points="22 3 2 3 10 12 10 19 14 21 14 12 22 3" />
                  </svg>
                  Filters
                </span>
              </Button>
            </div>

            {/* Subtle load state */}
            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                {isLoading ? 'Loading reports…' : ' '}
                {!isLoading && loadError
                  ? 'Showing mock data (API unavailable).'
                  : null}
              </div>
              {!isLoading && loadError ? (
                <button
                  type="button"
                  className="underline underline-offset-2"
                  onClick={() => window.location.reload()}>
                  Retry
                </button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="mt-6">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-6 py-4 font-medium">Report ID</th>
                    <th className="px-6 py-4 font-medium">Project</th>
                    <th className="px-6 py-4 font-medium">Location</th>
                    <th className="px-6 py-4 font-medium">Contractor</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t hover:bg-slate-50/50 cursor-pointer"
                      onClick={() => goToReport(r.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          goToReport(r.id);
                        }
                      }}
                      tabIndex={0}
                      role="link"
                      aria-label={`Open report ${r.id}`}>
                      <td className="px-6 py-4 font-medium">
                        <Link
                          to={`/reports/${encodeURIComponent(r.id)}`}
                          className="rounded-sm underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-slate-200"
                          onClick={(e) => e.stopPropagation()}>
                          {r.id}
                        </Link>
                      </td>
                      <td className="px-6 py-4">{r.project}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {r.inspection?.apartmentId && r.inspection?.roomId
                          ? `Apartment ${r.inspection.apartmentId} / Room ${r.inspection.roomId}`
                          : r.location}
                      </td>

                      <td className="px-6 py-4">{r.contractor}</td>
                      <td className="px-6 py-4 text-slate-600">{r.date}</td>
                      <td className="px-6 py-4">
                        <span
                          className={[
                            'inline-flex items-center rounded-full border px-3 py-1 text-xs',
                            statusPillClass(r.status),
                          ].join(' ')}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr className="border-t">
                      <td
                        className="px-6 py-10 text-sm text-slate-600"
                        colSpan={6}>
                        No reports match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t px-6 py-4 text-sm text-slate-600">
              Showing {filtered.length} report{filtered.length === 1 ? '' : 's'}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
