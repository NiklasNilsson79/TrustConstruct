const mongoose = require('mongoose');
const Report = require('../models/Report');

async function createReport(report) {
  return Report.create(report);
}

async function listReports() {
  return Report.find({}).sort({ createdAt: -1 }).lean();
}

async function listReportsByContractor(contractor) {
  return Report.find({ contractor }).sort({ createdAt: -1 }).lean();
}

// IMPORTANT: For detail/approve flow we MUST have reportHash available.
// If schema uses `select: false` on reportHash, we need +reportHash explicitly.
async function getReportById(reportId) {
  if (!reportId) return null;

  const selectDetailFields = '+reportHash +onChain +chainError';

  // 1) Try Mongo _id (ObjectId)
  const isObjectId =
    mongoose.Types.ObjectId.isValid(reportId) &&
    String(new mongoose.Types.ObjectId(reportId)) === reportId;

  if (isObjectId) {
    const byMongoId = await Report.findById(reportId)
      .select(selectDetailFields)
      .lean();
    if (byMongoId) return byMongoId;
  }

  // 2) Fallback: custom id (RPT-...)
  return Report.findOne({ id: reportId }).select(selectDetailFields).lean();
}

async function updateReportStatus(reportId, status) {
  if (!reportId) return null;

  const isObjectId =
    mongoose.Types.ObjectId.isValid(reportId) &&
    String(new mongoose.Types.ObjectId(reportId)) === reportId;

  if (isObjectId) {
    return Report.findByIdAndUpdate(reportId, { status }, { new: true }).lean();
  }

  return Report.findOneAndUpdate(
    { id: reportId },
    { status },
    { new: true }
  ).lean();
}

async function updateReportOnChain(reportId, patch) {
  if (!reportId) return null;

  const isObjectId =
    mongoose.Types.ObjectId.isValid(reportId) &&
    String(new mongoose.Types.ObjectId(reportId)) === reportId;

  const selectDetailFields = '+reportHash +onChain +chainError';

  if (isObjectId) {
    return Report.findByIdAndUpdate(reportId, patch, { new: true })
      .select(selectDetailFields)
      .lean();
  }

  return Report.findOneAndUpdate({ id: reportId }, patch, { new: true })
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
