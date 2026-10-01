'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Book3DCanvasProps {
  className?: string;
  isInteractive?: boolean;
}

export function Book3DCanvas({ className = '', isInteractive = true }: Book3DCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    const width = container.clientWidth || 392;
    const height = container.clientHeight || 523;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.8);
    keyLight.position.set(2, 3, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xcc3322, 1.2);
    rimLight.position.set(-3, -2, -1);
    scene.add(rimLight);

    const mouseLight = new THREE.PointLight(0xffffff, 1.2, 5);
    mouseLight.position.set(0, 0, 1.5);
    scene.add(mouseLight);

    // Book Group
    const bookGroup = new THREE.Group();
    scene.add(bookGroup);

    // Hardcover Book Dimensions (1:1.4 aspect ratio)
    const bookWidth = 1.12;
    const bookHeight = 1.56;
    const bookDepth = 0.12;
    const halfDepth = bookDepth / 2;

    const textureLoader = new THREE.TextureLoader();
    const bookTexture = textureLoader.load('/images/book.webp', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
    });

    const normalTexture = textureLoader.load('/images/book_normal.webp', (tex) => {
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
    });

    // Cover material with normal bump mapping
    const coverMaterial = new THREE.MeshStandardMaterial({
      map: bookTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(0.9, 0.9),
      roughness: 0.85,
      metalness: 0.05,
    });

    // Dark page edges material
    const pageMaterial = new THREE.MeshStandardMaterial({
      color: 0x181514,
      roughness: 0.85,
      metalness: 0.0,
    });

    // 1. Front Cover (UV x mapped from 0.5 to 1.0)
    const frontGeometry = new THREE.PlaneGeometry(bookWidth, bookHeight, 16, 16);
    const frontUvs = frontGeometry.attributes.uv;
    for (let i = 0; i < frontUvs.count; i++) {
      const u = frontUvs.getX(i);
      frontUvs.setX(i, 0.5 + u * 0.5);
    }
    const frontMesh = new THREE.Mesh(frontGeometry, coverMaterial);
    frontMesh.position.z = halfDepth;
    bookGroup.add(frontMesh);

    // 2. Back Cover (UV x mapped from 0.0 to 0.5)
    const backGeometry = new THREE.PlaneGeometry(bookWidth, bookHeight, 16, 16);
    const backUvs = backGeometry.attributes.uv;
    for (let i = 0; i < backUvs.count; i++) {
      const u = backUvs.getX(i);
      backUvs.setX(i, u * 0.5);
    }
    const backMesh = new THREE.Mesh(backGeometry, coverMaterial);
    backMesh.position.z = -halfDepth;
    backMesh.rotation.y = Math.PI;
    bookGroup.add(backMesh);

    // 3. Spine (-X edge)
    const spineGeometry = new THREE.PlaneGeometry(bookDepth, bookHeight);
    const spineMaterial = new THREE.MeshStandardMaterial({
      color: 0x141010,
      roughness: 0.75,
      metalness: 0.0,
    });
    const spineMesh = new THREE.Mesh(spineGeometry, spineMaterial);
    spineMesh.position.x = -bookWidth / 2;
    spineMesh.rotation.y = -Math.PI / 2;
    bookGroup.add(spineMesh);

    // 4. Paper block (+X right pages edge)
    const rightPageGeometry = new THREE.PlaneGeometry(bookDepth, bookHeight);
    const rightPageMesh = new THREE.Mesh(rightPageGeometry, pageMaterial);
    rightPageMesh.position.x = bookWidth / 2;
    rightPageMesh.rotation.y = Math.PI / 2;
    bookGroup.add(rightPageMesh);

    // 5. Top paper block (+Y edge)
    const topPageGeometry = new THREE.PlaneGeometry(bookWidth, bookDepth);
    const topPageMesh = new THREE.Mesh(topPageGeometry, pageMaterial);
    topPageMesh.position.y = bookHeight / 2;
    topPageMesh.rotation.x = -Math.PI / 2;
    bookGroup.add(topPageMesh);

    // 6. Bottom paper block (-Y edge)
    const bottomPageGeometry = new THREE.PlaneGeometry(bookWidth, bookDepth);
    const bottomPageMesh = new THREE.Mesh(bottomPageGeometry, pageMaterial);
    bottomPageMesh.position.y = -bookHeight / 2;
    bottomPageMesh.rotation.x = Math.PI / 2;
    bookGroup.add(bottomPageMesh);

    // Initial orientation: angled slightly to showcase 3D physical depth
    bookGroup.rotation.y = -0.32;
    bookGroup.rotation.x = 0.10;

    // Interaction State
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let targetRotation = { x: 0.10, y: -0.32 };
    let currentRotation = { x: 0.10, y: -0.32 };
    let rotationVelocity = { x: 0, y: 0 };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!isInteractive) return;
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevMousePos = { x: clientX, y: clientY };
      rotationVelocity = { x: 0, y: 0 };
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const rect = container.getBoundingClientRect();
      const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((clientY - rect.top) / rect.height) * 2 - 1);
      mouseLight.position.set(nx * 1.5, ny * 1.5, 1.8);

      if (!isDragging || !isInteractive) return;

      const deltaX = clientX - prevMousePos.x;
      const deltaY = clientY - prevMousePos.y;

      rotationVelocity = {
        x: deltaY * 0.008,
        y: deltaX * 0.008,
      };

      targetRotation.y += rotationVelocity.y;
      targetRotation.x += rotationVelocity.x;
      targetRotation.x = Math.max(-0.6, Math.min(0.6, targetRotation.x));

      prevMousePos = { x: clientX, y: clientY };
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
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!isDragging) {
        targetRotation.y += rotationVelocity.y;
        targetRotation.x += rotationVelocity.x;
        rotationVelocity.x *= 0.92;
        rotationVelocity.y *= 0.92;

        const gentleBob = Math.sin(elapsedTime * 1.2) * 0.035;
        bookGroup.position.y = gentleBob;
      }

      currentRotation.x += (targetRotation.x - currentRotation.x) * 0.1;
      currentRotation.y += (targetRotation.y - currentRotation.y) * 0.1;

      bookGroup.rotation.x = currentRotation.x;
      bookGroup.rotation.y = currentRotation.y;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
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
      frontGeometry.dispose();
      backGeometry.dispose();
      spineGeometry.dispose();
      rightPageGeometry.dispose();
      topPageGeometry.dispose();
      bottomPageGeometry.dispose();
      coverMaterial.dispose();
      spineMaterial.dispose();
      pageMaterial.dispose();
      bookTexture.dispose();
      normalTexture.dispose();
    };
  }, [isInteractive]);

  return (
    <div
      ref={containerRef}
      className={`book-3d w-full h-[480px] md:h-[560px] cursor-grab active:cursor-grabbing ${className}`}
      style={{ touchAction: 'none' }}
    />
  );
}
