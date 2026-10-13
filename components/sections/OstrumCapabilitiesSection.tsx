'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Card3DAccent } from '@/components/ui/Card3DAccent';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  (window as any).ScrollTrigger = ScrollTrigger;
}

export interface CapabilityCardData {
  index: string;
  title: string;
  description: string;
  tags: string[];
  gradient: string;
  variant: 1 | 2 | 3 | 4 | 5 | 6;
}

export const CAPABILITIES_DATA: CapabilityCardData[] = [
  {
    index: '01 / 06',
    title: 'DIGITAL EXPERIENCES',
    description:
      'Digital touchpoints designed to make your business easier to discover, use and buy from.',
    tags: ['Websites', 'E-commerce', 'Customer Portals'],
    gradient:
      'linear-gradient(112deg, #D7B5FA 0%, #F2D4FF 48%, #CDE6FC 100%)',
    variant: 1,
  },
  {
    index: '02 / 06',
    title: 'AI SYSTEMS & AGENTS',
    description:
      'Intelligent systems that respond, reason and carry work forward across your business.',
    tags: ['AI Receptionists', 'AI Agents', 'Workflow Automation'],
    gradient:
      'linear-gradient(112deg, #86FFF8 0%, #D2F6F0 52%, #F4C5CF 100%)',
    variant: 2,
  },
  {
    index: '03 / 06',
    title: 'BUSINESS PLATFORMS',
    description:
      'Connected systems that bring customer relationships, daily operations and business data into focus.',
    tags: ['CRM & ERP', 'Operations Dashboards', 'Business Workflows'],
    gradient:
      'linear-gradient(112deg, #FAC274 0%, #F2A460 100%)',
    variant: 3,
  },
  {
    index: '04 / 06',
    title: 'SOFTWARE & PRODUCT ENGINEERING',
    description:
      'From a promising idea to a dependable digital product built for real-world use.',
    tags: ['Web & Mobile Apps', 'SaaS & MVPs', 'APIs & Integrations'],
    gradient:
      'linear-gradient(112deg, #BBCBFF 0%, #DDE4FF 53%, #EAD9FF 100%)',
    variant: 4,
  },
  {
    index: '05 / 06',
    title: 'HARDWARE & CONNECTED TECHNOLOGY',
    description:
      'Physical technology that brings sensors, devices and software together to solve practical problems.',
    tags: ['IoT & Embedded Systems', 'Smart Devices', 'Hardware Integration'],
    gradient:
      'linear-gradient(112deg, #BDECCF 0%, #CFF7EF 55%, #C4E7F8 100%)',
    variant: 5,
  },
  {
    index: '06 / 06',
    title: 'CUSTOM ENGINEERING',
    description:
      'Some challenges do not fit a category. We design the right solution around the problem.',
    tags: ['Product R&D', 'Prototyping', 'End-to-End Systems'],
    gradient:
      'linear-gradient(112deg, #E9C9F6 0%, #F5CDD8 52%, #FFD9B7 100%)',
    variant: 6,
  },
];

