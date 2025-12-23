const mongoose = require('mongoose');

const ALLOWED_STATUSES = ['submitted', 'approved', 'rejected'];

function generateReportId() {
  // Ex: RPT-20251223-K1M9QZ
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `RPT-${date}-${rand}`;
}

const ReportSchema = new mongoose.Schema(
  {
    // Behåll samma "id" som frontend/API redan använder (t.ex. "RPT-006-UVWX")
    // Men: om frontend inte skickar id, generera ett automatiskt
    id: {
      type: String,
      required: false,
      unique: true,
      index: true,
      default: generateReportId,
    },

    // Om frontend inte skickar status, sätt submitted
    status: {
      type: String,
      required: true,
      enum: ALLOWED_STATUSES,
      default: 'submitted',
    },

    project: { type: String, required: true },
    location: { type: String, required: true },
    contractor: { type: String, required: true },

    // API-kontraktet verkar använda ISO-string
    createdAt: {
      type: String,
      required: true,
      default: () => new Date().toISOString(),
    },

    // Lagra resten flexibelt (checklist etc)
    inspection: { type: mongoose.Schema.Types.Mixed },
  },
  {
    collection: 'reports',
    timestamps: false,
  }
);

const Report = mongoose.model('Report', ReportSchema);

module.exports = Report;
