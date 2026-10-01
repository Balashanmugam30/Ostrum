import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  label: string;
  variant?: 'sage' | 'terracotta' | 'amber';
  className?: string;
}

export function StatusBadge({ label, variant = 'sage', className }: StatusBadgeProps) {
  const styles = {
    sage: {
      wrap: 'bg-accent-sage-tint text-accent-sage border-accent-sage/20',
      dot: 'bg-accent-sage',
    },
    terracotta: {
      wrap: 'bg-accent-terracotta-tint text-accent-terracotta border-accent-terracotta/20',
      dot: 'bg-accent-terracotta',
    },
    amber: {
      wrap: 'bg-amber-50 text-accent-amber border-accent-amber/20',
      dot: 'bg-accent-amber',
    },
  }[variant];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full border font-mono text-[11.5px] font-medium tracking-tight',
        styles.wrap,
        className
      )}
    >
      <span className={cn('w-2 h-2 rounded-full animate-pulse', styles.dot)} />
      <span>{label}</span>
    </div>
  );
}
