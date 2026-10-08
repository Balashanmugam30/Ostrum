'use client';

import React, { useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { IntroHero } from '@/components/sections/IntroHero';
import { FoundrySection } from '@/components/sections/FoundrySection';
import { GallerySection } from '@/components/sections/GallerySection';
import { FooterCta } from '@/components/sections/FooterCta';
import { Footer } from '@/components/footer/Footer';

export default function FrenchPage() {
  const { setLocale } = useLanguage();

  useEffect(() => {
    setLocale('fr');
  }, [setLocale]);

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* SECTION 01: Monumental Hero Narrative & Parallax Logo */}
      <IntroHero />

      {/* SECTION 02: Ostrum Foundry (2.5D Venture Dossier & Studio Model) */}
      <FoundrySection />

      {/* SECTION 04: The Experiential Space (3D Interactive Fan Carousel) */}
      <GallerySection />

      {/* SECTION 05: Climactic Perspective Statement & Optical Serif Highlights */}
      <FooterCta />

      {/* SECTION 06: Epilogue & Monumental Footer with Floral Flame and Centered CTA */}
      <Footer />
    </div>
  );
}
