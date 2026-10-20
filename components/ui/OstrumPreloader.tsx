'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { usePreloader } from '@/context/PreloaderContext';

interface DigitColumnProps {
  digit: number;
}

function DigitColumn({ digit }: DigitColumnProps) {
  // 11-digit vertical strip: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0] (index 10 is wrap 0 for seamless forward rolling)
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  const [currentIndex, setCurrentIndex] = useState(digit);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const prevDigitRef = useRef(digit);

  useEffect(() => {
    const prev = prevDigitRef.current;
    prevDigitRef.current = digit;

    if (prev === digit) return;

    // Direct jump / seek handling (instant snap without glitching through all digits)
    const diff = Math.abs(digit - prev);
    if (diff > 2 && !(prev === 9 && digit === 0)) {
      setTransitionEnabled(false);
      setCurrentIndex(digit);
      requestAnimationFrame(() => {
        setTransitionEnabled(true);
      });
      return;
    }

    // Normal forward wrap from 9 -> 0
    if (prev === 9 && digit === 0) {
      setTransitionEnabled(true);
      setCurrentIndex(10); // Animate to 10th index (which is duplicate '0')

      const timer = setTimeout(() => {
        setTransitionEnabled(false);
        setCurrentIndex(0); // Snap back to 0 index invisibly
        requestAnimationFrame(() => {
          setTransitionEnabled(true);
        });
      }, 95);

      return () => clearTimeout(timer);
    }

    // Standard increment
    setTransitionEnabled(true);
    setCurrentIndex(digit);
  }, [digit]);

  return (
    <span
      className="relative inline-block h-[1.05em] w-[0.62em] overflow-hidden align-baseline"
      aria-hidden="true"
    >
      <span
        className="absolute top-0 left-0 flex flex-col w-full will-change-transform"
        style={{
          transform: `translate3d(0, -${currentIndex * (100 / digits.length)}%, 0)`,
          transition: transitionEnabled
            ? 'transform 95ms cubic-bezier(0.16, 1, 0.3, 1)'
            : 'none',
        }}
      >
        {digits.map((d, idx) => (
          <span
            key={idx}
            className="flex items-center justify-center font-['Neue_Montreal',sans-serif] font-normal text-white"
            style={{ height: '1.05em' }}
          >
            {d}
          </span>
        ))}
      </span>
      {/* Screen reader accessible value */}
      <span className="sr-only">{digit}</span>
    </span>
  );
}

export function OstrumPreloader() {
  const pathname = usePathname();
  const isLegalPage =
    pathname?.startsWith('/terms-and-conditions') ||
    pathname?.startsWith('/privacy-policy');

  const { phase, isComplete, progressPercent, overlayOpacity, counterOpacity, transformProgress } = usePreloader();

  const bgRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const crimsonAtmosphereRef = useRef<HTMLDivElement>(null);

  const isDockingOrLater = phase === 'docking' || phase === 'complete';

  // Real-time synchronous frame updates for overlayOpacity and counterOpacity directly in RAF
  useEffect(() => {
    const onProgress = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        if (typeof detail.overlayOpacity === 'number' && bgRef.current) {
          bgRef.current.style.opacity = String(detail.overlayOpacity);
        }
        if (typeof detail.counterOpacity === 'number' && counterRef.current) {
          counterRef.current.style.opacity = String(detail.counterOpacity);
        }
      }
    };
    window.addEventListener('ostrum:intro-progress', onProgress);
    return () => window.removeEventListener('ostrum:intro-progress', onProgress);
  }, []);

  // Subtle crimson ambient atmospheric response during transformation and docking
  useEffect(() => {
    if (isComplete) return;

    if (phase === 'docking' || phase === 'transforming') {
      if (crimsonAtmosphereRef.current) {
        crimsonAtmosphereRef.current.style.opacity = phase === 'docking' ? '0.85' : '0.40';
      }
    }
  }, [phase, isComplete]);

  if (isComplete) {
    return null;
  }

  // Decompose clean 3-digit number (000 to 100)
  const clamped = Math.max(0, Math.min(100, Math.round(progressPercent)));
  const d100 = Math.floor(clamped / 100);       // 0 or 1 (Hundreds)
  const d10 = Math.floor((clamped % 100) / 10); // 0 to 9 (Tens)
  const d1 = clamped % 10;                      // 0 to 9 (Units)

  if (isLegalPage) {
    return null;
  }

  return (
    <div
      id="ostrum-preloader-root"
      data-testid="ostrum-preloader-root"
      data-phase={phase}
      className="fixed inset-0 pointer-events-none select-none"
    >
      {/* =========================================================================
          LAYER 1: FULL-SCREEN PURE BLACK STAGE (#000000) (z-[15])
          Synchronized to master timeline: remains 100% opaque through transformation,
          counter quick-fade, and the beginning of docking travel, then smoothly blends into hero (1 -> 0)
          as the sculpture approaches the hero 'O'.
          ========================================================================= */}
      <div
        ref={bgRef}
        id="preloader-background-layer"
        data-testid="preloader-background-layer"
        className="fixed inset-0 z-[15] overflow-hidden will-change-[opacity]"
        style={{
          backgroundColor: '#000000',
          opacity: overlayOpacity,
        }}
      >
        {/* Subtle Ostrum Crimson Atmosphere Aura (activates during transformation & docking) */}
        <div
          ref={crimsonAtmosphereRef}
          id="preloader-crimson-aura"
          className="absolute inset-0 pointer-events-none transition-opacity duration-1000 ease-out will-change-[opacity]"
          style={{
            background:
              'radial-gradient(ellipse 1100px 750px at 50% 50%, rgba(255, 77, 48, 0.28) 0%, rgba(95, 12, 22, 0.35) 45%, rgba(0, 0, 0, 0.95) 85%, #000000 100%)',
            opacity: 0,
          }}
        />

        {/* DOM hook for test compatibility (actual track is rendered synchronously in Three.js) */}
        <div
          id="preloader-central-track"
          data-testid="preloader-central-track"
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {/* =========================================================================
          LAYER 3: REFERENCE-ACCURATE BOTTOM-LEFT ROLLING 3-DIGIT COUNTER (z-[62])
          - Matched exactly to Lusion reference screenshot (media_1792233356541_aab1a447.png):
            - Neue Montreal Swiss grotesque typeface
            - Fixed flush bottom-left placement: left: 0, bottom: 0 (no margins or padding)
            - Proportional architectural scale: clamp(3.2rem, 6.8vw, 7.8rem) (~125px glyph at 1080p, ~70px at 1024w)
            - Tight tracking: -0.035em
            - 3 independent, baseline-aligned, overflow-clipped digit columns: [Hundreds, Tens, Units]
            - Completely static at bottom-left throughout transformation (no translation/movement)
            - Holds 100 visibly while sculpture settles on black, then quickly fades out (200ms)
              BEFORE the sculpture begins moving into the hero 'O'.
          ========================================================================= */}
      <div
        ref={counterRef}
        id="preloader-counter-container"
        data-testid="preloader-counter"
        className="fixed left-0 bottom-0 z-[62] flex items-baseline tracking-[-0.035em] font-['Neue_Montreal',sans-serif] font-normal text-white text-[clamp(3.2rem,6.8vw,7.8rem)] leading-none select-none pointer-events-none will-change-[opacity]"
        style={{
          opacity: counterOpacity !== undefined ? counterOpacity : 1,
        }}
      >
        <DigitColumn digit={d100} />
        <DigitColumn digit={d10} />
        <DigitColumn digit={d1} />
      </div>
    </div>
  );
}
