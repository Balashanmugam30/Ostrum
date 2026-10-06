'use client';

import React, { useEffect, useState } from 'react';

interface OstrumLogoProps {
  className?: string;
  hasParallax?: boolean;
}

export function OstrumLogo({ className = '', hasParallax = false }: OstrumLogoProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!hasParallax) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasParallax]);

  // Differential parallax factors matching reference:
  // Outer letters move slower, inner letters accelerate
  const letterTransforms = hasParallax
    ? [
        `translate3d(0px, ${scrollY * 0.08}px, 0px)`,
        `translate3d(0px, ${scrollY * 0.18}px, 0px)`,
        `translate3d(0px, ${scrollY * 0.35}px, 0px)`,
        `translate3d(0px, ${scrollY * 0.35}px, 0px)`,
        `translate3d(0px, ${scrollY * 0.18}px, 0px)`,
        `translate3d(0px, ${scrollY * 0.08}px, 0px)`,
      ]
    : [undefined, undefined, undefined, undefined, undefined, undefined];

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
      {letters.map((item, i) => (
        <g
          key={item.char}
          className="letter is-inview"
          style={{
            transform: letterTransforms[i],
            transition: 'transform 0.1s linear',
            willChange: hasParallax ? 'transform' : 'auto',
          }}
        >
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
        </g>
      ))}
    </svg>
  );
}
