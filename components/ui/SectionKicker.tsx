import React from 'react';
import { cn } from '@/lib/utils';

interface SectionKickerProps {
  children: React.ReactNode;
  centered?: boolean;
  className?: string;
}

export function SectionKicker({ children, centered = false, className }: SectionKickerProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 font-mono text-[11.5px] font-semibold tracking-[0.08em] uppercase text-accent-terracotta mb-3.5',
        centered && 'justify-center w-full',
        className
      )}
    >
      <span className="w-3.5 h-[1px] bg-accent-terracotta inline-block" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
