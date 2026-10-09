'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Module-level cache to eliminate redundant asset decoding
let cachedModelScene: THREE.Group | null = null;

export function OstrumContinuousJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isMobile = window.innerWidth < 768;

    let isDisposed = false;
    let isContextLost = false;
    let animId: number;

    // 1. Scene & Camera setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 50);
    camera.position.set(0, 0, 7.5);

    // 2. WebGL Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isMobile,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    const dpr = Math.min(window.devicePixelRatio, isMobile ? 1.0 : 1.35);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0); // 100% transparent
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);

    // Context loss listeners
    const onContextLost = (e: Event) => {
      e.preventDefault();
      isContextLost = true;
    };
    const onContextRestored = () => {
      isContextLost = false;
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost, false);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored, false);

    // 3. Studio 4-point Lighting Rig
    const keyLight = new THREE.DirectionalLight('#fff7ee', 2.2);
    keyLight.position.set(-2.5, 3.6, 3.2);
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight('#fdeddc', '#220404', 0.95);
    hemiLight.position.set(0, 5, 0);
    scene.add(hemiLight);

    const rimLight = new THREE.PointLight('#ff4d30', 1.8, 12, 1.2);
    rimLight.position.set(3.4, -1.2, -2.6);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight('#ffebd8', 0.45);
    fillLight.position.set(1.8, 1.2, 2.0);
    scene.add(fillLight);

    // 4. Crimson Porcelain Material (Performance-first, zero transmission)
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#f7eee8'),
      roughness: 0.26,
      metalness: 0.06,
      clearcoat: 0.58,
      clearcoatRoughness: 0.18,
      transmission: 0,
      ior: 1.50,
      sheen: 0.65,
      sheenColor: new THREE.Color('#ffdcd8'),
      sheenRoughness: 0.35,
      specularColor: new THREE.Color('#ffffff'),
      specularIntensity: 0.95,
      iridescence: 0.06,
      iridescenceIOR: 1.32,
      side: THREE.DoubleSide,
    });

    // 5. Model Root & Pivot Group
    const modelRoot = new THREE.Group();
    scene.add(modelRoot);

    const pivotGroup = new THREE.Group();
    modelRoot.add(pivotGroup);
    pivotGroup.rotation.x = 0.20;
    pivotGroup.rotation.z = -0.05;

    const setupModelMesh = (rawGroup: THREE.Group) => {
      rawGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.material = material;
          mesh.castShadow = false;
          mesh.receiveShadow = false;
          if (mesh.geometry) {
            mesh.geometry.computeVertexNormals();
          }
        }
      });

      const box = new THREE.Box3().setFromObject(rawGroup);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);

      rawGroup.position.set(-center.x, -center.y, -center.z);

      const maxDim = Math.max(size.x, size.y, size.z);
      const targetDim = 3.35;
      const baseScale = maxDim > 0 ? targetDim / maxDim : 0.017;
      pivotGroup.scale.set(baseScale, baseScale, baseScale);
      pivotGroup.add(rawGroup);

      setIsLoaded(true);
    };

    if (cachedModelScene) {
      setupModelMesh(cachedModelScene.clone(true));
    } else {
      const loader = new GLTFLoader();
      loader.load('/models/monyedre-360.glb', (gltf) => {
        if (isDisposed) return;
        cachedModelScene = gltf.scene;
        setupModelMesh(gltf.scene.clone(true));
      });
    }

    // 6. Mathematical Screen-to-World Projection
    // FOV 34 at z = 7.5
    const getVisibleWorldDimensions = () => {
      const vHeight = 2 * Math.tan((34 * Math.PI) / 360) * 7.5;
      const vWidth = vHeight * (window.innerWidth / window.innerHeight);
      return { vWidth, vHeight };
    };

    const screenToWorld = (screenX: number, screenY: number) => {
      const { vWidth, vHeight } = getVisibleWorldDimensions();
      const worldX = ((screenX / window.innerWidth) * 2 - 1) * (vWidth / 2);
      const worldY = -(((screenY / window.innerHeight) * 2 - 1) * (vHeight / 2));
      return { x: worldX, y: worldY };
    };

    // 7. Cached Anchor Geometry & Dynamic Tracking
    interface AnchorData {
      heroDocX: number;
      heroDocY: number;
      heroScale: number;
      slotDocX: number;
      slotDocY: number;
      slotScale: number;
      dockScrollY: number;
      exitScrollY: number;
    }

    let anchors: AnchorData = {
      heroDocX: window.innerWidth * 0.16,
      heroDocY: window.innerHeight * 0.35,
      heroScale: 0.25,
      slotDocX: window.innerWidth * 0.50,
      slotDocY: window.innerHeight * 1.8,
      slotScale: 0.55,
      dockScrollY: 1000,
      exitScrollY: 2200,
    };

    const updateAnchors = () => {
      const isMob = window.innerWidth < 768;
      const vHeight = 2 * Math.tan((34 * Math.PI) / 360) * 7.5;

      // 1. Measure Hero SVG Wordmark
      const heroSvg = document.querySelector('.intro svg[aria-label="OSTRUM"]');
      let hDocX = window.innerWidth * 0.16;
      let hDocY = window.innerHeight * 0.35;
      let hWidth = 160;

      if (heroSvg) {
        const svgRect = heroSvg.getBoundingClientRect();
        const svgScale = svgRect.width / 1253;
        // In SVG viewBox 0 0 1253 360, the optical center of 'O' is at x = 104, y = 171
        hDocX = svgRect.left + 104 * svgScale;
        hDocY = svgRect.top + 171 * svgScale + window.scrollY;
        hWidth = 185 * svgScale;
      }

      // Hero scale: fit comfortably inside 'O' counter footprint with zero collision with 'S'
      // Scaled strictly proportional to measured 'O' width
      const heroPixelTarget = Math.max(32, hWidth * 0.72);
      const heroWorldUnits = (heroPixelTarget / window.innerHeight) * vHeight;
      const hScale = Math.max(0.05, Math.min(0.24, heroWorldUnits / 3.35));

      // 2. Measure Section 02 Slot
      const engineSlot = document.getElementById('section02-sculpture-slot');
      const engineSection = document.getElementById('engine');

      let sDocX = window.innerWidth * 0.50;
      let sDocY = window.innerHeight * 1.8;
      let sWidth = isMob ? 320 : 470;

      if (engineSlot) {
        const slotRect = engineSlot.getBoundingClientRect();
        sDocX = slotRect.left + slotRect.width * 0.50;
        sDocY = slotRect.top + slotRect.height * 0.50 + window.scrollY;
        sWidth = slotRect.width;
      }

      // Section 02 scale: fit cleanly within the slot with ample breathing room
      const slotPixelTarget = isMob
        ? Math.min(220, window.innerWidth * 0.58)
        : Math.min(330, sWidth * 0.70);
      const slotWorldUnits = (slotPixelTarget / window.innerHeight) * vHeight;
      const sScale = Math.max(0.25, Math.min(0.55, slotWorldUnits / 3.35));

      // Dock scroll position: when slot center reaches viewport center
      const dScrollY = Math.max(1, sDocY - window.innerHeight * 0.50);

      let exitY = sDocY + 600;
      if (engineSection) {
        const engRect = engineSection.getBoundingClientRect();
        exitY = engRect.bottom + window.scrollY;
      }

      anchors = {
        heroDocX: hDocX,
        heroDocY: hDocY,
        heroScale: hScale,
        slotDocX: sDocX,
        slotDocY: sDocY,
        slotScale: sScale,
        dockScrollY: dScrollY,
        exitScrollY: exitY,
      };
    };

    updateAnchors();
    const anchorTimer1 = setTimeout(updateAnchors, 100);
    const anchorTimer2 = setTimeout(updateAnchors, 500);

    let focusBias = 0;
    let targetFocusBias = 0;
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

    // Listen for hover bias events from Section 02
    const handleFocusBias = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      targetFocusBias = typeof customEvent.detail === 'number' ? customEvent.detail : 0;
    };
    window.addEventListener('ostrum:focus-bias', handleFocusBias);

    // Pointer move
    const handleMouseMove = (e: MouseEvent) => {
      if (isMobile || prefersReducedMotion) return;
      pointer.targetX = ((e.clientX / window.innerWidth) * 2 - 1) * 0.12;
      pointer.targetY = -(((e.clientY / window.innerHeight) * 2 - 1) * 0.12);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 8. Render Animation Loop
    let currentX = 0;
    let currentY = 0;
    let currentScale = anchors.heroScale;
    let currentRotationY = 0;
    let isInitialized = false;

    const animate = (time: number) => {
      if (isDisposed) return;
      animId = requestAnimationFrame(animate);

      if (isContextLost) return;

      const scrollY = window.scrollY;

      // Offscreen culling: if scrolled well past Section 02, pause rendering to save GPU
      const isPastExit = scrollY > anchors.exitScrollY + 250;
      if (isPastExit) {
        if (container.style.opacity !== '0') {
          container.style.opacity = '0';
        }
        return;
      } else {
        if (container.style.opacity !== '1') {
          container.style.opacity = '1';
        }
      }

      // Damped pointer & focus bias
      pointer.x += (pointer.targetX - pointer.x) * 0.06;
      pointer.y += (pointer.targetY - pointer.y) * 0.06;
      focusBias += (targetFocusBias - focusBias) * 0.10;

      // Master Travel Choreography
      // Progress t: 0.0 at top of page -> 1.0 when Section 02 is centered
      const t = Math.min(1, Math.max(0, scrollY / anchors.dockScrollY));

      // Smooth cubic ease-in-out
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      let targetScreenX: number;
      let targetScreenY: number;
      let targetScale: number;

      if (scrollY <= anchors.dockScrollY) {
        // JOURNEY PHASE (Hero 'O' -> Section 02 Centerpiece)
        // Horizontal: glides smoothly from Hero 'O' center to viewport center
        targetScreenX = anchors.heroDocX + (anchors.slotDocX - anchors.heroDocX) * ease;

        // Vertical: descends smoothly from initial Hero 'O' elevation to viewport center
        const startScreenY = anchors.heroDocY;
        const targetCenterY = window.innerHeight * 0.50;
        targetScreenY = startScreenY + (targetCenterY - startScreenY) * ease;

        // Scale: smoothly scales from hero silhouette scale up to centerpiece scale
        targetScale = anchors.heroScale + (anchors.slotScale - anchors.heroScale) * ease;
      } else {
        // DOCKED PHASE (Firmly attached to Section 02 slot in document space)
        // Travels UP with Section 02 as user scrolls into later sections
        targetScreenX = anchors.slotDocX;
        targetScreenY = anchors.slotDocY - scrollY;
        targetScale = anchors.slotScale;
      }

      // Convert target screen pixel coords to 3D world coords
      const targetWorld = screenToWorld(targetScreenX, targetScreenY);

      // On first frame, initialize coordinates immediately to prevent lerp jumps
      if (!isInitialized) {
        currentX = targetWorld.x;
        currentY = targetWorld.y;
        currentScale = targetScale;
        currentRotationY = t * Math.PI * 2;
        isInitialized = true;
      } else {
        currentX += (targetWorld.x - currentX) * 0.18;
        currentY += (targetWorld.y - currentY) * 0.18;
        currentScale += (targetScale - currentScale) * 0.16;
      }

      // Zero-G subtle organic breathing float
      const floatOffset = Math.sin(time * 0.0016) * 0.04 * currentScale;

      modelRoot.position.set(currentX, currentY + floatOffset, 0);
      modelRoot.scale.set(currentScale, currentScale, currentScale);

      // Continuous 360-degree rotation across journey + focus bias
      const targetRotY = t * Math.PI * 2 + focusBias;
      currentRotationY += (targetRotY - currentRotationY) * 0.14;
      modelRoot.rotation.y = currentRotationY;

      // Subtle spatial pointer tilt
      if (!isMobile && !prefersReducedMotion) {
        modelRoot.rotation.x = pointer.y * 0.16;
        modelRoot.rotation.z = -pointer.x * 0.12;
        camera.position.x = pointer.x * 0.18;
        camera.position.y = pointer.y * 0.14;
      }
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // 9. Resize Handling
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.0 : 1.35));
      updateAnchors();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      isDisposed = true;
      clearTimeout(anchorTimer1);
      clearTimeout(anchorTimer2);
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('ostrum:focus-bias', handleFocusBias);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      material.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="ostrum-continuous-journey fixed inset-0 pointer-events-none z-[12] overflow-visible"
      style={{
        opacity: 1,
        transition: 'opacity 0.4s ease',
      }}
      aria-hidden="true"
    />
  );
}
