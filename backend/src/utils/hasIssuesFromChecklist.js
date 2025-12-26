function isNotOkValue(value) {
  if (value === null || value === undefined) return false;

  const v = String(value).trim().toLowerCase();

  // Treat these as "not an issue" (assuming UI prevents submit until assessed)
  if (v === '' || v === 'na' || v === 'n/a' || v === 'not applicable')
    return false;

  // OK variants
  if (v === 'ok' || v === 'pass' || v === 'passed') return false;

  // NOT OK variants
  if (
    v === 'not ok' ||
    v === 'not_ok' ||
    v === 'not-ok' ||
    v === 'notok' ||
    v === 'fail' ||
    v === 'failed'
  ) {
    return true;
  }

  // If your system uses booleans sometimes:
  // true => OK, false => NOT OK
  if (typeof value === 'boolean') return value === false;

  // Default: unknown values are NOT treated as issues
  // (so we only route to manager when explicitly NOT OK)
  return false;
}

function hasIssuesFromChecklist(checklist) {
  if (!checklist) return false;

  // Case 1: checklist object map: { key: "OK" | "NOT_OK" | ... }
  if (
    !Array.isArray(checklist) &&
    typeof checklist === 'object' &&
    !checklist.items
  ) {
    return Object.values(checklist).some(isNotOkValue);
  }

  // Case 2: checklist wrapper: { items: [...] }
  if (
    checklist &&
    typeof checklist === 'object' &&
    Array.isArray(checklist.items)
  ) {
    return checklist.items.some((item) => {
      // prefer status/result fields if present
      const status = item?.status ?? item?.result;
      if (status !== undefined) return isNotOkValue(status);

      // fall back to booleans if present
      if (item?.notOk === true) return true;
      if (item?.ok === false) return true;

      return false;
    });
  }

  // Case 3: checklist is an array of items
  if (Array.isArray(checklist)) {
    return checklist.some((item) => {
      const status = item?.status ?? item?.result;
      if (status !== undefined) return isNotOkValue(status);

      if (item?.notOk === true) return true;
      if (item?.ok === false) return true;

      return false;
    });
  }

  return false;
}

module.exports = { hasIssuesFromChecklist };
