'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { usePreloader } from '@/context/PreloaderContext';
import { OstrumLogo } from '@/components/ui/OstrumLogo';

export function Header() {
  const pathname = usePathname();
  const isLegalPage =
    pathname?.startsWith('/terms-and-conditions') ||
    pathname?.startsWith('/privacy-policy');

  const { isComplete, phase, dockProgress } = usePreloader();
  const [scrolled, setScrolled] = useState(false);
  const [inFooter, setInFooter] = useState(false);
  const [isCinematic, setIsCinematic] = useState(false);
  const [isLightSection, setIsLightSection] = useState(false);

  const isRevealed =
    (phase === 'docking' && dockProgress >= 0.5) ||
    phase === 'complete' ||
    isComplete;

  const checkContrast = useCallback(() => {
    if (typeof document === 'undefined') return false;
    const headerPointY = 40;
    const headerPointX = 60;
    const targetEl = document.elementFromPoint(headerPointX, headerPointY);
    if (!targetEl) return false;

    const lightAncestor = targetEl.closest(
      '#testimonials, #capabilities, [data-theme="light"], .bg-white, [style*="background-color: #FFFFFF"], [style*="background-color: rgb(255, 255, 255)"], [style*="#F7F5F2"], [style*="#FAF7F2"]'
    );
    return !!lightAncestor;
  }, []);

  useEffect(() => {
    if (isLegalPage) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const nearBottom = scrollY + winHeight >= docHeight - 350;

      const energyEl = document.getElementById('energy-narrative');
      let inCinematicZone = false;
      if (energyEl) {
        const rect = energyEl.getBoundingClientRect();
        inCinematicZone = rect.top <= 120 && rect.bottom >= -100;
      }

      setScrolled(scrollY > 120 && !nearBottom);
      setInFooter(nearBottom);
      setIsCinematic(inCinematicZone);
      setIsLightSection(checkContrast());
    };

    const handleDarken = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      const darken =
        typeof customEvent.detail === 'number' ? customEvent.detail : 0;
      setIsCinematic(darken > 0.15);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('ostrum:bg-darken', handleDarken);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('ostrum:bg-darken', handleDarken);
    };
  }, [isLegalPage, checkContrast]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If on dedicated legal pages, they render their own editorial header
  if (isLegalPage) return null;

  const textColorClass = isLightSection ? 'text-[#161514]' : 'text-[#FFF8F3]';

  return (
    <header
      className={`header fixed top-6 right-6 left-6 z-40 flex items-center justify-start transition-colors duration-300 ease-out pointer-events-none ${textColorClass} ${
        !isRevealed || inFooter || isCinematic
          ? 'opacity-0 pointer-events-none'
          : 'opacity-100'
      }`}
    >
      {/* Mini logo revealed on scroll */}
      <button
        onClick={scrollToTop}
        className={`pointer-events-auto transition-all duration-500 cursor-pointer ${textColorClass} ${
          scrolled
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
        aria-label="Back to top"
      >
        <div className="w-[100px] h-auto">
          <OstrumLogo className={textColorClass} />
        </div>
      </button>
    </header>
  );
}
