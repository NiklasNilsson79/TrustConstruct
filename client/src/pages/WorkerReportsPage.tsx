import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { getToken } from '../auth/authStore';
import { type ReportDto } from '../reports/reportService';

type ChainStatus = 'Verified' | 'Pending' | 'Mismatch';

type ReportRow = {
  id: string;
  project: string;
  room: string;
  date: string; // display string
  status: ChainStatus;
};

function statusPillClass(status: ChainStatus) {
  if (status === 'Verified')
    return 'bg-green-50 text-green-700 border-green-200';
  if (status === 'Pending')
    return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-700 border-red-200';
}

// UI mapping while full on-chain verification is handled elsewhere.
// Mappa report.status till något som passar UI (så du får "Pending" för submitted).
function mapToChainStatus(report: ReportDto): ChainStatus {
  const raw = (report.status ?? '').toLowerCase();
  if (raw === 'approved') return 'Verified';
  if (raw === 'rejected') return 'Mismatch';
  return 'Pending';
}

function extractRoom(report: ReportDto): string {
  // Försök ta roomId från inspection först
  const roomFromInspection = report.inspection?.roomId;
  if (roomFromInspection) return roomFromInspection;

  // Annars: försök plocka ut sista delen av "APT / ROOM" från location
  // Ex: "1212 / 212" => "212"
  const loc = report.location ?? '';
  const parts = loc.split('/').map((p) => p.trim());
  return parts.length >= 2 ? parts[parts.length - 1] : loc || '—';
}

export default function WorkerReportsPage() {
  const navigate = useNavigate();

  const [reports, setReports] = useState<ReportDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // En enda funktion för navigation så både click + keyboard blir identiska.
  function openReport(reportId: string) {
    navigate(`/reports/${reportId}`, {
      state: {
        backTo: '/worker/reports',
        backLabel: 'Back to My Reports',
      },
    });
  }

  useEffect(() => {
    let mounted = true;

    async function run() {
      setIsLoading(true);
      setError(null);

      try {
        const token = getToken();

        const res = await fetch('/api/reports/mine', {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(
            `Failed to load my reports (HTTP ${res.status}) ${
              text ? `— ${text}` : ''
            }`
          );
        }

        const data = (await res.json()) as ReportDto[];

        if (!mounted) return;
        setReports(data);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        if (!mounted) setIsLoading(false);
      }
    }

    run();

    return () => {
      mounted = false;
    };
  }, []);

  const rows: ReportRow[] = useMemo(() => {
    return reports.map((r) => ({
      id: r.id,
      project: r.project ?? r.inspection?.projectId ?? '—',
      room: extractRoom(r),
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—',
      status: mapToChainStatus(r),
    }));
  }, [reports]);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              My Reports
            </h1>
            <p className="text-sm text-muted-foreground">
              View all inspection reports you&apos;ve submitted.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="primary"
              onClick={() => navigate('/worker')}>
              <span className="inline-flex items-center gap-2">
                <span className="text-lg leading-none">+</span>
                New Report
              </span>
            </Button>
          </div>
        </header>

        {error ? (
          <div className="mb-4 rounded-lg border bg-background px-4 py-3 text-sm text-foreground">
            {error}
          </div>
        ) : null}

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="px-6 py-4 text-sm text-muted-foreground">
                Loading reports…
              </div>
            ) : rows.length === 0 ? (
              <div className="px-6 py-6 text-sm text-muted-foreground">
                No reports yet. Create your first report by clicking “New
                Report”.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-6 py-4 font-medium">Report ID</th>
                      <th className="px-6 py-4 font-medium">Project</th>
                      <th className="px-6 py-4 font-medium">Room</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={r.id}
                        className="border-t hover:bg-slate-50/50 cursor-pointer"
                        onClick={() => openReport(r.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openReport(r.id);
                          }
                        }}>
                        <td className="px-6 py-4 font-medium">{r.id}</td>
                        <td className="px-6 py-4">{r.project}</td>
                        <td className="px-6 py-4 text-slate-600">{r.room}</td>
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
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
