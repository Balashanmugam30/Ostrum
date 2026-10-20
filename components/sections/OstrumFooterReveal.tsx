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
      const ctaHeight = curtain.offsetHeight;
      const liftDistance = showCTA
        ? Math.max(ctaHeight, window.innerHeight)
        : Math.max(ctaHeight, window.innerHeight * 0.45);

      gsap.set(curtain, {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        minHeight: showCTA ? '100svh' : '40svh',
        height: showCTA ? '100%' : 'auto',
        zIndex: 20,
        y: 0,
        autoAlpha: 1,
        pointerEvents: showCTA ? 'auto' : 'none',
      });

      gsap.set(stage, {
        position: 'relative',
        zIndex: 10,
        width: '100%',
      });

      const tl = gsap.timeline({ paused: true });
      tl.to(curtain, {
        y: -liftDistance,
        ease: 'power2.inOut',
      });

      const trigger = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: `+=${liftDistance * 1.15}`,
        pin: container,
        pinSpacing: true,
        scrub: 0.8,
        anticipatePin: 1,
        id: 'theatre-curtain-reveal-desktop',
        invalidateOnRefresh: true,
        animation: tl,
        onUpdate: (self) => {
          if (curtain) {
            curtain.style.pointerEvents = showCTA && self.progress < 0.35 ? 'auto' : 'none';
            curtain.style.opacity = self.progress > 0.92 ? '0' : '1';
            curtain.style.visibility = self.progress > 0.96 ? 'hidden' : 'visible';
          }
        },
        onLeave: () => {
          if (curtain) {
            curtain.style.pointerEvents = 'none';
            curtain.style.opacity = '0';
            curtain.style.visibility = 'hidden';
          }
        },
        onEnterBack: (self) => {
          if (curtain) {
            curtain.style.pointerEvents = showCTA && self.progress < 0.35 ? 'auto' : 'none';
            curtain.style.opacity = self.progress > 0.92 ? '0' : '1';
            curtain.style.visibility = self.progress > 0.96 ? 'hidden' : 'visible';
          }
        },
      });

      const refreshTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 150);

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
      const ctaHeight = curtain.offsetHeight;
      const liftDistance = showCTA
        ? Math.max(ctaHeight, window.innerHeight * 0.85)
        : Math.max(ctaHeight, window.innerHeight * 0.35);

      gsap.set(curtain, {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        minHeight: showCTA ? '100svh' : '35svh',
        height: showCTA ? '100%' : 'auto',
        zIndex: 20,
        y: 0,
        autoAlpha: 1,
        pointerEvents: showCTA ? 'auto' : 'none',
      });

      gsap.set(stage, {
        position: 'relative',
        zIndex: 10,
        width: '100%',
      });

      const tl = gsap.timeline({ paused: true });
      tl.to(curtain, {
        y: -liftDistance,
        ease: 'power2.out',
      });

      const trigger = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: `+=${liftDistance * 1.05}`,
        pin: container,
        pinSpacing: true,
        scrub: 0.5,
        anticipatePin: 1,
        id: 'theatre-curtain-reveal-mobile',
        invalidateOnRefresh: true,
        animation: tl,
        onUpdate: (self) => {
          if (curtain) {
            curtain.style.pointerEvents = showCTA && self.progress < 0.35 ? 'auto' : 'none';
            curtain.style.opacity = self.progress > 0.90 ? '0' : '1';
            curtain.style.visibility = self.progress > 0.95 ? 'hidden' : 'visible';
          }
        },
        onLeave: () => {
          if (curtain) {
            curtain.style.pointerEvents = 'none';
            curtain.style.opacity = '0';
            curtain.style.visibility = 'hidden';
          }
        },
        onEnterBack: (self) => {
          if (curtain) {
            curtain.style.pointerEvents = showCTA && self.progress < 0.35 ? 'auto' : 'none';
            curtain.style.opacity = self.progress > 0.90 ? '0' : '1';
            curtain.style.visibility = self.progress > 0.95 ? 'hidden' : 'visible';
          }
        },
      });

      const refreshTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 150);

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
        className={`theatre-curtain relative z-20 w-full bg-[#050505] ${
          showCTA ? 'min-h-[100svh]' : 'min-h-[35svh] sm:min-h-[40svh]'
        }`}
        aria-hidden={!showCTA}
      >
        {showCTA ? (
          <OstrumLiquidSandCTA />
        ) : (
          <div
            data-testid="legal-curtain-mask"
            className="w-full h-full min-h-[35svh] sm:min-h-[40svh] bg-[#050505] select-none pointer-events-none"
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
