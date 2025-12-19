const express = require('express');
const {
  listReports,
  getReportById,
  createReport,
} = require('../controllers/reportsController');

const router = express.Router();

// GET /api/reports
router.get('/', listReports);

// POST /api/reports  (NY)
router.post('/', createReport);

// GET /api/reports/:id
router.get('/:id', getReportById);

module.exports = router;
