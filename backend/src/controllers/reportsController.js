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

function getAuthUser(req) {
  // Stöd både req.user och req.auth (för framtida middleware)
  return req.user || req.auth || null;
}

async function listReports(_req, res) {
  try {
    const reports = await listReportsFromDb();
    return res.status(200).json(reports);
  } catch (err) {
    console.error('[reportsController] listReports failed', err);
    return res.status(500).json({ message: 'Failed to fetch reports' });
  }
}

async function getReportById(req, res) {
  try {
    const { reportId } = req.params;
    const report = await getReportByIdFromDb(reportId);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    return res.status(200).json(report);
  } catch (err) {
    console.error('[reportsController] getReportById failed', err);
    return res.status(500).json({ message: 'Failed to fetch report' });
  }
}

async function createReport(req, res) {
  try {
    const body = req.body || {};
    const authUser = getAuthUser(req);

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

    // --- 2) Normalize inspection payload ---
    const inspection = {
      projectId:
        (typeof providedInspection?.projectId === 'string'
          ? providedInspection.projectId
          : legacyProjectId) || '',
      apartmentId:
        (typeof providedInspection?.apartmentId === 'string'
          ? providedInspection.apartmentId
          : legacyApartmentId) || '',
      roomId:
        (typeof providedInspection?.roomId === 'string'
          ? providedInspection.roomId
          : legacyRoomId) || '',
      componentId:
        typeof providedInspection?.componentId === 'string'
          ? providedInspection.componentId
          : legacyComponentId,
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

    // NEW: Signed-by (from JWT/middleware)
    const contractorName =
      typeof authUser?.name === 'string' ? authUser.name.trim() : '';
    const contractorCompany =
      typeof authUser?.company === 'string' ? authUser.company.trim() : '';
    const contractorUserId =
      (typeof authUser?.sub === 'string' && authUser.sub.trim()) ||
      (typeof authUser?.id === 'string' && authUser.id.trim()) ||
      '';

    // NEW: A readable contractor display string (keeps backward compatibility)
    const contractor =
      providedContractor ||
      (contractorName && contractorCompany
        ? `${contractorName} — ${contractorCompany}`
        : contractorName || contractorCompany || 'Worker');

    // --- 4) Determine status from checklist content ---
    const hasIssues = hasIssuesFromChecklist(inspection?.checklist);
    const status = hasIssues ? 'submitted' : 'approved';

    // --- 5) Compute report hash ---
    const reportHash = hashReport({
      project,
      location,
      contractor,
      createdAt: new Date().toISOString(),
      inspection,
      status,
    });

    // --- 6) Compose report document ---
    const createdAt = new Date();
    const network = process.env.CHAIN_ENV || 'sepolia';
    const chainId = network === 'sepolia' ? 11155111 : null;
    const registryAddress = process.env.REPORT_REGISTRY_ADDRESS || '';

    const newReport = {
      project,
      location,
      contractor,

      // NEW signer fields (Step 2)
      contractorName,
      contractorCompany,
      contractorUserId,

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
        created.chainError = String(err?.message || err);
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
    return res.status(500).json({ message: 'Failed to fetch my reports' });
  }
}

async function updateReportOnChain(req, res) {
  try {
    const { reportId } = req.params;
    const body = req.body || {};

    // Support BOTH shapes:
    // A) { txHash, blockNumber, status: "confirmed", chainError: "" }   (legacy client)
    // B) { onChain: { registered, status, txHash, blockNumber, ... }, chainError: "" } (preferred)

    const patch = {};

    // Keep chainError at root (if you use it), or move it into onChain.error.
    if (typeof body.chainError === 'string') {
      patch.chainError = body.chainError;
    }

    // Preferred: nested onChain object
    if (body.onChain && typeof body.onChain === 'object') {
      if (typeof body.onChain.registered === 'boolean')
        patch['onChain.registered'] = body.onChain.registered;
      if (typeof body.onChain.status === 'string')
        patch['onChain.status'] = body.onChain.status;
      if (typeof body.onChain.txHash === 'string')
        patch['onChain.txHash'] = body.onChain.txHash;
      if (typeof body.onChain.blockNumber === 'number')
        patch['onChain.blockNumber'] = body.onChain.blockNumber;
      if (typeof body.onChain.network === 'string')
        patch['onChain.network'] = body.onChain.network;
      if (typeof body.onChain.chainId === 'number')
        patch['onChain.chainId'] = body.onChain.chainId;
      if (typeof body.onChain.registryAddress === 'string')
        patch['onChain.registryAddress'] = body.onChain.registryAddress;

      // timestamps (optional)
      if (body.onChain.submittedAt)
        patch['onChain.submittedAt'] = body.onChain.submittedAt;
      if (body.onChain.confirmedAt)
        patch['onChain.confirmedAt'] = body.onChain.confirmedAt;
      if (typeof body.onChain.error === 'string')
        patch['onChain.error'] = body.onChain.error;
    } else {
      // Legacy: flatten mapping
      if (typeof body.txHash === 'string')
        patch['onChain.txHash'] = body.txHash;
      if (typeof body.blockNumber === 'number')
        patch['onChain.blockNumber'] = body.blockNumber;

      // IMPORTANT: interpret "status" as onChain.status (NOT report.status)
      if (typeof body.status === 'string')
        patch['onChain.status'] = body.status;

      // Make registered true when we have txHash / confirmed status
      if (typeof body.txHash === 'string' && body.txHash.trim())
        patch['onChain.registered'] = true;
      if (typeof body.status === 'string' && body.status === 'confirmed')
        patch['onChain.registered'] = true;
    }

    // Auto-set timestamps
    if (patch['onChain.txHash'] && !patch['onChain.submittedAt']) {
      patch['onChain.submittedAt'] = new Date();
    }
    if (
      patch['onChain.status'] === 'confirmed' &&
      !patch['onChain.confirmedAt']
    ) {
      patch['onChain.confirmedAt'] = new Date();
    }

    const updated = await updateReportOnChainInDb(reportId, patch);

    if (!updated) {
      return res.status(404).json({ message: 'Report not found' });
    }

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
