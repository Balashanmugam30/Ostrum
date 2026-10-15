'use client';

import React, { useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { IntroHero } from '@/components/sections/IntroHero';
import { OstrumEngineSection } from '@/components/sections/OstrumEngineSection';
import { OstrumEnergyNarrativeSection } from '@/components/sections/OstrumEnergyNarrativeSection';

export default function FrenchPage() {
  const { setLocale } = useLanguage();

  useEffect(() => {
    setLocale('fr');
  }, [setLocale]);

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* SECTION 01: Monumental Hero Narrative & Parallax Logo */}
      <IntroHero />

      {/* SECTION 02: The Ostrum Engine (One Core · Two Engines · Studio & Foundry) */}
      <OstrumEngineSection />

      {/* SECTION 03: The Energy Continuum (Cinematic 3D Scroll Narrative) */}
      <OstrumEnergyNarrativeSection />

      {/* Clean Release Spacer: Allows natural unpinning and upward scroll-out */}
      <div
        className="w-full min-h-[60vh] bg-black pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
