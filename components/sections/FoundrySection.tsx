'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Dossier25D } from '@/components/ui/Dossier25D';
import { PrimaryBtn } from '@/components/ui/PrimaryBtn';
import { LineByLine } from '@/components/ui/LineByLine';
import { MagnetWrap } from '@/components/ui/MagnetWrap';

export function FoundrySection() {
  const { t, openModal } = useLanguage();
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const foundry = t.foundry;

  return (
    <section
      id="foundry"
      className="foundry-section relative w-full mt-20 sm:mt-24 md:mt-[180px] lg:mt-[220px] pt-12 sm:pt-16 md:pt-0 pb-28 md:pb-[200px] px-6 md:px-[8vw] lg:px-[10vw] xl:px-[12vw] flex flex-col items-center z-10 overflow-x-clip"
    >
      <div className="w-full max-w-[1360px] flex flex-col lg:flex-row items-center lg:items-start justify-between gap-16 md:gap-20 lg:gap-16 xl:gap-24">
        {/* ==============================================================
            LEFT COLUMN: 2.5D PHYSICAL ARTIFACT (OSTRUM FOUNDRY DOSSIER)
            Zero 3D/WebGL engine — Pure multi-layer CSS & PNG illusion
            ============================================================== */}
        <div className="w-full lg:w-[46%] xl:w-[44%] flex flex-col items-center justify-center lg:sticky lg:top-28">
          <Dossier25D
            className="w-full"
            flipHint={foundry.flipHint}
          />
        </div>

        {/* ==============================================================
            RIGHT COLUMN: EDITORIAL VENTURE STUDIO MANIFESTO & MODEL
            ============================================================== */}
        <div className="w-full lg:w-[54%] xl:w-[56%] flex flex-col text-left">
          {/* Section Kicker & Metadata */}
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] font-sans text-white/50 mb-6 md:mb-8">
            <span className="text-[#ff5c4a] font-mono">{foundry.index}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <span>{foundry.badge}</span>
          </div>

          {/* Monumental Headline communicating dual positioning */}
          <div className="w-full max-w-[620px]">
            <LineByLine
              tag="h2"
              className="h1 font-serif text-white font-normal tracking-[-1.56px] leading-[0.98] sm:leading-[0.94] text-[clamp(34px,4.8vw,72px)]"
              lines={[foundry.headlineLine1, foundry.headlineLine2]}
              delay={0.05}
              repeat={false}
            />
          </div>

          {/* Supporting Philosophy Paragraph */}
          <div className="mt-8 md:mt-9 max-w-[520px]">
            <p className="text-base md:text-[17px] text-white/80 font-normal leading-[1.42] tracking-[-0.015em]">
              {foundry.description}
            </p>
          </div>

          {/* ==============================================================
              THE OSTRUM FOUNDRY 5-STEP MODEL
              Editorial sequence with subtle hairline dividers
              ============================================================== */}
          <div className="mt-12 md:mt-14 w-full max-w-[560px] border-t border-white/10">
            {foundry.steps.map((step, idx) => {
              const isHovered = activeStep === idx;
              return (
                <div
                  key={step.num}
                  onMouseEnter={() => setActiveStep(idx)}
                  onMouseLeave={() => setActiveStep(null)}
                  className={`group py-4 sm:py-4.5 border-b border-white/10 transition-colors duration-300 flex items-start sm:items-center justify-between gap-4 ${
                    isHovered ? 'bg-white/[0.02]' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-6 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono tracking-[0.16em] text-white/40 group-hover:text-[#ff5c4a] transition-colors duration-200">
                        {step.num}
                      </span>
                      <span className="text-sm md:text-[15px] font-medium tracking-[0.06em] uppercase text-white/95 group-hover:text-white transition-colors duration-200">
                        {step.title}
                      </span>
                    </div>
                    <p className="text-xs md:text-[13.5px] text-white/65 group-hover:text-white/85 transition-colors duration-200 leading-[1.35] tracking-[-0.01em]">
                      {step.detail}
                    </p>
                  </div>
                  <span className="text-white/20 group-hover:text-white/60 text-xs transition-transform duration-200 group-hover:translate-x-0.5 select-none shrink-0 pt-0.5 sm:pt-0">
                    →
                  </span>
                </div>
              );
            })}
          </div>

          {/* Restrained Magnetic CTA and Sublabel */}
          <div className="mt-10 md:mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8">
            <MagnetWrap strength={0.3}>
              <PrimaryBtn onClick={() => openModal('digital')}>
                {foundry.cta}
              </PrimaryBtn>
            </MagnetWrap>

            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-sans text-white/40 select-none">
              {foundry.sublabel}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
