import React from 'react';
import Link from 'next/link';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { CornerCrosses } from '@/components/ui/CornerCrosses';
import { RollingButton } from '@/components/ui/RollingButton';
import { projectsData } from '@/content/projects';

export const metadata = {
  title: 'Selected Work & Demonstration Systems — Ostrum',
  description: 'Explore real architectural solutions and demonstration systems engineered by Ostrum.',
};

export default function WorkPage() {
  return (
    <div className="py-20 sm:py-28 bg-canvas-warm">
      <div className="max-w-[1240px] mx-auto px-6 md:px-8">
        <SectionKicker>Portfolio & Technical Index</SectionKicker>

        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-ink-primary tracking-tight mb-4">
          Selected Systems & Projects
        </h1>

        <p className="text-base sm:text-lg text-ink-slate max-w-2xl mb-14 leading-relaxed">
          A catalog of enterprise business systems, custom commerce applications, and educational platforms engineered with surgical craft and zero proprietary lock-in.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {projectsData.map((project) => (
            <article
              key={project.id}
              className="relative bg-surface-card border border-border-subtle rounded-2xl p-8 shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <CornerCrosses />

              <div>
                <span className="inline-block font-mono text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-surface-bisque text-ink-slate border border-border-subtle mb-5">
                  {project.badge}
                </span>

                <h2 className="font-display font-bold text-2xl text-ink-primary mb-3">
                  <Link href={`/work/${project.slug}`} className="hover:text-accent-terracotta transition-colors">
                    {project.title}
                  </Link>
                </h2>

                <p className="text-sm text-ink-slate leading-relaxed mb-6">
                  {project.description}
                </p>
              </div>

              <div className="border-t border-border-subtle pt-5 mt-auto">
                <Link
                  href={`/work/${project.slug}`}
                  className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-accent-terracotta hover:underline"
                >
                  View Case Study Blueprint ↗
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center bg-surface-card border border-border-subtle rounded-2xl p-10">
          <h3 className="font-display font-bold text-2xl text-ink-primary mb-2">
            Have a custom system in mind?
          </h3>
          <p className="text-sm text-ink-slate mb-6">
            We will analyze your requirements and produce a complete technical specification in 48 hours.
          </p>
          <RollingButton href="/#brief" variant="terracotta">
            Initiate Project Brief ↗
          </RollingButton>
        </div>
      </div>
    </div>
  );
}
