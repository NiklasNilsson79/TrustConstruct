// client/src/reports/reportService.ts
import { getToken } from '../auth/authStore';

export type ReportDto = {
  id: string;
  status: string;
  project?: string;
  location?: string;
  contractor?: string;
  inspector?: string;
  createdAt?: string;
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
