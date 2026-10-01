'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function BackgroundCaustics() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isMobile = window.innerWidth <= 440;
    if (isMobile) return;

    let animationFrameId: number;
    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    container.appendChild(renderer.domElement);

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform sampler2D uTexture;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform float uLoaded;
      varying vec2 vUv;

      void main() {
        if (uLoaded < 0.5) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
          return;
        }

        // Cover UV calculation for 1920x1080 background texture
        vec2 sRes = uResolution;
        vec2 tRes = vec2(1920.0, 1080.0);
        float sAspect = sRes.x / sRes.y;
        float tAspect = tRes.x / tRes.y;
        vec2 scale = vec2(1.0);
        if (sAspect > tAspect) {
          scale = vec2(1.0, tAspect / sAspect);
        } else {
          scale = vec2(sAspect / tAspect, 1.0);
        }
        vec2 uv = (vUv - 0.5) * scale + 0.5;

        // Subtle organic caustic pulse
        float dist = distance(uv, vec2(0.5, 0.5));
        float wave = sin(dist * 6.0 - uTime * 0.6) * 0.0025;
        vec2 distortedUv = uv + vec2(wave, -wave * 0.5);

        vec4 tex = texture2D(uTexture, distortedUv);

        // Fine film grain
        float noise = (fract(sin(dot(uv * (uTime * 0.2 + 1.0), vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.025;
        gl_FragColor = vec4(tex.rgb + vec3(noise), tex.a);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: null },
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uLoaded: { value: 0.0 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/images/bg.webp', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      material.uniforms.uTexture.value = tex;
      material.uniforms.uLoaded.value = 1.0;
      material.needsUpdate = true;
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      material.uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!renderer || !material) return;
      renderer.setSize(window.innerWidth, window.innerHeight);
      material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="background-webgl fixed inset-0 pointer-events-none z-0 bg-black"
      style={{
        backgroundImage: 'url(/images/bg.webp)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
      }}
    />
  );
}
