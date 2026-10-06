'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { ClarteLogo } from '@/components/ui/ClarteLogo';
import { PrimaryBtn } from '@/components/ui/PrimaryBtn';
import { MagnetWrap } from '@/components/ui/MagnetWrap';

export function Footer() {
  const { t, openModal } = useLanguage();

  return (
    <footer className="footer relative w-full h-[100dvh] z-10">
      <div className="footer-clip">
        <div className="footer-inner relative w-full h-[100dvh] flex flex-col justify-between p-6 md:p-8 overflow-hidden bg-black sticky top-0">
          {/* Luminous Center Backdrop Texture */}
          <div className="footer-bg absolute inset-0 pointer-events-none -z-1 flex items-center justify-center">
            <Image
              src="/images/footer.webp"
              alt="Luminous backdrop"
              fill
              sizes="100vw"
              priority={false}
              className="object-cover opacity-90 mix-blend-screen scale-105"
            />
          </div>

          {/* Top Navigation Bar */}
          <nav className="footer-nav flex items-center justify-between text-base font-medium opacity-75 text-white z-10 pt-2">
            <div className="flex items-center gap-2">
              <a
                href="https://instagram.com/clarte.book"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-50 transition-opacity duration-300"
              >
                {t.footer.instagram}
              </a>
              <span className="separator opacity-40"> — </span>
              <a
                href="mailto:orders@clarte.page"
                className="hover:opacity-50 transition-opacity duration-300"
              >
                {t.footer.contact}
              </a>
            </div>
            <p className="footer-copy tracking-wide hidden md:block">
              {t.footer.copyright}
            </p>
            <span className="w-12 hidden md:block"></span>
          </nav>

          {/* Colossal Bottom Wordmark with Center Floating Magnetic Button */}
          <div className="footer-logo relative w-full pb-2 md:pb-4 flex flex-col items-center">
            {/* Centered Magnetic Action Button */}
            <div className="magnet-wrap mb-4 md:mb-0 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-20">
              <MagnetWrap strength={0.4}>
                <PrimaryBtn
                  theme="black"
                  onClick={() => openModal('physical')}
                  className="shadow-2xl ring-1 ring-white/10"
                >
                  {t.footer.cta}
                </PrimaryBtn>
              </MagnetWrap>
            </div>

            {/* Monumental Clarte Wordmark */}
            <div className="w-full text-white pointer-events-none select-none">
              <ClarteLogo className="w-full h-auto" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
