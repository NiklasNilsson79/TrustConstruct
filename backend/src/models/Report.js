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
    componentId: { type: String, required: true, trim: true },

    // checklist är ett object med dynamiska keys (surface_preparation, osv)
    checklist: {
      type: Map,
      of: {
        type: String,
        enum: ChecklistValueEnum,
      },
      required: true,
    },

    comments: { type: String, trim: true, default: '' },
    photoUrl: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const OnChainSchema = new mongoose.Schema(
  {
    // Bakåtkompatibelt fält (om ni redan använder "registered" i UI)
    registered: { type: Boolean, default: false },

    // Rekommenderat: tydligare state-machine
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

      //  om frontend/backenden inte skickar id, generera ett automatiskt
      default: generateReportId,
    },

    status: {
      type: String,
      required: true,
      enum: ['draft', 'submitted', 'approved', 'rejected'],
      default: 'submitted',
      index: true,
    },

    project: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    contractor: { type: String, required: true, trim: true },

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

    // Om on-chain-register misslyckar (utan att ni degraderar status)
    chainError: { type: String, trim: true, default: '' },
  },
  {
    collection: 'reports',
    versionKey: '__v',
  }
);

// Extra index (valfritt men bra)
ReportSchema.index({ contractor: 1, createdAt: -1 });

const crypto = require('crypto');

// Normaliserar Mongoose Map -> sorterad plain object (stabil hashing)
function normalizeChecklistMap(checklist) {
  if (!checklist) return {};
  // checklist kan vara Map eller plain object beroende på var den kommer ifrån
  const obj =
    checklist instanceof Map
      ? Object.fromEntries(checklist.entries())
      : checklist;
  const sortedKeys = Object.keys(obj).sort();
  const out = {};
  for (const k of sortedKeys) out[k] = obj[k];
  return out;
}

// Minimal, stabil canonical payload (anpassad till era fält)
function computeReportHashFromDoc(doc) {
  const payload = {
    id: doc.id,
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

  if (!this.reportHash) {
    this.reportHash = computeReportHashFromDoc(this);
  }

  if (!this.onChain) this.onChain = {};

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
