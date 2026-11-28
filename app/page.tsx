import React, { Suspense } from 'react';
import { IntroHero } from '@/components/sections/IntroHero';
import { OstrumEngineSection } from '@/components/sections/OstrumEngineSection';
import { OstrumEnergyNarrativeSection } from '@/components/sections/OstrumEnergyNarrativeSection';
import { OstrumWorksWheelSection } from '@/components/sections/OstrumWorksWheelSection';
import { OstrumCapabilitiesSection } from '@/components/sections/OstrumCapabilitiesSection';
import { OstrumTestimonialsSection } from '@/components/sections/OstrumTestimonialsSection';
import { OstrumFaqSection } from '@/components/sections/OstrumFaqSection';
import { OstrumContactSection } from '@/components/sections/OstrumContactSection';
import { OstrumFooterReveal } from '@/components/sections/OstrumFooterReveal';
import { OSTRUM_FAQ_DATA } from '@/data/faq';

export default function HomePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: OSTRUM_FAQ_DATA.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Structured Data: FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* SECTION 01: Monumental Hero Narrative & Parallax Logo */}
      <IntroHero />

      {/* SECTION 02: The Ostrum Engine (One Core · Two Engines · Studio & Foundry) */}
      <Suspense fallback={<section id="engine" className="w-full min-h-screen" />}>
        <OstrumEngineSection />
      </Suspense>

      {/* SECTION 03: The Energy Continuum (Cinematic 3D Scroll Narrative) */}
      <Suspense fallback={<section id="energy-narrative" className="w-full min-h-screen" />}>
        <OstrumEnergyNarrativeSection />
      </Suspense>

      {/* SECTION 04: Works Wheel Showcase (Selected Work) */}
      <Suspense fallback={<section id="selected-work" className="w-full min-h-screen" />}>
        <OstrumWorksWheelSection />
      </Suspense>

      {/* SECTION 05: Our Capabilities */}
      <Suspense fallback={<section id="capabilities" className="w-full min-h-screen" />}>
        <OstrumCapabilitiesSection />
      </Suspense>

      {/* SECTION 06: Testimonials (Ignite-inspired Stacked Editorial Cards) */}
      <Suspense fallback={<section id="testimonials" className="w-full min-h-screen" />}>
        <OstrumTestimonialsSection />
      </Suspense>

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
        <Suspense fallback={<section id="faq" className="w-full min-h-[600px]" />}>
          <OstrumFaqSection />
        </Suspense>

        {/* SECTION 08: Contact / Project Enquiry Form */}
        <Suspense fallback={<section id="contact" className="w-full min-h-[700px]" />}>
          <OstrumContactSection />
        </Suspense>
      </div>

      {/* SECTIONS 09 & 10: Final Closing CTA with Reveal Transition into Studio Footer */}
      <Suspense fallback={<div id="theatre-stage-wrapper" className="w-full min-h-[100svh] bg-[#050505]" />}>
        <OstrumFooterReveal />
      </Suspense>
    </div>
  );
}
