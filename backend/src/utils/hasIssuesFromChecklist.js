// backend/src/utils/hasIssuesFromChecklist.js

function normalizeValue(v) {
  if (v === null || v === undefined) return '';
  return String(v).trim().toUpperCase();
}

function isExplicitNotOk(value) {
  const v = normalizeValue(value);

  // Only treat explicit NOT_OK / NOT OK as an issue
  if (v === 'NOT_OK') return true;
  if (v === 'NOT OK') return true;

  return false;
}

function hasIssuesFromChecklist(checklist) {
  if (!checklist || typeof checklist !== 'object') return false;

  // If checklist is an array of items (defensive)
  if (Array.isArray(checklist)) {
    return checklist.some((item) => {
      if (!item) return false;

      // Common shapes
      if (isExplicitNotOk(item)) return true;
      if (isExplicitNotOk(item.value)) return true;
      if (isExplicitNotOk(item.status)) return true;
      if (isExplicitNotOk(item.result)) return true;

      return false;
    });
  }

  // Normal object: { surface_preparation: "OK", ... }
  return Object.values(checklist).some((val) => {
    // Sometimes val can be an object: { value: "OK" } etc
    if (val && typeof val === 'object') {
      const v1 = val.value ?? val.status ?? val.result;
      return isExplicitNotOk(v1);
    }

    return isExplicitNotOk(val);
  });
}

module.exports = { hasIssuesFromChecklist };
