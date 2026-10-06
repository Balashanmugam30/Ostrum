'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { OstrumLogo } from '@/components/ui/OstrumLogo';
import { PrimaryBtn } from '@/components/ui/PrimaryBtn';
import { LineByLine } from '@/components/ui/LineByLine';

export function IntroHero() {
  const { t, openModal } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="intro relative w-full h-[100svh] min-h-[640px] flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Monumental Parallax Logo */}
      <div className="w-[85vw] max-w-[1250px] -mt-[4vw] transition-transform duration-300">
        <OstrumLogo hasParallax className="w-full h-auto text-white drop-shadow-2xl" />
      </div>

      {/* Main Statement & Supporting Philosophy */}
      <div className="mt-8 md:mt-10 text-center max-w-[720px] px-6 z-10 flex flex-col items-center">
        {/* Primary Statement with editorial serif accent on 'grow' */}
        <LineByLine
          tag="h1"
          className="intro-desc text-base sm:text-lg md:text-[19px] leading-[1.3] text-white/95 font-normal tracking-[-0.02em]"
          text={t.hero.headline}
          delay={0.1}
          auto={true}
        />

        {/* Supporting Philosophy */}
        <LineByLine
          tag="p"
          className="intro-sub mt-3 md:mt-4 text-xs sm:text-sm md:text-base leading-[1.35] text-white/75 font-normal tracking-[-0.01em]"
          lines={[
            t.hero.philosophyLine1,
            t.hero.philosophyLine2,
          ]}
          delay={0.25}
          auto={true}
        />
      </div>

      {/* Bottom Pinned CTA - Anchored, refined interaction */}
      <div className="intro-btn-wrapper absolute bottom-12 md:bottom-14 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 w-full px-4">
        <PrimaryBtn
          onClick={() => openModal('physical')}
          className="intro-btn shadow-2xl"
        >
          {t.hero.cta}
        </PrimaryBtn>
        <span className="intro-btn_span text-[11px] font-medium text-white/70 tracking-normal text-center">
          {t.hero.sublabel}
        </span>
      </div>

      {/* Subtle Restrained Scroll Cue */}
      <div
        className={`scroll-cue absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] tracking-[0.22em] text-white/40 uppercase font-sans select-none pointer-events-none transition-opacity duration-500 ${
          scrolled ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden="true"
      >
        <span>Scroll to explore</span>
        <span className="scroll-cue-arrow inline-block">↓</span>
      </div>
    </section>
  );
}
