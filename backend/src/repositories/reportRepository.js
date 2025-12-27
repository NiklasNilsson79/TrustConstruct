// backend/src/repositories/reportRepository.js
const mongoose = require('mongoose');
const Report = require('../models/Report');

/**
 * Fields used by detail view (ReportDetailPage) and approve/chain flows.
 * Keep these consistent so frontend always gets onChain + reportHash, etc.
 */
const selectDetailFields = [
  'id',
  'status',
  'project',
  'location',
  'contractor',
  'contractorName',
  'contractorCompany',
  'contractorUserId',
  'inspection',
  'reportHash',
  'onChain',
  'createdAt',
  'updatedAt',
].join(' ');

function buildReportIdFilter(reportId) {
  // Supports both Mongo _id (24-hex string) and business id (RPT-....)
  if (!reportId) return null;

  // If it's a valid ObjectId, match by _id
  if (mongoose.isValidObjectId(reportId)) {
    return { _id: reportId };
  }

  // Otherwise assume it's business id (e.g., "RPT-20251227-XXXXX")
  return { id: reportId };
}

async function createReport(report) {
  const created = await Report.create(report);
  // Return lean for consistent consumer behavior
  return Report.findById(created._id).select(selectDetailFields).lean();
}

async function listReports() {
  return Report.find({}).sort({ createdAt: -1 }).lean();
}

async function listReportsByContractor(contractor) {
  // Note: contractor historically stored as "Worker"/"Manager" label.
  // Keep as-is for now since you said lists are working.
  return Report.find({ contractor }).sort({ createdAt: -1 }).lean();
}

async function getReportById(reportId) {
  const filter = buildReportIdFilter(reportId);
  if (!filter) return null;

  return Report.findOne(filter).select(selectDetailFields).lean();
}

async function updateReportStatus(reportId, statusPatch) {
  const filter = buildReportIdFilter(reportId);
  if (!filter) return null;

  // Allow either { status: 'pending' } or full patch
  const patch =
    statusPatch && typeof statusPatch === 'object'
      ? statusPatch
      : { status: statusPatch };

  return Report.findOneAndUpdate(filter, { $set: patch }, { new: true })
    .select(selectDetailFields)
    .lean();
}

/**
 * Used after chain interactions to persist on-chain metadata.
 * IMPORTANT: must update the correct report regardless of whether caller passes
 * Mongo _id or business id.
 *
 * Example patch:
 * {
 *   status: 'confirmed',
 *   onChain: { registered: true, status: 'confirmed', txHash: '0x..', ... }
 * }
 */
async function updateReportOnChain(reportId, patch) {
  if (!reportId) return null;
  if (!patch || typeof patch !== 'object') return null;

  const filter = buildReportIdFilter(reportId);
  if (!filter) return null;

  // Always use $set to avoid replacing nested objects unintentionally.
  return Report.findOneAndUpdate(filter, { $set: patch }, { new: true })
    .select(selectDetailFields)
    .lean();
}

module.exports = {
  createReport,
  listReports,
  listReportsByContractor,
  getReportById,
  updateReportStatus,
  updateReportOnChain,
};
