'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface Card3DAccentProps {
  variant: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function Card3DAccent({ variant, className }: Card3DAccentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let isDisposed = false;
    let isVisible = true;
    let animId: number = 0;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.set(0, 0, 5.2);

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.25);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0); // 100% transparent
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // Resize handler
    const updateSize = () => {
      if (!container || !renderer) return;
      const rect = container.getBoundingClientRect();
      const w = Math.max(120, rect.width);
      const h = Math.max(120, rect.height);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    updateSize();

    // 2. Studio Lighting Rig tailored for glossy glass and specular metallics
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

    // 3. Procedural Sculptures for each of the 6 capabilities
    const group = new THREE.Group();
    scene.add(group);

    const cleanupGeometries: THREE.BufferGeometry[] = [];
    const cleanupMaterials: THREE.Material[] = [];

    if (variant === 1) {
      // 1. DIGITAL EXPERIENCES: Translucent iridescent glass form / sculptural digital interface prism
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
      const mesh = new THREE.Mesh(geom, mat);
      group.add(mesh);

      // Fine wireframe inner accent
      const innerGeom = new THREE.OctahedronGeometry(0.72, 0);
      cleanupGeometries.push(innerGeom);
      const innerMat = new THREE.MeshStandardMaterial({
        color: 0x9b51e0,
        wireframe: true,
        roughness: 0.2,
      });
      cleanupMaterials.push(innerMat);
      const innerMesh = new THREE.Mesh(innerGeom, innerMat);
      group.add(innerMesh);
    } else if (variant === 2) {
      // 2. AI SYSTEMS & AGENTS: Neural structure / luminous orbital core
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
      const coreMesh = new THREE.Mesh(coreGeom, coreMat);
      group.add(coreMesh);

      // Two nested orbital rings
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
      // 3. BUSINESS PLATFORMS: Isometric architectural glass / modular structure
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
      // 4. SOFTWARE & PRODUCT ENGINEERING: Layered digital prism / metallic geometry
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
      // 5. HARDWARE & CONNECTED TECHNOLOGY: Precision-machined electronic sculpture / sensor structure
      const cylGeom = new THREE.CylinderGeometry(0.68, 0.68, 1.1, 32);
      cleanupGeometries.push(cylGeom);
      const cylMat = new THREE.MeshStandardMaterial({
        color: 0xbdeccf,
        metalness: 0.85,
        roughness: 0.2,
      });
      cleanupMaterials.push(cylMat);
      const cyl = new THREE.Mesh(cylGeom, cylMat);
      group.add(cyl);

      // Fine concentric rings
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
      // 6. CUSTOM ENGINEERING: Abstract multidisciplinary geometric assembly
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
      const knot = new THREE.Mesh(knotGeom, knotMat);
      group.add(knot);
    }

    // 4. Interactive pointer tilt
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
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

    // 5. Visibility optimization via IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = entry?.isIntersecting ?? false;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // ResizeObserver for container
    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(container);

    // 6. Main animation loop
    let lastTime = performance.now();
    const animate = (time: number) => {
      if (isDisposed) return;
      animId = requestAnimationFrame(animate);

      if (!isVisible || !renderer) return;

      const dt = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;

      // Gentle continuous rotation
      if (!prefersReducedMotion) {
        group.rotation.y += 0.45 * dt;
        group.rotation.x += 0.22 * dt;
      }

      // Smooth pointer tilt lerp
      currentRotX += (targetRotX - currentRotX) * 0.1;
      currentRotY += (targetRotY - currentRotY) * 0.1;

      camera.position.x = currentRotY * 1.2;
      camera.position.y = -currentRotX * 1.2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      observer.disconnect();
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('mouseleave', handlePointerLeave);

      cleanupGeometries.forEach((g) => g.dispose());
      cleanupMaterials.forEach((m) => m.dispose());
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [variant]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center pointer-events-auto select-none ${className || ''}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
