const express = require('express');
const {
  listReports,
  getReportById,
  createReport,
  listMyReports,
} = require('../controllers/reportsController');

const router = express.Router();

// GET /api/reports
router.get('/', listReports);

// POST /api/reports  (NY)
router.post('/', createReport);

router.get('/mine', listMyReports);

// GET /api/reports/:id
router.get('/:id', getReportById);

module.exports = router;
