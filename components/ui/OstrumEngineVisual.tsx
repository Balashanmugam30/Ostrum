'use client';

import React, { useEffect, useRef, useState } from 'react';

interface OstrumEngineVisualProps {
  activeEngine: 'studio' | 'foundry' | null;
  scrollProgress?: number;
  className?: string;
  onSelectEngine?: (engine: 'studio' | 'foundry') => void;
}

export function OstrumEngineVisual({
  activeEngine,
  scrollProgress = 1,
  className = '',
  onSelectEngine,
}: OstrumEngineVisualProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalProgress, setInternalProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mouseBias, setMouseBias] = useState({ x: 0, y: 0 });

  // Path refs for dynamic animation
  const leftPathRef = useRef<SVGPathElement>(null);
  const rightPathRef = useRef<SVGPathElement>(null);
  const trunkPathRef = useRef<SVGPathElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Measure scroll progress dynamically if not passed from parent
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(media.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    media.addEventListener('change', handleMediaChange);

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 800;
      // Start revealing when top is 85% into viewport, complete when center passes top 25%
      const start = viewportHeight * 0.85;
      const end = viewportHeight * 0.15;
      const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
      setInternalProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      media.removeEventListener('change', handleMediaChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Gentle mouse reactivity
  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
      const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setMouseBias({ x: normX * 12, y: normY * 8 });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [prefersReducedMotion]);

  // Unified organic wave modulation
  useEffect(() => {
    if (prefersReducedMotion) return;

    let startTime = performance.now();
    let isVisible = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const animate = (time: number) => {
      if (isVisible) {
        const elapsed = (time - startTime) * 0.001;
        // Subtle harmonic oscillations
        const waveA = Math.sin(elapsed * 1.4) * 3;
        const waveB = Math.cos(elapsed * 1.8) * 2.5;

        // Trunk coordinates: (500, 48) -> (500, 150)
        const trunkD = `M 500 48 L 500 150`;

        // Left branch (Studio): (500, 150) -> through control points -> (170, 560)
        const leftCP1X = 490 - waveA * 0.6;
        const leftCP1Y = 250 + waveB * 0.4;
        const leftCP2X = 300 + waveA * 1.2 + mouseBias.x * 0.5;
        const leftCP2Y = 390 + waveB * 0.8 + mouseBias.y * 0.3;
        const leftEndX = 170 + mouseBias.x * 0.2;
        const leftEndY = 560;
        const leftD = `M 500 150 C ${leftCP1X} ${leftCP1Y}, ${leftCP2X} ${leftCP2Y}, ${leftEndX} ${leftEndY}`;

        // Right branch (Foundry): (500, 150) -> through control points -> (830, 560)
        const rightCP1X = 510 + waveA * 0.6;
        const rightCP1Y = 250 + waveB * 0.4;
        const rightCP2X = 700 - waveA * 1.2 + mouseBias.x * 0.5;
        const rightCP2Y = 390 + waveB * 0.8 + mouseBias.y * 0.3;
        const rightEndX = 830 + mouseBias.x * 0.2;
        const rightEndY = 560;
        const rightD = `M 500 150 C ${rightCP1X} ${rightCP1Y}, ${rightCP2X} ${rightCP2Y}, ${rightEndX} ${rightEndY}`;

        if (trunkPathRef.current) trunkPathRef.current.setAttribute('d', trunkD);
        if (leftPathRef.current) leftPathRef.current.setAttribute('d', leftD);
        if (rightPathRef.current) rightPathRef.current.setAttribute('d', rightD);
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      observer.disconnect();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [prefersReducedMotion, mouseBias]);

  const effectiveProgress = prefersReducedMotion ? 1 : internalProgress;

  // Dash offset calculations for scroll drawing
  // Approximate path length: ~580
  const pathLength = 620;
  const drawOffset = pathLength * (1 - Math.min(1, Math.max(0, (effectiveProgress - 0.2) / 0.65)));
  const trunkLength = 110;
  const trunkOffset = trunkLength * (1 - Math.min(1, Math.max(0, effectiveProgress / 0.25)));

  // Interactive branch styling
  const isStudioActive = activeEngine === 'studio';
  const isFoundryActive = activeEngine === 'foundry';

  const leftBranchOpacity = isFoundryActive ? 0.35 : isStudioActive ? 1 : 0.85;
  const rightBranchOpacity = isStudioActive ? 0.35 : isFoundryActive ? 1 : 0.85;

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-[1180px] mx-auto select-none pointer-events-auto ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1000 640"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto overflow-visible block"
      >
        <defs>
          {/* Luminous Glow Filter */}
          <filter id="engine-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" result="blur1" />
            <feGaussianBlur stdDeviation="2.5" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Core Radiant Atmosphere Filter */}
          <filter id="core-bloom" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="16" result="bigBlur" />
            <feMerge>
              <feMergeNode in="bigBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradients */}
          <linearGradient id="trunk-grad" x1="500" y1="48" x2="500" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#ff5c4a" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#ff4533" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="left-branch-grad" x1="500" y1="150" x2="170" y2="560" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff4533" />
            <stop offset="45%" stopColor="#ff5c4a" />
            <stop offset="85%" stopColor="#ff7b6b" />
            <stop offset="100%" stopColor="#ffa294" />
          </linearGradient>

          <linearGradient id="right-branch-grad" x1="500" y1="150" x2="830" y2="560" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff4533" />
            <stop offset="45%" stopColor="#ff5c4a" />
            <stop offset="85%" stopColor="#ff8573" />
            <stop offset="100%" stopColor="#ffa294" />
          </linearGradient>

          <radialGradient id="core-glow-radial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff5c4a" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#ff3320" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ff3320" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="terminal-glow-radial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff5c4a" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#ff3320" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ff3320" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ==============================================================
            ATMOSPHERIC BACKGROUND FIELD
            Soft background radiance behind core and divergence
            ============================================================== */}
        <circle
          cx="500"
          cy="75"
          r="110"
          fill="url(#core-glow-radial)"
          className="transition-opacity duration-700"
          style={{ opacity: Math.max(0.4, effectiveProgress) }}
        />
        <circle
          cx="500"
          cy="150"
          r="75"
          fill="url(#core-glow-radial)"
          className="transition-opacity duration-700"
          style={{ opacity: Math.max(0.2, effectiveProgress * 0.7) }}
        />

        {/* ==============================================================
            LAYER 1: DIFFUSION GLOW SLEEVES (Blurred background ribbons)
            ============================================================== */}
        <g opacity="0.4" filter="url(#engine-glow)">
          {/* Trunk sleeve */}
          <path
            d="M 500 48 L 500 150"
            stroke="#ff5c4a"
            strokeWidth="8"
            strokeLinecap="round"
            style={{
              strokeDasharray: trunkLength,
              strokeDashoffset: trunkOffset,
            }}
          />
          {/* Left sleeve */}
          <path
            ref={leftPathRef}
            d="M 500 150 C 490 250, 300 390, 170 560"
            stroke="#ff5c4a"
            strokeWidth="7"
            strokeLinecap="round"
            style={{
              opacity: leftBranchOpacity,
              strokeDasharray: pathLength,
              strokeDashoffset: drawOffset,
              transition: 'opacity 0.4s ease',
            }}
          />
          {/* Right sleeve */}
          <path
            ref={rightPathRef}
            d="M 500 150 C 510 250, 700 390, 830 560"
            stroke="#ff5c4a"
            strokeWidth="7"
            strokeLinecap="round"
            style={{
              opacity: rightBranchOpacity,
              strokeDasharray: pathLength,
              strokeDashoffset: drawOffset,
              transition: 'opacity 0.4s ease',
            }}
          />
        </g>

        {/* ==============================================================
            LAYER 2: SECONDARY HARMONIC ECHO STRANDS (Geometric texture)
            Thin delicate hairline paths running slightly adjacent
            ============================================================== */}
        <g opacity="0.35">
          <path
            d="M 496 48 L 496 150"
            stroke="#ffffff"
            strokeWidth="0.75"
            strokeDasharray="3 6"
            style={{
              strokeDasharray: '3 6',
              strokeDashoffset: trunkOffset,
            }}
          />
          <path
            d="M 504 48 L 504 150"
            stroke="#ffffff"
            strokeWidth="0.75"
            strokeDasharray="3 6"
            style={{
              strokeDasharray: '3 6',
              strokeDashoffset: trunkOffset,
            }}
          />
          {/* Left harmonic echo */}
          <path
            d="M 496 150 C 484 250, 290 392, 164 560"
            stroke="#ff8f7e"
            strokeWidth="0.8"
            strokeDasharray="4 6"
            style={{
              opacity: leftBranchOpacity,
              strokeDashoffset: drawOffset,
              transition: 'opacity 0.4s ease',
            }}
          />
          {/* Right harmonic echo */}
          <path
            d="M 504 150 C 516 250, 710 392, 836 560"
            stroke="#ff8f7e"
            strokeWidth="0.8"
            strokeDasharray="4 6"
            style={{
              opacity: rightBranchOpacity,
              strokeDashoffset: drawOffset,
              transition: 'opacity 0.4s ease',
            }}
          />
        </g>

        {/* ==============================================================
            LAYER 3: CORE ENERGY STRANDS (Crisp laser filigree)
            ============================================================== */}
        {/* Unified Trunk */}
        <path
          ref={trunkPathRef}
          d="M 500 48 L 500 150"
          stroke="url(#trunk-grad)"
          strokeWidth="2.75"
          strokeLinecap="round"
          style={{
            strokeDasharray: trunkLength,
            strokeDashoffset: trunkOffset,
          }}
        />

        {/* Left Branch (Studio) */}
        <path
          d="M 500 150 C 490 250, 300 390, 170 560"
          stroke="url(#left-branch-grad)"
          strokeWidth={isStudioActive ? 3.5 : 2.5}
          strokeLinecap="round"
          style={{
            opacity: leftBranchOpacity,
            strokeDasharray: pathLength,
            strokeDashoffset: drawOffset,
            transition: 'stroke-width 0.3s ease, opacity 0.4s ease',
          }}
        />

        {/* Right Branch (Foundry) */}
        <path
          d="M 500 150 C 510 250, 700 390, 830 560"
          stroke="url(#right-branch-grad)"
          strokeWidth={isFoundryActive ? 3.5 : 2.5}
          strokeLinecap="round"
          style={{
            opacity: rightBranchOpacity,
            strokeDasharray: pathLength,
            strokeDashoffset: drawOffset,
            transition: 'stroke-width 0.3s ease, opacity 0.4s ease',
          }}
        />

        {/* ==============================================================
            BRANCHING JUNCTION NODE (The Bifurcation Point)
            ============================================================== */}
        <g
          transform="translate(500, 150)"
          className="transition-transform duration-500"
          style={{
            opacity: Math.min(1, Math.max(0, (effectiveProgress - 0.15) / 0.2)),
          }}
        >
          {/* Subtle pulse ring */}
          <circle r="12" fill="none" stroke="#ff5c4a" strokeWidth="0.75" opacity="0.4" />
          <circle r="6" fill="#ff4533" opacity="0.8" />
          <circle r="2.5" fill="#ffffff" />
        </g>

        {/* ==============================================================
            TOP ORIGIN: THE OSTRUM CORE
            ============================================================== */}
        <g
          transform="translate(500, 48)"
          className="cursor-default"
          filter="url(#core-bloom)"
        >
          {/* Outer Breathing Rings */}
          <circle
            r="38"
            fill="none"
            stroke="#ff5c4a"
            strokeWidth="0.6"
            strokeDasharray="4 4"
            className={prefersReducedMotion ? '' : 'animate-[spin_40s_linear_infinite]'}
            opacity="0.35"
          />
          <circle
            r="26"
            fill="none"
            stroke="#ff7b6b"
            strokeWidth="0.75"
            opacity="0.5"
          />
          <circle
            r="16"
            fill="#140a09"
            stroke="#ff5c4a"
            strokeWidth="1.5"
          />
          {/* Solid white radiant center pin */}
          <circle r="5" fill="#ffffff" />
          <circle r="2" fill="#ff5c4a" />

          {/* Micro label */}
          <text
            y="-44"
            textAnchor="middle"
            fill="rgba(255,255,255,0.7)"
            className="font-mono text-[9px] tracking-[0.3em] uppercase select-none"
          >
            THE OSTRUM CORE
          </text>
        </g>

        {/* ==============================================================
            TERMINAL 01: STUDIO (Left Hub at 170, 560)
            ============================================================== */}
        <g
          transform="translate(170, 560)"
          onClick={() => onSelectEngine?.('studio')}
          className="cursor-pointer group"
          style={{
            opacity: Math.min(1, Math.max(0, (effectiveProgress - 0.55) / 0.35)),
            transition: 'opacity 0.4s ease',
          }}
        >
          {/* Atmospheric Terminal Halo */}
          <circle
            r="44"
            fill="url(#terminal-glow-radial)"
            className="transition-transform duration-300 group-hover:scale-125"
            style={{ opacity: isStudioActive ? 0.9 : 0.4 }}
          />

          {/* Orbit rings */}
          <circle
            r="28"
            fill="none"
            stroke={isStudioActive ? '#ff5c4a' : 'rgba(255, 92, 74, 0.4)'}
            strokeWidth="0.75"
            strokeDasharray="3 3"
            className={prefersReducedMotion ? '' : 'animate-[spin_25s_linear_infinite]'}
          />
          <circle
            r="18"
            fill="#120807"
            stroke={isStudioActive ? '#ffffff' : '#ff5c4a'}
            strokeWidth={isStudioActive ? '2' : '1.25'}
            className="transition-colors duration-200"
          />
          <circle
            r="5"
            fill={isStudioActive ? '#ff5c4a' : '#ffffff'}
            className="transition-colors duration-200"
          />

          {/* Terminal Coordinate / Indicator Label */}
          <text
            y="38"
            textAnchor="middle"
            fill={isStudioActive ? '#ff5c4a' : 'rgba(255,255,255,0.85)'}
            className="font-mono text-[10px] tracking-[0.24em] uppercase font-semibold transition-colors duration-200"
          >
            ENGINE 01 · STUDIO
          </text>
          <text
            y="52"
            textAnchor="middle"
            fill="rgba(255,255,255,0.4)"
            className="font-mono text-[8px] tracking-[0.2em] uppercase"
          >
            [SYSTEMS FOR BUSINESSES]
          </text>
        </g>

        {/* ==============================================================
            TERMINAL 02: FOUNDRY (Right Hub at 830, 560)
            ============================================================== */}
        <g
          transform="translate(830, 560)"
          onClick={() => onSelectEngine?.('foundry')}
          className="cursor-pointer group"
          style={{
            opacity: Math.min(1, Math.max(0, (effectiveProgress - 0.55) / 0.35)),
            transition: 'opacity 0.4s ease',
          }}
        >
          {/* Atmospheric Terminal Halo */}
          <circle
            r="44"
            fill="url(#terminal-glow-radial)"
            className="transition-transform duration-300 group-hover:scale-125"
            style={{ opacity: isFoundryActive ? 0.9 : 0.4 }}
          />

          {/* Orbit rings */}
          <circle
            r="28"
            fill="none"
            stroke={isFoundryActive ? '#ff5c4a' : 'rgba(255, 92, 74, 0.4)'}
            strokeWidth="0.75"
            strokeDasharray="3 3"
            className={prefersReducedMotion ? '' : 'animate-[spin_25s_linear_infinite_reverse]'}
          />
          <circle
            r="18"
            fill="#120807"
            stroke={isFoundryActive ? '#ffffff' : '#ff5c4a'}
            strokeWidth={isFoundryActive ? '2' : '1.25'}
            className="transition-colors duration-200"
          />
          <circle
            r="5"
            fill={isFoundryActive ? '#ff5c4a' : '#ffffff'}
            className="transition-colors duration-200"
          />

          {/* Terminal Coordinate / Indicator Label */}
          <text
            y="38"
            textAnchor="middle"
            fill={isFoundryActive ? '#ff5c4a' : 'rgba(255,255,255,0.85)'}
            className="font-mono text-[10px] tracking-[0.24em] uppercase font-semibold transition-colors duration-200"
          >
            ENGINE 02 · FOUNDRY
          </text>
          <text
            y="52"
            textAnchor="middle"
            fill="rgba(255,255,255,0.4)"
            className="font-mono text-[8px] tracking-[0.2em] uppercase"
          >
            [ORIGINAL VENTURES & PRODUCTS]
          </text>
        </g>
      </svg>
    </div>
  );
}
