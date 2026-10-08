'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { OstrumEngineVisual } from '@/components/ui/OstrumEngineVisual';
import { PrimaryBtn } from '@/components/ui/PrimaryBtn';
import { LineByLine } from '@/components/ui/LineByLine';
import { MagnetWrap } from '@/components/ui/MagnetWrap';

export function OstrumEngineSection() {
  const { t, openModal } = useLanguage();
  const [activeEngine, setActiveEngine] = useState<'studio' | 'foundry' | null>(null);
  const [activeStep, setActiveStep] = useState<string | null>(null);

  const engine = t.engine;

  return (
    <section
      id="engine"
      className="ostrum-engine-section relative w-full pt-16 sm:pt-24 md:pt-32 lg:pt-36 pb-24 md:pb-40 px-6 md:px-[6vw] lg:px-[8vw] xl:px-[10vw] flex flex-col items-center z-10 overflow-x-clip bg-[#0a0808]"
    >
      {/* Background Radial Glow Atmosphere */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] md:w-[1100px] h-[500px] pointer-events-none rounded-full blur-[140px] opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(255,75,55,0.8) 0%, rgba(180,20,15,0.3) 50%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-[1360px] flex flex-col items-center text-center">
        {/* ==============================================================
            SECTION HEADER: METADATA & MONUMENTAL DUAL HEADLINE
            ============================================================== */}
        <div className="flex items-center gap-3 text-[11px] sm:text-[12px] uppercase tracking-[0.26em] font-sans text-white/50 mb-6 md:mb-8 select-none">
          <span className="text-[#ff5c4a] font-mono font-medium">{engine.index}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <span>{engine.badge}</span>
        </div>

        {/* Monumental Editorial Headline */}
        <div className="w-full max-w-[1040px] flex flex-col items-center">
          <LineByLine
            tag="h2"
            className="font-serif text-white font-normal tracking-[-1.8px] leading-[0.98] sm:leading-[0.94] text-[clamp(36px,5.2vw,78px)]"
            lines={[engine.headlinePart1, engine.headlinePart2]}
            delay={0.06}
            repeat={false}
          />
        </div>

        {/* Core Philosophy Statement */}
        <div className="mt-8 md:mt-10 max-w-[760px] mx-auto">
          <p className="text-base sm:text-[17px] md:text-[18.5px] text-white/75 font-normal leading-[1.5] tracking-[-0.015em]">
            {engine.description}
          </p>
        </div>

        {/* ==============================================================
            SIGNATURE LIVING VISUAL: ONE CORE → TWO BRANCHES
            A living dynamic SVG ribbon connecting the Core to Studio & Foundry
            ============================================================== */}
        <div className="w-full mt-10 md:mt-14 mb-8 md:mb-12">
          <OstrumEngineVisual
            activeEngine={activeEngine}
            onSelectEngine={(eng) => setActiveEngine(eng)}
          />
        </div>

        {/* ==============================================================
            THE TWO ENGINES: DUAL EDITORIAL ARCHITECTURE
            Left: Engine 01 (STUDIO) · Right: Engine 02 (FOUNDRY)
            ============================================================== */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 mt-4 text-left">
          {/* ============================================================
              ENGINE 01 — STUDIO (We build for businesses)
              ============================================================ */}
          <div
            onMouseEnter={() => setActiveEngine('studio')}
            onMouseLeave={() => setActiveEngine(null)}
            className={`group relative p-7 sm:p-9 md:p-11 rounded-2xl border transition-all duration-500 flex flex-col justify-between ${
              activeEngine === 'studio'
                ? 'bg-white/[0.04] border-[#ff5c4a]/50 shadow-[0_0_50px_rgba(255,92,74,0.12)]'
                : 'bg-white/[0.015] border-white/10 hover:border-white/20'
            }`}
          >
            <div>
              {/* Card Header & Index */}
              <div className="pb-6 border-b border-white/10 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono tracking-[0.2em] text-[#ff5c4a] font-semibold">
                      {engine.studio.number}
                    </span>
                    <h3 className="font-sans text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-white">
                      {engine.studio.title}
                    </h3>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff5c4a]/50" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.18em] text-white/40">
                  {engine.studio.footnote}
                </span>
              </div>

              {/* Tagline & Narrative */}
              <div className="mt-6">
                <h4 className="font-serif italic text-lg sm:text-xl text-[#ffa699] font-normal leading-snug">
                  "{engine.studio.tagline}"
                </h4>
                <p className="mt-3.5 text-sm sm:text-[15px] text-white/70 leading-[1.5] font-normal">
                  {engine.studio.description}
                </p>
              </div>

              {/* 4 Core Capabilities */}
              <div className="mt-8 border-t border-white/10">
                {engine.studio.capabilities.map((cap, idx) => {
                  const stepId = `studio-${idx}`;
                  const isHovered = activeStep === stepId;
                  return (
                    <div
                      key={cap.label}
                      onMouseEnter={() => setActiveStep(stepId)}
                      onMouseLeave={() => setActiveStep(null)}
                      className={`py-3.5 border-b border-white/10 flex items-start sm:items-center justify-between gap-4 transition-colors duration-200 ${
                        isHovered ? 'bg-white/[0.03]' : ''
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 min-w-0">
                        <span className="text-[13px] sm:text-[14px] font-medium tracking-wide uppercase text-white/95">
                          {cap.label}
                        </span>
                        <span className="text-xs sm:text-[13px] text-white/55 leading-tight">
                          {cap.detail}
                        </span>
                      </div>
                      <span className="text-white/20 text-xs shrink-0 select-none">
                        →
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Action */}
            <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <MagnetWrap strength={0.25}>
                <PrimaryBtn onClick={() => openModal('digital')}>
                  {engine.studio.cta}
                </PrimaryBtn>
              </MagnetWrap>
              <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.16em] uppercase text-white/35">
                ESTABLISHED 2026
              </span>
            </div>
          </div>

          {/* ============================================================
              ENGINE 02 — FOUNDRY (We build what doesn't exist yet)
              ============================================================ */}
          <div
            onMouseEnter={() => setActiveEngine('foundry')}
            onMouseLeave={() => setActiveEngine(null)}
            className={`group relative p-7 sm:p-9 md:p-11 rounded-2xl border transition-all duration-500 flex flex-col justify-between ${
              activeEngine === 'foundry'
                ? 'bg-white/[0.04] border-[#ff5c4a]/50 shadow-[0_0_50px_rgba(255,92,74,0.12)]'
                : 'bg-white/[0.015] border-white/10 hover:border-white/20'
            }`}
          >
            <div>
              {/* Card Header & Index */}
              <div className="pb-6 border-b border-white/10 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono tracking-[0.2em] text-[#ff5c4a] font-semibold">
                      {engine.foundry.number}
                    </span>
                    <h3 className="font-sans text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-white">
                      {engine.foundry.title}
                    </h3>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff5c4a]/50" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.18em] text-white/40">
                  {engine.foundry.footnote}
                </span>
              </div>

              {/* Tagline & Narrative */}
              <div className="mt-6">
                <h4 className="font-serif italic text-lg sm:text-xl text-[#ffa699] font-normal leading-snug">
                  "{engine.foundry.tagline}"
                </h4>
                <p className="mt-3.5 text-sm sm:text-[15px] text-white/70 leading-[1.5] font-normal">
                  {engine.foundry.description}
                </p>
              </div>

              {/* 4 Core Capabilities */}
              <div className="mt-8 border-t border-white/10">
                {engine.foundry.capabilities.map((cap, idx) => {
                  const stepId = `foundry-${idx}`;
                  const isHovered = activeStep === stepId;
                  return (
                    <div
                      key={cap.label}
                      onMouseEnter={() => setActiveStep(stepId)}
                      onMouseLeave={() => setActiveStep(null)}
                      className={`py-3.5 border-b border-white/10 flex items-start sm:items-center justify-between gap-4 transition-colors duration-200 ${
                        isHovered ? 'bg-white/[0.03]' : ''
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 min-w-0">
                        <span className="text-[13px] sm:text-[14px] font-medium tracking-wide uppercase text-white/95">
                          {cap.label}
                        </span>
                        <span className="text-xs sm:text-[13px] text-white/55 leading-tight">
                          {cap.detail}
                        </span>
                      </div>
                      <span className="text-white/20 text-xs shrink-0 select-none">
                        →
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Action */}
            <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <MagnetWrap strength={0.25}>
                <PrimaryBtn onClick={() => openModal('digital')}>
                  {engine.foundry.cta}
                </PrimaryBtn>
              </MagnetWrap>
              <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.16em] uppercase text-white/35">
                INTERNAL VENTURES & LABS
              </span>
            </div>
          </div>
        </div>

        {/* ==============================================================
            BOTTOM SYNTHESIS: THE ENGINE DYNAMICS
            Reinforcing the reciprocal synergy between Studio & Foundry
            ============================================================== */}
        <div className="mt-14 md:mt-20 w-full max-w-[880px] p-6 sm:p-8 rounded-xl bg-gradient-to-r from-white/[0.02] via-white/[0.04] to-white/[0.02] border border-white/10 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5c4a]" />
            <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.22em] uppercase text-[#ff5c4a] font-semibold">
              {engine.sharedSynergy.label}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5c4a]" />
          </div>
          <p className="font-serif italic text-base sm:text-lg md:text-[19px] text-white/85 leading-relaxed font-normal">
            "{engine.sharedSynergy.statement}"
          </p>
        </div>
      </div>
    </section>
  );
}
