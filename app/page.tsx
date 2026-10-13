import React from 'react';
import { OstrumContinuousJourney } from '@/components/visuals/OstrumContinuousJourney';
import { IntroHero } from '@/components/sections/IntroHero';
import { OstrumEngineSection } from '@/components/sections/OstrumEngineSection';
import { OstrumEnergyNarrativeSection } from '@/components/sections/OstrumEnergyNarrativeSection';
import { OstrumWorksWheelSection } from '@/components/sections/OstrumWorksWheelSection';
import { OstrumCapabilitiesSection } from '@/components/sections/OstrumCapabilitiesSection';
import { OstrumTestimonialsSection } from '@/components/sections/OstrumTestimonialsSection';

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

      {/* SECTION 04: Works Wheel Showcase (Selected Work) */}
      <OstrumWorksWheelSection />

      {/* SECTION 05: Our Capabilities */}
      <OstrumCapabilitiesSection />

      {/* SECTION 06: Testimonials (Ignite-inspired Stacked Editorial Cards) */}
      <OstrumTestimonialsSection />
    </div>
  );
}

