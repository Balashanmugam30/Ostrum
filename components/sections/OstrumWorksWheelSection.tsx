'use client';

import React from 'react';
import { WorksWheel, OSTRUM_WORKS } from '@/components/ui/works-wheel';

export function OstrumWorksWheelSection() {
  return (
    <section
      id="selected-work"
      data-testid="selected-work-section"
      className="relative z-[20] w-full bg-black text-white"
      aria-label="Selected Works"
    >
      {/* Works Wheel Container - Full Screen Stage */}
      <div className="w-full h-screen relative overflow-hidden bg-black">
        <WorksWheel
          items={OSTRUM_WORKS}
          label="Works '26"
          action="View"
          className="w-full h-full"
        />
      </div>

      {/* Natural scroll continuation buffer below the wheel */}
      <footer className="w-full py-20 sm:py-28 flex flex-col items-center justify-center border-t border-white/10 bg-black text-center px-4">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#ff5c4a] mb-3">
          OSTRUM STUDIO · 2026
        </p>
        <a
          href="mailto:hello@ostrum.co"
          className="text-base sm:text-lg font-medium text-white/90 hover:text-[#ff5c4a] transition-colors flex items-center gap-2 group"
        >
          <span>Have a system to build or venture to launch? Start a Conversation</span>
          <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">
            →
          </span>
        </a>
      </footer>
    </section>
  );
}

export default OstrumWorksWheelSection;
