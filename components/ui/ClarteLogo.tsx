'use client';

import React, { useEffect, useState } from 'react';

interface ClarteLogoProps {
  className?: string;
  hasParallax?: boolean;
}

export function ClarteLogo({ className = '', hasParallax = false }: ClarteLogoProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!hasParallax) return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasParallax]);

  // Differential parallax factors matching Clarté's data-scroll-speed:
  // C: 0.1, L: 0.3, A: 0.75, R: 0.75, T: 0.3, É: 0.1
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

  return (
    <svg
      viewBox="0 0 1253 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ overflow: 'visible' }}
      aria-label="CLARTÉ"
      role="img"
    >
      {/* Letter C */}
      <g
        className="letter is-inview"
        style={{
          transform: letterTransforms[0],
          transition: 'transform 0.1s linear',
          willChange: hasParallax ? 'transform' : 'auto',
        }}
      >
        <path
          d="M123.55 351.05C57.05 351.05 0 299.25 0 223.3C0 147.35 56.7 93.45 126 93.45C150.15 93.45 165.2 99.75 178.15 99.75C187.25 99.75 194.25 97.65 191.1 86.45L196.7 85.05L215.95 157.5L210 159.25C193.55 116.55 158.55 100.8 124.95 100.8C62.3 100.8 23.45 155.75 23.45 221.2C23.45 295.4 73.5 340.2 128.45 340.2C162.4 340.2 198.8 323.4 218.4 288.05L223.65 291.55C200.9 333.2 163.1 351.05 123.55 351.05Z"
          fill="currentColor"
        />
      </g>

      {/* Letter L */}
      <g
        className="letter is-inview"
        style={{
          transform: letterTransforms[1],
          transition: 'transform 0.1s linear',
          willChange: hasParallax ? 'transform' : 'auto',
        }}
      >
        <path
          d="M388.25 358.05C391.4 346.85 384.75 344.75 372.85 344.75H231.8V338.8C254.2 338.8 261.2 334.6 261.2 294.35V150.15C261.2 109.9 254.9 105.7 231.8 105.7V99.75H310.9V105.7C287.8 105.7 281.5 109.9 281.5 150.15V311.85C281.5 334.6 288.15 337.4 321.05 337.4H332.25C386.5 337.4 394.55 323.75 409.6 279.3L415.55 281.05L393.85 359.45L388.25 358.05Z"
          fill="currentColor"
        />
      </g>

      {/* Letter A */}
      <g
        className="letter is-inview"
        style={{
          transform: letterTransforms[2],
          transition: 'transform 0.1s linear',
          willChange: hasParallax ? 'transform' : 'auto',
        }}
      >
        <path
          d="M564.8 338.8C589.65 338.8 597 329.35 584.75 297.5L570.4 260.05H469.25L457.35 290.85C444.05 325.5 455.95 338.8 483.25 338.8V344.75H409.05V338.8C428.3 338.8 436.35 323.75 449.3 290.15L515.8 117.6L510.55 103.95V101.85C517.2 98 520.7 94.15 524.55 87.5H526.65L607.15 297.5C619.4 329.35 623.95 338.8 641.1 338.8V344.75H564.8V338.8ZM472.05 252.35H567.6L519.65 128.1L472.05 252.35Z"
          fill="currentColor"
        />
      </g>

      {/* Letter R */}
      <g
        className="letter is-inview"
        style={{
          transform: letterTransforms[3],
          transition: 'transform 0.1s linear',
          willChange: hasParallax ? 'transform' : 'auto',
        }}
      >
        <path
          d="M646.8 338.8C669.9 338.8 676.2 334.6 676.2 294.35V150.15C676.2 109.9 669.9 105.7 646.8 105.7V99.75H738.85C792.05 99.75 822.85 122.5 822.85 157.15C822.85 189.7 795.55 212.45 753.2 218.4L792.75 268.8C836.85 324.8 848.05 338.8 870.1 338.8V344.75H825.65C812 325.85 799.4 309.4 772.8 275.1L729.75 219.8H696.5V294.35C696.5 334.6 702.8 338.8 725.9 338.8V344.75H646.8V338.8ZM696.5 212.45H731.15C768.6 212.45 800.45 195.3 800.45 158.55C800.45 130.2 781.2 107.1 739.55 107.1H734.65C703.5 107.1 696.5 109.9 696.5 132.65V212.45Z"
          fill="currentColor"
        />
      </g>

      {/* Letter T */}
      <g
        className="letter is-inview"
        style={{
          transform: letterTransforms[4],
          transition: 'transform 0.1s linear',
          willChange: hasParallax ? 'transform' : 'auto',
        }}
      >
        <path
          d="M909.2 338.8C935.1 338.8 942.1 334.6 942.1 294.35V132.3C942.1 113.75 936.15 107.1 917.6 107.1H903.25C870.35 107.1 859.85 128.1 844.45 164.15L838.5 162.4L856.7 86.8L862.3 88.2C859.15 99.4 866.15 99.75 878.05 99.75H1026.8C1038.7 99.75 1045.35 99.4 1042.2 88.2L1047.8 86.8L1066 162.4L1060.05 164.15C1044.65 128.1 1034.15 107.1 1001.6 107.1H986.9C968.35 107.1 962.4 113.4 962.4 132.3V294.35C962.4 334.6 969.4 338.8 995.3 338.8V344.75H909.2V338.8Z"
          fill="currentColor"
        />
      </g>

      {/* Letter É */}
      <g
        className="letter is-inview"
        style={{
          transform: letterTransforms[5],
          transition: 'transform 0.1s linear',
          willChange: hasParallax ? 'transform' : 'auto',
        }}
      >
        <path
          d="M1228.25 358.05C1231.4 346.85 1224.75 344.75 1212.85 344.75H1071.8V338.8C1094.9 338.8 1101.2 334.6 1101.2 294.35V150.15C1101.2 109.9 1094.9 105.7 1071.8 105.7V99.75H1205.85C1217.75 99.75 1224.4 97.65 1221.25 86.45L1226.85 85.05L1243.3 146.65L1237.35 148.4C1223.35 118.3 1215.65 107.1 1168.05 107.1H1157.55C1124.65 107.1 1121.5 109.9 1121.5 132.65V212.45H1147.05C1182.05 212.45 1185.2 202.65 1185.2 173.6H1192.2V258.3H1185.2C1185.2 227.5 1181.35 219.8 1147.4 219.8H1121.5V311.85C1121.5 334.6 1124.65 337.4 1157.55 337.4H1178.55C1219.15 337.4 1232.45 328.65 1245.4 291.55L1252.05 293.3L1233.85 359.45L1228.25 358.05ZM1142.85 65.8L1186.95 6.3C1190.1 2.10001 1193.6 0 1197.45 0C1202.35 0 1207.25 4.20001 1207.25 9.80002C1207.25 13.65 1205.15 17.15 1200.95 21L1146.35 69.3L1142.85 65.8Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
