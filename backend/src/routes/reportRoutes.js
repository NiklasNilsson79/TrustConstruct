const express = require('express');
const router = express.Router();

const { calculateReportHash } = require('../controllers/hashController');
const {
  listReports,
  listMyReports,
  getReportById,
  createReport,
  updateReportOnChain,
  updateReportStatus,
} = require('../controllers/reportsController');
const { verifyReport } = require('../controllers/reportVerifyController');

// auth middleware
const requireAuth = require('../middlewares/requireAuth');

// List routes (must be BEFORE "/:reportId")
router.get('/', listReports);
router.get('/mine', requireAuth, listMyReports);

// DEV TOOLING ONLY: computes canonical report + hash for debugging/testing.
// Not part of the Worker/Manager approval flow.
router.post('/hash', calculateReportHash);

// Create report
router.post('/', requireAuth, createReport);

// Save on-chain result (Manager Approve will call this after wallet tx)
// Recommended to protect as well (since it updates DB state)
router.patch('/:reportId/onchain', requireAuth, updateReportOnChain);

// Update report business status (used after Manager approves on-chain)
router.patch('/:reportId/status', requireAuth, updateReportStatus);

// Verify (specific sub-route)
router.get('/:reportId/verify', requireAuth, verifyReport);

// Get by id (optional to protect, but recommended in real app)
router.get('/:reportId', requireAuth, getReportById);

module.exports = router;
