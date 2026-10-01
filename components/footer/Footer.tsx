'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { ClarteLogo } from '@/components/ui/ClarteLogo';
import { PrimaryBtn } from '@/components/ui/PrimaryBtn';

export function Footer() {
  const { t, openModal } = useLanguage();

  return (
    <footer className="footer relative w-full h-[100dvh] min-h-[640px] z-10 overflow-hidden bg-black">
      <div className="footer-inner relative w-full h-full flex flex-col justify-between p-6 md:p-8 overflow-hidden">
        {/* Center Glowing Lotus Flame Backdrop */}
        <div className="footer-bg absolute inset-0 pointer-events-none -z-10 flex items-center justify-center">
          <Image
            src="/images/footer.webp"
            alt="Luminous Floral Light"
            fill
            sizes="100vw"
            priority={false}
            className="object-cover opacity-90 mix-blend-screen scale-105"
          />
        </div>

        {/* Top Navigation Bar */}
        <nav className="footer-nav flex items-center justify-between text-sm md:text-base font-medium opacity-75 text-white z-10 pt-2">
          <div className="flex items-center gap-2">
            <a
              href="https://instagram.com/clarte.book"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-50 transition-opacity duration-200"
            >
              {t.footer.instagram}
            </a>
            <span className="opacity-40">—</span>
            <a
              href="mailto:orders@clarte.page"
              className="hover:opacity-50 transition-opacity duration-200"
            >
              {t.footer.contact}
            </a>
          </div>
          <p className="footer-copy tracking-wide">{t.footer.copyright}</p>
        </nav>

        {/* Monumental Bottom Logo with Center Floating Magnetic Button */}
        <div className="footer-logo relative w-full pb-2 md:pb-4 flex flex-col items-center">
          {/* Centered Action Button inside Wordmark */}
          <div className="magnet-wrap mb-4 md:mb-0 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-20">
            <PrimaryBtn
              theme="black"
              onClick={() => openModal('physical')}
              className="shadow-2xl ring-1 ring-white/10"
            >
              {t.footer.cta}
            </PrimaryBtn>
          </div>

          {/* Colossal Bottom Wordmark */}
          <div className="w-full text-white pointer-events-none select-none">
            <ClarteLogo className="w-full h-auto" />
          </div>
        </div>
      </div>
    </footer>
  );
}
