'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { OstrumLiquidSandCTA } from '@/components/sections/OstrumLiquidSandCTA';
import { OstrumStudioFooter } from '@/components/sections/OstrumStudioFooter';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface OstrumFooterRevealProps {
  showCTA?: boolean;
}

export function OstrumFooterReveal({ showCTA = true }: OstrumFooterRevealProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      setIsReducedMotion(true);
      return;
    }

    const container = containerRef.current;
    const curtain = curtainRef.current;
    const stage = stageRef.current;
    if (!container || !curtain || !stage) return;

    const mm = gsap.matchMedia();

    // Calculate legal mask and reveal distance based on stage's contact header region
    const getLegalRevealDistance = () => {
      if (stage) {
        const tiles = stage.querySelector('.grid');
        if (tiles) {
          const stageRect = stage.getBoundingClientRect();
          const tilesRect = tiles.getBoundingClientRect();
          const measured = tilesRect.bottom - stageRect.top + 32;
          if (measured > 250) return Math.ceil(measured);
        }
      }
      return window.innerWidth >= 768 ? 448 : 596;
    };

    // 1. DESKTOP & TABLET IMPLEMENTATION (>= 768px)
    mm.add('(min-width: 768px)', () => {
      const getLiftDistance = () => (showCTA ? window.innerHeight : getLegalRevealDistance());
      const initialLift = getLiftDistance();

      gsap.set(curtain, {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: showCTA ? '100svh' : `${initialLift}px`,
        zIndex: 20,
        y: 0,
        autoAlpha: 1,
        visibility: 'visible',
        pointerEvents: showCTA ? 'auto' : 'none',
      });

      gsap.set(stage, {
        position: 'relative',
        zIndex: 10,
        width: '100%',
      });

      const tl = gsap.timeline({ paused: true });
      tl.to(curtain, {
        y: () => -getLiftDistance(),
        ease: 'none',
      });

      const trigger = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: () => `+=${getLiftDistance()}`,
        pin: container,
        pinSpacing: true,
        scrub: showCTA ? 0.6 : 0.5,
        anticipatePin: 1,
        id: showCTA ? 'theatre-curtain-reveal-desktop' : 'legal-curtain-reveal-desktop',
        invalidateOnRefresh: true,
        animation: tl,
        onUpdate: (self) => {
          if (curtain && showCTA) {
            curtain.style.pointerEvents = self.progress < 0.25 ? 'auto' : 'none';
          }
        },
        onLeave: () => {
          if (curtain) {
            curtain.style.pointerEvents = 'none';
            curtain.style.visibility = 'hidden';
          }
        },
        onEnterBack: (self) => {
          if (curtain) {
            curtain.style.visibility = 'visible';
            if (showCTA) {
              curtain.style.pointerEvents = self.progress < 0.25 ? 'auto' : 'none';
            }
          }
        },
      });

      const refreshTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);

      return () => {
        clearTimeout(refreshTimeout);
        trigger.kill();
        tl.kill();
        gsap.set([curtain, stage], { clearProps: 'all' });
      };
    });

    // 2. MOBILE IMPLEMENTATION (< 768px)
    mm.add('(max-width: 767px)', () => {
      const getLiftDistance = () => (showCTA ? window.innerHeight : getLegalRevealDistance());
      const initialLift = getLiftDistance();

      gsap.set(curtain, {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: showCTA ? '100svh' : `${initialLift}px`,
        zIndex: 20,
        y: 0,
        autoAlpha: 1,
        visibility: 'visible',
        pointerEvents: showCTA ? 'auto' : 'none',
      });

      gsap.set(stage, {
        position: 'relative',
        zIndex: 10,
        width: '100%',
      });

      const tl = gsap.timeline({ paused: true });
      tl.to(curtain, {
        y: () => -getLiftDistance(),
        ease: 'none',
      });

      const trigger = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: () => `+=${getLiftDistance()}`,
        pin: container,
        pinSpacing: true,
        scrub: showCTA ? 0.5 : 0.45,
        anticipatePin: 1,
        id: showCTA ? 'theatre-curtain-reveal-mobile' : 'legal-curtain-reveal-mobile',
        invalidateOnRefresh: true,
        animation: tl,
        onUpdate: (self) => {
          if (curtain && showCTA) {
            curtain.style.pointerEvents = self.progress < 0.25 ? 'auto' : 'none';
          }
        },
        onLeave: () => {
          if (curtain) {
            curtain.style.pointerEvents = 'none';
            curtain.style.visibility = 'hidden';
          }
        },
        onEnterBack: (self) => {
          if (curtain) {
            curtain.style.visibility = 'visible';
            if (showCTA) {
              curtain.style.pointerEvents = self.progress < 0.25 ? 'auto' : 'none';
            }
          }
        },
      });

      const refreshTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);

      return () => {
        clearTimeout(refreshTimeout);
        trigger.kill();
        tl.kill();
        gsap.set([curtain, stage], { clearProps: 'all' });
      };
    });

    return () => {
      mm.revert();
    };
  }, [showCTA]);

  // Reduced motion fallback: show components sequentially in normal document flow
  if (isReducedMotion) {
    return (
      <div className="relative w-full overflow-hidden bg-[#64120F]">
        {showCTA && <OstrumLiquidSandCTA />}
        <div className="relative z-10 w-full bg-[#64120F]">
          <OstrumStudioFooter />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      id="theatre-stage-wrapper"
      data-testid="theatre-curtain-reveal-container"
      className="relative w-full overflow-hidden bg-[#64120F]"
    >
      {/* THEATRE CURTAIN: Foreground Closing Panel (z-20) */}
      <div
        ref={curtainRef}
        data-testid="theatre-curtain-panel"
        className={`theatre-curtain absolute top-0 left-0 z-20 w-full ${
          showCTA ? 'min-h-[100svh] bg-[#050505]' : 'bg-white'
        }`}
        style={{
          height: showCTA ? '100svh' : undefined,
        }}
        aria-hidden={!showCTA}
      >
        {showCTA ? (
          <OstrumLiquidSandCTA />
        ) : (
          <div
            data-testid="legal-curtain-mask"
            className="w-full bg-white select-none pointer-events-none"
            style={{
              height: '100%',
              minHeight: '448px',
            }}
          />
        )}
      </div>

      {/* THEATRE STAGE: Underlying Studio Footer Layer (z-10) */}
      <div
        ref={stageRef}
        data-testid="theatre-stage-panel"
        className="theatre-stage relative z-10 w-full bg-[#64120F]"
      >
        <OstrumStudioFooter />
      </div>
    </div>
  );
}

export default OstrumFooterReveal;
