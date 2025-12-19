import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../components/Card';
import { type ReportStatus } from '../components/StatusBadge';

import {
  getReport,
  type ReportDto,
  type ChecklistValue,
} from '../reports/reportService';

type SummaryMeta = {
  location: { id: string; detail: string };
  component: string;
  contractor: string;
  created: string;
};

type Summary = {
  id: string;
  title: string;
  status: ReportStatus;
  meta: SummaryMeta;
};

type ChecklistItem = {
  title: string;
  description: string;
  value: ChecklistValue; // OK | NOT_OK | NA
};

type CommentItem = {
  author: string;
  timestamp: string;
  text: string;
};

type ChainVerification = {
  onChainHash: string;
  status: 'Verified' | 'Pending' | 'Mismatch';
  lastChecked: string;
  details: Array<{ label: string; value: string }>;
};

function statusPillClass(status: ReportStatus) {
  if (status === 'approved')
    return 'bg-green-50 text-green-700 border-green-200';
  if (status === 'submitted')
    return 'bg-amber-50 text-amber-700 border-amber-200';
  if (status === 'rejected') return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

function chainStatusPillClass(status: ChainVerification['status']) {
  if (status === 'Verified')
    return 'bg-green-50 text-green-700 border-green-200';
  if (status === 'Pending')
    return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-700 border-red-200';
}

function checklistPillClass(value: ChecklistValue) {
  if (value === 'OK') return 'bg-green-50 text-green-700 border-green-200';
  if (value === 'NOT_OK') return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

export default function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();

  const [report, setReport] = useState<ReportDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      setIsLoading(true);
      setError(null);
      setNotFound(false);

      if (!reportId) {
        setIsLoading(false);
        setNotFound(true);
        return;
      }

      try {
        const data = await getReport(reportId);

        if (!isMounted) return;

        if (!data) {
          setReport(null);
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        setReport(data);
        setNotFound(false);
        setIsLoading(false);
      } catch (e) {
        if (!isMounted) return;

        const message = e instanceof Error ? e.message : 'Unknown error';

        if (message === 'REPORT_NOT_FOUND') {
          setReport(null);
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        setError(message);
        setIsLoading(false);
      }
    }

    run();

    return () => {
      isMounted = false;
    };
  }, [reportId]);

  // Mappa backend-status → UI-status (håll det enkelt nu)
  const uiStatus: ReportStatus = useMemo(() => {
    const raw = (report?.status ?? 'submitted').toLowerCase();

    if (raw === 'approved') return 'approved';
    if (raw === 'rejected') return 'rejected';
    if (raw === 'draft') return 'draft';

    // default
    return 'submitted';
  }, [report?.status]);

  // Summary med stabila fallbacks för att inte ändra layout
  const summary: Summary = useMemo(() => {
    const id = report?.id ?? reportId ?? '—';

    return {
      id,
      title: 'Inspection Report',
      status: uiStatus,
      meta: {
        location: {
          id: report?.location ?? '2652765',
          detail: 'AP-2110 / Room 102-3',
        },
        component: report?.project ?? 'Bathroom',
        contractor: report?.contractor ?? 'John Worker',
        created: report?.createdAt
          ? new Date(report.createdAt).toLocaleString()
          : 'December 9, 2025 at 03:32 PM',
      },
    };
  }, [report, reportId, uiStatus]);

  const checklist: ChecklistItem[] = useMemo(() => {
    const rawChecklist = report?.inspection?.checklist;
    if (!rawChecklist) return [];

    const LABELS: Record<string, { title: string; description: string }> = {
      surface_preparation: {
        title: 'Surface Preparation',
        description: 'Verify surfaces are clean and ready for finishing.',
      },
      materials_spec: {
        title: 'Material Compliance',
        description: 'Confirm materials match specification and batch records.',
      },
      per_drawings: {
        title: 'Installation Review',
        description: 'Inspect workmanship and alignment.',
      },
      quality_standards: {
        title: 'Quality Standards',
        description: 'Ensure quality standards are met.',
      },
      safety_requirements: {
        title: 'Safety Controls',
        description: 'Confirm safety measures are in place.',
      },
      cleanup_completed: {
        title: 'Clean-up',
        description: 'Verify clean-up is completed.',
      },
    };

    return Object.entries(rawChecklist).map(([key, value]) => ({
      title: LABELS[key]?.title ?? key,
      description: LABELS[key]?.description ?? '',
      value,
    }));
  }, [report]);

  const comments: CommentItem[] = useMemo(() => {
    const text = report?.inspection?.comments;
    if (!text) return [];

    return [
      {
        author: report.contractor ?? 'Worker',
        timestamp: report.createdAt
          ? new Date(report.createdAt).toLocaleString()
          : '',
        text,
      },
    ];
  }, [report]);

  // Mock chain verification tills blockchain kopplas
  const chain: ChainVerification = useMemo(
    () => ({
      onChainHash:
        '0x9a5c...e21b (mock) — keep as-is until chain verification is wired',
      status: 'Pending',
      lastChecked: 'Dec 9, 2025 • 16:22',
      details: [
        { label: 'Network', value: 'Sepolia (mock)' },
        { label: 'Contract', value: '0x1f3a...9b2c (mock)' },
        { label: 'Tx', value: '0x7d21...a0ff (mock)' },
      ],
    }),
    []
  );

  // EARLY RETURN: om rapport saknas eller fel inträffat, visa endast felvy
  if (!isLoading && (notFound || error) && !report) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-5xl px-6 py-8">
          <div className="mb-6">
            <Link
              to="/manager"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <span aria-hidden>←</span>
              Back to Reports
            </Link>
          </div>

          <div className="rounded-lg border bg-background px-4 py-3 text-sm text-foreground">
            {notFound ? 'Report not found.' : `Could not load report. ${error}`}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        {/* Back (link style) */}
        <div className="mb-6">
          <Link
            to="/manager"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <span aria-hidden>←</span>
            Back to Reports
          </Link>
        </div>

        {/* SUMMARY CARD */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">
                Loading report…
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Header row */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
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
                      <h1 className="text-2xl font-semibold tracking-tight">
                        {summary.title}
                      </h1>
                      <p className="text-sm text-muted-foreground">
                        Report ID:{' '}
                        <span className="font-medium">{summary.id}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={[
                      'inline-flex items-center rounded-full border px-3 py-1 text-xs',
                      statusPillClass(summary.status),
                    ].join(' ')}>
                    {summary.status}
                  </span>
                </div>

                {/* Meta grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border bg-white px-4 py-3">
                    <div className="text-xs text-muted-foreground">
                      Location
                    </div>
                    <div className="mt-1 text-sm font-medium">
                      {summary.meta.location.id}
                    </div>
                    <div className="text-sm text-slate-600">
                      {summary.meta.location.detail}
                    </div>
                  </div>

                  <div className="rounded-lg border bg-white px-4 py-3">
                    <div className="text-xs text-muted-foreground">
                      Component
                    </div>
                    <div className="mt-1 text-sm font-medium">
                      {summary.meta.component}
                    </div>
                  </div>

                  <div className="rounded-lg border bg-white px-4 py-3">
                    <div className="text-xs text-muted-foreground">
                      Contractor
                    </div>
                    <div className="mt-1 text-sm font-medium">
                      {summary.meta.contractor}
                    </div>
                  </div>

                  <div className="rounded-lg border bg-white px-4 py-3">
                    <div className="text-xs text-muted-foreground">Created</div>
                    <div className="mt-1 text-sm font-medium">
                      {summary.meta.created}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CHECKLIST CARD */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Inspection Checklist</CardTitle>
            <CardDescription>
              Inspection checklist submitted by worker.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {checklist.length === 0 ? (
              <div className="rounded-lg border bg-white px-4 py-3 text-sm text-muted-foreground">
                No checklist items were submitted for this report.
              </div>
            ) : (
              <div className="space-y-3">
                {checklist.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start justify-between gap-4 rounded-lg border bg-white px-4 py-3">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className="text-sm text-slate-600">
                        {item.description}
                      </div>
                    </div>

                    <span
                      className={[
                        'inline-flex items-center rounded-full border px-3 py-1 text-xs',
                        checklistPillClass(item.value),
                      ].join(' ')}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* COMMENTS CARD */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Comments</CardTitle>
            <CardDescription>
              Comments provided during inspection.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {comments.length === 0 ? (
              <div className="rounded-lg border bg-white px-4 py-3 text-sm text-muted-foreground">
                No comments were submitted for this report.
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((c, idx) => (
                  <div
                    key={`${c.author}-${idx}`}
                    className="rounded-lg border bg-white px-4 py-3">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm font-medium">{c.author}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.timestamp}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{c.text}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* BLOCKCHAIN VERIFICATION CARD (mock) */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Blockchain Verification</CardTitle>
            <CardDescription>Mock only. No chain calls yet.</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    On-Chain Hash
                  </div>
                  <div className="rounded-md border bg-slate-50 px-3 py-2 font-mono text-xs text-slate-800">
                    {chain.onChainHash}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last checked: {chain.lastChecked}
                  </div>
                </div>

                <span
                  className={[
                    'inline-flex items-center rounded-full border px-3 py-1 text-xs',
                    chainStatusPillClass(chain.status),
                  ].join(' ')}>
                  {chain.status}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {chain.details.map((d) => (
                  <div
                    key={d.label}
                    className="rounded-lg border bg-white px-4 py-3">
                    <div className="text-xs text-muted-foreground">
                      {d.label}
                    </div>
                    <div className="mt-1 text-sm font-medium">{d.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
