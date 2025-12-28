const express = require('express');
const router = express.Router();

const { calculateReportHash } = require('../controllers/hashController');
const {
  listReports,
  listMyReports,
  getReportById,
  createReport,
  updateReportOnChain,
  updateReportStatus, // set business status (submitted/approved)
} = require('../controllers/reportsController');

// auth middleware
const requireAuth = require('../middlewares/requireAuth');

// List routes (must be BEFORE "/:reportId")
router.get('/', listReports);
router.get('/mine', requireAuth, listMyReports);

// Utility route (must be BEFORE "/:reportId")
router.post('/hash', calculateReportHash);

// Create report
router.post('/', requireAuth, createReport);

// Save on-chain result (Manager Approve will call this after wallet tx)
// Recommended to protect as well (since it updates DB state)
router.patch('/:reportId/onchain', requireAuth, updateReportOnChain);

// Update report business status (used after Manager approves on-chain)
router.patch('/:reportId/status', requireAuth, updateReportStatus);

// Get by id (optional to protect, but recommended in real app)
router.get('/:reportId', requireAuth, getReportById);

module.exports = router;
