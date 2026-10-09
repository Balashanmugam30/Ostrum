'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export type OstrumMaterialVariationKey =
  | 'ostrum-pearl'
  | 'crimson-porcelain'
  | 'sculptural-satin';

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
      color: '#f6f0e4', // Warm alabaster porcelain
      roughness: 0.34, // Soft satin sheen
      metalness: 0.04, // Pure dielectric ceramic
      clearcoat: 0.40, // Delicate ceramic glaze
      clearcoatRoughness: 0.22,
      transmission: 0.22, // Soft light diffusion through edges
      thickness: 1.1,
      ior: 1.48, // Alabaster/fine porcelain
      attenuationColor: '#faead6', // Warm interior absorption
      attenuationDistance: 3.0,
      sheen: 0.40, // Champagne grazing falloff
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
      hemiGroundColor: '#220404', // Deep crimson floor bounce
      hemiIntensity: 0.95,
      rimColor: '#ff4d30', // Restrained silhouette separation
      rimIntensity: 1.8,
      rimPosition: [3.4, -1.2, -2.6],
      fillColor: '#ffebd8', // Warm shadowed fill (no glowing reactor)
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
      roughness: 0.26, // Smoother ceramic glaze with crisp light response
      metalness: 0.06,
      clearcoat: 0.58, // Rich polished ceramic glaze
      clearcoatRoughness: 0.18,
      transmission: 0.18,
      thickness: 0.95,
      ior: 1.50,
      attenuationColor: '#ffdcd8', // Warm blush internal absorption
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
      hemiGroundColor: '#360505', // Rich crimson ambient environment bounce
      hemiIntensity: 1.1,
      rimColor: '#ff3b20', // Vibrant crimson edge definition
      rimIntensity: 2.4,
      rimPosition: [3.5, -1.4, -2.8],
      fillColor: '#ff9c50', // Warm amber subtle fill in folds
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
      color: '#ede3d4', // Warm sandstone / honed limestone ivory
      roughness: 0.46, // Matte honed stone response
      metalness: 0.02,
      clearcoat: 0.15, // Low matte wax sheen
      clearcoatRoughness: 0.45,
      transmission: 0.08, // Solid sculptural presence
      thickness: 0.6,
      ior: 1.44,
      attenuationColor: '#f3e4cf',
      attenuationDistance: 4.2,
      sheen: 0.45,
      sheenColor: '#eedbc2', // Sandstone champagne highlights
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

