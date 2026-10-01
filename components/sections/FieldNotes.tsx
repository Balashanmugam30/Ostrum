import React from 'react';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { CornerCrosses } from '@/components/ui/CornerCrosses';
import { insightsData } from '@/content/insights';

export function FieldNotes() {
  return (
    <section
      id="insights"
      aria-labelledby="insights-title"
      className="py-24 sm:py-32 bg-canvas-pearl border-b border-border-subtle"
    >
      <div className="max-w-[1240px] mx-auto px-6 md:px-8">
        <SectionKicker>Chapter 14 // Studio Field Notes</SectionKicker>

        <h2
          id="insights-title"
          className="font-display font-bold text-3xl sm:text-4xl lg:text-[44px] leading-tight tracking-tight text-ink-primary mb-3"
        >
          Practical thinking on technology and business.
        </h2>

        <p className="text-base sm:text-lg text-ink-slate max-w-2xl mb-12 leading-relaxed">
          Perspectives from our engineering floor on building maintainable software that drives actual commercial results:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {insightsData.map((note) => (
            <article
              key={note.id}
              className="relative bg-surface-card border border-border-subtle rounded-2xl p-7 sm:p-8 shadow-subtle hover:border-border-strong hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
            >
              <CornerCrosses />

              <div>
                <span className="font-mono text-[11px] text-ink-muted uppercase tracking-wider block mb-3">
                  {note.topic} · {note.readTime}
                </span>

                <h3 className="font-display font-bold text-lg sm:text-xl text-ink-primary mb-3 leading-snug">
                  {note.title}
                </h3>

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
      </div>
    </section>
  );
}
