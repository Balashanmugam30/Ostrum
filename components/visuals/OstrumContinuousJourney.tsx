'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePreloader } from '@/context/PreloaderContext';
import { isHandheldTouchDevice } from '@/lib/device-tier';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  (window as any).ScrollTrigger = ScrollTrigger;
}

// Module-level cache keyed by asset URL so handheld/desktop switches never mismatch assets
let cachedModelEntry: { url: string; scene: THREE.Group } | null = null;

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
    const isHandheldGpu = isHandheldTouchDevice();

    const isDevDiagnostics = process.env.NODE_ENV !== 'production';
    let isDisposed = false;
    let isContextLost = false;
    let isLoopActive = false;
    let lifecycleSeq = 0;
    let contextLostCount = 0;
    let contextRestoredCount = 0;
    let rendererRecreatedCount = 0;
    let restoreAttemptedForCurrentLoss = false;
    let recoveryAttemptTimer: ReturnType<typeof setTimeout> | null = null;
    let recoveryFallbackTimer: ReturnType<typeof setTimeout> | null = null;
    let lastContextEvent: 'none' | 'webglcontextlost' | 'webglcontextrestored' | 'renderer-recreated' = 'none';
    let lastContextEventAt = 0;
    let lastLoggedStateKey = '';

    let reconcileLifecycle: (
      reason: string,
      options?: { forcePoseSnap?: boolean; renderImmediate?: boolean }
    ) => void = () => {};
    let handleContextRestoredWork: () => void = () => {};

    const clearRecoveryTimers = () => {
      if (recoveryAttemptTimer !== null) {
        clearTimeout(recoveryAttemptTimer);
        recoveryAttemptTimer = null;
      }
      if (recoveryFallbackTimer !== null) {
        clearTimeout(recoveryFallbackTimer);
        recoveryFallbackTimer = null;
      }
    };

    const getViewportDimensions = () => ({
      width: container.clientWidth || window.innerWidth || 1,
      height: container.clientHeight || window.innerHeight || 1,
    });

    const isCompactLayout = () => getViewportDimensions().width < 768;

    const getCurrentScrollY = () => {
      if (typeof window === 'undefined') return 0;
      return Math.max(0, window.scrollY ?? window.pageYOffset ?? 0);
    };

    // 1. Scene & Camera setup
    const scene = new THREE.Scene();
    const initialVp = getViewportDimensions();
    const camera = new THREE.PerspectiveCamera(34, initialVp.width / initialVp.height, 0.1, 50);
    camera.position.set(0, 0, 7.5);

    // 2. WebGL Renderer lifecycle helpers (supports safe single-renderer replacement only if restoration fails)
    let renderer!: THREE.WebGLRenderer;

    const syncRendererSizeAndProjection = () => {
      if (!renderer) return;
      const { width, height } = getViewportDimensions();
      const dpr = Math.min(window.devicePixelRatio || 1, isHandheldGpu ? 1.0 : 1.35);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      renderer.setClearColor(0x000000, 0); // 100% transparent
    };

    const checkContextLost = () => {
      try {
        const gl = renderer?.getContext?.();
        const glLost = Boolean(gl && typeof gl.isContextLost === 'function' && gl.isContextLost());
        return isContextLost || glLost;
      } catch {
        return isContextLost;
      }
    };

    // Context loss listeners (registered after WebGLRenderer constructor so Three.js restores GL state first)
    const onContextLost = (e: Event) => {
      e.preventDefault();
      isContextLost = true;
      restoreAttemptedForCurrentLoss = false;
      clearRecoveryTimers();
      contextLostCount += 1;
      lastContextEvent = 'webglcontextlost';
      lastContextEventAt = Date.now();
      reconcileLifecycle('webglcontextlost');
    };
    const onContextRestored = () => {
      isContextLost = false;
      restoreAttemptedForCurrentLoss = false;
      clearRecoveryTimers();
      contextRestoredCount += 1;
      lastContextEvent = 'webglcontextrestored';
      lastContextEventAt = Date.now();
      handleContextRestoredWork();
    };

    const attachRenderer = (nextRenderer: THREE.WebGLRenderer) => {
      renderer = nextRenderer;
      // Pre-cache WEBGL_lose_context while context is healthy so Three.js
      // forceContextRestore() can recover Chromium LRU context evictions cleanly.
      try {
        renderer.extensions?.get?.('WEBGL_lose_context');
      } catch {
        // Optional extension
      }
      syncRendererSizeAndProjection();
      renderer.debug.checkShaderErrors = isDevDiagnostics;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.pointerEvents = 'none';
      renderer.domElement.setAttribute('aria-hidden', 'true');
      container.appendChild(renderer.domElement);
      renderer.domElement.addEventListener('webglcontextlost', onContextLost, false);
      renderer.domElement.addEventListener('webglcontextrestored', onContextRestored, false);
    };

    const createWebGLRenderer = () =>
      new THREE.WebGLRenderer({
        antialias: !isHandheldGpu,
        alpha: true,
        powerPreference: 'high-performance',
      });

    try {
      attachRenderer(createWebGLRenderer());
    } catch (err: any) {
      console.warn('[3D Journey] WebGL init fallback:', err);
      reportError(err?.message || 'WebGL not supported');
      return;
    }

    // 3. Studio 4-point Lighting Rig + Energy Accent Lights
    const keyLight = new THREE.DirectionalLight('#fff7ee', 2.2);
    keyLight.position.set(-2.5, 3.6, 3.2);
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight('#fdeddc', '#220404', isHandheldGpu ? 1.15 : 0.95);
    hemiLight.position.set(0, 5, 0);
    scene.add(hemiLight);

    const rimLight = new THREE.PointLight('#ff4d30', 1.8, 12, 1.2);
    rimLight.position.set(3.4, -1.2, -2.6);
    scene.add(rimLight);

    if (!isHandheldGpu) {
      const fillLight = new THREE.DirectionalLight('#ffebd8', 0.45);
      fillLight.position.set(1.8, 1.2, 2.0);
      scene.add(fillLight);
    }

    // Dynamic Energy Accent Lights (Lazy-added only when needed during preloader morph or Section 03)
    let energyLightsAdded = false;
    const energyRubyLight = new THREE.PointLight('#ff1e2e', 0, 10, 1.6);
    energyRubyLight.position.set(0, 0, 0);

    const energyAmberLight = new THREE.PointLight('#ff9933', 0, 8, 1.8);
    energyAmberLight.position.set(1.8, 0.8, -1.0);

    const ensureEnergyLights = () => {
      if (energyLightsAdded) return;
      energyLightsAdded = true;
      scene.add(energyRubyLight);
      scene.add(energyAmberLight);
    };

    // 4. Crimson Porcelain Material with Dynamic Energy Response
    const porcelainColor = new THREE.Color('#f7eee8');
    const rubyChampagneColor = new THREE.Color('#d98a8a');
    const sheenColorNormal = new THREE.Color('#ffdcd8');
    const sheenColorScarlet = new THREE.Color('#ff2a3e');
    const emissiveBlack = new THREE.Color(0x000000);
    const emissiveScarlet = new THREE.Color('#550b12');

    const material: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial = isHandheldGpu
      ? new THREE.MeshStandardMaterial({
          color: porcelainColor.clone(),
          roughness: 0.22,
          metalness: 0.08,
          emissive: emissiveBlack.clone(),
          emissiveIntensity: 0,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 1,
        })
      : new THREE.MeshPhysicalMaterial({
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

    // 6. Luminous Energy Filaments (Lazy-created only when entering Section 03 Energy Narrative)
    let filamentsState: {
      group: THREE.Group;
      mat1: THREE.MeshBasicMaterial;
      mat2: THREE.MeshBasicMaterial;
      mat3: THREE.MeshBasicMaterial;
      geom1: THREE.TubeGeometry;
      geom2: THREE.TubeGeometry;
      geom3: THREE.TubeGeometry;
    } | null = null;

    const ensureFilaments = () => {
      if (filamentsState) return filamentsState;
      const group = new THREE.Group();
      pivotGroup.add(group);

      const createFilamentCurve = (paramFn: (t: number) => THREE.Vector3, pointsCount = 72) => {
        const points: THREE.Vector3[] = [];
        for (let i = 0; i <= pointsCount; i++) {
          const t = (i / pointsCount) * Math.PI * 2;
          points.push(paramFn(t));
        }
        return new THREE.CatmullRomCurve3(points, true);
      };

      const curve1 = createFilamentCurve((t) => {
        const r = 1.62 + 0.22 * Math.cos(2 * t);
        return new THREE.Vector3(r * Math.cos(t), 1.92 * Math.sin(t), 0.92 * Math.sin(2 * t));
      });
      const curve2 = createFilamentCurve((t) => {
        const r = 1.84 + 0.18 * Math.sin(3 * t);
        return new THREE.Vector3(r * Math.cos(-t + 0.5), 1.75 * Math.sin(-t + 0.5), 0.85 * Math.cos(2 * t));
      });
      const curve3 = createFilamentCurve((t) => {
        const r = 1.48 + 0.28 * Math.cos(t);
        return new THREE.Vector3(r * Math.sin(t * 1.5), 1.55 * Math.cos(t), 1.10 * Math.sin(t * 2.5));
      });

      const mat1 = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#ff2233'),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mat2 = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#ffaa38'),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mat3 = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#fff2e8'),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const geom1 = new THREE.TubeGeometry(curve1, isHandheldGpu ? 48 : 72, 0.024, 6, true);
      const geom2 = new THREE.TubeGeometry(curve2, isHandheldGpu ? 48 : 72, 0.018, 6, true);
      const geom3 = new THREE.TubeGeometry(curve3, isHandheldGpu ? 48 : 72, 0.014, 6, true);

      group.add(new THREE.Mesh(geom1, mat1));
      group.add(new THREE.Mesh(geom2, mat2));
      group.add(new THREE.Mesh(geom3, mat3));

      filamentsState = { group, mat1, mat2, mat3, geom1, geom2, geom3 };
      return filamentsState;
    };

    // 7. 3D Progress Ribbon (Lazy-created only for desktop preloader intro; skipped on mobile!)
    const RIBBON_SAMPLES = 64;
    interface RibbonState {
      group: THREE.Group;
      trackWidth: number;
      startX: number;
      trackGeom: THREE.PlaneGeometry;
      trackMat: THREE.MeshBasicMaterial;
      ribbonPoints: THREE.Vector3[];
      ribbonCurve: THREE.CatmullRomCurve3;
      ribbonMaterial: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
      ribbonMesh: THREE.Mesh;
      tipGlow: THREE.PointLight;
    }
    let ribbonState: RibbonState | null = null;

    const ensureRibbon = (): RibbonState => {
      if (ribbonState) return ribbonState;
      const group = new THREE.Group();
      scene.add(group);
      group.position.set(0, 0, 0);

      const trackWidth = isCompactLayout() ? 1.60 : 2.20;
      const rStartX = -trackWidth / 2;

      const trackGeom = new THREE.PlaneGeometry(trackWidth, 0.075);
      const trackMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#222226'),
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide,
      });
      const trackMesh = new THREE.Mesh(trackGeom, trackMat);
      trackMesh.position.set(0, 0, 0.01);
      group.add(trackMesh);

      const ribbonPoints: THREE.Vector3[] = [];
      for (let i = 0; i <= RIBBON_SAMPLES; i++) {
        ribbonPoints.push(new THREE.Vector3(rStartX + (trackWidth * i) / RIBBON_SAMPLES, 0, 0.05));
      }

      const ribbonCurve = new THREE.CatmullRomCurve3(ribbonPoints, false, 'centripetal');
      const ribbonGeometry = new THREE.TubeGeometry(ribbonCurve, isHandheldGpu ? 40 : 56, 0.046, 8, false);
      const ribbonMaterial = material.clone();
      ribbonMaterial.transparent = true;
      ribbonMaterial.opacity = 1;
      const ribbonMesh = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
      ribbonMesh.scale.set(1.0, 1.0, 0.55);
      group.add(ribbonMesh);

      const tipGlow = new THREE.PointLight('#fff7ee', 1.6, 3.0, 2.0);
      tipGlow.position.set(rStartX, 0, 0.15);
      group.add(tipGlow);

      const created: RibbonState = {
        group,
        trackWidth,
        startX: rStartX,
        trackGeom,
        trackMat,
        ribbonPoints,
        ribbonCurve,
        ribbonMaterial,
        ribbonMesh,
        tipGlow,
      };
      ribbonState = created;
      return created;
    };

    const initialPhase =
      (typeof window !== 'undefined' && (window as any).__ostrumPhase) ||
      phaseRef.current;
    if (initialPhase !== 'complete') {
      ensureRibbon();
    }

    const setupModelMesh = (rawGroup: THREE.Group) => {
      rawGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.material = material;
          mesh.castShadow = false;
          mesh.receiveShadow = false;
          if (mesh.geometry && !mesh.geometry.attributes.normal) {
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
      reconcileLifecycle('model-ready', { forcePoseSnap: true, renderImmediate: true });
    };

    const modelUrl = isHandheldGpu ? '/models/monyedre-360-mobile.glb' : '/models/monyedre-360.glb';
    if (cachedModelEntry && cachedModelEntry.url === modelUrl) {
      setupModelMesh(cachedModelEntry.scene.clone(true));
    } else {
      const loader = new GLTFLoader();
      loader.load(
        modelUrl,
        (gltf) => {
          if (isDisposed) return;
          cachedModelEntry = { url: modelUrl, scene: gltf.scene };
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
      const { width, height } = getViewportDimensions();
      const vHeight = 2 * Math.tan((34 * Math.PI) / 360) * 7.5;
      const vWidth = vHeight * (width / height);
      return { vWidth, vHeight };
    };

    const screenToWorld = (screenX: number, screenY: number) => {
      const { width, height } = getViewportDimensions();
      const { vWidth, vHeight } = getVisibleWorldDimensions();
      const worldX = ((screenX / width) * 2 - 1) * (vWidth / 2);
      const worldY = -(((screenY / height) * 2 - 1) * (vHeight / 2));
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
      introScale: isCompactLayout() ? 0.40 : 0.48,
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

    let lastKnownExitBoundary = anchors.exitScrollY;

    const updateAnchors = () => {
      const { width: vpW, height: vpH } = getViewportDimensions();
      const liveScrollY = getCurrentScrollY();
      const isMob = isCompactLayout();
      const vHeight = 2 * Math.tan((34 * Math.PI) / 360) * 7.5;

      // 0. Intro Center Anchor (Visual center of screen)
      const iDocX = vpW * 0.50;
      const iDocY = vpH * 0.50;
      const iScale = isMob ? 0.40 : 0.48;

      anchors.introDocX = iDocX;
      anchors.introDocY = iDocY;
      anchors.introScale = iScale;

      // 1. Measure Hero SVG Wordmark
      const heroSvg = document.querySelector('.intro svg[aria-label="OSTRUM"]');
      let hDocX = vpW * 0.16;
      let hDocY = vpH * 0.35;
      let hWidth = 160;

      if (heroSvg) {
        const svgRect = heroSvg.getBoundingClientRect();
        const svgScale = svgRect.width / 1253;
        hDocX = svgRect.left + 104 * svgScale;
        hDocY = svgRect.top + 171 * svgScale + liveScrollY;
        hWidth = 185 * svgScale;
        reportHeroTargetReady();
      }

      // Hero scale: fit comfortably inside 'O' counter footprint with zero collision with 'S'
      // Scaled strictly proportional to measured 'O' width
      const heroPixelTarget = Math.max(32, hWidth * 0.72);
      const heroWorldUnits = (heroPixelTarget / vpH) * vHeight;
      const hScale = Math.max(0.05, Math.min(0.24, heroWorldUnits / 3.35));

      anchors.heroDocX = hDocX;
      anchors.heroDocY = hDocY;
      anchors.heroScale = hScale;

      // 2. Measure Section 02 Slot
      const engineSlot = document.getElementById('section02-sculpture-slot');
      let sDocX = vpW * 0.50;
      let sDocY = vpH * 1.8;
      let sWidth = isMob ? 320 : 470;

      if (engineSlot) {
        const slotRect = engineSlot.getBoundingClientRect();
        sDocX = slotRect.left + slotRect.width * 0.50;
        sDocY = slotRect.top + slotRect.height * 0.50 + liveScrollY;
        sWidth = slotRect.width;
      }

      // Section 02 scale: fit cleanly within the slot with ample breathing room
      const slotPixelTarget = isMob
        ? Math.min(220, vpW * 0.58)
        : Math.min(330, sWidth * 0.70);
      const slotWorldUnits = (slotPixelTarget / vpH) * vHeight;
      const sScale = Math.max(0.25, Math.min(0.55, slotWorldUnits / 3.35));

      // 3. Section 03 Scale Target: Subtle focal zoom (4-5% larger than Section 02 slot size)
      // Restrained medium focal scale (~94.5% of previous), visually balanced against narrative typography
      const eScale = sScale * 1.04;

      const st = ScrollTrigger.getById('section02-hold');
      const dScrollY = st && Number.isFinite(st.start) ? st.start : Math.max(1, sDocY - vpH * 0.50);

      const stEnergy = ScrollTrigger.getById('energy-narrative-pin');
      const exitY =
        stEnergy && Number.isFinite(stEnergy.end)
          ? stEnergy.end + 100
          : Math.max(lastKnownExitBoundary, dScrollY + (isMob ? 5000 : 7500));
      if (stEnergy && Number.isFinite(stEnergy.end)) {
        lastKnownExitBoundary = exitY;
      }

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

    const getStoryBounds = () => {
      const { height: vpH } = getViewportDimensions();
      const isCompact = isCompactLayout();
      const st02 = ScrollTrigger.getById('section02-hold');
      const dockStart = st02 && Number.isFinite(st02.start) ? st02.start : anchors.dockScrollY;
      const dockEnd =
        st02 && Number.isFinite(st02.end)
          ? st02.end
          : anchors.dockScrollY + (isCompact ? 650 : 1000);

      const stEnergy = ScrollTrigger.getById('energy-narrative-pin');
      const energyStart =
        stEnergy && Number.isFinite(stEnergy.start)
          ? stEnergy.start
          : dockEnd + (isCompact ? 500 : 800);
      const energyEnd =
        stEnergy && Number.isFinite(stEnergy.end)
          ? stEnergy.end
          : energyStart + (isCompact ? 3600 : 5000) + vpH;

      const liveExit =
        stEnergy && Number.isFinite(stEnergy.end) ? stEnergy.end + 100 : null;
      if (liveExit !== null) {
        lastKnownExitBoundary = liveExit;
      }
      const exitBoundary =
        liveExit !== null ? liveExit : Math.max(anchors.exitScrollY, lastKnownExitBoundary);

      return { dockStart, dockEnd, energyStart, energyEnd, exitBoundary };
    };

    updateAnchors();
    const anchorTimer1 = setTimeout(() => {
      updateAnchors();
      reconcileLifecycle('anchor-timer-450');
    }, 450);
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        if (isDisposed) return;
        updateAnchors();
        reconcileLifecycle('fonts-ready');
      });
    }

    const onNarrativeReady = () => {
      updateAnchors();
      reconcileLifecycle('narrative-ready');
    };
    window.addEventListener('ostrum:narrative-ready', onNarrativeReady);

    let focusBias = 0;
    let targetFocusBias = 0;
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handleFocusBias = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      targetFocusBias = typeof customEvent.detail === 'number' ? customEvent.detail : 0;
    };
    window.addEventListener('ostrum:focus-bias', handleFocusBias);

    const handleMouseMove = (e: MouseEvent) => {
      if (isHandheldGpu || prefersReducedMotion) return;
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
      const rib = ensureRibbon();
      const { group: rGroup, trackWidth, startX: rStartX, trackMat: rTrackMat, ribbonPoints: rPoints, ribbonCurve: rCurve, ribbonMaterial: rMat, ribbonMesh: rMesh, tipGlow: rTipGlow } = rib;
      if (pPhase === 'preparing') {
        rTrackMat.opacity = 1;
        const minHead = rStartX + trackWidth * 0.005;
        for (let k = 0; k <= RIBBON_SAMPLES; k++) {
          const u = k / RIBBON_SAMPLES;
          const px = rStartX + (minHead - rStartX) * u;
          rPoints[k].set(px, 0, 0.05);
        }
        rTipGlow.position.set(minHead, 0, 0.15);
        rTipGlow.intensity = 0.8;
        rGroup.rotation.set(0, 0, 0);
      } else if (pPhase === 'counting') {
        rTrackMat.opacity = 1;
        const clampedP = Math.max(0.005, Math.min(1.0, pIntro));
        const currentEnd = rStartX + trackWidth * clampedP;

        for (let k = 0; k <= RIBBON_SAMPLES; k++) {
          const u = k / RIBBON_SAMPLES;
          const px = rStartX + (currentEnd - rStartX) * u;
          const normX = (px - rStartX) / trackWidth;
          const py = Math.sin(normX * Math.PI) * 0.025;
          const pz = 0.05 + Math.cos(normX * Math.PI * 2) * 0.015;
          rPoints[k].set(px, py, pz);
        }

        rTipGlow.position.set(currentEnd, 0, 0.15);
        rTipGlow.intensity = 1.4;
        rGroup.rotation.set(0, 0, 0);
      } else if (pPhase === 'transforming') {
        const t = Math.max(0, Math.min(1.0, pTransform));
        rTrackMat.opacity = Math.max(0, 1 - t * 3.5);

        for (let k = 0; k <= RIBBON_SAMPLES; k++) {
          const u = k / RIBBON_SAMPLES;
          const x0 = rStartX + trackWidth * u;
          const y0 = Math.sin(u * Math.PI) * 0.025;
          const z0 = 0.05 + Math.cos(u * Math.PI * 2) * 0.015;

          const angle = u * Math.PI * 2;
          const R0 = 1.45;
          const A = 0.22;
          const B = 0.38;
          const r = R0 + A * Math.cos(3 * angle);
          const x1 = r * Math.cos(angle);
          const y1 = r * Math.sin(angle);
          const z1 = B * Math.sin(3 * angle);

          const curlDelay = (1 - u) * 0.24;
          const localT = Math.max(0, Math.min(1, (t - curlDelay) / (1 - curlDelay || 1)));
          const easeT = localT < 0.5 ? 4 * localT * localT * localT : 1 - Math.pow(-2 * localT + 2, 3) / 2;

          rPoints[k].set(x0 * (1 - easeT) + x1 * easeT, y0 * (1 - easeT) + y1 * easeT, z0 * (1 - easeT) + z1 * easeT);
        }

        rGroup.rotation.x = t * 0.20;
        rGroup.rotation.z = -t * 0.05;
        rGroup.rotation.y = 0;

        ensureEnergyLights();
        const sweep = Math.sin(t * Math.PI);
        energyRubyLight.intensity = sweep * 2.8;
        energyAmberLight.intensity = sweep * 1.5;
        if (rMat instanceof THREE.MeshPhysicalMaterial) {
          rMat.sheenColor.lerpColors(sheenColorNormal, sheenColorScarlet, sweep);
        }
        rTipGlow.intensity = (1 - t) * 1.5;
      }

      rCurve.updateArcLengths();
      rMesh.geometry.dispose();
      rMesh.geometry = new THREE.TubeGeometry(
        rCurve,
        isHandheldGpu ? 40 : 56,
        0.046,
        8,
        false
      );
    };

    // Pose evaluation helper separated from loop scheduling so any wake/restore/hero lock
    // renders an accurate frame before or immediately upon starting setAnimationLoop.
    const updateScenePose = (time: number, forceSnap = false) => {
      const scrollY = getCurrentScrollY();
      const { width: vpW, height: vpH } = getViewportDimensions();
      const { dockStart, dockEnd, energyStart, energyEnd } = getStoryBounds();

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
        const rib = ensureRibbon();
        rib.group.visible = true;
        modelRoot.visible = false;
        rib.ribbonMaterial.opacity = 1;
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
        const rib = ensureRibbon();
        rib.group.visible = true;
        modelRoot.visible = false;
        rib.ribbonMaterial.opacity = 1;
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
        const rib = ensureRibbon();

        const heroP = transformP >= 0.82 ? (transformP - 0.82) / 0.18 : 0;
        const zoomPulse = Math.sin(heroP * Math.PI * 0.5) * 0.15;

        targetScreenX = anchors.introDocX;
        targetScreenY = anchors.introDocY;
        targetScale = anchors.introScale * (1.0 + zoomPulse);
        targetRotY = 0;

        if (transformP < 0.72) {
          rib.group.visible = true;
          modelRoot.visible = false;
          rib.ribbonMaterial.opacity = 1;
          material.opacity = 0;
        } else {
          rib.group.visible = transformP < 0.98;
          modelRoot.visible = true;
          const fade = (transformP - 0.72) / 0.26;
          rib.ribbonMaterial.opacity = Math.max(0, 1 - fade);
          material.opacity = Math.min(1, fade);
        }
      }
      // =========================================================================
      // INTRO PHASE 4: DOCKING (5.4s - 6.6s)
      // Live GLB glides from center into measured Hero 'O' anchor
      // =========================================================================
      else if (currentPhase === 'docking') {
        if (ribbonState) ribbonState.group.visible = false;
        modelRoot.visible = true;
        material.opacity = 1;

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
        if (ribbonState) ribbonState.group.visible = false;
        modelRoot.visible = true;
        material.opacity = 1;

        const t = Math.min(1, Math.max(0, scrollY / (dockStart || 1)));
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        targetScreenX = anchors.heroDocX + (anchors.slotDocX - anchors.heroDocX) * ease;
        const startScreenY = anchors.heroDocY;
        const targetCenterY = vpH * 0.50;
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
        if (ribbonState) ribbonState.group.visible = false;
        modelRoot.visible = true;
        material.opacity = 1;

        targetScreenX = anchors.slotDocX;
        targetScreenY = vpH * 0.50;
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
        if (ribbonState) ribbonState.group.visible = false;
        modelRoot.visible = true;
        material.opacity = 1;

        const t = Math.min(1, Math.max(0, (scrollY - dockEnd) / (energyStart - dockEnd || 1)));
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        const targetCenterX = vpW * 0.50;
        targetScreenX = anchors.slotDocX + (targetCenterX - anchors.slotDocX) * ease;
        targetScreenY = vpH * 0.50;

        targetScale = anchors.slotScale + (anchors.energyScale - anchors.slotScale) * ease;
        targetRotY = Math.PI * 2 + focusBias * (1 - ease);
        targetEnergyLevel = ease * 0.35;
      }
      // Stage 4: Energy Narrative Pinned Experience
      else if (scrollY <= energyEnd) {
        if (ribbonState) ribbonState.group.visible = false;
        modelRoot.visible = true;
        material.opacity = 1;

        const isCompact = isCompactLayout();
        const initialHold = isCompact ? 450 : 600;
        const narrativeSpan = isCompact ? 3600 : 5000;
        const narrativeStart = energyStart + initialHold;
        const narrativeEnd = narrativeStart + narrativeSpan;

        targetScreenX = vpW * 0.50;
        targetScreenY = vpH * 0.50;
        targetScale = anchors.energyScale;

        if (scrollY < narrativeStart) {
          targetRotY = 2.0 * Math.PI;
          targetEnergyLevel = 0.35;
        } else if (scrollY <= narrativeEnd) {
          const narrativeProgress = Math.min(1, Math.max(0, (scrollY - narrativeStart) / (narrativeSpan || 1)));
          targetRotY = 2.0 * Math.PI + narrativeProgress * (2.0 * Math.PI);
          targetEnergyLevel = 0.35 + narrativeProgress * 0.65;
        } else {
          targetRotY = 4.0 * Math.PI;
          targetEnergyLevel = 1.0;
        }
      }
      // Stage 5: Transition into Selected Work
      else {
        if (ribbonState) ribbonState.group.visible = false;
        modelRoot.visible = true;
        material.opacity = 1;

        targetScreenX = vpW * 0.50;
        targetScreenY = vpH * 0.50;
        targetScale = anchors.energyScale;
        targetRotY = 4.0 * Math.PI;
        targetEnergyLevel = 1.0;
      }

      // Screen to 3D World conversion
      const targetWorld = screenToWorld(targetScreenX, targetScreenY);

      if (
        !isInitialized ||
        forceSnap ||
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
        isInitialized = true;
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

      // A fast mobile reverse fling can stop at the hero before the paused
      // canvas has caught up with the scroll-derived pose. Lock the sculpture
      // back into the O at the top (scrollY <= 30) so it cannot remain rotated or offscreen;
      // the normal scroll-linked interpolation resumes as soon as the user
      // scrolls away from the hero.
      if (scrollY <= 30 && currentPhase === 'complete') {
        currentX = targetWorld.x;
        currentY = targetWorld.y;
        currentScale = targetScale;
        currentRotationY = 0;
        currentEnergy = 0;
        modelRoot.visible = true;
        material.opacity = 1;
        if (ribbonState) ribbonState.group.visible = false;
        isInitialized = true;
      }

      // Zero-G subtle organic breathing float: active during journey (Hero & travel)
      const isTraveling = scrollY < dockStart && currentPhase === 'complete';
      const floatOffset = isTraveling && !prefersReducedMotion
        ? Math.sin(time * 0.0016) * 0.04 * currentScale
        : 0;

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
        const fil = ensureFilaments();
        ensureEnergyLights();
        material.color.lerpColors(porcelainColor, rubyChampagneColor, E * 0.55);
        material.roughness = 0.26 - E * 0.10;
        if (material instanceof THREE.MeshPhysicalMaterial) {
          material.clearcoat = 0.58 + E * 0.40;
          material.sheen = 0.65 + E * 0.35;
          material.sheenColor.lerpColors(sheenColorNormal, sheenColorScarlet, E);
        }
        material.emissive.lerpColors(emissiveBlack, emissiveScarlet, E * 0.60);
        material.emissiveIntensity = E * 0.95;

        fil.mat1.opacity = Math.min(0.92, E * 1.15);
        fil.mat2.opacity = Math.min(0.78, E * 0.95);
        fil.mat3.opacity = Math.min(0.65, E * 0.85);

        energyRubyLight.intensity = E * 3.8;
        energyAmberLight.intensity = E * 2.2;
      } else if (currentPhase === 'complete') {
        material.color.copy(porcelainColor);
        material.roughness = isHandheldGpu ? 0.22 : 0.26;
        if (material instanceof THREE.MeshPhysicalMaterial) {
          material.clearcoat = 0.58;
          material.sheen = 0.65;
          material.sheenColor.copy(sheenColorNormal);
        }
        material.emissive.copy(emissiveBlack);
        material.emissiveIntensity = 0;

        if (filamentsState) {
          filamentsState.mat1.opacity = 0;
          filamentsState.mat2.opacity = 0;
          filamentsState.mat3.opacity = 0;
        }

        energyRubyLight.intensity = 0;
        energyAmberLight.intensity = 0;
      }

      // Subtle spatial pointer tilt
      if (currentPhase === 'complete') {
        pointer.x += (pointer.targetX - pointer.x) * 0.06;
        pointer.y += (pointer.targetY - pointer.y) * 0.06;
        focusBias += (targetFocusBias - focusBias) * 0.10;

        if (!isHandheldGpu && !prefersReducedMotion) {
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
    };

    const renderSceneFrame = () => {
      if (isDisposed || checkContextLost()) return;
      renderer.render(scene, camera);
      if (!hasReportedFirstFrame && isModelReadyRef.current) {
        hasReportedFirstFrame = true;
        reportFirstFrame();
      }
    };

    const updateDomTelemetry = () => {
      container.dataset.loopActive = String(isLoopActive);
      container.dataset.contextLost = String(checkContextLost());
      container.dataset.modelLoaded = String(isModelReadyRef.current);
    };

    const getDiagnosticsSnapshot = (reason = 'query') => {
      const scrollY = getCurrentScrollY();
      const bounds = getStoryBounds();
      const currentPhase =
        (typeof window !== 'undefined' && (window as any).__ostrumPhase) ||
        phaseRef.current;
      return {
        reason,
        scrollY,
        exitBoundary: bounds.exitBoundary,
        dockStart: bounds.dockStart,
        dockEnd: bounds.dockEnd,
        phase: currentPhase,
        modelLoaded: isModelReadyRef.current,
        modelVisible: modelRoot.visible,
        wrapperOpacity: container.style.opacity || getComputedStyle(container).opacity,
        canvasConnected: renderer.domElement.isConnected && container.contains(renderer.domElement),
        isLoopActive,
        isContextLost: checkContextLost(),
        contextLostCount,
        contextRestoredCount,
        rendererRecreatedCount,
        lastContextEvent,
        lastContextEventAt,
        lifecycleSeq,
      };
    };

    const logDiagnosticsTransition = (reason: string) => {
      if (!isDevDiagnostics) return;
      const snapshot = getDiagnosticsSnapshot(reason);
      const stateKey = [
        snapshot.isLoopActive,
        snapshot.wrapperOpacity,
        snapshot.isContextLost,
        snapshot.modelLoaded,
        snapshot.scrollY <= 30,
        snapshot.contextLostCount,
        snapshot.contextRestoredCount,
        snapshot.rendererRecreatedCount,
      ].join('|');
      if (
        stateKey !== lastLoggedStateKey ||
        reason === 'webglcontextlost' ||
        reason === 'webglcontextrestored' ||
        reason === 'renderer-recreated-after-loss'
      ) {
        lastLoggedStateKey = stateKey;
        console.debug('[3D Journey]', reason, snapshot);
      }
    };

    const stopLoop = () => {
      if (isLoopActive) {
        renderer.setAnimationLoop(null);
        isLoopActive = false;
      }
    };

    const startLoop = () => {
      if (!isLoopActive && !isDisposed && !checkContextLost()) {
        renderer.setAnimationLoop(animate);
        isLoopActive = true;
      }
    };

    const recreateRendererAfterPermanentLoss = () => {
      if (isDisposed || !checkContextLost()) return;
      const scrollY = getCurrentScrollY();
      const bounds = getStoryBounds();
      if (scrollY > bounds.exitBoundary || (typeof document !== 'undefined' && document.hidden)) {
        return;
      }

      const oldRenderer = renderer;
      stopLoop();
      oldRenderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      oldRenderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      if (oldRenderer.domElement && container.contains(oldRenderer.domElement)) {
        container.removeChild(oldRenderer.domElement);
      }
      oldRenderer.dispose();

      try {
        // Reattach existing scene/model/materials to a fresh WebGL context without reloading the GLB.
        attachRenderer(createWebGLRenderer());
        isContextLost = false;
        isInitialized = false;
        restoreAttemptedForCurrentLoss = false;
        clearRecoveryTimers();
        rendererRecreatedCount += 1;
        lastContextEvent = 'renderer-recreated';
        lastContextEventAt = Date.now();
        updateAnchors();
        reconcileLifecycle('renderer-recreated-after-loss', {
          forcePoseSnap: true,
          renderImmediate: true,
        });
      } catch (err: any) {
        console.warn('[3D Journey] WebGL context recreation failed:', err);
        reportError(err?.message || 'WebGL recovery failed');
      }
    };

    const scheduleContextRecovery = () => {
      if (restoreAttemptedForCurrentLoss || isDisposed) return;
      restoreAttemptedForCurrentLoss = true;
      clearRecoveryTimers();

      // Stage 1: Give Three.js / browser restoration a chance via forceContextRestore()
      // (recovers Chromium LRU "Too many active WebGL contexts" evictions without a second renderer).
      recoveryAttemptTimer = setTimeout(() => {
        recoveryAttemptTimer = null;
        if (
          isDisposed ||
          !checkContextLost() ||
          getCurrentScrollY() > getStoryBounds().exitBoundary ||
          (typeof document !== 'undefined' && document.hidden)
        ) {
          return;
        }
        try {
          renderer.forceContextRestore();
        } catch {
          // Ignore driver-specific InvalidOperation errors and let Stage 2 evaluate.
        }
      }, 0);

      // Stage 2 fallback: only if Three.js restoration still left context lost after 250ms in active range.
      recoveryFallbackTimer = setTimeout(() => {
        recoveryFallbackTimer = null;
        if (
          !isDisposed &&
          checkContextLost() &&
          getCurrentScrollY() <= getStoryBounds().exitBoundary &&
          !(typeof document !== 'undefined' && document.hidden)
        ) {
          recreateRendererAfterPermanentLoss();
        }
      }, 250);
    };

    // Main Animation Loop (driven solely by WebGLRenderer.setAnimationLoop)
    let lastIdleHeroFrameTime = 0;
    function animate(time: number) {
      if (isDisposed || !isLoopActive) return;

      if (checkContextLost()) {
        reconcileLifecycle('animate-context-lost');
        return;
      }

      const scrollY = getCurrentScrollY();
      const bounds = getStoryBounds();
      const tabHidden = typeof document !== 'undefined' && document.hidden;
      if (scrollY > bounds.exitBoundary || tabHidden) {
        reconcileLifecycle(tabHidden ? 'animate-tab-hidden' : 'animate-past-exit');
        return;
      }

      // On handheld GPUs while resting at hero top, pace the subtle breathing float to ~25fps
      // so idle frames do not saturate the main thread; full frame rate resumes on any scroll.
      if (isHandheldGpu && scrollY <= 30 && hasReportedFirstFrame) {
        if (time - lastIdleHeroFrameTime < 38) return;
        lastIdleHeroFrameTime = time;
      }

      updateScenePose(time, false);
      renderSceneFrame();
    }

    // Single authoritative owner of loop start/stop and wrapper visibility
    reconcileLifecycle = (reason, options) => {
      if (isDisposed) {
        clearRecoveryTimers();
        stopLoop();
        updateDomTelemetry();
        return;
      }

      const epoch = ++lifecycleSeq;
      const scrollY = getCurrentScrollY();
      const bounds = getStoryBounds();
      const glLost = checkContextLost();
      const tabHidden = typeof document !== 'undefined' && document.hidden;

      if (glLost || scrollY > bounds.exitBoundary || tabHidden) {
        // Stale guard: never allow an older callback to hide if a newer event superseded it.
        if (epoch !== lifecycleSeq) return;
        if (glLost || scrollY > bounds.exitBoundary) {
          isInitialized = false;
        }
        if (scrollY > bounds.exitBoundary || tabHidden) {
          clearRecoveryTimers();
          if (glLost) restoreAttemptedForCurrentLoss = false;
        } else if (glLost && reason !== 'webglcontextlost') {
          // Re-entered active story range while WebGL context is still lost:
          // attempt Three.js restoration first, then recreate only if restoration proves insufficient.
          scheduleContextRecovery();
        }
        stopLoop();
        if (container.style.opacity !== '0') {
          container.style.opacity = '0';
        }
        updateDomTelemetry();
        logDiagnosticsTransition(reason);
        return;
      }

      const wasInactive =
        !isLoopActive ||
        container.style.opacity !== '1' ||
        !isInitialized;

      if (wasInactive || options?.forcePoseSnap || reason === 'resize' || reason === 'scrolltrigger-refresh') {
        updateAnchors();
      }

      // Re-verify fresh scroll state and epoch after measuring anchors.
      if (epoch !== lifecycleSeq) return;
      const freshScrollY = getCurrentScrollY();
      const freshBounds = getStoryBounds();
      const freshHidden = typeof document !== 'undefined' && document.hidden;
      if (checkContextLost() || freshScrollY > freshBounds.exitBoundary || freshHidden) {
        isInitialized = false;
        stopLoop();
        if (container.style.opacity !== '0') {
          container.style.opacity = '0';
        }
        updateDomTelemetry();
        logDiagnosticsTransition(reason + ':recheck-paused');
        return;
      }

      // Reveal wrapper before rendering the first resumed frame.
      if (container.style.opacity !== '1') {
        container.style.opacity = '1';
      }

      const shouldSnap = Boolean(
        options?.forcePoseSnap ||
        wasInactive ||
        (isHandheldGpu && freshScrollY <= 30)
      );
      const activePhase =
        (typeof window !== 'undefined' && (window as any).__ostrumPhase) ||
        phaseRef.current;
      const canRenderCurrentFrame =
        isModelReadyRef.current || activePhase !== 'complete';
      if (canRenderCurrentFrame && (shouldSnap || options?.renderImmediate)) {
        updateScenePose(performance.now(), shouldSnap);
        renderSceneFrame();
      }

      startLoop();
      updateDomTelemetry();
      logDiagnosticsTransition(reason);
    };

    handleContextRestoredWork = () => {
      isInitialized = false;
      syncRendererSizeAndProjection();
      updateAnchors();
      reconcileLifecycle('webglcontextrestored', {
        forcePoseSnap: true,
        renderImmediate: true,
      });
    };

    if (isDevDiagnostics && typeof window !== 'undefined') {
      (window as any).__ostrumJourneyDiagnostics = () => getDiagnosticsSnapshot('manual');
      (window as any).__ostrumJourneyDebug = {
        getSnapshot: () => getDiagnosticsSnapshot('debug'),
        forceContextLoss: () => renderer.forceContextLoss(),
        forceContextRestore: () => renderer.forceContextRestore(),
      };
    }

    const onScrollSync = () => reconcileLifecycle('scroll');
    const onScrollEndSync = () => reconcileLifecycle('scrollend');
    const onStStartSync = () => reconcileLifecycle('scrolltrigger-start');
    const onStEndSync = () => reconcileLifecycle('scrolltrigger-end');
    const onStRefreshSync = () => {
      updateAnchors();
      reconcileLifecycle('scrolltrigger-refresh');
    };
    const onVisibilityChange = () => {
      reconcileLifecycle(document.hidden ? 'visibility-hidden' : 'visibility-visible', {
        forcePoseSnap: !document.hidden,
        renderImmediate: !document.hidden,
      });
    };
    const handleResize = () => {
      if (!checkContextLost()) {
        syncRendererSizeAndProjection();
      }
      updateAnchors();
      reconcileLifecycle('resize', {
        forcePoseSnap: true,
        renderImmediate: true,
      });
    };

    window.addEventListener('scroll', onScrollSync, { passive: true });
    if (typeof window !== 'undefined' && 'onscrollend' in window) {
      window.addEventListener('scrollend', onScrollEndSync, { passive: true });
    }
    ScrollTrigger.addEventListener('scrollStart', onStStartSync);
    ScrollTrigger.addEventListener('scrollEnd', onStEndSync);
    ScrollTrigger.addEventListener('refresh', onStRefreshSync);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('resize', handleResize);

    reconcileLifecycle('init', { forcePoseSnap: true, renderImmediate: true });

    // Cleanup
    return () => {
      isDisposed = true;
      clearRecoveryTimers();
      clearTimeout(anchorTimer1);
      stopLoop();
      updateDomTelemetry();
      window.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', onScrollSync);
      if (typeof window !== 'undefined' && 'onscrollend' in window) {
        window.removeEventListener('scrollend', onScrollEndSync);
      }
      ScrollTrigger.removeEventListener('scrollStart', onStStartSync);
      ScrollTrigger.removeEventListener('scrollEnd', onStEndSync);
      ScrollTrigger.removeEventListener('refresh', onStRefreshSync);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('ostrum:focus-bias', handleFocusBias);
      window.removeEventListener('ostrum:narrative-ready', onNarrativeReady);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);

      if (isDevDiagnostics && typeof window !== 'undefined') {
        delete (window as any).__ostrumJourneyDiagnostics;
        delete (window as any).__ostrumJourneyDebug;
      }

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      material.dispose();
      if (ribbonState) {
        ribbonState.ribbonMaterial.dispose();
        ribbonState.ribbonMesh.geometry.dispose();
        ribbonState.trackGeom.dispose();
        ribbonState.trackMat.dispose();
      }
      if (filamentsState) {
        filamentsState.geom1.dispose();
        filamentsState.geom2.dispose();
        filamentsState.geom3.dispose();
        filamentsState.mat1.dispose();
        filamentsState.mat2.dispose();
        filamentsState.mat3.dispose();
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
