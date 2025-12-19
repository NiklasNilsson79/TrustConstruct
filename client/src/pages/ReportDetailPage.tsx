import { Link, useParams } from 'react-router-dom';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../components/Card';
import { type ReportStatus } from '../components/StatusBadge';

type SummaryMeta = {
  location: { id: string; detail: string };
  component: string;
  contractor: string;
  created: string;
};

export default function ReportDetailPage() {
  const { reportId } = useParams();

  // UI-only mock (bygger på Lovable-layouten)
  const status: ReportStatus = 'submitted';

  const summary = {
    id: reportId ?? 'RPT-006-UVWX',
    title: 'Inspection Report',
    status,
    meta: {
      location: { id: '2652765', detail: 'AP-2110 / Room 102-3' },
      component: 'Bathroom',
      contractor: 'John Worker',
      created: 'December 9, 2025 at 03:32 PM',
    } satisfies SummaryMeta,
  };

  const checklist = [
    { label: 'Surface preparation complete', result: 'Ok' },
    { label: 'Materials meet specifications', result: 'Ok' },
    { label: 'Work performed per drawings', result: 'Ok' },
    { label: 'Quality standards met', result: 'Ok' },
    { label: 'Safety requirements followed', result: 'Ok' },
    { label: 'Clean-up completed', result: 'Ok' },
  ];

  // Blockchain mock (UI-only)
  const chain = {
    verified: true,
    onChainHash:
      '0x1c8ebfef2c9a4d1e8a7b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9151eba238',
    blockNumber: '18235567',
    anchoredBy: '0x742d35cc6634c0532925a3b844bc454e4438f44e',
    anchoredAt: '09/12/2025, 15:32:21',
    txHash:
      '0x80bd236e4b5cd1ca4f2cf5ad5a74f6d19c304d0e433712337054b8c274bfa654',
  };

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

        {/* SUMMARY CARD (som Lovable) */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6">
              {/* Header row */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted border">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-foreground"
                      aria-hidden="true">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                      <path d="M8 13h8" />
                      <path d="M8 17h8" />
                    </svg>
                  </div>

                  <div>
                    <div className="text-xl font-semibold tracking-tight">
                      {summary.id}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {summary.title}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <InlineStatusPill status={summary.status} />
                </div>
              </div>

              {/* Meta row */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <MetaItem
                  icon="pin"
                  label="Location"
                  primary={summary.meta.location.id}
                  secondary={summary.meta.location.detail}
                />
                <MetaItem
                  icon="component"
                  label="Component"
                  primary={summary.meta.component}
                />
                <MetaItem
                  icon="user"
                  label="Contractor"
                  primary={summary.meta.contractor}
                />
                <MetaItem
                  icon="calendar"
                  label="Created"
                  primary={summary.meta.created}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CHECKLIST */}
        <Card className="mt-6">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CircleCheckIcon />
              <div>
                <CardTitle className="text-base">
                  Inspection Checklist
                </CardTitle>
                <CardDescription>
                  Review the checklist items for this report.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {checklist.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                  <div className="text-sm font-medium text-foreground">
                    {item.label}
                  </div>

                  <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 text-xs border">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border bg-background">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    {item.result}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* COMMENTS */}
        <Card className="mt-6">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CommentIcon />
              <div>
                <CardTitle className="text-base">Comments</CardTitle>
                <CardDescription>
                  Reviewer notes and discussion.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="rounded-lg bg-muted/40 px-4 py-3 text-sm text-foreground">
              Wall 2 cm off from drawings
            </div>
          </CardContent>
        </Card>

        {/* BLOCKCHAIN VERIFICATION (Lovable-like + lighter green) */}
        <div className="mt-8">
          <div className="mb-3 text-sm font-semibold text-foreground">
            Blockchain Verification
          </div>

          <div className="rounded-xl border border-emerald-600/20 bg-emerald-500/10 p-6">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background border border-emerald-600/20">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-emerald-700"
                  aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>

              <div className="flex-1">
                <div className="font-semibold text-foreground">
                  {chain.verified ? 'Blockchain Verified' : 'Not Verified'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {chain.verified
                    ? 'This report matches the on-chain reference.'
                    : 'This report does not match the on-chain reference.'}
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="mt-5 space-y-4">
              {/* On-chain hash: input-like monospace + truncation + copy */}
              <InputLikeHashRow
                label="On-Chain Hash"
                value={chain.onChainHash}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <SoftField label="Block Number" value={chain.blockNumber} />
                <SoftField label="Anchored By" value={chain.anchoredBy} />
                <SoftField label="Anchored At" value={chain.anchoredAt} />
              </div>

              {/* Transaction hash also input-like */}
              <InputLikeHashRow label="Transaction Hash" value={chain.txHash} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ---------- Small UI helpers ---------- */

function InlineStatusPill({ status }: { status: ReportStatus }) {
  const label =
    status === 'approved'
      ? 'Verified'
      : status === 'submitted'
      ? 'Submitted'
      : status === 'draft'
      ? 'Draft'
      : 'Rejected';

  const isVerified = status === 'approved';

  const classes =
    status === 'approved'
      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700'
      : status === 'submitted'
      ? 'border-sky-500/20 bg-sky-500/10 text-sky-700'
      : status === 'draft'
      ? 'border-slate-200 bg-slate-50 text-slate-700'
      : 'border-red-500/20 bg-red-500/10 text-red-700';

  return (
    <span
      className={[
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium',
        classes,
      ].join(' ')}>
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-background/60 border">
        {isVerified ? (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <span className="block h-1.5 w-1.5 rounded-full bg-current opacity-60" />
        )}
      </span>
      {label}
    </span>
  );
}

function MetaItem({
  icon,
  label,
  primary,
  secondary,
}: {
  icon: 'pin' | 'component' | 'user' | 'calendar';
  label: string;
  primary: string;
  secondary?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-background px-4 py-3">
      <div className="mt-0.5 text-muted-foreground">{metaIcon(icon)}</div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-1 text-sm font-medium text-foreground truncate">
          {primary}
        </div>
        {secondary ? (
          <div className="text-xs text-muted-foreground truncate">
            {secondary}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SoftField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-emerald-600/15 bg-background/70 px-4 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium text-foreground break-all">
        {value}
      </div>
    </div>
  );
}

function InputLikeHashRow({ label, value }: { label: string; value: string }) {
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // no-op
    }
  };

  return (
    <div className="rounded-lg border border-emerald-600/15 bg-background/70 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">{label}</div>

        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-2 rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
          aria-label={`Copy ${label}`}
          title={`Copy ${label}`}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy
        </button>
      </div>

      {/* “Input-like” row */}
      <div className="mt-2 flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2">
        <div className="min-w-0 font-mono text-xs text-foreground truncate">
          {value}
        </div>
        <div className="shrink-0 text-xs text-muted-foreground">hash</div>
      </div>
    </div>
  );
}

function CircleCheckIcon() {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-muted border">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="text-foreground">
        <circle cx="12" cy="12" r="10" />
        <path d="M16 8l-5 8-3-3" />
      </svg>
    </span>
  );
}

function CommentIcon() {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-muted border">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="text-foreground">
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      </svg>
    </span>
  );
}

function metaIcon(kind: 'pin' | 'component' | 'user' | 'calendar') {
  switch (kind) {
    case 'pin':
      return (
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
          <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case 'component':
      return (
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
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 7h8" />
          <path d="M8 11h8" />
        </svg>
      );
    case 'user':
      return (
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
          <path d="M20 21a8 8 0 0 0-16 0" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case 'calendar':
      return (
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
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4" />
          <path d="M8 2v4" />
          <path d="M3 10h18" />
        </svg>
      );
  }
}
