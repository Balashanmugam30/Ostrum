'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Testimonial } from '@/types/testimonials';
import { TESTIMONIALS_DATA } from '@/data/testimonials';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Initial rest stack configurations for natural physical paper layers
const STACK_CONFIGS = [
  { rotation: -1.8, scale: 1.0, y: 0, zIndex: 30, opacity: 1 },
  { rotation: 2.4, scale: 0.97, y: 10, zIndex: 20, opacity: 1 },
  { rotation: -2.6, scale: 0.94, y: 20, zIndex: 10, opacity: 1 },
];

export interface OstrumTestimonialsSectionProps {
  items?: Testimonial[];
}

export function OstrumTestimonialsSection({
  items = TESTIMONIALS_DATA,
}: OstrumTestimonialsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const listener = (event: MediaQueryListEvent) => {
        setPrefersReducedMotion(event.matches);
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // Set up scroll choreography
  useEffect(() => {
    if (prefersReducedMotion) return;

    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (cards.length === 0) return;

    // Scroll travel: 520px per card transition + 550px for final resolved state
    const cardStepDistance = window.innerWidth < 768 ? 400 : 520;
    const finalHoldDistance = window.innerWidth < 768 ? 450 : 550;
    const scrollDistance = (cards.length - 1) * cardStepDistance + finalHoldDistance;

    section.style.height = `${window.innerHeight + scrollDistance}px`;

    const ctx = gsap.context(() => {
      // Set initial card states
      cards.forEach((card, index) => {
        const config = STACK_CONFIGS[index] || {
          rotation: 0,
          scale: 0.94,
          y: 20,
          zIndex: 10,
          opacity: 1,
        };
        gsap.set(card, {
          rotation: config.rotation,
          scale: config.scale,
          y: config.y,
          zIndex: config.zIndex,
          opacity: config.opacity,
          transformOrigin: '50% 120%',
        });
      });

      // Master scroll timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${scrollDistance}`,
          scrub: 0.6,
          invalidateOnRefresh: true,
          id: 'testimonials-timeline',
        },
      });

      // Total timeline normalized duration: 1.0
      // Cards cycle sequentially across 0.0 to 0.88, leaving the resolved heading unobstructed at the end
      const totalSteps = cards.length;
      const stepDuration = 0.88 / totalSteps;
      const holdRatio = 0.28; // 28% reading pause
      const exitRatio = 0.72; // 72% lift-and-exit motion

      // Animate card exits sequentially
      cards.forEach((card, i) => {
        const stepStart = i * stepDuration;
        const exitStart = stepStart + stepDuration * holdRatio;
        const exitDuration = stepDuration * exitRatio;
        const exitAngle = i % 2 === 0 ? -6.5 : 6.5;

        // 1. Immediately elevate outgoing card to zIndex: 40 so it stays firmly in front
        tl.set(card, { zIndex: 40 }, exitStart);

        // 2. Outgoing card translates upward out of view
        tl.to(
          card,
          {
            y: -window.innerHeight * 1.08,
            rotation: exitAngle,
            scale: 0.94,
            duration: exitDuration,
            ease: 'power1.inOut',
          },
          exitStart,
        );

        // 3. Opacity stays 1.0 for the first 55% of travel (guaranteeing it masks behind cards),
        // then fades out cleanly in the upper third of the screen
        tl.to(
          card,
          {
            opacity: 0,
            duration: exitDuration * 0.45,
            ease: 'power1.in',
          },
          exitStart + exitDuration * 0.55,
        );

        // 4. Drop outgoing card's zIndex once it has completely cleared the viewport and faded out
        tl.set(card, { zIndex: 0 }, exitStart + exitDuration);

        // 5. When card i exits, subsequent cards step up in the stack beneath card i
        for (let j = i + 1; j < cards.length; j++) {
          const targetConfigIndex = j - (i + 1);
          const targetConfig = STACK_CONFIGS[targetConfigIndex] || {
            rotation: 0,
            scale: 0.94,
            y: 20,
            zIndex: 10,
            opacity: 1,
          };

          // Step up geometry
          tl.to(
            cards[j],
            {
              rotation: targetConfig.rotation,
              scale: targetConfig.scale,
              y: targetConfig.y,
              duration: exitDuration * 0.95,
              ease: 'power2.out',
            },
            exitStart,
          );

          // Crucial stacking fix: cards[j] keeps its current lower zIndex while card i is exiting!
          // Only after card i has completely exited and vanished (at exitStart + exitDuration)
          // does cards[i + 1] take foreground priority zIndex: 30
          if (j === i + 1) {
            tl.set(cards[j], { zIndex: 30 }, exitStart + exitDuration);
          }
        }
      });

      // 6. Hold the final resolved state with the unobstructed heading (0.88 to 1.00)
      tl.to({}, { duration: 0.12 }, 0.88);
    }, section);

    ScrollTrigger.sort();
    ScrollTrigger.refresh();

    const handleResize = () => {
      const updatedDistance =
        (cards.length - 1) * (window.innerWidth < 768 ? 400 : 520) +
        (window.innerWidth < 768 ? 450 : 550);
      section.style.height = `${window.innerHeight + updatedDistance}px`;
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      section.style.height = '';
      ctx.revert();
    };
  }, [items, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <section
        id="testimonials"
        data-testid="testimonials-section"
        className="relative z-[26] w-full bg-white py-24 px-4 sm:px-8 select-text"
        style={{ backgroundColor: '#FFFFFF' }}
        aria-label="Testimonials"
      >
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <h2
            data-testid="testimonials-heading"
            className="font-condensed font-bold uppercase text-black text-center mb-16 tracking-[-0.01em]"
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 96px)',
              lineHeight: '0.85',
            }}
          >
            TESTIMONIALS
          </h2>

          <div className="w-full max-w-[480px] flex flex-col gap-8">
            {items.map((testimonial, index) => (
              <div
                key={testimonial.id}
                data-testid={`testimonial-card-${index}`}
                data-card-index={index}
                data-client={testimonial.clientName}
                data-placeholder={testimonial.isPlaceholder}
                data-approved={testimonial.approved}
                className="w-full rounded-[4px] p-6 sm:p-8 text-black"
                style={{
                  backgroundColor: index % 2 === 1 ? '#EEEEEE' : '#FFFFFF',
                  boxShadow:
                    index === 0
                      ? '0 16px 36px -6px rgba(0, 0, 0, 0.08), 0 6px 14px -3px rgba(0, 0, 0, 0.04)'
                      : '0 10px 24px -4px rgba(0, 0, 0, 0.06), 0 4px 8px -2px rgba(0, 0, 0, 0.03)',
                }}
              >
                {/* Logo Area */}
                <div className="h-10 sm:h-12 flex items-center justify-center text-center select-none mb-5">
                  {testimonial.logoType === 'mnesa-mark' ? (
                    <div
                      data-testid="mnesa-blue-m-mark"
                      className="flex items-center justify-center h-10 w-10"
                      aria-label="MNESA Mark"
                    >
                      <span
                        className="font-bold text-[#1E5BF0] select-none leading-none tracking-tight"
                        style={{
                          fontSize: '38px',
                          fontFamily: 'var(--font-oswald), "Barlow Condensed", sans-serif',
                          fontWeight: 900,
                          color: '#1E5BF0',
                        }}
                      >
                        M
                      </span>
                    </div>
                  ) : testimonial.logoSrc ? (
                    <Image
                      src={testimonial.logoSrc}
                      alt={testimonial.logoAlt || testimonial.clientName}
                      width={200}
                      height={48}
                      className="max-h-9 sm:max-h-10 w-auto object-contain"
                    />
                  ) : (
                    <span className="font-mono text-xs sm:text-[13px] uppercase tracking-[0.2em] font-semibold text-black/75">
                      {testimonial.clientName}
                    </span>
                  )}
                </div>

                {/* Quotation Area */}
                <div className="py-2 text-center px-1 sm:px-2">
                  <p
                    data-testid="testimonial-quote-text"
                    className="font-sans text-[16px] sm:text-[18px] md:text-[19.5px] lg:text-[20px] font-normal leading-[1.42] text-[#111111] tracking-[-0.015em]"
                  >
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      data-testid="testimonials-section"
      className="relative z-[26] w-full bg-white select-none overflow-visible"
      style={{ backgroundColor: '#FFFFFF' }}
      aria-label="Testimonials"
    >
      {/* Pinned / Sticky Stage Container */}
      <div
        ref={stageRef}
        data-testid="testimonials-stage"
        className="sticky top-0 w-full h-screen h-[100svh] min-h-screen overflow-hidden bg-white flex flex-col items-center justify-center relative px-4 sm:px-8"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        {/* Enormous Condensed Monumental Heading (Background layer: z-10) */}
        <div
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none px-6 sm:px-10 md:px-16 lg:px-[5vw] overflow-hidden"
          aria-hidden="true"
        >
          <h2
            ref={headingRef}
            data-testid="testimonials-heading"
            className="font-condensed font-bold uppercase text-black text-center select-none w-full whitespace-nowrap tracking-[-0.01em]"
            style={{
              fontSize: 'clamp(3.2rem, 26vw, 395px)',
              lineHeight: '0.85',
              color: '#000000',
            }}
          >
            TESTIMONIALS
          </h2>
        </div>

        {/* Foreground Testimonial Card Stack (Layer: z-20 to z-30) */}
        <div
          data-testid="testimonials-card-stack"
          className="relative z-20 w-full max-w-[440px] sm:max-w-[465px] md:max-w-[480px] flex items-center justify-center h-[310px] sm:h-[330px] md:h-[345px]"
        >
          {items.map((testimonial, index) => (
            <div
              key={testimonial.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              data-testid={`testimonial-card-${index}`}
              data-card-index={index}
              data-client={testimonial.clientName}
              data-placeholder={testimonial.isPlaceholder}
              data-approved={testimonial.approved}
              className="absolute inset-0 flex flex-col justify-between rounded-[4px] p-6 sm:p-7 md:p-8 text-black select-text cursor-default will-change-transform"
              style={{
                backgroundColor: index % 2 === 1 ? '#EEEEEE' : '#FFFFFF',
                boxShadow:
                  index === 0
                    ? '0 16px 36px -6px rgba(0, 0, 0, 0.08), 0 6px 14px -3px rgba(0, 0, 0, 0.04)'
                    : '0 10px 24px -4px rgba(0, 0, 0, 0.06), 0 4px 8px -2px rgba(0, 0, 0, 0.03)',
                transformOrigin: '50% 120%',
              }}
            >
              {/* Element 1 (Top Area): Authentic Client Logo or MNESA Mark */}
              <div className="h-10 sm:h-12 flex items-center justify-center text-center select-none shrink-0">
                {testimonial.logoType === 'mnesa-mark' ? (
                  <div
                    data-testid="mnesa-blue-m-mark"
                    className="flex items-center justify-center h-10 w-10"
                    aria-label="MNESA Mark"
                  >
                    <span
                      className="font-bold text-[#1E5BF0] select-none leading-none tracking-tight"
                      style={{
                        fontSize: '38px',
                        fontFamily: 'var(--font-oswald), "Barlow Condensed", sans-serif',
                        fontWeight: 900,
                        color: '#1E5BF0',
                      }}
                    >
                      M
                    </span>
                  </div>
                ) : testimonial.logoSrc ? (
                  <Image
                    src={testimonial.logoSrc}
                    alt={testimonial.logoAlt || testimonial.clientName}
                    width={200}
                    height={48}
                    priority={index === 0}
                    className="max-h-9 sm:max-h-10 w-auto object-contain"
                  />
                ) : (
                  <span className="font-mono text-xs sm:text-[13px] uppercase tracking-[0.2em] font-semibold text-black/75">
                    {testimonial.clientName}
                  </span>
                )}
              </div>

              {/* Element 2 (Main Area): Testimonial Quotation */}
              <div className="my-auto flex items-center justify-center py-1 sm:py-2 text-center px-1 sm:px-2">
                <p
                  data-testid="testimonial-quote-text"
                  className="font-sans text-[16px] sm:text-[18px] md:text-[19.5px] lg:text-[20px] font-normal leading-[1.42] text-[#111111] tracking-[-0.015em]"
                >
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </div>

              {/* Structural balance spacer: ensures quote remains beautifully centered vertically */}
              <div className="h-1 sm:h-2 shrink-0 pointer-events-none" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default OstrumTestimonialsSection;
