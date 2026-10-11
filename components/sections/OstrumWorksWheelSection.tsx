'use client';

import React from 'react';
import { WorksWheel, OSTRUM_WORKS } from '@/components/ui/works-wheel';
import { AnodizedInk } from '@/components/ui/anodized-ink';

export function OstrumWorksWheelSection() {
  return (
    <section
      id="selected-work"
      data-testid="selected-work-section"
      className="relative z-[20] w-full bg-[#030000] text-white overflow-hidden"
      style={{ marginTop: '-100vh' }}
      aria-label="Selected Works"
    >
      {/* Works Wheel Container - Full Screen Stage with Persistent Anodized Ink Background */}
      <div className="w-full h-screen relative overflow-hidden bg-[#030000]">
        {/* Anodized Ink WebGL2 Shader Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <AnodizedInk
            preset="crimson"
            speed={0.65}
            turbulence={0.85}
            scale={0.9}
            sheen={0.65}
            grain={0.25}
            glow={0.65}
            swirl={0.6}
            vignette={0.78}
            interactive={true}
            ripples={true}
            maxDpr={1.25}
            height="100%"
          />
        </div>

        {/* Works Wheel Stage (Ring at rest, Two-Column Large Drum on scroll) */}
        <div className="relative z-10 w-full h-full">
          <WorksWheel
            items={OSTRUM_WORKS}
            label="Selected Work"
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Natural scroll continuation footer below the wheel */}
      <footer className="w-full py-20 sm:py-28 flex flex-col items-center justify-center border-t border-white/10 bg-[#030000]/95 backdrop-blur-md text-center px-4 relative z-10">
        <p className="font-mono text-xs uppercase tracking-[0.24em] mb-3 font-semibold text-[#d1001c]">
          OSTRUM STUDIO · SELECTED WORK
        </p>
        <a
          href="mailto:hello@ostrum.co"
          className="text-base sm:text-lg font-medium text-white/90 hover:text-white transition-opacity flex items-center gap-2 group"
        >
          <span>Have a system to build or venture to launch? Start a Conversation</span>
          <span
            className="transition-transform group-hover:translate-x-1 text-[#d1001c]"
            aria-hidden="true"
          >
            →
          </span>
        </a>
      </footer>
    </section>
  );
}

export default OstrumWorksWheelSection;
