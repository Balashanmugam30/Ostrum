'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useLanguage } from '@/context/LanguageContext';

export function GalleryCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const [activeChapterIndex, setActiveChapterIndex] = useState<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    const width = container.clientWidth || 1120;
    const height = 580;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.5, 10);
    pointLight.position.set(0, 1, 3);
    scene.add(pointLight);

    // Cards Group
    const carouselGroup = new THREE.Group();
    scene.add(carouselGroup);

    const textureLoader = new THREE.TextureLoader();
    const cardMeshes: THREE.Mesh[] = [];
    const cardWidth = 1.7;
    const cardHeight = 1.05;
    const cardGeometry = new THREE.PlaneGeometry(cardWidth, cardHeight, 16, 16);

    // Create curved card geometry slightly bowed along Y axis for tactile editorial feel
    const posAttribute = cardGeometry.attributes.position;
    for (let i = 0; i < posAttribute.count; i++) {
      const x = posAttribute.getX(i);
      const z = -Math.pow(x / (cardWidth / 2), 2) * 0.05;
      posAttribute.setZ(i, z);
    }
    cardGeometry.computeVertexNormals();

    const chapters = t.gallery.chapters;
    const totalCards = chapters.length;

    chapters.forEach((chapter, index) => {
      const tex = textureLoader.load(chapter.image, (loadedTex) => {
        loadedTex.colorSpace = THREE.SRGBColorSpace;
        loadedTex.minFilter = THREE.LinearFilter;
        loadedTex.magFilter = THREE.LinearFilter;
      });

      const cardMaterial = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.4,
        metalness: 0.1,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(cardGeometry, cardMaterial);
      (mesh as any).userData = { index, title: chapter.title, number: chapter.number };
      cardMeshes.push(mesh);
      carouselGroup.add(mesh);
    });

    // Carousel state
    let targetOffset = 0;
    let currentOffset = 0;
    let isDragging = false;
    let startX = 0;
    let prevDragX = 0;
    let dragVelocity = 0;

    const updateCardPositions = (offset: number) => {
      const spacing = 1.35;
      const radius = 5.2;

      cardMeshes.forEach((mesh, index) => {
        // Compute position along arc
        const progress = (index - (totalCards - 1) / 2) * spacing + offset;
        const angle = progress / radius;

        mesh.position.x = Math.sin(angle) * radius;
        mesh.position.z = Math.cos(angle) * radius - radius;
        mesh.rotation.y = angle * 0.9;
        mesh.rotation.z = -angle * 0.08;

        // Scale center card slightly larger
        const distFromCenter = Math.abs(mesh.position.x);
        const scaleFactor = Math.max(0.85, 1.15 - distFromCenter * 0.12);
        mesh.scale.set(scaleFactor, scaleFactor, 1);
      });
    };

    // Pointer event handlers
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      startX = clientX;
      prevDragX = clientX;
      dragVelocity = 0;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;

      if (isDragging) {
        const deltaX = clientX - prevDragX;
        dragVelocity = deltaX * 0.004;
        targetOffset += dragVelocity;
        prevDragX = clientX;
      } else {
        // Subtle cursor influence when hovering
        const rect = container.getBoundingClientRect();
        const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointLight.position.x = nx * 2;
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    domElement.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Animation Loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isDragging) {
        // Inertia
        targetOffset += dragVelocity;
        dragVelocity *= 0.93;

        // Soft bounce boundaries
        const maxOffset = 2.2;
        const minOffset = -2.2;
        if (targetOffset > maxOffset) {
          targetOffset += (maxOffset - targetOffset) * 0.1;
        } else if (targetOffset < minOffset) {
          targetOffset += (minOffset - targetOffset) * 0.1;
        }
      }

      // Smooth lerp
      currentOffset += (targetOffset - currentOffset) * 0.1;
      updateCardPositions(currentOffset);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      camera.aspect = newW / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domElement.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('resize', handleResize);

      if (domElement.parentNode) {
        domElement.parentNode.removeChild(domElement);
      }

      renderer.dispose();
      cardGeometry.dispose();
      cardMeshes.forEach((mesh) => {
        (mesh.material as THREE.Material).dispose();
      });
    };
  }, [t.gallery.chapters]);

  return (
    <div className="relative w-full overflow-hidden select-none">
      <div
        ref={containerRef}
        className="gallery-canvas w-full h-[580px] cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      />
      {/* Chapter badges at bottom of gallery */}
      <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 mt-6 px-4">
        {t.gallery.chapters.map((ch, idx) => (
          <div
            key={ch.id}
            className="flex items-center gap-2 text-xs md:text-sm tracking-wide text-white/60 hover:text-white transition-colors duration-200"
          >
            <span className="font-mono text-white/40">{ch.number}</span>
            <span>{ch.title}</span>
          </div>
        ))}
      </div>
      <p className="text-center text-[11px] font-mono uppercase tracking-wider text-white/40 mt-4">
        {t.gallery.hintDesktop}
      </p>
    </div>
  );
}
