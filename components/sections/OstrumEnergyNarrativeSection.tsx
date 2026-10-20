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
  brandLines: WordToken[][];
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
      brandTokens: beat.brandSignoff
        ? tokenizeTextWithHighlights(beat.brandSignoff, beat.brandSignoff)
        : [],
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
      const brandLines = beat.brandSignoff
        ? groupWordsIntoLines(
            '.measure-brand',
            tokenizeTextWithHighlights(beat.brandSignoff, beat.brandSignoff)
          )
        : [];
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
        brandLines,
        supportingLines,
        allLines: [...primaryLines, ...brandLines, ...supportingLines],
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
          gsap.set(fill, { clipPath: 'inset(-35% 0% -45% 0px)' });
        });
      });
      return;
    }

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768;
      const initialHold = isMobile ? 450 : 600; // Pause 1: ~1s visual pause on completed dark stage before text
      const narrativeSpan = isMobile ? 3600 : 5000; // Preserved narrative travel span for the 5 beats
      const closingHold = isMobile ? 450 : 600; // Pause 2: ~1s visual pause on closing composition before Selected Work
      const scrollDistance = initialHold + narrativeSpan + closingHold;
      const handoffDistance = window.innerHeight;
      const totalPinDistance = scrollDistance + handoffDistance;

      // 1. Initialize beat cards and line fills
      const beatCards = gsap.utils.toArray<HTMLElement>('.narrative-beat-card');
      beatCards.forEach((card) => {
        gsap.set(card, { opacity: 0, y: 24 });
        const lineFills = card.querySelectorAll<HTMLElement>('.narrative-line-fill');
        lineFills.forEach((fill) => {
          gsap.set(fill, { clipPath: 'inset(-35% 100% -45% 0px)' });
        });
      });

      // 2. Master Pinned Trigger for the Energy Narrative
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: `+=${totalPinDistance}`,
        pin: pinContainer,
        pinSpacing: true,
        scrub: 0.6,
        id: 'energy-narrative-pin',
        anticipatePin: 1,
        onUpdate: (self) => {
          const currentScroll = self.scroll() - self.start;
          const rawNarrativeProgress = (currentScroll - initialHold) / (narrativeSpan || 1);
          const narrativeProgress = Math.max(0, Math.min(1, rawNarrativeProgress));

          // Beat intervals: mapped strictly across the 5 beats of narrativeSpan
          let currentBeat = -1;
          if (currentScroll < initialHold) {
            // Pause 1: Dark stage hold (zero text)
            currentBeat = -1;
          } else if (rawNarrativeProgress > 1.00) {
            // Pause 2 & handoff: Beat 05 active and persistent
            currentBeat = 4;
          } else if (narrativeProgress >= 0.80) currentBeat = 4;
          else if (narrativeProgress >= 0.60) currentBeat = 3;
          else if (narrativeProgress >= 0.40) currentBeat = 2;
          else if (narrativeProgress >= 0.20) currentBeat = 1;
          else if (narrativeProgress >= 0.00) currentBeat = 0;

          setActiveBeat(currentBeat);

          // Deep obsidian black throughout narrative
          window.dispatchEvent(
            new CustomEvent('ostrum:bg-darken', { detail: 1.0 })
          );

          // Continuous 3D journey sync
          window.dispatchEvent(
            new CustomEvent('ostrum:energy-progress', {
              detail: { progress: narrativeProgress, beat: currentBeat },
            })
          );
        },
        onLeave: () => {
          // Conceal beat cards when Selected Work has 100% covered the viewport
          beatCards.forEach((c) => {
            gsap.set(c, { opacity: 0 });
          });
        },
        onEnterBack: () => {
          // Restore Beat 05 card immediately when scrolling back into the handoff
          if (beatCards[4]) {
            gsap.set(beatCards[4], { opacity: 1, y: 0 });
          }
        },
      });

      // 3. Master Scrubbed Timeline for Sequential Line Reveals

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${scrollDistance}`,
          scrub: 0.6,
        },
      });

      const hold1Frac = initialHold / scrollDistance;
      const narrativeFrac = narrativeSpan / scrollDistance;

      // Base relative timings across the 5 narrative beats [0.00, 1.00]
      // Shifted by hold1Frac so Beat 01 reveal starts only after Pause 1 completes
      // Beat 05 reading hold persists through holdEnd, remaining visible through Pause 2 and handoff
      const baseBeatTimings = [
        { enter: 0.00, revealStart: 0.02, revealEnd: 0.12, holdEnd: 0.16, exitEnd: 0.19 },
        { enter: 0.20, revealStart: 0.22, revealEnd: 0.32, holdEnd: 0.36, exitEnd: 0.39 },
        { enter: 0.40, revealStart: 0.42, revealEnd: 0.52, holdEnd: 0.56, exitEnd: 0.59 },
        { enter: 0.60, revealStart: 0.62, revealEnd: 0.72, holdEnd: 0.76, exitEnd: 0.79 },
        { enter: 0.80, revealStart: 0.82, revealEnd: 0.92, holdEnd: 1.00, exitEnd: 1.00 },
      ];

      const beatTimings = baseBeatTimings.map((b) => ({
        enter: hold1Frac + b.enter * narrativeFrac,
        revealStart: hold1Frac + b.revealStart * narrativeFrac,
        revealEnd: hold1Frac + b.revealEnd * narrativeFrac,
        holdEnd: hold1Frac + b.holdEnd * narrativeFrac,
        exitEnd: hold1Frac + b.exitEnd * narrativeFrac,
      }));

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
              { clipPath: 'inset(-35% 100% -45% 0px)' },
              {
                clipPath: 'inset(-35% 0% -45% 0px)',
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

        // D. Exit Dissolve (beats 0 to 3 dissolve so next beat can enter; Beat 05 remains static and 100% visible through handoff)
        if (beatIdx < 4 && timing.exitEnd > timing.holdEnd) {
          tl.to(card, { opacity: 0, y: -20, duration: timing.exitEnd - timing.holdEnd, ease: 'power2.in' }, timing.holdEnd);
        }
      });
      ScrollTrigger.refresh();
      window.dispatchEvent(new CustomEvent('ostrum:narrative-ready'));
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
    globalLineIdx: number,
    isSupporting = false,
    isBrandSignoff = false
  ) => {
    const fontClass = isSupporting
      ? 'font-sans font-medium text-[clamp(18px,1.8vw,26px)] leading-[1.2] tracking-[-0.01em]'
      : 'font-sans font-medium text-[clamp(28px,3.8vw,62px)] leading-[1.08] tracking-[-0.015em]';

    return (
      <div
        key={`${keyPrefix}-${globalLineIdx}`}
        className={`narrative-line-container relative inline-block my-0 text-center whitespace-nowrap ${
          isSupporting
            ? 'mt-6 md:mt-8'
            : isBrandSignoff
            ? 'mt-2 sm:mt-3 md:mt-4'
            : ''
        }`}
        data-line-index={globalLineIdx}
        data-is-supporting={isSupporting ? 'true' : 'false'}
        data-is-brand={isBrandSignoff ? 'true' : 'false'}
      >
        {/* Base Layer: Inactive Solid Muted Grey Letters */}
        <div
          className={`narrative-line-base ${fontClass} text-white/30 drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] select-none`}
        >
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

        {/* Fill Layer: Absolute Overlay with Pure White / Crimson OSTRUM Highlight, Horizontally Clipped with Complete Glyphs Clearance */}
        <div
          className="narrative-line-fill absolute inset-0 pointer-events-none select-none"
          data-fill-line-index={globalLineIdx}
          aria-hidden="true"
          style={{
            clipPath: 'inset(-35% 100% -45% 0px)',
            WebkitClipPath: 'inset(-35% 100% -45% 0px)',
          }}
        >
          <div
            className={`${fontClass} ${
              isSupporting
                ? 'text-white'
                : isBrandSignoff
                ? ''
                : 'drop-shadow-[0_4px_32px_rgba(255,255,255,0.25)]'
            }`}
          >
            {lineWords.map((word, wIdx) => (
              <span key={wIdx} className="inline-block whitespace-nowrap">
                {word.chars.map((ch, cIdx) => (
                  <span
                    key={cIdx}
                    className={`narrative-char-filled inline-block ${
                      isBrandSignoff || ch.isHighlight
                        ? 'text-[#C9362B]'
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
      className="relative w-full overflow-visible z-[25] select-none"
      aria-label="Ostrum Energy Narrative"
    >
      {/* Offscreen Measurement DOM: Accurately computes visual line wrapping with final font */}
      <div
        ref={measureContainerRef}
        className="opacity-0 pointer-events-none fixed -top-[9999px] -left-[9999px] w-[88vw] max-w-[1540px] px-4 sm:px-6 md:px-8 text-center"
        aria-hidden="true"
      >
        {narrative.beats.map((beat) => (
          <div key={beat.id} data-measure-beat={beat.id}>
            <div
              className="measure-primary font-sans font-medium text-[clamp(28px,3.8vw,62px)] leading-[1.08] tracking-[-0.015em] text-center"
              style={{ textWrap: 'balance' }}
            >
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
            {beat.brandSignoff ? (
              <div
                className="measure-brand font-sans font-medium text-[clamp(28px,3.8vw,62px)] leading-[1.08] tracking-[-0.015em] text-center mt-2 sm:mt-3 md:mt-4"
              >
                {tokenizeTextWithHighlights(beat.brandSignoff, beat.brandSignoff).map((word, wIdx) => (
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
            {beat.supporting ? (
              <div className="measure-supporting font-sans font-medium text-[clamp(18px,1.8vw,26px)] leading-[1.2] tracking-[-0.01em] text-center mt-6 md:mt-8">
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
        className="w-full h-screen min-h-[640px] flex items-center justify-center relative overflow-hidden pointer-events-auto"
      >
        {/* Center Slot for Continuous 3D Sculpture Alignment */}
        <div
          id="section03-sculpture-slot"
          data-testid="ostrum-energy-3d-slot"
          className="absolute inset-0 m-auto w-full aspect-square max-w-[260px] sm:max-w-[330px] md:max-w-[400px] lg:max-w-[460px] pointer-events-none z-10 flex items-center justify-center"
        />

        {/* Centered Narrative Statements Container (Expanded to 88vw max 1540px) */}
        <div
          ref={beatsContainerRef}
          className="w-[88vw] max-w-[1540px] h-full relative z-20 flex items-center justify-center pointer-events-none mx-auto"
        >
          {narrative.beats.map((beat) => {
            const beatData = linesByBeat ? linesByBeat[beat.id] : null;

            return (
              <div
                key={beat.id}
                className="narrative-beat-card absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-auto w-full"
                style={{ opacity: 0 }}
              >
                <div className="w-full max-w-[1540px] mx-auto px-4 sm:px-6 md:px-8 text-center flex flex-col items-center justify-center">
                  {beatData ? (
                    <div className="w-full flex flex-col items-center">
                      {/* Primary Statement Lines */}
                      <div className="w-full flex flex-col items-center">
                        {beatData.primaryLines.map((lineWords, lineIdx) =>
                          renderLine(lineWords, `${beat.id}-p`, lineIdx, false, false)
                        )}
                      </div>

                      {/* Brand Signoff Line (OSTRUM) */}
                      {beatData.brandLines && beatData.brandLines.length > 0 && (
                        <div className="w-full flex flex-col items-center">
                          {beatData.brandLines.map((lineWords, lineIdx) =>
                            renderLine(
                              lineWords,
                              `${beat.id}-b`,
                              beatData.primaryLines.length + lineIdx,
                              false,
                              true
                            )
                          )}
                        </div>
                      )}

                      {/* Supporting Line */}
                      {beatData.supportingLines.length > 0 && (
                        <div className="w-full flex flex-col items-center">
                          {beatData.supportingLines.map((lineWords, lineIdx) =>
                            renderLine(
                              lineWords,
                              `${beat.id}-s`,
                              beatData.primaryLines.length +
                                (beatData.brandLines?.length || 0) +
                                lineIdx,
                              true,
                              false
                            )
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Fallback before measurement finishes
                    <div className="w-full flex flex-col items-center">
                      <div className="font-sans font-medium text-[clamp(28px,3.8vw,62px)] leading-[1.08] tracking-[-0.015em] text-white/30 text-center">
                        {beat.primary}
                      </div>
                      {beat.brandSignoff ? (
                        <div className="font-sans font-medium text-[clamp(28px,3.8vw,62px)] leading-[1.08] tracking-[-0.015em] text-white/30 text-center mt-2 sm:mt-3 md:mt-4">
                          {beat.brandSignoff}
                        </div>
                      ) : null}
                      {beat.supporting ? (
                        <div className="font-sans font-medium text-[clamp(18px,1.8vw,26px)] leading-[1.2] tracking-[-0.01em] text-white/30 text-center mt-6 md:mt-8">
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
