const { keccak256, toUtf8Bytes } = require('ethers');
const { canonicalizeReportForHash } = require('./canonicalReport');

function sortKeysDeep(value) {
  // FIX: treat Date as primitive
  if (value instanceof Date) return value.toISOString();

  if (Array.isArray(value)) return value.map(sortKeysDeep);

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortKeysDeep(value[key]);
        return acc;
      }, {});
  }

  return value;
}

function stableStringify(obj) {
  return JSON.stringify(sortKeysDeep(obj));
}

function keccak256Hex(data) {
  return keccak256(toUtf8Bytes(data));
}

function hashReport(report) {
  const canonical = canonicalizeReportForHash(report);
  const payload = stableStringify(canonical);
  const hash = keccak256Hex(payload);

  return { canonical, payload, hash };
}

module.exports = { hashReport, stableStringify, sortKeysDeep };
