import React from 'react';
import { Link, useParams } from 'react-router-dom';

type ReportStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

function StatusBadge({ status }: { status: ReportStatus }) {
  const labelMap: Record<ReportStatus, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    approved: 'Approved',
    rejected: 'Rejected',
  };

  // Ljus UI: subtila badges, inte “mörka pill”
  const classMap: Record<ReportStatus, string> = {
    draft: 'bg-muted text-muted-foreground border border-border',
    submitted: 'bg-primary/10 text-primary border border-primary/20',
    approved: 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-700 border border-red-500/20',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${classMap[status]}`}>
      {labelMap[status]}
    </span>
  );
}

function Card({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {right}
      </div>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background px-4 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

export default function ReportDetailPage() {
  const { reportId } = useParams();

  // Mockad data (UI först)
  const report = {
    id: reportId ?? 'unknown',
    status: 'submitted' as ReportStatus,
    createdAt: '2025-12-17',
    site: 'Site A',
    inspector: 'Worker 12',
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        {/* Top row */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <Link
              to="/reports"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm hover:bg-muted">
              <span aria-hidden>←</span>
              Back to Reports
            </Link>

            <div className="mt-4">
              <h1 className="text-2xl font-semibold text-foreground">
                Report Detail
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Review the report summary, checklist, comments, and
                verification.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Report ID:</span>{' '}
              {report.id}
            </div>
            <StatusBadge status={report.status} />
          </div>
        </div>

        {/* Cards stack */}
        <div className="flex flex-col gap-6">
          <Card title="Report Summary">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Created" value={report.createdAt} />
              <Field label="Site" value={report.site} />
              <Field label="Inspector" value={report.inspector} />
              <Field label="Status" value={report.status.toUpperCase()} />
            </div>
          </Card>

          <Card title="Inspection Checklist (mock)">
            <ul className="space-y-3">
              {[
                'Emergency exits clear',
                'Fire extinguishers accessible',
                'Electrical hazards',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
                  <span className="text-sm text-foreground">{item}</span>
                  <span className="text-sm text-muted-foreground">Pending</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Comments (mock)">
            <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-4 text-sm text-muted-foreground">
              No comments yet.
            </div>
          </Card>

          <Card title="Blockchain Verification (mock)">
            <div className="rounded-lg border border-border bg-background px-4 py-4">
              <div className="text-xs text-muted-foreground">Verification</div>
              <div className="mt-1 text-sm text-foreground">
                Not connected (UI placeholder)
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
