import { useEffect, useMemo, useState } from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../Card';
import { type ReportDto } from '../../reports/reportService';

type ChainVerifyResponse = {
  ok: boolean;
  isRegistered: boolean;
  submitter?: string;
  timestamp?: number;
};

type Props = {
  report: ReportDto | null;
};

type UiStatus = 'Verified' | 'Pending' | 'Error';

function cardTone(status: UiStatus) {
  if (status === 'Verified') return 'border-green-200 bg-green-50/60';
  if (status === 'Pending') return 'border-amber-200 bg-amber-50/60';
  return 'border-red-200 bg-red-50/60';
}

function badgeTone(status: UiStatus) {
  if (status === 'Verified')
    return 'bg-green-50 text-green-700 border-green-200';
  if (status === 'Pending')
    return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-700 border-red-200';
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `HTTP ${res.status} ${res.statusText}${text ? ` — ${text}` : ''}`
    );
  }

  return (await res.json()) as T;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `HTTP ${res.status} ${res.statusText}${text ? ` — ${text}` : ''}`
    );
  }

  return (await res.json()) as T;
}

/**
 * Tries both payload shapes because different backends implement /api/reports/hash differently:
 * 1) { report: <ReportDto> }
 * 2) <ReportDto> directly
 */
async function calculateReportHash(report: ReportDto): Promise<string> {
  // Attempt 1: { report }
  try {
    const r1 = await postJson<{
      ok?: boolean;
      reportHash?: string;
      hash?: string;
    }>('/api/reports/hash', { report });
    const h1 = r1.reportHash ?? r1.hash;
    if (h1) return h1;
  } catch {
    // ignore and try alternate shape
  }

  // Attempt 2: report directly
  const r2 = await postJson<{
    ok?: boolean;
    reportHash?: string;
    hash?: string;
  }>('/api/reports/hash', report);

  const h2 = r2.reportHash ?? r2.hash;
  if (!h2) throw new Error('Hash endpoint returned no hash/reportHash.');
  return h2;
}

export default function BlockchainVerificationCard({ report }: Props) {
  const [reportHash, setReportHash] = useState<string | null>(null);
  const [status, setStatus] = useState<UiStatus>('Pending');
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [submitter, setSubmitter] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Recompute + reverify whenever a different report is shown
  const stableKey = useMemo(() => report?.id ?? null, [report?.id]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);
      setSubmitter(null);
      setTimestamp(null);
      setLastChecked(null);
      setReportHash(null);

      if (!report) {
        setStatus('Pending');
        return;
      }

      setIsLoading(true);

      try {
        const hash = await calculateReportHash(report);
        if (cancelled) return;

        setReportHash(hash);

        const verify = await getJson<ChainVerifyResponse>(
          `/api/chain/verify/${hash}`
        );
        if (cancelled) return;

        setLastChecked(new Date());

        if (!verify?.ok) {
          setStatus('Error');
          setError('Chain verify returned ok=false.');
          return;
        }

        setSubmitter(verify.submitter ?? null);
        setTimestamp(
          typeof verify.timestamp === 'number' ? verify.timestamp : null
        );

        setStatus(verify.isRegistered ? 'Verified' : 'Pending');
      } catch (e) {
        if (cancelled) return;

        const msg = e instanceof Error ? e.message : 'Unknown error';
        setStatus('Error');
        setError(msg);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [stableKey, report]);

  const lastCheckedText = useMemo(() => {
    if (!lastChecked) return '—';
    return lastChecked.toLocaleString();
  }, [lastChecked]);

  const registeredAtText = useMemo(() => {
    if (!timestamp) return '—';
    // backend timestamp is seconds since epoch
    return new Date(timestamp * 1000).toLocaleString();
  }, [timestamp]);

  return (
    <Card className={['mt-6', cardTone(status)].join(' ')}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Blockchain Verification</CardTitle>
            <CardDescription>
              Verifies whether this report hash is registered on-chain.
            </CardDescription>
          </div>

          <span
            className={[
              'inline-flex items-center rounded-full border px-3 py-1 text-xs',
              badgeTone(status),
            ].join(' ')}
            title={error ?? undefined}>
            {isLoading ? 'Checking…' : status}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">On-Chain Hash</div>

            <div className="rounded-md border bg-white/70 px-3 py-2 font-mono text-xs text-slate-800 break-all">
              {reportHash ?? (isLoading ? 'Calculating hash…' : '—')}
            </div>

            <div className="text-xs text-muted-foreground">
              Last checked: {lastCheckedText}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border bg-white/70 px-4 py-3">
              <div className="text-xs text-muted-foreground">Network</div>
              <div className="mt-1 text-sm font-medium">Local (Anvil)</div>
            </div>

            <div className="rounded-lg border bg-white/70 px-4 py-3">
              <div className="text-xs text-muted-foreground">Submitter</div>

              {submitter ? (
                <div className="mt-1 font-mono text-xs break-all leading-relaxed">
                  {submitter}
                </div>
              ) : (
                <div className="mt-1 text-sm font-medium">—</div>
              )}
            </div>

            <div className="rounded-lg border bg-white/70 px-4 py-3">
              <div className="text-xs text-muted-foreground">Registered at</div>
              <div className="mt-1 text-sm font-medium">{registeredAtText}</div>
            </div>
          </div>

          {status === 'Error' && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error ?? 'Verification failed.'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
