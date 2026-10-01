import React from 'react';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { CornerCrosses } from '@/components/ui/CornerCrosses';
import { RollingButton } from '@/components/ui/RollingButton';

export function DeepDiveBlueprint() {
  const layers = [
    {
      layer: 'LAYER 01',
      title: 'Client Touchpoints',
      color: 'text-accent-terracotta',
      desc: 'Responsive Next.js 15 Web Portal, Parent WhatsApp Channel, and Campus Invoicing Terminals.',
    },
    {
      layer: 'LAYER 02',
      title: 'Edge Gateway & Auth',
      color: 'text-accent-indigo',
      desc: 'Encrypted role-based access control (Admin, Teacher, Parent) with zero sensitive data leaks.',
    },
    {
      layer: 'LAYER 03',
      title: 'Business Core & Logic',
      color: 'text-accent-sage',
      desc: 'Automated tuition invoicing, attendance tracking, and syllabus distribution engines.',
    },
    {
      layer: 'LAYER 04',
      title: 'PostgreSQL Database',
      color: 'text-accent-amber',
      desc: 'Single authoritative source of truth with continuous automated offsite encrypted backups.',
    },
  ];

  return (
    <section
      id="blueprint"
      aria-labelledby="blueprint-title"
      className="py-32 sm:py-44 bg-canvas-pearl border-b border-border-subtle"
    >
      <div className="max-w-[1240px] mx-auto px-6 md:px-8">
        <SectionKicker>Chapter 08 // Technical Architecture</SectionKicker>

        <h2
          id="blueprint-title"
          className="font-display font-bold text-3xl sm:text-4xl lg:text-[46px] leading-[1.08] tracking-tight text-ink-primary mb-4"
        >
          Architectural Blueprint: <span className="font-serif italic font-normal text-ink-primary/90">Campus360</span>
        </h2>

        <p className="text-base sm:text-lg text-ink-slate max-w-2xl mb-12 leading-relaxed">
          A rigorous examination into how we engineered a complete operational backbone for education: separating concern layers to maintain high security, sub-second responses, and effortless staff usability.
        </p>

        <div className="relative bg-surface-card border border-border-subtle rounded-2xl p-8 sm:p-12 shadow-card">
          <CornerCrosses />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {layers.map((l, idx) => (
              <div
                key={idx}
                className="bg-canvas-warm border border-border-subtle rounded-xl p-6 relative flex flex-col justify-between"
              >
                <div>
                  <span className={`font-mono text-xs font-semibold tracking-wider ${l.color} block mb-2`}>
                    {l.layer}
                  </span>
                  <h3 className="font-display font-bold text-base text-ink-primary mb-2">
                    {l.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-ink-slate leading-relaxed">
                    {l.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border-subtle pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <span className="text-sm font-medium text-ink-slate text-center sm:text-left">
              Want a high-performance system blueprint like this customized for your organization?
            </span>
            <RollingButton
              href="#brief"
              variant="primary"
              className="py-2.5 px-6 text-sm"
              subLabel="Comprehensive Technical Consultation"
            >
              Request Architecture Review
            </RollingButton>
          </div>
        </div>
      </div>
    </section>
  );
}
