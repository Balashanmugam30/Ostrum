"use client";

import * as React from "react";

/**
 * Anodized Ink — Crimson Orbit: an interactive full-bleed shader background of
 * polished crimson liquid suspended in dark oxblood space, lit like anodized metal.
 *
 * Features:
 * - Curvilinear liquid contour field with high-contrast oxblood negative space
 * - Localized fluid stirring and velocity-reactive metallic glints on pointer movement
 * - Elimination of broad diagonal red streaks and oversaturated ribbons
 * - Zero external dependencies, raw WebGL2, graceful CSS fallback
 */

export type AnodizedInkColors = {
  /** The deep black/oxblood the liquid is suspended in. */
  deep: string;
  /** The rich ruby liquid itself. */
  ink: string;
  /** Warm ivory or champagne metallic specular highlights. */
  sheen: string;
};

export const ANODIZED_INK_PRESETS = {
  lusion: { deep: "#f1f1fa", ink: "#362beb", sheen: "#ffffff" },
  light: { deep: "#f1f1fa", ink: "#362beb", sheen: "#ffffff" },
  crimson: { deep: "#040104", ink: "#850b1b", sheen: "#d8c9c5" },
  bordeaux: { deep: "#030103", ink: "#6e0a15", sheen: "#e2d5d1" },
  obsidian: { deep: "#020102", ink: "#4d060e", sheen: "#cfc2be" },
  cobalt: { deep: "#00020a", ink: "#1f4dff", sheen: "#d4ddff" },
  venom: { deep: "#000401", ink: "#1fd65f", sheen: "#dcffe8" },
  aurum: { deep: "#040200", ink: "#d49a12", sheen: "#fff0c4" },
  orchid: { deep: "#030007", ink: "#a51cff", sheen: "#ecd9ff" },
} satisfies Record<string, AnodizedInkColors>;

export type AnodizedInkPreset = keyof typeof ANODIZED_INK_PRESETS;

export type AnodizedInkProps = {
  /** Explicit height. Default "100%". */
  height?: string;
  /** Named palette preset. Default "lusion". */
  preset?: AnodizedInkPreset;
  /** Override colors. */
  colors?: Partial<AnodizedInkColors>;
  /** Flow speed multiplier. Default 0.38. */
  speed?: number;
  /** How hard the field folds over itself. Default 0.72. */
  turbulence?: number;
  /** Zoom scale of pattern. Default 1.05. */
  scale?: number;
  /** Strength of metallic glints and anodized sheen. Default 0.52. */
  sheen?: number;
  /** Film grain amount. Default 0.18. */
  grain?: number;
  /** Brightness of local pointer glow. Default 0.32. */
  glow?: number;
  /** How strongly the pointer twists the fluid locally. Default 0.55. */
  swirl?: number;
  /** Edge darkening vignette. Default 0.88. */
  vignette?: number;
  /** Whether pointer light and swirl react to mouse. Default true. */
  interactive?: boolean;
  /** Click/tap drops ink ripple rings. Default true. */
  ripples?: boolean;
  /** Max DPR cap. Default 1.25. */
  maxDpr?: number;
  /** Children rendered above the shader canvas. */
  children?: React.ReactNode;
  className?: string;
};

