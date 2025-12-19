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

export async function getReportById(reportId: string): Promise<ReportDto> {
  const token = getToken();

  const res = await fetch(`/api/reports/${encodeURIComponent(reportId)}`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
