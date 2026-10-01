'use client';

import React, { useState } from 'react';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { CornerCrosses } from '@/components/ui/CornerCrosses';
import { capabilitiesData } from '@/content/capabilities';

export function CapabilitiesSection() {
  const [activeTab, setActiveTab] = useState<string>('systems');
  const disciplineKeys = Object.keys(capabilitiesData);
  const currentDiscipline = capabilitiesData[activeTab];

  return (
    <section
      id="capabilities"
      aria-labelledby="capabilities-title"
      className="py-32 sm:py-44 bg-canvas-pearl border-b border-border-subtle"
    >
      <div className="max-w-[1240px] mx-auto px-6 md:px-8">
        <SectionKicker>Chapter 05 // Capabilities Matrix</SectionKicker>

        <h2
          id="capabilities-title"
          className="font-display font-bold text-3xl sm:text-4xl lg:text-[46px] leading-[1.08] tracking-tight text-ink-primary mb-4"
        >
          Four connected disciplines. <span className="font-serif italic font-normal text-ink-primary/90">One studio</span>.
        </h2>

        <p className="text-base sm:text-lg text-ink-slate max-w-2xl mb-12 leading-relaxed">
          From the visual identity your customers see to the database engines that power your operations, we provide end-to-end craft under one unified roof:
        </p>

        {/* Interactive Discipline Tabs */}
        <div
          role="tablist"
          aria-label="Capabilities Disciplines"
          className="flex gap-2 sm:gap-3 border-b border-border-subtle pb-4 mb-10 overflow-x-auto no-scrollbar"
        >
          {disciplineKeys.map((key) => {
            const disc = capabilitiesData[key];
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${key}`}
                id={`tab-${key}`}
                onClick={() => setActiveTab(key)}
                className={`font-mono text-xs sm:text-sm font-semibold px-4.5 sm:px-5 py-2.5 rounded-md transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-ink-primary text-white shadow-xs'
                    : 'bg-surface-card text-ink-slate border border-border-subtle hover:border-border-strong hover:text-ink-primary'
                }`}
              >
                {disc.number} // {disc.name}
              </button>
            );
          })}
        </div>

        {/* Tab Panel Content Grid */}
        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {currentDiscipline.items.map((item, idx) => (
            <div
              key={idx}
              className="relative bg-surface-card border border-border-subtle rounded-xl p-7 sm:p-8 shadow-subtle hover:border-border-strong hover:-translate-y-0.5 transition-all duration-200"
            >
              <CornerCrosses />
              <h3 className="font-display font-bold text-lg sm:text-xl text-ink-primary mb-2.5">
                {item.title}
              </h3>
              <p className="text-sm sm:text-[14.5px] text-ink-slate leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
