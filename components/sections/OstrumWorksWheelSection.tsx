'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  WorksWheel,
  OSTRUM_WORKS,
  WorksWheelHandle,
  LIGHT_OVAL_THEME,
  PROJECT_THEMES,
} from '@/components/ui/works-wheel';
import { AnodizedInk } from '@/components/ui/anodized-ink';
import { CapabilitiesPreviewThumbnail } from '@/components/ui/CapabilitiesPreviewThumbnail';
import { CAPABILITIES_DATA } from '@/components/sections/OstrumCapabilitiesSection';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  (window as any).ScrollTrigger = ScrollTrigger;
}

const CARD_RATIO = 16 / 10;

export function OstrumWorksWheelSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const worksWheelRef = useRef<WorksWheelHandle>(null);
  const expansionLayerRef = useRef<HTMLDivElement>(null);
  const miniPreviewRef = useRef<HTMLDivElement>(null);
  const fullPreviewRef = useRef<HTMLDivElement>(null);

  const [activeProject, setActiveProject] = useState(0);
  const [isDrumActive, setIsDrumActive] = useState(false);

  const [metrics, setMetrics] = useState({
    w: 1440,
    h: 900,
    cardW: 560,
    cardH: 350,
    initLeft: 700,
    initTop: 275,
  });

  // Derive authoritative theme: light white/lavender in oval state, rich project theme in drum mode
  const currentTheme = isDrumActive
    ? (PROJECT_THEMES[activeProject] ?? LIGHT_OVAL_THEME)
    : LIGHT_OVAL_THEME;

  const handleTurnChange = useCallback((turn: number) => {
    setIsDrumActive(turn >= 0.45);
  }, []);

  // Calculate card layout metrics for shared-element expansion
  useEffect(() => {
    const calcMetrics = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isDesktop = w >= 1024;
      const isTablet = w >= 768 && w < 1024;
      const isMobile = w < 768;

      const cardW = isDesktop
        ? Math.min(w * 0.44, h * 0.54 * CARD_RATIO)
        : isTablet
        ? Math.min(w * 0.52, h * 0.46 * CARD_RATIO)
        : Math.min(w * 0.84, 340);

      const cardH = cardW / CARD_RATIO;
      const drumShiftX = isDesktop ? w * 0.22 : isTablet ? w * 0.20 : 0;
      const drumShiftY = isMobile ? -h * 0.12 : 0;

      const cx = w * 0.5 + drumShiftX;
      const cy = h * 0.5 + drumShiftY;

      setMetrics({
        w,
        h,
        cardW,
        cardH,
        initLeft: cx - cardW * 0.5,
        initTop: cy - cardH * 0.5,
      });
    };

    calcMetrics();
    window.addEventListener('resize', calcMetrics);
    return () => window.removeEventListener('resize', calcMetrics);
  }, []);

  // Smooth programmatic project selection (via card click or keyboard)
  const handleSelectProject = useCallback((index: number) => {
    const st = ScrollTrigger.getById('works-wheel-pin');
    if (!st) {
      worksWheelRef.current?.to(index + 1);
      return;
    }
    const isMobile = window.innerWidth < 768;
    const holdDist = isMobile ? 250 : 350;
    const morphDist = isMobile ? 700 : 1000;
    const projectsDist = isMobile ? 2100 : 3000;
    const expandDist = isMobile ? 1000 : 1600;
    const totalPinDistance = holdDist + morphDist + projectsDist + expandDist;
    const count = OSTRUM_WORKS.length;
    const last = Math.max(count - 1, 0);

    const p2 = (holdDist + morphDist) / totalPinDistance;
    const p3 = (holdDist + morphDist + projectsDist) / totalPinDistance;

    const tProj = Math.min(1, Math.max(0, index / last));
    const targetProgress = p2 + tProj * (p3 - p2);
    const targetScroll = st.start + targetProgress * totalPinDistance;

    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  }, []);

  // Pointer drag gesture on stage translates directly to scroll movement
  const handleDragScroll = useCallback((deltaY: number) => {
    window.scrollBy({ top: deltaY * 1.6, behavior: 'auto' });
  }, []);

  // Master ScrollTrigger setup for Full-Viewport Pinning and Synchronised Expansion
  useEffect(() => {
    const section = sectionRef.current;
    const pinContainer = pinContainerRef.current;
    if (!section || !pinContainer) return;

    let cleanupCtx: (() => void) | null = null;

    const setupTrigger = () => {
      if (cleanupCtx) {
        cleanupCtx();
        cleanupCtx = null;
      }

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      const isMobile = window.innerWidth < 768;
      const holdDist = isMobile ? 250 : 350;
      const morphDist = isMobile ? 700 : 1000;
      const projectsDist = isMobile ? 2100 : 3000;
      const expandDist = isMobile ? 1000 : 1600;
      const totalPinDistance = holdDist + morphDist + projectsDist + expandDist;

      const count = OSTRUM_WORKS.length;
      const last = Math.max(count - 1, 0);

      const p1 = holdDist / totalPinDistance;
      const p2 = (holdDist + morphDist) / totalPinDistance;
      const p3 = (holdDist + morphDist + projectsDist) / totalPinDistance;

      if (prefersReducedMotion) {
        worksWheelRef.current?.setTurn(1);
        setIsDrumActive(true);
        return;
      }

      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: `+=${totalPinDistance}`,
          pin: pinContainer,
          pinSpacing: true,
          anticipatePin: 1,
          id: 'works-wheel-pin',
          onUpdate: (self) => {
            const p = self.progress;
            let targetTurn = 0;

            if (p <= p1) {
              // Phase 1: Oval at rest with minimal center label
              targetTurn = 0;
              worksWheelRef.current?.setLeftPanelOpacity?.(1);
              if (expansionLayerRef.current) {
                expansionLayerRef.current.style.opacity = '0';
              }
            } else if (p <= p2) {
              // Phase 2: Smooth, continuous scroll-scrubbed oval-to-drum expansion
              const tMorph = (p - p1) / (p2 - p1);
              targetTurn = tMorph * 1.0;
              worksWheelRef.current?.setLeftPanelOpacity?.(1);
              if (expansionLayerRef.current) {
                expansionLayerRef.current.style.opacity = '0';
              }
            } else if (p <= p3) {
              // Phase 3: Project-by-project browsing across the 4 entries (1000px per project)
              const tProj = (p - p2) / (p3 - p2);
              targetTurn = 1.0 + tProj * last;
              worksWheelRef.current?.setLeftPanelOpacity?.(1);
              if (expansionLayerRef.current) {
                expansionLayerRef.current.style.opacity = '0';
              }
            } else {
              // Phase 4: Capabilities Shared-Element Expansion into Section 05
              targetTurn = 1.0 + last; // 4.0
              const tExp = (p - p3) / (1.0 - p3);
              const textOp = Math.max(0, 1 - tExp * 5);
              worksWheelRef.current?.setLeftPanelOpacity?.(textOp);

              if (expansionLayerRef.current) {
                expansionLayerRef.current.style.opacity = '1';

                // Smooth expansion from thumbnail to full viewport (0.05 -> 0.85)
                const tGrowth = Math.min(1, Math.max(0, (tExp - 0.05) / 0.80));
                const easeGrowth =
                  tGrowth < 0.5
                    ? 2 * tGrowth * tGrowth
                    : 1 - Math.pow(-2 * tGrowth + 2, 2) / 2;

                const curLeft = metrics.initLeft * (1 - easeGrowth);
                const curTop = metrics.initTop * (1 - easeGrowth);
                const curW = metrics.cardW + (metrics.w - metrics.cardW) * easeGrowth;
                const curH = metrics.cardH + (metrics.h - metrics.cardH) * easeGrowth;
                const curRadius = 16 * (1 - easeGrowth);

                expansionLayerRef.current.style.left = `${curLeft.toFixed(2)}px`;
                expansionLayerRef.current.style.top = `${curTop.toFixed(2)}px`;
                expansionLayerRef.current.style.width = `${curW.toFixed(2)}px`;
                expansionLayerRef.current.style.height = `${curH.toFixed(2)}px`;
                expansionLayerRef.current.style.borderRadius = `${curRadius.toFixed(2)}px`;

                // Cross-blend thumbnail -> full composition
                if (miniPreviewRef.current) {
                  miniPreviewRef.current.style.opacity = Math.max(0, 1 - tGrowth * 2.5).toFixed(3);
                }
                if (fullPreviewRef.current) {
                  fullPreviewRef.current.style.opacity = Math.min(
                    1,
                    Math.max(0, (tGrowth - 0.20) * 1.5)
                  ).toFixed(3);
                }
              }
            }

            worksWheelRef.current?.setTurn(targetTurn);
            setIsDrumActive(targetTurn >= 0.45);
          },
        });
      });

      cleanupCtx = () => ctx.revert();
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    };

    if (ScrollTrigger.getById('energy-narrative-pin')) {
      setupTrigger();
    }

    const onNarrativeReady = () => {
      setupTrigger();
    };

    window.addEventListener('ostrum:narrative-ready', onNarrativeReady);
    const pollId = setInterval(() => {
      if (ScrollTrigger.getById('energy-narrative-pin')) {
        setupTrigger();
        clearInterval(pollId);
      }
    }, 100);

    return () => {
      clearInterval(pollId);
      window.removeEventListener('ostrum:narrative-ready', onNarrativeReady);
      if (cleanupCtx) cleanupCtx();
    };
  }, [metrics]);

  return (
    <section
      id="selected-work"
      ref={sectionRef}
      data-testid="selected-work-section"
      className="relative z-[20] w-full transition-colors duration-300 ease-out"
      style={{
        marginTop: '-100vh',
        backgroundColor: currentTheme.deep,
        color: currentTheme.textColor,
      }}
      aria-label="Selected Works"
    >
      {/* Works Wheel Pinned Container - 100svh Full Screen Stage with Lusion Light / Project Theme Fluid Background */}
      <div
        ref={pinContainerRef}
        className="w-full h-screen h-[100svh] min-h-screen min-h-[100svh] relative overflow-hidden transition-colors duration-300 ease-out"
        style={{ backgroundColor: currentTheme.deep }}
      >
        {/* Dynamic Project Fluid & Pointer Reactive Background */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <AnodizedInk
            preset="lusion"
            colors={{
              deep: currentTheme.deep,
              ink: currentTheme.primary,
              secondary: currentTheme.secondary,
              sheen: currentTheme.sheen,
            }}
            speed={0.34}
            turbulence={0.68}
            scale={1.05}
            sheen={0.65}
            grain={0.14}
            glow={0.28}
            swirl={0.52}
            vignette={0.15}
            interactive={true}
            ripples={true}
            maxDpr={1.25}
            height="100%"
          />
        </div>

        {/* Works Wheel Stage (Controlled by ScrollTrigger) */}
        <div className="relative z-20 w-full h-full">
          <WorksWheel
            ref={worksWheelRef}
            items={OSTRUM_WORKS}
            label="Selected Work"
            controlled={true}
            theme={currentTheme}
            onActiveChange={setActiveProject}
            onTurnChange={handleTurnChange}
            onSelectProject={handleSelectProject}
            onDragScroll={handleDragScroll}
            className="w-full h-full"
          />
        </div>

        {/* Capabilities Shared-Element Expansion Layer */}
        <div
          ref={expansionLayerRef}
          data-testid="expanding-capabilities-preview"
          className="absolute z-30 overflow-hidden shadow-[0_20px_45px_-10px_rgba(11,11,16,0.18)] border border-black/[0.08] pointer-events-none opacity-0 select-none will-change-[width,height,left,top,border-radius]"
          style={{
            left: `${metrics.initLeft}px`,
            top: `${metrics.initTop}px`,
            width: `${metrics.cardW}px`,
            height: `${metrics.cardH}px`,
            borderRadius: '16px',
            backgroundColor: '#FFFFFF',
            background:
              'linear-gradient(180deg, rgba(191,235,247,0.48) 0%, rgba(255,255,255,0.94) 13%, #FFFFFF 26%)',
          }}
        >
          {/* Miniature preview that starts at 100% opacity and fades out as expansion grows */}
          <div
            ref={miniPreviewRef}
            className="absolute inset-0 w-full h-full transition-opacity duration-150"
          >
            <CapabilitiesPreviewThumbnail className="w-full h-full" />
          </div>

          {/* Full-size Capabilities composition that fades in as expansion reaches full viewport */}
          <div
            ref={fullPreviewRef}
            className="absolute inset-0 w-full h-full opacity-0 flex flex-col justify-between pt-16 pb-6 sm:py-10 md:py-12 px-6 sm:px-12 md:px-16 lg:px-20"
          >
            {/* Header */}
            <div className="max-w-[1440px] w-full mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-8">
              <div>
                <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#0B0B10]">
                  Our Capabilities
                </h2>
              </div>
              <p className="font-sans text-sm sm:text-base md:text-lg text-[#0B0B10]/70 max-w-[48ch] sm:max-w-[54ch] leading-relaxed">
                We design and engineer the systems that move businesses forward—from
                digital experiences and intelligent software to connected hardware
                built around real-world needs.
              </p>
            </div>

            {/* Cards Preview Row */}
            <div className="relative w-full my-auto py-2 flex items-center overflow-hidden">
              <div className="flex items-stretch gap-6 sm:gap-7 md:gap-8 pl-1">
                {CAPABILITIES_DATA.slice(0, 4).map((card) => (
                  <div
                    key={card.index}
                    className="shrink-0 w-[300px] sm:w-[340px] md:w-[360px] h-[450px] sm:h-[480px] md:h-[510px] rounded-[24px] p-6 sm:p-7 flex flex-col justify-between shadow-[0_20px_50px_-15px_rgba(11,11,16,0.08)] border border-black/[0.06]"
                    style={{ background: card.gradient }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono text-xs sm:text-sm font-bold tracking-wider text-black/55">
                        {card.index}
                      </span>
                      <div className="w-2 h-2 rounded-full bg-black/30" />
                    </div>

                    <div className="flex flex-col mt-auto">
                      <h3 className="font-sans text-lg sm:text-xl font-bold tracking-tight text-[#0B0B10] leading-tight mb-2">
                        {card.title}
                      </h3>
                      <p className="font-sans text-xs sm:text-sm text-black/75 leading-relaxed mb-4 line-clamp-3">
                        {card.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {card.tags.map((t) => (
                          <span
                            key={t}
                            className="inline-block px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium text-black/80 bg-white/60 border border-black/[0.06]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Line */}
            <div className="max-w-[1440px] w-full mx-auto flex items-center justify-between text-xs font-mono text-black/40">
              <span>01 / 06 — 06 / 06</span>
              <span className="tracking-widest uppercase">SCROLL TO EXPLORE →</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OstrumWorksWheelSection;
