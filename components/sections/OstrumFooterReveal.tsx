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
  const ctaWrapRef = useRef<HTMLDivElement>(null);
  const footerWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) return;

    const container = containerRef.current;
    const cta = ctaWrapRef.current;
    const footer = footerWrapRef.current;
    if (!container || !cta || !footer) return;

    // Only apply the dynamic reveal on desktop/tablet where viewport height allows cinematic reveal
    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px)', () => {
      // Calculate scroll travel distance for the reveal
      const ctaHeight = cta.offsetHeight;

      const trigger = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: () => `+=${ctaHeight}`,
        pin: cta,
        pinSpacing: false,
        anticipatePin: 1,
        id: 'ostrum-cta-footer-reveal',
        invalidateOnRefresh: true,
        scrub: true,
        onUpdate: (self) => {
          // Progressively lift the CTA panel upwards out of the viewport
          gsap.set(cta, {
            y: -self.progress * ctaHeight,
            autoAlpha: self.progress > 0.98 ? 0 : 1,
            pointerEvents: self.progress > 0.9 ? 'none' : 'auto',
          });
        },
        onLeave: () => {
          gsap.set(cta, {
            y: -ctaHeight,
            autoAlpha: 0,
            pointerEvents: 'none',
          });
        },
        onEnterBack: () => {
          gsap.set(cta, {
            autoAlpha: 1,
            pointerEvents: 'auto',
          });
        },
      });

      return () => {
        trigger.kill();
        gsap.set(cta, { clearProps: 'all' });
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: '#050505' }}
    >
      {/* SECTION 09: Final Closing CTA (Foreground Closing Layer) */}
      <div
        ref={ctaWrapRef}
        className="relative z-20 w-full bg-[#050505] shadow-[0_30px_70px_rgba(0,0,0,0.95)]"
      >
        <OstrumLiquidSandCTA />
      </div>

      {/* SECTION 10: Ostrum Studio Footer (Underlying Layer Revealed as CTA Lifts Away) */}
      <div
        ref={footerWrapRef}
        className="relative z-10 w-full bg-[#050505]"
      >
        <OstrumStudioFooter />
      </div>
    </div>
  );
}

export default OstrumFooterReveal;
