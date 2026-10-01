import React from 'react';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { CornerCrosses } from '@/components/ui/CornerCrosses';
import { RollingButton } from '@/components/ui/RollingButton';

export function ClientProof() {
  const proofs = [
    {
      title: 'Architectural Verification',
      desc: 'Our featured case studies (Campus360, Aura Living, Greenfield) represent complete architectural blueprints built to demonstrate our engineering rigor.',
    },
    {
      title: 'Automated Code Benchmarks',
      desc: 'All production code passes strict TypeScript linting, automated security vulnerability audits, and accessibility standards (WCAG 2.2 AA) prior to handover.',
    },
    {
      title: 'Principal Milestone Signoff',
      desc: 'We structure projects in verified functional milestones. You test and inspect working software at every stage before milestone signoff.',
    },
  ];

  return (
    <section
      id="proof"
      aria-labelledby="proof-title"
      className="py-32 sm:py-44 bg-canvas-pearl border-b border-border-subtle"
    >
      <div className="max-w-[1240px] mx-auto px-6 md:px-8">
        <SectionKicker>Chapter 12 // Client Proof & Standards</SectionKicker>

        <h2
          id="proof-title"
          className="font-display font-bold text-3xl sm:text-4xl lg:text-[46px] leading-[1.08] tracking-tight text-ink-primary mb-4"
        >
          Structured for <span className="font-serif italic font-normal text-ink-primary/90">transparency</span>.
        </h2>

        <p className="text-base sm:text-lg text-ink-slate max-w-2xl mb-12 leading-relaxed">
          We operate with strict editorial integrity. We do not invent artificial metrics, fake endorsements, or stock photography:
        </p>

        <div className="relative bg-surface-card border border-border-subtle rounded-2xl p-8 sm:p-12 shadow-card">
          <CornerCrosses />

          {/* Availability Callout Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border-subtle pb-8 mb-10">
            <div>
              <span className="font-mono text-xs font-semibold text-accent-sage uppercase tracking-wider block mb-1">
                CURRENT STATUS // SELECT ENGAGEMENTS OPEN
              </span>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-ink-primary">
                Partner Directly with Founding Principals
              </h3>
            </div>
            <RollingButton
              href="#brief"
              variant="secondary"
              className="py-2.5 px-6 text-sm"
              subLabel="Direct Principal Stewardship"
            >
              Discuss Engagement
            </RollingButton>
          </div>

          {/* 3 Proof Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {proofs.map((item, idx) => (
              <div
                key={idx}
                className="bg-canvas-pearl border border-border-subtle rounded-xl p-6 sm:p-8 flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-display font-bold text-lg text-ink-primary mb-2.5">
                    {item.title}
                  </h4>
                  <p className="text-sm text-ink-slate leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
