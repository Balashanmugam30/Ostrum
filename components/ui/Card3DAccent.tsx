'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface Card3DAccentProps {
  variant: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  'data-testid'?: string;
}

interface SharedCardEntry {
  render: (time: number, dt: number, renderer: THREE.WebGLRenderer) => void;
  isVisible: () => boolean;
}

/**
 * Single shared offscreen WebGLRenderer across all capability cards on desktop.
 * Eliminates creating 6+ concurrent WebGL contexts alongside the hero journey,
 * background shader, and footer CTA.
 */
let sharedRenderer: THREE.WebGLRenderer | null = null;
let sharedRendererLost = false;
let sharedActiveCount = 0;
let sharedRafId = 0;
let sharedLastTime = 0;
const sharedEntries = new Set<SharedCardEntry>();

function ensureSharedRenderer(): THREE.WebGLRenderer | null {
  if (sharedRenderer && !sharedRendererLost) return sharedRenderer;
  if (sharedRenderer && sharedRendererLost) return null;

  try {
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.domElement.addEventListener(
      'webglcontextlost',
      (e) => {
        e.preventDefault();
        sharedRendererLost = true;
      },
      false,
    );
    renderer.domElement.addEventListener(
      'webglcontextrestored',
      () => {
        sharedRendererLost = false;
        scheduleSharedLoop();
      },
      false,
    );
    sharedRenderer = renderer;
    return renderer;
  } catch {
    return null;
  }
}

function tickSharedCards(time: number) {
  sharedRafId = 0;
  if (sharedEntries.size === 0 || sharedRendererLost) return;

  const renderer = sharedRenderer;
  if (!renderer) return;

  const dt = sharedLastTime > 0 ? Math.min(0.1, (time - sharedLastTime) / 1000) : 0.016;
  sharedLastTime = time;

  let anyVisible = false;
  sharedEntries.forEach((entry) => {
    if (!entry.isVisible()) return;
    anyVisible = true;
    entry.render(time, dt, renderer);
  });

  if (anyVisible) {
    sharedRafId = requestAnimationFrame(tickSharedCards);
  }
}

function scheduleSharedLoop() {
  if (sharedRafId === 0 && sharedEntries.size > 0 && !sharedRendererLost) {
    sharedLastTime = performance.now();
    sharedRafId = requestAnimationFrame(tickSharedCards);
  }
}

function releaseSharedRendererIfUnused() {
  if (sharedActiveCount > 0 || sharedEntries.size > 0) return;
  if (sharedRafId) {
    cancelAnimationFrame(sharedRafId);
    sharedRafId = 0;
  }
  if (sharedRenderer) {
    sharedRenderer.dispose();
    sharedRenderer = null;
    sharedRendererLost = false;
  }
}

