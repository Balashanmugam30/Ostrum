'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Testimonial } from '@/types/testimonials';
import { TESTIMONIALS_DATA } from '@/data/testimonials';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Client emblem / logo vector representations
function ClientEmblem({ id }: { id: string }) {
  switch (id) {
    case 'tmr-ai-car-care':
      return (
        <svg
          className="w-8 h-8 text-black"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M16 3L5 8.5V16.5C5 23.2 9.7 29.4 16 31C22.3 29.4 27 23.2 27 16.5V8.5L16 3Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11 17L14.5 20.5L21 13"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="10" r="1.5" fill="currentColor" />
        </svg>
      );
    case 'saraswati-driving-school':
      return (
        <svg
          className="w-8 h-8 text-black"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.75" />
          <path
            d="M16 3V16M16 16L7 24M16 16L25 24"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <circle cx="16" cy="16" r="3.5" stroke="currentColor" strokeWidth="1.75" />
        </svg>
      );
    case 'sample-client-03':
      return (
        <svg
          className="w-8 h-8 text-black"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="6" y="6" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.75" />
          <path d="M6 16H26M16 6V26" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="2" fill="currentColor" />
        </svg>
      );
    case 'sample-client-04':
      return (
        <svg
          className="w-8 h-8 text-black"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M4 16C7 10 11 10 16 16C21 22 25 22 28 16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      );
    case 'sample-client-05':
      return (
        <svg
          className="w-8 h-8 text-black"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <polygon
            points="16,4 28,26 4,26"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'sample-client-06':
    default:
      return (
        <svg
          className="w-8 h-8 text-black"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.75" />
          <path
            d="M10 16C10 12.7 12.7 10 16 10C19.3 10 22 12.7 22 16C22 19.3 19.3 22 16 22"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <circle cx="16" cy="16" r="2.5" fill="currentColor" />
        </svg>
      );
  }
}

// Initial rest stack configurations for natural physical paper layers (fully opaque paper sheets)
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
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check reduced motion
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

    // Scroll travel: 500px per card transition + 600px for final resolved state
    const cardStepDistance = window.innerWidth < 768 ? 400 : 520;
    const finalHoldDistance = window.innerWidth < 768 ? 450 : 600;
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
      // Cards cycle: from 0 to cards.length - 1 across 0.0 to 0.84, followed by resolved state
      const totalSteps = cards.length;
      const stepDuration = 0.84 / totalSteps;
      const holdRatio = 0.3; // 30% of each step is a stable reading hold
      const exitRatio = 0.7; // 70% of each step is the smooth lift-and-exit motion

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

      // Final resolved state: cards are all gone, heading is completely visible
      // Button subtly lifts and stays prominent
      if (buttonRef.current) {
        tl.fromTo(
          buttonRef.current,
          { scale: 0.96, opacity: 0.85, y: 4 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.12,
            ease: 'power1.out',
          },
          0.85,
        );
      }
    }, section);

    ScrollTrigger.sort();
    ScrollTrigger.refresh();

    const handleResize = () => {
      const updatedDistance =
        (cards.length - 1) * (window.innerWidth < 768 ? 400 : 520) +
        (window.innerWidth < 768 ? 450 : 600);
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
        {/* Enormous Monumental Heading (Background layer: z-10) */}
        <div
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none px-2 sm:px-6 overflow-hidden"
          aria-hidden="true"
        >
          <h2
            ref={headingRef}
            data-testid="testimonials-heading"
            className="font-sans font-black tracking-[-0.04em] uppercase text-black leading-none text-center select-none w-full"
            style={{
              fontSize: 'clamp(2.5rem, 12.4vw, 15.5rem)',
              letterSpacing: '-0.045em',
            }}
          >
            TESTIMONIALS
          </h2>
        </div>

        {/* Foreground Testimonial Card Stack (Layer: z-20 to z-30) */}
        <div
          data-testid="testimonials-card-stack"
          className="relative z-20 w-full max-w-[540px] flex items-center justify-center h-[420px] sm:h-[450px] md:h-[470px]"
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
              className="absolute inset-0 flex flex-col justify-between rounded-2xl bg-white p-7 sm:p-9 md:p-11 text-black select-text cursor-default will-change-transform"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow:
                  '0 24px 60px -12px rgba(0, 0, 0, 0.13), 0 10px 24px -6px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04)',
                transformOrigin: '50% 120%',
              }}
            >
              {/* Card Header: Client Emblem & Stylized Wordmark */}
              <div className="flex flex-col items-center justify-center text-center gap-2 select-none shrink-0">
                <ClientEmblem id={testimonial.id} />
                <span className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.2em] font-semibold text-black/85">
                  {testimonial.logoText}
                </span>
                {testimonial.subtext && (
                  <span className="font-mono text-[9px] uppercase tracking-wider text-black/40">
                    {testimonial.subtext}
                  </span>
                )}
              </div>

              {/* Card Body: Quotation */}
              <div className="my-auto flex items-center justify-center py-2 text-center">
                <p className="font-sans text-sm sm:text-base md:text-[17px] font-normal leading-[1.48] text-[#181818] tracking-[-0.01em]">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </div>

              {/* Card Footer: Metadata and Sequence Counter */}
              <div className="flex items-center justify-between border-t border-black/[0.06] pt-3 text-[10px] sm:text-[11px] font-mono text-black/45 select-none shrink-0">
                <span className="uppercase tracking-wider">
                  {testimonial.clientName}
                </span>
                <span>
                  0{index + 1} / 0{items.length}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Outlined Pill CTA Button (Layer: z-25) */}
        <div className="relative z-25 mt-8 sm:mt-10 md:mt-12">
          <a
            ref={buttonRef}
            href="#contact"
            data-testid="testimonials-cta-button"
            className="group inline-flex items-center gap-3 px-7 py-3 sm:px-8 sm:py-3.5 rounded-full border border-black bg-white text-black font-sans text-xs sm:text-sm font-medium tracking-tight shadow-sm transition-all duration-300 hover:bg-black hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            <span>Start a Conversation</span>
            <span
              className="transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            >
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default OstrumTestimonialsSection;
