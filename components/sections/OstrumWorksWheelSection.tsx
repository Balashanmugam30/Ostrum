'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  WorksWheel,
  OSTRUM_WORKS,
  WorksWheelHandle,
  SOLID_RED_THEME,
  RESTING_WHEEL_THEME,
  PROJECT_THEMES,
} from '@/components/ui/works-wheel';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  (window as any).ScrollTrigger = ScrollTrigger;
}

export function OstrumWorksWheelSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const worksWheelRef = useRef<WorksWheelHandle>(null);

  const isDrumActiveRef = useRef(false);
  const capabilitiesTransitionActiveRef = useRef(false);

  // Dynamic project themes: resting oval (#64120F), TMR (#C9362B), Saraswati (#F7F5F2), MNESA (#050505), Capabilities (#FAF7F2)
  const [activeProject, setActiveProject] = useState(-1);
  const currentTheme =
    activeProject >= 0
      ? (PROJECT_THEMES[activeProject] ?? RESTING_WHEEL_THEME)
      : RESTING_WHEEL_THEME;

  const handleActiveChange = useCallback((index: number) => {
    setActiveProject(index);
    if (!isDrumActiveRef.current) return;
    const t = PROJECT_THEMES[index] ?? RESTING_WHEEL_THEME;
    if (pinContainerRef.current) {
      pinContainerRef.current.style.backgroundColor = t.deep;
    }
    if (sectionRef.current) {
      sectionRef.current.style.backgroundColor = t.deep;
    }
  }, []);

  const handleTurnChange = useCallback((turn: number) => {
    const nextIsDrumActive = turn >= 0.45;
    if (nextIsDrumActive === isDrumActiveRef.current) return;

    isDrumActiveRef.current = nextIsDrumActive;
    if (!nextIsDrumActive) {
      setActiveProject(-1);
      if (pinContainerRef.current) {
        pinContainerRef.current.style.backgroundColor = RESTING_WHEEL_THEME.deep;
      }
      if (sectionRef.current) {
        sectionRef.current.style.backgroundColor = RESTING_WHEEL_THEME.deep;
      }
    }
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
      opacity?: number;
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

      let lastLeftPanelOp: number | null = null;
      const setLeftPanelOpCached = (op: number | null) => {
        const normalized = op === null ? null : Math.round(op * 100) / 100;
        if (lastLeftPanelOp === normalized) return;
        lastLeftPanelOp = normalized;
        worksWheelRef.current?.setLeftPanelOpacity?.(normalized);
      };

      let lastWheelOp: number | null = null;
      const setWheelOpCached = (op: number) => {
        const rounded = Math.round(op * 100) / 100;
        if (lastWheelOp === rounded) return;
        lastWheelOp = rounded;
        worksWheelRef.current?.setWheelOpacity?.(rounded);
      };

      if (prefersReducedMotion) {
        worksWheelRef.current?.setTurn(1);
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
          onToggle: (self) => {
            emitVisualCoverage(self.isActive);
          },
          onUpdate: (self) => {
            const p = self.progress;
            let targetTurn = 0;
            let capabilitiesProgress: number | null = null;
            let capabilitiesOpacity = 1;

            if (p < 1 && pinContainerRef.current && pinContainerRef.current.style.visibility === 'hidden') {
              pinContainerRef.current.style.opacity = '1';
              pinContainerRef.current.style.visibility = 'visible';
            }

            if (p <= p1) {
              // Phase 1: Oval at rest with minimal center label
              targetTurn = 0;
              setLeftPanelOpCached(0);
              notifyCapabilities({ active: false });
              if (pinContainerRef.current && pinContainerRef.current.style.backgroundColor !== RESTING_WHEEL_THEME.deep) {
                pinContainerRef.current.style.backgroundColor = RESTING_WHEEL_THEME.deep;
              }
              if (sectionRef.current && sectionRef.current.style.backgroundColor !== RESTING_WHEEL_THEME.deep) {
                sectionRef.current.style.backgroundColor = RESTING_WHEEL_THEME.deep;
              }
            } else if (p <= p2) {
              // Phase 2: Smooth, continuous scroll-scrubbed oval-to-drum expansion
              const tMorph = (p - p1) / (p2 - p1);
              targetTurn = tMorph * 1.0;
              setLeftPanelOpCached(null);
              setWheelOpCached(1);
              notifyCapabilities({ active: false });
            } else if (p <= p3) {
              // Phase 3: Project-by-project browsing across all 4 entries (1000px per project)
              // Project 0 (TMR) -> Project 1 (Saraswati) -> Project 2 (MNESA) -> Project 3 (Our Capabilities)
              const tProj = (p - p2) / (p3 - p2);
              targetTurn = 1.0 + tProj * last;
              setLeftPanelOpCached(null);
              setWheelOpCached(1);

              if (tProj < 0.78) {
                // MNESA and earlier projects: Capabilities overlay is completely inactive
                notifyCapabilities({ active: false });
              } else {
                // Drum rotating towards Our Capabilities: smoothly fade in the live section at wheel card scale
                const settleFade = Math.min(1, Math.max(0, (tProj - 0.78) / 0.18));
                capabilitiesProgress = 0;
                capabilitiesOpacity = settleFade;
              }
            } else {
              // Phase 4: Full-Bleed Capabilities Expansion into Section 05
              // Entry 4 is fully settled on the drum (turn = 4.0).
              targetTurn = 1.0 + last; // 4.0
              const tExp = Math.min(1, Math.max(0, (p - p3) / (1.0 - p3)));
              const fadeOut = Math.max(0, 1 - tExp * 4);
              setLeftPanelOpCached(fadeOut);
              setWheelOpCached(fadeOut);

              capabilitiesProgress = tExp;
              capabilitiesOpacity = 1;
            }

            worksWheelRef.current?.setTurn(targetTurn);
            if (capabilitiesProgress !== null) {
              notifyCapabilities({
                active: true,
                progress: capabilitiesProgress,
                opacity: capabilitiesOpacity,
              });
            }
          },
          onLeave: () => {
            // Hide works wheel pinned container completely when handed off to Capabilities
            if (pinContainerRef.current) {
              pinContainerRef.current.style.opacity = '0';
              pinContainerRef.current.style.visibility = 'hidden';
            }
            lastLeftPanelOp = 0;
            lastWheelOp = 0;
            worksWheelRef.current?.setWheelOpacity?.(0);
            worksWheelRef.current?.setLeftPanelOpacity?.(0);
            // Keep Capabilities active and full-screen during handoff into capabilities-pin
            notifyCapabilities({
              active: true,
              progress: 1.0,
              opacity: 1,
            });
          },
          onEnterBack: () => {
            // Restore works wheel pinned container visibility when scrolling back up
            if (pinContainerRef.current) {
              pinContainerRef.current.style.opacity = '1';
              pinContainerRef.current.style.visibility = 'visible';
              pinContainerRef.current.style.backgroundColor = PROJECT_THEMES[last]?.deep ?? RESTING_WHEEL_THEME.deep;
            }
            if (sectionRef.current) {
              sectionRef.current.style.backgroundColor = PROJECT_THEMES[last]?.deep ?? RESTING_WHEEL_THEME.deep;
            }
            setActiveProject(last);
            lastLeftPanelOp = null;
            lastWheelOp = null;
            worksWheelRef.current?.setWheelOpacity?.(1);
            worksWheelRef.current?.setTurn(1.0 + last);
          },
          onLeaveBack: () => {
            if (pinContainerRef.current) {
              pinContainerRef.current.style.opacity = '1';
              pinContainerRef.current.style.visibility = 'visible';
              pinContainerRef.current.style.backgroundColor = RESTING_WHEEL_THEME.deep;
            }
            if (sectionRef.current) {
              sectionRef.current.style.backgroundColor = RESTING_WHEEL_THEME.deep;
            }
            setActiveProject(-1);
            lastLeftPanelOp = 0;
            lastWheelOp = 1;
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
      className="relative z-[30] w-full"
      style={{
        marginTop: '-100vh',
        marginBottom: '-100vh',
        backgroundColor: currentTheme.deep,
        color: '#FFFFFF',
        transition: 'background-color 0.4s ease',
      }}
      aria-label="Selected Works"
    >
      {/* Works Wheel Pinned Container - 100svh Full Screen Stage with Dynamic Surface Theme */}
      <div
        ref={pinContainerRef}
        data-testid="selected-work-pin-container"
        className="w-full h-screen h-[100svh] min-h-screen min-h-[100svh] relative overflow-hidden"
        style={{
          backgroundColor: currentTheme.deep,
          transition: 'background-color 0.4s ease',
        }}
      >
        {/* Works Wheel Stage (Controlled by ScrollTrigger) */}
        <div className="relative z-20 w-full h-full">
          <WorksWheel
            ref={worksWheelRef}
            items={OSTRUM_WORKS}
            label="Selected Work"
            controlled={true}
            theme={currentTheme}
            onActiveChange={handleActiveChange}
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
