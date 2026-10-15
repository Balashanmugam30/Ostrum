'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { usePreloader } from '@/context/PreloaderContext';

export function OstrumPreloader() {
  const { phase, isComplete } = usePreloader();
  const overlayRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (phase === 'handoff' && overlayRef.current && !hasAnimatedRef.current) {
      hasAnimatedRef.current = true;
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 1.15,
        ease: 'power3.inOut',
      });
    }
  }, [phase]);

  if (isComplete) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      id="ostrum-preloader"
      data-testid="ostrum-preloader-overlay"
      className={`fixed inset-0 z-[45] bg-[#050505] flex flex-col justify-between items-center select-none overflow-hidden will-change-[opacity] ${
        phase === 'loading' ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      style={{
        background:
          'radial-gradient(circle at 50% 48%, rgba(255, 77, 48, 0.075) 0%, rgba(5, 5, 5, 0) 62%), #050505',
      }}
      aria-label="Ostrum Studio Preloader"
    >
      {/* Top Studio Metadata */}
      <div className="w-full flex items-center justify-between px-6 sm:px-10 md:px-14 pt-8 sm:pt-10 z-10">
        <div className="flex items-center gap-2.5">
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#FF4D30] shadow-[0_0_8px_rgba(255,77,48,0.7)] animate-pulse"
            aria-hidden="true"
          />
          <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.26em] text-white/55 font-medium">
            OSTRUM STUDIO
          </span>
        </div>
        <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.26em] text-white/35 hidden sm:inline-block">
          DIGITAL TRANSFORMATION
        </span>
      </div>

      {/* Optical Center Spacing (Reserved for the Live 3D Sculpture) */}
      <div className="relative flex-1 w-full flex items-center justify-center pointer-events-none" />

      {/* Bottom Editorial Heritage & Craft Metadata */}
      <div className="w-full flex items-center justify-between px-6 sm:px-10 md:px-14 pb-8 sm:pb-10 z-10">
        <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.24em] text-white/35">
          SYSTEMS · ARCHITECTURE
        </span>
        <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.24em] text-white/35">
          EST. 2026
        </span>
      </div>
    </div>
  );
}
