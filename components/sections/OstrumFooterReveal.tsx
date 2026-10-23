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

    // 1. DESKTOP & TABLET IMPLEMENTATION (>= 768px)
    mm.add('(min-width: 768px)', () => {
      const getLiftDistance = () => window.innerHeight;

      gsap.set(curtain, {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100svh',
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
        scrub: 0.6,
        anticipatePin: 1,
        id: 'theatre-curtain-reveal-desktop',
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
    // Lightweight scrubbed curtain reveal tailored for mobile touch ergonomics
    mm.add('(max-width: 767px)', () => {
      const getLiftDistance = () => window.innerHeight;

      gsap.set(curtain, {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100svh',
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
        end: () => `+=${Math.round(getLiftDistance() * 0.95)}`,
        pin: container,
        pinSpacing: true,
        scrub: 0.5,
        anticipatePin: 1,
        id: 'theatre-curtain-reveal-mobile',
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
        className={`theatre-curtain relative z-20 w-full min-h-[100svh] ${
          showCTA ? 'bg-[#050505]' : 'bg-[#FAF7F2]'
        }`}
        style={{
          height: '100svh',
        }}
        aria-hidden={!showCTA}
      >
        {showCTA ? (
          <OstrumLiquidSandCTA />
        ) : (
          <div
            data-testid="legal-curtain-mask"
            className="w-full h-full min-h-[100svh] bg-[#FAF7F2] select-none pointer-events-none"
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
