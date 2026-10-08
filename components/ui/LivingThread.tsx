'use client';

import React, { useEffect, useRef } from 'react';

export function LivingThread() {
  const pathRef = useRef<SVGPathElement>(null);
  const echoPathRef = useRef<SVGPathElement>(null);
  const nodeRef = useRef<SVGCircleElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Set static graceful resting curve
      const staticD = 'M 100,320 C 350,260 520,380 720,310 C 920,240 1100,370 1340,300';
      const staticEchoD = 'M 140,335 C 380,290 540,360 720,315 C 900,270 1080,350 1300,315';
      if (pathRef.current) pathRef.current.setAttribute('d', staticD);
      if (echoPathRef.current) echoPathRef.current.setAttribute('d', staticEchoD);
      if (nodeRef.current) {
        nodeRef.current.setAttribute('cx', '720');
        nodeRef.current.setAttribute('cy', '310');
      }
      return;
    }

    let animId: number;
    let startTime = performance.now();
    let isVisible = true;

    // Mouse spring interaction for desktop (disabled on touch)
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const mouse = { x: 0.5, y: 0.5, targetY: 0.5 };

    const handleMouseMove = (e: MouseEvent) => {
      if (isTouch) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.targetY = (e.clientY - rect.top) / rect.height;
    };

    if (!isTouch) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    // Pause when offscreen or tab inactive
    const handleVisibility = () => {
      isVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.1 });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Cubic Bézier spline generator
    const render = (time: number) => {
      animId = requestAnimationFrame(render);
      if (!isVisible) return;

      const elapsed = (time - startTime) * 0.001;

      // Smooth mouse follow
      mouse.y += (mouse.targetY - mouse.y) * 0.04;
      const mouseInfluence = isTouch ? 0 : (mouse.y - 0.5) * 45;

      // Baseline control points in a 1440x600 coordinate space
      // Placed in the lower-middle zone (y around 300-360)
      const t = elapsed * 0.85;

      // Primary strand control points
      const p0 = { x: 80, y: 340 + Math.sin(t * 0.7) * 12 };
      const cp1 = { x: 340, y: 260 + Math.sin(t * 0.9 + 0.4) * 28 + mouseInfluence * 0.6 };
      const cp2 = { x: 500, y: 380 + Math.cos(t * 0.8 + 1.2) * 32 + mouseInfluence * 0.8 };
      const p1 = { x: 720, y: 310 + Math.sin(t * 1.1 + 2.0) * 22 + mouseInfluence };
      const cp3 = { x: 940, y: 240 + Math.cos(t * 0.95 + 2.8) * 30 + mouseInfluence * 0.8 };
      const cp4 = { x: 1100, y: 390 + Math.sin(t * 0.75 + 3.6) * 26 + mouseInfluence * 0.6 };
      const p2 = { x: 1360, y: 310 + Math.cos(t * 0.85 + 4.2) * 16 };

      const d = `M ${p0.x.toFixed(1)},${p0.y.toFixed(1)} C ${cp1.x.toFixed(1)},${cp1.y.toFixed(1)} ${cp2.x.toFixed(1)},${cp2.y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)} C ${cp3.x.toFixed(1)},${cp3.y.toFixed(1)} ${cp4.x.toFixed(1)},${cp4.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;

      // Echo strand: complementary resonant phase
      const t2 = t + 0.9;
      const ep0 = { x: 120, y: 350 + Math.sin(t2 * 0.7) * 10 };
      const ecp1 = { x: 380, y: 290 + Math.sin(t2 * 0.9 + 0.3) * 20 + mouseInfluence * 0.4 };
      const ecp2 = { x: 530, y: 350 + Math.cos(t2 * 0.8 + 1.0) * 24 + mouseInfluence * 0.5 };
      const ep1 = { x: 720, y: 320 + Math.sin(t2 * 1.1 + 1.8) * 18 + mouseInfluence * 0.7 };
      const ecp3 = { x: 910, y: 280 + Math.cos(t2 * 0.95 + 2.5) * 22 + mouseInfluence * 0.5 };
      const ecp4 = { x: 1070, y: 360 + Math.sin(t2 * 0.75 + 3.2) * 20 + mouseInfluence * 0.4 };
      const ep2 = { x: 1320, y: 325 + Math.cos(t2 * 0.85 + 3.9) * 12 };

      const echoD = `M ${ep0.x.toFixed(1)},${ep0.y.toFixed(1)} C ${ecp1.x.toFixed(1)},${ecp1.y.toFixed(1)} ${ecp2.x.toFixed(1)},${ecp2.y.toFixed(1)} ${ep1.x.toFixed(1)},${ep1.y.toFixed(1)} C ${ecp3.x.toFixed(1)},${ecp3.y.toFixed(1)} ${ecp4.x.toFixed(1)},${ecp4.y.toFixed(1)} ${ep2.x.toFixed(1)},${ep2.y.toFixed(1)}`;

      if (pathRef.current) pathRef.current.setAttribute('d', d);
      if (echoPathRef.current) echoPathRef.current.setAttribute('d', echoD);
      if (nodeRef.current) {
        nodeRef.current.setAttribute('cx', p1.x.toFixed(1));
        nodeRef.current.setAttribute('cy', p1.y.toFixed(1));
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      if (!isTouch) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      document.removeEventListener('visibilitychange', handleVisibility);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="living-thread-container absolute inset-0 w-full h-full pointer-events-none select-none z-[3] overflow-hidden"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full opacity-70 transition-opacity duration-1000"
      >
        <defs>
          {/* Primary thread gradient: delicate transition from transparent to luminous warm off-white and rose pearl */}
          <linearGradient id="threadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fff2eb" stopOpacity="0" />
            <stop offset="25%" stopColor="#ffbfa8" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#fff8f4" stopOpacity="0.75" />
            <stop offset="75%" stopColor="#ff9f84" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fff2eb" stopOpacity="0" />
          </linearGradient>

          {/* Secondary harmonic echo gradient */}
          <linearGradient id="echoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffb099" stopOpacity="0" />
            <stop offset="35%" stopColor="#ffd8cb" stopOpacity="0.25" />
            <stop offset="65%" stopColor="#ffb099" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ffb099" stopOpacity="0" />
          </linearGradient>

          {/* Core inflection aura */}
          <radialGradient id="nodeAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#ffb39c" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ff5533" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Secondary Echo Strand (subtle resonance) */}
        <path
          ref={echoPathRef}
          stroke="url(#echoGradient)"
          strokeWidth="1"
          strokeLinecap="round"
          className="transition-transform duration-75"
        />

        {/* Primary Living Thread */}
        <path
          ref={pathRef}
          stroke="url(#threadGradient)"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="transition-transform duration-75"
        />

        {/* Central harmonic node (subtle focal aura) */}
        <circle
          ref={nodeRef}
          cx="720"
          cy="310"
          r="4.5"
          fill="url(#nodeAura)"
        />
      </svg>
    </div>
  );
}
