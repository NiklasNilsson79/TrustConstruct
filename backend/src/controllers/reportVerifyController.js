const {
  getReportById: getReportByIdFromDb,
} = require('../repositories/reportRepository');

const { hashReport } = require('../utils/hashReport');
const { verifyReportOnChain } = require('../services/reportRegistryService');

async function verifyReport(req, res) {
  try {
    const { reportId } = req.params;

    const Report = require('../models/Report');

    let report = null;

    // 1) Try Mongo _id (24-hex)
    if (/^[0-9a-fA-F]{24}$/.test(reportId)) {
      report = await Report.findById(reportId).lean();
    }

    // 2) Fallback: business id (e.g. "RPT-2025...")
    if (!report) {
      report = await Report.findOne({ id: reportId }).lean();
    }

    // 3) Final fallback: existing repository method (if you still want it)
    if (!report) {
      report = await getReportByIdFromDb(reportId);
    }

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (!report.reportHash) {
      return res.status(400).json({ message: 'Report has no reportHash' });
    }

    // 1) Recompute hash from current DB data
    const recomputed = hashReport(report); // { canonical, payload, hash: "0x..." }
    const recomputedHex = recomputed.hash.replace(/^0x/, ''); // match DB format (no 0x)

    // 2) Compare recomputed vs stored
    const matchesStoredHash = recomputedHex === report.reportHash;

    // 3) Verify stored hash exists on-chain
    const bytes32Hash = report.reportHash.startsWith('0x')
      ? report.reportHash
      : `0x${report.reportHash}`;

    const chain = await verifyReportOnChain(bytes32Hash);

    const chainVerified = Boolean(chain.isRegistered);
    const integrityVerified = Boolean(matchesStoredHash);
    const verified = chainVerified;

    return res.status(200).json({
      verified, // = chainVerified
      chainVerified, // hash exists on-chain
      integrityVerified, // recomputed === stored
      matchesStoredHash, // behåll (debug/insyn)
      recomputedHash: recomputed,
      recomputedHex,
      storedHash: report.reportHash,
      onChain: {
        isRegistered: chain.isRegistered,
        submitter: chain.submitter ?? null,
        timestamp: chain.timestamp ?? null,
      },
    });
  } catch (err) {
    console.error('[reportVerifyController] verifyReport failed:', err);
    console.error(
      '[reportVerifyController] verifyReport error message:',
      err?.message
    );
    console.error(
      '[reportVerifyController] verifyReport error stack:',
      err?.stack
    );
    return res.status(500).json({ message: 'Verification failed' });
  }
}

module.exports = { verifyReport };
