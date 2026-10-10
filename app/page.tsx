import React from 'react';
import { OstrumContinuousJourney } from '@/components/visuals/OstrumContinuousJourney';
import { IntroHero } from '@/components/sections/IntroHero';
import { OstrumEngineSection } from '@/components/sections/OstrumEngineSection';
import { OstrumEnergyNarrativeSection } from '@/components/sections/OstrumEnergyNarrativeSection';
import { FooterCta } from '@/components/sections/FooterCta';
import { Footer } from '@/components/footer/Footer';

export default function HomePage() {
  return (
    <div className="relative w-full flex flex-col items-center">
      {/* CONTINUOUS 3D JOURNEY: Single unified sculpture from Hero 'O' into Section 02 and Section 03 */}
      <OstrumContinuousJourney />

      {/* SECTION 01: Monumental Hero Narrative & Parallax Logo */}
      <IntroHero />

      {/* SECTION 02: The Ostrum Engine (One Core · Two Engines · Studio & Foundry) */}
      <OstrumEngineSection />

      {/* SECTION 03: The Energy Continuum (Cinematic 3D Scroll Narrative) */}
      <OstrumEnergyNarrativeSection />

      {/* SECTION 05: Climactic Perspective Statement & Optical Serif Highlights */}
      <FooterCta />

      {/* SECTION 06: Epilogue & Monumental Footer with Floral Flame and Centered CTA */}
      <Footer />
    </div>
  );
}
