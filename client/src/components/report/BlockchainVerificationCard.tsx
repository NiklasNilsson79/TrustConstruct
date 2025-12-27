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

function networkLabelFromReport(report: ReportDto | null): string {
  const chainId = report?.onChain?.chainId;
  const network = report?.onChain?.network;

  if (network) {
    // Ex: "sepolia" -> "Sepolia"
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
  const [reportHash, setReportHash] = useState<string | null>(null);
  const [submitter, setSubmitter] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stableKey = report?.id ?? null;

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);
      setSubmitter(null);
      setTimestamp(null);
      setLastChecked(null);

      if (!report) {
        setReportHash(null);
        setStatus('Pending');
        return;
      }

      // Prefer server-provided reportHash if it exists (it SHOULD, per your console log)
      const hash = report.reportHash ?? null;
      setReportHash(hash);

      // 1) MongoDB/Backend is source of truth: onChain.confirmed => Verified
      const oc = report.onChain;
      if (oc?.registered === true && oc.status === 'confirmed') {
        setStatus('Verified');
        setSubmitter(oc.submitter ?? null);

        // If backend later adds timestamp to onChain, you can set it here.
        // For now we keep it blank unless verify gives it.
        setLastChecked(new Date());
        return;
      }

      // 2) If not confirmed, try verify endpoint (only if we have a hash)
      if (!hash) {
        setStatus('Pending');
        setLastChecked(new Date());
        return;
      }

      setIsLoading(true);

      try {
        const verify = await getJson<ChainVerifyResponse>(
          `/api/chain/verify/${hash}`
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
        setStatus(verify.isRegistered ? 'Verified' : 'Pending');
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
  }, [stableKey, report]);

  const registeredAtText = timestamp
    ? new Date(timestamp * 1000).toLocaleString()
    : '—';

  const lastCheckedText = lastChecked ? lastChecked.toLocaleString() : '—';

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
            <div className="text-xs text-muted-foreground">On-chain hash</div>
            <div className="rounded-md border bg-white/70 px-3 py-2 font-mono text-xs break-all">
              {reportHash ?? '—'}
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
