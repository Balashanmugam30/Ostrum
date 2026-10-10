'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/context/LanguageContext';
import {
  OstrumCore3D,
  OstrumCore3DHandle,
  QualityTier,
} from '@/components/visuals/OstrumCore3D';
import { LivingThread } from '@/components/ui/LivingThread';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  (window as any).ScrollTrigger = ScrollTrigger;
}

export function OstrumEngineSection() {
  const { t } = useLanguage();
  const [activeFocus, setActiveFocus] = useState<'business' | 'next' | null>(
    null
  );
  const [qualityTier, setQualityTier] = useState<QualityTier>('high');

  // DOM element refs for GSAP ScrollTrigger timeline
  const sectionRef = useRef<HTMLElement>(null);
  const kickerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const compositionWrapperRef = useRef<HTMLDivElement>(null);
  const sculptureWrapperRef = useRef<HTMLDivElement>(null);
  const leftBlockRef = useRef<HTMLDivElement>(null);
  const rightBlockRef = useRef<HTMLDivElement>(null);
  const threadWrapperRef = useRef<HTMLDivElement>(null);

  // 3D imperative handle for high-performance zero-render updates
  const core3DRef = useRef<OstrumCore3DHandle>(null);

  const engine = t.engine;

  // Master GSAP ScrollTrigger Sequence
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // In reduced motion, skip all entrance transforms and ensure 100% visibility
    if (prefersReducedMotion) {
      if (kickerRef.current) kickerRef.current.style.opacity = '1';
      if (headlineRef.current) headlineRef.current.style.opacity = '1';
      if (descRef.current) descRef.current.style.opacity = '1';
      if (sculptureWrapperRef.current) {
        sculptureWrapperRef.current.style.transform = 'none';
      }
      if (leftBlockRef.current) leftBlockRef.current.style.opacity = '1';
      if (rightBlockRef.current) rightBlockRef.current.style.opacity = '1';
      core3DRef.current?.setTravelProgress(1);
      core3DRef.current?.setScrollProgress(0.5);
      return;
    }

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768;
      const holdDistance = isMobile ? 650 : 1000;

      // 1. Header Elements Entrance (Reveals as section enters viewport before pin)
      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          end: 'top 25%',
          scrub: 0.8,
        },
      });

      headerTl.fromTo(
        kickerRef.current,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.18, ease: 'power2.out' },
        0
      );

      headerTl.fromTo(
        headlineRef.current,
        { y: 36, opacity: 0, filter: 'blur(3px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.28,
          ease: 'power2.out',
        },
        0.06
      );

      headerTl.fromTo(
        descRef.current,
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.25, ease: 'power2.out' },
        0.12
      );

      // 2. Section 02 Master Pinned Hold and Choreography Timeline:
      // Locks the tripartite composition ("01 · FOR BUSINESS", 3D Sculpture, "02 · FOR WHAT'S NEXT")
      // firmly in the center. Side blocks reveal sequentially, lock at 100% opacity, provide an
      // intentional reading hold, and dissolve gracefully only before the sculpture departs.
      if (compositionWrapperRef.current) {
        const holdTl = gsap.timeline({
          scrollTrigger: {
            trigger: compositionWrapperRef.current,
            start: 'center center',
            end: `+=${holdDistance}`,
            pin: true,
            pinSpacing: true,
            id: 'section02-hold',
            scrub: 0.6,
            anticipatePin: 1,
          },
        });

        // Step A: Left "01 · FOR BUSINESS" block enters (0.00 -> 0.22)
        holdTl.fromTo(
          leftBlockRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.22, ease: 'power2.out' },
          0.0
        );

        // Step B: Right "02 · FOR WHAT'S NEXT" block enters (0.12 -> 0.34)
        holdTl.fromTo(
          rightBlockRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.22, ease: 'power2.out' },
          0.12
        );

        // Step C: Living Connection Threads activate (0.15 -> 0.35)
        if (threadWrapperRef.current) {
          holdTl.fromTo(
            threadWrapperRef.current,
            { opacity: 0.15 },
            { opacity: 1, duration: 0.20, ease: 'power2.out' },
            0.15
          );
        }

        // Step D: INTENTIONAL READING HOLD (0.34 -> 0.72)
        // Both blocks remain 100% visible at full opacity, locked and readable.
        // Sculpture is completely stationary at rest in center slot.
        holdTl.to(
          [leftBlockRef.current, rightBlockRef.current],
          { opacity: 1, y: 0, duration: 0.38 },
          0.34
        );

        // Step E: Exit Dissolve (0.72 -> 1.00)
        // Only after the reading hold has elapsed do the elements fade out
        // allowing the sculpture to appear isolated and transition to Section 03.
        holdTl.to(
          leftBlockRef.current,
          { opacity: 0, y: -20, duration: 0.24, ease: 'power2.in' },
          0.72
        );
        holdTl.to(
          rightBlockRef.current,
          { opacity: 0, y: -20, duration: 0.24, ease: 'power2.in' },
          0.74
        );
        if (threadWrapperRef.current) {
          holdTl.to(
            threadWrapperRef.current,
            { opacity: 0, duration: 0.22, ease: 'power2.in' },
            0.74
          );
        }
        holdTl.to(
          [headlineRef.current, descRef.current, kickerRef.current],
          { opacity: 0, y: -20, duration: 0.22, ease: 'power2.in' },
          0.76
        );
      }
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="engine"
      className="ostrum-engine-section relative w-full pt-20 sm:pt-28 md:pt-36 lg:pt-40 pb-28 md:pb-48 px-6 md:px-[6vw] lg:px-[8vw] flex flex-col items-center z-10 overflow-x-clip bg-transparent text-center select-none"
    >
      {/* Living Connection Threads across Section 02 background */}
      <div ref={threadWrapperRef} className="opacity-80 transition-opacity">
        <LivingThread />
      </div>

      <div className="w-full max-w-[1360px] flex flex-col items-center relative z-10 bg-transparent">
        {/* ==============================================================
            SECTION HEADER: METADATA & MONUMENTAL DUAL STATEMENT
            ============================================================== */}
        {/* Small Chapter Label */}
        <div
          ref={kickerRef}
          className="flex items-center gap-3 text-[11px] sm:text-[12px] uppercase tracking-[0.28em] font-sans text-white/70 mb-6 md:mb-8 select-none"
        >
          <span className="text-[#ff5c4a] font-mono font-medium">
            {engine.index}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
          <span>{engine.badge}</span>
        </div>

        {/* Monumental Editorial Headline in Romie Serif */}
        <div
          ref={headlineRef}
          className="w-full max-w-[980px] flex flex-col items-center"
        >
          <h2 className="font-serif text-white font-normal tracking-[-1.8px] sm:tracking-[-2.4px] leading-[0.96] text-[clamp(42px,5.8vw,88px)]">
            <span className="block drop-shadow-sm">
              {engine.headlineLine1}
            </span>
            <span className="block italic text-[#ffa699] font-normal mt-1 drop-shadow-sm">
              {engine.headlineLine2}
            </span>
          </h2>
        </div>

        {/* Minimal Supporting Philosophy Copy */}
        <div
          ref={descRef}
          className="mt-6 md:mt-8 max-w-[640px] mx-auto px-4"
        >
          <p className="text-base sm:text-[17px] md:text-[18px] text-white/90 font-normal leading-[1.5] tracking-[-0.015em] drop-shadow-sm">
            {engine.description}
          </p>
        </div>

        {/* ==============================================================
            THE 3D OSTRUM CORE & EDITORIAL SPATIAL COMPOSITION
            Sculpture travels from high into central focal space
            Flanked by 01 / FOR BUSINESS and 02 / FOR WHAT'S NEXT
            ============================================================== */}
        <div
          ref={compositionWrapperRef}
          className="w-full mt-12 md:mt-16 lg:mt-20 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-6 relative bg-transparent"
        >
          {/* ============================================================
              LEFT IDENTITY ANCHOR: 01 / FOR BUSINESS
              ============================================================ */}
          <div
            ref={leftBlockRef}
            onMouseEnter={() => {
              setActiveFocus('business');
              window.dispatchEvent(
                new CustomEvent('ostrum:focus-bias', { detail: -0.22 })
              );
            }}
            onMouseLeave={() => {
              setActiveFocus(null);
              window.dispatchEvent(
                new CustomEvent('ostrum:focus-bias', { detail: 0 })
              );
            }}
            className={`w-full lg:w-[28%] max-w-[360px] flex flex-col text-left transition-all duration-300 cursor-default select-none ${
              activeFocus === 'business' ? 'translate-x-1.5' : ''
            }`}
          >
            {/* 1. Section Label */}
            <div className="flex items-center gap-2.5 mb-3">
              <span className="font-mono text-xs tracking-[0.22em] text-[#ff5c4a] font-semibold">
                {engine.forBusiness.number}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/40" />
              <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-white/80 font-medium">
                {engine.forBusiness.tag}
              </span>
            </div>

            {/* 2. Main Heading */}
            <h3 className="font-serif italic text-2xl sm:text-[27px] text-white font-normal leading-[1.18] tracking-[-0.02em] drop-shadow-sm">
              "{engine.forBusiness.statement}"
            </h3>

            {/* 3. Supporting Text */}
            <p className="mt-3.5 text-xs sm:text-[14px] text-white/80 leading-[1.48] font-normal">
              {engine.forBusiness.detail}
            </p>

            {/* 4. Micro-label with Hairline Expansion */}
            <div className="mt-5 flex items-center gap-3">
              <div
                className={`h-[1px] transition-all duration-500 ${
                  activeFocus === 'business'
                    ? 'w-16 bg-[#ff5c4a]'
                    : 'w-8 bg-white/35'
                }`}
              />
              <span className="text-[10px] font-mono tracking-[0.18em] uppercase text-white/60">
                SYSTEMS ARCHITECTURE
              </span>
            </div>
          </div>

          {/* ============================================================
              CENTER: THE SIGNATURE 3D OSTRUM CORE CENTERPIECE
              Sculpture travels down from high into central space
              Zero black overlay, 100% transparent canvas, pure floating presence
              ============================================================ */}
          <div
            ref={sculptureWrapperRef}
            className="w-full lg:w-[44%] flex items-center justify-center relative bg-transparent will-change-transform"
          >
            <div
              id="section02-sculpture-slot"
              data-testid="ostrum-core-3d-container"
              className="relative w-full aspect-square max-w-[340px] sm:max-w-[420px] md:max-w-[480px] lg:max-w-[520px] min-h-[340px] sm:min-h-[420px] md:min-h-[480px] lg:min-h-[520px] flex items-center justify-center pointer-events-auto bg-transparent"
            />
          </div>

          {/* ============================================================
              RIGHT IDENTITY ANCHOR: 02 / FOR WHAT'S NEXT
              ============================================================ */}
          <div
            ref={rightBlockRef}
            onMouseEnter={() => {
              setActiveFocus('next');
              window.dispatchEvent(
                new CustomEvent('ostrum:focus-bias', { detail: 0.22 })
              );
            }}
            onMouseLeave={() => {
              setActiveFocus(null);
              window.dispatchEvent(
                new CustomEvent('ostrum:focus-bias', { detail: 0 })
              );
            }}
            className={`w-full lg:w-[28%] max-w-[360px] flex flex-col text-left lg:text-right lg:items-end transition-all duration-300 cursor-default select-none ${
              activeFocus === 'next' ? '-translate-x-1.5' : ''
            }`}
          >
            {/* 1. Section Label */}
            <div className="flex items-center gap-2.5 mb-3">
              <span className="font-mono text-xs tracking-[0.22em] text-[#ff5c4a] font-semibold">
                {engine.forNext.number}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/40" />
              <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-white/80 font-medium">
                {engine.forNext.tag}
              </span>
            </div>

            {/* 2. Main Heading */}
            <h3 className="font-serif italic text-2xl sm:text-[27px] text-white font-normal leading-[1.18] tracking-[-0.02em] drop-shadow-sm">
              "{engine.forNext.statement}"
            </h3>

            {/* 3. Supporting Text */}
            <p className="mt-3.5 text-xs sm:text-[14px] text-white/80 leading-[1.48] font-normal">
              {engine.forNext.detail}
            </p>

            {/* 4. Micro-label with Hairline Reveal */}
            <div className="mt-5 flex items-center gap-3 lg:flex-row-reverse">
              <div
                className={`h-[1px] transition-all duration-500 ${
                  activeFocus === 'next'
                    ? 'w-16 bg-[#ff5c4a]'
                    : 'w-8 bg-white/35'
                }`}
              />
              <span className="text-[10px] font-mono tracking-[0.18em] uppercase text-white/60">
                ORIGINAL VENTURES
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
