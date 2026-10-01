import React from 'react';
import Link from 'next/link';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { CornerCrosses } from '@/components/ui/CornerCrosses';
import { RollingButton } from '@/components/ui/RollingButton';
import { capabilitiesData } from '@/content/capabilities';

export const metadata = {
  title: 'Disciplines & Capabilities — Ostrum',
  description: 'Detailed breakdown of Ostrum studio capabilities: ERP/CRM systems, practical AI automation, modern websites, and brand systems.',
};

export default function ServicesPage() {
  const keys = Object.keys(capabilitiesData);

  return (
    <div className="py-20 sm:py-28 bg-canvas-warm">
      <div className="max-w-[1240px] mx-auto px-6 md:px-8">
        <SectionKicker>Studio Disciplines</SectionKicker>

        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-ink-primary tracking-tight mb-4">
          Capabilities & Connected Systems
        </h1>

        <p className="text-base sm:text-lg text-ink-slate max-w-2xl mb-14 leading-relaxed">
          We combine bespoke design craft with robust software engineering to build business ecosystems where every tool talks to each other.
        </p>

        <div className="flex flex-col gap-12 mb-16">
          {keys.map((k) => {
            const disc = capabilitiesData[k];
            return (
              <section
                key={k}
                id={disc.id}
                className="relative bg-surface-card border border-border-subtle rounded-2xl p-8 sm:p-12 shadow-subtle"
              >
                <CornerCrosses />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-6 mb-8">
                  <div>
                    <span className="font-mono text-xs font-semibold text-accent-terracotta tracking-wider uppercase block mb-1">
                      DISCIPLINE {disc.number}
                    </span>
                    <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink-primary">
                      {disc.name}
                    </h2>
                  </div>
                  <p className="text-sm text-ink-slate max-w-md">
                    {disc.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {disc.items.map((item, idx) => (
                    <div key={idx} className="bg-canvas-pearl border border-border-subtle rounded-xl p-6">
                      <h3 className="font-display font-bold text-base sm:text-lg text-ink-primary mb-2">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-ink-slate leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="text-center bg-surface-bisque border border-border-subtle rounded-2xl p-10">
          <h3 className="font-display font-bold text-2xl text-ink-primary mb-2">
            Need an integrated capability stack?
          </h3>
          <p className="text-sm text-ink-slate mb-6">
            We will design a custom scope tailored to your operational roadmap.
          </p>
          <RollingButton href="/#brief" variant="terracotta">
            Initiate Project Brief ↗
          </RollingButton>
        </div>
      </div>
    </div>
  );
}
