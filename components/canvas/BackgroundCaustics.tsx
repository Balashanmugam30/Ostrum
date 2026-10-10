'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function BackgroundCaustics() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    let animationFrameId: number;
    const size = { width: container.clientWidth || window.innerWidth, height: container.clientHeight || window.innerHeight };

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(size.width, size.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
    camera.position.z = 1;


    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      varying vec2 vUv;

      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;

      // Texture
      uniform sampler2D uTexture;
      uniform vec2 uTextureResolution;

      // Water
      uniform float uWaterScale;
      uniform float uWaterSpeed;
      uniform float uDistortionStrength;

      // Mouse interaction
      uniform float uMouseRadius;
      uniform float uMouseStrength;

      // Grain
      uniform float uGrainIntensity;
      uniform float uGrainSpeed;

      // Scroll
      uniform float uScrollY;

      // Halo
      uniform float uHaloIntensity;
      uniform float uHaloSize;
      uniform vec3 uHaloColor;

      // ============================================
      // SIMPLEX 3D NOISE
      // ============================================

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);

        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);

        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;

        i = mod289(i);
        vec4 p = permute(permute(permute(
          i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));

        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);

        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);

        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);

        vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
      }

      // ============================================
      // OBJECT-FIT COVER UV (with safe overscan for parallax)
      // ============================================

      vec2 coverUV(vec2 uv, vec2 screenSize, vec2 textureSize, float overscan) {
        float screenAspect = screenSize.x / screenSize.y;
        float textureAspect = textureSize.x / textureSize.y;

        vec2 scale = vec2(1.0 / overscan);

        if (screenAspect > textureAspect) {
          scale.y = (textureAspect / screenAspect) / overscan;
        } else {
          scale.x = (screenAspect / textureAspect) / overscan;
        }

        vec2 offset = vec2(0.5, 0.5);
        return (uv - vec2(0.5, 0.5)) * scale + offset;
      }

      // ============================================
      // WATER DISTORTION
      // ============================================

      vec2 waterDistortion(vec2 p, float time) {
        vec3 coord = vec3(p * uWaterScale, time * uWaterSpeed);

        float n1 = snoise(coord);
        float n2 = snoise(coord + vec3(0.1, 0.0, 0.0));
        float n3 = snoise(coord + vec3(0.0, 0.1, 0.0));

        vec2 grad = vec2(n2 - n1, n3 - n1);
        return grad * uDistortionStrength;
      }

      // ============================================
      // FILM GRAIN
      // ============================================

      float filmGrain(vec2 uv, float time) {
        vec2 grainUv = uv * uResolution;
        float seed = mod(floor(time * uGrainSpeed), 400.0) * 0.37;

        float grain1 = fract(sin(dot(grainUv + seed, vec2(12.9898, 78.233))) * 43758.5453);
        float grain2 = fract(sin(dot(grainUv * 0.7 + 0.5 + seed, vec2(39.346, 11.135))) * 43758.5453);

        return mix(grain1, grain2, 0.5);
      }

      // ============================================
      // MOUSE DISTORTION
      // ============================================

      vec2 mouseDistortion(vec2 uv, vec2 mouse) {
        vec2 dir = uv - mouse;
        float dist = length(dir);

        float strength = smoothstep(uMouseRadius, 0.0, dist);
        strength = pow(strength, 1.5);

        vec2 displacement = normalize(dir + 0.0001) * strength * uMouseStrength;
        return displacement;
      }

      // ============================================
      // MOUSE LIGHT HALO
      // ============================================

      vec3 mouseHalo(vec2 uv, vec2 mouse) {
        float aspect = uResolution.x / uResolution.y;

        vec2 uvCorrected = vec2(uv.x * aspect, uv.y);
        vec2 mouseCorrected = vec2(mouse.x * aspect, mouse.y);

        float dist = length(uvCorrected - mouseCorrected);
        float glow = smoothstep(uHaloSize, 0.0, dist);
        float intensity = pow(glow, 1.6);

        // Radiant crimson-amber luminescence
        vec3 haloGrad = mix(uHaloColor, vec3(1.0, 0.45, 0.28), glow * 0.45);
        return haloGrad * intensity * uHaloIntensity;
      }

      // ============================================
      // MAIN
      // ============================================

      void main() {
        vec2 uv = vUv;
        float time = uTime;

        // Overscan factor 1.25 provides safe margin for parallax without border clipping
        vec2 texUV = coverUV(uv, uResolution, uTextureResolution, 1.25);
        // Liquid responsive scroll parallax: 0.16 texture travel across page scroll
        float yParallax = - (uScrollY - 0.5) * 0.16;
        texUV.y += yParallax;

        vec2 distortion = waterDistortion(uv, time);
        vec2 mouseDist = mouseDistortion(uv, uMouse);

        texUV += distortion + mouseDist;
        texUV = clamp(texUV, 0.001, 0.999);

        vec3 color = texture2D(uTexture, texUV).rgb;

        // ============================================
        // CLARTÉ ATMOSPHERIC BURGUNDY VIGNETTE & CONTRAST
        // ============================================
        // Aspect-corrected radial coordinate from optical center (50% x, 46% y)
        float aspect = uResolution.x / uResolution.y;
        vec2 vCoord = vec2((uv.x - 0.5) * aspect, uv.y - 0.46);
        float vDist = length(vCoord);

        // Smooth gradual organic vignette falloff:
        // Inside vDist < 0.38: saturated luminous scarlet focal core
        // Between 0.38 and 1.25: deepens into obsidian burgundy (#0d0103 to #050001)
        float vignette = smoothstep(1.25, 0.38, vDist);
        vec3 deepBurgundy = vec3(0.042, 0.006, 0.010);
        color = mix(deepBurgundy, color * vec3(1.08, 0.98, 0.95), vignette);

        // Radiant cursor halo over focal core
        vec3 halo = mouseHalo(uv, uMouse);
        color += halo;

        float grain1 = filmGrain(uv, time);
        float grain2 = filmGrain(uv * 1.5 + 0.5, time * 0.8);
        float grain3 = filmGrain(uv * 3.0, time * 1.5);
        float grain = grain1 * 0.5 + grain2 * 0.3 + grain3 * 0.2;

        color = color + (grain - 0.5) * uGrainIntensity;
        color = clamp(color, 0.0, 1.0);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(size.width, size.height) },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uTexture: { value: null },
        uTextureResolution: { value: new THREE.Vector2(1920, 1080) },
        uWaterScale: { value: 2 },
        uWaterSpeed: { value: 0.15 },
        uDistortionStrength: { value: isMobile ? 0.018 : 0.025 },
        uMouseRadius: { value: 0.35 },
        uMouseStrength: { value: isMobile ? 0 : 0.035 },
        uGrainIntensity: { value: isMobile ? 0.25 : 0.4 },
        uGrainSpeed: { value: isMobile ? 8 : 12 },
        uScrollY: { value: 0 },
        uHaloIntensity: { value: isMobile ? 0 : 0.85 },
        uHaloSize: { value: 0.55 },
        uHaloColor: { value: new THREE.Color(1.0, 0.18, 0.08) },
      },
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    scene.add(mesh);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/images/bg.webp', (tex) => {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      material.uniforms.uTexture.value = tex;
      if (tex.image) {
        material.uniforms.uTextureResolution.value.set(tex.image.width, tex.image.height);
      }
    });

    const mousePos = { x: 0.5, y: 0.5 };
    const targetPos = { x: 0.5, y: 0.5 };
    let scrollY = 0;
    let targetScrollY = 0;
    let isVisible = true;
    let isContextLost = false;

    const onMouseMove = (e: MouseEvent) => {
      targetPos.x = e.clientX / window.innerWidth;
      targetPos.y = 1 - e.clientY / window.innerHeight;
    };

    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      targetScrollY = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };

    const onVisibilityChange = () => {
      isVisible = document.visibilityState === 'visible';
    };

    const onContextLost = (e: Event) => {
      e.preventDefault();
      isContextLost = true;
    };

    const onContextRestored = () => {
      isContextLost = false;
    };

    renderer.domElement.addEventListener('webglcontextlost', onContextLost, false);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored, false);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    onScroll();

    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible || isContextLost) return;

      const elapsed = ((performance.now() - startTime) * 0.001) % 3600.0;
      mousePos.x += (targetPos.x - mousePos.x) * 0.08;
      mousePos.y += (targetPos.y - mousePos.y) * 0.08;
      scrollY += (targetScrollY - scrollY) * 0.16;

      const uniforms = material.uniforms;
      uniforms.uTime.value = elapsed;
      uniforms.uMouse.value.set(mousePos.x, mousePos.y);
      uniforms.uScrollY.value = scrollY;

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      size.width = container.clientWidth || window.innerWidth;
      size.height = container.clientHeight || window.innerHeight;
      renderer.setSize(size.width, size.height);
      material.uniforms.uResolution.value.set(size.width, size.height);
    };

    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);

      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      material.uniforms.uTexture.value?.dispose();
      material.dispose();
      mesh.geometry.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="background-webgl fixed inset-0 pointer-events-none z-0 bg-black overflow-hidden"
      style={{
        backgroundImage: 'url(/images/bg.webp)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
      }}
    >
      {/* Non-interactive Atmospheric Burgundy Vignette Layer */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            'radial-gradient(ellipse 95% 85% at 50% 46%, transparent 35%, rgba(20, 2, 5, 0.45) 72%, rgba(6, 1, 2, 0.88) 100%)',
        }}
      />
    </div>
  );
}