export function hexToRgb(hex: string) {
  let h = String(hex).trim().replace(/^#/, "");
  if (h.length === 3 || h.length === 4) {
    h = h
      .slice(0, 3)
      .split("")
      .map((c) => c + c)
      .join("");
  } else if (h.length === 8) {
    h = h.slice(0, 6);
  }
  if (!/^[0-9a-f]{6}$/i.test(h)) return [0, 0, 0];
  const n = parseInt(h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const MAX_RIPPLES = 6;
const RIPPLE_LIFE = 4;

const VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;        // centred, y up, in units of the canvas height
uniform vec2 uVelocity;     // smoothed pointer velocity vector
uniform float uHover;       // 0 idle drift, 1 pointer inside
uniform float uEnergy;      // smoothed pointer speed
uniform vec3 uDeep;         // base light background #F1F1FA
uniform vec3 uInk;          // cobalt accent #362BEB
uniform vec3 uSheen;        // pearl highlight
uniform float uTurbulence;
uniform float uScale;
uniform float uSheenAmt;
uniform float uGrain;
uniform float uGlow;
uniform float uSwirl;
uniform float uVignette;
uniform vec4 uRipples[6];   // xy centre, z start time, w strength

out vec4 outColor;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p;
    a *= 0.5;
  }
  return v;
}

// Sculptural fluid elevation field
float evaluateFluid(vec2 p, float t, float turb, float sc) {
  vec2 drift = vec2(sin(t * 0.12) * 0.08, cos(t * 0.09) * 0.05);
  vec2 q = p * 1.25 * sc + drift;

  // Domain warping (2 octaves of fbm)
  vec2 w1 = vec2(
    fbm(q * 1.15 + vec2(t * 0.04, -t * 0.02)),
    fbm(q * 1.15 + vec2(2.1 - t * 0.03, 1.7))
  );
  q += w1 * 0.40 * turb;

  vec2 w2 = vec2(
    fbm(q * 1.75 + w1 * 0.55 + vec2(-t * 0.03, 2.8)),
    fbm(q * 1.75 + w1 * 0.55 + vec2(1.5, t * 0.03))
  );
  q += w2 * 0.22 * turb;

  // S-curved fluid body spine sweeping gracefully
  float bodySpine = -0.06 + 0.36 * q.x - 0.20 * sin(q.x * 2.0 + 0.35);
  float distToSpine = abs(q.y - bodySpine);
  float bodyRadius = 0.56 + 0.16 * cos(q.x * 1.6 + 0.8);
  float fluidBoundary = smoothstep(bodyRadius, 0.08, distToSpine);

  // Internal liquid metal contour waves
  float waves = sin((q.x * 0.9 + q.y * 1.1) * 3.8 + t * 0.25) * 0.5
              + cos((q.x * 1.3 - q.y * 0.85) * 3.2 - t * 0.2) * 0.5;
  float crests = 1.0 - abs(waves);
  crests = crests * crests;

  return fluidBoundary * (0.35 + 0.65 * crests);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime;
  vec2 m = uMouse;

  // Pointer interaction vector relative to local fragment
  vec2 dMouse = uv - m;
  float rMouse = length(dMouse);
  float mouseRadius = 0.44;
  float wMouse = smoothstep(mouseRadius, 0.0, rMouse);

  // Local fluid displacement
  vec2 p = uv;
  if (wMouse > 0.0) {
    // 1. Viscous velocity wake: drags fluid contours along pointer motion
    vec2 wake = uVelocity * (0.16 * wMouse * (1.0 - wMouse * 0.35));

    // 2. Local vortex / stirring rotation
    float twist = uSwirl * (0.40 * uHover + uEnergy * 0.85) * 2.4 * wMouse * wMouse;
    float cs = cos(twist);
    float sn = sin(twist);
    vec2 rotD = mat2(cs, -sn, sn, cs) * dMouse;
    vec2 vortex = (rotD - dMouse) * wMouse;

    // 3. Dynamic ripple pressure wave
    float ripplePhase = rMouse * 22.0 - t * 5.0;
    vec2 waveDisplace = (dMouse / max(rMouse, 1e-3)) * sin(ripplePhase) * exp(-rMouse * 8.0) * (uEnergy * 0.035) * wMouse;

    p = uv - wake + vortex + waveDisplace;
  }

  // Ripple waves from click / tap
  float ring = 0.0;
  for (int i = 0; i < 6; i++) {
    vec4 rp = uRipples[i];
    float age = t - rp.z;
    if (rp.w <= 0.0 || age < 0.0 || age > 4.0) continue;
    vec2 dd = uv - rp.xy;
    float rr = length(dd);
    float x = rr - age * 0.42;
    float env = exp(-x * x * 55.0) * exp(-age * 1.15) * rp.w;
    p += (dd / max(rr, 1e-3)) * sin(x * 40.0) * env * 0.035;
    ring += env * (0.5 + 0.5 * sin(x * 40.0));
  }

  // Evaluate fluid elevation and normal via finite differences
  float eps = 0.012;
  float hCenter = evaluateFluid(p, t, uTurbulence, uScale);
  float hX = evaluateFluid(p + vec2(eps, 0.0), t, uTurbulence, uScale);
  float hY = evaluateFluid(p + vec2(0.0, eps), t, uTurbulence, uScale);

  // Dynamic pointer surface dent for specular curvature
  float dentCenter = -0.22 * pow(wMouse, 2.0) * (0.35 + 0.65 * uEnergy);
  float dentX = -0.22 * pow(smoothstep(mouseRadius, 0.0, length(uv + vec2(eps, 0.0) - m)), 2.0) * (0.35 + 0.65 * uEnergy);
  float dentY = -0.22 * pow(smoothstep(mouseRadius, 0.0, length(uv + vec2(0.0, eps) - m)), 2.0) * (0.35 + 0.65 * uEnergy);

  float dHdx = ((hX + dentX) - (hCenter + dentCenter)) / eps;
  float dHdy = ((hY + dentY) - (hCenter + dentCenter)) / eps;
  vec3 norm = normalize(vec3(-dHdx * 0.32, -dHdy * 0.32, 1.0));

  // Lighting calculations
  vec3 L_key = normalize(vec3(-0.35, 0.65, 0.8));
  vec3 H_key = normalize(L_key + vec3(0.0, 0.0, 1.0));
  float spec_key = pow(max(dot(norm, H_key), 0.0), 44.0);

  vec3 L_ptr = normalize(vec3(m - uv, 0.28));
  vec3 H_ptr = normalize(L_ptr + vec3(0.0, 0.0, 1.0));
  float spec_ptr = pow(max(dot(norm, H_ptr), 0.0), 32.0) * wMouse * (0.45 + 0.55 * uHover);

  float fres = pow(1.0 - norm.z, 2.2);

  // Pearlescent Iridescence (pale lavender, soft pearl peach, muted opalescent cyan)
  float iridPhase = dot(norm.xy, vec2(1.3, 0.95)) * 1.6 + fres * 1.8 + t * 0.1;
  vec3 iridColor = vec3(0.86, 0.88, 0.96) + vec3(0.14, 0.12, 0.10) * cos(6.28318 * (vec3(1.0) * iridPhase + vec3(0.60, 0.70, 0.88)));

  // Base background: #F1F1FA
  vec3 col = uDeep;

  // Translucent fluid-metal wash
  col = mix(col, iridColor, hCenter * 0.48);
  // Opalescent rim fresnel
  col = mix(col, vec3(0.74, 0.82, 0.98), fres * hCenter * 0.32);
  // Silvery champagne specular crests
  col += vec3(0.96, 0.98, 1.0) * spec_key * hCenter * uSheenAmt * 0.90;
  // Dynamic specular glints along the stirred crests under cursor
  col += vec3(0.96, 0.98, 1.0) * spec_ptr * hCenter * uSheenAmt * 1.20;

  // Restrained Cobalt Curved Accent on left perimeter (framing without colliding with text)
  vec2 cbCoord = p;
  float cbPath = 0.65 * (cbCoord.x + 0.58) * (cbCoord.x + 0.58) + 0.25 * cbCoord.x - 0.08;
  float cbDist = abs(cbCoord.y - cbPath);
  float cbEnvelope = smoothstep(-0.95, -0.52, cbCoord.x) * smoothstep(-0.22, -0.42, cbCoord.x);
  float cbMask = smoothstep(0.026, 0.006, cbDist) * cbEnvelope;

  if (cbMask > 0.001) {
    vec3 cobalt = uInk; // #362BEB
    float cbSheen = pow(max(dot(norm, H_key), 0.0), 28.0) * 0.4;
    cobalt += vec3(0.28, 0.36, 0.96) * cbSheen;
    col = mix(col, cobalt, cbMask * 0.94);
  }

  // Ripple addition from click / tap
  col = mix(col, vec3(0.78, 0.84, 0.99), ring * 0.25);

  // Micro-grain to eliminate 8-bit banding
  float g = hash21(gl_FragCoord.xy + fract(t * 7.13) * vec2(97.3, 41.7));
  col += (g - 0.5) * 0.016 * uGrain;

  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

function compile(gl: WebGL2RenderingContext, vert: string, frag: string) {
  const program = gl.createProgram();
  if (!program) return null;
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vert],
    [gl.FRAGMENT_SHADER, frag],
  ] as const) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("anodized-ink:", gl.getShaderInfoLog(shader));
      return null;
    }
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("anodized-ink:", gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return reduced;
}

