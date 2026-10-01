'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { PrimaryBtn } from '@/components/ui/PrimaryBtn';

export function FooterCta() {
  const { t, openModal } = useLanguage();

  return (
    <section className="footer-cta relative w-full min-h-[75vh] md:min-h-[80vh] py-24 md:py-32 flex flex-col items-center justify-center text-center px-6">
      {/* Climactic Perspective Statement */}
      <h2 className="footer-title text-2xl md:text-3xl lg:text-[34px] font-normal leading-[1.35] tracking-[-0.02em] max-w-[800px] mb-10 md:mb-12 text-white">
        <span className="block">
          {t.footerCta.line1}
          <span className="highlight font-serif italic text-white underline-offset-4">
            {t.footerCta.line1Highlight}
          </span>
          ,
        </span>
        <span className="block mt-1">
          {t.footerCta.line2}
          <span className="highlight font-serif italic text-white">
            {t.footerCta.line2Highlight}
          </span>
          .
        </span>
        <span className="block mt-1">
          {t.footerCta.line3}
          <span className="highlight font-serif italic text-white">
            {t.footerCta.line3Highlight}
          </span>
          {t.footerCta.line3Suffix}
        </span>
      </h2>

      {/* Inverted White Primary Action Button */}
      <div className="flex flex-col items-center gap-2">
        <PrimaryBtn
          theme="white"
          onClick={() => openModal('physical')}
          className="footer-btn shadow-2xl"
        >
          {t.footerCta.cta}
        </PrimaryBtn>
        <span className="footer-span text-[11px] font-medium text-white/75 tracking-normal text-center">
          {t.footerCta.sublabel}
        </span>
      </div>
    </section>
  );
}
