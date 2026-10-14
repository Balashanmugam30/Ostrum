import React from 'react';
import { OstrumContinuousJourney } from '@/components/visuals/OstrumContinuousJourney';
import { IntroHero } from '@/components/sections/IntroHero';
import { OstrumEngineSection } from '@/components/sections/OstrumEngineSection';
import { OstrumEnergyNarrativeSection } from '@/components/sections/OstrumEnergyNarrativeSection';
import { OstrumWorksWheelSection } from '@/components/sections/OstrumWorksWheelSection';
import { OstrumCapabilitiesSection } from '@/components/sections/OstrumCapabilitiesSection';
import { OstrumTestimonialsSection } from '@/components/sections/OstrumTestimonialsSection';
import { OstrumFaqSection } from '@/components/sections/OstrumFaqSection';
import { OstrumContactSection } from '@/components/sections/OstrumContactSection';

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

      {/* SECTIONS 07 & 08: Unified FAQ & Contact Purple Color Field (Continuous Purple-Dominant Gradient) */}
      <div
        id="faq-contact-field"
        className="relative z-20 w-full overflow-hidden select-text"
        style={{
          background: `linear-gradient(
            180deg,
            #FFFEFF 0%,
            #FFFEFF 4%,
            #F3EAF9 10%,
            #DFC4EE 22%,
            #C6A0E0 38%,
            #A779CE 55%,
            #8354B4 72%,
            #604080 85%,
            #392344 92%,
            #160D20 96%,
            #050505 98%,
            #050505 100%
          )`,
        }}
      >
        {/* SECTION 07: Frequently Asked Questions (FAQ) */}
        <OstrumFaqSection />

        {/* SECTION 08: Contact / Project Enquiry Form (Final Page Section) */}
        <OstrumContactSection />
      </div>
    </div>
  );
}

