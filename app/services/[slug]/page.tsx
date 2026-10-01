import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { CornerCrosses } from '@/components/ui/CornerCrosses';
import { RollingButton } from '@/components/ui/RollingButton';
import { capabilitiesData } from '@/content/capabilities';

export async function generateStaticParams() {
  return Object.keys(capabilitiesData).map((slug) => ({
    slug,
  }));
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const discipline = capabilitiesData[slug];

  if (!discipline) {
    notFound();
  }

  return (
    <div className="py-20 sm:py-28 bg-canvas-warm">
      <div className="max-w-[1000px] mx-auto px-6 md:px-8">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 font-mono text-xs text-ink-muted hover:text-ink-primary transition-colors mb-8"
        >
          ← Back to All Disciplines
        </Link>

        <SectionKicker>Discipline {discipline.number}</SectionKicker>

        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-ink-primary tracking-tight mb-4">
          {discipline.name}
        </h1>

        <p className="text-lg sm:text-xl text-ink-slate leading-relaxed mb-12">
          {discipline.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {discipline.items.map((item, idx) => (
            <div
              key={idx}
              className="relative bg-surface-card border border-border-subtle rounded-xl p-8 shadow-subtle"
            >
              <CornerCrosses />
              <h2 className="font-display font-bold text-xl text-ink-primary mb-3">
                {item.title}
              </h2>
              <p className="text-sm text-ink-slate leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center pt-8 border-t border-border-subtle">
          <RollingButton href="/#brief" variant="terracotta">
            Inquire About {discipline.name} ↗
          </RollingButton>
        </div>
      </div>
    </div>
  );
}
