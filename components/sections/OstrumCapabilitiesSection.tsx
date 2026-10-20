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
  artwork: string;
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
    artwork: '/images/capabilities/digital-experiences.png',
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
    artwork: '/images/capabilities/ai-systems-and-agents.png',
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
    artwork: '/images/capabilities/business-platforms.png',
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
    artwork: '/images/capabilities/software-product-engineering.png',
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
    artwork: '/images/capabilities/hardware-connected-technology.png',
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
    artwork: '/images/capabilities/custom-engineering.png',
  },
];

export function OstrumCapabilitiesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const transitionOriginRef = useRef<DOMRect | null>(null);

  const clearTransitionStyles = (hide: boolean) => {
    const pinContainer = pinContainerRef.current;
    if (sectionRef.current) {
      sectionRef.current.style.backgroundColor = hide ? 'transparent' : '#FFFFFF';
    }
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
    pinContainer.style.filter = '';
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
      opacity = 1,
    }: {
      active: boolean;
      progress?: number;
      opacity?: number;
    }) => {
      if (!pinContainer) return;

      if (!active) {
        clearTransitionStyles(true);
        return;
      }

      const normProgress = Math.min(1, Math.max(0, progress));
      if (normProgress >= 1) {
        if (sectionRef.current) {
          const rect = sectionRef.current.getBoundingClientRect();
          if (rect.bottom <= 0) {
            // Already scrolled past capabilities into lower sections; do not apply fixed overlay
            clearTransitionStyles(false);
            return;
          }
          sectionRef.current.style.backgroundColor = '#FFFFFF';
        }
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
        pinContainer.style.filter = 'none';
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

      if (sectionRef.current) {
        sectionRef.current.style.backgroundColor = 'transparent';
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
      pinContainer.style.opacity = String(opacity);
      pinContainer.style.transformOrigin = '0 0';
      pinContainer.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(5)})`;
      pinContainer.style.clipPath = `inset(${clipTop.toFixed(2)}px ${clipRight.toFixed(2)}px ${clipBottom.toFixed(2)}px ${clipLeft.toFixed(2)}px round ${(18 * (1 - ease) / scale).toFixed(2)}px)`;
      pinContainer.style.borderRadius = '0px';
      pinContainer.style.boxShadow = 'none';
      pinContainer.style.filter =
        ease >= 0.98
          ? 'none'
          : `drop-shadow(0px ${(20 * (1 - ease)).toFixed(1)}px ${(40 * (1 - ease)).toFixed(1)}px rgba(0,0,0,${(0.35 * (1 - ease) * opacity).toFixed(3)}))`;
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
    window.addEventListener('ostrum:capabilities-transition', onCustomEvent);

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
      section.style.backgroundColor = '#FFFFFF';
      track.style.overflowX = 'auto';
      return () => {
        section.style.marginBottom = '';
        track.style.overflowX = '';
      };
    }

    let scrollMetrics = getScrollMetrics();

    const setSectionScrollHeight = () => {
      scrollMetrics = getScrollMetrics();
      section.style.height = `${window.innerHeight + scrollMetrics.verticalDistance}px`;
      return scrollMetrics;
    };

    setSectionScrollHeight();

    const emitVisualCoverage = (covered: boolean) => {
      window.dispatchEvent(
        new CustomEvent('ostrum:visual-coverage', {
          detail: { id: 'capabilities', covered },
        }),
      );
    };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${setSectionScrollHeight().verticalDistance}`,
        scrub: 0.6,
        anticipatePin: 1,
        id: 'capabilities-pin',
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          gsap.set(track, { x: -self.progress * scrollMetrics.horizontalTravel });
        },
        onToggle: (self) => {
          emitVisualCoverage(self.isActive);
        },
        onEnter: () => {
          clearTransitionStyles(false);
          if (section) section.style.backgroundColor = '#FFFFFF';
        },
        onLeave: () => {
          gsap.set(track, { x: -scrollMetrics.horizontalTravel });
          clearTransitionStyles(false);
          if (section) section.style.backgroundColor = '#FFFFFF';
        },
        onEnterBack: () => {
          clearTransitionStyles(false);
          if (section) section.style.backgroundColor = '#FFFFFF';
        },
        onLeaveBack: () => {
          if (section) section.style.backgroundColor = 'transparent';
          gsap.set(track, { x: 0 });
          clearTransitionStyles(true);
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
      setSectionScrollHeight();
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      section.style.height = '';
      emitVisualCoverage(false);
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="capabilities"
      ref={sectionRef}
      data-testid="capabilities-section"
      className="relative z-[35] w-full min-h-screen select-none"
      style={{
        backgroundColor: 'transparent',
      }}
      aria-label="Our Capabilities"
    >
      {/* Canonical Stage Container with pure white surface */}
      <div
        ref={pinContainerRef}
        data-testid="capabilities-pin-container"
        className="capabilities-stage sticky top-0 w-full h-screen h-[100svh] min-h-screen min-h-[100svh] relative flex flex-col justify-between overflow-hidden pt-12 sm:pt-14 md:pt-16 pb-3 sm:pb-5 bg-[#FFFFFF]"
        style={{
          backgroundColor: '#FFFFFF',
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
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-start justify-between gap-6 md:gap-10">
            <div>
              <h2
                data-testid="capabilities-heading"
                className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#0B0B10] leading-none"
              >
                Our Capabilities
              </h2>
            </div>
            <p
              data-testid="capabilities-supporting-statement"
              className="font-sans text-sm sm:text-base md:text-base lg:text-lg text-[#0B0B10]/75 max-w-[46ch] sm:max-w-[50ch] md:max-w-[52ch] leading-relaxed"
            >
              OSTRUM designs and develops digital experiences, AI systems, custom software, business platforms, and connected hardware that help businesses improve customer experiences, streamline operations, and grow.
            </p>
          </div>
        </header>

        {/* Horizontal Scroll Catalogue Track (Canonical 6 service cards) */}
        <div className="relative w-full z-10 flex items-center overflow-visible my-auto py-1">
          <div
            ref={trackRef}
            data-testid="capabilities-track"
            className="flex items-stretch gap-6 sm:gap-7 md:gap-8 pl-6 sm:pl-12 md:pl-16 lg:pl-20 pr-12 sm:pr-20 md:pr-28 will-change-transform"
          >
            {CAPABILITIES_DATA.map((card) => (
              <article
                key={card.index}
                data-testid={`capability-card-${card.variant}`}
                tabIndex={0}
                className="capability-card group relative shrink-0 w-[310px] sm:w-[340px] md:w-[365px] lg:w-[388px] h-[450px] sm:h-[475px] md:h-[490px] rounded-[24px] p-5 sm:p-6 md:p-6 flex flex-col justify-between shadow-[0_16px_36px_-12px_rgba(11,11,16,0.08)] border border-black/[0.06] transition-[transform,box-shadow] duration-200 ease-out outline-none"
                style={{
                  background: card.gradient,
                }}
              >
                {/* Card Header: Index & Category Marker */}
                <div className="flex items-center justify-between w-full shrink-0 h-5 sm:h-6">
                  <span className="font-mono text-xs sm:text-sm font-bold tracking-wider text-black/55">
                    {card.index}
                  </span>
                  <div
                    className="w-2 h-2 rounded-full bg-black/30"
                    aria-hidden="true"
                  />
                </div>

                {/* 3D Dimensional Accent Viewport (Consistent Upper-Middle Frame) */}
                <div className="capability-art-frame relative w-full h-[160px] sm:h-[172px] md:h-[180px] shrink-0 my-1 flex items-center justify-center overflow-hidden">
                  <Card3DAccent
                    variant={card.variant}
                    data-testid={`capability-artwork-${card.variant}`}
                    className="capability-artwork size-full"
                  />
                </div>

                {/* Card Content: Title, Description, Tags (Consistent Anchor) */}
                <div className="flex-1 flex flex-col justify-between min-h-0 pt-1">
                  <div>
                    <h3 className="font-sans text-lg sm:text-xl font-bold tracking-tight text-[#0B0B10] leading-tight min-h-[42px] sm:min-h-[46px] flex items-start">
                      {card.title}
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-black/75 leading-relaxed mt-1 line-clamp-3">
                      {card.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2 mt-auto">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-medium text-black/80 bg-white/60 backdrop-blur-sm border border-black/[0.06]"
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

        {/* Dedicated Reserved Footer Strip / Status bar (Always clear and visible, never overlapped) */}
        <div
          data-testid="capabilities-footer-strip"
          className="w-full px-6 sm:px-12 md:px-16 lg:px-20 z-20 shrink-0 pb-2 pt-2"
        >
          <div className="max-w-[1440px] mx-auto flex items-center justify-end text-xs font-mono font-medium text-[#36312F]">
            <span
              data-testid="capabilities-scroll-cue"
              className="tracking-widest uppercase font-semibold text-[#36312F]"
            >
              SCROLL TO EXPLORE →
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OstrumCapabilitiesSection;
