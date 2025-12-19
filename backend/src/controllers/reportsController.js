const REPORTS = [
  {
    id: 'RPT-006-UVWX',
    status: 'submitted',
    project: 'PROJ-2024-002',
    location: 'APT-B08 / ROOM-202',
    contractor: 'David Smith',
    createdAt: new Date('2024-01-20T10:00:00Z').toISOString(),
  },
  {
    id: 'RPT-005-QRST',
    status: 'approved',
    project: 'PROJ-2024-003',
    location: 'APT-C01 / ROOM-301',
    contractor: 'James Wilson',
    createdAt: new Date('2024-01-19T10:00:00Z').toISOString(),
  },
  {
    id: 'RPT-004-MNOP',
    status: 'rejected',
    project: 'PROJ-2024-001',
    location: 'APT-A15 / ROOM-103',
    contractor: 'Michael Johnson',
    createdAt: new Date('2024-01-18T10:00:00Z').toISOString(),
  },
];

function listReports(_req, res) {
  res.status(200).json(REPORTS);
}

function getReportById(req, res) {
  const { id } = req.params;
  const report = REPORTS.find((r) => r.id === id);

  if (!report) {
    return res.status(404).json({ message: 'Report not found' });
  }

  return res.status(200).json(report);
}

module.exports = {
  listReports,
  getReportById,
};
