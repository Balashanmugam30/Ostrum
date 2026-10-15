'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { OstrumLiquidSandCTA } from '@/components/sections/OstrumLiquidSandCTA';
import { OstrumStudioFooter } from '@/components/sections/OstrumStudioFooter';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function OstrumFooterReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) return;

    const container = containerRef.current;
    const curtain = curtainRef.current;
    const stage = stageRef.current;
    if (!container || !curtain || !stage) return;

    // Use gsap.matchMedia for clean, responsive desktop/tablet theatre curtain reveal
    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px)', () => {
      const ctaHeight = curtain.offsetHeight;
      const liftDistance = Math.min(ctaHeight, window.innerHeight);

      // Stacking structure:
      // Curtain sits as absolute foreground cover (z-20) over stage (z-10)
      gsap.set(curtain, {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        minHeight: '100svh',
        zIndex: 20,
        y: 0,
        autoAlpha: 1,
        pointerEvents: 'auto',
      });

      gsap.set(stage, {
        position: 'relative',
        zIndex: 10,
        width: '100%',
      });

      // Pinned theatre-curtain lift timeline directly driven by scroll progress
      const tl = gsap.timeline({
        paused: true,
      });

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
        id: 'theatre-curtain-reveal',
        invalidateOnRefresh: true,
        animation: tl,
        onUpdate: (self) => {
          if (curtain) {
            // Fade out the very last bit to avoid any edge bleeding
            curtain.style.opacity = self.progress > 0.98 ? '0' : '1';
            // Disable curtain pointer events as it exits so underlying stage links are immediately accessible
            curtain.style.pointerEvents = self.progress > 0.85 ? 'none' : 'auto';
          }
        },
        onLeave: () => {
          if (curtain) {
            curtain.style.pointerEvents = 'none';
            curtain.style.opacity = '0';
          }
        },
        onEnterBack: () => {
          if (curtain) {
            curtain.style.pointerEvents = 'auto';
            curtain.style.opacity = '1';
          }
        },
      });

      return () => {
        trigger.kill();
        tl.kill();
        gsap.set([curtain, stage], { clearProps: 'all' });
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="theatre-stage-wrapper"
      data-testid="theatre-curtain-reveal-container"
      className="relative w-full overflow-hidden bg-[#050505]"
    >
      {/* THEATRE CURTAIN: Foreground Closing Panel (z-20) */}
      <div
        ref={curtainRef}
        data-testid="theatre-curtain-panel"
        className="theatre-curtain relative z-20 w-full min-h-[100svh] bg-[#050505] shadow-[0_30px_70px_rgba(0,0,0,0.95)]"
      >
        <OstrumLiquidSandCTA />
      </div>

      {/* THEATRE STAGE: Underlying Studio Footer Layer (z-10) */}
      <div
        ref={stageRef}
        data-testid="theatre-stage-panel"
        className="theatre-stage relative z-10 w-full bg-[#050505]"
      >
        <OstrumStudioFooter />
      </div>
    </div>
  );
}

export default OstrumFooterReveal;
