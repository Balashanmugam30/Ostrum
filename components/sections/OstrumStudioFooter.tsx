'use client';

import React from 'react';

export function OstrumStudioFooter() {
  return (
    <footer
      id="studio-footer"
      data-testid="studio-footer"
      className="relative z-[26] w-full bg-[#0B0B10] text-white py-24 sm:py-32 px-6 sm:px-12 md:px-16 lg:px-20 border-t border-white/10 overflow-hidden"
      aria-label="Ostrum Studio Footer"
    >
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full blur-[120px] opacity-20 bg-[#362BEB]"
        aria-hidden="true"
      />

      <div className="max-w-[1440px] mx-auto flex flex-col justify-between items-start">
        {/* Overline & Main Conversation Invitation */}
        <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-8 pb-16 sm:pb-20 border-b border-white/10">
          <div className="max-w-[42rem]">
            <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.24em] font-semibold text-[#86FFF8] mb-4">
              READY FOR WHAT&apos;S NEXT?
            </p>
            <h2 className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.06]">
              Let&apos;s build the future together.
            </h2>
          </div>

          <div className="flex flex-col items-start md:items-end">
            <a
              href="mailto:hello@ostrum.co"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-[#0B0B10] font-sans text-base sm:text-lg font-semibold transition-all duration-300 hover:bg-[#86FFF8] hover:shadow-[0_10px_30px_rgba(134,255,248,0.25)] group"
            >
              <span>Start a Conversation</span>
              <span
                className="transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </a>
            <p className="font-mono text-xs text-white/50 mt-3">
              hello@ostrum.co · Direct Partner Line
            </p>
          </div>
        </div>

        {/* Bottom Metadata & Copyright */}
        <div className="w-full pt-10 sm:pt-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 font-mono text-xs text-white/50">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <span className="text-white font-semibold tracking-wider">
              OSTRUM STUDIO &amp; FOUNDRY
            </span>
            <span className="hidden sm:inline text-white/20">/</span>
            <span>Digital Systems · Intelligent Software · Connected Tech</span>
          </div>

          <div className="flex items-center gap-6">
            <span>© {new Date().getFullYear()} Ostrum. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default OstrumStudioFooter;
