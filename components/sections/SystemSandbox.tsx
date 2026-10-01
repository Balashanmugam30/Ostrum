'use client';

import React, { useState } from 'react';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { CornerCrosses } from '@/components/ui/CornerCrosses';

export function SystemSandbox() {
  const [activeScenario, setActiveScenario] = useState<'school' | 'retail' | 'service'>('school');

  const scenarios = {
    school: {
      title: 'Simulation A: Campus Admissions Pipeline',
      logs: [
        '[16:42:01] INBOUND // Parent inquiry received via WhatsApp (+91 98402 11928):',
        '> "Hello! Could you share the tuition schedule and application deadlines for Grade 6?"',
        '',
        '[16:42:02] OSTRUM AUTOMATION PIPELINE EXECUTING:',
        '✔ Queried Campus360 Database: retrieved 2026-27 Grade 6 fee schedule & curriculum index.',
        '✔ Created structured prospect profile in Admissions CRM with timestamp & origin tag.',
        '✔ Generated & dispatched personalized Grade 6 Prospectus PDF via WhatsApp in real time.',
        '✔ Scheduled automated calendar follow-up for Admissions Director.',
        '',
        '[STATUS: COMPLETE] Zero staff friction. Prospect verified & record synchronized.',
      ],
    },
    retail: {
      title: 'Simulation B: Multi-Store Inventory Engine',
      logs: [
        '[17:15:20] INBOUND // Retail customer WhatsApp query (+91 97109 23810):',
        '> "Do you have the Aura Linen Blazer in Size M in Indiranagar boutique?"',
        '',
        '[17:15:21] OSTRUM INVENTORY ENGINE EXECUTING:',
        '✔ Scanned connected POS inventory across 4 retail locations instantaneously.',
        '✔ Result: Indiranagar: 0 units. Koramangala flagship: 2 units in stock.',
        '✔ Central Distribution Hub: 14 units available for immediate dispatch.',
        '✔ Replied to customer with instant option to hold at Koramangala or order online.',
        '',
        '[STATUS: COMPLETE] Stock parity maintained across all physical and digital channels.',
      ],
    },
    service: {
      title: 'Simulation C: B2B Project Lead Qualification',
      logs: [
        '[18:02:44] INBOUND // Inbound project inquiry submitted by Enterprise Buyer:',
        '> Name: Priya Nair · Company: Greenfield Logistics · Scope: Fleet Dispatch Platform.',
        '',
        '[18:02:45] OSTRUM CRM PIPELINE EXECUTING:',
        '✔ Verified company domain credentials and enterprise fleet profile.',
        '✔ Created high-priority milestone opportunity in Executive Deal Pipeline.',
        '✔ Dispatched tailored briefing document with relevant logistics case blueprints.',
        '✔ Provisioned 20-minute Discovery Call invitation directly on calendar.',
        '',
        '[STATUS: COMPLETE] Opportunity acknowledged & meeting synchronized seamlessly.',
      ],
    },
  };

  return (
    <section
      id="sandbox"
      aria-labelledby="sandbox-title"
      className="py-32 sm:py-44 bg-surface-card border-b border-border-subtle"
    >
      <div className="max-w-[1240px] mx-auto px-6 md:px-8">
        <SectionKicker>Chapter 07 // Interactive Simulation</SectionKicker>

        <h2
          id="sandbox-title"
          className="font-display font-bold text-3xl sm:text-4xl lg:text-[46px] leading-[1.08] tracking-tight text-ink-primary mb-4"
        >
          Experience <span className="font-serif italic font-normal text-ink-primary/90">connected automation</span> in real time.
        </h2>

        <p className="text-base sm:text-lg text-ink-slate max-w-2xl mb-12 leading-relaxed">
          Select an operational scenario below to trigger a live simulation of Ostrum&apos;s automation engine executing genuine API workflows, database queries, and communications:
        </p>

        <div className="relative bg-surface-card border border-border-subtle rounded-2xl p-6 sm:p-10 shadow-card">
          <CornerCrosses />

          {/* Scenario Selector Tabs */}
          <div className="flex flex-wrap gap-2.5 mb-6">
            {(['school', 'retail', 'service'] as const).map((key) => {
              const isActive = activeScenario === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveScenario(key)}
                  className={`font-mono text-xs sm:text-sm px-4.5 py-2.5 rounded-md border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-accent-terracotta text-white border-accent-terracotta shadow-xs'
                      : 'bg-surface-bisque text-ink-primary border-border-subtle hover:border-border-strong'
                  }`}
                >
                  {scenarios[key].title}
                </button>
              );
            })}
          </div>

          {/* Live Telemetry Terminal Window */}
          <div
            role="region"
            aria-label="Live System Telemetry Console"
            className="bg-[#161514] text-[#ECEAE4] font-mono text-xs sm:text-[13.5px] leading-relaxed p-6 sm:p-8 rounded-xl min-h-[260px] overflow-x-auto shadow-inner"
          >
            <div className="flex gap-2 mb-4" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ED6A5E]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#F5BF4F]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#62C554]" />
            </div>

            <div className="flex flex-col gap-1">
              {scenarios[activeScenario].logs.map((line, idx) => (
                <div key={idx} className={line.startsWith('✔') ? 'text-accent-sage font-medium' : line.startsWith('[STATUS') ? 'text-accent-amber font-semibold mt-2' : ''}>
                  {line || '\u00A0'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
