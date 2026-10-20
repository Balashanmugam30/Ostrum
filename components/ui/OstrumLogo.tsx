'use client';

import React, { useEffect, useRef } from 'react';

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
    let targetScrollY = window.scrollY;
    let currentScrollY = window.scrollY;

    const onScroll = () => {
      targetScrollY = window.scrollY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // Differential UPWARD factors matching reference:
    // Negative factors ensure that as scrollY increases (user scrolls down),
    // the transform translates UPWARD (negative Y in SVG/CSS space).
    // Center letters elevate with greater lift, creating a dignified parabolic ascension.
    const factors = [-0.22, -0.30, -0.38, -0.38, -0.30, -0.22];

    const tick = () => {
      animId = requestAnimationFrame(tick);
      // Smooth damped interpolation
      currentScrollY += (targetScrollY - currentScrollY) * 0.12;

      for (let i = 0; i < factors.length; i++) {
        const el = groupRefs.current[i];
        if (el) {
          const y = currentScrollY * factors[i];
          el.style.transform = `translate3d(0px, ${y.toFixed(2)}px, 0px)`;
        }
      }
    };

    tick();

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
