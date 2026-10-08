'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface Dossier25DProps {
  className?: string;
  flipHint?: string;
}

export function Dossier25D({
  className = '',
  flipHint = 'Inspect reverse',
}: Dossier25DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);

  const [isFlipped, setIsFlipped] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Animation values stored in refs for 120fps RAF loop without React re-render overhead
  const stateRef = useRef({
    currentRotX: 3,
    currentRotY: -16,
    targetRotX: 3,
    targetRotY: -16,
    scrollProgress: 0,
    mouseX: 0,
    mouseY: 0,
    isHovered: false,
    isFlipped: false,
  });

  // Keep stateRef.current.isFlipped in sync
  useEffect(() => {
    stateRef.current.isFlipped = isFlipped;
  }, [isFlipped]);

  // Reduced motion preference detection
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Scroll tracking with RAF
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight || 800;
      // Normalized progress: 0 when top enters viewport, 1 when bottom leaves
      const totalDist = windowHeight + rect.height;
      const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / totalDist));
      stateRef.current.scrollProgress = progress;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Mouse tilt tracking (desktop only)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || window.innerWidth < 768) return;
    const rect = container.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1
    stateRef.current.mouseX = nx;
    stateRef.current.mouseY = ny;
    stateRef.current.isHovered = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    stateRef.current.mouseX = 0;
    stateRef.current.mouseY = 0;
    stateRef.current.isHovered = false;
  }, []);

  // Main 120 FPS RAF Lerp Loop
  useEffect(() => {
    let animId: number;

    const updateLoop = () => {
      const state = stateRef.current;
      const card = cardRef.current;
      const shadow = shadowRef.current;
      const sheen = sheenRef.current;

      if (reducedMotion) {
        if (card) {
          const rotY = state.isFlipped ? 180 : -14;
          card.style.transform = `perspective(1200px) rotateY(${rotY}deg) rotateX(2deg)`;
        }
        return;
      }

      // Compute target rotation from scroll progress
      // Progress 0..0.3: entering, angled (-20deg)
      // Progress 0.3..0.6: front facing (-8deg -> 0deg)
      // Progress 0.6..0.85: exposes side & depth (+22deg)
      // Progress 0.85..1.0: settles (+12deg)
      const p = state.scrollProgress;
      let baseRotY = -18;
      let baseRotX = 3;

      if (p < 0.35) {
        const t = p / 0.35;
        baseRotY = -22 + t * 14; // -22 to -8
        baseRotX = 4 - t * 2; // 4 to 2
      } else if (p < 0.65) {
        const t = (p - 0.35) / 0.3;
        baseRotY = -8 + t * 10; // -8 to +2 (near front)
        baseRotX = 2 - t * 2; // 2 to 0
      } else if (p < 0.9) {
        const t = (p - 0.65) / 0.25;
        baseRotY = 2 + t * 22; // 2 to 24 (reveal edge)
        baseRotX = 0 - t * 3; // 0 to -3
      } else {
        const t = (p - 0.9) / 0.1;
        baseRotY = 24 - t * 10; // settles to 14
        baseRotX = -3 + t * 2;
      }

      // Add flip angle (180 deg when flipped)
      const flipOffset = state.isFlipped ? 180 : 0;

      // Mouse tilt contribution (subtle: max 2.5 deg)
      const mouseTiltY = state.isHovered ? state.mouseX * 3.5 : 0;
      const mouseTiltX = state.isHovered ? -state.mouseY * 2.5 : 0;

      state.targetRotY = baseRotY + flipOffset + mouseTiltY;
      state.targetRotX = baseRotX + mouseTiltX;

      // Smooth damped lerp
      const lerpFactor = 0.085;
      state.currentRotY += (state.targetRotY - state.currentRotY) * lerpFactor;
      state.currentRotX += (state.targetRotX - state.currentRotX) * lerpFactor;

      // Apply transform to 3D card
      if (card) {
        card.style.transform = `perspective(1200px) rotateX(${state.currentRotX.toFixed(2)}deg) rotateY(${state.currentRotY.toFixed(2)}deg)`;
      }

      // Apply dynamic shadow skew & scale
      if (shadow) {
        const skewAmount = Math.sin((state.currentRotY * Math.PI) / 180) * 14;
        const scaleX = Math.max(0.65, Math.abs(Math.cos((state.currentRotY * Math.PI) / 180)));
        shadow.style.transform = `translateX(-50%) rotateX(85deg) skewX(${skewAmount.toFixed(1)}deg) scaleX(${scaleX.toFixed(2)})`;
      }

      // Specular sheen highlight translation
      if (sheen) {
        const sheenPos = 50 + (state.currentRotY % 180) * 0.8;
        sheen.style.background = `linear-gradient(${115 + (state.currentRotY % 180) * 0.5}deg, transparent ${sheenPos - 25}%, rgba(255,255,255,0.07) ${sheenPos}%, transparent ${sheenPos + 25}%)`;
      }

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, [reducedMotion]);

  // Intermediate slices depth array (8 layers for physical volume)
  // Total thickness = 22px (-11px to +11px)
  const depthSlices = [8, 5, 2, -1, -4, -7, -9];

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-full flex flex-col items-center justify-center select-none ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Soft Crimson Caustic Light Wash */}
      <div
        className="absolute inset-0 -inset-x-4 -inset-y-8 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(215,35,35,0.18)_0%,rgba(65,8,8,0.06)_52%,transparent_75%)] pointer-events-none blur-3xl -z-10"
        aria-hidden="true"
      />

      {/* 3D Dossier Object Wrapper */}
      <div
        className="relative w-[260px] xs:w-[280px] sm:w-[320px] md:w-[350px] lg:w-[380px] xl:w-[400px] aspect-[540/800] cursor-pointer"
        style={{ perspective: '1200px' }}
        onClick={() => setIsFlipped((prev) => !prev)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsFlipped((prev) => !prev);
          }
        }}
        aria-label="Ostrum Foundry Dossier folio. Click or tap to inspect reverse."
      >
        {/* The 2.5D Multilayer Card */}
        <div
          ref={cardRef}
          className="relative w-full h-full will-change-transform rounded-[8px]"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'perspective(1200px) rotateY(-16deg) rotateX(3deg)',
          }}
        >
          {/* ==============================================================
              FRONT COVER FACE (OSTRUM FOUNDRY)
              translateZ(11px)
              ============================================================== */}
          <div
            className="absolute inset-0 rounded-[8px] overflow-hidden bg-[#0c0c0e] shadow-2xl"
            style={{
              transform: 'translateZ(11px)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {/* Front Cover Artwork */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/foundry-dossier-front.webp"
              alt="Ostrum Foundry Dossier Front Cover"
              className="w-full h-full object-cover pointer-events-none"
              loading="eager"
            />

            {/* Specular Light Sheen Overlay */}
            <div
              ref={sheenRef}
              className="absolute inset-0 pointer-events-none mix-blend-screen"
              aria-hidden="true"
            />

            {/* Inner Hardcover Rim Bevel */}
            <div
              className="absolute inset-0 rounded-[8px] ring-1 ring-inset ring-white/10 pointer-events-none"
              aria-hidden="true"
            />
          </div>

          {/* ==============================================================
              STACKED OFFSET 2.5D SLICES (PAPER BLOCK THICKNESS)
              Shifted in Z with tonal darkening for bound volume effect
              ============================================================== */}
          {depthSlices.map((z, idx) => (
            <div
              key={idx}
              className="absolute inset-0 rounded-[8px] pointer-events-none border border-black/80"
              style={{
                transform: `translateZ(${z}px)`,
                backgroundColor: idx % 2 === 0 ? '#101014' : '#141418',
                opacity: 0.95 - idx * 0.05,
              }}
              aria-hidden="true"
            />
          ))}

          {/* ==============================================================
              LEFT BOUND SPINE (PHYSICAL 3D PLANE)
              Width: 22px, rotated -90deg around Y
              ============================================================== */}
          <div
            className="absolute left-0 top-0 w-[22px] h-full pointer-events-none rounded-l-[4px]"
            style={{
              transformOrigin: 'left center',
              transform: 'rotateY(-90deg) translateZ(0px)',
              background:
                'linear-gradient(to right, #0a0a0c 0%, #1e1e24 45%, #141418 80%, #0a0a0c 100%)',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              boxShadow: 'inset 0 0 4px rgba(0,0,0,0.8)',
            }}
            aria-hidden="true"
          >
            {/* Debossed Spine Bands */}
            <div className="absolute top-12 left-0 right-0 h-[2px] bg-black/60 shadow-[0_1px_0_rgba(255,255,255,0.08)]" />
            <div className="absolute bottom-12 left-0 right-0 h-[2px] bg-black/60 shadow-[0_1px_0_rgba(255,255,255,0.08)]" />
          </div>

          {/* ==============================================================
              RIGHT PAGES EDGE (RIBBED TEXTURED PAPER BLOCK)
              Width: 22px, rotated +90deg around Y
              ============================================================== */}
          <div
            className="absolute right-0 top-0 w-[22px] h-full pointer-events-none rounded-r-[3px]"
            style={{
              transformOrigin: 'right center',
              transform: 'rotateY(90deg) translateZ(0px)',
              background:
                'repeating-linear-gradient(to bottom, #d4cebe 0px, #baa996 1px, #d4cebe 2px)',
              boxShadow:
                'inset 2px 0 6px rgba(0,0,0,0.6), inset -2px 0 6px rgba(0,0,0,0.6)',
              borderTop: '1px solid #baa996',
              borderBottom: '1px solid #baa996',
            }}
            aria-hidden="true"
          />

          {/* ==============================================================
              TOP & BOTTOM PAPER EDGES
              Height: 22px, rotated ±90deg around X
              ============================================================== */}
          <div
            className="absolute left-0 top-0 w-full h-[22px] pointer-events-none"
            style={{
              transformOrigin: 'center top',
              transform: 'rotateX(90deg) translateZ(0px)',
              background:
                'repeating-linear-gradient(to right, #d4cebe 0px, #baa996 1px, #d4cebe 2px)',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)',
            }}
            aria-hidden="true"
          />
          <div
            className="absolute left-0 bottom-0 w-full h-[22px] pointer-events-none"
            style={{
              transformOrigin: 'center bottom',
              transform: 'rotateX(-90deg) translateZ(0px)',
              background:
                'repeating-linear-gradient(to right, #d4cebe 0px, #baa996 1px, #d4cebe 2px)',
              boxShadow: 'inset 0 -2px 6px rgba(0,0,0,0.6)',
            }}
            aria-hidden="true"
          />

          {/* ==============================================================
              BACK COVER FACE (POWERED BY OSTRUM)
              rotateY(180deg) translateZ(11px)
              ============================================================== */}
          <div
            className="absolute inset-0 rounded-[8px] overflow-hidden bg-[#0c0c0e] shadow-2xl"
            style={{
              transform: 'rotateY(180deg) translateZ(11px)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {/* Back Cover Artwork */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/foundry-dossier-back.webp"
              alt="Powered by Ostrum Dossier Back Cover"
              className="w-full h-full object-cover pointer-events-none"
              loading="lazy"
            />

            {/* Inner Hardcover Rim Bevel */}
            <div
              className="absolute inset-0 rounded-[8px] ring-1 ring-inset ring-white/10 pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Dynamic Floor Contact Shadow */}
        <div
          ref={shadowRef}
          className="absolute -bottom-10 left-1/2 w-[85%] h-9 rounded-full bg-black/90 blur-xl pointer-events-none will-change-transform"
          style={{
            transform: 'translateX(-50%) rotateX(85deg)',
          }}
          aria-hidden="true"
        />
      </div>

      {/* Interactive Flip Hint / Toggle Pill */}
      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsFlipped((prev) => !prev)}
          className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 transition-all duration-300 text-[11px] uppercase tracking-[0.18em] font-sans text-white/60 hover:text-white cursor-pointer select-none"
          aria-label={isFlipped ? 'Show front cover' : 'Show back cover'}
        >
          <span
            className={`inline-block transition-transform duration-500 ${
              isFlipped ? 'rotate-180 text-[#ff5c4a]' : 'rotate-0 text-white/45'
            }`}
          >
            ↺
          </span>
          <span>{isFlipped ? '02 BACK · POWERED BY OSTRUM' : '01 FRONT · OSTRUM FOUNDRY'}</span>
          <span className="text-white/30 group-hover:text-white/60 text-[9px] lowercase font-serif italic">
            ({flipHint})
          </span>
        </button>
      </div>
    </div>
  );
}
