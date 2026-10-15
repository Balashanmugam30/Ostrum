'use client';

import React, { useEffect, useRef } from 'react';
import { usePreloader } from '@/context/PreloaderContext';
import { gsap } from 'gsap';

export function OstrumPreloader() {
  const { phase, isComplete, energyProgress, handoffProgress } = usePreloader();
  const overlayRef = useRef<HTMLDivElement>(null);
  const crimsonLayerRef = useRef<HTMLDivElement>(null);
  const pearlLayerRef = useRef<HTMLDivElement>(null);
  const brandMarkRef = useRef<HTMLDivElement>(null);

  // Animate Stage C fade-out
  useEffect(() => {
    if (phase === 'stageC' && overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 1.25,
        ease: 'power3.inOut',
      });
    }
  }, [phase]);

  if (isComplete) {
    return null;
  }

  // Energy expansion scale calculation for Stage B (0 to 1)
  // At energyProgress = 0: scale is 0.25, opacity is 0
  // At energyProgress = 1: scale is 2.8, opacity is 1
  const energyScale = 0.2 + energyProgress * 2.6;
  const energyOpacity = Math.min(1, energyProgress * 1.4);

  return (
    <div
      ref={overlayRef}
      id="ostrum-preloader"
      data-testid="ostrum-preloader-overlay"
      className="fixed inset-0 z-[25] pointer-events-none select-none overflow-hidden will-change-[opacity]"
      style={{
        opacity: 1,
      }}
      aria-hidden="true"
    >
      {/* =========================================================================
          STAGE A: PEARL EMERGENCE LAYER
          Pristine, architectural pearl-white / pale ivory field
          ========================================================================= */}
      <div
        ref={pearlLayerRef}
        data-testid="preloader-pearl-field"
        className="absolute inset-0 transition-opacity duration-700 ease-out"
        style={{
          backgroundColor: '#FAF9F6',
          backgroundImage:
            'radial-gradient(ellipse 85% 85% at 50% 48%, #FFFFFF 0%, #FAF8F5 45%, #F0EDE6 85%, #E5E1D8 100%)',
          opacity: phase === 'stageA' ? 1 : Math.max(0, 1 - energyProgress * 1.5),
        }}
      >
        {/* Subtle architectural grid / ambient pearl warmth */}
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              'radial-gradient(circle 480px at 50% 45%, rgba(255, 255, 255, 0.9) 0%, transparent 70%)',
          }}
        />

        {/* Minimalist Studio Brand Mark */}
        <div
          ref={brandMarkRef}
          className="absolute top-8 left-8 right-8 flex justify-between items-center transition-all duration-700 ease-out text-[#1A1A1A]"
          style={{
            opacity: phase === 'stageA' ? 0.95 : phase === 'stageB' ? 0.4 : 0,
            transform: phase === 'stageA' ? 'translateY(0)' : 'translateY(-8px)',
          }}
        >
          <span className="font-mono text-[11px] sm:text-xs tracking-[0.32em] uppercase font-semibold text-[#1A1A1A]/85">
            OSTRUM
          </span>
          <span className="font-mono text-[10px] tracking-[0.26em] uppercase text-[#1A1A1A]/50 hidden sm:inline-block">
            STUDIO · FOUNDRY · 2026
          </span>
        </div>

        {/* Minimalist Bottom Horizon Cue */}
        <div
          className="absolute bottom-8 left-8 right-8 flex justify-between items-center transition-opacity duration-500 text-[#1A1A1A]/50 font-mono text-[10px] tracking-[0.24em] uppercase"
          style={{
            opacity: phase === 'stageA' ? 0.7 : 0,
          }}
        >
          <span>DIGITAL ARCHITECTURE</span>
          <span>PARIS · LONDON</span>
        </div>
      </div>

      {/* =========================================================================
          STAGE B: CRIMSON ENERGY TRANSITION LAYER
          Dramatic sweeping red energy field expanding across the entire viewport
          ========================================================================= */}
      <div
        ref={crimsonLayerRef}
        data-testid="preloader-crimson-field"
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 ease-out overflow-hidden"
        style={{
          opacity: energyOpacity,
        }}
      >
        {/* 1. Base Crimson & Deep Oxblood Foundation */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 90% 80% at 50% 48%, #761321 0%, #4A0B14 38%, #200408 72%, #050505 100%)',
            opacity: Math.min(1, energyProgress * 1.2),
          }}
        />

        {/* 2. Expanding Crimson Kinetic Wavefront (Centered around 3D sculpture) */}
        <div
          className="absolute inset-0 flex items-center justify-center will-change-transform"
          style={{
            transform: `scale(${energyScale})`,
            transformOrigin: '50% 48%',
          }}
        >
          <div
            className="w-[120vw] h-[120vw] max-w-[2000px] max-h-[2000px] rounded-full blur-[60px]"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(255, 77, 48, 0.95) 0%, rgba(230, 46, 27, 0.85) 24%, rgba(140, 20, 36, 0.65) 48%, rgba(50, 8, 16, 0.35) 70%, transparent 85%)',
            }}
          />
        </div>

        {/* 3. Directional High-Energy Crimson Light Sweep (-24 degrees) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(
              114deg,
              transparent calc(${energyProgress * 120}% - 25%),
              rgba(255, 77, 48, 0.65) calc(${energyProgress * 120}% - 12%),
              rgba(255, 230, 220, 0.90) calc(${energyProgress * 120}%),
              rgba(255, 77, 48, 0.65) calc(${energyProgress * 120}% + 12%),
              transparent calc(${energyProgress * 120}% + 25%)
            )`,
            opacity: Math.sin(energyProgress * Math.PI) * 0.95,
          }}
        />

        {/* 4. Deep Atmospheric Obsidian Vignette Transitioning into Stage C */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 75% 65% at 50% 48%, transparent 40%, rgba(5, 5, 5, 0.75) 75%, #050505 100%)',
            opacity: phase === 'stageB' ? 0.75 : 1,
          }}
        />
      </div>
    </div>
  );
}
