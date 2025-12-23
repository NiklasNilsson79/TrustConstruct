const express = require('express');
const router = express.Router();

const { calculateReportHash } = require('../controllers/hashController');
const {
  listReports,
  listMyReports,
  getReportById,
  createReport,
} = require('../controllers/reportsController');

// List routes (must be BEFORE "/:reportId")
router.get('/', listReports);
router.get('/mine', listMyReports);

// Utility route (must be BEFORE "/:reportId")
router.post('/hash', calculateReportHash);

// Create report
router.post('/', createReport);

// Get by id (must be LAST so it doesn't catch /mine or /hash etc)
router.get('/:reportId', getReportById);

module.exports = router;
