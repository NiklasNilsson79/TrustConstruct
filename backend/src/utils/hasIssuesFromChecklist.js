function hasIssuesFromChecklist(checklist) {
  if (!checklist) return false;

  // Case 1: checklist är en "map" (objekt): { key: "OK" | "NOT_OK" | "Not OK" | ... }
  // Ex från ert projekt: { surface_preparation: "OK", ... }
  if (
    !Array.isArray(checklist) &&
    typeof checklist === 'object' &&
    !checklist.items
  ) {
    return Object.values(checklist).some((value) => {
      const v = String(value).trim().toLowerCase();

      // Godkända "OK"-varianter
      if (v === 'ok') return false;

      // Allt som inte är "ok" räknas som issue (t.ex. "not ok", "not_ok", "fail", etc)
      return true;
    });
  }

  // Case 2: checklist är array eller { items: [] }
  const items = Array.isArray(checklist) ? checklist : checklist?.items ?? [];

  return items.some((item) => {
    const status = (item?.status ?? item?.result ?? '')
      .toString()
      .trim()
      .toLowerCase();
    if (status) return status !== 'ok';

    if (item?.notOk === true) return true;
    if (item?.ok === false) return true;

    return false;
  });
}

module.exports = { hasIssuesFromChecklist };
