const express = require('express');
const {
  registerReportOnChain,
  verifyReportOnChain,
} = require('../services/reportRegistryService');

const router = express.Router();

function isBytes32Hex(v) {
  return typeof v === 'string' && /^0x[0-9a-fA-F]{64}$/.test(v);
}

function bytes32Example() {
  return '0x' + '1'.repeat(64);
}

// POST /api/chain/register
// Body: { "reportHash": "0x..." }  (bytes32)
router.post('/register', async (req, res, next) => {
  try {
    const { reportHash } = req.body || {};

    if (!isBytes32Hex(reportHash)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid reportHash. Expected bytes32 hex (0x + 64 hex chars).',
        example: bytes32Example(),
        received: reportHash ?? null,
      });
    }

    const result = await registerReportOnChain(reportHash);
    return res.json({ ok: true, ...result });
  } catch (err) {
    // Vanligaste fallet: duplicate hash => kontraktet revertar "AlreadyRegistered"
    // Vi returnerar ett begripligt fel istället för stacktrace i UI.
    const msg = String(err?.message || '');
    if (msg.toLowerCase().includes('alreadyregistered')) {
      return res.status(409).json({
        ok: false,
        error: 'Report hash already registered on-chain.',
      });
    }

    next(err);
  }
});

// GET /api/chain/verify/:hash
router.get('/verify/:hash', async (req, res, next) => {
  try {
    const reportHash = req.params.hash;

    if (!isBytes32Hex(reportHash)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid reportHash. Expected bytes32 hex (0x + 64 hex chars).',
        example: bytes32Example(),
        received: reportHash,
      });
    }

    const result = await verifyReportOnChain(reportHash);
    return res.json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
