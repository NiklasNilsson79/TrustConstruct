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

export type ReportDto = {
  id: string;
  status: string;
  project?: string;
  location?: string;
  contractor?: string;

  // Finns i din nuvarande typ – behåll så länge den ev används i UI
  inspector?: string;

  createdAt?: string;

  // NYTT: matchar backend-response
  inspection?: ReportInspectionDto;
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
      `Failed to fetch reports (${res.status}): ${text || res.statusText}`
    );
  }

  return res.json();
}

/**
 * UI-friendly version:
 * - Returns ReportDto on success
 * - Returns null on "not found"
 * - Throws on other errors
 */
export async function getReport(reportId: string): Promise<ReportDto | null> {
  if (!reportId) return null;

  try {
    return await getReportById(reportId);
  } catch (e) {
    const message = e instanceof Error ? e.message : '';

    if (message === 'REPORT_NOT_FOUND') {
      return null;
    }

    throw e;
  }
}

/**
 * Strict version:
 * - Returns ReportDto on success
 * - Throws on all non-OK responses
 * - 404 becomes REPORT_NOT_FOUND (so UI can show "not found" cleanly)
 */
export async function getReportById(reportId: string): Promise<ReportDto> {
  const token = getToken();

  const res = await fetch(`/api/reports/${encodeURIComponent(reportId)}`, {
    method: 'GET',
    headers: {
      ...authHeaders(token),
    },
  });

  if (res.status === 404) {
    throw new Error('REPORT_NOT_FOUND');
  }

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
