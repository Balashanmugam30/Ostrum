'use client';

import React, { useRef, useEffect } from 'react';
import { CornerCrosses } from '@/components/ui/CornerCrosses';

export function ThreeDArtifact() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotX = 0.4;
    let rotY = 0.6;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    // Define 3D Polyhedron Nodes (Vertices)
    const vertices = [
      { x: -70, y: -70, z: -70, label: 'STORE' },
      { x: 70, y: -70, z: -70, label: 'ERP' },
      { x: 70, y: 70, z: -70, label: 'CRM' },
      { x: -70, y: 70, z: -70, label: 'POS' },
      { x: -70, y: -70, z: 70, label: 'AI' },
      { x: 70, y: -70, z: 70, label: 'DB' },
      { x: 70, y: 70, z: 70, label: 'SYNC' },
      { x: -70, y: 70, z: 70, label: 'VOICE' },
    ];

    // Edges connecting nodes
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // Back square
      [4, 5], [5, 6], [6, 7], [7, 4], // Front square
      [0, 4], [1, 5], [2, 6], [3, 7], // Cross connectors
      [0, 6], [1, 7], // Diagonal internal sync axes
    ];

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      if (!isDragging) {
        rotY += 0.006;
        rotX += 0.002;
      }

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Project 3D points to 2D screen
      const projected = vertices.map((v) => {
        // Rotate around Y
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const x1 = v.x * cosY - v.z * sinY;
        const z1 = v.z * cosY + v.x * sinY;

        // Rotate around X
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const y2 = v.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + v.y * sinX;

        // Perspective projection
        const fov = 320;
        const scale = fov / (fov + z2 + 220);
        const px = cx + x1 * scale;
        const py = cy + y2 * scale;

        return { px, py, z: z2, scale, label: v.label };
      });

      // Draw Edges
      edges.forEach(([i, j]) => {
        const p1 = projected[i];
        const p2 = projected[j];

        const gradient = ctx.createLinearGradient(p1.px, p1.py, p2.px, p2.py);
        gradient.addColorStop(0, 'rgba(210, 75, 44, 0.45)');
        gradient.addColorStop(1, 'rgba(24, 43, 73, 0.45)');

        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Draw Nodes
      projected.forEach((p, idx) => {
        const radius = Math.max(3, 5 * p.scale);

        ctx.beginPath();
        ctx.arc(p.px, p.py, radius, 0, Math.PI * 2);
        ctx.fillStyle = idx % 2 === 0 ? '#D24B2C' : '#2B543D';
        ctx.fill();

        // Node Label
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = '#50545C';
        ctx.fillText(p.label, p.px + 8, p.py + 3);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Mouse Drag Interactions
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      rotY += dx * 0.01;
      rotX += dy * 0.01;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <div className="relative bg-surface-card border border-border-subtle rounded-2xl p-6 sm:p-8 shadow-float flex flex-col justify-between">
      <CornerCrosses />

      <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-4 font-mono text-[11px] text-ink-muted">
        <span>INTERACTIVE SYSTEM ARTIFACT</span>
        <span className="text-accent-terracotta">DRAG TO ROTATE 3D</span>
      </div>

      <div className="relative w-full h-[260px] sm:h-[280px] flex items-center justify-center cursor-grab active:cursor-grabbing">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      <div className="border-t border-border-subtle pt-3 text-center">
        <p className="font-mono text-xs text-ink-slate">
          The Connected Ostrum Engine: 8 synchronized operational nodes in physical equilibrium.
        </p>
      </div>
    </div>
  );
}
