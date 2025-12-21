const mongoose = require('mongoose');

const ALLOWED_STATUSES = ['submitted', 'approved', 'rejected'];

const ReportSchema = new mongoose.Schema(
  {
    // Behåll samma "id" som frontend/API redan använder (t.ex. "RPT-006-UVWX")
    id: { type: String, required: true, unique: true, index: true },

    status: { type: String, required: true, enum: ALLOWED_STATUSES },

    project: { type: String, required: true },
    location: { type: String, required: true },
    contractor: { type: String, required: true },

    // API-kontraktet verkar använda ISO-string
    createdAt: { type: String, required: true },
    inspection: { type: mongoose.Schema.Types.Mixed },
  },
  {
    collection: 'reports',
    timestamps: false,
  }
);

// Se till att vi aldrig råkar läcka _id/__v om någon returnerar docen direkt
ReportSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Report = mongoose.model('Report', ReportSchema);

module.exports = Report;
