import React from 'react';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { CornerCrosses } from '@/components/ui/CornerCrosses';

export function StudioGenesis() {
  const principles = [
    {
      title: 'Senior Engineering on Every Project',
      desc: 'Your systems are architected and coded by seasoned practitioners—never passed off to an anonymous junior team.',
    },
    {
      title: 'Direct Technical Communication',
      desc: 'We explain architectural trade-offs in terms of business velocity, timeline, and operational efficiency. Zero agency jargon.',
    },
    {
      title: 'Complete Source Code Ownership',
      desc: 'You own all code, repositories, schemas, and credentials. Your engineering foundation is always fully sovereign and exportable.',
    },
  ];

  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="py-32 sm:py-44 bg-surface-bisque border-b border-border-subtle"
    >
      <div className="max-w-[1240px] mx-auto px-6 md:px-8">
        <SectionKicker>Chapter 11 // Studio Genesis</SectionKicker>

        <h2
          id="about-title"
          className="font-display font-bold text-3xl sm:text-4xl lg:text-[46px] leading-[1.08] tracking-tight text-ink-primary mb-12"
        >
          Why we built <span className="font-serif italic font-normal text-ink-primary/90">Ostrum</span>.
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Narrative Story */}
          <div className="lg:col-span-6 flex flex-col gap-6 text-ink-slate text-base sm:text-lg leading-relaxed">
            <p>
              We observed too many ambitious businesses held back by fragmented software. Large enterprises contract bloated consultancies; smaller growing firms are left stranded between fragile plug-ins and clunky off-the-shelf subscriptions.
            </p>
            <p>
              Ostrum was founded to bridge this divide: providing world-class design craft and enterprise-grade custom engineering with direct founder stewardship and transparent collaboration.
            </p>
            <p>
              Every engagement is led directly by senior practitioners. We write clean, documented code, respect your team&apos;s existing habits, and transfer full source code and intellectual property to your company.
            </p>
          </div>

          {/* Right Column: 3 Core Principles */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            {principles.map((p, idx) => (
              <div
                key={idx}
                className="relative bg-surface-card border border-border-subtle rounded-xl p-6 sm:p-7 shadow-subtle"
              >
                <CornerCrosses />
                <h3 className="font-display font-bold text-lg text-ink-primary mb-2">
                  {p.title}
                </h3>
                <p className="text-sm text-ink-slate leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
