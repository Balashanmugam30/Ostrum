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
import { OstrumSignatureSculpture } from '@/components/ui/OstrumSignatureSculpture';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  (window as any).ScrollTrigger = ScrollTrigger;
}

export function OstrumWorksWheelSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const worksWheelRef = useRef<WorksWheelHandle>(null);
  const overviewSculptureRef = useRef<HTMLDivElement>(null);

  const [activeProject, setActiveProject] = useState(0);
  const [isDrumActive, setIsDrumActive] = useState(false);
  const isDrumActiveRef = useRef(false);
  const capabilitiesTransitionActiveRef = useRef(false);

  // Derive authoritative theme: light white/lavender in oval state, rich project theme in drum mode
  const currentTheme = isDrumActive
    ? (PROJECT_THEMES[activeProject] ?? LIGHT_OVAL_THEME)
    : LIGHT_OVAL_THEME;

  const handleTurnChange = useCallback((turn: number) => {
    const nextIsDrumActive = turn >= 0.45;
    if (nextIsDrumActive === isDrumActiveRef.current) return;

    isDrumActiveRef.current = nextIsDrumActive;
    setIsDrumActive(nextIsDrumActive);
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
    const projectsDist = isMobile ? 2100 : 2950;
    const expandDist = isMobile ? 1000 : 1650;
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
    }) => {
      const active = Boolean(detail.active);
      if (!active && !capabilitiesTransitionActiveRef.current) {
        return;
      }

      capabilitiesTransitionActiveRef.current = active;
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
      const projectsDist = isMobile ? 2100 : 2950;
      const expandDist = isMobile ? 1000 : 1650;
      const totalPinDistance = holdDist + morphDist + projectsDist + expandDist;

      const count = OSTRUM_WORKS.length;
      const last = Math.max(count - 1, 0);
      const p1 = holdDist / totalPinDistance;
      const p2 = (holdDist + morphDist) / totalPinDistance;
      const p3 = (holdDist + morphDist + projectsDist) / totalPinDistance;

      const emitVisualCoverage = (covered: boolean) => {
        window.dispatchEvent(
          new CustomEvent('ostrum:visual-coverage', {
            detail: { id: 'works-wheel', covered },
          }),
        );
      };

      const setOverviewSculptureOpacity = (opacity: number) => {
        const sculpture = overviewSculptureRef.current;
        if (!sculpture) return;
        sculpture.style.opacity = opacity.toFixed(3);
        sculpture.style.visibility = opacity > 0.01 ? 'visible' : 'hidden';
        const art = sculpture.firstElementChild as SVGElement | null;
        if (art) art.style.animationPlayState = opacity > 0.99 ? 'running' : 'paused';
      };

      if (prefersReducedMotion) {
        worksWheelRef.current?.setTurn(1);
        setOverviewSculptureOpacity(0);
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
          onEnter: () => setOverviewSculptureOpacity(1),
          onToggle: (self) => {
            emitVisualCoverage(self.isActive);
            setOverviewSculptureOpacity(
              self.isActive && self.progress <= p1 ? 1 : 0,
            );
          },
          onUpdate: (self) => {
            const p = self.progress;
            let targetTurn = 0;
            let capabilitiesProgress: number | null = null;

            if (p < 1 && pinContainerRef.current && pinContainerRef.current.style.visibility === 'hidden') {
              pinContainerRef.current.style.opacity = '1';
              pinContainerRef.current.style.visibility = 'visible';
            }

            if (p <= p1) {
              // Phase 1: Oval at rest with minimal center label
              targetTurn = 0;
              setOverviewSculptureOpacity(1);
              worksWheelRef.current?.setLeftPanelOpacity?.(0);
              notifyCapabilities({ active: false });
            } else if (p <= p2) {
              // Phase 2: Smooth, continuous scroll-scrubbed oval-to-drum expansion
              const tMorph = (p - p1) / (p2 - p1);
              targetTurn = tMorph * 1.0;
              setOverviewSculptureOpacity(
                Math.max(0, 1 - Math.min(1, tMorph / 0.68)),
              );
              worksWheelRef.current?.setLeftPanelOpacity?.(0);
              notifyCapabilities({ active: false });
            } else if (p <= p3) {
              // Phase 3: Project-by-project browsing across the 4 entries (1000px per project)
              // Project 0 (TMR) -> Project 1 (Saraswati) -> Project 2 (MNESA) -> Project 3 (Our Capabilities)
              const tProj = (p - p2) / (p3 - p2);
              targetTurn = 1.0 + tProj * last;
              setOverviewSculptureOpacity(0);
              const capabilitiesActive = targetTurn >= 3.5;
              worksWheelRef.current?.setLeftPanelOpacity?.(
                capabilitiesActive ? 0 : 1,
              );
              worksWheelRef.current?.setWheelOpacity?.(1);
              if (capabilitiesActive) {
                capabilitiesProgress = 0;
              } else {
                notifyCapabilities({ active: false });
              }
              // The live Capabilities section follows item four's measured media bounds
              // through the same wheel rotation, via handleTurnChange above.
            } else {
              // Phase 4: Full-Bleed Capabilities Expansion into Section 05
              // Entry 4 is fully settled on the drum (turn = 4.0).
              targetTurn = 1.0 + last; // 4.0
              setOverviewSculptureOpacity(0);
              const tExp = Math.min(1, Math.max(0, (p - p3) / (1.0 - p3)));
              const fadeOut = Math.max(0, 1 - tExp * 20);
              worksWheelRef.current?.setLeftPanelOpacity?.(0);
              worksWheelRef.current?.setWheelOpacity?.(fadeOut);

              capabilitiesProgress = tExp;
            }

            worksWheelRef.current?.setTurn(targetTurn);
            if (capabilitiesProgress !== null) {
              notifyCapabilities({
                active: true,
                progress: capabilitiesProgress,
              });
            }
          },
          onLeave: () => {
            // Hide works wheel pinned container completely when handed off to Capabilities
            if (pinContainerRef.current) {
              pinContainerRef.current.style.opacity = '0';
              pinContainerRef.current.style.visibility = 'hidden';
            }
            worksWheelRef.current?.setWheelOpacity?.(0);
            worksWheelRef.current?.setLeftPanelOpacity?.(0);
            // Keep Capabilities active and full-screen during handoff into capabilities-pin
            notifyCapabilities({
              active: true,
              progress: 1.0,
            });
          },
          onEnterBack: () => {
            // Restore works wheel pinned container visibility when scrolling back up
            if (pinContainerRef.current) {
              pinContainerRef.current.style.opacity = '1';
              pinContainerRef.current.style.visibility = 'visible';
            }
          },
          onLeaveBack: () => {
            if (pinContainerRef.current) {
              pinContainerRef.current.style.opacity = '1';
              pinContainerRef.current.style.visibility = 'visible';
            }
            setOverviewSculptureOpacity(0);
            worksWheelRef.current?.setLeftPanelOpacity?.(0);
            worksWheelRef.current?.setWheelOpacity?.(1);
            notifyCapabilities({ active: false });
          },
        });
      });

      cleanupCtx = () => {
        notifyCapabilities({ active: false });
        emitVisualCoverage(false);
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
  }, []);

  return (
    <section
      id="selected-work"
      ref={sectionRef}
      data-testid="selected-work-section"
      className="relative z-[20] w-full transition-colors duration-300 ease-out"
      style={{
        marginTop: '-100vh',
        marginBottom: '-100vh',
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
            grain={0}
            glow={0.28}
            swirl={0.52}
            vignette={0.15}
            interactive={true}
            ripples={true}
            maxDpr={1.25}
            height="100%"
          />
        </div>

        {/* The still overview has a companion sculpture in its open left field.
            It fades away with the existing oval-to-drum scrub before project
            thumbnails move through this area. */}
        <div
          ref={overviewSculptureRef}
          data-testid="selected-work-overview-sculpture"
          className="selected-work-overview-sculpture pointer-events-none absolute z-10"
          aria-hidden="true"
          style={{ opacity: 0, visibility: 'hidden' }}
        >
          <OstrumSignatureSculpture placement="selected-work" />
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
