'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RollingButton } from '@/components/ui/RollingButton';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-canvas-warm p-6 overflow-y-auto"
    >
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <Link href="/" onClick={onClose} className="font-display font-extrabold text-xl text-ink-primary">
          OSTRUM
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-ink-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-terracotta rounded-md"
          aria-label="Close mobile navigation menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <nav aria-label="Mobile Navigation Links" className="my-8 flex flex-col gap-4">
        {[
          { label: 'Philosophy', href: '#philosophy' },
          { label: 'Disciplines', href: '#capabilities' },
          { label: 'Work', href: '#works' },
          { label: 'Architecture', href: '#blueprint' },
          { label: 'Tooling Stack', href: '#stack' },
          { label: 'Workflow', href: '#workflow' },
          { label: 'Studio Genesis', href: '#about' },
          { label: 'Client Proof', href: '#proof' },
          { label: 'Engagement Models', href: '#pricing' },
          { label: 'Field Notes', href: '#insights' },
          { label: 'Critical Inquiries (FAQ)', href: '#faq' },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="font-display text-2xl font-bold text-ink-primary hover:text-accent-terracotta transition-colors py-1"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="border-t border-border-subtle pt-6 flex flex-col gap-4">
        <StatusBadge label="CURRENT STATUS: ACCEPTING NEW PROJECTS" variant="sage" />
        <RollingButton
          href="#brief"
          variant="terracotta"
          className="w-full justify-center py-3.5"
          onClick={onClose}
        >
          Initiate Project Brief ↗
        </RollingButton>
      </div>
    </div>
  );
}
