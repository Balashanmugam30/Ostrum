'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RollingButton } from '@/components/ui/RollingButton';
import { MobileNav } from '@/components/layout/MobileNav';

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        role="banner"
        className={`sticky top-0 z-50 w-full transition-all duration-200 border-b ${
          isScrolled
            ? 'bg-canvas-warm/95 backdrop-blur-md border-border-subtle shadow-xs py-3'
            : 'bg-canvas-warm/80 backdrop-blur-sm border-transparent py-4'
        }`}
      >
        <div className="max-w-[1240px] mx-auto px-6 md:px-8 flex items-center justify-between gap-4">
          {/* Brand Mark */}
          <Link
            href="/"
            className="flex items-center gap-3 text-ink-primary hover:opacity-85 transition-opacity"
            aria-label="Ostrum Studio Home"
          >
            <span className="font-display font-extrabold text-xl tracking-tight text-ink-primary">
              OSTRUM
            </span>
            <span className="hidden sm:inline-block border-l border-border-strong pl-3 font-mono text-[11px] text-ink-muted uppercase tracking-wider">
              Studio Craft · Engineering
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Primary Navigation" className="hidden lg:flex items-center gap-6">
            <a href="#philosophy" className="text-sm font-medium text-ink-slate hover:text-ink-primary transition-colors">
              Philosophy
            </a>
            <a href="#capabilities" className="text-sm font-medium text-ink-slate hover:text-ink-primary transition-colors">
              Disciplines
            </a>
            <a href="#works" className="text-sm font-medium text-ink-slate hover:text-ink-primary transition-colors">
              Work
            </a>
            <a href="#blueprint" className="text-sm font-medium text-ink-slate hover:text-ink-primary transition-colors">
              Architecture
            </a>
            <a href="#stack" className="text-sm font-medium text-ink-slate hover:text-ink-primary transition-colors">
              Stack
            </a>
            <a href="#workflow" className="text-sm font-medium text-ink-slate hover:text-ink-primary transition-colors">
              Process
            </a>
            <a href="#about" className="text-sm font-medium text-ink-slate hover:text-ink-primary transition-colors">
              Studio
            </a>
            <a href="#pricing" className="text-sm font-medium text-ink-slate hover:text-ink-primary transition-colors">
              Engagement
            </a>
            <a href="#faq" className="text-sm font-medium text-ink-slate hover:text-ink-primary transition-colors">
              Inquiries
            </a>
          </nav>

          {/* Header Action Items */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:block">
              <StatusBadge label="AVAILABLE FOR Q2/Q3" variant="sage" />
            </div>

            <RollingButton
              href="#brief"
              variant="primary"
              className="py-2 px-4.5 text-[13.5px]"
              ariaLabel="Initiate Project Brief"
            >
              Start Brief
            </RollingButton>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-ink-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-terracotta rounded-md"
              aria-label="Open mobile navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Accessible Mobile Drawer Navigation */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
