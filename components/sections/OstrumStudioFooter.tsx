'use client';

import React from 'react';
import Link from 'next/link';
import BeamWordmarkFooter from '@/components/ui/beam-wordmark-footer';

export function OstrumStudioFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <BeamWordmarkFooter
      brand="Ostrum"
      wordmark="OSTRUM"
      company="Ostrum"
      year={currentYear}
      background="#050505"
      ink="#F4F4F5"
      muted="#8E8E93"
      accent="#F04438"
      wordTop="#240B0F"
      wordFoot="#050505"
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
            href="mailto:hello@ostrum.co"
            data-testid="footer-tile-email"
            className="group relative flex flex-col justify-between min-h-[240px] sm:min-h-[280px] md:min-h-[320px] p-8 sm:p-10 md:p-12 rounded-[22px] sm:rounded-[28px] bg-white text-[#050505] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(255,255,255,0.14)] hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F04438]"
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
              <span className="font-sans text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-[#050505] group-hover:text-[#F04438] transition-colors">
                hello@ostrum.co
              </span>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-black/15 flex items-center justify-center transition-all duration-300 group-hover:border-[#F04438] group-hover:bg-[#F04438] group-hover:text-white">
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
          <a
            href="#contact"
            data-testid="footer-tile-project"
            className="group relative flex flex-col justify-between min-h-[240px] sm:min-h-[280px] md:min-h-[320px] p-8 sm:p-10 md:p-12 rounded-[22px] sm:rounded-[28px] bg-[#F04438] text-white transition-all duration-300 hover:shadow-[0_20px_50px_rgba(240,68,56,0.32)] hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <div>
              <span className="font-mono text-xs sm:text-[13px] uppercase tracking-[0.2em] font-semibold text-white/80 block">
                / NEXT STEP
              </span>
              <h3 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mt-3 sm:mt-4">
                Start a project
              </h3>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/20">
              <span className="font-sans text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white group-hover:translate-x-1 transition-transform">
                Start a project
              </span>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/30 flex items-center justify-center transition-all duration-300 group-hover:border-white group-hover:bg-white group-hover:text-[#F04438]">
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
        </div>

        {/* PHASE 3B: MAIN FOOTER DIRECTORY */}
        <div className="mt-28 sm:mt-36 md:mt-44 pt-12 sm:pt-16 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-10 sm:gap-12 lg:gap-16">
          {/* Column 1: EXPLORE */}
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] font-semibold text-[#F04438] block mb-5">
              EXPLORE
            </span>
            <ul className="space-y-3 font-sans text-sm sm:text-base text-[#D4D4D8]">
              <li>
                <a
                  href="#selected-work"
                  className="transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  Selected Work
                </a>
              </li>
              <li>
                <a
                  href="#capabilities"
                  className="transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  Capabilities
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: CONNECT */}
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] font-semibold text-[#F04438] block mb-5">
              CONNECT
            </span>
            <ul className="space-y-3 font-sans text-sm sm:text-base text-[#D4D4D8]">
              <li>
                <a
                  href="mailto:hello@ostrum.co"
                  className="transition-colors hover:text-white hover:underline underline-offset-4 break-all"
                >
                  hello@ostrum.co
                </a>
              </li>
              <li className="text-xs sm:text-sm text-[#71717A]">
                Direct Partner Line
              </li>
            </ul>
          </div>

          {/* Column 3: LEGAL */}
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] font-semibold text-[#F04438] block mb-5">
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
              <p className="font-sans text-sm text-[#8E8E93] leading-relaxed">
                Design · Technology · Ventures
              </p>
              <p className="font-sans text-xs text-[#71717A] mt-2 leading-relaxed">
                Digital systems, intelligent software, and high-impact venture engineering.
              </p>
            </div>

            <div className="mt-8 font-mono text-xs text-[#71717A]">
              © {currentYear} Ostrum. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </BeamWordmarkFooter>
  );
}

export default OstrumStudioFooter;
