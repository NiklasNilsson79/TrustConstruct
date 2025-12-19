const express = require('express');
const {
  listReports,
  getReportById,
} = require('../controllers/reportsController');

const router = express.Router();

// GET /api/reports
router.get('/', listReports);

// GET /api/reports/:id
router.get('/:id', getReportById);

module.exports = router;
