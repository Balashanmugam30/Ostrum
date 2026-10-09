'use client';

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export type OstrumMaterialVariationKey =
  | 'ostrum-pearl'
  | 'crimson-porcelain'
  | 'sculptural-satin';

export type QualityTier = 'high' | 'balanced' | 'low';

export interface OstrumCore3DMaterialParams {
  color: string;
  roughness: number;
  metalness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  transmission: number;
  thickness: number;
  ior: number;
  attenuationColor: string;
  attenuationDistance: number;
  sheen: number;
  sheenColor: string;
  sheenRoughness: number;
  specularColor: string;
  specularIntensity: number;
  iridescence: number;
  iridescenceIOR: number;
  useProceduralNoise?: boolean;
}

export interface OstrumCore3DLightingParams {
  keyColor: string;
  keyIntensity: number;
  keyPosition: [number, number, number];
  hemiSkyColor: string;
  hemiGroundColor: string;
  hemiIntensity: number;
  rimColor: string;
  rimIntensity: number;
  rimPosition: [number, number, number];
  fillColor: string;
  fillIntensity: number;
  fillPosition: [number, number, number];
}

export interface OstrumVariationConfig {
  key: OstrumMaterialVariationKey;
  name: string;
  subtitle: string;
  character: string;
  material: OstrumCore3DMaterialParams;
  lighting: OstrumCore3DLightingParams;
}

// Module-level asset and texture caches to eliminate redundant parsing and allocation
let cachedGltfGroup: THREE.Group | null = null;
let cachedNoiseTexture: THREE.CanvasTexture | null = null;

