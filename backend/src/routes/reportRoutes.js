const express = require('express');
const router = express.Router();

const { calculateReportHash } = require('../controllers/hashController');
const {
  listReports,
  listMyReports,
  getReportById,
  createReport,
  updateReportOnChain,
} = require('../controllers/reportsController');

// List routes (must be BEFORE "/:reportId")
router.get('/', listReports);
router.get('/mine', listMyReports);

// Utility route (must be BEFORE "/:reportId")
router.post('/hash', calculateReportHash);

// Create report
router.post('/', createReport);

// Save on-chain result (Manager Approve will call this after wallet tx)
router.patch('/:reportId/onchain', updateReportOnChain);

// Get by id (keep last-ish)
router.get('/:reportId', getReportById);

module.exports = router;
