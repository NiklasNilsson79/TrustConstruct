import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../Card';
import type { ReportDto } from '../../reports/reportService';

type ChainVerifyResponse = {
  ok: boolean;
  isRegistered: boolean;
  submitter?: string;
  timestamp?: number; // seconds since epoch
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

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `HTTP ${res.status} ${res.statusText}${text ? ` — ${text}` : ''}`
    );
  }
  return res.json();
}

function normalizeHexHash(hash: string): string {
  const h = hash.trim();
  return h.startsWith('0x') ? h : `0x${h}`;
}

function isTxHash(hash?: string | null): boolean {
  return typeof hash === 'string' && hash.startsWith('0x') && hash.length > 10;
}

function networkLabelFromReport(report: ReportDto | null): string {
  const chainId = report?.onChain?.chainId;
  const network = report?.onChain?.network;

  if (network) {
    return network.charAt(0).toUpperCase() + network.slice(1);
  }
  if (chainId === 11155111) return 'Sepolia';
  if (chainId === 31337) return 'Local (Anvil)';
  if (chainId) return `Chain ID ${chainId}`;
  return '—';
}

export default function BlockchainVerificationCard({ report }: Props) {
  const [status, setStatus] = useState<UiStatus>('Pending');
  const [isLoading, setIsLoading] = useState(false);
  const [submitter, setSubmitter] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stableKey = report?.id ?? null;

  const reportHash = report?.reportHash ?? null;
  const txHash = report?.onChain?.txHash ?? null;

  const isApproved = report?.status === 'approved';
  const hasTxHash = isTxHash(txHash);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);
      setSubmitter(null);
      setTimestamp(null);
      setLastChecked(null);

      if (!report) {
        setStatus('Pending');
        return;
      }

      // 🔒 HARD RULE: submitted reports are NEVER verified
      if (!isApproved) {
        setStatus('Pending');
        setLastChecked(new Date());
        return;
      }

      // ✅ Local truth: confirmed + txHash
      const oc = report.onChain;
      if (oc?.status === 'confirmed' && hasTxHash) {
        setStatus('Verified');
        setLastChecked(new Date());

        // Best-effort: fetch metadata (submitter + timestamp) for the UI.
        // This must NOT affect Verified/Pending decision.
        if (reportHash) {
          setIsLoading(true);
          try {
            const normalized = normalizeHexHash(reportHash);
            const verify = await getJson<ChainVerifyResponse>(
              `/api/chain/verify/${encodeURIComponent(normalized)}`
            );

            if (!cancelled && verify?.ok) {
              setSubmitter(verify.submitter ?? null);
              setTimestamp(verify.timestamp ?? null);
            }
          } catch {
            // ignore metadata fetch errors; keep Verified UI
          } finally {
            if (!cancelled) setIsLoading(false);
          }
        }

        return;
      }

      // 🔍 Only now do we verify on-chain (approved only)
      if (!reportHash) {
        setStatus('Pending');
        setLastChecked(new Date());
        return;
      }

      setIsLoading(true);

      try {
        const normalized = normalizeHexHash(reportHash);
        const verify = await getJson<ChainVerifyResponse>(
          `/api/chain/verify/${encodeURIComponent(normalized)}`
        );

        if (cancelled) return;

        setLastChecked(new Date());

        if (!verify.ok) {
          setStatus('Error');
          setError('Chain verification failed.');
          return;
        }

        setSubmitter(verify.submitter ?? null);
        setTimestamp(verify.timestamp ?? null);
        setStatus(verify.isRegistered && hasTxHash ? 'Verified' : 'Pending');
      } catch (err) {
        if (cancelled) return;
        setStatus('Error');
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [stableKey, report, isApproved, hasTxHash, reportHash]);

  const registeredAtText = timestamp
    ? new Date(timestamp * 1000).toLocaleString()
    : '—';

  const lastCheckedText = lastChecked ? lastChecked.toLocaleString() : '—';

  const hashLabel =
    status === 'Verified' ? 'Transaction hash' : 'Report hash (off-chain)';
  const hashValue = status === 'Verified' ? txHash : reportHash;

  return (
    <Card className={['mt-6', cardTone(status)].join(' ')}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Blockchain Verification</CardTitle>
            <CardDescription>
              Verifies whether this report is registered on-chain.
            </CardDescription>
          </div>

          <span
            className={[
              'inline-flex items-center rounded-full border px-3 py-1 text-xs',
              badgeTone(status),
            ].join(' ')}>
            {isLoading ? 'Checking…' : status}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-xs text-muted-foreground">{hashLabel}</div>
            <div className="rounded-md border bg-white/70 px-3 py-2 font-mono text-xs break-all">
              {hashValue ?? '—'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Last checked: {lastCheckedText}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border bg-white/70 px-4 py-3">
              <div className="text-xs text-muted-foreground">Network</div>
              <div className="mt-1 text-sm font-medium">
                {networkLabelFromReport(report)}
              </div>
            </div>

            <div className="rounded-lg border bg-white/70 px-4 py-3">
              <div className="text-xs text-muted-foreground">Submitter</div>
              {submitter ? (
                <div className="mt-1 font-mono text-xs break-all">
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
              {error}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
