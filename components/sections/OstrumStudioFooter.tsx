'use client';

import React from 'react';
import Link from 'next/link';
import BeamWordmarkFooter from '@/components/ui/beam-wordmark-footer';
import { SITE_CONFIG, hasValidLinkedIn } from '@/lib/site-config';

export function OstrumStudioFooter() {
  const currentYear = new Date().getFullYear();

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    const id = targetId.replace(/^#/, '');
    const element = document.getElementById(id);
    if (!element) {
      // Element not on this page (e.g. from legal routes) — allow natural navigation to /#id
      return;
    }
    e.preventDefault();

    if (typeof window !== 'undefined') {
      if (window.history.pushState) {
        window.history.pushState(null, '', `#${id}`);
      } else {
        window.location.hash = `#${id}`;
      }

      const stMap: Record<string, string> = {
        'selected-work': 'works-wheel-pin',
        'capabilities': 'capabilities-pin',
      };

      let targetY = element.getBoundingClientRect().top + window.scrollY;

      const stId = stMap[id];
      if (stId && (window as any).ScrollTrigger) {
        const st = (window as any).ScrollTrigger.getById(stId);
        if (st && typeof st.start === 'number') {
          targetY = st.start;
        }
      }

      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: 'smooth',
      });
    }
  };

  return (
    <BeamWordmarkFooter
      brand="Ostrum"
      wordmark="OSTRUM"
      company="Ostrum"
      year={currentYear}
      background="#64120F"
      ink="#F4F4F5"
      muted="#B9B0AF"
      accent="var(--ostrum-footer-accent, #C9362B)"
      wordTop="#C9362B"
      wordFoot="#64120F"
      wordWeight={700}
      cut={0.16}
      animate={true}
      className="w-full relative z-10 flex flex-col justify-between"
    >
      <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 md:px-16 lg:px-20 pt-24 sm:pt-36 md:pt-44">
        {/* PHASE 3A: TOP CONTACT TILES (Inspired by reference proportions, Ostrum brand identity) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7">
          {/* Tile 1: White Surface / Email Inquiry */}
          <a
            href="mailto:hello@theostrum.com"
            data-testid="footer-tile-email"
            className="group relative flex flex-col justify-between min-h-[240px] sm:min-h-[280px] md:min-h-[320px] p-8 sm:p-10 md:p-12 rounded-[22px] sm:rounded-[28px] bg-white text-[#050505] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(255,255,255,0.14)] hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ostrum-footer-accent,#C9362B)]"
          >
            <div>
              <span className="font-mono text-xs sm:text-[13px] uppercase tracking-[0.2em] font-semibold text-[#71717A] block">
                / PREFER EMAIL?
              </span>
              <h3 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#050505] mt-3 sm:mt-4">
                Prefer mail?
              </h3>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-black/10">
              <span className="font-sans text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-[#050505] group-hover:text-[var(--ostrum-footer-accent,#C9362B)] transition-colors">
                hello@theostrum.com
              </span>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-black/15 flex items-center justify-center transition-all duration-300 group-hover:border-[var(--ostrum-footer-accent,#FF4D30)] group-hover:bg-[var(--ostrum-footer-accent,#FF4D30)] group-hover:text-white">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 12L12 4M12 4H6M12 4V10" />
                </svg>
              </div>
            </div>
          </a>

          {/* Tile 2: Ostrum Red Surface / Start a Project CTA */}
          <Link
            href="/#contact"
            data-testid="footer-tile-project"
            onClick={(e) => handleNavClick(e, '#contact')}
            className="group relative flex flex-col justify-between min-h-[240px] sm:min-h-[280px] md:min-h-[320px] p-8 sm:p-10 md:p-12 rounded-[22px] sm:rounded-[28px] bg-[var(--ostrum-footer-accent,#FF4D30)] text-[#050505] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(255,77,48,0.32)] hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#050505]"
          >
            <div>
              <span className="font-mono text-xs sm:text-[13px] uppercase tracking-[0.2em] font-semibold text-[#050505]/80 block">
                / NEXT STEP
              </span>
              <h3 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#050505] mt-3 sm:mt-4">
                Start a project
              </h3>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-black/15">
              <span className="font-sans text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-[#050505] group-hover:translate-x-1 transition-transform">
                Start a project
              </span>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-black/20 text-[#050505] flex items-center justify-center transition-all duration-300 group-hover:border-[#050505] group-hover:bg-[#050505] group-hover:text-white">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 12L12 4M12 4H6M12 4V10" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* PHASE 3B: MAIN FOOTER DIRECTORY */}
        <div className="mt-28 sm:mt-36 md:mt-44 pt-12 sm:pt-16 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-10 sm:gap-12 lg:gap-16">
          {/* Column 1: EXPLORE */}
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] font-semibold text-[var(--ostrum-footer-label-accent,#FF765E)] block mb-5">
              EXPLORE
            </span>
            <ul className="space-y-3 font-sans text-sm sm:text-base text-[#D4D4D8]">
              <li>
                <Link
                  href="/#selected-work"
                  onClick={(e) => handleNavClick(e, '#selected-work')}
                  className="transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  Selected Work
                </Link>
              </li>
              <li>
                <Link
                  href="/#capabilities"
                  onClick={(e) => handleNavClick(e, '#capabilities')}
                  className="transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  Capabilities
                </Link>
              </li>
              <li>
                <Link
                  href="/#faq"
                  onClick={(e) => handleNavClick(e, '#faq')}
                  className="transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/#contact"
                  onClick={(e) => handleNavClick(e, '#contact')}
                  className="transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: CONNECT */}
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] font-semibold text-[var(--ostrum-footer-label-accent,#FF765E)] block mb-5">
              CONNECT
            </span>
            <ul className="space-y-3 font-sans text-sm sm:text-base text-[#D4D4D8]">
              <li>
                <a
                  href={`mailto:${SITE_CONFIG.contactEmail}`}
                  className="transition-colors hover:text-white hover:underline underline-offset-4 break-all"
                >
                  {SITE_CONFIG.contactEmail}
                </a>
              </li>
              <li className="text-xs sm:text-sm text-[#B9B0AF]">
                Direct Partner Line
              </li>
              <li className="pt-2">
                {hasValidLinkedIn() ? (
                  <a
                    href={SITE_CONFIG.linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-white inline-flex items-center gap-2 group text-[#D4D4D8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ostrum-footer-label-accent,#FF765E)] rounded"
                    aria-label="OSTRUM on LinkedIn"
                    data-testid="footer-linkedin-link"
                  >
                    <svg
                      className="w-4 h-4 fill-current text-[var(--ostrum-footer-label-accent,#FF765E)] transition-transform group-hover:scale-110 shrink-0"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.3a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28" />
                    </svg>
                    <span className="group-hover:underline underline-offset-4">LinkedIn</span>
                    <span aria-hidden="true" className="text-xs opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
                  </a>
                ) : (
                  <div
                    className="inline-flex items-center gap-2 text-[#D4D4D8]"
                    title="OSTRUM official LinkedIn profile is currently in preparation"
                    aria-label="LinkedIn profile in preparation"
                    data-testid="footer-linkedin-pending"
                  >
                    <svg
                      className="w-4 h-4 fill-current text-[var(--ostrum-footer-label-accent,#FF765E)] shrink-0"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.3a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28" />
                    </svg>
                    <span>LinkedIn</span>
                    <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-[#FFB3A7] border border-white/10">
                      Pending
                    </span>
                  </div>
                )}
              </li>
            </ul>
          </div>

          {/* Column 3: LEGAL */}
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] font-semibold text-[var(--ostrum-footer-label-accent,#FF765E)] block mb-5">
              LEGAL
            </span>
            <ul className="space-y-3 font-sans text-sm sm:text-base text-[#D4D4D8]">
              <li>
                <Link
                  href="/terms-and-conditions"
                  className="transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: STUDIO NOTE & COPYRIGHT */}
          <div className="col-span-2 md:col-span-1 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] font-semibold text-white/90 block mb-2">
                OSTRUM
              </span>
              <p className="font-sans text-xs text-[#B9B0AF] mt-2 leading-relaxed">
                Digital systems, intelligent software, and high-impact venture engineering.
              </p>
            </div>

            <div className="mt-8 font-mono text-xs text-[#B9B0AF]">
              © {currentYear} Ostrum. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </BeamWordmarkFooter>
  );
}

export default OstrumStudioFooter;
