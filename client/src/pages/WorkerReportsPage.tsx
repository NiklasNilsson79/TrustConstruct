import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';

type ReportStatus = 'Verified' | 'Pending' | 'Mismatch';

type ReportRow = {
  id: string;
  project: string;
  room: string;
  date: string; // display string for now
  status: ReportStatus;
};

const MOCK_REPORTS: ReportRow[] = [
  {
    id: 'RPT-MJ9XRYF0-C8VK',
    project: 'PROJ-2024-001',
    room: 'ROOM-204',
    date: 'Dec 17, 2025',
    status: 'Verified',
  },
  {
    id: 'RPT-006-UVWX',
    project: 'PROJ-2024-002',
    room: 'ROOM-202',
    date: 'Jan 20, 2024',
    status: 'Pending',
  },
  {
    id: 'RPT-005-QRST',
    project: 'PROJ-2024-003',
    room: 'ROOM-301',
    date: 'Jan 19, 2024',
    status: 'Verified',
  },
  {
    id: 'RPT-004-MNOP',
    project: 'PROJ-2024-001',
    room: 'ROOM-103',
    date: 'Jan 18, 2024',
    status: 'Mismatch',
  },
  {
    id: 'RPT-003-IJKL',
    project: 'PROJ-2024-002',
    room: 'ROOM-201',
    date: 'Jan 17, 2024',
    status: 'Verified',
  },
  {
    id: 'RPT-002-EFGH',
    project: 'PROJ-2024-001',
    room: 'ROOM-102',
    date: 'Jan 16, 2024',
    status: 'Pending',
  },
  {
    id: 'RPT-001-ABCD',
    project: 'PROJ-2024-001',
    room: 'ROOM-101',
    date: 'Jan 15, 2024',
    status: 'Verified',
  },
];

function statusPillClass(status: ReportStatus) {
  if (status === 'Verified')
    return 'bg-green-50 text-green-700 border-green-200';
  if (status === 'Pending')
    return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-700 border-red-200';
}

export default function WorkerReportsPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              My Reports
            </h1>
            <p className="text-sm text-muted-foreground">
              View all inspection reports you&apos;ve submitted.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="primary"
              onClick={() => navigate('/worker')}>
              <span className="inline-flex items-center gap-2">
                <span className="text-lg leading-none">+</span>
                New Report
              </span>
            </Button>
          </div>
        </header>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-6 py-4 font-medium">Report ID</th>
                    <th className="px-6 py-4 font-medium">Project</th>
                    <th className="px-6 py-4 font-medium">Room</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {MOCK_REPORTS.map((r) => (
                    <tr key={r.id} className="border-t hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-medium">{r.id}</td>
                      <td className="px-6 py-4">{r.project}</td>
                      <td className="px-6 py-4 text-slate-600">{r.room}</td>
                      <td className="px-6 py-4 text-slate-600">{r.date}</td>
                      <td className="px-6 py-4">
                        <span
                          className={[
                            'inline-flex items-center rounded-full border px-3 py-1 text-xs',
                            statusPillClass(r.status),
                          ].join(' ')}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
