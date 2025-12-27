// client/src/reports/reportService.ts
import { getToken } from '../auth/authStore';

export type ChecklistValue = 'OK' | 'NOT_OK' | 'NA';

export type ReportInspectionDto = {
  projectId: string;
  apartmentId?: string;
  roomId: string;
  componentId: string;
  checklist: Record<string, ChecklistValue>;
  comments?: string;
  photoUrl?: string;
};

/**
 * Legacy/optional shape (kept to avoid breaking existing code).
 * Your backend payload (per console) currently uses `onChain` instead.
 */
export type BlockchainMetaDto = {
  txHash: string;
  chainId: number;
  status: 'PENDING' | 'CONFIRMED';
  submitter?: string;
  blockNumber?: number;
  verifiedAt?: string; // ISO date
};

/**
 * Current backend payload shape (matches your console output):
 * onChain: { registered: true, status: 'confirmed', network: 'sepolia', chainId: 11155111, ... }
 */
export type OnChainDto = {
  registered: boolean;
  status: 'pending' | 'confirmed';
  network?: string;
  chainId?: number;
  registryAddress?: string;
  txHash?: string;
  submitter?: string;
  timestamp?: number; // seconds since epoch (if/when provided)
  blockNumber?: number;
  verifiedAt?: string; // ISO date (if/when provided)
};

export type ReportDto = {
  id: string;
  status: string;
  project?: string;
  location?: string;
  contractor?: string;

  // Finns i din nuvarande typ – behåll så länge den ev används i UI
  inspector?: string;

  createdAt?: string;

  // Matchar din backend-response
  inspection?: ReportInspectionDto;

  // ✅ NYTT: server-calculated hash (seen in your console)
  reportHash?: string;

  // ✅ NYTT: current on-chain payload (seen in your console)
  onChain?: OnChainDto;

  // Legacy/optional – keep for now if any UI still references it
  blockchain?: BlockchainMetaDto;
};

// Small helper so we don't duplicate header logic
function authHeaders(token?: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Fetch list of reports.
 * Backend: GET /api/reports
 */
export async function listReports(): Promise<ReportDto[]> {
  const token = getToken();

  const res = await fetch(`/api/reports`, {
    method: 'GET',
    headers: {
      ...authHeaders(token),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `Failed to list reports (${res.status}): ${text || res.statusText}`
    );
  }

  return res.json();
}

/**
 * Fetch a single report by id.
 * Backend: GET /api/reports/:id
 */
export async function getReport(reportId: string): Promise<ReportDto> {
  const token = getToken();

  const res = await fetch(`/api/reports/${encodeURIComponent(reportId)}`, {
    method: 'GET',
    headers: {
      ...authHeaders(token),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `Failed to fetch report (${res.status}): ${text || res.statusText}`
    );
  }

  return res.json();
}

export async function updateReportStatus(reportId: string, status: string) {
  const res = await fetch(
    `/api/reports/${encodeURIComponent(reportId)}/status`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }
  );

  if (!res.ok) {
    let msg = `Failed to update status (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.message) msg = data.message;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  return (await res.json()) as ReportDto;
}
