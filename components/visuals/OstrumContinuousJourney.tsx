'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePreloader } from '@/context/PreloaderContext';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  (window as any).ScrollTrigger = ScrollTrigger;
}

// Module-level cache to eliminate redundant asset decoding
let cachedModelScene: THREE.Group | null = null;

export function OstrumContinuousJourney() {
  const pathname = usePathname();
  const isLegalPage =
    pathname?.startsWith('/terms-and-conditions') ||
    pathname?.startsWith('/privacy-policy');

  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const {
    phase,
    introProgress,
    transformProgress,
    dockProgress,
    reportModelReady,
    reportFirstFrame,
    reportHeroTargetReady,
    reportError,
  } = usePreloader();

  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const introProgressRef = useRef(introProgress);
  introProgressRef.current = introProgress;
  const transformProgressRef = useRef(transformProgress);
  transformProgressRef.current = transformProgress;
  const dockProgressRef = useRef(dockProgress);
  dockProgressRef.current = dockProgress;
  const isModelReadyRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || isLegalPage) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isMobile = window.innerWidth < 768;

    let isDisposed = false;
    let isContextLost = false;
    let animId = 0;
    let wakeAnimation: () => void = () => {};

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
    } catch (err: any) {
      console.warn('[3D Journey] WebGL init fallback:', err);
      reportError(err?.message || 'WebGL not supported');
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
      cancelAnimationFrame(animId);
      animId = 0;
    };
    const onContextRestored = () => {
      isContextLost = false;
      wakeAnimation();
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
      transparent: true,
      opacity: 1,
    });

    // 5. Model Root & Pivot Group
    const modelRoot = new THREE.Group();
    scene.add(modelRoot);
    modelRoot.visible = false; // Hidden during intro counting until transformation

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

    // Filament 2: Amber Secondary Helix (counter-rotating ribbon)
    const curve2 = createFilamentCurve((t) => {
      const r = 1.84 + 0.18 * Math.sin(3 * t);
      return new THREE.Vector3(
        r * Math.cos(-t + 0.5),
        1.75 * Math.sin(-t + 0.5),
        0.85 * Math.cos(2 * t)
      );
    });

    // Filament 3: Champagne Tertiary Whisp (outer highlight)
    const curve3 = createFilamentCurve((t) => {
      const r = 1.48 + 0.28 * Math.cos(t);
      return new THREE.Vector3(
        r * Math.sin(t * 1.5),
        1.55 * Math.cos(t),
        1.10 * Math.sin(t * 2.5)
      );
    });

    const filamentMat1 = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ff2233'),
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

    // =========================================================================
    // =========================================================================
    // 7. 3D PROGRESS RIBBON & UNDERSTATED CHARCOAL TRACK
    // =========================================================================
    const ribbonGroup = new THREE.Group();
    scene.add(ribbonGroup);
    ribbonGroup.position.set(0, 0, 0);

    const TRACK_WIDTH = isMobile ? 1.60 : 2.20;
    const startX = -TRACK_WIDTH / 2;
    const endX = TRACK_WIDTH / 2;

    // Understated Charcoal Progress Track (matches ribbon endpoints with 0px protrusion)
    const trackGeom = new THREE.PlaneGeometry(TRACK_WIDTH, 0.075);
    const trackMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#222226'),
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
    });
    const trackMesh = new THREE.Mesh(trackGeom, trackMat);
    trackMesh.position.set(0, 0, 0.01);
    ribbonGroup.add(trackMesh);

    const RIBBON_SAMPLES = 64;
    const ribbonPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= RIBBON_SAMPLES; i++) {
      ribbonPoints.push(new THREE.Vector3(startX + (TRACK_WIDTH * i) / RIBBON_SAMPLES, 0, 0.05));
    }

    const ribbonCurve = new THREE.CatmullRomCurve3(ribbonPoints, false, 'centripetal');
    let ribbonGeometry = new THREE.TubeGeometry(ribbonCurve, isMobile ? 40 : 56, 0.046, 8, false);
    const ribbonMaterial = material.clone();
    ribbonMaterial.transparent = true;
    ribbonMaterial.opacity = 1;
    const ribbonMesh = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
    ribbonMesh.scale.set(1.0, 1.0, 0.55); // 1:1 X/Y proportion, sleek sculptural ribbon profile
    ribbonGroup.add(ribbonMesh);

    // Tip accent highlight
    const tipGlow = new THREE.PointLight('#fff7ee', 1.6, 3.0, 2.0);
    tipGlow.position.set(startX, 0, 0.15);
    ribbonGroup.add(tipGlow);

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

      isModelReadyRef.current = true;
      setIsLoaded(true);
      reportModelReady();
    };

    if (cachedModelScene) {
      setupModelMesh(cachedModelScene.clone(true));
    } else {
      const loader = new GLTFLoader();
      loader.load(
        '/models/monyedre-360.glb',
        (gltf) => {
          if (isDisposed) return;
          cachedModelScene = gltf.scene;
          setupModelMesh(gltf.scene.clone(true));
        },
        undefined,
        (err: unknown) => {
          console.warn('[3D Journey] Model load error, triggering fallback:', err);
          reportError((err as any)?.message || 'GLTF model load failed');
        }
      );
    }

    // 8. Mathematical Screen-to-World Projection
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

    // 9. Dynamic Anchor Geometry
    interface AnchorData {
      introDocX: number;
      introDocY: number;
      introScale: number;
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
      introDocX: window.innerWidth * 0.50,
      introDocY: window.innerHeight * 0.50,
      introScale: isMobile ? 0.40 : 0.48,
      heroDocX: window.innerWidth * 0.16,
      heroDocY: window.innerHeight * 0.35,
      heroScale: 0.25,
      slotDocX: window.innerWidth * 0.50,
      slotDocY: window.innerHeight * 1.8,
      slotScale: 0.55,
      energyScale: 0.58,
      dockScrollY: 1000,
      exitScrollY: 3800,
    };

    const updateAnchors = () => {
      const isMob = window.innerWidth < 768;
      const vHeight = 2 * Math.tan((34 * Math.PI) / 360) * 7.5;

      // 0. Intro Center Anchor (Visual center of screen)
      const iDocX = window.innerWidth * 0.50;
      const iDocY = window.innerHeight * 0.50;
      const iScale = isMob ? 0.40 : 0.48;

      anchors.introDocX = iDocX;
      anchors.introDocY = iDocY;
      anchors.introScale = iScale;

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
        reportHeroTargetReady();
      }

      // Hero scale: fit comfortably inside 'O' counter footprint with zero collision with 'S'
      // Scaled strictly proportional to measured 'O' width
      const heroPixelTarget = Math.max(32, hWidth * 0.72);
      const heroWorldUnits = (heroPixelTarget / window.innerHeight) * vHeight;
      const hScale = Math.max(0.05, Math.min(0.24, heroWorldUnits / 3.35));

      anchors.heroDocX = hDocX;
      anchors.heroDocY = hDocY;
      anchors.heroScale = hScale;

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

      // Section 02 scale: fit cleanly within the slot with ample breathing room
      const slotPixelTarget = isMob
        ? Math.min(220, window.innerWidth * 0.58)
        : Math.min(330, sWidth * 0.70);
      const slotWorldUnits = (slotPixelTarget / window.innerHeight) * vHeight;
      const sScale = Math.max(0.25, Math.min(0.55, slotWorldUnits / 3.35));

      // 3. Section 03 Scale Target: Subtle focal zoom (4-5% larger than Section 02 slot size)
      // Restrained medium focal scale (~94.5% of previous), visually balanced against narrative typography
      const eScale = sScale * 1.04;

      const st = ScrollTrigger.getById('section02-hold');
      const dScrollY = st ? st.start : Math.max(1, sDocY - window.innerHeight * 0.50);

      const stEnergy = ScrollTrigger.getById('energy-narrative-pin');
      const exitY = stEnergy
        ? stEnergy.end + 100
        : dScrollY + (isMob ? 5000 : 7500);

      anchors = {
        introDocX: iDocX,
        introDocY: iDocY,
        introScale: iScale,
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
    const anchorTimer3 = setTimeout(updateAnchors, 1500);

    const onNarrativeReady = () => updateAnchors();
    window.addEventListener('ostrum:narrative-ready', onNarrativeReady);
    ScrollTrigger.addEventListener('refresh', updateAnchors);

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

    // Animation loop state
    let isInitialized = false;
    let currentX = 0;
    let currentY = 0;
    let currentScale = anchors.heroScale;
    let currentRotationY = 0;
    let currentEnergy = 0;
    let hasPlayedArrival = false;
    let hasReportedFirstFrame = false;

    // Helper: update 3D Progress Ribbon Geometry during intro
    const updateRibbonPoints = (
      pPhase: string,
      pIntro: number,
      pTransform: number
    ) => {
      if (pPhase === 'preparing') {
        trackMat.opacity = 1;
        const minHead = startX + TRACK_WIDTH * 0.005;
        for (let k = 0; k <= RIBBON_SAMPLES; k++) {
          const u = k / RIBBON_SAMPLES;
          const px = startX + (minHead - startX) * u;
          ribbonPoints[k].set(px, 0, 0.05);
        }
        tipGlow.position.set(minHead, 0, 0.15);
        tipGlow.intensity = 0.8;
        ribbonGroup.rotation.set(0, 0, 0);
      } else if (pPhase === 'counting') {
        trackMat.opacity = 1;
        const clampedP = Math.max(0.005, Math.min(1.0, pIntro));
        const currentEnd = startX + TRACK_WIDTH * clampedP;

        for (let k = 0; k <= RIBBON_SAMPLES; k++) {
          const u = k / RIBBON_SAMPLES;
          // Progress ribbon advances strictly from startX to currentEnd
          const px = startX + (currentEnd - startX) * u;
          const normX = (px - startX) / TRACK_WIDTH;
          // Subtle elegant elevation wave across the active path
          const py = Math.sin(normX * Math.PI) * 0.025;
          const pz = 0.05 + Math.cos(normX * Math.PI * 2) * 0.015;
          ribbonPoints[k].set(px, py, pz);
        }

        tipGlow.position.set(currentEnd, 0, 0.15);
        tipGlow.intensity = 1.4;
        ribbonGroup.rotation.set(0, 0, 0);
      } else if (pPhase === 'transforming') {
        // Morph the completed horizontal ribbon into the broad 3-lobe Ostrum Möbius sculpture
        const t = Math.max(0, Math.min(1.0, pTransform));

        // Background track fades out smoothly as transformation begins
        trackMat.opacity = Math.max(0, 1 - t * 3.5);

        for (let k = 0; k <= RIBBON_SAMPLES; k++) {
          const u = k / RIBBON_SAMPLES;
          // Base horizontal curve at t=0
          const x0 = startX + TRACK_WIDTH * u;
          const y0 = Math.sin(u * Math.PI) * 0.025;
          const z0 = 0.05 + Math.cos(u * Math.PI * 2) * 0.015;

          // Target 3-lobe Möbius loop geometry matching media_1792170732096_47cecb64.png
          // Broad, softly rounded triangular loop with circular 1:1 footprint (NOT a narrow raindrop or vertical oval)
          const angle = u * Math.PI * 2;
          const R0 = 1.45;
          const A = 0.22;
          const B = 0.38;
          const r = R0 + A * Math.cos(3 * angle);
          const x1 = r * Math.cos(angle);
          const y1 = r * Math.sin(angle);
          const z1 = B * Math.sin(3 * angle);

          // Sequential curling: leading tip curves around first to fold into the loop
          const curlDelay = (1 - u) * 0.24;
          const localT = Math.max(0, Math.min(1, (t - curlDelay) / (1 - curlDelay || 1)));
          const easeT = localT < 0.5 ? 4 * localT * localT * localT : 1 - Math.pow(-2 * localT + 2, 3) / 2;

          const curX = x0 * (1 - easeT) + x1 * easeT;
          const curY = y0 * (1 - easeT) + y1 * easeT;
          const curZ = z0 * (1 - easeT) + z1 * easeT;
          ribbonPoints[k].set(curX, curY, curZ);
        }

        // Align ribbon group orientation with GLB resting pose (0.20 on X, -0.05 on Z)
        ribbonGroup.rotation.x = t * 0.20;
        ribbonGroup.rotation.z = -t * 0.05;
        ribbonGroup.rotation.y = 0;

        // Dynamic light sweep over curling surfaces
        const sweep = Math.sin(t * Math.PI);
        energyRubyLight.intensity = sweep * 2.8;
        energyAmberLight.intensity = sweep * 1.5;
        ribbonMaterial.sheenColor.lerpColors(sheenColorNormal, sheenColorScarlet, sweep);
        tipGlow.intensity = (1 - t) * 1.5;
      }

      // Rebuild tube mesh along updated curve
      ribbonCurve.updateArcLengths();
      ribbonMesh.geometry.dispose();
      ribbonMesh.geometry = new THREE.TubeGeometry(
        ribbonCurve,
        isMobile ? 40 : 56,
        0.046,
        8,
        false
      );
    };

    // Main Animation Loop
    const animate = (time: number) => {
      animId = 0;
      if (isDisposed || isContextLost) return;

      const scrollY = window.scrollY;

      // ScrollTrigger Intervals
      const st02 = ScrollTrigger.getById('section02-hold');
      const dockStart = st02 ? st02.start : anchors.dockScrollY;
      const dockEnd = st02 ? st02.end : anchors.dockScrollY + (isMobile ? 650 : 1000);

      const stEnergy = ScrollTrigger.getById('energy-narrative-pin');
      const energyStart = stEnergy ? stEnergy.start : dockEnd + (isMobile ? 500 : 800);
      const energyEnd = stEnergy ? stEnergy.end : energyStart + (isMobile ? 3600 : 5000) + window.innerHeight;

      const exitBoundary = stEnergy ? stEnergy.end + 100 : anchors.exitScrollY;
      const isPastExit = scrollY > exitBoundary;

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

      // Real-time synchronization with preloader phases
      const currentPhase =
        (typeof window !== 'undefined' && (window as any).__ostrumPhase) ||
        phaseRef.current;
      const introP =
        (typeof window !== 'undefined' && (window as any).__ostrumIntroProgress !== undefined)
          ? (window as any).__ostrumIntroProgress
          : introProgressRef.current;
      const transformP =
        (typeof window !== 'undefined' && (window as any).__ostrumTransformProgress !== undefined)
          ? (window as any).__ostrumTransformProgress
          : transformProgressRef.current;
      const dockP =
        (typeof window !== 'undefined' && (window as any).__ostrumDockProgress !== undefined)
          ? (window as any).__ostrumDockProgress
          : dockProgressRef.current;

      let targetScreenX: number;
      let targetScreenY: number;
      let targetScale: number;
      let targetRotY: number;
      let targetEnergyLevel = 0;

      // =========================================================================
      // INTRO PHASE 1: PREPARING (0.0s - 0.4s)
      // =========================================================================
      if (currentPhase === 'preparing') {
        ribbonGroup.visible = true;
        modelRoot.visible = false;
        ribbonMaterial.opacity = 1;
        material.opacity = 0;

        updateRibbonPoints('preparing', 0, 0);

        targetScreenX = anchors.introDocX;
        targetScreenY = anchors.introDocY;
        targetScale = anchors.introScale;
        targetRotY = 0;
      }
      // =========================================================================
      // INTRO PHASE 2: COUNTING (0.4s - 4.2s)
      // =========================================================================
      else if (currentPhase === 'counting') {
        ribbonGroup.visible = true;
        modelRoot.visible = false;
        ribbonMaterial.opacity = 1;
        material.opacity = 0;

        updateRibbonPoints('counting', introP, 0);

        targetScreenX = anchors.introDocX;
        targetScreenY = anchors.introDocY;
        targetScale = anchors.introScale;
        targetRotY = 0;
      }
      // =========================================================================
      // INTRO PHASE 3: TRANSFORMING (4.2s - 5.4s)
      // Ribbon coils inward into 3-lobe Möbius loop, with subtle hero zoom moment
      // =========================================================================
      else if (currentPhase === 'transforming') {
        updateRibbonPoints('transforming', 1.0, transformP);

        // Subtle hero presentation zoom & lighting as loop completes (transformP >= 0.82)
        const heroP = transformP >= 0.82 ? (transformP - 0.82) / 0.18 : 0;
        const zoomPulse = Math.sin(heroP * Math.PI * 0.5) * 0.15;

        targetScreenX = anchors.introDocX;
        targetScreenY = anchors.introDocY;
        targetScale = anchors.introScale * (1.0 + zoomPulse);
        targetRotY = 0;

        if (transformP < 0.72) {
          ribbonGroup.visible = true;
          modelRoot.visible = false;
          ribbonMaterial.opacity = 1;
          material.opacity = 0;
        } else {
          // Model resolves into view without pop
          ribbonGroup.visible = transformP < 0.98;
          modelRoot.visible = true;
          const fade = (transformP - 0.72) / 0.26;
          ribbonMaterial.opacity = Math.max(0, 1 - fade);
          material.opacity = Math.min(1, fade);
        }
      }
      // =========================================================================
      // INTRO PHASE 4: DOCKING (5.4s - 6.6s)
      // Live GLB glides from center into measured Hero 'O' anchor
      // =========================================================================
      else if (currentPhase === 'docking') {
        ribbonGroup.visible = false;
        modelRoot.visible = true;
        material.opacity = 1;

        // dockP is already smoothly eased by GSAP with power2.inOut
        const ease = dockP;

        const startScale = anchors.introScale * 1.15;
        targetScreenX = anchors.introDocX + (anchors.heroDocX - anchors.introDocX) * ease;
        targetScreenY = anchors.introDocY + (anchors.heroDocY - anchors.introDocY) * ease;
        targetScale = startScale + (anchors.heroScale - startScale) * ease;
        targetRotY = 0;

        energyRubyLight.intensity = (1 - ease) * 0.8;
        energyAmberLight.intensity = 0;
        keyLight.intensity = 2.2;
        rimLight.intensity = 1.8;
      }
      // =========================================================================
      // COMPLETE: HERO AT REST & DOWNSTREAM SCROLL JOURNEY
      // =========================================================================
      else if (scrollY < dockStart) {
        ribbonGroup.visible = false;
        modelRoot.visible = true;
        material.opacity = 1;

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
        ribbonGroup.visible = false;
        modelRoot.visible = true;
        material.opacity = 1;

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
      // Stage 3: Phase B : Connected Darkening, Gentle Zoom & Stationary Orientation Hold
      else if (scrollY < energyStart) {
        ribbonGroup.visible = false;
        modelRoot.visible = true;
        material.opacity = 1;

        const t = Math.min(1, Math.max(0, (scrollY - dockEnd) / (energyStart - dockEnd || 1)));
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        // Smooth centered alignment into viewport focal position
        const targetCenterX = window.innerWidth * 0.50;
        targetScreenX = anchors.slotDocX + (targetCenterX - anchors.slotDocX) * ease;
        targetScreenY = window.innerHeight * 0.50;

        // Restrained focal zoom: gentle approach from Section 02 slot scale to Section 03 focal scale
        targetScale = anchors.slotScale + (anchors.energyScale - anchors.slotScale) * ease;

        // Stationary orientation hold during approach: rotation holds still at 2.0π (orientation held from Section 02)
        targetRotY = Math.PI * 2 + focusBias * (1 - ease);
        targetEnergyLevel = ease * 0.35;
      }
      // Stage 4: Energy Narrative Pinned Experience
      else if (scrollY <= energyEnd) {
        ribbonGroup.visible = false;
        modelRoot.visible = true;
        material.opacity = 1;

        const initialHold = isMobile ? 450 : 600; // Pause 1: ~1s visual dwell on dark stage before text
        const narrativeSpan = isMobile ? 3600 : 5000; // Preserved narrative travel span for the 5 beats
        const narrativeStart = energyStart + initialHold;
        const narrativeEnd = narrativeStart + narrativeSpan;

        targetScreenX = window.innerWidth * 0.50;
        targetScreenY = window.innerHeight * 0.50;
        targetScale = anchors.energyScale;

        if (scrollY < narrativeStart) {
          // Pause 1: Completed dark-background composition held stationary for ~1 second (zero rotation, orientation held from Section 02)
          targetRotY = 2.0 * Math.PI;
          targetEnergyLevel = 0.35;
        } else if (scrollY <= narrativeEnd) {
          // Synchronized rotation initiated as Beat 01 reveals, progressing smoothly across the 5 narrative beats
          const narrativeProgress = Math.min(1, Math.max(0, (scrollY - narrativeStart) / (narrativeSpan || 1)));
          targetRotY = 2.0 * Math.PI + narrativeProgress * (2.0 * Math.PI);
          targetEnergyLevel = 0.35 + narrativeProgress * 0.65;
        } else {
          // Pause 2 & handoff: Completed closing composition held stationary for ~1 second in front-facing rest pose (4.0π) before Selected Work
          targetRotY = 4.0 * Math.PI;
          targetEnergyLevel = 1.0;
        }
      }
      // Stage 5: Transition into Selected Work
      else {
        ribbonGroup.visible = false;
        modelRoot.visible = true;
        material.opacity = 1;

        targetScreenX = window.innerWidth * 0.50;
        targetScreenY = window.innerHeight * 0.50;
        targetScale = anchors.energyScale;
        targetRotY = 4.0 * Math.PI;
        targetEnergyLevel = 1.0;
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
      } else if (
        currentPhase === 'preparing' ||
        currentPhase === 'counting' ||
        currentPhase === 'transforming' ||
        currentPhase === 'docking'
      ) {
        currentX = targetWorld.x;
        currentY = targetWorld.y;
        currentScale = targetScale;
        currentRotationY = targetRotY;
        currentEnergy = targetEnergyLevel;
      } else {
        const isPinnedState = scrollY >= dockStart && scrollY <= energyEnd;
        const posLerp = isPinnedState ? 0.35 : 0.18;
        const rotLerp = isPinnedState ? 0.16 : 0.12;
        currentX += (targetWorld.x - currentX) * posLerp;
        currentY += (targetWorld.y - currentY) * posLerp;
        currentScale += (targetScale - currentScale) * 0.16;
        currentRotationY += (targetRotY - currentRotationY) * rotLerp;
        currentEnergy += (targetEnergyLevel - currentEnergy) * 0.10;
      }

      // Zero-G subtle organic breathing float: active during journey (Hero & travel)
      const isTraveling = scrollY < dockStart && currentPhase === 'complete';
      const floatOffset = isTraveling ? Math.sin(time * 0.0016) * 0.04 * currentScale : 0;

      modelRoot.position.set(currentX, currentY + floatOffset, 0);
      modelRoot.scale.set(currentScale, currentScale, currentScale);
      modelRoot.rotation.y = currentRotationY;
      if (typeof window !== 'undefined') {
        (window as any).__ostrumModelRoot = modelRoot;
        (window as any).__ostrumCurrentRotationY = currentRotationY;
        (window as any).__ostrumCamera = camera;
        (window as any).__ostrumAnchors = anchors;
      }

      // Dynamic Material & Energy Updates (Zero React renders)
      const E = currentEnergy;

      if (E > 0.01) {
        material.color.lerpColors(porcelainColor, rubyChampagneColor, E * 0.55);
        material.roughness = 0.26 - E * 0.10;
        material.clearcoat = 0.58 + E * 0.40;
        material.sheen = 0.65 + E * 0.35;
        material.sheenColor.lerpColors(sheenColorNormal, sheenColorScarlet, E);
        material.emissive.lerpColors(emissiveBlack, emissiveScarlet, E * 0.60);
        material.emissiveIntensity = E * 0.95;

        filamentMat1.opacity = Math.min(0.92, E * 1.15);
        filamentMat2.opacity = Math.min(0.78, E * 0.95);
        filamentMat3.opacity = Math.min(0.65, E * 0.85);

        energyRubyLight.intensity = E * 3.8;
        energyAmberLight.intensity = E * 2.2;
      } else if (currentPhase === 'complete') {
        material.color.copy(porcelainColor);
        material.roughness = 0.26;
        material.clearcoat = 0.58;
        material.sheen = 0.65;
        material.sheenColor.copy(sheenColorNormal);
        material.emissive.copy(emissiveBlack);
        material.emissiveIntensity = 0;

        filamentMat1.opacity = 0;
        filamentMat2.opacity = 0;
        filamentMat3.opacity = 0;

        energyRubyLight.intensity = 0;
        energyAmberLight.intensity = 0;
      }

      // Subtle spatial pointer tilt
      if (currentPhase === 'complete') {
        pointer.x += (pointer.targetX - pointer.x) * 0.06;
        pointer.y += (pointer.targetY - pointer.y) * 0.06;
        focusBias += (targetFocusBias - focusBias) * 0.10;

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
      } else {
        modelRoot.rotation.x = 0;
        modelRoot.rotation.z = 0;
        camera.position.x = 0;
        camera.position.y = 0;
      }
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      if (!hasReportedFirstFrame && isModelReadyRef.current) {
        hasReportedFirstFrame = true;
        reportFirstFrame();
      }
      animId = requestAnimationFrame(animate);
    };

    const syncAnimation = () => {
      const stEnergy = ScrollTrigger.getById('energy-narrative-pin');
      const exitBoundary = stEnergy ? stEnergy.end + 100 : anchors.exitScrollY;
      if (window.scrollY > exitBoundary) {
        if (container.style.opacity !== '0') container.style.opacity = '0';
        cancelAnimationFrame(animId);
        animId = 0;
        return;
      }

      if (container.style.opacity !== '1') {
        container.style.opacity = '1';
      }
      if (!isDisposed && !isContextLost && animId === 0) {
        animId = requestAnimationFrame(animate);
      }
    };
    wakeAnimation = syncAnimation;

    window.addEventListener('scroll', syncAnimation, { passive: true });
    ScrollTrigger.addEventListener('refresh', syncAnimation);
    syncAnimation();

    // 10. Resize Handling
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.0 : 1.35));
      updateAnchors();
      syncAnimation();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      isDisposed = true;
      clearTimeout(anchorTimer1);
      clearTimeout(anchorTimer2);
      clearTimeout(anchorTimer3);
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', syncAnimation);
      ScrollTrigger.removeEventListener('refresh', syncAnimation);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('ostrum:focus-bias', handleFocusBias);
      window.removeEventListener('ostrum:narrative-ready', onNarrativeReady);
      ScrollTrigger.removeEventListener('refresh', updateAnchors);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      material.dispose();
      ribbonMaterial.dispose();
      ribbonGeometry.dispose();
      tubeGeom1.dispose();
      tubeGeom2.dispose();
      tubeGeom3.dispose();
      trackGeom.dispose();
      trackMat.dispose();
      if (ribbonMesh.geometry) {
        ribbonMesh.geometry.dispose();
      }
    };
  }, [reportError, reportFirstFrame, reportHeroTargetReady, reportModelReady, isLegalPage]);

  if (isLegalPage) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="ostrum-continuous-journey fixed inset-0 pointer-events-none overflow-visible will-change-[opacity] z-[18]"
      style={{
        opacity: 1,
        transition: 'opacity 0.4s ease',
      }}
      aria-hidden="true"
    />
  );
}
