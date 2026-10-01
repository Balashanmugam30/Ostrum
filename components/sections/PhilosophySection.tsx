import React from 'react';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { CornerCrosses } from '@/components/ui/CornerCrosses';

export function PhilosophySection() {
  const frictions = [
    {
      title: 'Spreadsheet Silos',
      desc: 'Customer details trapped in one Excel file while orders sit in another. Information goes missing and errors compound.',
    },
    {
      title: 'Delayed Follow-ups',
      desc: 'New inquiries take hours to be answered. Prospective clients move on to competitors who respond within seconds.',
    },
    {
      title: 'Manual Billing Chaos',
      desc: 'Store receipts don’t match bank entries. Accounting teams spend weekends reconciling inventory discrepancies.',
    },
    {
      title: 'Fragile Plugins',
      desc: 'Dozens of brittle third-party extensions break every time an update is pushed, leaving operations stranded.',
    },
  ];

  return (
    <section
      id="philosophy"
      aria-labelledby="philosophy-title"
      className="py-32 sm:py-44 bg-surface-bisque border-b border-border-subtle"
    >
      <div className="max-w-[1240px] mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Monumental Editorial Statement */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <SectionKicker>Chapter 04 // Operational Philosophy</SectionKicker>

            <span className="font-serif text-7xl text-accent-terracotta leading-none -mb-3 select-none" aria-hidden="true">
              “
            </span>

            <h2
              id="philosophy-title"
              className="font-display font-bold text-3xl sm:text-4xl lg:text-[44px] leading-[1.08] tracking-tight text-ink-primary"
            >
              You don&apos;t need more software. You need your software to{' '}
              <span className="font-serif italic font-normal text-accent-terracotta">
                talk to each other
              </span>
              .
            </h2>

            <p className="mt-6 text-base sm:text-lg text-ink-slate leading-relaxed">
              When your website, CRM, and WhatsApp don’t connect, your team spends their day copying data across spreadsheets instead of serving customers. We eliminate the busywork by uniting your tools into one cohesive engine.
            </p>
          </div>

          {/* Right Column: 4 Friction Cards Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {frictions.map((card, idx) => (
              <div
                key={idx}
                className="relative bg-surface-card border border-border-subtle rounded-xl p-6 sm:p-7 shadow-subtle hover:border-border-strong transition-all duration-200"
              >
                <CornerCrosses />
                <h3 className="font-display font-bold text-base sm:text-lg text-ink-primary mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-ink-slate leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
