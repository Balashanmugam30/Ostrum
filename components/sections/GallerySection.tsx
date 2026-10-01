'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { GalleryCanvas } from '@/components/canvas/GalleryCanvas';

export function GallerySection() {
  const { t } = useLanguage();

  return (
    <section className="gallery relative w-full mt-32 md:mt-[200px] overflow-hidden">
      {/* Centered Gallery Header */}
      <div className="gallery-header flex flex-col items-center justify-center text-center px-6">
        <h2 className="h1 font-serif text-white font-normal tracking-[-1.56px] leading-[0.92] text-[clamp(44px,5.4vw,78px)]">
          {t.gallery.title}
        </h2>
        <div className="gallery-subtitle mt-4 md:mt-5 text-base md:text-lg text-white/80 font-normal leading-[1.3] tracking-[-0.32px] max-w-[500px]">
          <p>{t.gallery.subtitleLine1}</p>
          <p>{t.gallery.subtitleLine2}</p>
        </div>
      </div>

      {/* 3D Interactive Fan Carousel */}
      <div className="mt-12 md:mt-16 w-full">
        <GalleryCanvas />
      </div>
    </section>
  );
}
