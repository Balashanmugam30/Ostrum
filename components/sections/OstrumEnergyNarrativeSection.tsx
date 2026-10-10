'use client';

import React, { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/context/LanguageContext';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  (window as any).ScrollTrigger = ScrollTrigger;
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface CharToken {
  char: string;
  isHighlight: boolean;
}

export interface WordToken {
  text: string;
  chars: CharToken[];
}

export interface BeatLineData {
  primaryLines: WordToken[][];
  supportingLines: WordToken[][];
  allLines: WordToken[][];
}

export function tokenizeTextWithHighlights(
  text: string,
  highlight?: string,
  highlight2?: string
): WordToken[] {
  if (!text) return [];
  const words = text.trim().split(/\s+/);

  // Find character index ranges in the original text for highlights
  const ranges: [number, number][] = [];
  [highlight, highlight2].filter(Boolean).forEach((hl) => {
    if (!hl) return;
    let idx = text.toLowerCase().indexOf(hl.toLowerCase());
    while (idx !== -1) {
      ranges.push([idx, idx + hl.length]);
      idx = text.toLowerCase().indexOf(hl.toLowerCase(), idx + hl.length);
    }
  });

  let charOffset = 0;
  return words.map((word) => {
    const wordStart = text.indexOf(word, charOffset);
    charOffset = wordStart + word.length;

    const chars = word.split('').map((char, cIdx) => {
      const globalIdx = wordStart + cIdx;
      const isHl = ranges.some(
        ([start, end]) => globalIdx >= start && globalIdx < end
      );
      return { char, isHighlight: isHl };
    });

    return { text: word, chars };
  });
}

export function OstrumEnergyNarrativeSection() {
  const { t } = useLanguage();
  const narrative = t.energyNarrative;

  const sectionRef = useRef<HTMLElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const beatsContainerRef = useRef<HTMLDivElement>(null);
  const measureContainerRef = useRef<HTMLDivElement>(null);

  const [activeBeat, setActiveBeat] = useState<number>(-1);
  const [linesByBeat, setLinesByBeat] = useState<Record<string, BeatLineData> | null>(null);

  // Pre-tokenize words for each beat
  const tokenizedBeats = useMemo(() => {
    return narrative.beats.map((beat) => ({
      id: beat.id,
      primaryTokens: tokenizeTextWithHighlights(beat.primary),
      supportingTokens: tokenizeTextWithHighlights(
        beat.supporting || '',
        beat.highlight,
        beat.highlight2
      ),
    }));
  }, [narrative.beats]);

  // Measure visual lines from the offscreen measurement DOM
  const measureLines = () => {
    const measureRoot = measureContainerRef.current;
    if (!measureRoot) return null;

    const result: Record<string, BeatLineData> = {};

    narrative.beats.forEach((beat) => {
      const beatMeasureEl = measureRoot.querySelector<HTMLElement>(
        `[data-measure-beat="${beat.id}"]`
      );
      if (!beatMeasureEl) return;

      const groupWordsIntoLines = (
        containerSelector: string,
        tokens: WordToken[]
      ): WordToken[][] => {
        const container = beatMeasureEl.querySelector<HTMLElement>(containerSelector);
        if (!container) return [];
        const wordEls = Array.from(
          container.querySelectorAll<HTMLElement>('.measure-word')
        );
        if (wordEls.length === 0) return [];

        let currentTop = -1;
        const lines: WordToken[][] = [];
        let curLine: WordToken[] = [];

        wordEls.forEach((wEl, idx) => {
          const top = Math.round(wEl.offsetTop);
          const token = tokens[idx];
          if (!token) return;

          if (currentTop === -1 || Math.abs(top - currentTop) > 6) {
            if (curLine.length > 0) lines.push(curLine);
            curLine = [token];
            currentTop = top;
          } else {
            curLine.push(token);
          }
        });
        if (curLine.length > 0) lines.push(curLine);
        return lines;
      };

      const primaryLines = groupWordsIntoLines(
        '.measure-primary',
        tokenizeTextWithHighlights(beat.primary)
      );
      const supportingLines = beat.supporting
        ? groupWordsIntoLines(
            '.measure-supporting',
            tokenizeTextWithHighlights(
              beat.supporting,
              beat.highlight,
              beat.highlight2
            )
          )
        : [];

      result[beat.id] = {
        primaryLines,
        supportingLines,
        allLines: [...primaryLines, ...supportingLines],
      };
    });

    return result;
  };

  // Perform layout measurement when fonts are ready and on resize
  useIsomorphicLayoutEffect(() => {
    let isCancelled = false;

    const runMeasurement = () => {
      if (isCancelled) return;
      const measured = measureLines();
      if (measured) {
        setLinesByBeat(measured);
      }
    };

    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        runMeasurement();
      });
    } else {
      runMeasurement();
    }

    let resizeTimer: any;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        runMeasurement();
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      isCancelled = true;
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [tokenizedBeats]);

  // Master GSAP ScrollTrigger Sequence for Sequential Line Reveals
  useEffect(() => {
    const section = sectionRef.current;
    const pinContainer = pinContainerRef.current;
    if (!section || !pinContainer || !linesByBeat) return;

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
        const fills = el.querySelectorAll<HTMLElement>('.narrative-line-fill');
        fills.forEach((fill) => {
          gsap.set(fill, { clipPath: 'inset(0 0% 0 0)' });
        });
      });
      return;
    }

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768;
      const scrollDistance = isMobile ? 3600 : 5000;

      // 1. Master Pinned Trigger for the Energy Narrative
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
          const p = self.progress;

          // Beat intervals:
          // Stage 0: [0.00, 0.12)
          // Beat 01: [0.12, 0.28)
          // Beat 02: [0.29, 0.44)
          // Beat 03: [0.45, 0.62)
          // Beat 04: [0.63, 0.80)
          // Beat 05: [0.81, 1.00]
          let currentBeat = -1;
          if (p >= 0.81) currentBeat = 4;
          else if (p >= 0.63) currentBeat = 3;
          else if (p >= 0.45) currentBeat = 2;
          else if (p >= 0.29) currentBeat = 1;
          else if (p >= 0.12) currentBeat = 0;

          setActiveBeat(currentBeat);

          // Deep obsidian black throughout narrative
          window.dispatchEvent(
            new CustomEvent('ostrum:bg-darken', { detail: 1.0 })
          );

          // Continuous 3D journey sync
          window.dispatchEvent(
            new CustomEvent('ostrum:energy-progress', {
              detail: { progress: p, beat: currentBeat },
            })
          );
        },
      });

      // 2. Master Scrubbed Timeline for Sequential Line Reveals
      const beatCards = gsap.utils.toArray<HTMLElement>('.narrative-beat-card');

      // Initialize all beat cards and lines:
      beatCards.forEach((card) => {
        gsap.set(card, { opacity: 0, y: 24 });
        const lineFills = card.querySelectorAll<HTMLElement>('.narrative-line-fill');
        lineFills.forEach((fill) => {
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

      // Stage 0: 0.00 -> 0.12 (Object-only black stage, 0 text)

      // Choreograph sequential line reveals for each of the 5 beats
      const beatTimings = [
        { enter: 0.12, revealStart: 0.14, revealEnd: 0.23, holdEnd: 0.26, exitEnd: 0.28 },
        { enter: 0.29, revealStart: 0.31, revealEnd: 0.38, holdEnd: 0.42, exitEnd: 0.44 },
        { enter: 0.45, revealStart: 0.47, revealEnd: 0.57, holdEnd: 0.60, exitEnd: 0.62 },
        { enter: 0.63, revealStart: 0.65, revealEnd: 0.74, holdEnd: 0.78, exitEnd: 0.80 },
        { enter: 0.81, revealStart: 0.83, revealEnd: 0.93, holdEnd: 1.00, exitEnd: 1.00 },
      ];

      beatCards.forEach((card, beatIdx) => {
        if (beatIdx >= beatTimings.length) return;
        const timing = beatTimings[beatIdx];
        const lineFills = Array.from(
          card.querySelectorAll<HTMLElement>('.narrative-line-fill')
        );

        // A. Card Enters (base muted grey lines appear)
        tl.to(card, { opacity: 1, y: 0, duration: 0.02, ease: 'power2.out' }, timing.enter);

        // B. Sequential Line-by-Line Reveal
        // Line 1 fills letter-by-letter -> completes -> Line 2 begins -> completes -> Line 3...
        const totalLines = lineFills.length;
        if (totalLines > 0) {
          const totalRevealTime = timing.revealEnd - timing.revealStart;
          const sliceDuration = totalRevealTime / totalLines;

          lineFills.forEach((lineFill, lineIdx) => {
            const lineStart = timing.revealStart + lineIdx * sliceDuration;

            tl.fromTo(
              lineFill,
              { clipPath: 'inset(0 100% 0 0)' },
              {
                clipPath: 'inset(0 0% 0 0)',
                duration: sliceDuration,
                ease: 'none',
              },
              lineStart
            );
          });
        }

        // C. Reading Hold (all lines 100% white and readable)
        if (timing.holdEnd > timing.revealEnd) {
          tl.to(card, { opacity: 1, duration: timing.holdEnd - timing.revealEnd }, timing.revealEnd);
        }

        // D. Exit Dissolve (only for beats 0 to 3; beat 4 holds through 1.00)
        if (beatIdx < 4 && timing.exitEnd > timing.holdEnd) {
          tl.to(card, { opacity: 0, y: -20, duration: timing.exitEnd - timing.holdEnd, ease: 'power2.in' }, timing.holdEnd);
        }
      });
    }, section);

    return () => {
      ctx.revert();
      window.dispatchEvent(new CustomEvent('ostrum:bg-darken', { detail: 0 }));
      window.dispatchEvent(
        new CustomEvent('ostrum:energy-progress', { detail: { progress: 0, beat: -1 } })
      );
    };
  }, [linesByBeat]);

  // Helper to render an individual line of tokens
  const renderLine = (
    lineWords: WordToken[],
    keyPrefix: string,
    globalLineIdx: number
  ) => {
    return (
      <div
        key={`${keyPrefix}-${globalLineIdx}`}
        className="narrative-line-container relative inline-block my-1 sm:my-1.5 md:my-2 text-center"
        data-line-index={globalLineIdx}
      >
        {/* Base Layer: Inactive Solid Muted Grey Letters */}
        <div className="narrative-line-base font-sans font-medium text-[clamp(28px,3.5vw,60px)] leading-[1.18] tracking-[-0.015em] text-white/30 drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] select-none">
          {lineWords.map((word, wIdx) => (
            <span key={wIdx} className="inline-block whitespace-nowrap">
              {word.chars.map((ch, cIdx) => (
                <span
                  key={cIdx}
                  className="narrative-char inline-block"
                  data-char={ch.char}
                  data-line={globalLineIdx}
                  data-char-idx={cIdx}
                >
                  {ch.char}
                </span>
              ))}
              {wIdx < lineWords.length - 1 && (
                <span className="inline-block whitespace-pre"> </span>
              )}
            </span>
          ))}
        </div>

        {/* Fill Layer: Absolute Overlay with Pure White / Coral Highlights, Horizontally Clipped */}
        <div
          className="narrative-line-fill absolute inset-0 pointer-events-none select-none overflow-hidden"
          data-fill-line-index={globalLineIdx}
          aria-hidden="true"
          style={{
            clipPath: 'inset(0 100% 0 0)',
            WebkitClipPath: 'inset(0 100% 0 0)',
          }}
        >
          <div className="font-sans font-medium text-[clamp(28px,3.5vw,60px)] leading-[1.18] tracking-[-0.015em] drop-shadow-[0_4px_32px_rgba(255,255,255,0.25)]">
            {lineWords.map((word, wIdx) => (
              <span key={wIdx} className="inline-block whitespace-nowrap">
                {word.chars.map((ch, cIdx) => (
                  <span
                    key={cIdx}
                    className={`narrative-char-filled inline-block ${
                      ch.isHighlight
                        ? 'text-[#ff5c4a] drop-shadow-[0_0_16px_rgba(255,92,74,0.65)]'
                        : 'text-white'
                    }`}
                    data-char={ch.char}
                    data-line={globalLineIdx}
                    data-char-idx={cIdx}
                  >
                    {ch.char}
                  </span>
                ))}
                {wIdx < lineWords.length - 1 && (
                  <span className="inline-block whitespace-pre"> </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      ref={sectionRef}
      id="energy-narrative"
      className="relative w-full overflow-visible z-[15] select-none"
      aria-label="Ostrum Energy Narrative"
    >
      {/* Offscreen Measurement DOM: Accurately computes visual line wrapping with final font */}
      <div
        ref={measureContainerRef}
        className="opacity-0 pointer-events-none fixed -top-[9999px] -left-[9999px] w-[90vw] max-w-[1580px] px-4 sm:px-6 md:px-8 text-center"
        aria-hidden="true"
      >
        {narrative.beats.map((beat) => (
          <div key={beat.id} data-measure-beat={beat.id}>
            <div className="measure-primary font-sans font-medium text-[clamp(28px,3.5vw,60px)] leading-[1.18] tracking-[-0.015em] text-center">
              {tokenizeTextWithHighlights(beat.primary).map((word, wIdx) => (
                <span
                  key={wIdx}
                  className="measure-word inline-block whitespace-nowrap"
                  data-word={word.text}
                >
                  {word.text}{' '}
                </span>
              ))}
            </div>
            {beat.supporting ? (
              <div className="measure-supporting font-sans font-medium text-[clamp(28px,3.5vw,60px)] leading-[1.18] tracking-[-0.015em] text-center mt-6">
                {tokenizeTextWithHighlights(
                  beat.supporting,
                  beat.highlight,
                  beat.highlight2
                ).map((word, wIdx) => (
                  <span
                    key={wIdx}
                    className="measure-word inline-block whitespace-nowrap"
                    data-word={word.text}
                  >
                    {word.text}{' '}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* Pinned Viewport Stage Container */}
      <div
        ref={pinContainerRef}
        className="w-full h-screen min-h-[640px] flex items-center justify-center relative px-4 sm:px-6 md:px-8 overflow-hidden pointer-events-auto"
      >
        {/* Center Slot for Continuous 3D Sculpture Alignment */}
        <div
          id="section03-sculpture-slot"
          data-testid="ostrum-energy-3d-slot"
          className="absolute inset-0 m-auto w-full aspect-square max-w-[340px] sm:max-w-[440px] md:max-w-[540px] lg:max-w-[620px] pointer-events-none z-10 flex items-center justify-center"
        />

        {/* Centered Narrative Statements Container (Expanded to 90vw max 1580px) */}
        <div
          ref={beatsContainerRef}
          className="w-[90vw] max-w-[1580px] h-full relative z-20 flex items-center justify-center pointer-events-none mx-auto"
        >
          {narrative.beats.map((beat) => {
            const beatData = linesByBeat ? linesByBeat[beat.id] : null;

            return (
              <div
                key={beat.id}
                className="narrative-beat-card absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-auto w-full"
                style={{ opacity: 0 }}
              >
                <div className="w-full max-w-[1580px] mx-auto px-4 sm:px-6 md:px-8 text-center flex flex-col items-center justify-center">
                  {beatData ? (
                    <>
                      {/* Primary Lines */}
                      <div className="w-full flex flex-col items-center">
                        {beatData.primaryLines.map((lineWords, lineIdx) =>
                          renderLine(lineWords, `${beat.id}-p`, lineIdx)
                        )}
                      </div>

                      {/* Supporting Lines (same typography, same size, same importance) */}
                      {beatData.supportingLines.length > 0 && (
                        <div className="w-full flex flex-col items-center mt-6 md:mt-8 lg:mt-10">
                          {beatData.supportingLines.map((lineWords, lineIdx) =>
                            renderLine(
                              lineWords,
                              `${beat.id}-s`,
                              beatData.primaryLines.length + lineIdx
                            )
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    // Fallback before measurement finishes
                    <div className="w-full flex flex-col items-center">
                      <div className="font-sans font-medium text-[clamp(28px,3.5vw,60px)] leading-[1.18] tracking-[-0.015em] text-white/30 text-center">
                        {beat.primary}
                      </div>
                      {beat.supporting ? (
                        <div className="font-sans font-medium text-[clamp(28px,3.5vw,60px)] leading-[1.18] tracking-[-0.015em] text-white/30 text-center mt-6 md:mt-8 lg:mt-10">
                          {beat.supporting}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
