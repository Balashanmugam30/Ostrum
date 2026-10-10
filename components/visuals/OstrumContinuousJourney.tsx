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

    // 3. Studio 4-point Lighting Rig + Energy Accent Lights
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

    // Dynamic Energy Accent Lights (Local to the sculpture)
    const energyRubyLight = new THREE.PointLight('#ff1e2e', 0, 10, 1.6);
    energyRubyLight.position.set(0, 0, 0);
    scene.add(energyRubyLight);

    const energyAmberLight = new THREE.PointLight('#ff9933', 0, 8, 1.8);
    energyAmberLight.position.set(1.8, 0.8, -1.0);
    scene.add(energyAmberLight);

    // 4. Crimson Porcelain Material with Dynamic Energy Response
    const porcelainColor = new THREE.Color('#f7eee8');
    const rubyChampagneColor = new THREE.Color('#d98a8a');
    const sheenColorNormal = new THREE.Color('#ffdcd8');
    const sheenColorScarlet = new THREE.Color('#ff2a3e');
    const emissiveBlack = new THREE.Color(0x000000);
    const emissiveScarlet = new THREE.Color('#550b12');

    const material = new THREE.MeshPhysicalMaterial({
      color: porcelainColor.clone(),
      roughness: 0.26,
      metalness: 0.06,
      clearcoat: 0.58,
      clearcoatRoughness: 0.18,
      transmission: 0,
      ior: 1.50,
      sheen: 0.65,
      sheenColor: sheenColorNormal.clone(),
      sheenRoughness: 0.35,
      specularColor: new THREE.Color('#ffffff'),
      specularIntensity: 0.95,
      iridescence: 0.06,
      iridescenceIOR: 1.32,
      emissive: emissiveBlack.clone(),
      emissiveIntensity: 0,
      side: THREE.DoubleSide,
    });

    // 5. Model Root & Pivot Group
    const modelRoot = new THREE.Group();
    scene.add(modelRoot);

    const pivotGroup = new THREE.Group();
    modelRoot.add(pivotGroup);
    pivotGroup.rotation.x = 0.20;
    pivotGroup.rotation.z = -0.05;

    // 6. Luminous Energy Filaments (Threaded around the Möbius geometry)
    const filamentsGroup = new THREE.Group();
    pivotGroup.add(filamentsGroup);

    const createFilamentCurve = (paramFn: (t: number) => THREE.Vector3, pointsCount = 72) => {
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= pointsCount; i++) {
        const t = (i / pointsCount) * Math.PI * 2;
        points.push(paramFn(t));
      }
      return new THREE.CatmullRomCurve3(points, true);
    };

    // Filament 1: Scarlet Core Wave (threads through center cavity)
    const curve1 = createFilamentCurve((t) => {
      const r = 1.62 + 0.22 * Math.cos(2 * t);
      return new THREE.Vector3(
        r * Math.cos(t),
        1.92 * Math.sin(t),
        0.92 * Math.sin(2 * t)
      );
    });

    // Filament 2: Warm Amber / Champagne Orbital Arc
    const curve2 = createFilamentCurve((t) => {
      const r = 1.72 - 0.18 * Math.sin(2 * t);
      return new THREE.Vector3(
        r * Math.cos(t + 0.8),
        1.72 * Math.sin(t + 0.8),
        -1.08 * Math.sin(2 * t + 0.5)
      );
    });

    // Filament 3: Ivory Lightning Trace
    const curve3 = createFilamentCurve((t) => {
      return new THREE.Vector3(
        1.42 * Math.cos(t - 1.2),
        2.08 * Math.sin(t - 1.2) * (1 + 0.12 * Math.cos(2 * t)),
        0.82 * Math.sin(3 * t)
      );
    });

    const filamentMat1 = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ff203a'),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const filamentMat2 = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ffaa38'),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const filamentMat3 = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#fff2e8'),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const tubeGeom1 = new THREE.TubeGeometry(curve1, isMobile ? 48 : 72, 0.024, 6, true);
    const tubeGeom2 = new THREE.TubeGeometry(curve2, isMobile ? 48 : 72, 0.018, 6, true);
    const tubeGeom3 = new THREE.TubeGeometry(curve3, isMobile ? 48 : 72, 0.014, 6, true);

    const tubeMesh1 = new THREE.Mesh(tubeGeom1, filamentMat1);
    const tubeMesh2 = new THREE.Mesh(tubeGeom2, filamentMat2);
    const tubeMesh3 = new THREE.Mesh(tubeGeom3, filamentMat3);

    filamentsGroup.add(tubeMesh1);
    filamentsGroup.add(tubeMesh2);
    filamentsGroup.add(tubeMesh3);

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

    // 7. Mathematical Screen-to-World Projection
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

    // 8. Dynamic Anchor Geometry
    interface AnchorData {
      heroDocX: number;
      heroDocY: number;
      heroScale: number;
      slotDocX: number;
      slotDocY: number;
      slotScale: number;
      energyScale: number;
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
      energyScale: 0.62,
      dockScrollY: 1000,
      exitScrollY: 3800,
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
        hDocX = svgRect.left + 104 * svgScale;
        hDocY = svgRect.top + 171 * svgScale + window.scrollY;
        hWidth = 185 * svgScale;
      }

      const heroPixelTarget = Math.max(32, hWidth * 0.72);
      const heroWorldUnits = (heroPixelTarget / window.innerHeight) * vHeight;
      const hScale = Math.max(0.05, Math.min(0.24, heroWorldUnits / 3.35));

      // 2. Measure Section 02 Slot
      const engineSlot = document.getElementById('section02-sculpture-slot');
      let sDocX = window.innerWidth * 0.50;
      let sDocY = window.innerHeight * 1.8;
      let sWidth = isMob ? 320 : 470;

      if (engineSlot) {
        const slotRect = engineSlot.getBoundingClientRect();
        sDocX = slotRect.left + slotRect.width * 0.50;
        sDocY = slotRect.top + slotRect.height * 0.50 + window.scrollY;
        sWidth = slotRect.width;
      }

      const slotPixelTarget = isMob
        ? Math.min(220, window.innerWidth * 0.58)
        : Math.min(330, sWidth * 0.70);
      const slotWorldUnits = (slotPixelTarget / window.innerHeight) * vHeight;
      const sScale = Math.max(0.25, Math.min(0.55, slotWorldUnits / 3.35));

      // 3. Section 03 Scale Target (Majestic focal presence)
      const energyPixelTarget = isMob
        ? Math.min(270, window.innerWidth * 0.68)
        : Math.min(420, window.innerWidth * 0.32);
      const energyWorldUnits = (energyPixelTarget / window.innerHeight) * vHeight;
      const eScale = Math.max(0.32, Math.min(0.68, energyWorldUnits / 3.35));

      const st = ScrollTrigger.getById('section02-hold');
      const dScrollY = st ? st.start : Math.max(1, sDocY - window.innerHeight * 0.50);

      const stEnergy = ScrollTrigger.getById('energy-narrative-pin');
      let exitY = stEnergy ? stEnergy.end + 400 : dScrollY + 3000;

      anchors = {
        heroDocX: hDocX,
        heroDocY: hDocY,
        heroScale: hScale,
        slotDocX: sDocX,
        slotDocY: sDocY,
        slotScale: sScale,
        energyScale: eScale,
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

    const handleFocusBias = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      targetFocusBias = typeof customEvent.detail === 'number' ? customEvent.detail : 0;
    };
    window.addEventListener('ostrum:focus-bias', handleFocusBias);

    const handleMouseMove = (e: MouseEvent) => {
      if (isMobile || prefersReducedMotion) return;
      pointer.targetX = ((e.clientX / window.innerWidth) * 2 - 1) * 0.12;
      pointer.targetY = -(((e.clientY / window.innerHeight) * 2 - 1) * 0.12);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 9. Master Continuous Render Loop
    let currentX = 0;
    let currentY = 0;
    let currentScale = anchors.heroScale;
    let currentRotationY = 0;
    let currentEnergy = 0;
    let isInitialized = false;
    let hasPlayedArrival = false;

    const animate = (time: number) => {
      if (isDisposed) return;
      animId = requestAnimationFrame(animate);

      if (isContextLost) return;

      const scrollY = window.scrollY;

      // Offscreen culling: if scrolled well past Section 03, pause rendering to save GPU
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

      pointer.x += (pointer.targetX - pointer.x) * 0.06;
      pointer.y += (pointer.targetY - pointer.y) * 0.06;
      focusBias += (targetFocusBias - focusBias) * 0.10;

      // ScrollTrigger Intervals
      const st02 = ScrollTrigger.getById('section02-hold');
      const dockStart = st02 ? st02.start : anchors.dockScrollY;
      const dockEnd = st02 ? st02.end : anchors.dockScrollY + (isMobile ? 650 : 1000);

      const stEnergy = ScrollTrigger.getById('energy-narrative-pin');
      const energyStart = stEnergy ? stEnergy.start : dockEnd + (isMobile ? 500 : 800);
      const energyEnd = stEnergy ? stEnergy.end : energyStart + (isMobile ? 1800 : 2600);

      let targetScreenX: number;
      let targetScreenY: number;
      let targetScale: number;
      let targetRotY: number;
      let targetEnergyLevel = 0;

      // Stage 1: Journey (Hero 'O' -> Section 02)
      if (scrollY < dockStart) {
        const t = Math.min(1, Math.max(0, scrollY / (dockStart || 1)));
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        targetScreenX = anchors.heroDocX + (anchors.slotDocX - anchors.heroDocX) * ease;
        const startScreenY = anchors.heroDocY;
        const targetCenterY = window.innerHeight * 0.50;
        targetScreenY = startScreenY + (targetCenterY - startScreenY) * ease;
        targetScale = anchors.heroScale + (anchors.slotScale - anchors.heroScale) * ease;
        targetRotY = t * Math.PI * 2;
        targetEnergyLevel = 0;

        if (scrollY < dockStart - 80) {
          hasPlayedArrival = false;
        }
      }
      // Stage 2: Section 02 Editorial Pinned Hold
      else if (scrollY <= dockEnd) {
        targetScreenX = anchors.slotDocX;
        targetScreenY = window.innerHeight * 0.50;
        targetScale = anchors.slotScale;
        targetRotY = Math.PI * 2 + focusBias;
        targetEnergyLevel = 0;

        if (!hasPlayedArrival) {
          hasPlayedArrival = true;
          gsap.to(keyLight, {
            intensity: 2.85,
            duration: 0.45,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1,
            onComplete: () => {
              keyLight.intensity = 2.2;
            },
          });
        }
      }
      // Stage 3: Transition (Section 02 -> Section 03)
      else if (scrollY < energyStart) {
        const transSpan = Math.max(1, energyStart - dockEnd);
        const tTrans = Math.min(1, Math.max(0, (scrollY - dockEnd) / transSpan));
        const easeTrans = tTrans < 0.5 ? 4 * tTrans * tTrans * tTrans : 1 - Math.pow(-2 * tTrans + 2, 3) / 2;

        targetScreenX = window.innerWidth * 0.50;
        targetScreenY = window.innerHeight * 0.50;
        targetScale = anchors.slotScale + (anchors.energyScale - anchors.slotScale) * easeTrans;
        targetRotY = Math.PI * 2;
        targetEnergyLevel = easeTrans * 0.20;
      }
      // Stage 4: Section 03 Pinned Energy Narrative (Beats 01 to 04)
      else if (scrollY <= energyEnd) {
        const energySpan = Math.max(1, energyEnd - energyStart);
        const pEnergy = Math.min(1, Math.max(0, (scrollY - energyStart) / energySpan));

        targetScreenX = window.innerWidth * 0.50;
        targetScreenY = window.innerHeight * 0.50;
        targetScale = anchors.energyScale;

        // Controlled rotation across the 5 narrative beats: from 2.0π to 4.0π (settles front pose)
        targetRotY = (2.0 + pEnergy * 2.0) * Math.PI;

        // High-energy illuminated material response
        targetEnergyLevel = Math.min(1, 0.20 + pEnergy * 0.80);
      }
      // Stage 5: Exit from Section 03 into Footer
      else {
        const exitOffset = scrollY - energyEnd;
        targetScreenX = window.innerWidth * 0.50;
        targetScreenY = window.innerHeight * 0.50 - exitOffset;
        targetScale = anchors.energyScale;
        targetRotY = 4.0 * Math.PI;
        targetEnergyLevel = Math.max(0, 1 - exitOffset / 400);
      }

      // Screen to 3D World conversion
      const targetWorld = screenToWorld(targetScreenX, targetScreenY);

      if (!isInitialized) {
        currentX = targetWorld.x;
        currentY = targetWorld.y;
        currentScale = targetScale;
        currentRotationY = targetRotY;
        currentEnergy = targetEnergyLevel;
        isInitialized = true;
      } else {
        const isPinnedState = scrollY >= dockStart && scrollY <= energyEnd;
        const posLerp = isPinnedState ? 0.35 : 0.18;
        currentX += (targetWorld.x - currentX) * posLerp;
        currentY += (targetWorld.y - currentY) * posLerp;
        currentScale += (targetScale - currentScale) * 0.16;
        currentRotationY += (targetRotY - currentRotationY) * 0.12;
        currentEnergy += (targetEnergyLevel - currentEnergy) * 0.10;
      }

      // Zero-G float: active during journey only
      const isTraveling = scrollY < dockStart;
      const floatOffset = isTraveling ? Math.sin(time * 0.0016) * 0.04 * currentScale : 0;

      modelRoot.position.set(currentX, currentY + floatOffset, 0);
      modelRoot.scale.set(currentScale, currentScale, currentScale);
      modelRoot.rotation.y = currentRotationY;

      // Dynamic Material & Energy Updates (Zero React renders)
      const E = currentEnergy;

      // Base color & specular reflections
      material.color.lerpColors(porcelainColor, rubyChampagneColor, E * 0.75);
      material.roughness = 0.26 - E * 0.10; // Becomes ultra-glossy liquid glass
      material.metalness = 0.06 + E * 0.12;
      material.clearcoat = 0.58 + E * 0.38;
      material.clearcoatRoughness = 0.18 - E * 0.06;
      material.sheen = 0.65 + E * 0.35;
      material.sheenColor.lerpColors(sheenColorNormal, sheenColorScarlet, E);
      material.emissive.lerpColors(emissiveBlack, emissiveScarlet, E);
      material.emissiveIntensity = E * 1.4;

      // Local energy point lights
      energyRubyLight.intensity = E * 2.2;
      energyRubyLight.position.set(currentX, currentY, 0.4);

      energyAmberLight.intensity = E * 1.6;
      energyAmberLight.position.set(currentX + 1.2 * currentScale, currentY + 0.6 * currentScale, -0.8);

      // Energy Filaments Luminous Radiance & Flowing Currents
      filamentMat1.opacity = E * 0.85;
      filamentMat2.opacity = E * 0.70;
      filamentMat3.opacity = E * 0.55;

      if (E > 0.01) {
        filamentsGroup.rotation.y = currentRotationY * 0.2 + (time * 0.0006);
        filamentsGroup.rotation.z = Math.sin(time * 0.001) * 0.08;
      }

      // Spatial Pointer Tilt
      if (!isMobile && !prefersReducedMotion) {
        const isPinnedState = scrollY >= dockStart && scrollY <= energyEnd;
        if (isPinnedState) {
          modelRoot.rotation.x = pointer.y * 0.08;
          modelRoot.rotation.z = -pointer.x * 0.06;
          camera.position.x = pointer.x * 0.08;
          camera.position.y = 0;
        } else {
          modelRoot.rotation.x = pointer.y * 0.16;
          modelRoot.rotation.z = -pointer.x * 0.12;
          camera.position.x = pointer.x * 0.18;
          camera.position.y = pointer.y * 0.14;
        }
      }
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // 10. Resize Handling
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
      tubeGeom1.dispose();
      tubeGeom2.dispose();
      tubeGeom3.dispose();
      filamentMat1.dispose();
      filamentMat2.dispose();
      filamentMat3.dispose();
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
