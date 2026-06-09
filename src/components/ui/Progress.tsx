import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  label?: string;
}

export function Progress({
  value, max = 100, className, barClassName, showLabel, label,
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const getColor = () => {
    if (pct >= 80) return 'bg-green-500';
    if (pct >= 60) return 'bg-blue-500';
    if (pct >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">{label}</span>
          <span className="font-medium text-gray-700">{Math.round(pct)}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', getColor(), barClassName)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