export function OstrumCapabilitiesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const transitionOriginRef = useRef<DOMRect | null>(null);

  const clearTransitionStyles = (hide: boolean) => {
    const pinContainer = pinContainerRef.current;
    if (!pinContainer) return;

    pinContainer.style.position = '';
    pinContainer.style.top = '';
    pinContainer.style.left = '';
    pinContainer.style.width = '';
    pinContainer.style.height = '';
    pinContainer.style.zIndex = '';
    pinContainer.style.pointerEvents = '';
    pinContainer.style.transform = '';
    pinContainer.style.transformOrigin = '';
    pinContainer.style.clipPath = '';
    pinContainer.style.borderRadius = '';
    pinContainer.style.boxShadow = '';
    pinContainer.style.opacity = hide ? '0' : '';
    pinContainer.dataset.transitionProgress = '';
    pinContainer.dataset.transitionSource = '';
    pinContainer.dataset.transitionScale = '';
    pinContainer.dataset.transitionVisibleBounds = '';
    transitionOriginRef.current = null;
  };

  // The canonical section is the shared element: it moves over the fourth wheel
  // item's measured media bounds, then expands to its full viewport layout.
  useEffect(() => {
    const pinContainer = pinContainerRef.current;
    if (!pinContainer) return;

    const updateTransition = ({
      active,
      progress = 0,
    }: {
      active: boolean;
      progress?: number;
    }) => {
      if (!pinContainer) return;

      if (!active) {
        clearTransitionStyles(true);
        return;
      }

      const normProgress = Math.min(1, Math.max(0, progress));
      if (normProgress >= 1) {
        pinContainer.style.position = 'fixed';
        pinContainer.style.top = '0px';
        pinContainer.style.left = '0px';
        pinContainer.style.width = `${document.documentElement.clientWidth}px`;
        pinContainer.style.height = `${document.documentElement.clientHeight}px`;
        pinContainer.style.zIndex = '35';
        pinContainer.style.pointerEvents = 'auto';
        pinContainer.style.opacity = '1';
        pinContainer.style.transform = 'none';
        pinContainer.style.transformOrigin = '0 0';
        pinContainer.style.clipPath = 'none';
        pinContainer.style.borderRadius = '0px';
        pinContainer.style.boxShadow = 'none';
        pinContainer.dataset.transitionProgress = '1.000';
        pinContainer.dataset.transitionScale = '1.00000';
        pinContainer.dataset.transitionVisibleBounds = JSON.stringify({
          left: 0,
          top: 0,
          width: document.documentElement.clientWidth,
          height: document.documentElement.clientHeight,
        });
        return;
      }

      const ease = normProgress * normProgress * (3 - 2 * normProgress);
      const anchor = document.querySelector<HTMLElement>(
        '[data-transition-anchor="capabilities"]',
      );
      const anchorRect = anchor?.getBoundingClientRect();

      if (
        anchorRect &&
        anchorRect.width > 0 &&
        anchorRect.height > 0 &&
        (normProgress === 0 || !transitionOriginRef.current)
      ) {
        transitionOriginRef.current = new DOMRect(
          anchorRect.left,
          anchorRect.top,
          anchorRect.width,
          anchorRect.height,
        );
        pinContainer.dataset.transitionSource = JSON.stringify({
          left: anchorRect.left,
          top: anchorRect.top,
          width: anchorRect.width,
          height: anchorRect.height,
        });
      }

      const origin = transitionOriginRef.current;
      if (!origin) {
        clearTransitionStyles(true);
        return;
      }

      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = document.documentElement.clientHeight;
      const startScale = Math.max(
        origin.width / viewportWidth,
        origin.height / viewportHeight,
      );
      const scale = startScale + (1 - startScale) * ease;
      const startClipLeft = Math.max(
        0,
        (viewportWidth * startScale - origin.width) / (2 * startScale),
      );
      // Portrait mobile pages use the top of the live section as the thumbnail
      // crop so its real heading and supporting statement remain visible.
      const isPortraitViewport = viewportHeight > viewportWidth * 1.2;
      const verticalOverflow = Math.max(
        0,
        (viewportHeight * startScale - origin.height) / startScale,
      );
      const startClipTop = isPortraitViewport ? 0 : verticalOverflow / 2;
      const startClipBottom = verticalOverflow - startClipTop;
      const clipLeft = startClipLeft * (1 - ease);
      const clipRight = startClipLeft * (1 - ease);
      const clipTop = startClipTop * (1 - ease);
      const clipBottom = startClipBottom * (1 - ease);
      const visibleLeft = origin.left * (1 - ease);
      const visibleTop = origin.top * (1 - ease);
      const x = visibleLeft - clipLeft * scale;
      const y = visibleTop - clipTop * scale;

      pinContainer.style.position = 'fixed';
      pinContainer.style.top = '0px';
      pinContainer.style.left = '0px';
      pinContainer.style.width = `${viewportWidth}px`;
      pinContainer.style.height = `${viewportHeight}px`;
      pinContainer.style.zIndex = '35';
      pinContainer.style.pointerEvents = normProgress >= 0.99 ? 'auto' : 'none';
      pinContainer.style.opacity = '1';
      pinContainer.style.transformOrigin = '0 0';
      pinContainer.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(5)})`;
      pinContainer.style.clipPath = `inset(${clipTop.toFixed(2)}px ${clipRight.toFixed(2)}px ${clipBottom.toFixed(2)}px ${clipLeft.toFixed(2)}px round ${(18 * (1 - ease) / scale).toFixed(2)}px)`;
      pinContainer.style.borderRadius = '0px';
      pinContainer.style.boxShadow = 'none';
      pinContainer.dataset.transitionProgress = normProgress.toFixed(3);
      pinContainer.dataset.transitionScale = scale.toFixed(5);
      pinContainer.dataset.transitionVisibleBounds = JSON.stringify({
        left: visibleLeft,
        top: visibleTop,
        width: (viewportWidth - clipLeft - clipRight) * scale,
        height: (viewportHeight - clipTop - clipBottom) * scale,
      });
    };

    (window as any).__ostrumUpdateCapabilitiesTransition = updateTransition;

    const onCustomEvent = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail) updateTransition(detail);
    };
    const onWheelTurn = (event: Event) => {
      const { turn, capabilitiesActive } = (event as CustomEvent).detail ?? {};
      const currentProgress = Number(pinContainer.dataset.transitionProgress) || 0;
      updateTransition({
        active: Boolean(capabilitiesActive),
        progress: turn >= 4 ? currentProgress : 0,
      });
    };
    window.addEventListener('ostrum:capabilities-transition', onCustomEvent);
    window.addEventListener('ostrum:works-wheel-turn', onWheelTurn);

    const onResize = () => {
      const progress = Number(pinContainer.dataset.transitionProgress);
      if (Number.isFinite(progress) && pinContainer.style.position === 'fixed') {
        if (progress < 1) transitionOriginRef.current = null;
        updateTransition({ active: true, progress });
      }
    };
    window.addEventListener('resize', onResize);

    return () => {
      delete (window as any).__ostrumUpdateCapabilitiesTransition;
      window.removeEventListener('ostrum:capabilities-transition', onCustomEvent);
      window.removeEventListener('ostrum:works-wheel-turn', onWheelTurn);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Capabilities Horizontal Scroll Timeline
  useEffect(() => {
    const section = sectionRef.current;
    const pinContainer = pinContainerRef.current;
    const track = trackRef.current;
    if (!section || !pinContainer || !track) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // Measure the full track travel and reserve deliberate reading distance for
    // each card-to-card movement. The major Energy Narrative uses about 1,000px
    // per beat (5,000px across five beats); these shorter catalogue reads use a
    // responsive 58–70% of the viewport height, with the real card geometry as
    // a lower bound.
    const getScrollMetrics = () => {
      const horizontalTravel = Math.max(
        0,
        track.scrollWidth - pinContainer.clientWidth,
      );
      const cardCount = track.children.length;
      const steps = Math.max(1, cardCount - 1);
      const isMobile = window.innerWidth < 768;
      const firstCard = track.querySelector<HTMLElement>('[data-testid^="capability-card-"]');
      const cardHeight = firstCard?.getBoundingClientRect().height ?? 0;
      const horizontalStep = horizontalTravel / steps;
      const readingDistancePerStep = Math.max(
        window.innerHeight * (isMobile ? 0.58 : 0.7),
        cardHeight * 1.2,
        horizontalStep * 1.5,
      );

      return {
        horizontalTravel,
        verticalDistance: Math.max(
          horizontalTravel,
          readingDistancePerStep * steps,
        ),
      };
    };

    if (prefersReducedMotion) {
      // Natural horizontal scrolling allowed without scroll-scrub pin
      section.style.marginBottom = '0px';
      track.style.overflowX = 'auto';
      return () => {
        section.style.marginBottom = '';
        track.style.overflowX = '';
      };
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${getScrollMetrics().verticalDistance}`,
        pin: pinContainer,
        pinSpacing: true,
        scrub: 0.6,
        anticipatePin: 1,
        id: 'capabilities-pin',
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const { horizontalTravel } = getScrollMetrics();
          gsap.set(track, { x: -self.progress * horizontalTravel });
        },
        onLeave: () => {
          const { horizontalTravel } = getScrollMetrics();
          gsap.set(track, { x: -horizontalTravel });
          clearTransitionStyles(false);
          section.style.backgroundColor = 'transparent';
        },
        onEnterBack: () => {
          section.style.backgroundColor = '#FFFFFF';
          (window as any).__ostrumUpdateCapabilitiesTransition?.({
            active: true,
            progress: 1,
          });
        },
        onLeaveBack: () => {
          section.style.backgroundColor = '#FFFFFF';
          gsap.set(track, { x: 0 });
          const wheelTrigger = ScrollTrigger.getById('works-wheel-pin');
          if (wheelTrigger) {
            wheelTrigger.update();
          }
        },
      });
    });

    ScrollTrigger.sort();
    ScrollTrigger.refresh();

    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="capabilities"
      ref={sectionRef}
      data-testid="capabilities-section"
      className="relative z-[24] w-full min-h-screen bg-white select-none mb-[-100svh]"
      style={{
        backgroundColor: '#FFFFFF',
      }}
      aria-label="Our Capabilities"
    >
      {/* Canonical Stage Container with subtle top wash */}
      <div
        ref={pinContainerRef}
        data-testid="capabilities-pin-container"
        className="w-full h-screen h-[100svh] min-h-screen min-h-[100svh] relative flex flex-col justify-between overflow-hidden pt-20 pb-6 sm:pt-20 sm:pb-10 md:pt-24 md:pb-12 bg-white"
        style={{
          background:
            'linear-gradient(180deg, rgba(191,235,247,0.48) 0%, rgba(255,255,255,0.94) 13%, #FFFFFF 26%)',
        }}
      >
        {/* Soft edge fades on both left and right edges */}
        <div
          data-testid="capabilities-edge-fade-left"
          className="pointer-events-none absolute top-0 bottom-0 left-0 w-12 sm:w-24 md:w-36 z-30"
          style={{
            background:
              'linear-gradient(to right, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%)',
          }}
          aria-hidden="true"
        />
        <div
          data-testid="capabilities-edge-fade-right"
          className="pointer-events-none absolute top-0 bottom-0 right-0 w-12 sm:w-24 md:w-36 z-30"
          style={{
            background:
              'linear-gradient(to left, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%)',
          }}
          aria-hidden="true"
        />

        {/* Editorial Section Header (Canonical instance, zero CTA inside Capabilities) */}
        <header className="w-full px-6 sm:px-12 md:px-16 lg:px-20 z-20 shrink-0">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-8">
            <div>
              <h2
                data-testid="capabilities-heading"
                className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#0B0B10]"
              >
                Our Capabilities
              </h2>
            </div>
            <p
              data-testid="capabilities-supporting-statement"
              className="font-sans text-sm sm:text-base md:text-lg text-[#0B0B10]/70 max-w-[48ch] sm:max-w-[54ch] leading-relaxed"
            >
              We design and engineer the systems that move businesses forward—from
              digital experiences and intelligent software to connected hardware
              built around real-world needs.
            </p>
          </div>
        </header>

        {/* Horizontal Scroll Catalogue Track (Canonical 6 service cards) */}
        <div className="relative w-full z-10 flex items-center overflow-visible my-auto py-2">
          <div
            ref={trackRef}
            data-testid="capabilities-track"
            className="flex items-stretch gap-6 sm:gap-7 md:gap-8 pl-6 sm:pl-12 md:pl-16 lg:pl-20 pr-12 sm:pr-20 md:pr-28 will-change-transform"
          >
            {CAPABILITIES_DATA.map((card) => (
              <article
                key={card.index}
                data-testid={`capability-card-${card.variant}`}
                className="relative shrink-0 w-[300px] sm:w-[340px] md:w-[360px] h-[450px] sm:h-[480px] md:h-[510px] rounded-[24px] p-6 sm:p-7 flex flex-col justify-between shadow-[0_20px_50px_-15px_rgba(11,11,16,0.08)] border border-black/[0.06] transition-transform duration-300 hover:-translate-y-1.5"
                style={{
                  background: card.gradient,
                }}
              >
                {/* Card Header: Index & Category Marker */}
                <div className="flex items-center justify-between w-full shrink-0">
                  <span className="font-mono text-xs sm:text-sm font-bold tracking-wider text-black/55">
                    {card.index}
                  </span>
                  <div
                    className="w-2 h-2 rounded-full bg-black/30"
                    aria-hidden="true"
                  />
                </div>

                {/* 3D Dimensional Accent Viewport */}
                <div className="relative w-full h-[180px] sm:h-[200px] md:h-[210px] my-auto flex items-center justify-center">
                  <Card3DAccent variant={card.variant} />
                </div>

                {/* Card Content: Title, Description, Tags (Strictly NO CTA) */}
                <div className="flex flex-col shrink-0 mt-auto">
                  <h3 className="font-sans text-lg sm:text-xl font-bold tracking-tight text-[#0B0B10] leading-tight mb-2">
                    {card.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-black/75 leading-relaxed mb-4 line-clamp-3">
                    {card.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium text-black/80 bg-white/60 backdrop-blur-sm border border-black/[0.06]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Minimal Bottom Baseline / Status bar */}
        <div className="w-full px-6 sm:px-12 md:px-16 lg:px-20 z-20 shrink-0">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between text-xs font-mono text-black/40">
            <span>01 / 06 — 06 / 06</span>
            <span className="tracking-widest uppercase">
              SCROLL TO EXPLORE →
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OstrumCapabilitiesSection;
