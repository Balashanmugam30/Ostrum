'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/context/LanguageContext';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function renderSupportingWithHighlights(
  text: string,
  highlight?: string,
  highlight2?: string
) {
  if (!highlight && !highlight2) {
    return text;
  }

  const tokens = [highlight, highlight2].filter(Boolean) as string[];
  const pattern = new RegExp(
    `(${tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'gi'
  );

  const parts = text.split(pattern);
  return parts.map((part, i) => {
    const isMatch = tokens.some((t) => t.toLowerCase() === part.toLowerCase());
    if (isMatch) {
      return (
        <span
          key={i}
          className="text-[#ff5c4a] font-medium drop-shadow-[0_0_16px_rgba(255,92,74,0.55)]"
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

export function OstrumEnergyNarrativeSection() {
  const { t } = useLanguage();
  const narrative = t.energyNarrative;

  const sectionRef = useRef<HTMLElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const beatsContainerRef = useRef<HTMLDivElement>(null);

  const [activeBeat, setActiveBeat] = useState<number>(-1);

  useEffect(() => {
    const section = sectionRef.current;
    const pinContainer = pinContainerRef.current;
    if (!section || !pinContainer) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      window.dispatchEvent(new CustomEvent('ostrum:bg-darken', { detail: 1 }));
      window.dispatchEvent(
        new CustomEvent('ostrum:energy-progress', { detail: { progress: 0.5, beat: 1 } })
      );
      const beatEls = gsap.utils.toArray<HTMLElement>('.narrative-beat-card');
      beatEls.forEach((el, idx) => {
        gsap.set(el, { opacity: idx === 1 ? 1 : 0, y: 0 });
        const fills = el.querySelectorAll<HTMLElement>('.text-fill-mask');
        fills.forEach((fill) => {
          gsap.set(fill, { clipPath: 'inset(0 0% 0 0)' });
        });
      });
      return;
    }

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768;
      const scrollDistance = isMobile ? 2600 : 3800;

      // Master Pinned Trigger for the Energy Narrative
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: `+=${scrollDistance}`,
        pin: pinContainer,
        pinSpacing: true,
        scrub: 0.6,
        id: 'energy-narrative-pin',
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress; // 0.0 to 1.0

          // Calculate active beat index:
          // -1: Stage 0 (0.00 - 0.16) Object alone against pitch-black void
          //  0: Beat 01 (0.16 - 0.36) Complexity, made clear.
          //  1: Beat 02 (0.36 - 0.57) Intelligence that works.
          //  2: Beat 03 (0.57 - 0.78) Built for what comes next.
          //  3: Beat 04 (0.78 - 1.00) Build what does not exist yet.
          let currentBeat = -1;
          if (p >= 0.78) {
            currentBeat = 3;
          } else if (p >= 0.57) {
            currentBeat = 2;
          } else if (p >= 0.36) {
            currentBeat = 1;
          } else if (p >= 0.16) {
            currentBeat = 0;
          }
          setActiveBeat(currentBeat);

          // Background Darkening: pure obsidian pitch black throughout entire narrative
          window.dispatchEvent(
            new CustomEvent('ostrum:bg-darken', { detail: 1.0 })
          );

          // Dispatch progress to the 3D continuous journey
          window.dispatchEvent(
            new CustomEvent('ostrum:energy-progress', {
              detail: { progress: p, beat: currentBeat },
            })
          );
        },
      });

      // Scrubbed Master Timeline for the 4 Narrative Beats with Outline-to-Fill Reveals
      const beatCards = gsap.utils.toArray<HTMLElement>('.narrative-beat-card');

      // Initialize all cards: opacity 0, offset down, with 100% clipped fills
      beatCards.forEach((card) => {
        gsap.set(card, { opacity: 0, y: 30 });
        const fills = card.querySelectorAll<HTMLElement>('.text-fill-mask');
        fills.forEach((fill) => {
          gsap.set(fill, { clipPath: 'inset(0 100% 0 0)' });
        });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${scrollDistance}`,
          scrub: 0.6,
        },
      });

      // Stage 0: 0.00 -> 0.16 is pure object-only stage (zero text, sculpture alone in center)

      if (beatCards.length >= 4) {
        // ==============================================================
        // BEAT 01: "Complexity, made clear." (0.16 -> 0.35)
        // ==============================================================
        const card0 = beatCards[0];
        const headFill0 = card0.querySelector<HTMLElement>('.heading-fill');
        const subFill0 = card0.querySelector<HTMLElement>('.supporting-fill');

        // Card enters: Outlines visible
        tl.to(card0, { opacity: 1, y: 0, duration: 0.03, ease: 'power2.out' }, 0.16);
        // Headline fill progression (scrubbed outline-to-fill)
        if (headFill0) {
          tl.to(headFill0, { clipPath: 'inset(0 0% 0 0)', duration: 0.05, ease: 'none' }, 0.19);
        }
        // Supporting sentence fill progression
        if (subFill0) {
          tl.to(subFill0, { clipPath: 'inset(0 0% 0 0)', duration: 0.05, ease: 'none' }, 0.23);
        }
        // Reading Hold: fully filled, crystal clear
        tl.to(card0, { opacity: 1, duration: 0.04 }, 0.28);
        // Exit transition
        tl.to(card0, { opacity: 0, y: -20, duration: 0.03, ease: 'power2.in' }, 0.32);

        // ==============================================================
        // BEAT 02: "Intelligence that works." (0.37 -> 0.56)
        // ==============================================================
        const card1 = beatCards[1];
        const headFill1 = card1.querySelector<HTMLElement>('.heading-fill');
        const subFill1 = card1.querySelector<HTMLElement>('.supporting-fill');

        // Card enters: Outlines visible
        tl.to(card1, { opacity: 1, y: 0, duration: 0.03, ease: 'power2.out' }, 0.37);
        // Headline fill progression
        if (headFill1) {
          tl.to(headFill1, { clipPath: 'inset(0 0% 0 0)', duration: 0.05, ease: 'none' }, 0.40);
        }
        // Supporting sentence fill progression
        if (subFill1) {
          tl.to(subFill1, { clipPath: 'inset(0 0% 0 0)', duration: 0.05, ease: 'none' }, 0.44);
        }
        // Reading Hold
        tl.to(card1, { opacity: 1, duration: 0.04 }, 0.49);
        // Exit transition
        tl.to(card1, { opacity: 0, y: -20, duration: 0.03, ease: 'power2.in' }, 0.53);

        // ==============================================================
        // BEAT 03: "Built for what comes next." (0.58 -> 0.77)
        // ==============================================================
        const card2 = beatCards[2];
        const headFill2 = card2.querySelector<HTMLElement>('.heading-fill');
        const subFill2 = card2.querySelector<HTMLElement>('.supporting-fill');

        // Card enters: Outlines visible
        tl.to(card2, { opacity: 1, y: 0, duration: 0.03, ease: 'power2.out' }, 0.58);
        // Headline fill progression
        if (headFill2) {
          tl.to(headFill2, { clipPath: 'inset(0 0% 0 0)', duration: 0.05, ease: 'none' }, 0.61);
        }
        // Supporting sentence fill progression
        if (subFill2) {
          tl.to(subFill2, { clipPath: 'inset(0 0% 0 0)', duration: 0.05, ease: 'none' }, 0.65);
        }
        // Reading Hold
        tl.to(card2, { opacity: 1, duration: 0.04 }, 0.70);
        // Exit transition
        tl.to(card2, { opacity: 0, y: -20, duration: 0.03, ease: 'power2.in' }, 0.74);

        // ==============================================================
        // BEAT 04: "Build what does not exist yet." (0.79 -> 1.00)
        // Only final supporting paragraph has selective crimson/coral highlights
        // ==============================================================
        const card3 = beatCards[3];
        const headFill3 = card3.querySelector<HTMLElement>('.heading-fill');
        const subFill3 = card3.querySelector<HTMLElement>('.supporting-fill');

        // Card enters: Outlines visible
        tl.to(card3, { opacity: 1, y: 0, duration: 0.04, ease: 'power2.out' }, 0.79);
        // Headline fill progression
        if (headFill3) {
          tl.to(headFill3, { clipPath: 'inset(0 0% 0 0)', duration: 0.05, ease: 'none' }, 0.83);
        }
        // Supporting paragraph fill progression (reveals coral accents)
        if (subFill3) {
          tl.to(subFill3, { clipPath: 'inset(0 0% 0 0)', duration: 0.06, ease: 'none' }, 0.87);
        }
        // Settle Hold through 1.00 for stable poise
        tl.to(card3, { opacity: 1, duration: 0.07 }, 0.93);
      }
    }, section);

    return () => {
      ctx.revert();
      window.dispatchEvent(new CustomEvent('ostrum:bg-darken', { detail: 0 }));
      window.dispatchEvent(
        new CustomEvent('ostrum:energy-progress', { detail: { progress: 0, beat: -1 } })
      );
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="energy-narrative"
      className="relative w-full overflow-visible z-[15] select-none"
      aria-label="Ostrum Energy Narrative"
    >
      {/* Pinned Viewport Stage Container */}
      <div
        ref={pinContainerRef}
        className="w-full h-screen min-h-[640px] flex items-center justify-center relative px-6 md:px-12 overflow-hidden pointer-events-auto"
      >
        {/* Center Slot for Continuous 3D Sculpture Alignment */}
        <div
          id="section03-sculpture-slot"
          data-testid="ostrum-energy-3d-slot"
          className="absolute inset-0 m-auto w-full aspect-square max-w-[340px] sm:max-w-[440px] md:max-w-[540px] lg:max-w-[620px] pointer-events-none z-10 flex items-center justify-center"
        />

        {/* Centered Narrative Statements Container (Layered directly over 3D sculpture) */}
        <div
          ref={beatsContainerRef}
          className="w-full h-full max-w-[1100px] relative z-20 flex items-center justify-center pointer-events-none"
        >
          {narrative.beats.map((beat) => (
            <div
              key={beat.id}
              className="narrative-beat-card absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-auto px-4"
              style={{ opacity: 0 }}
            >
              {/* 1. Primary Statement: High-Impact Editorial Heading with Outline-to-Fill Reveal */}
              <div className="relative inline-block max-w-[960px] mx-auto">
                {/* Base Layer: Accessible Semantic Heading (Crisp Outlines Visible First) */}
                <h2
                  className="outline-heading font-sans font-medium text-center text-[clamp(36px,5.8vw,78px)] tracking-[-0.03em] leading-[1.06] select-none text-transparent drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]"
                  style={{
                    WebkitTextStroke: '1.2px rgba(255, 255, 255, 0.45)',
                  }}
                >
                  {beat.primary}
                </h2>

                {/* Fill Overlay: Scroll-Scrubbed Horizontal Inset Reveal */}
                <div
                  className="text-fill-mask heading-fill absolute inset-0 pointer-events-none select-none overflow-hidden"
                  aria-hidden="true"
                  style={{
                    clipPath: 'inset(0 100% 0 0)',
                    WebkitClipPath: 'inset(0 100% 0 0)',
                  }}
                >
                  <div
                    className="font-sans font-medium text-center text-[clamp(36px,5.8vw,78px)] tracking-[-0.03em] leading-[1.06] text-white drop-shadow-[0_4px_32px_rgba(255,255,255,0.22)]"
                    style={{
                      WebkitTextStroke: '1.2px #ffffff',
                    }}
                  >
                    {beat.primary}
                  </div>
                </div>
              </div>

              {/* 2. Supporting Statement: Editorial Secondary Paragraph with Outline-to-Fill Reveal */}
              {beat.supporting ? (
                <div className="relative inline-block max-w-[660px] mx-auto mt-6 sm:mt-7">
                  {/* Base Layer: Accessible Semantic Paragraph (Crisp Outlines Visible First) */}
                  <p
                    className="outline-supporting text-center text-sm sm:text-base md:text-[18px] lg:text-[20px] tracking-[-0.015em] leading-[1.52] font-normal select-none text-transparent drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
                    style={{
                      WebkitTextStroke: '0.8px rgba(255, 255, 255, 0.40)',
                    }}
                  >
                    {beat.supporting}
                  </p>

                  {/* Fill Overlay: Scroll-Scrubbed Horizontal Inset Reveal */}
                  <div
                    className="text-fill-mask supporting-fill absolute inset-0 pointer-events-none select-none overflow-hidden"
                    aria-hidden="true"
                    style={{
                      clipPath: 'inset(0 100% 0 0)',
                      WebkitClipPath: 'inset(0 100% 0 0)',
                    }}
                  >
                    <p className="text-center text-sm sm:text-base md:text-[18px] lg:text-[20px] tracking-[-0.015em] leading-[1.52] font-normal text-white/90 drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)]">
                      {renderSupportingWithHighlights(
                        beat.supporting,
                        beat.highlight,
                        beat.highlight2
                      )}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
