import React from 'react';
import { IntroHero } from '@/components/sections/IntroHero';
import { OstrumEngineSection } from '@/components/sections/OstrumEngineSection';
import { OstrumEnergyNarrativeSection } from '@/components/sections/OstrumEnergyNarrativeSection';
import { OstrumWorksWheelSection } from '@/components/sections/OstrumWorksWheelSection';
import { OstrumCapabilitiesSection } from '@/components/sections/OstrumCapabilitiesSection';
import { OstrumTestimonialsSection } from '@/components/sections/OstrumTestimonialsSection';
import { OstrumFaqSection } from '@/components/sections/OstrumFaqSection';
import { OstrumContactSection } from '@/components/sections/OstrumContactSection';
import { OstrumFooterReveal } from '@/components/sections/OstrumFooterReveal';

export default function HomePage() {
  return (
    <div className="relative w-full flex flex-col items-center">
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

      {/* SECTIONS 07 & 08: Unified FAQ & Contact Red Color Field */}
      <div
        id="faq-contact-field"
        className="relative z-20 w-full overflow-hidden select-text"
        style={{
          background: `linear-gradient(
            180deg,
            #FFFEFA 0%,
            #FAF1EC 12%,
            #F4DAD1 26%,
            #E7B6A8 40%,
            #D96B54 48%,
            #D24B2C 54%,
            #C9362B 62%,
            #8D2620 74%,
            #42100F 85%,
            #1E0908 94%,
            #050505 100%
          )`,
        }}
      >
        {/* SECTION 07: Frequently Asked Questions (FAQ) */}
        <OstrumFaqSection />

        {/* SECTION 08: Contact / Project Enquiry Form */}
        <OstrumContactSection />
      </div>

      {/* SECTIONS 09 & 10: Final Closing CTA with Reveal Transition into Studio Footer */}
      <OstrumFooterReveal />
    </div>
  );
}

