// backend/src/models/Report.js
const mongoose = require('mongoose');

const ChecklistValueEnum = ['OK', 'NOT_OK', 'NA'];

/**
 * Generates app-level report ID: RPT-YYYYMMDD-XXXXXX
 * (No I/O, deterministic format, random suffix)
 */
function generateReportId() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  // Avoid ambiguous characters (I, O, 0, 1)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }

  return `RPT-${y}${m}${day}-${suffix}`;
}

const InspectionSchema = new mongoose.Schema(
  {
    projectId: { type: String, required: true, trim: true },
    apartmentId: { type: String, trim: true, default: '' },
    roomId: { type: String, required: true, trim: true },
    componentId: { type: String, required: false, trim: true },

    // checklist är ett object med dynamiska keys (surface_preparation, osv)
    checklist: {
      type: Map,
      of: {
        type: String,
        enum: ChecklistValueEnum,
      },
      required: true,
      default: () => new Map(),
    },

    comments: { type: String, trim: true, default: '' },
    photoUrl: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const OnChainSchema = new mongoose.Schema(
  {
    registered: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ['not_submitted', 'pending', 'confirmed', 'failed'],
      default: 'not_submitted',
    },

    network: { type: String, trim: true, default: 'sepolia' },
    chainId: { type: Number, default: null },
    registryAddress: { type: String, trim: true, default: '' },

    txHash: { type: String, trim: true, default: '' },
    blockNumber: { type: Number, default: null },

    submittedAt: { type: Date, default: null },
    confirmedAt: { type: Date, default: null },

    error: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const ReportSchema = new mongoose.Schema(
  {
    // App-ID (RPT-YYYYMMDD-XXXXXX)
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,

      // om frontend/backenden inte skickar id, generera ett automatiskt
      default: generateReportId,
    },

    status: {
      type: String,
      required: true,
      enum: ['draft', 'submitted', 'approved', 'rejected'],
      default: 'submitted',
      index: true,
    },
    approvedBy: {
      type: String,
      trim: true,
      default: '',
    },

    managerApprovalComment: {
      type: String,
      trim: true,
      default: '',
    },

    project: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },

    // Legacy / existing field (keep for compatibility)
    contractor: { type: String, required: true, trim: true },

    // New: store the actual signer (display) separately from legacy `contractor`
    // This lets the UI show "Name — Company" while keeping backward compatibility.
    contractorName: { type: String, required: false, trim: true, default: '' },
    contractorCompany: {
      type: String,
      required: false,
      trim: true,
      default: '',
    },
    contractorUserId: {
      type: String,
      required: false,
      trim: true,
      default: '',
    },

    // Viktigt: stabilt och ingår i hashen
    // (Mongoose castar ISO-string -> Date automatiskt)
    createdAt: { type: Date, required: true },

    inspection: { type: InspectionSchema, required: true },

    // Viktigt: måste finnas i schemat annars sparas den inte
    reportHash: { type: String, required: true, index: true, trim: true },

    // On-chain status
    onChain: {
      type: OnChainSchema,
      default: () => ({ registered: false, status: 'not_submitted' }),
    },
  },
  {
    timestamps: false,
    strict: true,
    minimize: false,
    versionKey: '__v',
  }
);

// Extra index (valfritt men bra)
ReportSchema.index({ contractor: 1, createdAt: -1 });
ReportSchema.index({ contractorUserId: 1, createdAt: -1 });
ReportSchema.index({ contractorCompany: 1, createdAt: -1 });

const crypto = require('crypto');

// Normaliserar Mongoose Map -> sorterad plain object (stabil hashing)
function normalizeChecklistMap(checklist) {
  if (!checklist) return {};
  const obj =
    checklist instanceof Map ? Object.fromEntries(checklist) : checklist;

  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
}

function buildCanonicalReportForHash(doc) {
  // OBS: håll detta stabilt över tid annars ändras hash/logik
  const payload = {
    id: doc.id,
    status: doc.status,
    project: doc.project,
    location: doc.location,
    contractor: doc.contractor,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    inspection: doc.inspection
      ? {
          projectId: doc.inspection.projectId,
          apartmentId: doc.inspection.apartmentId || '',
          roomId: doc.inspection.roomId,
          componentId: doc.inspection.componentId,
          checklist: normalizeChecklistMap(doc.inspection.checklist),
          comments: doc.inspection.comments || '',
          photoUrl: doc.inspection.photoUrl || '',
        }
      : null,
  };

  const json = JSON.stringify(payload);
  return crypto.createHash('sha256').update(json).digest('hex');
}

// Safety-net: om reportHash saknas på en ny/uppdaterad report så beräknas den
ReportSchema.pre('validate', function () {
  // använd INTE arrow function
  if (!this.createdAt) this.createdAt = new Date();

  if (!this.reportHash) {
    this.reportHash = buildCanonicalReportForHash(this);
  }

  // Sätt default onChain fields om de saknas
  if (!this.onChain) {
    this.onChain = { registered: false, status: 'not_submitted' };
  }

  if (this.onChain.registered === undefined) this.onChain.registered = false;
  if (!this.onChain.status) this.onChain.status = 'not_submitted';

  if (!this.onChain.network) {
    this.onChain.network = process.env.CHAIN_ENV || 'sepolia';
  }

  if (!this.onChain.chainId) {
    this.onChain.chainId = this.onChain.network === 'sepolia' ? 11155111 : null;
  }

  if (!this.onChain.registryAddress && process.env.REPORT_REGISTRY_ADDRESS) {
    this.onChain.registryAddress = process.env.REPORT_REGISTRY_ADDRESS;
  }
});

module.exports = mongoose.model('Report', ReportSchema);
