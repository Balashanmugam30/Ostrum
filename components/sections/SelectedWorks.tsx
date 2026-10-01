import React from 'react';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { CornerCrosses } from '@/components/ui/CornerCrosses';
import { projectsData } from '@/content/projects';

export function SelectedWorks() {
  return (
    <section
      id="works"
      aria-labelledby="works-title"
      className="py-24 sm:py-32 bg-canvas-cool border-b border-border-subtle"
    >
      <div className="max-w-[1240px] mx-auto px-6 md:px-8">
        <SectionKicker>Chapter 06 // Selected Works</SectionKicker>

        <h2
          id="works-title"
          className="font-display font-bold text-3xl sm:text-4xl lg:text-[44px] leading-tight tracking-tight text-ink-primary mb-3"
        >
          Proof of technical craft.
        </h2>

        <p className="text-base sm:text-lg text-ink-slate max-w-2xl mb-12 leading-relaxed">
          Explore real architectural solutions we build. Each demonstration model illustrates how complex operational bottlenecks are resolved through custom code:
        </p>

        {/* 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projectsData.map((project) => (
            <article
              key={project.id}
              className="relative bg-surface-card border border-border-subtle rounded-2xl p-7 sm:p-8 shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <CornerCrosses />

              <div>
                <span className="inline-block font-mono text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-surface-bisque text-ink-slate border border-border-subtle mb-5">
                  {project.badge}
                </span>

                <h3 className="font-display font-bold text-xl text-ink-primary mb-3 leading-snug">
                  {project.title}
                </h3>

                <p className="text-sm text-ink-slate leading-relaxed mb-6">
                  {project.description}
                </p>
              </div>

              <div className="border-t border-border-subtle pt-5 mt-auto flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between items-center text-ink-slate">
                  <span className="font-mono text-[11px] uppercase text-ink-muted">SECTOR:</span>
                  <span className="font-medium text-ink-primary text-right">{project.sector}</span>
                </div>
                <div className="flex justify-between items-center text-ink-slate">
                  <span className="font-mono text-[11px] uppercase text-ink-muted">STACK:</span>
                  <span className="font-medium text-ink-primary text-right">
                    {project.stack.slice(0, 2).join(' · ')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-ink-slate pt-1 border-t border-dashed border-border-subtle">
                  <span className="font-mono text-[11px] uppercase text-accent-terracotta font-semibold">OUTCOME:</span>
                  <span className="font-bold text-accent-terracotta text-right">
                    {project.metrics[0].value} {project.metrics[0].label}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