export function Card3DAccent({
  variant,
  className,
  'data-testid': testId,
}: Card3DAccentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    sharedActiveCount += 1;
    const renderer = ensureSharedRenderer();
    if (!renderer) {
      sharedActiveCount = Math.max(0, sharedActiveCount - 1);
      return;
    }

    let isDisposed = false;
    let isVisible = false;
    let targetW = 320;
    let targetH = 180;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.set(0, 0, 5.2);

    const updateSize = () => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      targetW = Math.max(120, Math.round(rect.width));
      targetH = Math.max(120, Math.round(rect.height));
      const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.25);
      const pixelW = Math.max(1, Math.round(targetW * dpr));
      const pixelH = Math.max(1, Math.round(targetH * dpr));
      if (canvas.width !== pixelW || canvas.height !== pixelH) {
        canvas.width = pixelW;
        canvas.height = pixelH;
      }
      camera.aspect = targetW / targetH;
      camera.updateProjectionMatrix();
    };
    updateSize();

    // Studio Lighting Rig tailored for glossy glass and specular metallics
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(3, 4, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xddeeff, 1.2);
    fillLight.position.set(-3, -2, 2);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffffff, 2.0, 10);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    // Procedural Sculptures for each of the 6 capabilities
    const group = new THREE.Group();
    scene.add(group);

    const cleanupGeometries: THREE.BufferGeometry[] = [];
    const cleanupMaterials: THREE.Material[] = [];

    if (variant === 1) {
      const geom = new THREE.IcosahedronGeometry(1.22, 0);
      cleanupGeometries.push(geom);
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0xecd8ff,
        roughness: 0.06,
        metalness: 0.05,
        transmission: 0.88,
        thickness: 1.4,
        ior: 1.54,
        reflectivity: 0.95,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
        attenuationColor: new THREE.Color(0xd7b5fa),
        attenuationDistance: 1.2,
      });
      cleanupMaterials.push(mat);
      group.add(new THREE.Mesh(geom, mat));

      const innerGeom = new THREE.OctahedronGeometry(0.72, 0);
      cleanupGeometries.push(innerGeom);
      const innerMat = new THREE.MeshStandardMaterial({
        color: 0x9b51e0,
        wireframe: true,
        roughness: 0.2,
      });
      cleanupMaterials.push(innerMat);
      group.add(new THREE.Mesh(innerGeom, innerMat));
    } else if (variant === 2) {
      const coreGeom = new THREE.SphereGeometry(0.55, 32, 32);
      cleanupGeometries.push(coreGeom);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x86fff8,
        emissive: 0x42ded5,
        emissiveIntensity: 0.65,
        roughness: 0.15,
        metalness: 0.4,
      });
      cleanupMaterials.push(coreMat);
      group.add(new THREE.Mesh(coreGeom, coreMat));

      const ring1Geom = new THREE.TorusGeometry(1.15, 0.055, 16, 64);
      cleanupGeometries.push(ring1Geom);
      const ring1Mat = new THREE.MeshPhysicalMaterial({
        color: 0xd2f6f0,
        roughness: 0.1,
        metalness: 0.85,
        clearcoat: 1.0,
      });
      cleanupMaterials.push(ring1Mat);
      const ring1 = new THREE.Mesh(ring1Geom, ring1Mat);
      ring1.rotation.x = Math.PI / 3;
      group.add(ring1);

      const ring2Geom = new THREE.TorusGeometry(0.88, 0.045, 16, 64);
      cleanupGeometries.push(ring2Geom);
      const ring2Mat = new THREE.MeshPhysicalMaterial({
        color: 0xf4c5cf,
        roughness: 0.1,
        metalness: 0.8,
        clearcoat: 1.0,
      });
      cleanupMaterials.push(ring2Mat);
      const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
      ring2.rotation.y = Math.PI / 4;
      group.add(ring2);
    } else if (variant === 3) {
      const cubeMat = new THREE.MeshPhysicalMaterial({
        color: 0xffeed5,
        roughness: 0.1,
        transmission: 0.82,
        thickness: 1.2,
        ior: 1.5,
        attenuationColor: new THREE.Color(0xf2a460),
        attenuationDistance: 1.5,
        clearcoat: 1.0,
      });
      cleanupMaterials.push(cubeMat);

      const b1 = new THREE.BoxGeometry(0.85, 0.85, 0.85);
      cleanupGeometries.push(b1);
      const m1 = new THREE.Mesh(b1, cubeMat);
      m1.position.set(-0.25, -0.25, 0.25);
      group.add(m1);

      const b2 = new THREE.BoxGeometry(0.7, 0.7, 0.7);
      cleanupGeometries.push(b2);
      const m2 = new THREE.Mesh(b2, cubeMat);
      m2.position.set(0.35, 0.35, -0.2);
      group.add(m2);

      const b3 = new THREE.BoxGeometry(0.55, 0.55, 0.55);
      cleanupGeometries.push(b3);
      const m3 = new THREE.Mesh(b3, cubeMat);
      m3.position.set(0.2, -0.4, -0.3);
      group.add(m3);

      group.rotation.x = 0.55;
      group.rotation.y = 0.78;
    } else if (variant === 4) {
      const plateGeom = new THREE.CylinderGeometry(1.15, 1.15, 0.16, 6);
      cleanupGeometries.push(plateGeom);

      const plateMat = new THREE.MeshPhysicalMaterial({
        color: 0xbbcbff,
        metalness: 0.85,
        roughness: 0.12,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
      });
      cleanupMaterials.push(plateMat);

      for (let i = 0; i < 3; i++) {
        const plate = new THREE.Mesh(plateGeom, plateMat);
        plate.position.y = (i - 1) * 0.42;
        plate.rotation.y = i * (Math.PI / 6);
        group.add(plate);
      }
    } else if (variant === 5) {
      const cylGeom = new THREE.CylinderGeometry(0.68, 0.68, 1.1, 32);
      cleanupGeometries.push(cylGeom);
      const cylMat = new THREE.MeshStandardMaterial({
        color: 0xbdeccf,
        metalness: 0.85,
        roughness: 0.2,
      });
      cleanupMaterials.push(cylMat);
      group.add(new THREE.Mesh(cylGeom, cylMat));

      const torusGeom = new THREE.TorusGeometry(1.05, 0.06, 16, 48);
      cleanupGeometries.push(torusGeom);
      const torusMat = new THREE.MeshPhysicalMaterial({
        color: 0xc4e7f8,
        metalness: 0.9,
        roughness: 0.1,
        clearcoat: 1.0,
      });
      cleanupMaterials.push(torusMat);
      const t1 = new THREE.Mesh(torusGeom, torusMat);
      t1.rotation.x = Math.PI / 2;
      group.add(t1);

      const t2 = new THREE.Mesh(torusGeom, torusMat);
      t2.rotation.x = Math.PI / 2;
      t2.position.y = 0.35;
      t2.scale.set(0.85, 0.85, 0.85);
      group.add(t2);
    } else {
      const knotGeom = new THREE.TorusKnotGeometry(0.85, 0.24, 80, 20, 2, 3);
      cleanupGeometries.push(knotGeom);
      const knotMat = new THREE.MeshPhysicalMaterial({
        color: 0xf5cdd8,
        roughness: 0.12,
        metalness: 0.6,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
        sheen: 1.0,
        sheenColor: new THREE.Color(0xffd9b7),
      });
      cleanupMaterials.push(knotMat);
      group.add(new THREE.Mesh(knotGeom, knotMat));
    }

    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      if (!(rect.width > 0 && rect.height > 0)) return;
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = nx * 0.75;
      targetRotX = ny * 0.75;
    };

    const handlePointerLeave = () => {
      targetRotX = 0;
      targetRotY = 0;
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('mouseleave', handlePointerLeave);

    const observer = new IntersectionObserver(
      (entries) => {
        const nextEntry = entries[0];
        const nextVisible = nextEntry?.isIntersecting ?? false;
        if (nextVisible === isVisible) return;
        isVisible = nextVisible;
        if (isVisible && !isDisposed && !sharedRendererLost) {
          entry.render(performance.now(), 0.016, renderer);
          scheduleSharedLoop();
        }
      },
      { threshold: 0.01, rootMargin: '300px 0px' },
    );
    observer.observe(container);

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(container);

    const entry: SharedCardEntry = {
      isVisible: () => !isDisposed && isVisible && !sharedRendererLost,
      render: (_time, dt, activeRenderer) => {
        const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.25);
        activeRenderer.setPixelRatio(dpr);
        activeRenderer.setSize(targetW, targetH, false);

        if (!prefersReducedMotion) {
          group.rotation.y += 0.45 * dt;
          group.rotation.x += 0.22 * dt;
        }

        currentRotX += (targetRotX - currentRotX) * 0.1;
        currentRotY += (targetRotY - currentRotY) * 0.1;

        camera.position.x = currentRotY * 1.2;
        camera.position.y = -currentRotX * 1.2;
        camera.lookAt(0, 0, 0);

        activeRenderer.render(scene, camera);

        ctx2d.clearRect(0, 0, canvas.width, canvas.height);
        ctx2d.drawImage(activeRenderer.domElement, 0, 0, canvas.width, canvas.height);
      },
    };

    sharedEntries.add(entry);

    return () => {
      isDisposed = true;
      sharedEntries.delete(entry);
      sharedActiveCount = Math.max(0, sharedActiveCount - 1);
      observer.disconnect();
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('mouseleave', handlePointerLeave);

      cleanupGeometries.forEach((g) => g.dispose());
      cleanupMaterials.forEach((m) => m.dispose());
      releaseSharedRendererIfUnused();
    };
  }, [variant]);

  return (
    <div
      ref={containerRef}
      data-testid={testId}
      className={`relative w-full h-full flex items-center justify-center pointer-events-auto select-none ${className || ''}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
