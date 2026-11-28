'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { OstrumLiquidSandCTA } from '@/components/sections/OstrumLiquidSandCTA';
import { OstrumStudioFooter } from '@/components/sections/OstrumStudioFooter';
import { isHandheldTouchDevice, subscribeDeviceTierChange } from '@/lib/device-tier';

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

    const setupDesktopPinned = () => {
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
        id: showCTA ? 'theatre-curtain-reveal-cta' : 'theatre-curtain-reveal-legal',
        invalidateOnRefresh: true,
        animation: tl,
        onUpdate: (self) => {
          if (curtain) {
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
    };

    const setupHandheldFlow = () => {
      if (showCTA) {
        container.dataset.mobileCurtainActive = 'true';
        const getLiftDistance = () => curtain.offsetHeight || window.innerHeight;
        const naturalStageHeight = stage.offsetHeight;
        const vpH = getLiftDistance();

        // Tall portrait phone viewports (e.g. Chrome "Request desktop site" at ~980x1742)
        // fit the entire studio footer inside 100svh. Locking stage with sticky positioning
        // while the CTA scrolls natively 1:1 prevents pin-spacer cutoff and bottom voids.
        if (naturalStageHeight <= vpH + 2) {
          container.style.overflowX = 'clip';
          container.style.overflowY = 'visible';
          container.style.minHeight = `${vpH + naturalStageHeight}px`;

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
          gsap.set(stage, {
            position: 'sticky',
            top: 0,
            zIndex: 10,
            width: '100%',
          });

          const trigger = ScrollTrigger.create({
            trigger: container,
            start: 'top top',
            end: () => `+=${getLiftDistance()}`,
            id: 'mobile-curtain-reveal-cta',
            invalidateOnRefresh: true,
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
            delete container.dataset.mobileCurtainActive;
            container.style.overflowX = '';
            container.style.overflowY = '';
            container.style.minHeight = '';
            gsap.set([curtain, stage], { clearProps: 'all' });
          };
        }

        // Unpinned normal-flow reveal when footer exceeds 100svh (390x844 mobile or short landscape).
        const naturalTravel = Math.max(0, naturalStageHeight - vpH);
        const extraTravel = Math.max(0, vpH - naturalTravel);
        const totalTravel = Math.max(vpH, extraTravel);
        const updateExtraTravel = () => {
          const curVpH = getLiftDistance();
          const curNatural = Math.max(0, stage.offsetHeight - curVpH);
          const curExtra = Math.max(0, curVpH - curNatural);
          stage.style.marginTop = `${curExtra}px`;
        };
        updateExtraTravel();

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
        gsap.set(stage, {
          position: 'relative',
          zIndex: 10,
          width: '100%',
        });

        const clearFrac = extraTravel > 0 ? Math.min(1, extraTravel / totalTravel) : 1;
        const targetCurtainY = extraTravel > 0 ? -Math.min(vpH, naturalTravel) : -vpH;
        const tl = gsap.timeline({ paused: true });
        if (extraTravel > 0) {
          tl.to(curtain, { y: targetCurtainY, duration: clearFrac, ease: 'none' });
          if (clearFrac < 1) {
            tl.to(curtain, { y: targetCurtainY, duration: 1 - clearFrac, ease: 'none' });
          }
        } else {
          tl.to(curtain, { y: () => -getLiftDistance(), ease: 'none' });
        }

        const trigger = ScrollTrigger.create({
          trigger: container,
          start: 'top top',
          end: () => `+=${totalTravel}`,
          scrub: 0.6,
          id: 'mobile-curtain-reveal-cta',
          invalidateOnRefresh: true,
          onRefreshInit: updateExtraTravel,
          animation: tl,
          onUpdate: (self) => {
            curtain.style.pointerEvents = self.progress >= clearFrac * 0.95 ? 'none' : 'auto';
          },
          onLeave: () => {
            curtain.style.pointerEvents = 'none';
            curtain.style.visibility = 'hidden';
          },
          onEnterBack: (self) => {
            curtain.style.visibility = 'visible';
            curtain.style.pointerEvents = self.progress >= clearFrac * 0.95 ? 'none' : 'auto';
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

      // Legal pages (!showCTA): keep white curtain behavior
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
    };

    let activeMode: 'handheld' | 'desktop' | null = null;
    let activeCleanup: (() => void) | undefined;

    const rebuildForTier = () => {
      const nextMode: 'handheld' | 'desktop' = isHandheldTouchDevice() ? 'handheld' : 'desktop';
      if (nextMode === activeMode && activeCleanup) return;
      activeCleanup?.();
      activeMode = nextMode;
      activeCleanup = nextMode === 'handheld' ? setupHandheldFlow() : setupDesktopPinned();
    };

    rebuildForTier();
    const unsubTier = subscribeDeviceTierChange(rebuildForTier);

    return () => {
      unsubTier();
      activeCleanup?.();
      activeCleanup = undefined;
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
