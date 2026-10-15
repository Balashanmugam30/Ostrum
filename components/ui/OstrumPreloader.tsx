'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { usePreloader } from '@/context/PreloaderContext';

export function OstrumPreloader() {
  const { phase, isComplete } = usePreloader();
  const overlayRef = useRef<HTMLDivElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const hasAnimatedRef = useRef(false);

  // Fade out preloader overlay during handoff phase
  useEffect(() => {
    if (phase === 'handoff' && overlayRef.current && !hasAnimatedRef.current) {
      hasAnimatedRef.current = true;
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 1.25,
        ease: 'power3.inOut',
      });
    }
  }, [phase]);

  // Fine Drifting Pearl & Coral Particles around the Sculpture (Phase 5A)
  useEffect(() => {
    if (isComplete) return;
    const canvas = particleCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize, { passive: true });

    // Spawn 38 fine particles in pearl-white (#F5F3F7) and soft coral (#FF8069)
    const particleCount = 38;
    const particles = Array.from({ length: particleCount }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 120 + Math.random() * 260;
      const isPearl = i % 3 !== 0;
      return {
        x: width * 0.5 + Math.cos(angle) * dist,
        y: height * 0.48 + Math.sin(angle) * (dist * 0.45),
        radius: isPearl ? 0.9 + Math.random() * 1.3 : 1.1 + Math.random() * 1.2,
        color: isPearl ? '245, 243, 247' : '255, 128, 105',
        alpha: 0.15 + Math.random() * 0.55,
        speed: 0.0003 + Math.random() * 0.0005,
        angle,
        orbitRadius: dist,
        orbitYRatio: 0.42 + Math.random() * 0.15,
        tilt: -0.28,
      };
    });

    let startTime = performance.now();
    const renderParticles = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      const elapsed = (time - startTime) * 0.001;
      const centerX = width * 0.5;
      const centerY = height * 0.48;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.angle += p.speed;

        // Elliptical tilted orbit
        const rawX = Math.cos(p.angle) * p.orbitRadius;
        const rawY = Math.sin(p.angle) * (p.orbitRadius * p.orbitYRatio);

        // Apply tilt rotation
        const tiltedX = rawX * Math.cos(p.tilt) - rawY * Math.sin(p.tilt);
        const tiltedY = rawX * Math.sin(p.tilt) + rawY * Math.cos(p.tilt);

        const currentX = centerX + tiltedX;
        const currentY = centerY + tiltedY;

        // Subtle alpha breathing
        const pulse = 0.8 + Math.sin(elapsed * 1.5 + i) * 0.2;
        const finalAlpha = Math.max(0, Math.min(1, p.alpha * pulse));

        ctx.beginPath();
        ctx.arc(currentX, currentY, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${finalAlpha})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(renderParticles);
    };

    animId = requestAnimationFrame(renderParticles);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [isComplete]);

  if (isComplete) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      id="ostrum-preloader"
      data-testid="ostrum-preloader-overlay"
      className="fixed inset-0 z-[25] pointer-events-none select-none overflow-hidden will-change-[opacity]"
      style={{
        backgroundColor: '#050505',
      }}
      aria-hidden="true"
    >
      {/* =========================================================================
          PHASE 4: CINEMATIC MULTICOLOR LIGHT FIELDS (Obsidian, Crimson, Oxblood, Coral, Violet)
          ========================================================================= */}
      {/* 1. Deep Obsidian foundation layer */}
      <div className="absolute inset-0 bg-[#050505]" />

      {/* 2. Core Crimson & Scarlet Radiant Field (Centered behind the 3D sculpture) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 50% 48%, rgba(255, 77, 48, 0.28) 0%, rgba(118, 19, 33, 0.42) 28%, rgba(49, 10, 18, 0.55) 54%, rgba(5, 5, 5, 0.95) 80%, #050505 100%)',
        }}
      />

      {/* 3. Drifting Oxblood & Subtle Violet Ambient Lobe */}
      <div
        className="absolute inset-0 pointer-events-none animate-[pulse_8s_ease-in-out_infinite]"
        style={{
          background:
            'radial-gradient(circle 520px at 32% 40%, rgba(73, 54, 83, 0.28) 0%, rgba(49, 10, 18, 0.35) 45%, transparent 72%)',
          filter: 'blur(45px)',
        }}
      />

      {/* 4. Drifting Coral & Muted Rose Warmth Lobe */}
      <div
        className="absolute inset-0 pointer-events-none animate-[pulse_10s_ease-in-out_infinite_reverse]"
        style={{
          background:
            'radial-gradient(circle 580px at 68% 56%, rgba(255, 128, 105, 0.20) 0%, rgba(184, 90, 105, 0.22) 42%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      {/* 5. Architectural Pearl-White Crown Bloom */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle 380px at 50% 34%, rgba(245, 243, 247, 0.09) 0%, rgba(255, 77, 48, 0.05) 45%, transparent 70%)',
          filter: 'blur(35px)',
        }}
      />

      {/* =========================================================================
          PHASE 5B: ELEGANT ORBITING CELESTIAL CURVES (Translucent Ellipses & Light Trails)
          ========================================================================= */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="orbit-grad-pearl" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5F3F7" stopOpacity="0.22" />
            <stop offset="50%" stopColor="#FF4D30" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#310A12" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="orbit-grad-coral" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF8069" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#761321" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#050505" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#FF4D30" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FF4D30" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Primary Tilted Elliptical Orbit (-16 degrees) */}
        <g transform="translate(500, 480) rotate(-16)">
          <ellipse
            cx="0"
            cy="0"
            rx="275"
            ry="105"
            fill="none"
            stroke="url(#orbit-grad-pearl)"
            strokeWidth="0.9"
            strokeDasharray="4 6"
            opacity="0.85"
            className="animate-[spin_45s_linear_infinite]"
          />
        </g>

        {/* Secondary Tilted Orbit (22 degrees) */}
        <g transform="translate(500, 480) rotate(22)">
          <ellipse
            cx="0"
            cy="0"
            rx="330"
            ry="125"
            fill="none"
            stroke="url(#orbit-grad-coral)"
            strokeWidth="0.8"
            opacity="0.75"
            className="animate-[spin_60s_linear_infinite_reverse]"
          />
        </g>
      </svg>

      {/* =========================================================================
          PHASE 5A: FINE PEARL-WHITE & CORAL DRIFTING PARTICLES CANVAS
          ========================================================================= */}
      <canvas
        ref={particleCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
