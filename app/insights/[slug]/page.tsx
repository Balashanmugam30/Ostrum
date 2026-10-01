import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { RollingButton } from '@/components/ui/RollingButton';
import { insightsData } from '@/content/insights';

export async function generateStaticParams() {
  return insightsData.map((note) => ({
    slug: note.slug,
  }));
}

export default async function InsightDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = insightsData.find((n) => n.slug === slug);

  if (!note) {
    notFound();
  }

  return (
    <article className="py-20 sm:py-28 bg-canvas-warm">
      <div className="max-w-[840px] mx-auto px-6 md:px-8">
        <Link
          href="/insights"
          className="inline-flex items-center gap-2 font-mono text-xs text-ink-muted hover:text-ink-primary transition-colors mb-8"
        >
          ← Back to All Field Notes
        </Link>

        <SectionKicker>
          {note.topic} · {note.readTime} · {note.date}
        </SectionKicker>

        <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[46px] text-ink-primary tracking-tight leading-tight mb-6">
          {note.title}
        </h1>

        <p className="text-lg sm:text-xl font-medium text-ink-primary leading-relaxed pb-8 mb-8 border-b border-border-subtle">
          {note.excerpt}
        </p>

        <div className="flex flex-col gap-6 text-base sm:text-lg text-ink-slate leading-relaxed mb-12">
          <p>
            When organizations begin evaluating their technology investments, the default instinct is almost always to add another software subscription. A team experiences friction in lead qualification, so a new tool is onboarded. Customer service needs a messaging channel, so another dashboard is added to the stack.
          </p>
          <p>
            Within 18 months, an otherwise agile business is juggling five to eight separate login portals. Customer data sits locked inside one vendor’s proprietary database, billing details are trapped in another, and WhatsApp inquiries remain completely invisible to the management team.
          </p>
          <p>
            The antidote to software fatigue is not more software. It is architectural unification: building clean data conduits and unified relational stores where customer records, inventory, and accounting updates flow with sub-second synchronization.
          </p>
        </div>

        <div className="text-center pt-8 border-t border-border-subtle">
          <RollingButton href="/#brief" variant="terracotta">
            Discuss Your System Architecture With Us ↗
          </RollingButton>
        </div>
      </div>
    </article>
  );
}
