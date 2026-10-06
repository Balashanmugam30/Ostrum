'use client';

import React, { useEffect, useRef } from 'react';

interface MagnetWrapProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export function MagnetWrap({
  children,
  className = '',
  strength = 0.4,
}: MagnetWrapProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth < 1024) return;

    const wrap = wrapRef.current;
    const child = childRef.current;
    if (!wrap || !child) return;

    let animId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isRunning = false;
    let rect: DOMRect | null = null;

    const updateRect = () => {
      rect = wrap.getBoundingClientRect();
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const onMouseMove = (e: MouseEvent) => {
      if (!rect) return;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const maxDist = Math.max(rect.width, rect.height) * 1.2;

      if (Math.sqrt(dx * dx + dy * dy) < maxDist) {
        targetX = dx * strength;
        targetY = dy * strength;
      } else {
        targetX = 0;
        targetY = 0;
      }

      if (!isRunning) {
        isRunning = true;
        animId = requestAnimationFrame(tick);
      }
    };

    const tick = () => {
      currentX = lerp(currentX, targetX, 0.15);
      currentY = lerp(currentY, targetY, 0.15);

      if (Math.abs(currentX - targetX) < 0.1 && Math.abs(currentY - targetY) < 0.1) {
        currentX = targetX;
        currentY = targetY;
      }

      if (child) {
        child.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }

      if (currentX === 0 && currentY === 0 && targetX === 0 && targetY === 0) {
        isRunning = false;
        return;
      }

      animId = requestAnimationFrame(tick);
    };

    updateRect();
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', updateRect, { passive: true });
    window.addEventListener('resize', updateRect, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', updateRect);
      window.removeEventListener('resize', updateRect);
      cancelAnimationFrame(animId);
      if (child) {
        child.style.transform = '';
      }
    };
  }, [strength]);

  return (
    <div ref={wrapRef} className={`magnet-wrap inline-block ${className}`.trim()}>
      <div ref={childRef} className="magnet-inner will-change-transform">
        {children}
      </div>
    </div>
  );
}
