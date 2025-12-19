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

function createReport(req, res) {
  const {
    projectId,
    apartmentId,
    roomId,
    componentId,
    checklist,
    comments,
    photoUrl,
  } = req.body || {};

  // Minimal validation (kan skärpas senare)
  if (!projectId || !roomId || !componentId || !checklist) {
    return res.status(400).json({
      message:
        'Missing required fields (projectId, roomId, componentId, checklist)',
    });
  }

  // Enkel id-generator för mock (ersätts av DB senare)
  const id = `RPT-${Math.floor(Math.random() * 900 + 100)}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

  const location = `${apartmentId ? apartmentId : 'APT-UNKNOWN'} / ${roomId}`;

  // Om ni har auth senare kan ni byta till req.user.name
  const contractor = 'Worker';

  const newReport = {
    id,
    status: 'submitted',
    project: projectId,
    location,
    contractor,
    createdAt: new Date().toISOString(),

    inspection: {
      projectId,
      apartmentId,
      roomId,
      componentId,
      checklist,
      comments,
      photoUrl,
    },
  };

  // In-memory insert
  REPORTS.unshift(newReport);

  return res.status(201).json(newReport);
}

module.exports = {
  listReports,
  getReportById,
  createReport,
};
