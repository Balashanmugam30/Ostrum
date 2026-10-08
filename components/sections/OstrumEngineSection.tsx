'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { OstrumCore2D } from '@/components/visuals/OstrumCore2D';

export function OstrumEngineSection() {
  const { t } = useLanguage();
  const [activeFocus, setActiveFocus] = useState<'business' | 'next' | null>(null);

  const engine = t.engine;

  return (
    <section
      id="engine"
      className="ostrum-engine-section relative w-full pt-20 sm:pt-28 md:pt-36 lg:pt-40 pb-28 md:pb-48 px-6 md:px-[6vw] lg:px-[8vw] flex flex-col items-center z-10 overflow-x-clip bg-transparent text-center"
    >
      {/* Subtle organic light accent continuing Hero ambiance */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[900px] h-[500px] pointer-events-none rounded-full blur-[130px] opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(255,80,60,0.65) 0%, rgba(180,20,15,0.2) 50%, transparent 75%)',
        }}
      />

      <div className="w-full max-w-[1360px] flex flex-col items-center relative z-10">
        {/* ==============================================================
            SECTION HEADER: METADATA & MONUMENTAL DUAL STATEMENT
            ============================================================== */}
        <div className="flex items-center gap-3 text-[11px] sm:text-[12px] uppercase tracking-[0.28em] font-sans text-white/50 mb-6 md:mb-8 select-none">
          <span className="text-[#ff5c4a] font-mono font-medium">{engine.index}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <span>{engine.badge}</span>
        </div>

        {/* Monumental Editorial Headline in Romie Serif */}
        <div className="w-full max-w-[980px] flex flex-col items-center">
          <h2 className="font-serif text-white font-normal tracking-[-1.8px] sm:tracking-[-2.4px] leading-[0.96] text-[clamp(42px,5.8vw,88px)]">
            <span className="block">{engine.headlineLine1}</span>
            <span className="block italic text-[#ffa699] font-normal mt-1">{engine.headlineLine2}</span>
          </h2>
        </div>

        {/* Minimal Supporting Philosophy Copy (2-3 lines) */}
        <div className="mt-6 md:mt-8 max-w-[640px] mx-auto px-4">
          <p className="text-base sm:text-[17px] md:text-[18px] text-white/75 font-normal leading-[1.5] tracking-[-0.015em]">
            {engine.description}
          </p>
        </div>

        {/* ==============================================================
            THE 2.5D OSTRUM CORE & EDITORIAL SPATIAL COMPOSITION
            Centerpiece floating in space with bilateral identity statements
            NO boxes, NO cards, NO containers — Pure seamless spatial field
            ============================================================== */}
        <div className="w-full mt-12 md:mt-16 lg:mt-20 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-6 relative">
          {/* ============================================================
              LEFT IDENTITY ANCHOR: 01 / FOR BUSINESS
              ============================================================ */}
          <div
            onMouseEnter={() => setActiveFocus('business')}
            onMouseLeave={() => setActiveFocus(null)}
            className={`w-full lg:w-[28%] max-w-[360px] flex flex-col text-left transition-all duration-300 cursor-default select-none ${
              activeFocus === 'business' ? 'opacity-100 translate-x-1' : 'opacity-85'
            }`}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <span className="font-mono text-xs tracking-[0.22em] text-[#ff5c4a] font-semibold">
                {engine.forBusiness.number}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-white/60 font-medium">
                {engine.forBusiness.tag}
              </span>
            </div>

            <h3 className="font-serif italic text-2xl sm:text-[26px] text-white font-normal leading-[1.18] tracking-[-0.02em]">
              "{engine.forBusiness.statement}"
            </h3>

            <p className="mt-3.5 text-xs sm:text-[13.5px] text-white/60 leading-[1.48] font-normal">
              {engine.forBusiness.detail}
            </p>

            {/* Delicate hairline focal indicator */}
            <div className="mt-5 flex items-center gap-3">
              <div
                className={`h-[1px] transition-all duration-300 ${
                  activeFocus === 'business' ? 'w-16 bg-[#ff5c4a]' : 'w-8 bg-white/20'
                }`}
              />
              <span className="text-[10px] font-mono tracking-[0.18em] uppercase text-white/40">
                SYSTEMS ARCHITECTURE
              </span>
            </div>
          </div>

          {/* ============================================================
              CENTER: THE 2.5D OSTRUM CORE CENTERPIECE
              Multi-layer floating dimensional artifact in zero-g void
              ============================================================== */}
          <div className="w-full lg:w-[44%] flex items-center justify-center relative">
            <OstrumCore2D activeFocus={activeFocus} />
          </div>

          {/* ============================================================
              RIGHT IDENTITY ANCHOR: 02 / FOR WHAT'S NEXT
              ============================================================ */}
          <div
            onMouseEnter={() => setActiveFocus('next')}
            onMouseLeave={() => setActiveFocus(null)}
            className={`w-full lg:w-[28%] max-w-[360px] flex flex-col text-left lg:text-right lg:items-end transition-all duration-300 cursor-default select-none ${
              activeFocus === 'next' ? 'opacity-100 -translate-x-1' : 'opacity-85'
            }`}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <span className="font-mono text-xs tracking-[0.22em] text-[#ff5c4a] font-semibold">
                {engine.forNext.number}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-white/60 font-medium">
                {engine.forNext.tag}
              </span>
            </div>

            <h3 className="font-serif italic text-2xl sm:text-[26px] text-white font-normal leading-[1.18] tracking-[-0.02em]">
              "{engine.forNext.statement}"
            </h3>

            <p className="mt-3.5 text-xs sm:text-[13.5px] text-white/60 leading-[1.48] font-normal">
              {engine.forNext.detail}
            </p>

            {/* Delicate hairline focal indicator */}
            <div className="mt-5 flex items-center gap-3 lg:flex-row-reverse">
              <div
                className={`h-[1px] transition-all duration-300 ${
                  activeFocus === 'next' ? 'w-16 bg-[#ff5c4a]' : 'w-8 bg-white/20'
                }`}
              />
              <span className="text-[10px] font-mono tracking-[0.18em] uppercase text-white/40">
                ORIGINAL VENTURES
              </span>
            </div>
          </div>
        </div>

        {/* ==============================================================
            BOTTOM NARRATIVE CULMINATION: BACKING & CO-BUILDING
            Floating spacious statement — Zero card container
            ============================================================== */}
        <div className="mt-20 md:mt-28 max-w-[780px] mx-auto flex flex-col items-center">
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#ff5c4a]/60 to-transparent mb-6" />

          <p className="font-serif text-xl sm:text-2xl md:text-[27px] text-white/90 font-normal leading-[1.3] tracking-[-0.02em]">
            "{engine.backing.statement}"
          </p>

          <p className="mt-3 text-xs sm:text-sm text-white/55 max-w-[540px] leading-relaxed">
            {engine.backing.subtext}
          </p>

          <div className="mt-6 flex items-center gap-3 text-[10px] sm:text-[11px] font-mono tracking-[0.28em] text-[#ff7a66] uppercase">
            <span>{engine.backing.triad}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
