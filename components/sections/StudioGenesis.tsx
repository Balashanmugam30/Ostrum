import React from 'react';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { CornerCrosses } from '@/components/ui/CornerCrosses';

export function StudioGenesis() {
  const principles = [
    {
      title: 'Senior Leadership on Every Project',
      desc: 'Your systems are designed and coded by seasoned specialists—never passed off to an anonymous junior team.',
    },
    {
      title: 'Plain English, Always',
      desc: 'We explain technical trade-offs in terms of business impact, timeline, and cost. Zero consulting fluff.',
    },
    {
      title: 'Zero Proprietary Lock-In',
      desc: 'You own all code, repositories, and credentials. If you ever choose to bring engineering in-house, your codebase is ready.',
    },
  ];

  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="py-24 sm:py-32 bg-surface-bisque border-b border-border-subtle"
    >
      <div className="max-w-[1240px] mx-auto px-6 md:px-8">
        <SectionKicker>Chapter 11 // Studio Genesis</SectionKicker>

        <h2
          id="about-title"
          className="font-display font-bold text-3xl sm:text-4xl lg:text-[44px] leading-tight tracking-tight text-ink-primary mb-10"
        >
          Why we started Ostrum.
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Narrative Story */}
          <div className="lg:col-span-6 flex flex-col gap-6 text-ink-slate text-base sm:text-lg leading-relaxed">
            <p>
              We saw too many ambitious businesses held back by fragmented software. Large enterprise corporations hire $500k consultancy firms; small companies are left struggling with fragile freelancers and clunky off-the-shelf tools.
            </p>
            <p>
              Ostrum was founded to bridge this gap: offering world-class design craft and enterprise-grade software engineering at honest, transparent rates.
            </p>
            <p>
              Every project is led directly by senior practitioners. We write clean, documented code, respect your team&apos;s existing habits, and transfer 100% intellectual property to your business.
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
