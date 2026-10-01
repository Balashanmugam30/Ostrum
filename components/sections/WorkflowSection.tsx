import React from 'react';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { CornerCrosses } from '@/components/ui/CornerCrosses';

export function WorkflowSection() {
  const steps = [
    {
      num: 'STAGE 01',
      title: 'Listen & Map',
      desc: 'We examine your existing workflows, identify the points of manual friction, and draft a clean system architecture specification.',
    },
    {
      num: 'STAGE 02',
      title: 'Design & Prototype',
      desc: 'You review and click through interactive interface designs and system data flows before we write production code.',
    },
    {
      num: 'STAGE 03',
      title: 'Build & Connect',
      desc: 'We engineer the software, hook up the APIs, migrate your historical records, and conduct rigorous automated testing.',
    },
    {
      num: 'STAGE 04',
      title: 'Train & Launch',
      desc: 'We train your staff in plain language, deploy to secure cloud infrastructure, and stand by during launch week.',
    },
  ];

  return (
    <section
      id="workflow"
      aria-labelledby="workflow-title"
      className="py-32 sm:py-44 bg-canvas-pearl border-b border-border-subtle"
    >
      <div className="max-w-[1240px] mx-auto px-6 md:px-8">
        <SectionKicker>Chapter 10 // Execution Workflow</SectionKicker>

        <h2
          id="workflow-title"
          className="font-display font-bold text-3xl sm:text-4xl lg:text-[46px] leading-[1.08] tracking-tight text-ink-primary mb-4"
        >
          Clear stages. <span className="font-serif italic font-normal text-ink-primary/90">Zero guesswork</span>.
        </h2>

        <p className="text-base sm:text-lg text-ink-slate max-w-2xl mb-12 leading-relaxed">
          How we take your project from an initial conversation to reliable, production-ready software in structured milestones:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="relative bg-surface-card border border-border-subtle rounded-2xl p-7 sm:p-8 shadow-subtle flex flex-col justify-between hover:border-border-strong hover:-translate-y-0.5 transition-all duration-200"
            >
              <CornerCrosses />

              <div>
                <span className="font-mono text-xs font-semibold text-accent-terracotta tracking-wider block mb-3">
                  {s.num}
                </span>

                <h3 className="font-display font-bold text-lg sm:text-xl text-ink-primary mb-2.5">
                  {s.title}
                </h3>
                <p className="text-sm text-ink-slate leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
