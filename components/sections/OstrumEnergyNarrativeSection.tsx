'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/context/LanguageContext';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function renderPrimaryWithHighlights(
  primary: string,
  highlight?: string,
  highlight2?: string
) {
  if (!highlight && !highlight2) {
    return primary;
  }

  const tokens = [highlight, highlight2].filter(Boolean) as string[];
  const pattern = new RegExp(
    `(${tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'gi'
  );

  const parts = primary.split(pattern);
  return parts.map((part, i) => {
    const isMatch = tokens.some((t) => t.toLowerCase() === part.toLowerCase());
    if (isMatch) {
      return (
        <span
          key={i}
          className="text-[#ff5c4a] italic font-serif font-normal drop-shadow-[0_0_16px_rgba(255,92,74,0.45)]"
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
        gsap.set(el, { opacity: idx === 1 ? 1 : 0, y: 0, filter: 'none' });
      });
      return;
    }

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768;
      const scrollDistance = isMobile ? 2400 : 3600;

      // Master Pinned Trigger for the Energy Narrative
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: `+=${scrollDistance}`,
        pin: pinContainer,
        pinSpacing: true,
        scrub: 0.8,
        id: 'energy-narrative-pin',
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress; // 0.0 to 1.0

          // Calculate active beat index:
          // -1: Stage 0 (0.00 - 0.18) Sculpture alone against pitch-black field
          //  0: Beat 01 (0.18 - 0.35) The Problem: Disconnected systems...
          //  1: Beat 02 (0.35 - 0.52) The Punchline: Complexity, made coherent.
          //  2: Beat 03 (0.52 - 0.69) What Ostrum Does: We connect systems...
          //  3: Beat 04 (0.69 - 0.85) What Comes Next: Some ideas become products...
          //  4: Beat 05 (0.85 - 1.00) Closing Statement: Build what doesn't exist yet.
          let currentBeat = -1;
          if (p >= 0.84) {
            currentBeat = 4;
          } else if (p >= 0.67) {
            currentBeat = 3;
          } else if (p >= 0.50) {
            currentBeat = 2;
          } else if (p >= 0.33) {
            currentBeat = 1;
          } else if (p >= 0.16) {
            currentBeat = 0;
          }
          setActiveBeat(currentBeat);

          // Background Darkening Profile:
          // Pure obsidian dark base (#030204 near-black) throughout entire narrative and into release
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

      // Scrubbed Timeline for the 5 Narrative Text Beats
      const beatEls = gsap.utils.toArray<HTMLElement>('.narrative-beat-card');

      // Initialize all cards to opacity 0, offset downwards
      gsap.set(beatEls, { opacity: 0, y: 35, filter: 'blur(6px)' });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${scrollDistance}`,
          scrub: 0.8,
        },
      });

      if (beatEls.length === 5) {
        // Stage 0: 0.00 -> 0.16 is pure object-only stage (zero text)

        // Beat 0 (The Problem): In 0.16 -> 0.20, Hold to 0.28, Exit 0.28 -> 0.32
        tl.to(
          beatEls[0],
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.04, ease: 'power2.out' },
          0.16
        );
        tl.to(
          beatEls[0],
          { opacity: 0, y: -25, filter: 'blur(4px)', duration: 0.04, ease: 'power2.in' },
          0.28
        );

        // Beat 1 (The Punchline): In 0.33 -> 0.37, Hold to 0.45, Exit 0.45 -> 0.49
        tl.to(
          beatEls[1],
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.04, ease: 'power2.out' },
          0.33
        );
        tl.to(
          beatEls[1],
          { opacity: 0, y: -25, filter: 'blur(4px)', duration: 0.04, ease: 'power2.in' },
          0.45
        );

        // Beat 2 (What Ostrum Does): In 0.50 -> 0.54, Hold to 0.62, Exit 0.62 -> 0.66
        tl.to(
          beatEls[2],
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.04, ease: 'power2.out' },
          0.50
        );
        tl.to(
          beatEls[2],
          { opacity: 0, y: -25, filter: 'blur(4px)', duration: 0.04, ease: 'power2.in' },
          0.62
        );

        // Beat 3 (What Comes Next): In 0.67 -> 0.71, Hold to 0.79, Exit 0.79 -> 0.83
        tl.to(
          beatEls[3],
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.04, ease: 'power2.out' },
          0.67
        );
        tl.to(
          beatEls[3],
          { opacity: 0, y: -25, filter: 'blur(4px)', duration: 0.04, ease: 'power2.in' },
          0.79
        );

        // Beat 4 (Closing Statement): In 0.84 -> 0.88, Settles poise through 1.00
        tl.to(
          beatEls[4],
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.04, ease: 'power2.out' },
          0.84
        );
        // Settle Hold through 1.00 to guarantee exact 1.00 timeline duration
        tl.to(
          beatEls[4],
          { opacity: 1, duration: 0.12 },
          0.88
        );
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
          {narrative.beats.map((beat, idx) => (
            <div
              key={beat.id}
              className="narrative-beat-card absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-auto px-4"
              style={{
                opacity: 0,
              }}
            >
              {/* Primary Centered Statement in Monumental Romie Serif */}
              <h3 className="font-serif text-white font-normal tracking-[-0.025em] sm:tracking-[-0.03em] leading-[1.08] text-[clamp(32px,5vw,72px)] max-w-[940px] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
                {renderPrimaryWithHighlights(
                  beat.primary,
                  beat.highlight,
                  beat.highlight2
                )}
              </h3>

              {/* Supporting Editorial Statement */}
              {beat.supporting ? (
                <p className="mt-5 sm:mt-6 text-sm sm:text-base md:text-[18px] text-white/80 font-normal leading-[1.5] tracking-[-0.015em] max-w-[620px] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                  {beat.supporting}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
