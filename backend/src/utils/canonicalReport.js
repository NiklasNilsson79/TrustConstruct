function sortObjectKeys(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;

  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
}

function canonicalizeReportForHash(report) {
  const inspection = report?.inspection ?? {};
  const checklist = inspection?.checklist ?? {};

  return {
    // Business data (stable)
    project: report?.project ?? '',
    location: report?.location ?? '',
    contractor: report?.contractor ?? '',

    // Inspection data (stable)
    inspection: {
      projectId: inspection?.projectId ?? '',
      apartmentId: inspection?.apartmentId ?? '',
      roomId: inspection?.roomId ?? '',
      componentId: inspection?.componentId ?? '',

      // Deterministic ordering to avoid hash mismatches caused by key order
      checklist: sortObjectKeys(checklist),

      // Keep comments only if we really want comment edits to break integrity.
      // If comments can be added later without "tampering", exclude it from hash instead.
      comments: inspection?.comments ?? '',
    },
  };
}

module.exports = { canonicalizeReportForHash };
