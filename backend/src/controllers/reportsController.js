const {
  createReport: createReportInDb,
  listReports: listReportsFromDb,
  listReportsByContractor,
  getReportById: getReportByIdFromDb,
} = require('../repositories/reportRepository');

async function listReports(_req, res) {
  try {
    const reports = await listReportsFromDb();
    return res.status(200).json(reports);
  } catch (err) {
    console.error('[reportsController] listReports failed', err);
    return res.status(500).json({ message: 'Failed to list reports' });
  }
}

async function getReportById(req, res) {
  try {
    const { id } = req.params;
    const report = await getReportByIdFromDb(id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    return res.status(200).json(report);
  } catch (err) {
    console.error('[reportsController] getReportById failed', err);
    return res.status(500).json({ message: 'Failed to get report' });
  }
}

async function createReport(req, res) {
  try {
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

    // Enkel id-generator för mock (ersätts senare om ni vill)
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

    await createReportInDb(newReport);
    return res.status(201).json(newReport);
  } catch (err) {
    console.error('[reportsController] createReport failed', err);
    return res.status(500).json({ message: 'Failed to create report' });
  }
}

async function listMyReports(_req, res) {
  try {
    const mine = await listReportsByContractor('Worker');
    return res.status(200).json(mine);
  } catch (err) {
    console.error('[reportsController] listMyReports failed', err);
    return res.status(500).json({ message: 'Failed to list my reports' });
  }
}

module.exports = {
  listReports,
  getReportById,
  createReport,
  listMyReports,
};
