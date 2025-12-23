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

async function getReportById(reportId) {
  if (!reportId) return null;

  // 1) Försök Mongo _id (ObjectId)
  const isObjectId =
    mongoose.Types.ObjectId.isValid(reportId) &&
    String(new mongoose.Types.ObjectId(reportId)) === reportId;

  if (isObjectId) {
    const byMongoId = await Report.findById(reportId).lean();
    if (byMongoId) return byMongoId;
  }

  // 2) Fallback: er custom id (RPT-...)
  return Report.findOne({ id: reportId }).lean();
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

module.exports = {
  createReport,
  listReports,
  listReportsByContractor,
  getReportById,
  updateReportStatus,
};