// Generates an in-memory procedural micro-noise texture to prevent flat plastic surfaces
function createProceduralNoiseTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const imgData = ctx.createImageData(size, size);
  for (let i = 0; i < size * size * 4; i += 4) {
    // Subtle high-frequency noise value between 220 and 255
    const val = 220 + Math.floor(Math.random() * 35);
    imgData.data[i] = val;
    imgData.data[i + 1] = val;
    imgData.data[i + 2] = val;
    imgData.data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

interface OstrumCore3DProps {
  variation?: OstrumMaterialVariationKey;
  rotationProgress?: number; // 0 to 1 -> maps to 0 to 360 degrees
  rotationY?: number; // Direct angle in radians
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  enablePointerTilt?: boolean;
  cameraDistance?: number; // 7.5 standard; 5.0 close-up
  customMaterialParams?: Partial<OstrumCore3DMaterialParams>;
  className?: string;
  onLoaded?: () => void;
  scale?: number;
  yOffset?: number;
  activeFocus?: 'business' | 'next' | null;
  scrollDriven?: boolean;
}

export function OstrumCore3D({
  variation = 'crimson-porcelain',
  rotationProgress = 0,
  rotationY,
  autoRotate = false,
  autoRotateSpeed = 0.5,
  enablePointerTilt = true,
  cameraDistance = 7.5,
  customMaterialParams = {},
  className = 'w-full h-full min-h-[420px]',
  onLoaded,
  scale = 1.0,
  yOffset = 0,
  activeFocus = null,
  scrollDriven = false,
}: OstrumCore3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // References to keep Three.js state across renders without rebuilding scene
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const lightsRef = useRef<{
    keyLight: THREE.DirectionalLight;
    hemiLight: THREE.HemisphereLight;
    rimLight: THREE.PointLight;
    fillLight: THREE.DirectionalLight;
  } | null>(null);
  const noiseTextureRef = useRef<THREE.CanvasTexture | null>(null);

  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const animFrameRef = useRef<number | null>(null);
  const currentRotationYRef = useRef(0);
  const scrollProgressRef = useRef(0.5);
  const activeFocusRef = useRef<'business' | 'next' | null>(activeFocus);
  const focusBiasRef = useRef(0);
  const currentGroupScaleRef = useRef(1.0);

  useEffect(() => {
    activeFocusRef.current = activeFocus;
  }, [activeFocus]);

  // Scroll-driven calculation for seamless section rotation
  useEffect(() => {
    if (!scrollDriven) return;

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const totalTravel = vh + rect.height;
      const currentPos = vh - rect.top;
      const progress = Math.min(1, Math.max(0, currentPos / totalTravel));
      scrollProgressRef.current = progress;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollDriven]);

  // Get active variation configuration
  const activeConfig = OSTRUM_VARIATIONS[variation] || OSTRUM_VARIATIONS['crimson-porcelain'];
  const activeMaterial = {
    ...activeConfig.material,
    ...customMaterialParams,
  };
  const activeLighting = activeConfig.lighting;

  // Handle rotation target from props
  useEffect(() => {
    if (scrollDriven) return;
    const target =
      rotationY !== undefined ? rotationY : rotationProgress * Math.PI * 2;
    currentRotationYRef.current = target;
  }, [rotationProgress, rotationY, scrollDriven]);

  // Update camera distance smoothly when prop changes
  useEffect(() => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = cameraDistance;
    cameraRef.current.updateProjectionMatrix();
  }, [cameraDistance]);

  // Update material and lighting dynamically when variation changes
  useEffect(() => {
    if (!materialRef.current || !lightsRef.current) return;

    // 1. Update Material
    const mat = materialRef.current;
    mat.color.set(activeMaterial.color);
    mat.roughness = activeMaterial.roughness;
    mat.metalness = activeMaterial.metalness;
    mat.clearcoat = activeMaterial.clearcoat;
    mat.clearcoatRoughness = activeMaterial.clearcoatRoughness;
    mat.transmission = activeMaterial.transmission;
    mat.thickness = activeMaterial.thickness;
    mat.ior = activeMaterial.ior;
    mat.attenuationColor.set(activeMaterial.attenuationColor);
    mat.attenuationDistance = activeMaterial.attenuationDistance;
    mat.sheen = activeMaterial.sheen;
    mat.sheenColor.set(activeMaterial.sheenColor);
    mat.sheenRoughness = activeMaterial.sheenRoughness;
    mat.specularColor.set(activeMaterial.specularColor);
    mat.specularIntensity = activeMaterial.specularIntensity;
    mat.iridescence = activeMaterial.iridescence;
    mat.iridescenceIOR = activeMaterial.iridescenceIOR;
    mat.needsUpdate = true;

    // 2. Update Lights
    const { keyLight, hemiLight, rimLight, fillLight } = lightsRef.current;
    keyLight.color.set(activeLighting.keyColor);
    keyLight.intensity = activeLighting.keyIntensity;
    keyLight.position.set(...activeLighting.keyPosition);

    hemiLight.color.set(activeLighting.hemiSkyColor);
    hemiLight.groundColor.set(activeLighting.hemiGroundColor);
    hemiLight.intensity = activeLighting.hemiIntensity;

    rimLight.color.set(activeLighting.rimColor);
    rimLight.intensity = activeLighting.rimIntensity;
    rimLight.position.set(...activeLighting.rimPosition);

    fillLight.color.set(activeLighting.fillColor);
    fillLight.intensity = activeLighting.fillIntensity;
    fillLight.position.set(...activeLighting.fillPosition);
  }, [
    variation,
    activeMaterial.color,
    activeMaterial.roughness,
    activeMaterial.metalness,
    activeMaterial.clearcoat,
    activeMaterial.clearcoatRoughness,
    activeMaterial.transmission,
    activeMaterial.thickness,
    activeMaterial.ior,
    activeMaterial.attenuationColor,
    activeMaterial.attenuationDistance,
    activeMaterial.sheen,
    activeMaterial.sheenColor,
    activeMaterial.sheenRoughness,
    activeMaterial.specularColor,
    activeMaterial.specularIntensity,
    activeMaterial.iridescence,
    activeMaterial.iridescenceIOR,
    activeLighting,
  ]);

  // Main Three.js scene initialization
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDisposed = false;
    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup: 34 deg FOV for editorial compression and architectural dignity
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 600;
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 50);
    camera.position.set(0, 0, cameraDistance);
    cameraRef.current = camera;

    // 3. WebGLRenderer with transparent background and ACESFilmic tone mapping
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isMobile,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.75));
    renderer.setClearColor(0x000000, 0); // 100% transparent clear color
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio Lighting Rig (Gallery-Quality Key, Soft Fill, Silhouette Rim)
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
    modelGroup.position.set(0, yOffset, 0);
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // 6. Procedural Texture & Physical Material
    const noiseTex = createProceduralNoiseTexture();
    noiseTextureRef.current = noiseTex;

    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(activeMaterial.color),
      roughness: activeMaterial.roughness,
      metalness: activeMaterial.metalness,
      clearcoat: activeMaterial.clearcoat,
      clearcoatRoughness: activeMaterial.clearcoatRoughness,
      transmission: activeMaterial.transmission,
      thickness: activeMaterial.thickness,
      ior: activeMaterial.ior,
      attenuationColor: new THREE.Color(activeMaterial.attenuationColor),
      attenuationDistance: activeMaterial.attenuationDistance,
      sheen: activeMaterial.sheen,
      sheenColor: new THREE.Color(activeMaterial.sheenColor),
      sheenRoughness: activeMaterial.sheenRoughness,
      specularColor: new THREE.Color(activeMaterial.specularColor),
      specularIntensity: activeMaterial.specularIntensity,
      iridescence: activeMaterial.iridescence,
      iridescenceIOR: activeMaterial.iridescenceIOR,
      roughnessMap: activeMaterial.useProceduralNoise ? noiseTex : null,
      side: THREE.DoubleSide,
    });
    materialRef.current = material;

    // 7. Load GLB Model
    const loader = new GLTFLoader();
    loader.load(
      '/models/monyedre-360.glb',
      (gltf) => {
        if (isDisposed) return;

        const rawModel = gltf.scene;

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

        // Compute bounding box and normalize scale & center
        const box = new THREE.Box3().setFromObject(rawModel);
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);

        // Center model geometry at local (0, 0, 0)
        rawModel.position.x = -center.x;
        rawModel.position.y = -center.y;
        rawModel.position.z = -center.z;

        // Normalize size so maximum dimension is 3.35 units
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetDim = 3.35 * scale;
        const normalizedScale = maxDim > 0 ? targetDim / maxDim : 0.017;

        const pivotGroup = new THREE.Group();
        pivotGroup.scale.set(normalizedScale, normalizedScale, normalizedScale);
        pivotGroup.add(rawModel);

        // Editorial resting tilt: subtle dynamic diagonal
        pivotGroup.rotation.x = 0.20;
        pivotGroup.rotation.z = -0.05;

        modelGroup.add(pivotGroup);

        setIsLoading(false);
        if (onLoaded) onLoaded();
      },
      undefined,
      (err) => {
        console.error('Failed to load Ostrum Core 3D GLB:', err);
        setHasError(true);
        setIsLoading(false);
      }
    );

    // 8. Pointer movement listener (desktop only)
    const handlePointerMove = (e: MouseEvent) => {
      if (!enablePointerTilt || isMobile || prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointerRef.current.targetX = Math.max(-1, Math.min(1, x)) * 0.10;
      pointerRef.current.targetY = Math.max(-1, Math.min(1, y)) * 0.10;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    // 9. Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 600;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 10. Animation Loop
    let lastTime = performance.now();
    let currentYAngle = currentRotationYRef.current;

    const animate = (time: number) => {
      if (isDisposed) return;
      animFrameRef.current = requestAnimationFrame(animate);

      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Pointer damping
      pointerRef.current.x +=
        (pointerRef.current.targetX - pointerRef.current.x) * 0.05;
      pointerRef.current.y +=
        (pointerRef.current.targetY - pointerRef.current.y) * 0.05;

      if (modelGroup) {
        // Calculate focus bias (-0.22 for business on left, +0.22 for next on right)
        const focusTarget =
          activeFocusRef.current === 'business'
            ? -0.22
            : activeFocusRef.current === 'next'
            ? 0.22
            : 0;
        focusBiasRef.current += (focusTarget - focusBiasRef.current) * 0.08;

        if (autoRotate && !prefersReducedMotion) {
          currentYAngle += autoRotateSpeed * delta;
        } else if (scrollDriven) {
          // Center of section (0.5 scroll progress) = 0 radians (iconic front orientation)
          // 360-degree rotation across scroll traversal
          const scrollTarget =
            (scrollProgressRef.current - 0.5) * Math.PI * 2 + focusBiasRef.current;
          currentYAngle += (scrollTarget - currentYAngle) * 0.10;
        } else {
          const target = currentRotationYRef.current + focusBiasRef.current;
          currentYAngle += (target - currentYAngle) * 0.12;
        }

        modelGroup.rotation.y = currentYAngle;

        // Subtle zero-g floating breath (weightless physics)
        const floatY = Math.sin(time * 0.0014) * 0.07;
        modelGroup.position.y = yOffset + floatY;

        // Interactive subtle scale breath on hover
        const targetScale = activeFocusRef.current ? 1.04 : 1.0;
        currentGroupScaleRef.current +=
          (targetScale - currentGroupScaleRef.current) * 0.08;
        const s = currentGroupScaleRef.current;
        modelGroup.scale.set(s, s, s);

        // Subtle pointer tilt
        modelGroup.rotation.x = pointerRef.current.y * 0.25;
        modelGroup.rotation.z = -pointerRef.current.x * 0.18;

        // Subtle camera breathing
        camera.position.x = pointerRef.current.x * 0.3;
        camera.position.y = pointerRef.current.y * 0.2;
        camera.lookAt(0, yOffset, 0);
      }

      renderer.render(scene, camera);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      isDisposed = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      material.dispose();
      if (noiseTextureRef.current) noiseTextureRef.current.dispose();
    };
  }, [
    scale,
    yOffset,
    autoRotate,
    autoRotateSpeed,
    enablePointerTilt,
    scrollDriven,
  ]);

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
          <div className="w-8 h-8 rounded-full border border-white/20 border-t-amber-400 animate-spin" />
        </div>
      )}
    </div>
  );
}
