const {
  createReport: createReportInDb,
  listReports: listReportsFromDb,
  listReportsByContractor,
  getReportById: getReportByIdFromDb,
  updateReportStatus,
} = require('../repositories/reportRepository');

const { hasIssuesFromChecklist } = require('../utils/hasIssuesFromChecklist');
const { hashReport } = require('../utils/hashReport');
const { registerReportOnChain } = require('../services/reportRegistryService');

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
    // reportRoutes.js använder nu '/:reportId'
    const { reportId } = req.params || {};

    if (!reportId) {
      return res.status(400).json({ message: 'Missing reportId' });
    }

    const report = await getReportByIdFromDb(reportId);

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
    const body = req.body || {};

    // Incoming from UI (worker-flow)
    const projectId = body.projectId ?? body.project ?? '';
    const apartmentId = body.apartmentId ?? '';
    const roomId = body.roomId ?? '';
    const componentId = body.componentId ?? '';
    const checklist = body.checklist ?? body.inspection?.checklist;
    const comments = body.comments;
    const photoUrl = body.photoUrl;

    // Minimal validation – just enough to avoid garbage
    if (!projectId || !roomId || !componentId || !checklist) {
      return res.status(400).json({
        message:
          'Missing required fields (projectId, roomId, componentId, checklist)',
      });
    }

    // Determine issues (supports checklist-object: { x: "OK"/"NOT OK" })
    const hasIssues = hasIssuesFromChecklist(checklist);
    console.log('[createReport] hasIssues =', hasIssues);

    // Status rule:
    // - all OK => approved
    // - any NOT OK => submitted (pending)
    const autoStatus = hasIssues ? 'submitted' : 'approved';
    const status = body.status ?? autoStatus;

    // Build required schema fields
    const project = projectId;

    // required: location (schema)
    const location =
      body.location ??
      [
        apartmentId ? `Apt ${apartmentId}` : null,
        roomId ? `Room ${roomId}` : null,
        componentId ? `Component ${componentId}` : null,
      ]
        .filter(Boolean)
        .join(' | ');

    // required: contractor (schema)
    // later: replace with req.user.name when auth is wired in
    const contractor = body.contractor ?? 'Worker';

    // required: createdAt (schema) – keep stable once created
    const createdAt = body.createdAt ?? new Date().toISOString();

    // IMPORTANT: define inspection BEFORE hashing (fixes your ReferenceError)
    const inspection = body.inspection ?? {
      projectId,
      apartmentId,
      roomId,
      componentId,
      checklist,
      comments,
      photoUrl,
    };

    // Deterministic hash from canonical report shape (same utility as hash endpoint)
    // Do NOT include Mongo _id or volatile fields. Include createdAt because it becomes part of the report record.
    const sourceForHash = {
      id: body.id, // optional (may be undefined; that's fine)
      status,
      project,
      location,
      contractor,
      createdAt,
      inspection,
    };

    const { hash: reportHash } = hashReport(sourceForHash);

    // Build DB document. id is optional (model will generate if missing).
    const newReport = {
      id: body.id,
      status,
      project,
      location,
      contractor,
      createdAt,
      inspection,
      reportHash,
      onChain: {
        registered: false,
      },
    };

    // Persist to Mongo
    const created = await createReportInDb(newReport);

    // Auto-register on-chain ONLY for approved (all OK)
    if (status === 'approved') {
      try {
        const tx = await registerReportOnChain(reportHash);

        created.onChain = {
          registered: true,
          txHash: tx.txHash,
          blockNumber: tx.blockNumber,
        };

        await created.save();
      } catch (err) {
        console.error('[createReport] on-chain register failed', err);

        // Fail-safe: degrade to submitted so manager can handle it
        created.status = 'submitted';
        created.chainError = String(err?.message || err);
        created.onChain = { registered: false };

        await created.save();
      }
    }

    return res.status(201).json(created);
  } catch (err) {
    console.error('[reportsController] createReport failed', err);
    return res.status(500).json({ message: 'Failed to create report' });
  }
}

async function listMyReports(_req, res) {
  try {
    // Later: use req.user.name/contractor
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
