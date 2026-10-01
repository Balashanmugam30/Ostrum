import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { CornerCrosses } from '@/components/ui/CornerCrosses';
import { RollingButton } from '@/components/ui/RollingButton';
import { projectsData } from '@/content/projects';

export async function generateStaticParams() {
  return projectsData.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projectsData.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <article className="py-20 sm:py-28 bg-canvas-warm">
      <div className="max-w-[1000px] mx-auto px-6 md:px-8">
        <Link
          href="/work"
          className="inline-flex items-center gap-2 font-mono text-xs text-ink-muted hover:text-ink-primary transition-colors mb-8"
        >
          ← Back to All Projects
        </Link>

        <SectionKicker>{project.badge}</SectionKicker>

        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-ink-primary tracking-tight mb-4">
          {project.title}
        </h1>

        <p className="text-lg sm:text-xl text-ink-slate leading-relaxed mb-10">
          {project.description}
        </p>

        {/* Key Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-surface-card border border-border-subtle rounded-xl p-6 sm:p-8 mb-12 shadow-subtle">
          {project.metrics.map((m, idx) => (
            <div key={idx}>
              <span className="font-display font-extrabold text-3xl text-accent-terracotta block mb-1">
                {m.value}
              </span>
              <span className="text-xs text-ink-slate">{m.label}</span>
            </div>
          ))}
        </div>

        {/* Challenge & Solution Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="relative bg-surface-card border border-border-subtle rounded-xl p-8 shadow-subtle">
            <CornerCrosses />
            <h2 className="font-display font-bold text-xl text-ink-primary mb-3">
              The Operational Friction
            </h2>
            <p className="text-sm text-ink-slate leading-relaxed">
              {project.challenge}
            </p>
          </div>

          <div className="relative bg-surface-card border border-border-subtle rounded-xl p-8 shadow-subtle">
            <CornerCrosses />
            <h2 className="font-display font-bold text-xl text-ink-primary mb-3">
              The Custom Architecture
            </h2>
            <p className="text-sm text-ink-slate leading-relaxed">
              {project.solution}
            </p>
          </div>
        </div>

        {/* Tech Stack Matrix */}
        <div className="bg-canvas-pearl border border-border-subtle rounded-xl p-8 mb-12">
          <h3 className="font-mono text-xs uppercase tracking-wider text-accent-terracotta mb-4">
            Production Technology Stack
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {project.stack.map((s, idx) => (
              <span
                key={idx}
                className="font-mono text-xs bg-surface-card text-ink-primary border border-border-subtle px-3.5 py-1.5 rounded-full"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="text-center pt-8 border-t border-border-subtle">
          <RollingButton href="/#brief" variant="terracotta">
            Discuss a Similar System for Your Company ↗
          </RollingButton>
        </div>
      </div>
    </article>
  );
}
