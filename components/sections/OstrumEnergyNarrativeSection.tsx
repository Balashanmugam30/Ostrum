'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/context/LanguageContext';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function OstrumEnergyNarrativeSection() {
  const { t } = useLanguage();
  const narrative = t.energyNarrative;

  const sectionRef = useRef<HTMLElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const beatsContainerRef = useRef<HTMLDivElement>(null);

  const [activeBeat, setActiveBeat] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const pinContainer = pinContainerRef.current;
    if (!section || !pinContainer) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      // In reduced motion, skip pinned sequence and show all beats naturally
      window.dispatchEvent(new CustomEvent('ostrum:bg-darken', { detail: 0.4 }));
      window.dispatchEvent(
        new CustomEvent('ostrum:energy-progress', { detail: { progress: 0.5, beat: 1 } })
      );
      return;
    }

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768;
      const scrollDistance = isMobile ? 1400 : 2200;

      // Master Pinned Trigger for the Energy Narrative
      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: `+=${scrollDistance}`,
        pin: pinContainer,
        pinSpacing: true,
        scrub: 0.8,
        id: 'energy-narrative-pin',
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress; // 0.0 to 1.0

          // 1. Calculate active beat index (0, 1, or 2)
          let currentBeat = 0;
          if (p >= 0.64) {
            currentBeat = 2;
          } else if (p >= 0.32) {
            currentBeat = 1;
          }
          setActiveBeat(currentBeat);

          // 2. Background Darkening Profile:
          // Smoothly deepens to 1.0 as section enters, holds through beats, returns to 0 on exit
          let darkenVal = 0;
          if (p < 0.15) {
            darkenVal = p / 0.15;
          } else if (p > 0.85) {
            darkenVal = 1 - (p - 0.85) / 0.15;
          } else {
            darkenVal = 1;
          }
          window.dispatchEvent(
            new CustomEvent('ostrum:bg-darken', { detail: darkenVal })
          );

          // 3. Dispatch continuous energy progress to the 3D continuous journey
          window.dispatchEvent(
            new CustomEvent('ostrum:energy-progress', {
              detail: { progress: p, beat: currentBeat },
            })
          );
        },
      });

      // Individual Beat Text Transitions scrubbed with ScrollTrigger
      const beatEls = gsap.utils.toArray<HTMLElement>('.narrative-beat-card');

      // Beat 0: 0.00 to 0.30
      // Beat 1: 0.34 to 0.63
      // Beat 2: 0.67 to 1.00
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${scrollDistance}`,
          scrub: 0.8,
        },
      });

      if (beatEls.length === 3) {
        // Initial state
        gsap.set(beatEls[0], { opacity: 1, y: 0, filter: 'blur(0px)' });
        gsap.set([beatEls[1], beatEls[2]], { opacity: 0, y: 28, filter: 'blur(4px)' });

        // Beat 0 -> Beat 1 transition
        tl.to(
          beatEls[0],
          { opacity: 0, y: -24, filter: 'blur(3px)', duration: 0.12, ease: 'power2.in' },
          0.26
        );
        tl.fromTo(
          beatEls[1],
          { opacity: 0, y: 28, filter: 'blur(4px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.14, ease: 'power2.out' },
          0.33
        );

        // Beat 1 -> Beat 2 transition
        tl.to(
          beatEls[1],
          { opacity: 0, y: -24, filter: 'blur(3px)', duration: 0.12, ease: 'power2.in' },
          0.60
        );
        tl.fromTo(
          beatEls[2],
          { opacity: 0, y: 28, filter: 'blur(4px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.14, ease: 'power2.out' },
          0.67
        );
      }
    }, section);

    return () => {
      ctx.revert();
      window.dispatchEvent(new CustomEvent('ostrum:bg-darken', { detail: 0 }));
      window.dispatchEvent(
        new CustomEvent('ostrum:energy-progress', { detail: { progress: 0, beat: 0 } })
      );
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="energy-narrative"
      className="relative w-full overflow-visible z-[15] select-none"
      aria-label="Ostrum Energy Narrative"
    >
      {/* Pinned Viewport Stage Container */}
      <div
        ref={pinContainerRef}
        className="w-full h-screen min-h-[640px] flex flex-col justify-between items-center relative px-6 md:px-12 pt-24 md:pt-16 pb-10 md:pb-14 overflow-hidden pointer-events-auto"
      >
        {/* Top Section Header / Badge */}
        <div className="w-full max-w-[1280px] flex items-center justify-between z-20 pointer-events-none">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#ff4d3a] shadow-[0_0_10px_#ff4d3a] animate-pulse" />
            <span className="font-mono text-[11px] md:text-xs uppercase tracking-[0.22em] text-white/70">
              {narrative.badge}
            </span>
          </div>

          {/* Stepper Dots Indicator */}
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className={`transition-all duration-300 rounded-full ${
                  activeBeat === idx
                    ? 'w-7 h-1.5 bg-[#ff4d3a] shadow-[0_0_8px_rgba(255,77,58,0.8)]'
                    : 'w-1.5 h-1.5 bg-white/25'
                }`}
                aria-label={`Beat 0${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Center Slot for Continuous 3D Sculpture Alignment */}
        <div
          id="section03-sculpture-slot"
          data-testid="ostrum-energy-3d-slot"
          className="absolute inset-0 m-auto w-full aspect-square max-w-[340px] sm:max-w-[440px] md:max-w-[540px] lg:max-w-[620px] pointer-events-none z-10 flex items-center justify-center"
        />

        {/* Narrative Statements Container (Positioned gracefully to balance the central 3D sculpture) */}
        <div
          ref={beatsContainerRef}
          className="w-full max-w-[1280px] relative z-20 flex-1 flex items-end pb-4 md:pb-8 pointer-events-none"
        >
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            {/* The 3 Sequential Narrative Beats */}
            <div className="relative md:col-span-8 lg:col-span-7 min-h-[160px] sm:min-h-[170px] md:min-h-[190px]">
              {narrative.beats.map((beat, idx) => (
                <div
                  key={beat.id}
                  className="narrative-beat-card absolute inset-0 flex flex-col justify-end text-left pointer-events-auto"
                  style={{
                    opacity: idx === 0 ? 1 : 0,
                  }}
                >
                  {/* Kicker tag */}
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <span className="font-mono text-xs sm:text-sm text-[#ff5c4a] font-semibold tracking-wider">
                      {beat.number}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                    <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-white/60">
                      {beat.tag}
                    </span>
                  </div>

                  {/* Monumental Primary Statement in Romie Serif */}
                  <h3 className="font-serif text-white font-normal tracking-[-0.03em] leading-[1.04] text-[clamp(32px,4.5vw,62px)] drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                    {beat.primary}
                  </h3>

                  {/* Supporting Copy in Neue Montreal */}
                  <p className="mt-2.5 sm:mt-3 text-sm sm:text-base md:text-[17px] text-white/85 font-normal leading-[1.45] tracking-[-0.015em] max-w-[560px] drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">
                    {beat.supporting}
                  </p>
                </div>
              ))}
            </div>

            {/* Right Side Atmospheric Editorial Label */}
            <div className="hidden md:flex md:col-span-4 lg:col-span-5 flex-col items-end text-right pb-2 pointer-events-none">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
                CONTINUOUS SCULPTURE &middot; ENERGY SYSTEM
              </span>
              <span className="font-mono text-[9px] tracking-[0.18em] text-[#ff6655]/60 mt-1">
                THREE.JS &middot; MÖBIUS 360 &middot; REAL-TIME LIGHT
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
