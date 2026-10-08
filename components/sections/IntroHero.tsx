'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { OstrumLogo } from '@/components/ui/OstrumLogo';
import { LineByLine } from '@/components/ui/LineByLine';
import { LivingThread } from '@/components/ui/LivingThread';

export function IntroHero() {
  const { t } = useLanguage();
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
      {/* Living Connected Strand - Signature organic art element */}
      <LivingThread />

      {/* Monumental Upward Parallax Wordmark */}
      <div className="w-[85vw] max-w-[1250px] -mt-[4vw] z-10 transition-transform duration-300">
        <OstrumLogo hasParallax className="w-full h-auto text-white drop-shadow-2xl" />
      </div>

      {/* Main Statement & Dual Positioning */}
      <div className="mt-8 md:mt-12 text-center max-w-[760px] px-6 z-10 flex flex-col items-center">
        {/* Primary Statement: Business Building & Product Creation */}
        <LineByLine
          tag="h1"
          className="intro-desc text-base sm:text-lg md:text-[20px] leading-[1.35] text-white/95 font-normal tracking-[-0.02em]"
          text={t.hero.headline}
          delay={0.1}
          auto={true}
        />

        {/* Supporting Philosophy */}
        <LineByLine
          tag="p"
          className="intro-sub mt-4 md:mt-5 text-xs sm:text-sm md:text-[15px] leading-[1.4] text-white/70 font-normal tracking-[-0.01em]"
          lines={[
            t.hero.philosophyLine1,
            t.hero.philosophyLine2,
          ]}
          delay={0.25}
          auto={true}
        />
      </div>

      {/* Subtle Restrained Scroll Cue */}
      <div
        className={`scroll-cue absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] tracking-[0.24em] text-white/45 uppercase font-sans select-none pointer-events-none transition-opacity duration-500 z-10 ${
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
