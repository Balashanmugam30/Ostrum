'use client';

import React, { useState, useCallback } from 'react';
import { WorksWheel, OSTRUM_WORKS } from '@/components/ui/works-wheel';

export function OstrumWorksWheelSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const handleActiveChange = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const activeProject = OSTRUM_WORKS[activeIndex] || OSTRUM_WORKS[0];
  const activeTheme = activeProject.theme;

  return (
    <section
      id="selected-work"
      data-testid="selected-work-section"
      className="relative z-[20] w-full transition-colors duration-500 ease-out"
      style={{
        marginTop: '-100vh',
        backgroundColor: activeTheme.bg,
        color: activeTheme.text,
      }}
      aria-label="Selected Works"
    >
      {/* Works Wheel Container - Full Screen Stage */}
      <div
        className="w-full h-screen relative overflow-hidden transition-colors duration-500 ease-out"
        style={{ backgroundColor: activeTheme.bg }}
      >
        <WorksWheel
          items={OSTRUM_WORKS}
          label="OSTRUM / WORKS"
          action="View"
          onActiveChange={handleActiveChange}
          activeTheme={activeTheme}
          className="w-full h-full"
        />
      </div>

      {/* Natural scroll continuation buffer below the wheel */}
      <footer
        className="w-full py-20 sm:py-28 flex flex-col items-center justify-center border-t transition-colors duration-500 ease-out text-center px-4"
        style={{
          backgroundColor: activeTheme.bg,
          borderColor: `${activeTheme.text}18`,
        }}
      >
        <p
          className="font-mono text-xs uppercase tracking-[0.24em] mb-3 font-semibold"
          style={{ color: '#d93829' }}
        >
          OSTRUM STUDIO · SELECTED WORK
        </p>
        <a
          href="mailto:hello@ostrum.co"
          className="text-base sm:text-lg font-medium transition-opacity hover:opacity-75 flex items-center gap-2 group"
          style={{ color: activeTheme.text }}
        >
          <span>Have a system to build or venture to launch? Start a Conversation</span>
          <span
            className="transition-transform group-hover:translate-x-1"
            aria-hidden="true"
            style={{ color: '#d93829' }}
          >
            →
          </span>
        </a>
      </footer>
    </section>
  );
}

export default OstrumWorksWheelSection;
