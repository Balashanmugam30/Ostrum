'use client';

import React, { useEffect, useRef, useState } from 'react';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Only enable on desktop pointer devices with fine control
    if (typeof window === 'undefined') return;

    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasFinePointer || prefersReducedMotion) {
      return;
    }

    setIsEnabled(true);

    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring) return;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let dotX = -100;
    let dotY = -100;
    let isHovering = false;
    let isClicking = false;
    let isVisible = false;
    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      }

      // Check if hovering over clickable / interactive elements
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest('a, button, [role="button"], input, textarea, select, [data-cursor="interactive"], .interactive');
        const isInteractive = !!interactive;
        if (isInteractive !== isHovering) {
          isHovering = isInteractive;
          if (isHovering) {
            ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(1.55)`;
            ring.style.borderColor = 'rgba(255, 92, 74, 0.9)';
            ring.style.backgroundColor = 'rgba(255, 77, 58, 0.08)';
            dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) scale(1.4)`;
            if (label) label.style.opacity = '0.9';
          } else {
            ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(1)`;
            ring.style.borderColor = 'rgba(247, 238, 232, 0.65)';
            ring.style.backgroundColor = 'transparent';
            dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) scale(1)`;
            if (label) label.style.opacity = '0';
          }
        }
      }
    };

    const onMouseDown = () => {
      isClicking = true;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${isHovering ? 1.3 : 0.85})`;
    };

    const onMouseUp = () => {
      isClicking = false;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${isHovering ? 1.55 : 1})`;
    };

    const onMouseLeave = () => {
      isVisible = false;
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);

    const render = () => {
      // High-performance smooth lerping for weighted instrument feel
      const ringLerp = 0.18;
      const dotLerp = 0.45;

      ringX += (mouseX - ringX) * ringLerp;
      ringY += (mouseY - ringY) * ringLerp;

      dotX += (mouseX - dotX) * dotLerp;
      dotY += (mouseY - dotY) * dotLerp;

      const scale = isClicking ? (isHovering ? 1.3 : 0.85) : isHovering ? 1.55 : 1;
      const dotScale = isHovering ? 1.4 : 1;

      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${scale})`;
      dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) scale(${dotScale})`;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  if (!isEnabled) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
    >
      {/* Outer Luxury Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-7 h-7 -ml-3.5 -mt-3.5 rounded-full border border-[rgba(247,238,232,0.65)] pointer-events-none opacity-0 transition-[border-color,background-color] duration-200 shadow-[0_0_14px_rgba(255,77,58,0.25)] flex items-center justify-center will-change-transform"
      >
        <span
          ref={labelRef}
          className="opacity-0 font-mono text-[8px] uppercase tracking-widest text-[#ff8070] transition-opacity duration-200 pointer-events-none select-none"
        />
      </div>

      {/* Precision Inner Dot with Crimson Ember Glow */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full bg-[#ff4d3a] pointer-events-none opacity-0 shadow-[0_0_8px_rgba(255,77,58,0.85)] will-change-transform"
      />
    </div>
  );
}
