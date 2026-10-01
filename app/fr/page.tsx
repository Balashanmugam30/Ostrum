'use client';

import React, { useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { IntroHero } from '@/components/sections/IntroHero';
import { BookInfos } from '@/components/sections/BookInfos';
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
      {/* SECTION 01 / 02: Monumental Hero Narrative & Parallax Logo */}
      <IntroHero />

      {/* SECTION 03: The Artifact Showcase (Interactive 3D Book & Editorial Copy) */}
      <BookInfos />

      {/* SECTION 04: The Experiential Space (3D Interactive Fan Carousel) */}
      <GallerySection />

      {/* SECTION 05: Climactic Perspective Statement & Optical Serif Highlights */}
      <FooterCta />

      {/* SECTION 06: Epilogue & Monumental Footer with Floral Flame and Centered CTA */}
      <Footer />
    </div>
  );
}
