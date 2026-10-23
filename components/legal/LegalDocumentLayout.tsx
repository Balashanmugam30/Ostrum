'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { OstrumLogo } from '@/components/ui/OstrumLogo';
import { OstrumFooterReveal } from '@/components/sections/OstrumFooterReveal';

export interface LegalSectionItem {
  id: string;
  num: string;
  title: string;
}

export interface LegalDocumentLayoutProps {
  title: string;
  badge: string;
  effectiveDate: string;
  activeTab: 'terms' | 'privacy';
  sections: LegalSectionItem[];
  children: React.ReactNode;
}

export function LegalDocumentLayout({
  title,
  badge,
  effectiveDate,
  activeTab,
  sections,
  children,
}: LegalDocumentLayoutProps) {
  const [activeSectionId, setActiveSectionId] = useState<string>(
    sections[0]?.id || ''
  );
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // IntersectionObserver to track currently visible section
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sectionElements = sections
      .map((sec) => document.getElementById(sec.id))
      .filter(Boolean) as HTMLElement[];

    if (sectionElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find visible sections sorted by vertical position
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          const topEntry = visibleEntries.reduce((prev, curr) =>
            prev.boundingClientRect.top < curr.boundingClientRect.top ? prev : curr
          );
          if (topEntry?.target?.id) {
            setActiveSectionId(topEntry.target.id);
          }
        }
      },
      {
        rootMargin: '-10% 0px -70% 0px',
        threshold: 0,
      }
    );

    sectionElements.forEach((el) => observer.observe(el));
    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [sections]);

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();
    setMobileTocOpen(false);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (window.history.pushState) {
        window.history.pushState(null, '', `#${id}`);
      }
      setActiveSectionId(id);
    }
  };

  const activeSectionTitle =
    sections.find((s) => s.id === activeSectionId)?.title || sections[0]?.title;
  const activeSectionNum =
    sections.find((s) => s.id === activeSectionId)?.num || sections[0]?.num;

  return (
    <div className="legal-page min-h-screen bg-[#FAF7F2] text-[#2D3139] antialiased selection:bg-[#42100F] selection:text-[#FFF8F3]">
      {/* Top Editorial Flow (No Full-Width Sticky Bar) */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6 sm:pb-8">
        {/* Restrained Standalone OSTRUM Wordmark linking to Home */}
        <div className="pb-8">
          <Link
            href="/"
            className="inline-block transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D24B2C] rounded"
            aria-label="OSTRUM Home"
          >
            <div className="w-24 sm:w-28 text-[#161514]">
              <OstrumLogo className="text-[#161514]" />
            </div>
          </Link>
        </div>

        {/* Hero / Document Header */}
        <header className="pt-10 sm:pt-14 pb-10 sm:pb-12 max-w-4xl transition-all duration-700 ease-out">
          <p className="font-mono text-xs uppercase tracking-[0.22em] font-bold text-[#64120F] mb-3">
            {badge}
          </p>
          <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-[#050505] leading-[1.1] mb-5">
            {title}
          </h1>
          <div className="flex items-center text-xs font-mono text-[#706864]">
            <span>Last updated: {effectiveDate}</span>
          </div>
        </header>

        {/* Multi-Column Table of Contents Overview Card */}
        <section
          data-testid="table-of-contents-overview"
          aria-label="Table of Contents Overview"
          className="mb-12 sm:mb-16 rounded-2xl bg-white border border-[#E5DFD7] p-6 sm:p-8 shadow-[0_4px_20px_-8px_rgba(22,21,20,0.04)]"
        >
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 mb-6 border-b border-[#EFEBE5]">
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] font-bold text-[#161514]">
              Table of Contents ({sections.length} Sections)
            </h2>
            <p className="font-sans text-xs text-[#706864]">
              Select any section to jump directly to its provisions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 font-sans text-xs sm:text-[13px]">
            {sections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                onClick={(e) => handleLinkClick(e, sec.id)}
                className="group flex items-baseline gap-2.5 py-1.5 px-2 rounded-lg text-[#302A28] hover:text-[#050505] hover:bg-[#FAF7F2] transition-colors"
              >
                <span className="font-mono text-[11px] font-semibold text-[#64120F] shrink-0">
                  {sec.num}
                </span>
                <span className="group-hover:underline underline-offset-4 line-clamp-1">
                  {sec.title}
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* Mobile Sticky Section Indicator & TOC Drawer Button */}
        <div className="lg:hidden sticky top-4 z-30 mb-6">
          <div className="p-3 rounded-xl bg-white/95 backdrop-blur-md border border-[#E5DFD7] shadow-md flex items-center justify-between gap-3">
            <div className="min-w-0 flex items-baseline gap-2">
              <span className="font-mono text-[10px] font-bold text-[#64120F]">
                {activeSectionNum}
              </span>
              <span className="font-sans text-xs font-semibold text-[#161514] truncate">
                {activeSectionTitle}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileTocOpen(!mobileTocOpen)}
              className="shrink-0 px-2.5 py-1 rounded-md font-mono text-[11px] uppercase tracking-wider bg-[#FAF7F2] hover:bg-[#EFEBE5] text-[#161514] border border-[#E5DFD7] font-medium transition-colors"
              aria-expanded={mobileTocOpen}
            >
              {mobileTocOpen ? 'Close ✕' : 'Contents ▾'}
            </button>
          </div>

          {/* Collapsible Mobile TOC Drawer */}
          {mobileTocOpen && (
            <div className="mt-2 p-4 rounded-xl bg-white border border-[#E5DFD7] shadow-xl max-h-[60vh] overflow-y-auto space-y-1 text-xs">
              {sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  onClick={(e) => handleLinkClick(e, sec.id)}
                  className={`flex items-baseline gap-2.5 py-2 px-2.5 rounded-lg transition-colors ${
                    activeSectionId === sec.id
                      ? 'bg-[#FAF7F2] text-[#050505] font-semibold'
                      : 'text-[#706864] hover:text-[#050505]'
                  }`}
                >
                  <span className="font-mono text-[11px] font-semibold text-[#D24B2C]">
                    {sec.num}
                  </span>
                  <span className="truncate">{sec.title}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Two-Column Grid: Sticky Sidebar + Editorial Surface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Desktop Left Rail: Sticky Section Index */}
          <aside
            data-testid="sticky-legal-sidebar"
            className="hidden lg:block lg:col-span-3 lg:sticky lg:top-8"
          >
            <div className="p-5 rounded-2xl bg-white border border-[#E5DFD7] shadow-sm">
              <div className="pb-3 mb-3 border-b border-[#EFEBE5] flex items-center justify-between">
                <h3 className="font-mono text-[11px] uppercase tracking-wider font-bold text-[#161514]">
                  On This Page
                </h3>
                <span className="font-mono text-[10px] text-[#706864]">
                  {sections.length} parts
                </span>
              </div>
              <nav
                className="space-y-1 font-sans text-xs max-h-[calc(100vh-140px)] overflow-y-auto pr-1 select-none scrollbar-thin"
                aria-label="Section Index"
              >
                {sections.map((sec) => {
                  const isCurrent = activeSectionId === sec.id;
                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      onClick={(e) => handleLinkClick(e, sec.id)}
                      className={`flex items-baseline gap-2 py-1.5 px-2 rounded-lg transition-all duration-150 ${
                        isCurrent
                          ? 'bg-[#FAF7F2] text-[#050505] font-semibold shadow-xs border-l-2 border-[#64120F]'
                          : 'text-[#706864] hover:text-[#050505] hover:bg-[#FAF7F2]/60'
                      }`}
                    >
                      <span
                        className={`font-mono text-[11px] shrink-0 ${
                          isCurrent
                            ? 'text-[#64120F] font-bold'
                            : 'text-[#9CA3AF]'
                        }`}
                      >
                        {sec.num}
                      </span>
                      <span className="truncate">{sec.title}</span>
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Reading Column: Solid White Architectural Reading Surface */}
          <main className="lg:col-span-9 bg-white border border-[#E5DFD7] rounded-3xl p-6 sm:p-10 md:p-14 shadow-[0_12px_40px_-15px_rgba(22,21,20,0.06)]">
            <article className="space-y-12 sm:space-y-14 font-sans text-[15px] sm:text-base leading-relaxed text-[#302A28]">
              {children}
            </article>
          </main>
        </div>
      </div>

      {/* Real Theatre-Curtain Reveal without CTA: Warm-ivory mask (#FAF7F2) lifts to reveal Studio Footer (#64120F) */}
      <OstrumFooterReveal showCTA={false} />
    </div>
  );
}

export default LegalDocumentLayout;