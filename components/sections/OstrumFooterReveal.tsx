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

    // Keep the pinned theatre reveal on desktop, where pointer scrolling is
    // predictable. Touch devices use a normal-flow CTA and footer so a fast
    // fling in either direction cannot strand the page inside a pin spacer.
    mm.add('(min-width: 768px)', () => {
      const getLiftDistance = () => window.innerHeight;

      // Initialize curtain layer: spans 100% width and full viewport height (100svh)
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
        pointerEvents: showCTA ? 'auto' : 'auto',
      });

      // Underlying stage layer
      gsap.set(stage, {
        position: 'relative',
        zIndex: 10,
        width: '100%',
      });

      // Lift animation: clean 1:1 translation upwards by exactly one viewport height
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
        id: showCTA ? 'theatre-curtain-reveal-cta' : 'theatre-curtain-reveal-legal',
        invalidateOnRefresh: true,
        animation: tl,
        onUpdate: (self) => {
          if (curtain) {
            // Disable pointer events on curtain only when near fully lifted
            // ensuring hidden footer links cannot be clicked through the mask
            curtain.style.pointerEvents = self.progress >= 0.95 ? 'none' : 'auto';
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
            curtain.style.pointerEvents = self.progress >= 0.95 ? 'none' : 'auto';
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

    mm.add('(max-width: 767px)', () => {
      if (showCTA) {
        // Pinned theatre curtain reveal on mobile matching desktop choreography:
        // The CTA section scrolls into view in normal document flow. Once it
        // reaches the top of the viewport ('top top'), the wrapper pins and
        // the curtain lifts cleanly upward over 100svh of scroll travel,
        // revealing the underlying studio footer stage. Stacking precedence
        // (z-30 on #theatre-stage-wrapper vs z-20 on #faq-contact-field) ensures
        // the CTA never slips beneath the contact form.
        container.dataset.mobileCurtainActive = 'true';
        const getLiftDistance = () => curtain.offsetHeight || window.innerHeight;

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
          pointerEvents: 'auto',
        });
        gsap.set(stage, { position: 'relative', zIndex: 10, width: '100%' });

        const tl = gsap.timeline({ paused: true });
        tl.to(curtain, { y: () => -getLiftDistance(), ease: 'none' });

        const trigger = ScrollTrigger.create({
          trigger: container,
          start: 'top top',
          end: () => `+=${getLiftDistance()}`,
          pin: container,
          pinSpacing: true,
          scrub: 0.6,
          anticipatePin: 1,
          id: 'mobile-curtain-reveal-cta',
          invalidateOnRefresh: true,
          animation: tl,
          onUpdate: (self) => {
            curtain.style.pointerEvents = self.progress >= 0.95 ? 'none' : 'auto';
          },
          onLeave: () => {
            curtain.style.pointerEvents = 'none';
            curtain.style.visibility = 'hidden';
          },
          onEnterBack: (self) => {
            curtain.style.visibility = 'visible';
            curtain.style.pointerEvents = self.progress >= 0.95 ? 'none' : 'auto';
          },
          onLeaveBack: () => {
            curtain.style.visibility = 'visible';
            curtain.style.pointerEvents = 'auto';
          },
        });

        const refreshTimeout = window.setTimeout(() => ScrollTrigger.refresh(), 120);
        return () => {
          window.clearTimeout(refreshTimeout);
          trigger.kill();
          tl.kill();
          delete container.dataset.mobileCurtainActive;
          gsap.set([curtain, stage], { clearProps: 'all' });
        };
      }

      if (!showCTA) {
        // Keep the legal-page white curtain behavior unchanged on touch screens.
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
          pointerEvents: 'auto',
        });
        gsap.set(stage, { position: 'relative', zIndex: 10, width: '100%' });

        const tl = gsap.timeline({ paused: true });
        tl.to(curtain, { y: () => -window.innerHeight, ease: 'none' });
        const trigger = ScrollTrigger.create({
          trigger: container,
          start: 'top top',
          end: () => `+=${window.innerHeight}`,
          pin: container,
          pinSpacing: true,
          scrub: 0.5,
          anticipatePin: 1,
          id: 'theatre-curtain-reveal-legal-mobile',
          invalidateOnRefresh: true,
          animation: tl,
          onLeave: () => {
            curtain.style.pointerEvents = 'none';
            curtain.style.visibility = 'hidden';
          },
          onEnterBack: (self) => {
            curtain.style.visibility = 'visible';
            curtain.style.pointerEvents = self.progress >= 0.95 ? 'none' : 'auto';
          },
        });
        return () => {
          trigger.kill();
          tl.kill();
          gsap.set([curtain, stage], { clearProps: 'all' });
        };
      }

      gsap.set(curtain, {
        position: 'relative',
        top: 'auto',
        left: 'auto',
        width: '100%',
        height: '100svh',
        zIndex: 20,
        y: 0,
        autoAlpha: 1,
        visibility: 'visible',
        pointerEvents: 'auto',
      });

      gsap.set(stage, {
        position: 'relative',
        zIndex: 10,
        width: '100%',
      });

      const reveal = gsap.fromTo(
        stage,
        { autoAlpha: 0.42, y: () => Math.min(window.innerHeight * 0.38, 320) },
        {
          autoAlpha: 1,
          y: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: stage,
            start: 'top 100%',
            end: 'top 42%',
            scrub: 0.3,
            invalidateOnRefresh: true,
            id: showCTA ? 'mobile-footer-reveal-cta' : 'mobile-footer-reveal-legal',
          },
        }
      );

      const refreshTimeout = window.setTimeout(() => ScrollTrigger.refresh(), 100);
      return () => {
        window.clearTimeout(refreshTimeout);
        reveal.scrollTrigger?.kill();
        reveal.kill();
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
      <div className="relative z-30 w-full overflow-hidden bg-[#64120F]">
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
      data-show-cta={showCTA ? 'true' : 'false'}
      className="relative z-30 w-full overflow-hidden bg-[#64120F]"
    >
      {/* THEATRE CURTAIN: Foreground Closing Panel (z-20) */}
      <div
        ref={curtainRef}
        data-testid="theatre-curtain-panel"
        className={`theatre-curtain absolute top-0 left-0 z-20 w-full min-h-[100svh] ${
          showCTA ? 'bg-[#050505]' : 'bg-white'
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
            className="w-full h-full min-h-[100svh] bg-white select-none"
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
