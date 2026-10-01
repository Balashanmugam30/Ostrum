import React from 'react';

export function MetricsBar() {
  const principles = [
    {
      tag: 'OWNERSHIP',
      headline: 'Full IP & Source Transfer',
      desc: '100% codebase, schema, and design ownership. Zero proprietary seat licenses or vendor lock-in.',
    },
    {
      tag: 'PERFORMANCE',
      headline: 'Edge-First Architecture',
      desc: 'Next.js 15 App Router deployed to distributed edge networks for instantaneous page and API response.',
    },
    {
      tag: 'STEWARDSHIP',
      headline: 'Direct Senior Engineering',
      desc: 'Bespoke systems built directly by experienced practitioners without delegated agency bureaucracy.',
    },
    {
      tag: 'CONTINUITY',
      headline: 'Unified Connected Systems',
      desc: 'Zero data silos. Seamless integration across databases, messaging APIs, billing, and operational tools.',
    },
  ];

  return (
    <section 
      className="border-y border-border-subtle bg-surface-base/80 backdrop-blur-sm py-12 md:py-16" 
      aria-label="Core Engineering Principles"
    >
      <div className="max-w-[1240px] mx-auto px-6 md:px-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-terracotta" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">
            ARCHITECTURAL STANDARDS // ZERO VENDOR LOCK-IN
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {principles.map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                idx !== 0 ? 'lg:border-l lg:border-border-subtle lg:pl-8' : ''
              }`}
            >
              <span className="font-mono text-[10px] tracking-widest uppercase text-accent-terracotta mb-2 font-semibold">
                {item.tag}
              </span>
              <h3 className="font-sans font-semibold text-lg text-ink-primary tracking-tight mb-2">
                {item.headline}
              </h3>
              <p className="text-[13px] font-normal text-ink-slate leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
