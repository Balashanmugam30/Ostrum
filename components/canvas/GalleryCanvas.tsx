'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const yt = `
  uniform vec2 uVelocity;
  uniform float uWiggle;
  uniform float uTime;
  uniform float uScale;

  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position * uScale;

    float fromTop = 1.0 - uv.y;
    float trail = fromTop * fromTop;

    pos.x -= uVelocity.x * trail * 15.0;
    pos.y -= uVelocity.y * trail * 15.0;

    float wave = sin(fromTop * 4.0 + uTime * 10.0) * 0.5
               + sin(fromTop * 7.0 - uTime * 13.0) * 0.3
               + sin(fromTop * 2.5 + uTime * 7.0) * 0.2;

    float nx = uv.x * 2.0 - 1.0;
    float waveX = sin(nx * 3.0 + uTime * 8.0) * 0.4
                + sin(nx * 6.0 - uTime * 11.0) * 0.3;

    float wiggleStrength = uWiggle * trail;
    pos.x += (wave + waveX) * wiggleStrength * 0.5;
    pos.y += wave * wiggleStrength * 0.35;

    pos.z += trail * uWiggle * 0.15;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const wt = `
  precision highp float;
  uniform sampler2D uTexture;
  varying vec2 vUv;

  void main() {
    gl_FragColor = texture2D(uTexture, vUv);
  }
`;

function easeInOutCubic(h: number) {
  return h < 0.5 ? 4 * h * h * h : 1 - Math.pow(-2 * h + 2, 3) / 2;
}

function createCoverPlane(w: number, h: number, textureAspect: number) {
  const geom = new THREE.PlaneGeometry(w, h, 8, 12);
  const aspect = w / h;
  const uv = geom.attributes.uv;
  for (let r = 0; r < uv.count; r++) {
    let c = uv.getX(r);
    let l = uv.getY(r);
    if (aspect > textureAspect) {
      const d = textureAspect / aspect;
      l = l * d + (1 - d) / 2;
    } else {
      const d = aspect / textureAspect;
      c = c * d + (1 - d) / 2;
    }
    uv.setXY(r, c, l);
  }
  return geom;
}

interface Leaf {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  stackPos: THREE.Vector3;
  stackRot: number;
  spreadPos: THREE.Vector3;
  spreadRot: number;
  isDragging: boolean;
  dragOffset: THREE.Vector2;
  currentPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  velocity: THREE.Vector2;
  wiggleEnergy: number;
}

