'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Book3DCanvas } from '@/components/canvas/Book3DCanvas';
import { PrimaryBtn } from '@/components/ui/PrimaryBtn';
import { LineByLine } from '@/components/ui/LineByLine';
import { MagnetWrap } from '@/components/ui/MagnetWrap';

export function BookInfos() {
  const { t, openModal } = useLanguage();

  return (
    <section className="book-infos relative w-full mt-32 md:mt-[200px] px-6 md:px-[12vw] lg:px-[15vw] flex flex-col md:flex-row items-center justify-between gap-12 md:gap-16 lg:gap-20">
      {/* Left Column: Interactive 3D Book */}
      <div className="book-img w-full md:w-1/2 flex items-center justify-center">
        <div className="w-full max-w-[420px]">
          <Book3DCanvas isInteractive={true} />
        </div>
      </div>

      {/* Right Column: Editorial Typographic Showcase */}
      <div className="book-content w-full md:w-1/2 flex flex-col justify-center text-left md:text-left">
        <LineByLine
          tag="h2"
          className="h1 font-serif text-white font-normal tracking-[-1.56px] leading-[0.92] text-[clamp(44px,5.4vw,78px)]"
          lines={[t.bookInfos.titleLine1, t.bookInfos.titleLine2]}
          delay={0.05}
          repeat={false}
        />

        <div className="mt-8 md:mt-9 max-w-[460px]">
          <LineByLine
            tag="div"
            className="book-desc space-y-1.5 text-base md:text-lg text-white/85 font-normal leading-[1.3] tracking-[-0.32px]"
            lines={t.bookInfos.desc}
            delay={0.15}
            repeat={false}
          />
        </div>

        <div className="mt-8 md:mt-9">
          <MagnetWrap strength={0.3}>
            <PrimaryBtn onClick={() => openModal('physical')}>
              {t.bookInfos.cta}
            </PrimaryBtn>
          </MagnetWrap>
        </div>
      </div>
    </section>
  );
}