function getOrCreateProceduralNoiseTexture(): THREE.CanvasTexture | null {
  if (cachedNoiseTexture) return cachedNoiseTexture;
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const imgData = ctx.createImageData(size, size);
    for (let i = 0; i < size * size * 4; i += 4) {
      const val = 220 + Math.floor(Math.random() * 35);
      imgData.data[i] = val;
      imgData.data[i + 1] = val;
      imgData.data[i + 2] = val;
      imgData.data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  cachedNoiseTexture = texture;
  return texture;
}

export const OSTRUM_VARIATIONS: Record<
  OstrumMaterialVariationKey,
  OstrumVariationConfig
> = {
  'ostrum-pearl': {
    key: 'ostrum-pearl',
    name: 'Variation A — Ostrum Pearl',
    subtitle: 'Warm porcelain & restrained champagne highlights',
    character: 'Architectural, elegant, and timeless gallery porcelain',
    material: {
      color: '#f6f0e4',
      roughness: 0.34,
      metalness: 0.04,
      clearcoat: 0.40,
      clearcoatRoughness: 0.22,
      transmission: 0.0, // Disabled for 60fps performance
      thickness: 1.1,
      ior: 1.48,
      attenuationColor: '#faead6',
      attenuationDistance: 3.0,
      sheen: 0.40,
      sheenColor: '#fcecd4',
      sheenRoughness: 0.38,
      specularColor: '#fcf3e8',
      specularIntensity: 0.95,
      iridescence: 0.05,
      iridescenceIOR: 1.3,
      useProceduralNoise: true,
    },
    lighting: {
      keyColor: '#fff7ee',
      keyIntensity: 2.2,
      keyPosition: [-2.5, 3.6, 3.2],
      hemiSkyColor: '#fdeddc',
      hemiGroundColor: '#220404',
      hemiIntensity: 0.95,
      rimColor: '#ff4d30',
      rimIntensity: 1.8,
      rimPosition: [3.4, -1.2, -2.6],
      fillColor: '#ffebd8',
      fillIntensity: 0.45,
      fillPosition: [1.8, 1.2, 2.0],
    },
  },
  'crimson-porcelain': {
    key: 'crimson-porcelain',
    name: 'Variation B — Crimson Porcelain',
    subtitle: 'Pearl-white base with blush & muted crimson reflected tones',
    character: 'Most recognisably Ostrum-themed, harmonized with the crimson caustics',
    material: {
      color: '#f7eee8', // Blush porcelain white
      roughness: 0.26, // Refined ceramic glaze
      metalness: 0.06,
      clearcoat: 0.58, // Rich polished ceramic glaze
      clearcoatRoughness: 0.18,
      transmission: 0.0, // Zero transmission = zero RTT refraction buffer pass, saving 60% GPU fillrate!
      thickness: 0.95,
      ior: 1.50,
      attenuationColor: '#ffdcd8',
      attenuationDistance: 2.6,
      sheen: 0.65, // Muted crimson grazing angle scatter
      sheenColor: '#ff755d',
      sheenRoughness: 0.32,
      specularColor: '#ffe8e0',
      specularIntensity: 1.15,
      iridescence: 0.16, // Subtle mother-of-pearl lustre
      iridescenceIOR: 1.36,
      useProceduralNoise: true,
    },
    lighting: {
      keyColor: '#fff5ed',
      keyIntensity: 2.3,
      keyPosition: [-2.8, 3.4, 3.4],
      hemiSkyColor: '#ffe6dc',
      hemiGroundColor: '#360505',
      hemiIntensity: 1.1,
      rimColor: '#ff3b20',
      rimIntensity: 2.4,
      rimPosition: [3.5, -1.4, -2.8],
      fillColor: '#ff9c50',
      fillIntensity: 0.55,
      fillPosition: [2.0, 1.0, 1.8],
    },
  },
  'sculptural-satin': {
    key: 'sculptural-satin',
    name: 'Variation C — Sculptural Satin',
    subtitle: 'Ivory & warm sandstone with tactile micro-surface response',
    character: 'Understated, tactile, and gallery-quality stone/wax honesty',
    material: {
      color: '#ede3d4',
      roughness: 0.46,
      metalness: 0.02,
      clearcoat: 0.15,
      clearcoatRoughness: 0.45,
      transmission: 0.0,
      thickness: 0.6,
      ior: 1.44,
      attenuationColor: '#f3e4cf',
      attenuationDistance: 4.2,
      sheen: 0.45,
      sheenColor: '#eedbc2',
      sheenRoughness: 0.55,
      specularColor: '#f2e5d0',
      specularIntensity: 0.75,
      iridescence: 0.02,
      iridescenceIOR: 1.25,
      useProceduralNoise: true,
    },
    lighting: {
      keyColor: '#fff2e2',
      keyIntensity: 2.1,
      keyPosition: [-2.4, 3.8, 3.0],
      hemiSkyColor: '#ece0ce',
      hemiGroundColor: '#1c0303',
      hemiIntensity: 0.88,
      rimColor: '#ff5a3c',
      rimIntensity: 1.5,
      rimPosition: [3.2, -1.0, -2.4],
      fillColor: '#fdecd0',
      fillIntensity: 0.48,
      fillPosition: [1.6, 1.5, 2.2],
    },
  },
};

export interface OstrumCore3DHandle {
  setScrollProgress: (progress: number) => void;
  setTravelProgress: (progress: number) => void;
  setFocusBias: (bias: number) => void;
  setQualityTier: (tier: QualityTier) => void;
  getMetrics: () => {
    fps: number;
    qualityTier: QualityTier;
    triangles: number;
    dpr: number;
  };
}

export interface OstrumCore3DProps {
  variation?: OstrumMaterialVariationKey;
  scrollProgress?: number;
  travelProgress?: number; // 0 = start (high), 1 = centered in composition
  rotationProgress?: number;
  rotationY?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  enablePointerTilt?: boolean;
  cameraDistance?: number;
  qualityTier?: QualityTier;
  customMaterialParams?: Partial<OstrumCore3DMaterialParams>;
  className?: string;
  onLoaded?: () => void;
  scale?: number;
  yOffset?: number;
  activeFocus?: 'business' | 'next' | null;
  scrollDriven?: boolean;
  onFpsUpdate?: (fps: number, tier: QualityTier) => void;
}

export const OstrumCore3D = forwardRef<OstrumCore3DHandle, OstrumCore3DProps>(
  function OstrumCore3D(
    {
      variation = 'crimson-porcelain',
      scrollProgress = 0.5,
      travelProgress = 1.0,
      rotationProgress = 0,
      rotationY,
      autoRotate = false,
      autoRotateSpeed = 0.5,
      enablePointerTilt = true,
      cameraDistance = 7.5,
      qualityTier: initialQualityTier,
      customMaterialParams = {},
      className = 'w-full h-full min-h-[420px]',
      onLoaded,
      scale = 1.0,
      yOffset = 0,
      activeFocus = null,
      scrollDriven = false,
      onFpsUpdate,
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(!cachedGltfGroup);
    const [activeTier, setActiveTier] = useState<QualityTier>(
      initialQualityTier || 'high'
    );

    // Three.js instances
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const modelGroupRef = useRef<THREE.Group | null>(null);
    const materialRef = useRef<
      THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial | null
    >(null);
    const lightsRef = useRef<{
      keyLight: THREE.DirectionalLight;
      hemiLight: THREE.HemisphereLight;
      rimLight: THREE.PointLight;
      fillLight: THREE.DirectionalLight;
    } | null>(null);

    // Motion & interaction states (driven directly by GSAP/listeners without React re-render)
    const animFrameRef = useRef<number | null>(null);
    const isVisibleRef = useRef<boolean>(false);
    const scrollProgressRef = useRef<number>(scrollProgress);
    const travelProgressRef = useRef<number>(travelProgress);
    const focusBiasRef = useRef<number>(0);
    const currentYAngleRef = useRef<number>(0);
    const currentTravelYRef = useRef<number>(0);
    const currentScaleRef = useRef<number>(scale);
    const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

    const scaleRef = useRef<number>(scale);
    const yOffsetRef = useRef<number>(yOffset);
    const autoRotateRef = useRef<boolean>(autoRotate);
    const autoRotateSpeedRef = useRef<number>(autoRotateSpeed);
    const enablePointerTiltRef = useRef<boolean>(enablePointerTilt);
    const onFpsUpdateRef = useRef(onFpsUpdate);
    const onLoadedRef = useRef(onLoaded);

    useEffect(() => {
      scaleRef.current = scale;
      yOffsetRef.current = yOffset;
      autoRotateRef.current = autoRotate;
      autoRotateSpeedRef.current = autoRotateSpeed;
      enablePointerTiltRef.current = enablePointerTilt;
      onFpsUpdateRef.current = onFpsUpdate;
      onLoadedRef.current = onLoaded;
    }, [scale, yOffset, autoRotate, autoRotateSpeed, enablePointerTilt, onFpsUpdate, onLoaded]);

    // Performance telemetry
    const fpsMeterRef = useRef({
      lastCheck: performance.now(),
      frames: 0,
      currentFps: 60,
      samplesBelowTarget: 0,
    });

    // Sync external props to mutable refs
    useEffect(() => {
      scrollProgressRef.current = scrollProgress;
    }, [scrollProgress]);

    useEffect(() => {
      travelProgressRef.current = travelProgress;
    }, [travelProgress]);

    useEffect(() => {
      focusBiasRef.current =
        activeFocus === 'business' ? -0.22 : activeFocus === 'next' ? 0.22 : 0;
    }, [activeFocus]);

    // Imperative handle for GSAP ScrollTrigger
    useImperativeHandle(ref, () => ({
      setScrollProgress: (progress: number) => {
        scrollProgressRef.current = progress;
      },
      setTravelProgress: (progress: number) => {
        travelProgressRef.current = progress;
      },
      setFocusBias: (bias: number) => {
        focusBiasRef.current = bias;
      },
      setQualityTier: (tier: QualityTier) => {
        setActiveTier(tier);
      },
      getMetrics: () => ({
        fps: fpsMeterRef.current.currentFps,
        qualityTier: activeTier,
        triangles: 116726,
        dpr: rendererRef.current?.getPixelRatio() || 1,
      }),
    }));

    // Detect device capability on mount
    useEffect(() => {
      if (initialQualityTier) return;
      const isMobile = window.innerWidth < 768;
      const cores = navigator.hardwareConcurrency || 4;
      if (isMobile || cores <= 4) {
        setActiveTier('balanced');
      }
    }, [initialQualityTier]);

    // Active configuration
    const activeConfig =
      OSTRUM_VARIATIONS[variation] || OSTRUM_VARIATIONS['crimson-porcelain'];
    const activeMaterialParams = {
      ...activeConfig.material,
      ...customMaterialParams,
    };
    const activeLighting = activeConfig.lighting;

    // Apply material adjustments when tier or variation changes
    useEffect(() => {
      if (!materialRef.current || !rendererRef.current) return;
      const mat = materialRef.current;
      const renderer = rendererRef.current;

      const isMobile = window.innerWidth < 768;
      const targetDpr =
        activeTier === 'high'
          ? Math.min(window.devicePixelRatio, 1.35)
          : activeTier === 'balanced'
          ? Math.min(window.devicePixelRatio, isMobile ? 1.0 : 1.15)
          : 0.9;

      renderer.setPixelRatio(targetDpr);

      if (mat instanceof THREE.MeshPhysicalMaterial) {
        mat.color.set(activeMaterialParams.color);
        mat.roughness =
          activeTier === 'low' ? 0.35 : activeMaterialParams.roughness;
        mat.metalness = activeMaterialParams.metalness;
        mat.clearcoat =
          activeTier === 'high'
            ? activeMaterialParams.clearcoat
            : activeTier === 'balanced'
            ? 0.30
            : 0;
        mat.clearcoatRoughness = activeMaterialParams.clearcoatRoughness;
        mat.transmission = 0; // Guard against RTT refraction stall
        mat.sheen =
          activeTier === 'high' ? activeMaterialParams.sheen : 0.35;
        mat.sheenColor.set(activeMaterialParams.sheenColor);
        mat.specularColor.set(activeMaterialParams.specularColor);
        mat.specularIntensity = activeMaterialParams.specularIntensity;
        mat.iridescence =
          activeTier === 'high' ? activeMaterialParams.iridescence : 0;
        mat.needsUpdate = true;
      }
    }, [activeTier, variation, activeMaterialParams]);

    // Main Three.js Scene Setup
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      let isDisposed = false;
      const isMobile = window.innerWidth < 768;
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      // 1. Scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // 2. Camera: 34 deg FOV for editorial compression
      const width = container.clientWidth || 520;
      const height = container.clientHeight || 520;
      const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 50);
      camera.position.set(0, 0, cameraDistance);
      cameraRef.current = camera;

      // 3. WebGLRenderer: Transparent clearColor
      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: activeTier !== 'low' && !isMobile,
          alpha: true,
          powerPreference: 'high-performance',
        });
      } catch {
        setHasError(true);
        setIsLoading(false);
        return;
      }

      const dpr =
        activeTier === 'high'
          ? Math.min(window.devicePixelRatio, 1.35)
          : activeTier === 'balanced'
          ? Math.min(window.devicePixelRatio, 1.15)
          : 0.9;

      renderer.setSize(width, height);
      renderer.setPixelRatio(dpr);
      renderer.setClearColor(0x000000, 0); // 100% transparent clearColor
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.pointerEvents = 'none';
      renderer.domElement.setAttribute('aria-hidden', 'true');
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // 4. Lighting Rig
      const keyLight = new THREE.DirectionalLight(
        activeLighting.keyColor,
        activeLighting.keyIntensity
      );
      keyLight.position.set(...activeLighting.keyPosition);
      scene.add(keyLight);

      const hemiLight = new THREE.HemisphereLight(
        activeLighting.hemiSkyColor,
        activeLighting.hemiGroundColor,
        activeLighting.hemiIntensity
      );
      hemiLight.position.set(0, 5, 0);
      scene.add(hemiLight);

      const rimLight = new THREE.PointLight(
        activeLighting.rimColor,
        activeLighting.rimIntensity,
        12,
        1.2
      );
      rimLight.position.set(...activeLighting.rimPosition);
      scene.add(rimLight);

      const fillLight = new THREE.DirectionalLight(
        activeLighting.fillColor,
        activeLighting.fillIntensity
      );
      fillLight.position.set(...activeLighting.fillPosition);
      scene.add(fillLight);

      lightsRef.current = { keyLight, hemiLight, rimLight, fillLight };

      // 5. Model Root Group
      const modelGroup = new THREE.Group();
      // Start at initial travel position (if travelProgress < 1, starts higher at y: +1.8)
      const initialTravelY = (1 - travelProgressRef.current) * 1.8;
      modelGroup.position.set(0, yOffset + initialTravelY, 0);
      scene.add(modelGroup);
      modelGroupRef.current = modelGroup;

      // 6. Material: Fast dielectric physical material without transmission
      const noiseTex =
        activeTier === 'high' ? getOrCreateProceduralNoiseTexture() : null;

      const material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(activeMaterialParams.color),
        roughness: activeMaterialParams.roughness,
        metalness: activeMaterialParams.metalness,
        clearcoat: activeTier === 'high' ? activeMaterialParams.clearcoat : 0.3,
        clearcoatRoughness: activeMaterialParams.clearcoatRoughness,
        transmission: 0, // Performance-first: zero refraction pass
        thickness: 0,
        ior: activeMaterialParams.ior,
        sheen: activeMaterialParams.sheen,
        sheenColor: new THREE.Color(activeMaterialParams.sheenColor),
        sheenRoughness: activeMaterialParams.sheenRoughness,
        specularColor: new THREE.Color(activeMaterialParams.specularColor),
        specularIntensity: activeMaterialParams.specularIntensity,
        iridescence: activeTier === 'high' ? activeMaterialParams.iridescence : 0,
        iridescenceIOR: activeMaterialParams.iridescenceIOR,
        roughnessMap: noiseTex,
        side: THREE.DoubleSide,
      });
      materialRef.current = material;

      // 7. Load or clone model
      const setupMesh = (rawModel: THREE.Group) => {
        rawModel.traverse((child) => {
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

        const box = new THREE.Box3().setFromObject(rawModel);
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);

        rawModel.position.x = -center.x;
        rawModel.position.y = -center.y;
        rawModel.position.z = -center.z;

        const maxDim = Math.max(size.x, size.y, size.z);
        const targetDim = 3.35 * scale;
        const normalizedScale = maxDim > 0 ? targetDim / maxDim : 0.017;

        const pivotGroup = new THREE.Group();
        pivotGroup.scale.set(normalizedScale, normalizedScale, normalizedScale);
        pivotGroup.add(rawModel);

        // Editorial resting tilt
        pivotGroup.rotation.x = 0.20;
        pivotGroup.rotation.z = -0.05;

        modelGroup.add(pivotGroup);
        setIsLoading(false);
        if (onLoaded) onLoaded();
      };

      if (cachedGltfGroup) {
        setupMesh(cachedGltfGroup.clone(true));
      } else {
        const loader = new GLTFLoader();
        loader.load(
          '/models/monyedre-360.glb',
          (gltf) => {
            if (isDisposed) return;
            cachedGltfGroup = gltf.scene;
            setupMesh(gltf.scene.clone(true));
          },
          undefined,
          (err) => {
            console.error('Failed to load Ostrum Core 3D GLB:', err);
            setHasError(true);
            setIsLoading(false);
          }
        );
      }

      // 8. Desktop Pointer movement
      const handlePointerMove = (e: MouseEvent) => {
        if (!enablePointerTilt || isMobile || prefersReducedMotion) return;
        const rect = container.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        pointerRef.current.targetX = Math.max(-1, Math.min(1, x)) * 0.10;
        pointerRef.current.targetY = Math.max(-1, Math.min(1, y)) * 0.10;
      };

      window.addEventListener('mousemove', handlePointerMove, { passive: true });

      // 9. Resize Handling via ResizeObserver
      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        const w = container.clientWidth || 520;
        const h = container.clientHeight || 520;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);

      // 10. Single Unified Animation Loop with Offscreen Pause
      let lastTime = performance.now();

      let isContextLost = false;
      const onContextLost = (e: Event) => {
        e.preventDefault();
        isContextLost = true;
      };
      const onContextRestored = () => {
        isContextLost = false;
      };

      renderer.domElement.addEventListener('webglcontextlost', onContextLost, false);
      renderer.domElement.addEventListener('webglcontextrestored', onContextRestored, false);

      const animate = (time: number) => {
        if (isDisposed || isContextLost) return;
        animFrameRef.current = requestAnimationFrame(animate);

        // Offscreen pause check: if container is not in viewport, skip rendering
        if (!isVisibleRef.current) return;

        const delta = Math.min((time - lastTime) / 1000, 0.1);
        lastTime = time;

        // Measure FPS and adaptively scale tier if bottlenecked
        fpsMeterRef.current.frames++;
        if (time - fpsMeterRef.current.lastCheck >= 1000) {
          const fps = Math.round(
            (fpsMeterRef.current.frames * 1000) /
              (time - fpsMeterRef.current.lastCheck)
          );
          fpsMeterRef.current.currentFps = fps;
          fpsMeterRef.current.frames = 0;
          fpsMeterRef.current.lastCheck = time;
          if (onFpsUpdateRef.current) onFpsUpdateRef.current(fps, activeTier);

          // Hysteresis step-down: if FPS < 32 for two checks, step down
          if (fps < 32 && activeTier === 'high') {
            fpsMeterRef.current.samplesBelowTarget++;
            if (fpsMeterRef.current.samplesBelowTarget >= 2) {
              setActiveTier('balanced');
              fpsMeterRef.current.samplesBelowTarget = 0;
            }
          }
        }

        // Pointer damping
        pointerRef.current.x +=
          (pointerRef.current.targetX - pointerRef.current.x) * 0.05;
        pointerRef.current.y +=
          (pointerRef.current.targetY - pointerRef.current.y) * 0.05;

        if (modelGroup) {
          // --- A. PROGRESSIVE SCROLL ROTATION ---
          let targetRotation = 0;
          if (autoRotateRef.current && !prefersReducedMotion) {
            currentYAngleRef.current += autoRotateSpeedRef.current * delta;
          } else if (rotationY !== undefined) {
            targetRotation = rotationY + focusBiasRef.current;
            currentYAngleRef.current +=
              (targetRotation - currentYAngleRef.current) * 0.12;
          } else {
            // Full 360-degree rotation across scroll:
            // At progress 0.0 = -Math.PI (-180°)
            // At progress 0.5 = 0.0 (Front view at section center)
            // At progress 1.0 = +Math.PI (+180°)
            targetRotation =
              (scrollProgressRef.current - 0.5) * Math.PI * 2 +
              focusBiasRef.current;
            currentYAngleRef.current +=
              (targetRotation - currentYAngleRef.current) * 0.12;
          }

          modelGroup.rotation.y = currentYAngleRef.current;

          // --- B. SCULPTURE PARALLAX TRAVEL (High -> Center) ---
          // travelProgress: 0 = starts high at +1.8, 1 = settles at 0.0
          const targetTravelY = (1 - travelProgressRef.current) * 1.8;
          currentTravelYRef.current +=
            (targetTravelY - currentTravelYRef.current) * 0.12;

          // Zero-g subtle floating breath
          const floatY = Math.sin(time * 0.0014) * 0.06;
          modelGroup.position.y =
            yOffsetRef.current + currentTravelYRef.current + floatY;

          // --- C. DYNAMIC SCALE (0.82 entry -> 1.0 arrival) ---
          const entryScaleFactor = 0.82 + travelProgressRef.current * 0.18;
          const hoverFactor = activeFocus ? 1.04 : 1.0;
          const targetScale = scaleRef.current * entryScaleFactor * hoverFactor;
          currentScaleRef.current +=
            (targetScale - currentScaleRef.current) * 0.10;
          const s = currentScaleRef.current;
          modelGroup.scale.set(s, s, s);

          // Subtle pointer tilt
          if (enablePointerTiltRef.current && !isMobile && !prefersReducedMotion) {
            modelGroup.rotation.x = pointerRef.current.y * 0.22;
            modelGroup.rotation.z = -pointerRef.current.x * 0.16;

            // Subtle camera breathing
            camera.position.x = pointerRef.current.x * 0.25;
            camera.position.y = pointerRef.current.y * 0.18;
          }
          camera.lookAt(0, yOffsetRef.current, 0);
        }

        renderer.render(scene, camera);
      };

      // 11. IntersectionObserver for zero-cost offscreen sleeping
      const visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          isVisibleRef.current = entry.isIntersecting;
        },
        { threshold: 0, rootMargin: '120px' }
      );
      visibilityObserver.observe(container);

      // Start loop
      animFrameRef.current = requestAnimationFrame(animate);

      // Cleanup
      return () => {
        isDisposed = true;
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        window.removeEventListener('mousemove', handlePointerMove);
        resizeObserver.disconnect();
        visibilityObserver.disconnect();
        renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
        renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);

        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }

        renderer.dispose();
        material.dispose();
      };
    }, [cameraDistance]);

    if (hasError) {
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/ostrum-core-front.webp"
            alt="Ostrum Core"
            className="max-h-[380px] w-auto object-contain filter drop-shadow-[0_10px_30px_rgba(255,80,40,0.25)]"
          />
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className={`relative flex items-center justify-center overflow-visible bg-transparent ${className}`}
        data-testid="ostrum-core-3d-container"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-7 h-7 rounded-full border border-white/20 border-t-[#ff5c4a] animate-spin" />
          </div>
        )}
      </div>
    );
  }
);
