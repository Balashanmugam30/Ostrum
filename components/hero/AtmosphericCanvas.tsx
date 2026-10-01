'use client';

import React, { useRef, useEffect } from 'react';

export function AtmosphericCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      time += 0.005;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // Subtle luminous caustic light refractions
      const x1 = width * 0.4 + Math.sin(time * 0.8) * (width * 0.15);
      const y1 = height * 0.35 + Math.cos(time * 0.6) * (height * 0.12);
      const r1 = Math.max(width, height) * 0.45;

      const grad1 = ctx.createRadialGradient(x1, y1, 10, x1, y1, r1);
      grad1.addColorStop(0, 'rgba(253, 244, 238, 0.65)'); // Warm Peach caustics
      grad1.addColorStop(0.5, 'rgba(245, 237, 230, 0.35)');
      grad1.addColorStop(1, 'rgba(250, 247, 242, 0)');

      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const x2 = width * 0.75 + Math.cos(time * 0.7) * (width * 0.12);
      const y2 = height * 0.65 + Math.sin(time * 0.9) * (height * 0.15);
      const r2 = Math.max(width, height) * 0.4;

      const grad2 = ctx.createRadialGradient(x2, y2, 10, x2, y2, r2);
      grad2.addColorStop(0, 'rgba(235, 242, 249, 0.55)'); // Misty Slate caustics
      grad2.addColorStop(0.6, 'rgba(237, 246, 241, 0.25)'); // Sage glow
      grad2.addColorStop(1, 'rgba(250, 247, 242, 0)');

      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 w-full h-full block z-0 opacity-80"
    />
  );
}
