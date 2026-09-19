'use client';

import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, badge, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        {badge && (
          <div className="flex items-center gap-2 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] mono uppercase tracking-[0.2em] text-primary/80">
              {badge}
            </span>
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

interface ScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
  colorClass?: string;
}

export function ScoreGauge({ score, size = 140, label, colorClass }: ScoreGaugeProps) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = colorClass ?? (score >= 90 ? '#3fb950' : score >= 70 ? '#d4a843' : score >= 40 ? '#e3b341' : '#f85149');
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={6}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold" style={{ color }}>
          {score}
        </span>
        <span className="text-[10px] mono uppercase tracking-wider text-muted-foreground">%</span>
        {label && <span className="text-[10px] mono uppercase tracking-wider mt-1" style={{ color }}>{label}</span>}
      </div>
    </div>
  );
}

interface StatusDotProps {
  status: 'pass' | 'warning' | 'fail';
  className?: string;
}

export function StatusDot({ status, className }: StatusDotProps) {
  const color =
    status === 'pass'
      ? 'bg-success'
      : status === 'warning'
      ? 'bg-warning'
      : 'bg-destructive';
  return <span className={cn('inline-block h-2 w-2 rounded-full', color, className)} />;
}

interface TechCardProps {
  children: React.ReactNode;
  className?: string;
  cornerMarks?: boolean;
}

export function TechCard({ children, className, cornerMarks }: TechCardProps) {
  return (
    <div
      className={cn(
        'relative panel overflow-hidden',
        cornerMarks && 'corner-marks',
        className
      )}
    >
      {children}
    </div>
  );
}
