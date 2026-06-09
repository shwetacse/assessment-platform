import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

export function Badge({
  children, variant = 'default', className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger:  'bg-red-100 text-red-700',
    info:    'bg-blue-100 text-blue-700',
    purple:  'bg-purple-100 text-purple-700',
  };

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    DRAFT:       { label: 'Draft',       variant: 'default' },
    SCHEDULED:   { label: 'Scheduled',   variant: 'warning' },
    ACTIVE:      { label: 'Active',      variant: 'success' },
    COMPLETED:   { label: 'Completed',   variant: 'info' },
    IN_PROGRESS: { label: 'In Progress', variant: 'warning' },
    SUBMITTED:   { label: 'Submitted',   variant: 'info' },
    EVALUATED:   { label: 'Evaluated',   variant: 'success' },
    MCQ:         { label: 'MCQ',         variant: 'info' },
    DESCRIPTIVE: { label: 'Descriptive', variant: 'purple' },
    MIXED:       { label: 'Mixed',       variant: 'purple' },
  };

  const config = map[status] ?? { label: status, variant: 'default' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
