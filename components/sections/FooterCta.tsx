'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { PrimaryBtn } from '@/components/ui/PrimaryBtn';
import { LineByLine } from '@/components/ui/LineByLine';
import { MagnetWrap } from '@/components/ui/MagnetWrap';

export function FooterCta() {
  const { t, openModal } = useLanguage();

  return (
    <section className="footer-cta relative w-full min-h-[75vh] md:min-h-[80vh] py-24 md:py-32 flex flex-col items-center justify-center text-center px-6">
      {/* Climactic Perspective Statement with Line-by-Line Reveal */}
      <div className="footer-title text-2xl md:text-3xl lg:text-[34px] font-normal leading-[1.35] tracking-[-0.02em] max-w-[800px] mb-10 md:mb-12 text-white">
        <LineByLine
          tag="h2"
          className="w-full text-center"
          lines={[
            `${t.footerCta.line1} **${t.footerCta.line1Highlight}**,`,
            `${t.footerCta.line2} **${t.footerCta.line2Highlight}**.`,
            `${t.footerCta.line3} **${t.footerCta.line3Highlight}**${t.footerCta.line3Suffix}`,
          ]}
          delay={0.1}
          repeat={false}
        />
      </div>

      {/* Inverted White Primary Action Button with MagnetWrap */}
      <div className="flex flex-col items-center gap-2">
        <MagnetWrap strength={0.3}>
          <PrimaryBtn
            theme="white"
            onClick={() => openModal('physical')}
            className="footer-btn shadow-2xl"
          >
            {t.footerCta.cta}
          </PrimaryBtn>
        </MagnetWrap>
        <span className="footer-span text-[11px] font-medium text-white/75 tracking-normal text-center">
          {t.footerCta.sublabel}
        </span>
      </div>
    </section>
  );
}
