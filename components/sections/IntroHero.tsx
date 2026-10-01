'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ClarteLogo } from '@/components/ui/ClarteLogo';
import { PrimaryBtn } from '@/components/ui/PrimaryBtn';

export function IntroHero() {
  const { t, openModal } = useLanguage();

  return (
    <section className="intro relative w-full h-[100svh] min-h-[640px] flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Monumental Parallax Logo */}
      <div className="w-[85vw] max-w-[1250px] -mt-[4vw] transition-transform duration-300">
        <ClarteLogo hasParallax className="w-full h-auto text-white drop-shadow-2xl" />
      </div>

      {/* Narrative Intro Description */}
      <div className="intro-desc mt-10 md:mt-12 text-center max-w-[620px] px-6 z-10">
        <p className="text-base md:text-lg leading-[1.3] text-white/90 font-normal tracking-[-0.02em]">
          {t.hero.descLine1}
          <br className="hidden sm:inline" />
          {' '}{t.hero.descLine2}
        </p>
      </div>

      {/* Bottom Pinned CTA */}
      <div className="intro-btn-wrapper absolute bottom-10 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 w-full px-4">
        <PrimaryBtn
          onClick={() => openModal('physical')}
          className="shadow-2xl"
        >
          {t.hero.cta}
        </PrimaryBtn>
        <span className="intro-btn_span text-[11px] font-medium text-white/75 tracking-normal text-center">
          {t.hero.sublabel}
        </span>
      </div>
    </section>
  );
}
