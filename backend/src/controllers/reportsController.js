const {
  createReport: createReportInDb,
  listReports: listReportsFromDb,
  listReportsByContractor,
  getReportById: getReportByIdFromDb,
  updateReportOnChain: updateReportOnChainInDb,
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
    const { reportId } = req.params;

    const report = await getReportByIdFromDb(reportId);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    return res.status(200).json(report);
  } catch (err) {
    console.error('[reportsController] getReportById failed', err);
    return res.status(500).json({ message: 'Failed to get report' });
  }
}

async function createReport(req, res) {
  try {
    const body = req.body || {};

    // --- 1) Support BOTH payload shapes (legacy root fields + nested inspection) ---

    // Legacy (WorkerHomePage today)
    const legacyProjectId =
      typeof body.projectId === 'string' ? body.projectId.trim() : '';
    const legacyApartmentId =
      typeof body.apartmentId === 'string' ? body.apartmentId.trim() : '';
    const legacyRoomId =
      typeof body.roomId === 'string' ? body.roomId.trim() : '';
    const legacyComponentId =
      typeof body.componentId === 'string' ? body.componentId.trim() : '';
    const legacyChecklist =
      body.checklist && typeof body.checklist === 'object'
        ? body.checklist
        : {};
    const legacyComments =
      typeof body.comments === 'string' ? body.comments : '';
    const legacyPhotoUrl =
      typeof body.photoUrl === 'string' ? body.photoUrl : '';

    // Newer shape (if provided)
    const providedProject =
      typeof body.project === 'string' ? body.project.trim() : '';
    const providedLocation =
      typeof body.location === 'string' ? body.location.trim() : '';
    const providedContractor =
      typeof body.contractor === 'string' ? body.contractor.trim() : '';

    const providedInspection =
      body.inspection && typeof body.inspection === 'object'
        ? body.inspection
        : null;

    // createdAt
    const createdAt = body?.createdAt ? new Date(body.createdAt) : new Date();

    // --- 2) Normalize inspection object so schema validation passes ---
    const inspection = {
      projectId:
        (typeof providedInspection?.projectId === 'string' &&
          providedInspection.projectId.trim()) ||
        legacyProjectId,
      apartmentId:
        (typeof providedInspection?.apartmentId === 'string' &&
          providedInspection.apartmentId.trim()) ||
        legacyApartmentId ||
        '',
      roomId:
        (typeof providedInspection?.roomId === 'string' &&
          providedInspection.roomId.trim()) ||
        legacyRoomId,
      componentId:
        (typeof providedInspection?.componentId === 'string' &&
          providedInspection.componentId.trim()) ||
        legacyComponentId,
      checklist:
        (providedInspection?.checklist &&
        typeof providedInspection.checklist === 'object'
          ? providedInspection.checklist
          : legacyChecklist) || {},
      comments:
        (typeof providedInspection?.comments === 'string'
          ? providedInspection.comments
          : legacyComments) || '',
      photoUrl:
        (typeof providedInspection?.photoUrl === 'string'
          ? providedInspection.photoUrl
          : legacyPhotoUrl) || '',
    };

    // --- 3) Normalize top-level required fields (project/location/contractor) ---
    // IMPORTANT: Your schema requires these. If UI doesn't provide them yet, we set safe defaults.
    // You can tighten this later once UI collects them.
    const project =
      providedProject || inspection.projectId || 'UNKNOWN_PROJECT';
    const location = providedLocation || 'UNKNOWN_LOCATION';
    const contractor = providedContractor || 'UNKNOWN_CONTRACTOR';

    // --- 4) Determine status from checklist content ---
    const hasIssues = hasIssuesFromChecklist(inspection?.checklist);
    const status = hasIssues ? 'pending' : 'approved';

    // --- 5) Compute report hash ---
    const reportHash = hashReport({
      project,
      location,
      contractor,
      createdAt,
      inspection,
    });

    const network = process.env.CHAIN_ENV || 'sepolia';
    const chainId = network === 'sepolia' ? 11155111 : null;
    const registryAddress = process.env.REPORT_REGISTRY_ADDRESS || '';

    const newReport = {
      project,
      location,
      contractor,
      createdAt,
      inspection,
      status,
      reportHash,
      onChain: {
        registered: false,
        status: 'not_submitted',
        network,
        chainId,
        registryAddress,
        txHash: '',
        blockNumber: null,
        submittedAt: null,
        confirmedAt: null,
      },
      chainError: '',
    };

    // Persist to Mongo
    const created = await createReportInDb(newReport);

    // Optional: legacy server-side auto-register (kept, but normally OFF in your flow)
    const AUTO_REGISTER_ONCHAIN = process.env.AUTO_REGISTER_ONCHAIN === 'true';

    if (AUTO_REGISTER_ONCHAIN && status === 'approved') {
      try {
        const tx = await registerReportOnChain(reportHash);

        created.onChain = {
          ...(created.onChain || {}),
          registered: true,
          status: 'confirmed',
          network,
          chainId,
          registryAddress,
          txHash: tx.txHash,
          blockNumber: tx.blockNumber,
          submittedAt: created.onChain?.submittedAt || new Date(),
          confirmedAt: new Date(),
        };

        created.chainError = '';
        await created.save();
      } catch (err) {
        console.error('[createReport] on-chain register failed', err);
        created.chainError = err?.message || 'On-chain register failed';
        created.onChain = {
          ...(created.onChain || {}),
          status: 'failed',
        };
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
    // NOTE: This is currently hard-coded in your repo.
    // Replace with req.user/req.auth when your auth wiring is ready.
    const mine = await listReportsByContractor('Worker');
    return res.status(200).json(mine);
  } catch (err) {
    console.error('[reportsController] listMyReports failed', err);
    return res.status(500).json({
      message: 'Failed to create report',
      error: err?.message,
      details: err?.errors ? Object.keys(err.errors) : undefined,
    });
  }
}

/**
 * PATCH /:reportId/onchain
 * Body: { txHash, blockNumber, status, chainError }
 *
 * This endpoint is called by the frontend after OKX wallet signing / tx submission.
 */

async function updateReportOnChain(req, res) {
  try {
    const { reportId } = req.params;
    const { txHash, blockNumber, status, chainError } = req.body || {};

    const report = await getReportByIdFromDb(reportId);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    // Ensure reportHash exists (recompute if missing)
    let reportHash = report.reportHash;
    if (!reportHash) {
      try {
        reportHash = hashReport({
          project: report.project,
          location: report.location,
          contractor: report.contractor,
          createdAt: report.createdAt,
          inspection: report.inspection,
        });
      } catch (e) {
        console.error(
          '[updateReportOnChain] failed to recompute reportHash',
          e
        );
      }
    }

    if (!reportHash) {
      return res.status(400).json({ message: 'Missing reportHash on report' });
    }

    const network =
      process.env.CHAIN_ENV || report.onChain?.network || 'sepolia';
    const chainId =
      network === 'sepolia' ? 11155111 : report.onChain?.chainId || null;
    const registryAddress =
      process.env.REPORT_REGISTRY_ADDRESS ||
      report.onChain?.registryAddress ||
      '';

    const nextStatus =
      typeof status === 'string' && status.trim().length > 0
        ? status.trim()
        : report.onChain?.status || 'not_submitted';

    const nextRegistered =
      nextStatus === 'confirmed' ? true : report.onChain?.registered || false;

    const nextSubmittedAt =
      nextStatus === 'pending'
        ? report.onChain?.submittedAt || new Date()
        : report.onChain?.submittedAt || null;

    const nextConfirmedAt =
      nextStatus === 'confirmed'
        ? new Date()
        : report.onChain?.confirmedAt || null;

    const patch = {
      // If we recomputed hash, persist it
      reportHash,

      onChain: {
        ...(report.onChain || {}),
        network,
        chainId,
        registryAddress,
        txHash:
          typeof txHash === 'string' ? txHash : report.onChain?.txHash || '',
        blockNumber:
          typeof blockNumber === 'number'
            ? blockNumber
            : report.onChain?.blockNumber || null,
        status: nextStatus,
        registered: nextRegistered,
        submittedAt: nextSubmittedAt,
        confirmedAt: nextConfirmedAt,
      },

      chainError: typeof chainError === 'string' ? chainError : '',
    };

    const updated = await updateReportOnChainInDb(reportId, patch);
    if (!updated) return res.status(404).json({ message: 'Report not found' });

    return res.status(200).json(updated);
  } catch (err) {
    console.error('[reportsController] updateReportOnChain failed', err);
    return res.status(500).json({ message: 'Failed to update on-chain data' });
  }
}

module.exports = {
  listReports,
  getReportById,
  createReport,
  listMyReports,
  updateReportOnChain,
};
