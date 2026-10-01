'use client';

import React, { useState } from 'react';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { RollingButton } from '@/components/ui/RollingButton';
import { ArchitectureDiagram } from '@/components/hero/ArchitectureDiagram';
import { ThreeDArtifact } from '@/components/hero/ThreeDArtifact';
import { AtmosphericCanvas } from '@/components/hero/AtmosphericCanvas';

export function HeroCanvas() {
  const [activeTab, setActiveTab] = useState<'schematic' | 'threed'>('schematic');

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative min-h-[85vh] flex items-center pt-24 pb-20 md:pt-32 md:pb-28 bg-canvas-warm overflow-hidden border-b border-border-subtle"
    >
      <AtmosphericCanvas />

      <div className="relative z-10 max-w-[1240px] mx-auto px-6 md:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Hero Narrative Statement */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <SectionKicker>Chapter 02 // Studio Positioning</SectionKicker>

            <h1
              id="hero-heading"
              className="font-display font-extrabold text-4xl sm:text-5xl lg:text-[64px] leading-[1.05] tracking-tight text-ink-primary"
            >
              We build the technology that helps ambitious businesses{' '}
              <span className="font-serif italic font-normal text-accent-terracotta tracking-normal">
                grow
              </span>
              .
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-ink-slate leading-relaxed max-w-xl">
              Most companies struggle with disconnected websites, manual spreadsheets, and messy software. We design your brand, build your website, connect your business systems, and automate the busywork.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4 sm:gap-6">
              <RollingButton
                href="#brief"
                variant="terracotta"
                className="py-3 px-7 text-base"
                subLabel="Direct Access to Senior Principals"
              >
                Initiate Project Brief
              </RollingButton>

              <RollingButton
                href="#works"
                variant="secondary"
                className="py-3 px-6 text-base"
                subLabel="Verified Production Models"
              >
                Explore Work & Systems
              </RollingButton>
            </div>
          </div>

          {/* Right Column: Interactive Spatial Showcase Stage */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="flex items-center justify-end gap-2 mb-1">
              <button
                type="button"
                onClick={() => setActiveTab('schematic')}
                className={`font-mono text-xs px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                  activeTab === 'schematic'
                    ? 'bg-ink-primary text-white border-ink-primary shadow-xs'
                    : 'bg-surface-card text-ink-slate border-border-subtle hover:border-border-strong'
                }`}
              >
                Schematic Architecture
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('threed')}
                className={`font-mono text-xs px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                  activeTab === 'threed'
                    ? 'bg-ink-primary text-white border-ink-primary shadow-xs'
                    : 'bg-surface-card text-ink-slate border-border-subtle hover:border-border-strong'
                }`}
              >
                3D Connected Core
              </button>
            </div>

            {activeTab === 'schematic' ? <ArchitectureDiagram /> : <ThreeDArtifact />}
          </div>
        </div>
      </div>
    </section>
  );
}
