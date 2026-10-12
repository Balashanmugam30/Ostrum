'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  (window as any).ScrollTrigger = ScrollTrigger;
}

const CARD_RATIO = 16 / 10;

export function OstrumProjectExpansionHandoff() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const textPanelRef = useRef<HTMLDivElement>(null);
  const lightOverlayRef = useRef<HTMLDivElement>(null);

  const [metrics, setMetrics] = useState({
    w: 1440,
    h: 900,
    cardW: 560,
    cardH: 350,
    initLeft: 700,
    initTop: 275,
  });

  useEffect(() => {
    const calcMetrics = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isDesktop = w >= 1024;
      const isTablet = w >= 768 && w < 1024;
      const isMobile = w < 768;

      const cardW = isDesktop
        ? Math.min(w * 0.44, h * 0.54 * CARD_RATIO)
        : isTablet
        ? Math.min(w * 0.52, h * 0.46 * CARD_RATIO)
        : Math.min(w * 0.84, 340);

      const cardH = cardW / CARD_RATIO;
      const drumShiftX = isDesktop ? w * 0.22 : isTablet ? w * 0.20 : 0;
      const drumShiftY = isMobile ? -h * 0.12 : 0;

      const cx = w * 0.5 + drumShiftX;
      const cy = h * 0.5 + drumShiftY;

      setMetrics({
        w,
        h,
        cardW,
        cardH,
        initLeft: cx - cardW * 0.5,
        initTop: cy - cardH * 0.5,
      });
    };

    calcMetrics();
    window.addEventListener('resize', calcMetrics);
    return () => window.removeEventListener('resize', calcMetrics);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const pinContainer = pinContainerRef.current;
    if (!section || !pinContainer) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const isMobile = window.innerWidth < 768;
    const pinDistance = isMobile ? 1000 : 1600;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: `+=${pinDistance}`,
        pin: pinContainer,
        pinSpacing: true,
        anticipatePin: 1,
        id: 'project-expansion-pin',
        onUpdate: (self) => {
          const p = self.progress;

          if (prefersReducedMotion) {
            if (lightOverlayRef.current) {
              lightOverlayRef.current.style.opacity = String(p);
            }
            return;
          }

          // 1. Text panel fades out in first 18% of scroll
          if (textPanelRef.current) {
            const textOpacity = Math.max(0, 1 - p * 5.5);
            textPanelRef.current.style.opacity = textOpacity.toFixed(3);
            textPanelRef.current.style.transform = `translate3d(${-p * 40}px, -50%, 0)`;
          }

          // 2. Card expansion (0.0 -> 0.55)
          const card = cardRef.current;
          if (card) {
            const tExp = Math.min(1, Math.max(0, p / 0.55));
            // Smooth easeInOutQuad easing for physical expansion
            const easeExp =
              tExp < 0.5 ? 2 * tExp * tExp : 1 - Math.pow(-2 * tExp + 2, 2) / 2;

            const curLeft = metrics.initLeft * (1 - easeExp);
            const curTop = metrics.initTop * (1 - easeExp);
            const curW = metrics.cardW + (metrics.w - metrics.cardW) * easeExp;
            const curH = metrics.cardH + (metrics.h - metrics.cardH) * easeExp;
            const curRadius = 16 * (1 - easeExp);

            card.style.left = `${curLeft.toFixed(2)}px`;
            card.style.top = `${curTop.toFixed(2)}px`;
            card.style.width = `${curW.toFixed(2)}px`;
            card.style.height = `${curH.toFixed(2)}px`;
            card.style.borderRadius = `${curRadius.toFixed(2)}px`;
          }

          // 3. Hold beat at full viewport (0.55 -> 0.70)
          // (Card stays at 100vw x 100vh with radius 0)

          // 4. Smooth cross-dissolve into Capabilities light canvas (0.70 -> 0.95)
          if (lightOverlayRef.current) {
            const tDissolve = Math.min(1, Math.max(0, (p - 0.70) / 0.25));
            // Smooth ease-out curve
            const easeDissolve = 1 - Math.pow(1 - tDissolve, 2);
            lightOverlayRef.current.style.opacity = easeDissolve.toFixed(3);
          }
        },
      });
    });

    ScrollTrigger.sort();
    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
    };
  }, [metrics]);

  return (
    <section
      id="project-expansion-handoff"
      ref={sectionRef}
      data-testid="project-expansion-section"
      className="relative z-[22] w-full"
      style={{
        backgroundColor: '#063028', // NeuroMove deep atmosphere base
      }}
      aria-label="Project Expansion Handoff"
    >
      {/* Pinned Viewport Container */}
      <div
        ref={pinContainerRef}
        className="w-full h-screen h-[100svh] min-h-screen min-h-[100svh] relative overflow-hidden"
        style={{ backgroundColor: '#063028' }}
      >
        {/* Left Panel: NeuroMove Context (identical to Selected Work front card presentation) */}
        <div
          ref={textPanelRef}
          className="pointer-events-none absolute top-1/2 left-[6%] sm:left-[8%] lg:left-[9%] -translate-y-1/2 max-w-[85vw] sm:max-w-[42vw] lg:max-w-[36vw] z-10 select-none will-change-transform will-change-opacity"
        >
          <h3 className="font-sans font-bold tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.08] mb-4 text-[#F0FDF8]">
            NeuroMove
          </h3>
          <p className="font-sans text-sm sm:text-base lg:text-lg leading-relaxed mb-6 max-w-[32ch] sm:max-w-[38ch] text-[rgba(240,253,248,0.82)]">
            Biomechanical telemetry studio translating kinematic sensor streams
            into adaptive motor rehabilitation diagnostics.
          </p>
        </div>

        {/* Expanding Media Card: /images/works/neuromove.jpg */}
        <div
          ref={cardRef}
          data-testid="expanding-project-card"
          className="absolute overflow-hidden shadow-[0_20px_45px_-10px_rgba(11,11,16,0.25)] border border-white/10 z-20 will-change-transform will-change-[width,height,left,top,border-radius]"
          style={{
            left: `${metrics.initLeft}px`,
            top: `${metrics.initTop}px`,
            width: `${metrics.cardW}px`,
            height: `${metrics.cardH}px`,
            borderRadius: '16px',
          }}
        >
          <img
            src="/images/works/neuromove.jpg"
            alt="NeuroMove Cinematic Expansion"
            className="w-full h-full object-cover object-center"
            draggable={false}
          />
        </div>

        {/* Light Capabilities Canvas Overlay: Dissolves in at end of hold (0.74 -> 1.0) */}
        <div
          ref={lightOverlayRef}
          data-testid="handoff-light-overlay"
          className="pointer-events-none absolute inset-0 z-30 opacity-0 will-change-opacity"
          style={{
            background:
              'linear-gradient(180deg, rgba(191,235,247,0.48) 0%, rgba(255,255,255,0.94) 13%, #FFFFFF 26%)',
            backgroundColor: '#FFFFFF',
          }}
        />
      </div>
    </section>
  );
}

export default OstrumProjectExpansionHandoff;
