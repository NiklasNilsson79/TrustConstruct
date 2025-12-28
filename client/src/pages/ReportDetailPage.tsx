import { Link, useParams, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import BlockchainVerificationCard from '../components/report/BlockchainVerificationCard';
import { approveReportOnChain } from '../utils/approveReportOnChain';

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
  updateReportStatus,
  type ReportDto,
  type ChecklistValue,
} from '../reports/reportService';

type ReportWithSigner = ReportDto & {
  contractorName?: string;
  contractorCompany?: string;
};

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

function statusPillClass(status: ReportStatus) {
  if (status === 'approved')
    return 'bg-green-50 text-green-700 border-green-200';
  if (status === 'submitted')
    return 'bg-amber-50 text-amber-700 border-amber-200';
  if (status === 'rejected') return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

function checklistPillClass(value: ChecklistValue) {
  if (value === 'OK') return 'bg-green-50 text-green-700 border-green-200';
  if (value === 'NOT_OK') return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

async function patchOnChain(reportId: string, body: any) {
  const token = localStorage.getItem('tc_token');

  if (!token) {
    throw new Error('Missing tc_token. Please log in again.');
  }

  const res = await fetch(`/api/reports/${reportId}/onchain`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `PATCH /api/reports/${reportId}/onchain failed`);
  }

  return res.json();
}

function formatAptRoomLine(report: ReportDto | null): string {
  const aptRaw = report?.inspection?.apartmentId?.trim() ?? '';
  const roomRaw = report?.inspection?.roomId?.trim() ?? '';

  const formatApartment = (v: string) => {
    if (!v) return '';
    const lower = v.toLowerCase();
    if (lower.startsWith('apt') || lower.startsWith('apartment')) return v;
    return `Apartment ${v}`;
  };

  const formatRoom = (v: string) => {
    if (!v) return '';
    const lower = v.toLowerCase().replace(/\s+/g, '');
    // If user already typed "room..." (e.g. Room305 / room 305), don't prefix again
    if (lower.startsWith('room')) return v;
    return `Room ${v}`;
  };

  const apt = formatApartment(aptRaw);
  const room = formatRoom(roomRaw);

  if (apt && room) return `${apt} / ${room}`;
  return apt || room || '';
}

function formatContractorDisplay(report: ReportWithSigner | null): string {
  const name = report?.contractorName?.trim() ?? '';
  const company = report?.contractorCompany?.trim() ?? '';

  if (name && company) return `${name} — ${company}`;
  if (name) return name;
  if (company) return company;

  return report?.contractor?.trim() || '—';
}

export default function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();

  const location = useLocation();

  const navState = location.state as
    | { backTo?: string; backLabel?: string }
    | null
    | undefined;

  const backTo = navState?.backTo ?? '/manager';
  const backLabel = navState?.backLabel ?? 'Back to Reports';
  const isManagerContext = backTo.startsWith('/manager');

  const [report, setReport] = useState<ReportDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

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

  async function onApprove() {
    if (!report?.id) return;

    const hash = (report as ReportDto & { reportHash?: string }).reportHash;

    if (!hash) {
      setApproveError(
        'Missing reportHash on report. Cannot register on-chain.'
      );
      return;
    }

    setIsApproving(true);
    setApproveError(null);

    const id = report.id;

    try {
      // 1) On-chain (triggers OKX)
      // approveReportOnChain adds 0x-prefix + validates bytes32 length internally.
      const { txHash, blockNumber } = await approveReportOnChain(hash);

      // 2) Update business/status (approved)
      // Do this BEFORE setting final report state, to avoid overwriting onChain fields later.
      await updateReportStatus(id, 'approved');

      // 3) Persist on-chain result to backend (txHash must survive into UI)
      const patched = await patchOnChain(id, {
        txHash,
        blockNumber,
        status: 'confirmed',
        chainError: '',
      });

      // Set final state ONCE, using the object that includes onChain fields.
      setReport(patched);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Failed to approve/register report';

      // Best effort: store failure state in backend
      try {
        await patchOnChain(id, {
          status: 'failed',
          chainError: msg,
        });
      } catch {
        // ignore secondary failure
      }

      setApproveError(msg);
    } finally {
      setIsApproving(false);
    }
  }

  // Map backend status → UI status
  const uiStatus: ReportStatus = useMemo(() => {
    const raw = (report?.status ?? 'submitted').toLowerCase();

    if (raw === 'approved') return 'approved';
    if (raw === 'rejected') return 'rejected';
    if (raw === 'draft') return 'draft';

    return 'submitted';
  }, [report?.status]);

  const summary: Summary = useMemo(() => {
    const r = report as ReportWithSigner | null;

    const id = r?.id ?? reportId ?? '—';

    // Top line in "Location" card should be Project ID (prefer report.project),
    // fallback to report.location if backend still uses that field.
    const projectLine = (r?.project ?? r?.location ?? '—').toString();

    // Second line should be Apartment/Room from inspection
    const aptRoomLine = formatAptRoomLine(r);

    // Component is optional
    const componentLine = r?.inspection?.componentId?.trim() || '—';

    // Contractor: prefer name+company (new fields), fallback to old contractor string
    const contractorLine = formatContractorDisplay(r);

    const createdLine = r?.createdAt
      ? new Date(r.createdAt).toLocaleString()
      : '—';

    return {
      id,
      title: 'Inspection Report',
      status: uiStatus,
      meta: {
        location: {
          id: projectLine,
          detail: aptRoomLine,
        },
        component: componentLine,
        contractor: contractorLine,
        created: createdLine,
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

    const contractorDisplay = formatContractorDisplay(
      report as ReportWithSigner | null
    );

    return [
      {
        author: contractorDisplay || 'Worker',
        timestamp: report.createdAt
          ? new Date(report.createdAt).toLocaleString()
          : '',
        text,
      },
    ];
  }, [report]);

  if (!isLoading && (notFound || error) && !report) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-5xl px-6 py-8">
          <div className="mb-6">
            <Link
              to={backTo}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <span aria-hidden>←</span>
              {backLabel}
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
        <div className="mb-6">
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <span aria-hidden>←</span>
            {backLabel}
          </Link>
        </div>

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">
                Loading report…
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {approveError && (
                  <div className="rounded-lg border bg-red-50 px-4 py-3 text-sm text-red-700">
                    {approveError}
                  </div>
                )}

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

                  <div className="flex items-center gap-3">
                    <span
                      className={[
                        'inline-flex items-center rounded-full border px-3 py-1 text-xs',
                        statusPillClass(summary.status),
                      ].join(' ')}>
                      {summary.status}
                    </span>

                    {isManagerContext && summary.status === 'submitted' && (
                      <button
                        type="button"
                        onClick={onApprove}
                        disabled={isApproving || isLoading}
                        className={[
                          'inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium',
                          'bg-white hover:bg-slate-50',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                        ].join(' ')}>
                        {isApproving ? 'Approving…' : 'Approve'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border bg-white px-4 py-3">
                    <div className="text-xs text-muted-foreground">
                      Location
                    </div>
                    <div className="mt-1 text-sm font-medium">
                      {summary.meta.location.id}
                    </div>
                    {summary.meta.location.detail ? (
                      <div className="text-sm text-slate-600">
                        {summary.meta.location.detail}
                      </div>
                    ) : null}
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

        <BlockchainVerificationCard report={report} />
      </div>
    </main>
  );
}
