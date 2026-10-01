'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ClarteLogo } from '@/components/ui/ClarteLogo';

export function Header() {
  const { locale, setLocale } = useLanguage();
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
          <ClarteLogo />
        </div>
      </button>

      {/* Language Switcher */}
      <nav className="pointer-events-auto">
        <ul className="flex items-center">
          <li>
            <button
              type="button"
              className="lang-switcher text-sm tracking-wide text-white py-2 px-3 focus:outline-none"
              onClick={() => setLocale(locale === 'en' ? 'fr' : 'en')}
              aria-label={`Switch language to ${locale === 'en' ? 'French' : 'English'}`}
            >
              <span
                className={`transition-opacity duration-200 ${
                  locale === 'en' ? 'opacity-100 font-medium' : 'opacity-50 hover:opacity-75'
                }`}
              >
                EN
              </span>
              <span className="opacity-40 mx-1.5">—</span>
              <span
                className={`transition-opacity duration-200 ${
                  locale === 'fr' ? 'opacity-100 font-medium' : 'opacity-50 hover:opacity-75'
                }`}
              >
                FR
              </span>
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