export function GalleryCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isMobile = window.innerWidth < 768;
    const viewH = 5;
    const imageAspect = 16 / 9;
    const images = [
      '/images/teaser/xp-1.webp',
      '/images/teaser/xp-2.webp',
      '/images/teaser/xp-3.webp',
      '/images/teaser/xp-4.webp',
      '/images/teaser/xp-5.webp',
      '/images/teaser/xp-6.webp',
    ];

    let animationFrameId: number;
    const size = {
      width: container.clientWidth || window.innerWidth,
      height: container.clientHeight || 650,
    };

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(size.width, size.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const aspect = size.width / size.height;
    const viewW = viewH * aspect;
    const camera = new THREE.OrthographicCamera(
      -viewW / 2,
      viewW / 2,
      viewH / 2,
      -viewH / 2,
      0.1,
      100
    );
    camera.position.z = 10;
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();

    const leaves: Leaf[] = [];
    const spreadSeeds: { rx: number; ry: number }[] = [];
    const total = images.length;
    for (let i = 0; i < total; i++) {
      spreadSeeds.push({ rx: Math.random() - 0.5, ry: Math.random() - 0.5 });
    }

    const tAspect = size.width / size.height;
    const sViewW = viewH * tAspect;
    const cardH = isMobile ? (sViewW * 0.58) / imageAspect : viewH * 0.42;
    const cardW = cardH * imageAspect;

    const textureLoader = new THREE.TextureLoader();
    images.forEach((src, n) => {
      const tex = textureLoader.load(src, () => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = true;
      });

      const geom = createCoverPlane(cardW, cardH, 16 / 9);
      const mat = new THREE.ShaderMaterial({
        vertexShader: yt,
        fragmentShader: wt,
        uniforms: {
          uTexture: { value: tex },
          uVelocity: { value: new THREE.Vector2(0, 0) },
          uWiggle: { value: 0 },
          uTime: { value: 0 },
          uScale: { value: 0.85 },
        },
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false,
      });

      const mesh = new THREE.Mesh(geom, mat);
      const m = (n - (total - 1) / 2) * 0.06;
      const w = (n - (total - 1) / 2) * 0.03;
      const rot = (n - (total - 1) / 2) * 0.18;

      mesh.position.set(m, w, 0);
      mesh.rotation.z = rot;
      const highlightIndices = [1, 4];
      mesh.renderOrder = highlightIndices.includes(n) ? total + n : n;
      scene.add(mesh);

      leaves.push({
        mesh,
        material: mat,
        stackPos: new THREE.Vector3(m, w, 0),
        stackRot: rot,
        spreadPos: new THREE.Vector3(0, 0, 0),
        spreadRot: 0,
        isDragging: false,
        dragOffset: new THREE.Vector2(0, 0),
        currentPos: new THREE.Vector3(m, w, 0),
        targetPos: new THREE.Vector3(m, w, 0),
        velocity: new THREE.Vector2(0, 0),
        wiggleEnergy: 0,
      });
    });

    const computeSpreadPositions = () => {
      if (leaves.length === 0) return;
      const currentAspect = size.width / size.height;
      const curViewW = viewH * currentAspect;
      const curCardH = isMobile ? (curViewW * 0.58) / imageAspect : viewH * 0.42;
      const curCardW = curCardH * imageAspect;
      const margin = viewH * 0.04;
      const halfW = curCardW / 2 + margin;
      const halfH = curCardH / 2;
      const cols = isMobile ? 2 : 3;
      const rows = Math.ceil(total / cols);
      const availW = curViewW - 2 * halfW;
      const colSpacing = isMobile ? curCardW * 0 : availW / (cols - 1) - curCardW;
      const stepX = isMobile ? curCardW + colSpacing : availW / (cols - 1);
      const stepY = curCardH * (isMobile ? 1.2 : 1.15);
      const totalSpreadW = (cols - 1) * stepX;
      const totalSpreadH = (rows - 1) * stepY / 2;

      for (let x = 0; x < total; x++) {
        const row = Math.floor(x / cols);
        const col = x % cols;
        const posX = -totalSpreadW / 2 + col * stepX;
        const posY = totalSpreadH - row * stepY;
        const jitterX = spreadSeeds[x].rx * stepX * (isMobile ? 0.1 : 0.2);
        const jitterY = spreadSeeds[x].ry * stepY * (isMobile ? 0.15 : 0.12);
        const boundX = curViewW / 2 - halfW;
        const boundY = viewH / 2 - halfH;
        const finalX = isMobile ? posX + jitterX : Math.max(-boundX, Math.min(boundX, posX + jitterX));
        const finalY = Math.max(-boundY, Math.min(boundY, posY + jitterY));
        leaves[x].spreadPos.set(finalX, finalY, 0);
      }
    };
    computeSpreadPositions();

    const screenToWorld = (cx: number, cy: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const nx = ((cx - rect.left) / rect.width) * 2 - 1;
      const ny = -(((cy - rect.top) / rect.height) * 2 - 1);
      const curAspect = size.width / size.height;
      const curViewW = viewH * curAspect;
      return new THREE.Vector2((nx * curViewW) / 2, (ny * viewH) / 2);
    };

    const findLeafAt = (p: THREE.Vector2) => {
      const currentAspect = size.width / size.height;
      const curViewW = viewH * currentAspect;
      const curCardH = isMobile ? (curViewW * 0.58) / imageAspect : viewH * 0.42;
      const halfW = (curCardH * imageAspect) / 2;
      const halfH = curCardH / 2;

      for (let i = leaves.length - 1; i >= 0; i--) {
        const leaf = leaves[i];
        const dx = p.x - leaf.mesh.position.x;
        const dy = p.y - leaf.mesh.position.y;
        const rot = -leaf.mesh.rotation.z;
        const cos = Math.cos(rot);
        const sin = Math.sin(rot);
        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;
        if (Math.abs(localX) < halfW && Math.abs(localY) < halfH) {
          return leaf;
        }
      }
      return null;
    };

    let activeDragLeaf: Leaf | null = null;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const wp = screenToWorld(cx, cy);
      const hit = findLeafAt(wp);
      if (hit) {
        activeDragLeaf = hit;
        hit.isDragging = true;
        hit.dragOffset.set(hit.mesh.position.x - wp.x, hit.mesh.position.y - wp.y);
      }
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!activeDragLeaf) return;
      const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const wp = screenToWorld(cx, cy);
      activeDragLeaf.targetPos.x = wp.x + activeDragLeaf.dragOffset.x;
      activeDragLeaf.targetPos.y = wp.y + activeDragLeaf.dragOffset.y;
    };

    const onPointerUp = () => {
      if (activeDragLeaf) {
        activeDragLeaf.isDragging = false;
        activeDragLeaf = null;
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    domElement.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    let scrollProgress = 0;
    let isVisible = true;

    const onScroll = () => {
      const section = container.closest('section') || container;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const totalH = vh + rect.height / 2;
      const currentScroll = vh - rect.top;
      scrollProgress = Math.max(0, Math.min(1, currentScroll / totalH));
    };

    const onVisibilityChange = () => {
      isVisible = document.visibilityState === 'visible';
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    onScroll();

    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible || leaves.length === 0) return;

      const elapsed = (performance.now() - startTime) * 0.001;
      const t = easeInOutCubic(scrollProgress);

      for (const s of leaves) {
        const prevX = s.currentPos.x;
        const prevY = s.currentPos.y;

        if (!s.isDragging) {
          s.targetPos.x = s.stackPos.x + (s.spreadPos.x - s.stackPos.x) * t;
          s.targetPos.y = s.stackPos.y + (s.spreadPos.y - s.stackPos.y) * t;
          s.targetPos.z = s.stackPos.z + (s.spreadPos.z - s.stackPos.z) * t;
          s.mesh.rotation.z = s.stackRot + (s.spreadRot - s.stackRot) * t;
        }

        const lerpFactor = s.isDragging ? 0.18 : 0.15;
        s.currentPos.x += (s.targetPos.x - s.currentPos.x) * lerpFactor;
        s.currentPos.y += (s.targetPos.y - s.currentPos.y) * lerpFactor;
        s.currentPos.z += (s.targetPos.z - s.currentPos.z) * lerpFactor;

        const velX = s.currentPos.x - prevX;
        const velY = s.currentPos.y - prevY;
        s.velocity.x += (velX - s.velocity.x) * 0.3;
        s.velocity.y += (velY - s.velocity.y) * 0.3;

        const speed = Math.sqrt(s.velocity.x * s.velocity.x + s.velocity.y * s.velocity.y);
        const mult = s.isDragging ? 25 : 6;
        s.wiggleEnergy = Math.max(s.wiggleEnergy * 0.97, speed * mult);

        s.mesh.position.x = s.currentPos.x;
        s.mesh.position.y = s.currentPos.y;
        s.mesh.position.z = s.currentPos.z;

        s.material.uniforms.uVelocity.value.set(s.velocity.x, s.velocity.y);
        s.material.uniforms.uWiggle.value = Math.min(s.wiggleEnergy, 1.5);
        s.material.uniforms.uTime.value = elapsed;
        s.material.uniforms.uScale.value = 0.85 + 0.15 * t;
      }

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      size.width = container.clientWidth || window.innerWidth;
      size.height = container.clientHeight || 650;
      const newAspect = size.width / size.height;
      const newViewW = viewH * newAspect;
      camera.left = -newViewW / 2;
      camera.right = newViewW / 2;
      camera.top = viewH / 2;
      camera.bottom = -viewH / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(size.width, size.height);
      computeSpreadPositions();
      onScroll();
    };

    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domElement.removeEventListener('mousedown', onPointerDown);
      domElement.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      document.removeEventListener('visibilitychange', onVisibilityChange);

      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      leaves.forEach((l) => {
        l.material.uniforms.uTexture.value?.dispose();
        l.material.dispose();
        l.mesh.geometry.dispose();
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="gallery-canvas w-full h-[540px] md:h-[680px] cursor-grab active:cursor-grabbing select-none"
      style={{ touchAction: 'none' }}
    />
  );
}
