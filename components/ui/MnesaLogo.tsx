import React from 'react';

interface MnesaLogoProps {
  className?: string;
  size?: number;
  variant?: 'mark' | 'full';
  monochrome?: boolean;
  accentColor?: string;
}

/**
 * Bespoke scalable SVG mark & wordmark for MNESA (Opportunity Capture & Follow-Through Platform)
 * Art direction: 3 structured geometric facets forming an 'M' silhouette with an intelligent
 * central memory aperture/anchor node. Suggests: SEE -> CAPTURE -> REMEMBER -> ACT.
 */
export function MnesaLogo({
  className = '',
  size = 36,
  variant = 'mark',
  monochrome = false,
  accentColor = '#2563EB',
}: MnesaLogoProps) {
  const primaryColor = monochrome ? 'currentColor' : accentColor;
  const darkFacet = monochrome ? 'currentColor' : '#0F172A';

  return (
    <div
      className={`inline-flex items-center gap-2.5 ${className}`}
      aria-label="MNESA - Opportunity Capture Platform"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        role="img"
        aria-hidden="true"
      >
        {/* Left Vertical Capture Pillar */}
        <path
          d="M8 38V12C8 10.8954 8.89543 10 10 10H14C15.1046 10 16 10.8954 16 12V38H8Z"
          fill={darkFacet}
        />
        {/* Right Vertical Completion Pillar */}
        <path
          d="M32 38V12C32 10.8954 32.8954 10 34 10H38C39.1046 10 40 10.8954 40 12V38H32Z"
          fill={darkFacet}
        />
        {/* Left Angled Converging Track */}
        <path
          d="M16 14L22.2 24.8C22.9 26 25.1 26 25.8 24.8L32 14H26.8L24 19L21.2 14H16Z"
          fill={primaryColor}
        />
        {/* Central Memory & Follow-Through Node (Diamond Aperture) */}
        <path
          d="M24 23L27.5 28L24 33L20.5 28L24 23Z"
          fill={primaryColor}
        />
        {/* Lower Grounding Baseline Indicator */}
        <circle cx="24" cy="38" r="2.5" fill={primaryColor} />
      </svg>

      {variant === 'full' && (
        <span
          className="font-sans font-bold tracking-wider text-base sm:text-lg leading-none select-none uppercase"
          style={{ color: monochrome ? 'currentColor' : '#0F172A' }}
        >
          MNESA
        </span>
      )}
    </div>
  );
}

export default MnesaLogo;
