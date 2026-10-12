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

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  (window as any).ScrollTrigger = ScrollTrigger;
}

const CARD_RATIO = 16 / 10;

export function OstrumWorksWheelSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const worksWheelRef = useRef<WorksWheelHandle>(null);

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

    const notifyCapabilities = (detail: {
      active: boolean;
      progress?: number;
      opacity?: number;
      metrics?: typeof metrics;
    }) => {
      const fn = (window as any).__ostrumUpdateCapabilitiesTransition;
      if (typeof fn === 'function') {
        fn(detail);
      }
      window.dispatchEvent(
        new CustomEvent('ostrum:capabilities-transition', { detail })
      );
    };

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
              notifyCapabilities({ active: false });
            } else if (p <= p2) {
              // Phase 2: Smooth, continuous scroll-scrubbed oval-to-drum expansion
              const tMorph = (p - p1) / (p2 - p1);
              targetTurn = tMorph * 1.0;
              worksWheelRef.current?.setLeftPanelOpacity?.(1);
              notifyCapabilities({ active: false });
            } else if (p <= p3) {
              // Phase 3: Project-by-project browsing across the 4 entries (1000px per project)
              const tProj = (p - p2) / (p3 - p2);
              targetTurn = 1.0 + tProj * last;
              worksWheelRef.current?.setLeftPanelOpacity?.(1);

              if (tProj >= 0.70) {
                // Settle live Capabilities section into anchor as project 4 rotates into position, fully visible by tProj >= 0.95
                const settleFade = Math.min(1, Math.max(0, (tProj - 0.70) / 0.25));
                notifyCapabilities({
                  active: true,
                  progress: 0,
                  opacity: settleFade,
                  metrics,
                });
              } else {
                notifyCapabilities({ active: false });
              }
            } else {
              // Phase 4: Capabilities Shared-Element Expansion into Section 05
              targetTurn = 1.0 + last; // 4.0
              const tExp = Math.min(1, Math.max(0, (p - p3) / (1.0 - p3)));
              const textOp = Math.max(0, 1 - tExp * 4.5);
              worksWheelRef.current?.setLeftPanelOpacity?.(textOp);

              notifyCapabilities({
                active: true,
                progress: tExp,
                opacity: 1,
                metrics,
              });
            }

            worksWheelRef.current?.setTurn(targetTurn);
            setIsDrumActive(targetTurn >= 0.45);
          },
        });
      });

      cleanupCtx = () => {
        notifyCapabilities({ active: false });
        ctx.revert();
      };
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
      </div>
    </section>
  );
}

export default OstrumWorksWheelSection;