export function AnodizedInk({
  height = "100%",
  preset = "crimson",
  colors,
  speed = 0.38,
  turbulence = 0.72,
  scale = 1.05,
  sheen = 0.52,
  grain = 0.18,
  glow = 0.32,
  swirl = 0.55,
  vignette = 0.88,
  interactive = true,
  ripples = true,
  maxDpr = 1.25,
  children,
  className = "",
}: AnodizedInkProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const kickRef = React.useRef<() => void>(() => {});
  const reduced = usePrefersReducedMotion();
  const [generation, setGeneration] = React.useState(0);
  const [failed, setFailed] = React.useState(false);

  const palette = {
    ...(ANODIZED_INK_PRESETS[preset] ?? ANODIZED_INK_PRESETS.crimson),
    ...colors,
  };

  const params = {
    deep: hexToRgb(palette.deep),
    ink: hexToRgb(palette.ink),
    sheen: hexToRgb(palette.sheen),
    speed,
    turbulence,
    scale,
    sheenAmt: sheen,
    grain,
    glow,
    swirl,
    vignette,
    ripples,
  };
  const paramsRef = React.useRef(params);
  paramsRef.current = params;

  const paramKey = JSON.stringify(params);
  React.useEffect(() => {
    kickRef.current();
  }, [paramKey]);

  React.useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      depth: false,
      powerPreference: "high-performance",
    });
    if (!gl) {
      setFailed(true);
      return;
    }

    const program = compile(gl, VERT, FRAG);
    if (!program) {
      setFailed(true);
      return;
    }

    const vao = gl.createVertexArray();

    const u = (name: string) => gl.getUniformLocation(program, name);
    const loc = {
      res: u("uRes"),
      time: u("uTime"),
      mouse: u("uMouse"),
      velocity: u("uVelocity"),
      hover: u("uHover"),
      energy: u("uEnergy"),
      deep: u("uDeep"),
      ink: u("uInk"),
      sheen: u("uSheen"),
      turbulence: u("uTurbulence"),
      scale: u("uScale"),
      sheenAmt: u("uSheenAmt"),
      grain: u("uGrain"),
      glow: u("uGlow"),
      swirl: u("uSwirl"),
      vignette: u("uVignette"),
      ripples: u("uRipples"),
    };

    const drops = new Float32Array(MAX_RIPPLES * 4);
    let nextDrop = 0;

    const target = { x: 0.18, y: 0.08 };
    const mouse = { x: 0.18, y: 0.08 };
    const velocity = { x: 0, y: 0 };
    let hoverTarget = 0;
    let hover = 0;
    let energy = 0;
    let simTime = reduced ? 14 : 0;
    let clock = 0;
    let last = 0;
    let raf = 0;
    let visible = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, Math.max(0.5, maxDpr));
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const draw = (now: number) => {
      raf = 0;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
      last = now;
      resize();
      const P = paramsRef.current;

      if (reduced) {
        mouse.x = target.x;
        mouse.y = target.y;
        velocity.x = 0;
        velocity.y = 0;
        hover = hoverTarget;
        energy = 0;
      } else {
        clock += dt;
        simTime += dt * P.speed;
        if (hoverTarget === 0) {
          const aspect = canvas.width / canvas.height;
          target.x = Math.sin(clock * 0.18) * 0.28 * aspect;
          target.y = Math.sin(clock * 0.15 + 1.1) * 0.18;
        }
        const px = mouse.x;
        const py = mouse.y;
        const k = 1 - Math.exp(-dt * (hoverTarget ? 8.5 : 1.8));
        mouse.x += (target.x - mouse.x) * k;
        mouse.y += (target.y - mouse.y) * k;
        hover += (hoverTarget - hover) * (1 - Math.exp(-dt * 3.5));
        const rawVx = hoverTarget ? (mouse.x - px) / Math.max(dt, 1e-3) : 0;
        const rawVy = hoverTarget ? (mouse.y - py) / Math.max(dt, 1e-3) : 0;
        const vDecay = 1 - Math.exp(-dt * 6.5);
        velocity.x += (rawVx - velocity.x) * vDecay;
        velocity.y += (rawVy - velocity.y) * vDecay;
        const v = Math.hypot(velocity.x, velocity.y);
        energy += (Math.min(v * 0.45, 1.2) - energy) * (1 - Math.exp(-dt * 4));
      }

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.uniform2f(loc.res, canvas.width, canvas.height);
      gl.uniform1f(loc.time, simTime);
      gl.uniform2f(loc.mouse, mouse.x, mouse.y);
      gl.uniform2f(loc.velocity, velocity.x, velocity.y);
      gl.uniform1f(loc.hover, hover);
      gl.uniform1f(loc.energy, energy);
      gl.uniform3fv(loc.deep, P.deep);
      gl.uniform3fv(loc.ink, P.ink);
      gl.uniform3fv(loc.sheen, P.sheen);
      gl.uniform1f(loc.turbulence, P.turbulence);
      gl.uniform1f(loc.scale, P.scale);
      gl.uniform1f(loc.sheenAmt, P.sheenAmt);
      gl.uniform1f(loc.grain, P.grain);
      gl.uniform1f(loc.glow, P.glow);
      gl.uniform1f(loc.swirl, P.swirl);
      gl.uniform1f(loc.vignette, P.vignette);
      gl.uniform4fv(loc.ripples, drops);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);

      if (!reduced && visible) raf = requestAnimationFrame(draw);
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    kickRef.current = kick;
    kick();

    const resizeObserver = new ResizeObserver(kick);
    resizeObserver.observe(canvas);

    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        last = 0;
        kick();
      }
    });
    visibility.observe(root);

    // Global pointer tracking when section is visible
    const onWindowMove = (e: PointerEvent) => {
      if (!interactive || !visible) return;
      const rect = root.getBoundingClientRect();
      const inX = e.clientX >= rect.left && e.clientX <= rect.right;
      const inY = e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!inX || !inY) {
        hoverTarget = 0;
        return;
      }
      const h = rect.height || 1;
      target.x = (e.clientX - rect.left - rect.width / 2) / h;
      target.y = -(e.clientY - rect.top - rect.height / 2) / h;
      hoverTarget = 1;
      if (reduced) kick();
    };

    const onWindowLeave = () => {
      hoverTarget = 0;
      if (reduced) kick();
    };

    const onWindowDown = (e: PointerEvent) => {
      if (!interactive || !visible || reduced || !paramsRef.current.ripples) return;
      const rect = root.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      )
        return;
      const h = rect.height || 1;
      const px = (e.clientX - rect.left - rect.width / 2) / h;
      const py = -(e.clientY - rect.top - rect.height / 2) / h;
      const i = (nextDrop++ % MAX_RIPPLES) * 4;
      drops[i] = px;
      drops[i + 1] = py;
      drops[i + 2] = simTime;
      drops[i + 3] = 1;
    };

    const retire = window.setInterval(() => {
      for (let i = 0; i < MAX_RIPPLES; i++) {
        if (
          drops[i * 4 + 3] > 0 &&
          Math.abs(simTime - drops[i * 4 + 2]) > RIPPLE_LIFE
        )
          drops[i * 4 + 3] = 0;
      }
    }, 1000);

    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onRestored = () => setGeneration((g) => g + 1);

    window.addEventListener("pointermove", onWindowMove, { passive: true });
    window.addEventListener("pointerdown", onWindowDown, { passive: true });
    window.addEventListener("pointerleave", onWindowLeave, { passive: true });
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    return () => {
      cancelAnimationFrame(raf);
      kickRef.current = () => {};
      window.clearInterval(retire);
      resizeObserver.disconnect();
      visibility.disconnect();
      window.removeEventListener("pointermove", onWindowMove);
      window.removeEventListener("pointerdown", onWindowDown);
      window.removeEventListener("pointerleave", onWindowLeave);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      gl.deleteProgram(program);
      gl.deleteVertexArray(vao);
    };
  }, [interactive, reduced, generation, maxDpr]);

  return (
    <div
      ref={rootRef}
      data-testid="anodized-ink-stage"
      className={"relative w-full overflow-hidden " + className}
      style={{ height, background: palette.deep }}
    >
      {failed ? (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 65% 50% at 30% 35%, " +
              palette.ink +
              "99, transparent 72%), " +
              "radial-gradient(ellipse 55% 42% at 75% 68%, " +
              palette.ink +
              "66, transparent 70%), " +
              "radial-gradient(circle at 50% 50%, transparent 35%, rgba(4,1,4,0.92) 100%), " +
              palette.deep,
          }}
        />
      ) : (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 block h-full w-full"
        />
      )}
      {children != null && (
        <div className="relative z-10 h-full w-full">{children}</div>
      )}
    </div>
  );
}

export default AnodizedInk;
