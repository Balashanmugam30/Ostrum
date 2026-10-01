import React from 'react';
import Link from 'next/link';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { CornerCrosses } from '@/components/ui/CornerCrosses';
import { RollingButton } from '@/components/ui/RollingButton';
import { insightsData } from '@/content/insights';

export const metadata = {
  title: 'Engineering Field Notes & Insights — Ostrum',
  description: 'Practical essays and engineering perspectives on business systems, campus operations, and practical automation.',
};

export default function InsightsPage() {
  return (
    <div className="py-20 sm:py-28 bg-canvas-warm">
      <div className="max-w-[1240px] mx-auto px-6 md:px-8">
        <SectionKicker>Studio Field Notes</SectionKicker>

        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-ink-primary tracking-tight mb-4">
          Field Notes & Technical Perspectives
        </h1>

        <p className="text-base sm:text-lg text-ink-slate max-w-2xl mb-14 leading-relaxed">
          Observations from our engineering floor on building maintainable software that drives actual commercial results:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {insightsData.map((note) => (
            <article
              key={note.id}
              className="relative bg-surface-card border border-border-subtle rounded-2xl p-8 shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
            >
              <CornerCrosses />

              <div>
                <span className="font-mono text-[11px] text-ink-muted uppercase tracking-wider block mb-3">
                  {note.topic} · {note.readTime}
                </span>

                <h2 className="font-display font-bold text-xl text-ink-primary mb-3 leading-snug">
                  <Link href={`/insights/${note.slug}`} className="hover:text-accent-terracotta transition-colors">
                    {note.title}
                  </Link>
                </h2>

                <p className="text-sm text-ink-slate leading-relaxed mb-6">
                  {note.excerpt}
                </p>
              </div>

              <div className="border-t border-border-subtle pt-4 flex items-center justify-between text-xs font-mono text-accent-terracotta font-semibold">
                <span>Read Note</span>
                <span>↗</span>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center bg-surface-card border border-border-subtle rounded-2xl p-10">
          <h3 className="font-display font-bold text-2xl text-ink-primary mb-2">
            Stay updated with our technical essays
          </h3>
          <p className="text-sm text-ink-slate mb-6">
            We publish quarterly deep-dives into modern web architectures, database optimization, and workflow automation.
          </p>
          <RollingButton href="/#brief" variant="secondary">
            Inquire or Subscribe ↗
          </RollingButton>
        </div>
      </div>
    </div>
  );
}
