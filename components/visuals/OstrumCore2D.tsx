'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface OstrumCore2DProps {
  className?: string;
  activeFocus?: 'business' | 'next' | null;
  onScrollProgress?: (progress: number) => void;
}

export function OstrumCore2D({
  className = '',
  activeFocus = null,
  onScrollProgress,
}: OstrumCore2DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [rotationDeg, setRotationDeg] = useState(0);

  // Smooth interpolated rotation & scroll values
  const currentRotY = useRef(0);
  const targetRotY = useRef(0);
  const currentRotX = useRef(0);
  const targetRotX = useRef(0);
  const currentScale = useRef(0.92);
  const targetScale = useRef(0.92);

  // Direct DOM refs for 60fps transform performance
  const rigRef = useRef<HTMLDivElement>(null);
  const frontLayerRef = useRef<HTMLDivElement>(null);
  const backLayerRef = useRef<HTMLDivElement>(null);
  const sideLayerRef = useRef<HTMLDivElement>(null);
  const rearRingRef = useRef<HTMLDivElement>(null);
  const frontRingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(media.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    media.addEventListener('change', handleMediaChange);

    // Scroll-driven 360-degree rotation mapping
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 800;

      // Section scroll bounds: starts when section approaches, completes through section travel
      const start = viewportHeight * 0.95;
      const end = -rect.height * 0.6;
      const rawProgress = (start - rect.top) / (start - end);
      const clampedProgress = Math.min(1, Math.max(0, rawProgress));

      onScrollProgress?.(clampedProgress);

      // Target full 360-degree rotation
      targetRotY.current = clampedProgress * 360;

      // Scale smoothly: 0.9 -> 1.05 at center -> 0.95 at exit
      const distFromCenter = Math.abs(clampedProgress - 0.5) * 2; // 0 at center, 1 at ends
      targetScale.current = 1.05 - distFromCenter * 0.12;
    };

    // Desktop subtle pointer interaction (+/- 2 degrees max)
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const handleMouseMove = (e: MouseEvent) => {
      if (isTouch || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      targetRotX.current = -normY * 2.5; // very subtle 2.5 deg tilt
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

        // Subtle zero-g breath
        const breathY = Math.sin(elapsed * 1.1) * 4;
        const idleRot = Math.cos(elapsed * 0.7) * 1.0;

        // Physical spring damping (lerp)
        currentRotY.current += (targetRotY.current - currentRotY.current) * 0.08;
        currentRotX.current += (targetRotX.current - currentRotX.current) * 0.08;
        currentScale.current += (targetScale.current - currentScale.current) * 0.08;

        const totalRotY = currentRotY.current + idleRot;
        const totalRotX = currentRotX.current;
        const scale = currentScale.current;

        // Normalize angle to [0, 360)
        let normAngle = ((totalRotY % 360) + 360) % 360;

        // Calculate state opacities for seamless 360 transition:
        // Front is dominant around 0° (315° to 45°)
        // Side is dominant around 90° (45° to 135°) and 270° (225° to 315°)
        // Back is dominant around 180° (135° to 225°)
        let frontOpacity = 0;
        let backOpacity = 0;
        let sideOpacity = 0;

        if (normAngle <= 45 || normAngle >= 315) {
          frontOpacity = 1;
        } else if (normAngle > 45 && normAngle < 135) {
          // Transition through 90°
          sideOpacity = 1;
          frontOpacity = Math.max(0, 1 - (normAngle - 45) / 45);
          backOpacity = Math.max(0, (normAngle - 90) / 45);
        } else if (normAngle >= 135 && normAngle <= 225) {
          backOpacity = 1;
        } else {
          // Transition through 270°
          sideOpacity = 1;
          backOpacity = Math.max(0, 1 - (normAngle - 225) / 45);
          frontOpacity = Math.max(0, (normAngle - 270) / 45);
        }

        // Apply transforms
        if (rigRef.current) {
          rigRef.current.style.transform = `scale(${scale}) rotateX(${totalRotX}deg) rotateY(${totalRotY}deg) translateY(${breathY}px)`;
        }

        if (frontLayerRef.current) {
          frontLayerRef.current.style.opacity = `${frontOpacity}`;
        }
        if (backLayerRef.current) {
          backLayerRef.current.style.opacity = `${backOpacity}`;
        }
        if (sideLayerRef.current) {
          sideLayerRef.current.style.opacity = `${sideOpacity}`;
        }

        // Update state periodically for test inspection (avoid spamming React render)
        if (Math.abs(normAngle - rotationDeg) > 2) {
          setRotationDeg(Math.round(normAngle));
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
  }, [prefersReducedMotion, rotationDeg, onScrollProgress]);

  return (
    <div
      ref={containerRef}
      data-testid="ostrum-core-container"
      data-rotation-deg={rotationDeg}
      data-prefers-reduced-motion={prefersReducedMotion}
      className={`relative w-full max-w-[500px] md:max-w-[560px] aspect-square mx-auto flex items-center justify-center select-none pointer-events-none bg-transparent ${className}`}
      style={{ perspective: '1200px' }}
      aria-hidden="true"
    >
      {/* 3D Transform Rig — Zero black overlay, completely transparent */}
      <div
        ref={rigRef}
        data-testid="ostrum-core-rig"
        className="relative w-full h-full flex items-center justify-center will-change-transform bg-transparent"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* ==============================================================
            LAYER 01: REAR GYROSCOPE CALIBRATION RING (Depth Z: -30px)
            Thin champagne gold and ivory architectural hairline orbit
            ============================================================== */}
        <div
          ref={rearRingRef}
          className="absolute inset-[6%] flex items-center justify-center pointer-events-none bg-transparent"
          style={{ transform: 'translateZ(-30px)' }}
        >
          <svg
            viewBox="0 0 500 500"
            fill="none"
            className={`w-full h-full opacity-40 ${
              prefersReducedMotion ? '' : 'animate-[spin_65s_linear_infinite_reverse]'
            }`}
          >
            <circle
              cx="250"
              cy="250"
              r="230"
              stroke="#e6d5b8"
              strokeWidth="0.8"
              strokeDasharray="3 14"
            />
            <circle
              cx="250"
              cy="250"
              r="218"
              stroke="#ffffff"
              strokeWidth="0.4"
              strokeDasharray="6 24"
              opacity="0.6"
            />
          </svg>
        </div>

        {/* ==============================================================
            LAYER 02: THE SCULPTURAL OSTRUM CORE (Depth Z: 0px)
            Multi-state volumetric rotation (Front, Side, Back)
            ============================================================== */}
        <div
          className="relative w-[86%] h-[86%] flex items-center justify-center bg-transparent"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Subtle back ambient reflection glint */}
          <div
            className="absolute inset-4 rounded-full blur-[20px] opacity-25 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(255,185,130,0.4) 0%, rgba(255,90,70,0.1) 50%, transparent 70%)',
            }}
          />

          {/* FRONT STATE (0° to 90°, 270° to 360°) */}
          <div
            ref={frontLayerRef}
            data-testid="core-face-front"
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-150 will-change-opacity bg-transparent"
            style={{
              transform: 'translateZ(1.5px)',
              backfaceVisibility: 'visible',
            }}
          >
            <Image
              src="/images/ostrum-core-front.webp"
              alt="Ostrum Core Front"
              width={640}
              height={640}
              priority
              className="w-full h-full object-contain filter drop-shadow-[0_16px_36px_rgba(0,0,0,0.4)] select-none pointer-events-none"
            />
          </div>

          {/* SIDE / TRANSITION PROFILE STATE (Around 90° and 270°) */}
          <div
            ref={sideLayerRef}
            data-testid="core-face-side"
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-150 will-change-opacity bg-transparent"
            style={{
              transform: 'translateZ(0px)',
              backfaceVisibility: 'visible',
            }}
          >
            <Image
              src="/images/ostrum-core-side.webp"
              alt="Ostrum Core Lateral Profile"
              width={640}
              height={640}
              priority
              className="w-full h-full object-contain filter drop-shadow-[0_16px_36px_rgba(0,0,0,0.4)] select-none pointer-events-none"
            />
          </div>

          {/* BACK STATE (90° to 270°) */}
          <div
            ref={backLayerRef}
            data-testid="core-face-back"
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-150 will-change-opacity bg-transparent"
            style={{
              transform: 'translateZ(-1.5px) rotateY(180deg)',
              backfaceVisibility: 'visible',
            }}
          >
            <Image
              src="/images/ostrum-core-back.webp"
              alt="Ostrum Core Reverse View"
              width={640}
              height={640}
              priority
              className="w-full h-full object-contain filter drop-shadow-[0_16px_36px_rgba(0,0,0,0.4)] select-none pointer-events-none"
            />
          </div>
        </div>

        {/* ==============================================================
            LAYER 03: FOREGROUND ARCHITECTURAL RINGS (Depth Z: +30px)
            Gold and ivory laser orbit in forward 3D space
            ============================================================== */}
        <div
          ref={frontRingRef}
          className="absolute inset-[8%] flex items-center justify-center pointer-events-none bg-transparent"
          style={{ transform: 'translateZ(30px)' }}
        >
          <svg
            viewBox="0 0 500 500"
            fill="none"
            className={`w-full h-full opacity-55 ${
              prefersReducedMotion ? '' : 'animate-[spin_48s_linear_infinite]'
            }`}
          >
            {/* Luminous orbital elliptical ring */}
            <ellipse
              cx="250"
              cy="250"
              rx="200"
              ry="115"
              transform="rotate(-24 250 250)"
              stroke="#f5e6cc"
              strokeWidth="1.0"
              strokeDasharray="160 35 55 45"
            />
            {/* Delicate gold focal dot */}
            <circle cx="100" cy="185" r="2.5" fill="#f5e6cc" />
            <circle cx="400" cy="315" r="2" fill="#ffbe99" />
          </svg>
        </div>
      </div>
    </div>
  );
}
