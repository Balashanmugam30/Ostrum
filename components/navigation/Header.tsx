'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { usePreloader } from '@/context/PreloaderContext';
import { OstrumLogo } from '@/components/ui/OstrumLogo';

const NAV_LINKS = [
  { id: 'selected-work', num: '01', label: 'Selected Work' },
  { id: 'capabilities', num: '02', label: 'Capabilities' },
  { id: 'engine', num: '03', label: 'The Engine' },
  { id: 'testimonials', num: '04', label: 'Testimonials' },
  { id: 'faq', num: '05', label: 'FAQ' },
  { id: 'contact', num: '06', label: 'Contact' },
];

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isRevealed =
    (phase === 'docking' && dockProgress >= 0.5) ||
    phase === 'complete' ||
    isComplete;

  const checkContrast = useCallback(() => {
    if (typeof document === 'undefined') return false;

    const sampleY = Math.min(36, window.innerHeight - 1);
    const samplePoints = [
      Math.min(60, Math.max(24, window.innerWidth * 0.08)), // logo anchor area
      window.innerWidth / 2,                                // center header area
    ];

    for (const sampleX of samplePoints) {
      const elements = document.elementsFromPoint(sampleX, sampleY);
      const targetEl = elements.find(
        (el) => !el.closest('.header') && !el.closest('#mobile-nav-drawer')
      );
      if (!targetEl) continue;

      const surfaceEl = targetEl.closest(
        '[data-selection-surface], [data-theme], #capabilities, #testimonials, #faq'
      );
      if (surfaceEl) {
        const surface = surfaceEl.getAttribute('data-selection-surface');
        const theme = surfaceEl.getAttribute('data-theme');
        if (
          surface === 'light' ||
          theme === 'light' ||
          surfaceEl.id === 'capabilities' ||
          surfaceEl.id === 'testimonials' ||
          surfaceEl.id === 'faq'
        ) {
          return true;
        }
        if (surface === 'dark' || surface === 'coral' || theme === 'dark') {
          return false;
        }
      }
    }

    return false;
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
    window.addEventListener('resize', handleScroll);
    window.addEventListener('ostrum:bg-darken', handleDarken);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      window.removeEventListener('ostrum:bg-darken', handleDarken);
    };
  }, [isLegalPage, checkContrast, isRevealed]);

  // Lock body scroll and listen for Escape key when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsMenuOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isMenuOpen]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMobileNavClick = (id: string) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (!element) return;

    const stMap: Record<string, string> = {
      'selected-work': 'works-wheel-pin',
      'capabilities': 'capabilities-pin',
      'engine': 'section02-hold',
    };

    let targetY = element.getBoundingClientRect().top + window.scrollY;

    const stId = stMap[id];
    if (stId && (window as any).ScrollTrigger) {
      const st = (window as any).ScrollTrigger.getById(stId);
      if (st && typeof st.start === 'number') {
        targetY = st.start;
      }
    }

    setTimeout(() => {
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: 'smooth',
      });
    }, 150);
  };

  // If on dedicated legal pages, they render their own editorial header
  if (isLegalPage) return null;

  const textColorClass = isLightSection ? 'text-[#161514]' : 'text-[#FFF8F3]';

  return (
    <>
      <header
        className={`header fixed top-4 sm:top-6 right-4 sm:right-6 left-4 sm:left-6 z-40 flex items-center justify-between transition-colors duration-300 ease-out pointer-events-none ${textColorClass} ${
          !isRevealed
            ? 'opacity-0 pointer-events-none'
            : 'opacity-100'
        }`}
      >
        {/* Mini logo revealed on scroll */}
        <button
          onClick={scrollToTop}
          className={`pointer-events-auto transition-all duration-500 cursor-pointer ${textColorClass} opacity-100 translate-y-0`}
          aria-label="Back to top"
        >
          <div className="w-[90px] sm:w-[100px] h-auto">
            <OstrumLogo className={textColorClass} />
          </div>
        </button>

        {/* Mobile Navigation Toggle (Visible on mobile viewports < 768px) */}
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className={`md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full p-2.5 transition-all duration-300 cursor-pointer ${
            isLightSection
              ? 'text-[#161514] bg-black/5 hover:bg-black/10'
              : 'text-[#FFF8F3] bg-white/10 hover:bg-white/15'
          } ${
            inFooter || isCinematic
              ? 'opacity-0 pointer-events-none'
              : (scrolled ? 'opacity-100 pointer-events-auto' : 'opacity-90 pointer-events-auto')
          }`}
          aria-label="Toggle Navigation Menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav-drawer"
          data-testid="mobile-menu-toggle"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {isMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </header>

      {/* Mobile Navigation Drawer */}
      <div
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        data-testid="mobile-nav-drawer"
        className={`fixed inset-0 z-50 md:hidden bg-[#0A0104]/96 backdrop-blur-2xl transition-all duration-300 flex flex-col justify-between p-6 sm:p-8 pointer-events-auto ${
          isMenuOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <button
            onClick={() => {
              setIsMenuOpen(false);
              scrollToTop();
            }}
            aria-label="Ostrum Home"
            className="w-[105px] h-auto cursor-pointer"
          >
            <OstrumLogo className="text-[#FFF8F3]" />
          </button>
          <button
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close Navigation Menu"
            data-testid="mobile-menu-close"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer Navigation Links */}
        <nav className="my-auto py-6" aria-label="Mobile Navigation Links">
          <ul className="space-y-4">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => handleMobileNavClick(link.id)}
                  data-testid={`mobile-nav-${link.id}`}
                  className="group w-full flex items-baseline text-left py-2.5 text-white/90 hover:text-[#FF4D30] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9362B] cursor-pointer"
                >
                  <span className="font-mono text-xs text-[#C9362B] mr-4 font-semibold tracking-widest">
                    {link.num}
                  </span>
                  <span className="font-sans text-2xl sm:text-3xl font-light tracking-tight group-hover:translate-x-1 transition-transform">
                    {link.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Drawer Footer Actions */}
        <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
          <a
            href="mailto:hello@theostrum.tech"
            data-testid="mobile-nav-email-link"
            className="w-full min-h-[48px] py-3.5 px-6 rounded-full bg-[#C9362B] text-white font-medium text-sm text-center hover:bg-[#FF4D30] transition-colors flex items-center justify-center gap-2"
          >
            <span>Start a project</span>
            <span className="text-xs opacity-75 font-mono">hello@theostrum.tech</span>
          </a>
          <p className="font-mono text-[11px] text-white/50 text-center uppercase tracking-widest">
            Ostrum Tech · Digital Product Engineering
          </p>
        </div>
      </div>
    </>
  );
}
