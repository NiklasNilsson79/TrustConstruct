export type ReportStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export default function StatusBadge({ status }: { status: ReportStatus }) {
  const labelMap: Record<ReportStatus, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    approved: 'Approved',
    rejected: 'Rejected',
  };

  const classMap: Record<ReportStatus, string> = {
    draft: 'bg-muted text-muted-foreground border border-border',
    submitted: 'bg-primary/10 text-primary border border-primary/20',
    approved: 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-700 border border-red-500/20',
  };

  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        classMap[status],
      ].join(' ')}>
      {labelMap[status]}
    </span>
  );
}
