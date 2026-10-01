'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface RollingButtonProps {
  children: React.ReactNode;
  href?: string;
  subLabel?: string;
  variant?: 'primary' | 'terracotta' | 'secondary';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
}

export function RollingButton({
  children,
  href,
  subLabel,
  variant = 'terracotta',
  className,
  onClick,
  type = 'button',
  ariaLabel,
}: RollingButtonProps) {
  const variantStyles = {
    primary: 'bg-gradient-to-b from-[#1C1B1A] to-[#111010] text-white shadow-md hover:shadow-lg',
    terracotta: 'bg-accent-terracotta text-white shadow-md hover:bg-accent-terracotta-hover hover:shadow-lg',
    secondary: 'bg-surface-card text-ink-primary border border-border-subtle shadow-subtle hover:bg-surface-bisque hover:border-border-strong',
  }[variant];

  const content = (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          'group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-medium tracking-tight overflow-hidden transition-all duration-300 ease-out cursor-pointer',
          variantStyles,
          className
        )}
      >
        <span className="relative flex flex-col overflow-hidden h-[1.3em]">
          <span className="inline-block transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">
            {children}
          </span>
          <span
            aria-hidden="true"
            className="absolute top-0 left-0 inline-block transform translate-y-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0"
          >
            {children}
          </span>
        </span>

        <span className="relative flex flex-col overflow-hidden h-[1.3em] font-mono text-xs">
          <span className="inline-block transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">
            ↗
          </span>
          <span
            aria-hidden="true"
            className="absolute top-0 left-0 inline-block transform translate-y-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0"
          >
            ↗
          </span>
        </span>
      </div>

      {subLabel && (
        <span className="mt-2 font-mono text-[11px] text-ink-muted tracking-tight text-center">
          {subLabel}
        </span>
      )}
    </div>
  );

  if (href) {
    if (href.startsWith('#')) {
      return (
        <a href={href} aria-label={ariaLabel} className="inline-block" onClick={onClick}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} aria-label={ariaLabel} className="inline-block" onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} aria-label={ariaLabel} className="inline-block" onClick={onClick}>
      {content}
    </button>
  );
}
