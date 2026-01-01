import { cn, getConfidenceLevel } from '../../lib/utils';

interface ConfidenceBadgeProps {
  score: number;
  showLabel?: boolean;
  className?: string;
}

export default function ConfidenceBadge({
  score,
  showLabel = false,
  className,
}: ConfidenceBadgeProps) {
  const { label, color, bgColor } = getConfidenceLevel(score);

  return (
    <div
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        bgColor,
        color,
        className
      )}
      title={`Confiança: ${score}% - ${label}`}
    >
      <span className="font-bold">{score}%</span>
      {showLabel && <span className="ml-1">{label}</span>}
    </div>
  );
}
