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
  { rotation: 2.4, scale: 0.98, y: 8, zIndex: 28, opacity: 1 },
  { rotation: -2.6, scale: 0.96, y: 16, zIndex: 26, opacity: 1 },
  { rotation: 1.8, scale: 0.94, y: 24, zIndex: 24, opacity: 1 },
  { rotation: -2.0, scale: 0.92, y: 32, zIndex: 22, opacity: 1 },
  { rotation: 2.2, scale: 0.9, y: 40, zIndex: 20, opacity: 1 },
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

    // Scroll travel: 500px per card transition + 500px for final resolved state
    const cardStepDistance = window.innerWidth < 768 ? 380 : 500;
    const finalHoldDistance = window.innerWidth < 768 ? 400 : 500;
    const scrollDistance = (cards.length - 1) * cardStepDistance + finalHoldDistance;

    section.style.height = `${window.innerHeight + scrollDistance}px`;

    const ctx = gsap.context(() => {
      // Set initial card states
      cards.forEach((card, index) => {
        const config = STACK_CONFIGS[index] || {
          rotation: 0,
          scale: 0.9,
          y: 40,
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
      // Cards cycle across 0.0 to 0.88, leaving the resolved heading unobstructed at the end
      const totalSteps = cards.length;
      const stepDuration = 0.88 / totalSteps;
      const holdRatio = 0.3; // 30% reading hold
      const exitRatio = 0.7; // 70% lift-and-exit motion

      // Animate card exits sequentially
      cards.forEach((card, i) => {
        const stepStart = i * stepDuration;
        const exitStart = stepStart + stepDuration * holdRatio;
        const exitDuration = stepDuration * exitRatio;
        const exitAngle = i % 2 === 0 ? -6.5 : 6.5;

        // Card i translates upward out of view
        tl.to(
          card,
          {
            y: -window.innerHeight * 1.05,
            rotation: exitAngle,
            scale: 0.94,
            duration: exitDuration,
            ease: 'power1.inOut',
          },
          exitStart,
        );

        // Opacity stays 1.0 for the first 50% of travel (covering background cards), then fades out cleanly
        tl.fromTo(
          card,
          { opacity: 1 },
          {
            opacity: 0,
            duration: exitDuration * 0.5,
            ease: 'power1.in',
          },
          exitStart + exitDuration * 0.5,
        );

        // When card i exits, all subsequent cards step upward in the stack to their new target positions
        for (let j = i + 1; j < cards.length; j++) {
          const targetConfigIndex = j - (i + 1);
          const targetConfig = STACK_CONFIGS[targetConfigIndex] || {
            rotation: 0,
            scale: 0.9,
            y: 40,
            zIndex: 10,
            opacity: 1,
          };

          tl.to(
            cards[j],
            {
              rotation: targetConfig.rotation,
              scale: targetConfig.scale,
              y: targetConfig.y,
              zIndex: targetConfig.zIndex,
              opacity: 1,
              duration: exitDuration * 0.9,
              ease: 'power2.out',
            },
            exitStart,
          );
        }
      });
    }, section);

    ScrollTrigger.sort();
    ScrollTrigger.refresh();

    const handleResize = () => {
      const updatedDistance =
        (cards.length - 1) * (window.innerWidth < 768 ? 380 : 500) +
        (window.innerWidth < 768 ? 400 : 500);
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

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      data-testid="testimonials-section"
      className="relative z-[26] w-full bg-white select-none overflow-visible"
      style={{ backgroundColor: '#FFFFFF' }}
      aria-label="Testimonials"
    >
      {/* Target anchor for smooth navigation */}
      <div id="contact" className="absolute -top-10 left-0 w-full h-1 pointer-events-none" />

      {/* Pinned / Sticky Stage Container */}
      <div
        ref={stageRef}
        data-testid="testimonials-stage"
        className="sticky top-0 w-full h-screen h-[100svh] min-h-screen overflow-hidden bg-white flex flex-col items-center justify-center relative px-4 sm:px-8"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        {/* Enormous Condensed Monumental Heading (Background layer: z-10) */}
        <div
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none px-2 sm:px-4 md:px-6 overflow-hidden"
          aria-hidden="true"
        >
          <h2
            ref={headingRef}
            data-testid="testimonials-heading"
            className="font-condensed font-bold uppercase text-black text-center select-none w-full whitespace-nowrap tracking-[-0.015em]"
            style={{
              fontSize: 'clamp(3.2rem, 18.2vw, 352px)',
              lineHeight: '0.84',
              color: '#000000',
            }}
          >
            TESTIMONIALS
          </h2>
        </div>

        {/* Foreground Testimonial Card Stack (Layer: z-20 to z-30) */}
        <div
          data-testid="testimonials-card-stack"
          className="relative z-20 w-full max-w-[510px] flex items-center justify-center h-[410px] sm:h-[430px] md:h-[440px]"
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
              className="absolute inset-0 flex flex-col justify-between rounded-[6px] p-8 sm:p-10 md:p-12 text-black select-text cursor-default will-change-transform"
              style={{
                backgroundColor: '#F7F7F7',
                boxShadow:
                  index === 0
                    ? '0 16px 36px -6px rgba(0, 0, 0, 0.08), 0 6px 14px -3px rgba(0, 0, 0, 0.04)'
                    : '0 10px 24px -4px rgba(0, 0, 0, 0.06), 0 4px 8px -2px rgba(0, 0, 0, 0.03)',
                transformOrigin: '50% 120%',
              }}
            >
              {/* Element 1 (Top Area): Authentic Client Logo */}
              <div className="h-14 sm:h-16 flex items-center justify-center text-center select-none shrink-0">
                {testimonial.logoSrc ? (
                  <Image
                    src={testimonial.logoSrc}
                    alt={testimonial.logoAlt || testimonial.clientName}
                    width={220}
                    height={56}
                    priority={index === 0}
                    className="max-h-11 sm:max-h-12 w-auto object-contain"
                  />
                ) : (
                  <span className="font-mono text-xs sm:text-[13px] uppercase tracking-[0.2em] font-semibold text-black/75">
                    {testimonial.clientName}
                  </span>
                )}
              </div>

              {/* Element 2 (Main Area): Testimonial Quotation */}
              <div className="my-auto flex items-center justify-center py-2 text-center px-1 sm:px-3">
                <p className="font-sans text-[17px] sm:text-[19px] md:text-[21px] font-normal leading-[1.48] text-[#141414] tracking-[-0.01em]">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </div>

              {/* Structural balance spacer: ensures quote remains beautifully centered vertically */}
              <div className="h-4 shrink-0 pointer-events-none" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default OstrumTestimonialsSection;
