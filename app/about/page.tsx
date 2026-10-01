import React from 'react';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { CornerCrosses } from '@/components/ui/CornerCrosses';
import { RollingButton } from '@/components/ui/RollingButton';

export const metadata = {
  title: 'About the Studio — Ostrum',
  description: 'Our origin, founding philosophy, and commitment to senior engineering craft without consulting fluff.',
};

export default function AboutPage() {
  return (
    <div className="py-20 sm:py-28 bg-canvas-warm">
      <div className="max-w-[960px] mx-auto px-6 md:px-8">
        <SectionKicker>Studio Genesis & Philosophy</SectionKicker>

        <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-[54px] text-ink-primary tracking-tight mb-8">
          We started Ostrum because great businesses deserve great software.
        </h1>

        <div className="flex flex-col gap-6 text-base sm:text-lg text-ink-slate leading-relaxed mb-16">
          <p>
            For years, small and mid-market companies have been forced into an unfair choice: hire a massive enterprise management consultancy with astronomical fees and endless slide decks, or assemble a fragile jigsaw puzzle of offshore freelancers, brittle no-code tools, and disconnected SaaS subscriptions.
          </p>
          <p>
            The result is operational paralysis. Teams spend their mornings copying order data from customer WhatsApp messages into spreadsheets, double-entering invoices into bookkeeping software, and wondering why inventory records never match store shelves.
          </p>
          <p className="font-semibold text-ink-primary">
            Ostrum exists to provide a third way: senior studio craft, surgical systems architecture, and production engineering at transparent, honest rates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="relative bg-surface-card border border-border-subtle rounded-xl p-7 shadow-subtle">
            <CornerCrosses />
            <h3 className="font-display font-bold text-lg text-ink-primary mb-2">
              Senior Leadership
            </h3>
            <p className="text-sm text-ink-slate leading-relaxed">
              Every project is led and coded by founding principals. Never passed off to junior trainees.
            </p>
          </div>

          <div className="relative bg-surface-card border border-border-subtle rounded-xl p-7 shadow-subtle">
            <CornerCrosses />
            <h3 className="font-display font-bold text-lg text-ink-primary mb-2">
              Plain English
            </h3>
            <p className="text-sm text-ink-slate leading-relaxed">
              We translate technical decisions into commercial outcomes, timelines, and costs. Zero consulting jargon.
            </p>
          </div>

          <div className="relative bg-surface-card border border-border-subtle rounded-xl p-7 shadow-subtle">
            <CornerCrosses />
            <h3 className="font-display font-bold text-lg text-ink-primary mb-2">
              100% IP Transfer
            </h3>
            <p className="text-sm text-ink-slate leading-relaxed">
              You own all code, repositories, schemas, and design tokens upon handover. Zero vendor lock-in.
            </p>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-border-subtle">
          <RollingButton href="/#brief" variant="terracotta">
            Start a Conversation with Our Team ↗
          </RollingButton>
        </div>
      </div>
    </div>
  );
}
