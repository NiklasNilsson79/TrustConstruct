const express = require('express');
const router = express.Router();

const { calculateReportHash } = require('../controllers/hashController');
const {
  listReports,
  listMyReports,
  getReportById,
  createReport,
} = require('../controllers/reportsController');

router.get('/', listReports);
router.get('/mine', listMyReports);

router.post('/hash', calculateReportHash);

router.get('/:id', getReportById);
router.post('/', createReport);

module.exports = router;
