'use client';

import React, { useEffect, useState } from 'react';
import { OstrumLogo } from '@/components/ui/OstrumLogo';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [inFooter, setInFooter] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const nearBottom = scrollY + winHeight >= docHeight - 350;

      setScrolled(scrollY > 120 && !nearBottom);
      setInFooter(nearBottom);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`header fixed top-6 right-6 left-6 z-40 flex items-center transition-all duration-500 ease-out pointer-events-none ${
        scrolled ? 'justify-between' : 'justify-end'
      } ${inFooter ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      {/* Mini logo revealed on scroll */}
      <button
        onClick={scrollToTop}
        className={`pointer-events-auto transition-all duration-500 text-white cursor-pointer ${
          scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
        aria-label="Back to top"
      >
        <div className="w-[100px] h-auto">
          <OstrumLogo />
        </div>
      </button>

      {/* Top-Right Micro Label (Quiet discipline mark) */}
      <div className="pointer-events-auto text-[10px] md:text-[11px] tracking-[0.2em] text-white/50 uppercase font-sans font-normal py-2 px-3 select-none">
        DESIGN · TECHNOLOGY · VENTURES
      </div>
    </header>
  );
}
