'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Book3DCanvasProps {
  className?: string;
  isInteractive?: boolean;
}

function createSubUvPlane(w: number, h: number, uMin: number, uMax: number, segments = 16) {
  const geom = new THREE.PlaneGeometry(w, h, segments, 1);
  const uvs = geom.attributes.uv;
  for (let i = 0; i < uvs.count; i++) {
    const c = uvs.getX(i);
    uvs.setX(i, uMin + c * (uMax - uMin));
  }
  return geom;
}

export function Book3DCanvas({ className = '', isInteractive = true }: Book3DCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isMobile = window.innerWidth < 768;
    let animationFrameId: number;

    const size = {
      width: container.clientWidth || 420,
      height: container.clientHeight || 560,
    };

    // Reference dimensions
    const bookWidth = 1.48;
    const bookHeight = 2.1;
    const bookDepth = 0.035;
    const halfDepth = bookDepth / 2;

    const scene = new THREE.Scene();
    const aspect = size.width / size.height;
    const camera = new THREE.PerspectiveCamera(30, aspect, 0.1, 100);
    camera.position.set(0, 0, 4.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(size.width, size.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    // Reference Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff1ee, 1.8);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xc8d3ff, 0.6);
    fillLight.position.set(-3, 1, 3);
    scene.add(fillLight);

    const mouseLight = new THREE.PointLight(0xffeadb, 2, 3, 1.5);
    mouseLight.position.set(0, 0, 0.8);
    scene.add(mouseLight);

    const bookGroup = new THREE.Group();
    scene.add(bookGroup);

    // Textures & Materials
    const textureLoader = new THREE.TextureLoader();
    const bookTexture = textureLoader.load('/images/book.webp', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
    });

    const bookNormal = textureLoader.load('/images/book_normal.webp', (tex) => {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
    });

    const coverMaterial = new THREE.MeshStandardMaterial({
      map: bookTexture,
      normalMap: bookNormal,
      normalScale: new THREE.Vector2(1, 1),
      roughness: 0.85,
      metalness: 0,
      envMapIntensity: 0,
    });

    const spineEdgeMaterial = new THREE.MeshStandardMaterial({
      color: 0x151010,
      roughness: 0.7,
      metalness: 0,
    });

    const pageEdgeMaterial = new THREE.MeshStandardMaterial({
      color: 0xddd9cf,
      roughness: 0.9,
      metalness: 0,
    });

    const segs = isMobile ? 8 : 16;

    // 1. Front Cover (UV 0.5 to 1.0)
    const frontGeom = createSubUvPlane(bookWidth, bookHeight, 0.5, 1.0, segs);
    const frontMesh = new THREE.Mesh(frontGeom, coverMaterial);
    frontMesh.position.z = halfDepth;
    const frontBasePositions = new Float32Array(frontGeom.attributes.position.array);
    bookGroup.add(frontMesh);

    // 2. Back Cover (UV 0.0 to 0.5)
    const backGeom = createSubUvPlane(bookWidth, bookHeight, 0.0, 0.5, segs);
    const backMesh = new THREE.Mesh(backGeom, coverMaterial);
    backMesh.rotation.y = Math.PI;
    backMesh.position.z = -halfDepth;
    const backBasePositions = new Float32Array(backGeom.attributes.position.array);
    bookGroup.add(backMesh);

    // 3. Spine
    const spineGeom = new THREE.PlaneGeometry(bookDepth, bookHeight);
    const spineMesh = new THREE.Mesh(spineGeom, spineEdgeMaterial);
    spineMesh.rotation.y = -Math.PI / 2;
    spineMesh.position.x = -bookWidth / 2;
    bookGroup.add(spineMesh);

    // 4. Pages Edge (right)
    const pageGeom = new THREE.PlaneGeometry(bookDepth, bookHeight);
    const pageMesh = new THREE.Mesh(pageGeom, pageEdgeMaterial);
    pageMesh.rotation.y = Math.PI / 2;
    pageMesh.position.x = bookWidth / 2;
    bookGroup.add(pageMesh);

    // 5. Top Edge
    const topGeom = new THREE.PlaneGeometry(bookWidth, bookDepth);
    const topMesh = new THREE.Mesh(topGeom, spineEdgeMaterial);
    topMesh.rotation.x = -Math.PI / 2;
    topMesh.position.y = bookHeight / 2;
    bookGroup.add(topMesh);

    // 6. Bottom Edge
    const bottomGeom = new THREE.PlaneGeometry(bookWidth, bookDepth);
    const bottomMesh = new THREE.Mesh(bottomGeom, spineEdgeMaterial);
    bottomMesh.rotation.x = Math.PI / 2;
    bottomMesh.position.y = -bookHeight / 2;
    bookGroup.add(bottomMesh);

    function bendCover(mesh: THREE.Mesh, basePositions: Float32Array, amount: number) {
      if (!mesh || !basePositions) return;
      const pos = mesh.geometry.attributes.position;
      const halfW = bookWidth / 2;
      for (let n = 0; n < pos.count; n++) {
        const r = basePositions[n * 3];
        const c = basePositions[n * 3 + 2];
        const l = (r + halfW) / bookWidth;
        pos.setZ(n, c + Math.sin(l * Math.PI) * amount);
      }
      pos.needsUpdate = true;
    }

    // Scroll & Mouse Tracking
    let containerOffsetTop = 0;
    let containerOffsetLeft = 0;
    const cacheOffset = () => {
      let e = 0;
      let t = 0;
      let s: HTMLElement | null = container;
      while (s) {
        e += s.offsetTop;
        t += s.offsetLeft;
        s = s.offsetParent as HTMLElement | null;
      }
      containerOffsetTop = e;
      containerOffsetLeft = t;
    };
    cacheOffset();

    const mousePos = { x: 0, y: 0 };
    const targetMousePos = { x: 0, y: 0 };
    let scrollProgress = 0;
    let targetScrollProgress = 0;
    let isVisible = true;

    // Drag interaction support
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let dragOffset = { x: 0, y: 0 };

    const onMouseMove = (e: MouseEvent) => {
      if (isMobile) return;
      if (isDragging) {
        dragOffset.x += (e.clientX - dragStart.x) * 0.005;
        dragOffset.y += (e.clientY - dragStart.y) * 0.005;
        dragStart = { x: e.clientX, y: e.clientY };
        return;
      }
      const s = containerOffsetTop - window.scrollY;
      const i = containerOffsetLeft;
      targetMousePos.x = ((e.clientX - i) / size.width - 0.5) * 2;
      targetMousePos.y = ((e.clientY - s) / size.height - 0.5) * 2;
    };

    const onMouseDown = (e: MouseEvent) => {
      if (!isInteractive) return;
      isDragging = true;
      dragStart = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onScroll = () => {
      const vh = window.innerHeight;
      const topRel = containerOffsetTop - window.scrollY;
      const s = vh * 0.85;
      const i = vh * 0.1;
      const o = vh * -0.6;
      if (topRel > i) {
        const n = 1 - (topRel - i) / (s - i);
        targetScrollProgress = Math.max(0, Math.min(1, n));
      } else {
        const n = 1 + (i - topRel) / (i - o);
        targetScrollProgress = Math.max(1, Math.min(2, n));
      }
    };

    const onVisibilityChange = () => {
      isVisible = document.visibilityState === 'visible';
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('mousedown', onMouseDown);
    document.addEventListener('visibilitychange', onVisibilityChange);
    onScroll();

    const startTime = performance.now();
    let lastTime = startTime;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const now = performance.now();
      const dt = Math.min((now - lastTime) * 0.001, 0.05);
      lastTime = now;
      const elapsed = (now - startTime) * 0.001;
      const smooth = 1 - Math.exp(-3 * dt);

      mousePos.x += (targetMousePos.x - mousePos.x) * smooth;
      mousePos.y += (targetMousePos.y - mousePos.y) * smooth;
      dragOffset.x *= 0.95;
      dragOffset.y *= 0.95;

      scrollProgress += (targetScrollProgress - scrollProgress) * 0.1;

      const sp = scrollProgress;
      const o = Math.max(0, Math.min(1, sp));
      const n = Math.max(0, Math.min(1, sp - 1));

      let rotY = THREE.MathUtils.lerp(Math.PI - 0.3, -0.15, o);
      let rotX = THREE.MathUtils.lerp(0.3, 0.02, o);
      rotY += n * -(Math.PI - 0.3 + 0.15);
      rotX += n * (0.3 - 0.02);

      const l = Math.sin(o * Math.PI) * 0.08;
      const d = Math.sin(n * Math.PI) * -0.07;
      const bend = l + d;

      bendCover(frontMesh, frontBasePositions, bend);
      bendCover(backMesh, backBasePositions, -bend);

      const influence = o * (1 - n) * 0.12;
      bookGroup.rotation.y = rotY + mousePos.x * influence + dragOffset.x;
      bookGroup.rotation.x = rotX - mousePos.y * influence * 0.5 + dragOffset.y;

      const bob = Math.sin(elapsed * 0.8) * 0.015 * (o * (1 - n));
      bookGroup.position.y = bob;

      const scale = THREE.MathUtils.lerp(0.85, 1, o) - n * 0.1;
      bookGroup.scale.setScalar(scale);
      bookGroup.position.z = THREE.MathUtils.lerp(-0.3, 0, o) - n * 0.3;

      const lightX = THREE.MathUtils.lerp(5, 2, sp);
      const lightY = THREE.MathUtils.lerp(2, 4, sp);
      keyLight.position.set(lightX, lightY, 5);
      keyLight.intensity = THREE.MathUtils.lerp(1.2, 1.8, sp);

      mouseLight.position.set(mousePos.x * 1.2, -mousePos.y * 0.8, 0.6);

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      size.width = container.clientWidth || 420;
      size.height = container.clientHeight || 560;
      camera.aspect = size.width / size.height;
      camera.updateProjectionMatrix();
      renderer.setSize(size.width, size.height);
      cacheOffset();
      onScroll();
    };

    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);

      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      bookTexture.dispose();
      bookNormal.dispose();
      frontGeom.dispose();
      backGeom.dispose();
      spineGeom.dispose();
      pageGeom.dispose();
      topGeom.dispose();
      bottomGeom.dispose();
      coverMaterial.dispose();
      spineEdgeMaterial.dispose();
      pageEdgeMaterial.dispose();
      renderer.dispose();
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
