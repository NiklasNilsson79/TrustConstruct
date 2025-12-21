function canonicalizeReportForHash(report) {
  // Endast fält som ska ingå i hash.
  // Viktigt: inga "volatile" fält (t.ex. _id, __v, eller annat som kan ändras).
  return {
    id: report.id,
    status: report.status,
    project: report.project,
    location: report.location,
    contractor: report.contractor,
    createdAt: report.createdAt,
    inspection: report.inspection ?? null,
  };
}

module.exports = { canonicalizeReportForHash };
