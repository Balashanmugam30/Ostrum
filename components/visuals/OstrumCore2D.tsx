'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface OstrumCore2DProps {
  className?: string;
  activeFocus?: 'business' | 'next' | null;
}

export function OstrumCore2D({ className = '', activeFocus = null }: OstrumCore2DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Smooth interpolated rotation & scroll values
  const currentRot = useRef({ x: 0, y: 0, scale: 0.9, z: 0 });
  const targetRot = useRef({ x: 0, y: 0, scale: 0.9, z: 0 });

  // DOM layer refs for direct transform updates (60fps without React re-render churn)
  const rigRef = useRef<HTMLDivElement>(null);
  const layerBloomRef = useRef<HTMLDivElement>(null);
  const layerBackRingsRef = useRef<HTMLDivElement>(null);
  const layerCoreRef = useRef<HTMLDivElement>(null);
  const layerFrontRingsRef = useRef<HTMLDivElement>(null);
  const layerFlareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(media.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    media.addEventListener('change', handleMediaChange);

    // Scroll-linked approach & depth resolution
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 800;

      // Start approaching when top enters bottom of viewport
      const enter = viewportHeight * 0.9;
      const center = viewportHeight * 0.3;
      const progress = Math.min(1, Math.max(0, (enter - rect.top) / (enter - center)));

      // Interpolate depth: 0.88 scale -> 1.05 scale, -40px Z -> 0px Z, tilt forward slightly
      targetRot.current.scale = 0.88 + progress * 0.17;
      targetRot.current.z = (progress - 1) * 50;
    };

    // Pointer tilt interaction
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const handleMouseMove = (e: MouseEvent) => {
      if (isTouch || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
      const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      // Max tilt: 10 degrees horizontal, 8 degrees vertical
      targetRot.current.y = normX * 10;
      targetRot.current.x = -normY * 8;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    if (!isTouch) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    handleScroll();

    let animId: number;
    let startTime = performance.now();
    let isVisible = true;

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });

    if (containerRef.current) observer.observe(containerRef.current);

    const tick = (time: number) => {
      if (isVisible) {
        const elapsed = (time - startTime) * 0.001;

        // Bias towards active focus if user hovers business or next
        let biasY = 0;
        if (activeFocus === 'business') biasY = -6;
        if (activeFocus === 'next') biasY = 6;

        // Subtle continuous zero-g breathing oscillation
        const breathY = Math.sin(elapsed * 1.2) * 5;
        const breathRot = Math.cos(elapsed * 0.8) * 1.5;

        // Smooth physical spring damping (lerp)
        currentRot.current.x += (targetRot.current.x - currentRot.current.x) * 0.07;
        currentRot.current.y += (targetRot.current.y + biasY - currentRot.current.y) * 0.07;
        currentRot.current.scale += (targetRot.current.scale - currentRot.current.scale) * 0.08;
        currentRot.current.z += (targetRot.current.z - currentRot.current.z) * 0.08;

        const { x, y, scale, z } = currentRot.current;

        if (rigRef.current) {
          rigRef.current.style.transform = `scale(${scale}) rotateX(${x}deg) rotateY(${y + breathRot}deg) translateY(${breathY}px)`;
        }

        // Parallax depth offsets per layer
        if (layerBloomRef.current) {
          layerBloomRef.current.style.transform = `translate3d(${-y * 1.8}px, ${-x * 1.5}px, -70px)`;
        }
        if (layerBackRingsRef.current) {
          layerBackRingsRef.current.style.transform = `translate3d(${-y * 1.2}px, ${-x * 1.0}px, -35px)`;
        }
        if (layerCoreRef.current) {
          layerCoreRef.current.style.transform = `translate3d(${y * 0.5}px, ${x * 0.5}px, 0px)`;
        }
        if (layerFrontRingsRef.current) {
          layerFrontRingsRef.current.style.transform = `translate3d(${y * 1.6}px, ${x * 1.4}px, 40px)`;
        }
        if (layerFlareRef.current) {
          layerFlareRef.current.style.transform = `translate3d(${y * 2.4}px, ${x * 2.0}px, 65px)`;
        }
      }

      animId = requestAnimationFrame(tick);
    };

    if (!prefersReducedMotion) {
      animId = requestAnimationFrame(tick);
    }

    return () => {
      media.removeEventListener('change', handleMediaChange);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
      if (animId) cancelAnimationFrame(animId);
    };
  }, [prefersReducedMotion, activeFocus]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-[560px] md:max-w-[620px] aspect-square mx-auto flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ perspective: '1200px' }}
      aria-hidden="true"
    >
      {/* 3D Transform Rig */}
      <div
        ref={rigRef}
        className="relative w-full h-full flex items-center justify-center transition-transform duration-75 will-change-transform"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* ==============================================================
            LAYER 01: ATMOSPHERIC RADIANT BLOOM (Depth Z: -70px)
            Soft crimson back-illumination echoing the hero caustics
            ============================================================== */}
        <div
          ref={layerBloomRef}
          className="absolute inset-0 rounded-full blur-[70px] opacity-40 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(255,85,60,0.85) 0%, rgba(180,25,15,0.45) 45%, transparent 75%)',
            transform: 'translateZ(-70px)',
          }}
        />

        {/* ==============================================================
            LAYER 02: REAR ARMILLARY GYROSCOPE RINGS (Depth Z: -35px)
            Thin calibrated architectural rings orbiting counter-clockwise
            ============================================================== */}
        <div
          ref={layerBackRingsRef}
          className="absolute inset-[6%] flex items-center justify-center pointer-events-none"
          style={{ transform: 'translateZ(-35px)' }}
        >
          <svg
            viewBox="0 0 500 500"
            fill="none"
            className={`w-full h-full opacity-35 ${
              prefersReducedMotion ? '' : 'animate-[spin_70s_linear_infinite_reverse]'
            }`}
          >
            {/* Outer structural tick circle */}
            <circle
              cx="250"
              cy="250"
              r="230"
              stroke="#ff7a66"
              strokeWidth="0.75"
              strokeDasharray="2 12"
            />
            {/* Degree quadrant markers */}
            <circle
              cx="250"
              cy="250"
              r="215"
              stroke="#ffffff"
              strokeWidth="0.5"
              strokeDasharray="4 20"
              opacity="0.6"
            />
            {/* Micro coordinate crosshairs */}
            <line x1="20" y1="250" x2="40" y2="250" stroke="#ff5c4a" strokeWidth="1" />
            <line x1="460" y1="250" x2="480" y2="250" stroke="#ff5c4a" strokeWidth="1" />
            <line x1="250" y1="20" x2="250" y2="40" stroke="#ff5c4a" strokeWidth="1" />
            <line x1="250" y1="460" x2="250" y2="480" stroke="#ff5c4a" strokeWidth="1" />
          </svg>
        </div>

        {/* ==============================================================
            LAYER 03: THE 2.5D OSTRUM CORE SCULPTURE (Depth Z: 0px)
            High-res levitating artifact with transparent feathered alpha
            ============================================================== */}
        <div
          ref={layerCoreRef}
          className="relative w-[82%] h-[82%] rounded-full overflow-visible pointer-events-auto cursor-grab active:cursor-grabbing"
          style={{ transform: 'translateZ(0px)' }}
        >
          {/* Ambient rim glow */}
          <div
            className="absolute inset-2 rounded-full blur-[24px] opacity-35"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(255,100,70,0.6) 20%, rgba(255,60,40,0.15) 60%, transparent 80%)',
            }}
          />

          {/* Master 2.5D Sculpture Asset */}
          <Image
            src="/images/ostrum-core-floating.webp"
            alt="The Ostrum Core — An engineered physical artifact floating in space"
            width={720}
            height={720}
            priority
            className="w-full h-full object-contain filter drop-shadow-[0_24px_50px_rgba(0,0,0,0.9)] select-none pointer-events-none"
          />
        </div>

        {/* ==============================================================
            LAYER 04: FOREGROUND ENERGY RINGS & FILAMENTS (Depth Z: +40px)
            Gold/crimson laser orbits rotating forward over the sculpture
            ============================================================== */}
        <div
          ref={layerFrontRingsRef}
          className="absolute inset-[10%] flex items-center justify-center pointer-events-none"
          style={{ transform: 'translateZ(40px)' }}
        >
          <svg
            viewBox="0 0 500 500"
            fill="none"
            className={`w-full h-full opacity-65 ${
              prefersReducedMotion ? '' : 'animate-[spin_50s_linear_infinite]'
            }`}
          >
            {/* Luminous orbital elliptical ring */}
            <ellipse
              cx="250"
              cy="250"
              rx="195"
              ry="110"
              transform="rotate(-28 250 250)"
              stroke="#ffbe99"
              strokeWidth="1.25"
              strokeDasharray="180 30 60 40"
            />
            {/* Harmonic counter-ring */}
            <ellipse
              cx="250"
              cy="250"
              rx="185"
              ry="95"
              transform="rotate(38 250 250)"
              stroke="#ff5c4a"
              strokeWidth="0.85"
              strokeDasharray="40 15 90 20"
              opacity="0.75"
            />
            {/* Floating micro-satellites */}
            <circle cx="95" cy="180" r="2.5" fill="#ffffff" />
            <circle cx="405" cy="320" r="2" fill="#ffbe99" />
          </svg>
        </div>

        {/* ==============================================================
            LAYER 05: FOREGROUND SPECULAR OPTICAL FLARE (Depth Z: +65px)
            Refraction hotspot at the central ember nucleus
            ============================================================== */}
        <div
          ref={layerFlareRef}
          className="absolute w-24 h-24 rounded-full pointer-events-none opacity-50 blur-[6px]"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.95) 0%, rgba(255,190,120,0.6) 35%, transparent 70%)',
            transform: 'translateZ(65px)',
          }}
        />
      </div>
    </div>
  );
}
