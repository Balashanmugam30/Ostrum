'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WorksWheel, OSTRUM_WORKS, WorksWheelHandle } from '@/components/ui/works-wheel';
import { AnodizedInk } from '@/components/ui/anodized-ink';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  (window as any).ScrollTrigger = ScrollTrigger;
}

export function OstrumWorksWheelSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const worksWheelRef = useRef<WorksWheelHandle>(null);
  const [activeProject, setActiveProject] = useState(0);

  // Smooth programmatic project selection (via card click or keyboard)
  const handleSelectProject = useCallback((index: number) => {
    const st = ScrollTrigger.getById('works-wheel-pin');
    if (!st) {
      worksWheelRef.current?.to(index + 1);
      return;
    }
    const isMobile = window.innerWidth < 768;
    const holdDist = isMobile ? 280 : 420;
    const morphDist = isMobile ? 650 : 920;
    const projectsDist = isMobile ? 2600 : 3600;
    const endHoldDist = isMobile ? 250 : 350;
    const totalPinDistance = holdDist + morphDist + projectsDist + endHoldDist;
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
      const holdDist = isMobile ? 280 : 420;
      const morphDist = isMobile ? 650 : 920;
      const projectsDist = isMobile ? 2600 : 3600;
      const endHoldDist = isMobile ? 250 : 350;
      const totalPinDistance = holdDist + morphDist + projectsDist + endHoldDist;

      const count = OSTRUM_WORKS.length;
      const last = Math.max(count - 1, 0);

      const p1 = holdDist / totalPinDistance;
      const p2 = (holdDist + morphDist) / totalPinDistance;
      const p3 = (holdDist + morphDist + projectsDist) / totalPinDistance;

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
          onUpdate: (self) => {
            const p = self.progress;
            let targetTurn = 0;

            if (p <= p1) {
              // Phase 1: Ring at rest with minimal center label
              targetTurn = 0;
            } else if (p <= p2) {
              // Phase 2: Smooth, continuous scroll-scrubbed ring-to-drum expansion
              const tMorph = (p - p1) / (p2 - p1);
              targetTurn = tMorph * 1.0;
            } else if (p <= p3) {
              // Phase 3: Project-by-project browsing across the 9 projects
              const tProj = (p - p2) / (p3 - p2);
              targetTurn = 1.0 + tProj * last;
            } else {
              // Phase 4: Final project hold before releasing to footer
              targetTurn = 1.0 + last;
            }

            worksWheelRef.current?.setTurn(targetTurn);
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
  }, []);

  return (
    <section
      id="selected-work"
      ref={sectionRef}
      data-testid="selected-work-section"
      className="relative z-[20] w-full bg-[#040104] text-white"
      style={{ marginTop: '-100vh' }}
      aria-label="Selected Works"
    >
      {/* Works Wheel Pinned Container - 100svh Full Screen Stage with Persistent Anodized Ink Background */}
      <div
        ref={pinContainerRef}
        className="w-full h-screen h-[100svh] min-h-screen min-h-[100svh] relative overflow-hidden bg-[#040104]"
      >
        {/* Anodized Ink WebGL2 Shader Background */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <AnodizedInk
            preset="crimson"
            speed={0.42}
            turbulence={0.75}
            scale={1.1}
            sheen={0.48}
            glow={0.30}
            swirl={0.5}
            grain={0.20}
            vignette={0.88}
            interactive={true}
            ripples={true}
            maxDpr={1.25}
            height="100%"
          />
        </div>

        {/* Works Wheel Stage (Controlled by ScrollTrigger) */}
        <div className="relative z-10 w-full h-full">
          <WorksWheel
            ref={worksWheelRef}
            items={OSTRUM_WORKS}
            label="Selected Work"
            controlled={true}
            onActiveChange={setActiveProject}
            onSelectProject={handleSelectProject}
            onDragScroll={handleDragScroll}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Natural scroll continuation footer below the wheel */}
      <footer className="w-full py-20 sm:py-28 flex flex-col items-center justify-center border-t border-white/10 bg-[#040104]/95 backdrop-blur-md text-center px-4 relative z-10">
        <p className="font-mono text-xs uppercase tracking-[0.24em] mb-3 font-semibold text-[#850b1b]">
          OSTRUM STUDIO · SELECTED WORK
        </p>
        <a
          href="mailto:hello@ostrum.co"
          className="text-base sm:text-lg font-medium text-white/90 hover:text-white transition-opacity flex items-center gap-2 group"
        >
          <span>Have a system to build or venture to launch? Start a Conversation</span>
          <span
            className="transition-transform group-hover:translate-x-1 text-[#850b1b]"
            aria-hidden="true"
          >
            →
          </span>
        </a>
      </footer>
    </section>
  );
}

export default OstrumWorksWheelSection;
