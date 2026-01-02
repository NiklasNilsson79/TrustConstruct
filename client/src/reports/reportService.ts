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
 * backend payload (per console) currently uses `onChain` instead.
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
 * onChain: { registered: false, status: 'confirmed', network: 'sepolia', chainId: 11155111, registryAddress: '0x..', txHash: '0x..', blockNumber: null, submittedAt: null, confirmedAt: null, error: '' }
 */
export type OnChainDto = {
  registered?: boolean;
  status?: string; // 'confirmed' | 'failed' | ...
  network?: string;
  chainId?: number;
  registryAddress?: string;
  txHash?: string;
  blockNumber?: number | null;
  submitter?: string | null;
  submittedAt?: string | null;
  confirmedAt?: string | null;
  error?: string;
};

export type ReportDto = {
  id: string;
  status: string;
  approvedBy?: string;
  managerApprovalComment?: string;

  project?: string;
  location?: string;
  contractor?: string;

  // Present in existing types; retained for backward compatibility.
  inspector?: string;

  createdAt?: string;

  // Matchar din backend-response
  inspection?: ReportInspectionDto;

  // Server-calculated report hash
  reportHash?: string;

  //  current on-chain payload (seen in your console)
  onChain?: OnChainDto;

  // Legacy/optional – keep for now if any UI still references it
  blockchain?: BlockchainMetaDto;
};

// Small helper so we don't duplicate header logic
function authHeaders(token?: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function jsonHeaders(token?: string | null): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...authHeaders(token),
  };
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

/**
 * Update business status for a report.
 * Backend: PATCH /api/reports/:reportId/status
 * Body: { status: 'approved' | 'submitted' | ... }
 */
export async function updateReportStatus(
  reportId: string,
  statusOrPatch: string | { status: string; managerApprovalComment?: string }
) {
  const token = getToken();

  const patch =
    typeof statusOrPatch === 'string'
      ? { status: statusOrPatch }
      : statusOrPatch;

  const res = await fetch(
    `/api/reports/${encodeURIComponent(reportId)}/status`,
    {
      method: 'PATCH',
      headers: jsonHeaders(token),
      body: JSON.stringify(patch),
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
