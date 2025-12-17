import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { LogoutButton } from '../auth/LogoutButton';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

type CheckValue = 'OK' | 'NOT_OK' | 'NA';

type ChecklistItem = {
  key: string;
  label: string;
};

const CHECKLIST: ChecklistItem[] = [
  { key: 'surface_preparation', label: 'Surface preparation complete' },
  { key: 'materials_spec', label: 'Materials meet specifications' },
  { key: 'per_drawings', label: 'Work performed per drawings' },
  { key: 'quality_standards', label: 'Quality standards met' },
  { key: 'safety_requirements', label: 'Safety requirements followed' },
  { key: 'cleanup_completed', label: 'Clean-up completed' },
];

function choiceClass(active: boolean, tone: 'ok' | 'bad' | 'na') {
  const base = 'border px-3 py-2 text-xs rounded-md transition-colors';

  if (!active) {
    return `${base} bg-white text-slate-700 border-slate-200 hover:bg-slate-50`;
  }

  if (tone === 'ok')
    return `${base} bg-green-50 text-green-700 border-green-200`;
  if (tone === 'bad') return `${base} bg-red-50 text-red-700 border-red-200`;

  return `${base} bg-slate-100 text-slate-700 border-slate-200`;
}

export default function WorkerHomePage() {
  const navigate = useNavigate();

  const [projectId, setProjectId] = React.useState('');
  const [apartmentId, setApartmentId] = React.useState('');
  const [roomId, setRoomId] = React.useState('');
  const [componentId, setComponentId] = React.useState('');

  const [checks, setChecks] = React.useState<Record<string, CheckValue>>(() => {
    const init: Record<string, CheckValue> = {};
    for (const item of CHECKLIST) init[item.key] = 'NA';
    return init;
  });

  const [comments, setComments] = React.useState('');
  const [photoUrl, setPhotoUrl] = React.useState('');

  const [submitting, setSubmitting] = React.useState(false);

  function setCheck(key: string, value: CheckValue) {
    setChecks((prev) => ({ ...prev, [key]: value }));
  }

  const canSubmit =
    projectId.trim().length > 0 &&
    roomId.trim().length > 0 &&
    componentId.trim().length > 0 &&
    !submitting;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);

    // Mock submit (ersätt med API senare)
    await new Promise((r) => setTimeout(r, 600));

    navigate('/worker/reports', { replace: true });
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Create Inspection Report
            </h1>
            <p className="text-sm text-muted-foreground">
              Complete the form below to submit a new quality control inspection
              report.
            </p>
          </div>

          <LogoutButton />
        </header>

        <form onSubmit={onSubmit} className="grid gap-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-medium">Project Information</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project ID</label>
                  <Input
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="e.g., PROJ-2024-001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Apartment ID</label>
                  <Input
                    value={apartmentId}
                    onChange={(e) => setApartmentId(e.target.value)}
                    placeholder="e.g., APT-A12"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Room ID</label>
                  <Input
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="e.g., ROOM-101"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Component ID</label>
                  <Input
                    value={componentId}
                    onChange={(e) => setComponentId(e.target.value)}
                    placeholder="e.g., COMP-WALL-01"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-medium">Inspection Checklist</h2>

              <div className="grid gap-3">
                {CHECKLIST.map((item) => {
                  const value = checks[item.key];

                  return (
                    <div
                      key={item.key}
                      className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm">{item.label}</div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className={choiceClass(value === 'OK', 'ok')}
                          onClick={() => setCheck(item.key, 'OK')}>
                          OK
                        </button>

                        <button
                          type="button"
                          className={choiceClass(value === 'NOT_OK', 'bad')}
                          onClick={() => setCheck(item.key, 'NOT_OK')}>
                          Not OK
                        </button>

                        <button
                          type="button"
                          className={choiceClass(value === 'NA', 'na')}
                          onClick={() => setCheck(item.key, 'NA')}>
                          N/A
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-medium">Additional Details</h2>

              <div className="space-y-2">
                <label className="text-sm font-medium">Comments</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add any additional notes or observations..."
                  className="min-h-[120px] w-full rounded-md border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Photo URL (optional)
                </label>
                <Input
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  Enter a URL to an existing photo. File upload can be added
                  later.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/worker/reports')}>
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={!canSubmit}
              loading={submitting}>
              Submit Report
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
