const { getReportById } = require('../repositories/reportRepository');
const { hashReport } = require('../utils/hashReport');

/**
 * POST /reports/hash
 *
 * Stödjer två varianter:
 * A) { id: "RPT-..." }  -> hämtar report från DB och hashar den
 * B) { report: {...} }  -> hashar direkt på payload (användbart i frontend senare)
 */
async function calculateReportHash(req, res) {
  try {
    const { id, report } = req.body || {};

    let sourceReport = report;

    if (!sourceReport) {
      if (!id) {
        return res
          .status(400)
          .json({ message: 'Missing id or report in request body' });
      }

      sourceReport = await getReportById(id);

      if (!sourceReport) {
        return res.status(404).json({ message: 'Report not found' });
      }
    }

    const { canonical, hash } = hashReport(sourceReport);

    return res.status(200).json({
      hash,
      canonical,
    });
  } catch (err) {
    console.error('[hashController] calculateReportHash failed', err);
    return res.status(500).json({ message: 'Failed to calculate report hash' });
  }
}

module.exports = { calculateReportHash };
