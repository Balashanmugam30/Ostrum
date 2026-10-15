'use client';

import React, { useEffect, useRef } from 'react';
import { usePreloader } from '@/context/PreloaderContext';
import { gsap } from 'gsap';

export function OstrumPreloader() {
  const { phase, isComplete, energyProgress, handoffProgress } = usePreloader();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Smooth fade-out of the preloader overlay during Stage C
  useEffect(() => {
    if (phase === 'stageC' && overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.75,
        ease: 'power3.inOut',
      });
    }
  }, [phase]);

  if (isComplete) {
    return null;
  }

  // Energy expansion scale calculation for Stage B (0 to 1)
  // Expands from a focused energy seed into a massive viewport-filling wavefront
  // Energy expansion scale calculation for Stage B (0 to 1)
  // Expands from a focused energy seed into a massive viewport-filling wavefront
  const waveScale = 0.15 + Math.pow(energyProgress, 1.6) * 12.0;
  const energyOpacity = phase === 'stageA' ? 0 : Math.min(1, energyProgress * 1.5);
  const pearlOpacity = phase === 'stageA' ? 1 : Math.max(0, 1 - energyProgress * 1.8);

  return (
    <div
      ref={overlayRef}
      id="ostrum-preloader"
      data-testid="ostrum-preloader-overlay"
      data-phase={phase}
      className="fixed inset-0 z-[60] pointer-events-none select-none overflow-hidden will-change-[opacity]"
      style={{ opacity: 1 }}
      aria-hidden="true"
    >
      {/* =========================================================================
          STAGE A: PEARL-WHITE / IVORY 2D INTRODUCTION
          Minimalist, architectural, featuring a bespoke 2D circular vector motif
          ========================================================================= */}
      <div
        data-testid="preloader-pearl-field"
        className="absolute inset-0 z-10 flex flex-col items-center justify-center transition-opacity duration-300 ease-out"
        style={{
          backgroundColor: '#FAF8F5',
          backgroundImage:
            'radial-gradient(circle 800px at 50% 50%, #FFFFFF 0%, #FAF8F5 45%, #F0EAE1 85%, #E5DDD1 100%)',
          opacity: pearlOpacity,
          display: phase === 'stageC' && pearlOpacity === 0 ? 'none' : 'flex',
        }}
      >
        {/* Central 2D Circular Vector Artwork */}
        <div className="relative flex flex-col items-center justify-center">
          <svg
            className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 text-[#1A1A1A] will-change-transform"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Outer Ring Crimson Accent Gradient */}
              <linearGradient id="ostrum-pearl-ring-grad" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1A1A1A" stopOpacity="0.9" />
                <stop offset="45%" stopColor="#2A0B10" stopOpacity="0.85" />
                <stop offset="70%" stopColor="#761321" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#E62E1B" stopOpacity="0.9" />
              </linearGradient>

              {/* Inner Loop Shadow/Highlight */}
              <linearGradient id="ostrum-inner-loop" x1="160" y1="40" x2="40" y2="160" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#E62E1B" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#761321" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#1A1A1A" stopOpacity="0.95" />
              </linearGradient>

              {/* Subtle Core Glow */}
              <radialGradient id="ostrum-core-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF4D30" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#FF4D30" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Ambient Core Glow */}
            <circle cx="100" cy="100" r="42" fill="url(#ostrum-core-glow)" />

            {/* Primary Vector Loop 1: Outer Flowing Sweep */}
            <path
              d="M 100 24 C 142 24 176 58 176 100 C 176 142 142 176 100 176 C 68 176 42 154 30 126 C 24 112 28 92 42 82 C 56 72 74 78 84 92 C 94 106 112 118 130 114 C 146 110 156 94 154 78 C 151 58 132 44 112 44"
              stroke="url(#ostrum-pearl-ring-grad)"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Primary Vector Loop 2: Interlocking Inner Orbital Arc */}
            <path
              d="M 100 176 C 58 176 24 142 24 100 C 24 58 58 24 100 24 C 132 24 158 46 170 74 C 176 88 172 108 158 118 C 144 128 126 122 116 108 C 106 94 88 82 70 86 C 54 90 44 106 46 122 C 49 142 68 156 88 156"
              stroke="url(#ostrum-inner-loop)"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Fine Center Energy Core */}
            <circle cx="100" cy="100" r="4.5" fill="#E62E1B" />
          </svg>

          {/* Minimalist Wordmark */}
          <div className="mt-8 text-center">
            <span className="font-serif text-xs sm:text-sm tracking-[0.45em] uppercase text-[#1A1A1A]/90 font-light select-none">
              OSTRUM
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          STAGE B: CRIMSON 2D ENERGY WIPE
          Dramatic, expanding energy field sweeping across the screen
          ========================================================================= */}
      <div
        data-testid="preloader-crimson-field"
        className="absolute inset-0 z-20 pointer-events-none overflow-hidden will-change-[opacity]"
        style={{
          opacity: phase === 'stageA' ? 0 : energyOpacity,
          display: phase === 'stageA' ? 'none' : 'block',
        }}
      >
        {/* 1. Deep Crimson & Oxblood Foundation */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 95% 85% at 50% 50%, #761321 0%, #4A0B14 40%, #1A0407 75%, #050505 100%)',
            opacity: Math.min(1, energyProgress * 1.3),
          }}
        />

        {/* 2. Expanding 2D Crimson Wavefront Surge */}
        <div
          className="absolute inset-0 flex items-center justify-center will-change-transform"
          style={{
            transform: `scale(${waveScale})`,
            transformOrigin: '50% 50%',
          }}
        >
          <div
            className="w-[100vw] h-[100vw] max-w-[1600px] max-h-[1600px] rounded-full"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(255, 77, 48, 0.98) 0%, rgba(230, 46, 27, 0.90) 22%, rgba(138, 18, 34, 0.75) 48%, rgba(45, 6, 14, 0.45) 72%, transparent 88%)',
              filter: 'blur(45px)',
            }}
          />
        </div>

        {/* 3. Fast High-Energy Directional Angled Light Sweep */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(
              122deg,
              transparent calc(${energyProgress * 130}% - 25%),
              rgba(255, 77, 48, 0.70) calc(${energyProgress * 130}% - 12%),
              rgba(255, 235, 225, 0.95) calc(${energyProgress * 130}%),
              rgba(255, 77, 48, 0.70) calc(${energyProgress * 130}% + 12%),
              transparent calc(${energyProgress * 130}% + 25%)
            )`,
            opacity: Math.sin(energyProgress * Math.PI) * 0.95,
          }}
        />

        {/* 4. Center 2D Energy Core Bloom */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            transform: `scale(${1 + energyProgress * 3.5})`,
            opacity: phase === 'stageA' ? 0 : Math.max(0, 1 - energyProgress * 1.2),
          }}
        >
          <div className="w-40 h-40 rounded-full bg-[#FF4D30] blur-[24px]" />
        </div>
      </div>
    </div>
  );
}
