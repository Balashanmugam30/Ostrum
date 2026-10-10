'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/context/LanguageContext';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  (window as any).ScrollTrigger = ScrollTrigger;
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
        new CustomEvent('ostrum:energy-progress', { detail: { progress: 0.5, beat: 2 } })
      );
      const beatEls = gsap.utils.toArray<HTMLElement>('.narrative-beat-card');
      beatEls.forEach((el, idx) => {
        gsap.set(el, { opacity: idx === 2 ? 1 : 0, y: 0 });
        const fills = el.querySelectorAll<HTMLElement>('.text-fill-mask');
        fills.forEach((fill) => {
          gsap.set(fill, { clipPath: 'inset(0 0% 0 0)' });
        });
      });
      return;
    }

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768;
      const scrollDistance = isMobile ? 3200 : 4600;

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
          // -1: Stage 0 (0.00 - 0.12) Object alone against pitch-black void
          //  0: Beat 01 (0.12 - 0.28) Your tools don't work together.
          //  1: Beat 02 (0.29 - 0.44) It shouldn't be this hard.
          //  2: Beat 03 (0.45 - 0.62) We make your business work better.
          //  3: Beat 04 (0.63 - 0.80) Got a problem no product solves?
          //  4: Beat 05 (0.81 - 1.00) Ready to build what comes next?
          let currentBeat = -1;
          if (p >= 0.81) {
            currentBeat = 4;
          } else if (p >= 0.63) {
            currentBeat = 3;
          } else if (p >= 0.45) {
            currentBeat = 2;
          } else if (p >= 0.29) {
            currentBeat = 1;
          } else if (p >= 0.12) {
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

      // Scrubbed Master Timeline for the 5 Narrative Beats with Scroll-Scrubbed Text-Fill Reveals
      const beatCards = gsap.utils.toArray<HTMLElement>('.narrative-beat-card');

      // Initialize all cards: opacity 0, offset down, with 100% clipped fills
      beatCards.forEach((card) => {
        gsap.set(card, { opacity: 0, y: 24 });
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

      // Stage 0: 0.00 -> 0.12 is pure object-only stage (zero text, sculpture alone in center)

      if (beatCards.length >= 5) {
        // ==============================================================
        // BEAT 01: "Your tools don't work together." (0.12 -> 0.28)
        // ==============================================================
        const card0 = beatCards[0];
        const headFill0 = card0.querySelector<HTMLElement>('.heading-fill');
        const subFill0 = card0.querySelector<HTMLElement>('.supporting-fill');

        // Card enters: base muted grey lettering appears
        tl.to(card0, { opacity: 1, y: 0, duration: 0.03, ease: 'power2.out' }, 0.12);
        // Headline fill progression (scrubbed grey-to-white fill)
        if (headFill0) {
          tl.to(headFill0, { clipPath: 'inset(0 0% 0 0)', duration: 0.05, ease: 'none' }, 0.15);
        }
        // Supporting sentence fill progression
        if (subFill0) {
          tl.to(subFill0, { clipPath: 'inset(0 0% 0 0)', duration: 0.05, ease: 'none' }, 0.18);
        }
        // Reading Hold: fully filled, clear ivory/white
        tl.to(card0, { opacity: 1, duration: 0.03 }, 0.23);
        // Exit dissolve
        tl.to(card0, { opacity: 0, y: -20, duration: 0.02, ease: 'power2.in' }, 0.26);

        // ==============================================================
        // BEAT 02: "It shouldn't be this hard." (0.29 -> 0.44)
        // Punchline beat with no supporting sentence
        // ==============================================================
        const card1 = beatCards[1];
        const headFill1 = card1.querySelector<HTMLElement>('.heading-fill');

        tl.to(card1, { opacity: 1, y: 0, duration: 0.03, ease: 'power2.out' }, 0.29);
        if (headFill1) {
          tl.to(headFill1, { clipPath: 'inset(0 0% 0 0)', duration: 0.06, ease: 'none' }, 0.32);
        }
        // Reading Hold
        tl.to(card1, { opacity: 1, duration: 0.04 }, 0.38);
        // Exit dissolve
        tl.to(card1, { opacity: 0, y: -20, duration: 0.02, ease: 'power2.in' }, 0.42);

        // ==============================================================
        // BEAT 03: "We make your business work better." (0.45 -> 0.62)
        // ==============================================================
        const card2 = beatCards[2];
        const headFill2 = card2.querySelector<HTMLElement>('.heading-fill');
        const subFill2 = card2.querySelector<HTMLElement>('.supporting-fill');

        tl.to(card2, { opacity: 1, y: 0, duration: 0.03, ease: 'power2.out' }, 0.45);
        if (headFill2) {
          tl.to(headFill2, { clipPath: 'inset(0 0% 0 0)', duration: 0.05, ease: 'none' }, 0.48);
        }
        if (subFill2) {
          tl.to(subFill2, { clipPath: 'inset(0 0% 0 0)', duration: 0.06, ease: 'none' }, 0.51);
        }
        // Reading Hold
        tl.to(card2, { opacity: 1, duration: 0.03 }, 0.57);
        // Exit dissolve
        tl.to(card2, { opacity: 0, y: -20, duration: 0.02, ease: 'power2.in' }, 0.60);

        // ==============================================================
        // BEAT 04: "Got a problem no product solves?" (0.63 -> 0.80)
        // ==============================================================
        const card3 = beatCards[3];
        const headFill3 = card3.querySelector<HTMLElement>('.heading-fill');
        const subFill3 = card3.querySelector<HTMLElement>('.supporting-fill');

        tl.to(card3, { opacity: 1, y: 0, duration: 0.03, ease: 'power2.out' }, 0.63);
        if (headFill3) {
          tl.to(headFill3, { clipPath: 'inset(0 0% 0 0)', duration: 0.05, ease: 'none' }, 0.66);
        }
        if (subFill3) {
          tl.to(subFill3, { clipPath: 'inset(0 0% 0 0)', duration: 0.06, ease: 'none' }, 0.69);
        }
        // Reading Hold
        tl.to(card3, { opacity: 1, duration: 0.03 }, 0.75);
        // Exit dissolve
        tl.to(card3, { opacity: 0, y: -20, duration: 0.02, ease: 'power2.in' }, 0.78);

        // ==============================================================
        // BEAT 05: "Ready to build what comes next?" (0.81 -> 1.00)
        // Climax beat with selective coral highlights on supporting text
        // ==============================================================
        const card4 = beatCards[4];
        const headFill4 = card4.querySelector<HTMLElement>('.heading-fill');
        const subFill4 = card4.querySelector<HTMLElement>('.supporting-fill');

        tl.to(card4, { opacity: 1, y: 0, duration: 0.03, ease: 'power2.out' }, 0.81);
        if (headFill4) {
          tl.to(headFill4, { clipPath: 'inset(0 0% 0 0)', duration: 0.05, ease: 'none' }, 0.84);
        }
        if (subFill4) {
          tl.to(subFill4, { clipPath: 'inset(0 0% 0 0)', duration: 0.06, ease: 'none' }, 0.88);
        }
        // Settle Hold through 1.00 for majestic resting poise
        tl.to(card4, { opacity: 1, duration: 0.06 }, 0.94);
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
              className="narrative-beat-card absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-auto px-6 md:px-12"
              style={{ opacity: 0 }}
            >
              {/* 1. Primary Statement: Reference Neue Montreal Medium (Inactive Muted Grey -> Scrubbed White Fill) */}
              <div className="relative inline-block max-w-[1080px] mx-auto">
                {/* Base Layer: Inactive Solid Muted Grey Text (Reference: rgba(255, 255, 255, 0.30)) */}
                <h2
                  className="font-sans font-medium text-center text-[clamp(34px,3.9vw,75px)] tracking-[-0.01em] leading-[1.2] select-none text-white/30 drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]"
                  style={{ textWrap: 'balance' }}
                >
                  {beat.primary}
                </h2>

                {/* Fill Overlay: Scroll-Scrubbed Solid Pure White Reveal */}
                <div
                  className="text-fill-mask heading-fill absolute inset-0 pointer-events-none select-none overflow-hidden"
                  aria-hidden="true"
                  style={{
                    clipPath: 'inset(0 100% 0 0)',
                    WebkitClipPath: 'inset(0 100% 0 0)',
                  }}
                >
                  <div
                    className="font-sans font-medium text-center text-[clamp(34px,3.9vw,75px)] tracking-[-0.01em] leading-[1.2] text-white drop-shadow-[0_4px_32px_rgba(255,255,255,0.25)]"
                    style={{ textWrap: 'balance' }}
                  >
                    {beat.primary}
                  </div>
                </div>
              </div>

              {/* 2. Supporting Statement: Editorial Secondary Paragraph with Scroll-Scrubbed Reveal */}
              {beat.supporting ? (
                <div className="relative inline-block max-w-[760px] mx-auto mt-6 md:mt-8">
                  {/* Base Layer: Inactive Muted Grey */}
                  <p
                    className="font-sans font-normal text-center text-[clamp(17px,1.4vw,23px)] tracking-[-0.01em] leading-[1.4] select-none text-white/30 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
                    style={{ textWrap: 'balance' }}
                  >
                    {beat.supporting}
                  </p>

                  {/* Fill Overlay: Scroll-Scrubbed Pure White / Coral Highlights */}
                  <div
                    className="text-fill-mask supporting-fill absolute inset-0 pointer-events-none select-none overflow-hidden"
                    aria-hidden="true"
                    style={{
                      clipPath: 'inset(0 100% 0 0)',
                      WebkitClipPath: 'inset(0 100% 0 0)',
                    }}
                  >
                    <p
                      className="font-sans font-normal text-center text-[clamp(17px,1.4vw,23px)] tracking-[-0.01em] leading-[1.4] text-white/90 drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)]"
                      style={{ textWrap: 'balance' }}
                    >
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
