'use client';

import React, { useEffect, useRef } from 'react';
import { isHandheldTouchDevice } from '@/lib/device-tier';

interface OstrumLogoProps {
  className?: string;
  hasParallax?: boolean;
  isScrolled?: boolean;
  variant?: 'hero' | 'intro';
  idPrefix?: string;
  onLetterRefs?: (refs: (SVGGElement | null)[]) => void;
}

export function OstrumLogo({
  className = '',
  hasParallax = false,
  isScrolled = false,
  variant = 'hero',
  idPrefix,
  onLetterRefs,
}: OstrumLogoProps) {
  const groupRefs = useRef<(SVGGElement | null)[]>([]);

  useEffect(() => {
    if (onLetterRefs) {
      onLetterRefs(groupRefs.current);
    }
  }, [onLetterRefs]);

  useEffect(() => {
    if (!hasParallax) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    let animId: number;
    let targetScrollY = Math.max(0, window.scrollY);
    let currentScrollY = targetScrollY;
    let previousFrameTime = performance.now();

    const onScroll = () => {
      targetScrollY = Math.max(0, window.scrollY);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // Differential UPWARD factors matching reference:
    // Negative factors ensure that as scrollY increases (user scrolls down),
    // the transform translates UPWARD (negative Y in SVG/CSS space).
    // Center letters elevate with greater lift, creating a dignified parabolic ascension.
    const factors = [-0.22, -0.30, -0.38, -0.38, -0.30, -0.22];

    const tick = (time: number) => {
      animId = requestAnimationFrame(tick);
      const isPhoneTouch = isHandheldTouchDevice();
      // The passive scroll event may be coalesced during touch flings. Sample
      // the live offset on phones (both narrow mobile and desktop-site mode)
      // so the hero letters cannot keep a stale transform at the top.
      if (isPhoneTouch) targetScrollY = Math.max(0, window.scrollY);
      // Keep the existing desktop response on non-touch laptops.
      if (isPhoneTouch && targetScrollY <= 8) {
        currentScrollY = 0;
      } else if (isPhoneTouch) {
        const elapsed = Math.min(64, time - previousFrameTime);
        const alpha = 1 - Math.exp(-elapsed / 80);
        currentScrollY += (targetScrollY - currentScrollY) * alpha;
      } else {
        currentScrollY += (targetScrollY - currentScrollY) * 0.12;
      }
      previousFrameTime = time;

      for (let i = 0; i < factors.length; i++) {
        const el = groupRefs.current[i];
        if (el) {
          const y = currentScrollY * factors[i];
          el.style.transform = `translate3d(0px, ${y.toFixed(2)}px, 0px)`;
        }
      }
    };

    tick(performance.now());

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', onScroll);
    };
  }, [hasParallax]);

  const letters = [
    { char: 'O', x: 0 },
    { char: 'S', x: 226 },
    { char: 'T', x: 394 },
    { char: 'R', x: 594 },
    { char: 'U', x: 794 },
    { char: 'M', x: 1004 },
  ];

  return (
    <svg
      viewBox="0 0 1253 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ overflow: 'visible' }}
      aria-label="OSTRUM"
      role="img"
    >
      {letters.map((item, i) => {
        const isLetterO = item.char === 'O';
        const isOutlinedO = isLetterO && (hasParallax || variant === 'intro');
        const letterId = idPrefix
          ? `${idPrefix}-letter-${item.char}`
          : isLetterO && hasParallax
          ? 'hero-ostrum-o'
          : undefined;

        return (
          <g
            key={item.char}
            id={letterId}
            data-letter={item.char}
            aria-hidden="true"
            ref={(el) => {
              groupRefs.current[i] = el;
            }}
            className="letter is-inview"
            style={{
              willChange: hasParallax ? 'transform' : 'auto',
            }}
          >
            {isOutlinedO ? (
              <text
                x={item.x}
                y="266"
                fill="currentColor"
                fillOpacity={isScrolled ? 1 : 0.16}
                stroke="currentColor"
                strokeWidth={isScrolled ? 0 : 1.4}
                strokeOpacity={isScrolled ? 0 : 0.85}
                fontFamily="'Romie', Georgia, serif"
                fontSize="268"
                fontWeight="400"
                letterSpacing="-0.01em"
                style={{
                  transition: 'fill-opacity 0.45s ease, stroke-opacity 0.45s ease',
                }}
              >
                {item.char}
              </text>
            ) : (
              <text
                x={item.x}
                y="266"
                fill="currentColor"
                fontFamily="'Romie', Georgia, serif"
                fontSize="268"
                fontWeight="400"
                letterSpacing="-0.01em"
              >
                {item.char}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
