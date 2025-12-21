const Report = require('../models/Report');

/**
 * Skapar en report.
 * Förväntar sig samma API-shape (id, status, project, location, contractor, createdAt).
 */
async function createReport(report) {
  return Report.create(report);
}

/**
 * Lista alla reports (manager-lista).
 * Sorterar senaste först baserat på createdAt (ISO string).
 */
async function listReports() {
  return Report.find({}).sort({ createdAt: -1 }).lean();
}

/**
 * Hämta report via id (t.ex. "RPT-006-UVWX").
 */
async function getReportById(id) {
  return Report.findOne({ id }).lean();
}

/**
 * Uppdatera status (t.ex. approved/rejected).
 */
async function updateReportStatus(id, status) {
  return Report.findOneAndUpdate(
    { id },
    { $set: { status } },
    { new: true }
  ).lean();
}

async function listReportsByContractor(contractor) {
  return Report.find({ contractor }).sort({ createdAt: -1 }).lean();
}

module.exports = {
  createReport,
  listReports,
  getReportById,
  updateReportStatus,
  listReportsByContractor,
};
