"use client";

import * as React from "react";

/**
 * Anodized Ink — an interactive full-bleed shader background of crimson ink suspended in
 * obsidian black, lit like anodized metal.
 *
 * Built with raw WebGL2 and zero external dependencies (React is the only import).
 * Features animated iterated sine warping, finite-difference surface normals,
 * thin-film oxide sheen glints, interactive pointer light & swirl, and click ripple propagation.
 */

export type AnodizedInkColors = {
  /** The black the ink is suspended in. */
  deep: string;
  /** The ink itself. */
  ink: string;
  /** Highlight colour of the metallic glints. */
  sheen: string;
};

export const ANODIZED_INK_PRESETS = {
  crimson: { deep: "#030000", ink: "#d1001c", sheen: "#c9c9c9" },
  cobalt: { deep: "#00020a", ink: "#1f4dff", sheen: "#d4ddff" },
  venom: { deep: "#000401", ink: "#1fd65f", sheen: "#dcffe8" },
  aurum: { deep: "#040200", ink: "#d49a12", sheen: "#fff0c4" },
  orchid: { deep: "#030007", ink: "#a51cff", sheen: "#ecd9ff" },
} satisfies Record<string, AnodizedInkColors>;

export type AnodizedInkPreset = keyof typeof ANODIZED_INK_PRESETS;

export type AnodizedInkProps = {
  /** Explicit height. Default "100%". */
  height?: string;
  /** Named palette preset. Default "crimson". */
  preset?: AnodizedInkPreset;
  /** Override colors. */
  colors?: Partial<AnodizedInkColors>;
  /** Flow speed multiplier. Default 0.65. */
  speed?: number;
  /** How hard the field folds over itself. Default 0.85. */
  turbulence?: number;
  /** Zoom scale of pattern. Default 0.9. */
  scale?: number;
  /** Strength of metallic glints and anodized sheen. Default 0.65. */
  sheen?: number;
  /** Film grain amount. Default 0.25. */
  grain?: number;
  /** Brightness of the light that follows pointer. Default 0.65. */
  glow?: number;
  /** How strongly the pointer twists the ink. Default 0.6. */
  swirl?: number;
  /** Edge darkening vignette. Default 0.78. */
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
uniform float uHover;       // 0 idle drift, 1 pointer inside
uniform float uEnergy;      // smoothed pointer speed
uniform vec3 uDeep;
uniform vec3 uInk;
uniform vec3 uSheen;
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

float inkField(vec2 p, float t) {
  vec2 q = p + 0.45 * uTurbulence * vec2(
    fbm(p * 0.9 + vec2(t * 0.07, 0.0)),
    fbm(p * 0.9 + vec2(3.1, -t * 0.05))
  );
  float s = 0.5 * uTurbulence;
  for (float i = 1.0; i < 5.0; i++) {
    q.x += s * sin(q.y * i + t * 0.5);
    q.y += s * cos(q.x * i + t * 0.5);
    s *= 0.6;
  }
  return sin(q.x * 2.0 + q.y * 2.0);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime;
  vec2 m = uMouse;

  vec2 p = uv - m * 0.05;

  vec2 d = p - m;
  float twist = uSwirl * (0.45 * uHover + uEnergy) * 1.5 * exp(-dot(d, d) * 9.0);
  float cs = cos(twist);
  float sn = sin(twist);
  p = m + mat2(cs, -sn, sn, cs) * d;

  float ring = 0.0;
  for (int i = 0; i < 6; i++) {
    vec4 rp = uRipples[i];
    float age = t - rp.z;
    if (rp.w <= 0.0 || age < 0.0 || age > 4.0) continue;
    vec2 dd = uv - rp.xy;
    float rr = length(dd);
    float x = rr - age * 0.42;
    float env = exp(-x * x * 55.0) * exp(-age * 1.15) * rp.w;
    p += (dd / max(rr, 1e-3)) * sin(x * 40.0) * env * 0.04;
    ring += env * (0.5 + 0.5 * sin(x * 40.0));
  }

  vec2 q = p * 2.4 * uScale + vec2(0.9, 0.5);

  float e = 0.01;
  float h = inkField(q, t);
  float hx = inkField(q + vec2(e, 0.0), t);
  float hy = inkField(q + vec2(0.0, e), t);
  vec3 n = normalize(vec3((h - hx) / e * 0.11, (h - hy) / e * 0.11, 1.0));

  float pattern = smoothstep(0.3, 0.7, h);
  vec3 col = mix(uDeep, uInk, pattern);
  col *= 0.6 + 0.6 * smoothstep(0.5, 1.0, h);

  vec3 L = normalize(vec3((m - uv) * 1.4, 0.0) + vec3(-0.35, 0.5, 0.8));
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(n, H), 0.0), 56.0);
  float fres = pow(1.0 - n.z, 1.5);

  vec3 film = 0.5 + 0.5 * cos(6.28318 * (fres * 1.3 + h * 0.18 + vec3(0.0, 0.33, 0.67)));
  vec3 sheenCol = mix(uSheen, uSheen * film * 1.5, 0.3 * pattern);
  col += sheenCol * spec * uSheenAmt * (0.12 + 0.88 * pattern);
  col += mix(uInk, film * uInk.r + uInk * 0.5, 0.4) * fres * 0.5 * pattern * uSheenAmt;

  float dist = length(uv - m);
  col += uInk * (0.1 / (dist + 0.1)) * 0.22 * uGlow * (0.45 + 0.55 * uHover);

  col += (uInk * 0.35 + uSheen * 0.08) * ring;

  float vig = smoothstep(1.25, 0.15, length(uv * vec2(0.85, 1.0)));
  col *= mix(1.0, vig, uVignette);

  float g = hash21(gl_FragCoord.xy + fract(t * 7.13) * vec2(97.3, 41.7));
  col += (g - 0.5) * 0.07 * uGrain;
  col += (hash21(gl_FragCoord.yx + 13.7) - 0.5) / 255.0;

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
  speed = 0.65,
  turbulence = 0.85,
  scale = 0.9,
  sheen = 0.65,
  grain = 0.25,
  glow = 0.65,
  swirl = 0.6,
  vignette = 0.78,
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
        hover = hoverTarget;
        energy = 0;
      } else {
        clock += dt;
        simTime += dt * P.speed;
        if (hoverTarget === 0) {
          const aspect = canvas.width / canvas.height;
          target.x = Math.sin(clock * 0.21) * 0.32 * aspect;
          target.y = Math.sin(clock * 0.17 + 1.3) * 0.22;
        }
        const px = mouse.x;
        const py = mouse.y;
        const k = 1 - Math.exp(-dt * (hoverTarget ? 7 : 1.5));
        mouse.x += (target.x - mouse.x) * k;
        mouse.y += (target.y - mouse.y) * k;
        hover += (hoverTarget - hover) * (1 - Math.exp(-dt * 3));
        const v = hoverTarget
          ? Math.hypot(mouse.x - px, mouse.y - py) / Math.max(dt, 1e-3)
          : 0;
        energy += (Math.min(v * 0.6, 1.4) - energy) * (1 - Math.exp(-dt * 4));
      }

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.uniform2f(loc.res, canvas.width, canvas.height);
      gl.uniform1f(loc.time, simTime);
      gl.uniform2f(loc.mouse, mouse.x, mouse.y);
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

    const toShader = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const h = rect.height || 1;
      return {
        x: (e.clientX - rect.left - rect.width / 2) / h,
        y: -(e.clientY - rect.top - rect.height / 2) / h,
      };
    };
    const onMove = (e: PointerEvent) => {
      if (!interactive) return;
      const p = toShader(e);
      target.x = p.x;
      target.y = p.y;
      hoverTarget = 1;
      if (reduced) kick();
    };
    const onLeave = () => {
      hoverTarget = 0;
      if (reduced) kick();
    };
    const onDown = (e: PointerEvent) => {
      if (!interactive) return;
      onMove(e);
      if (reduced || !paramsRef.current.ripples) return;
      const p = toShader(e);
      const i = (nextDrop++ % MAX_RIPPLES) * 4;
      drops[i] = p.x;
      drops[i + 1] = p.y;
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

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointercancel", onLeave);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    return () => {
      cancelAnimationFrame(raf);
      kickRef.current = () => {};
      window.clearInterval(retire);
      resizeObserver.disconnect();
      visibility.disconnect();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointercancel", onLeave);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      gl.deleteProgram(program);
      gl.deleteVertexArray(vao);
    };
  }, [interactive, reduced, generation, maxDpr]);

  return (
    <div
      ref={rootRef}
      className={"relative w-full overflow-hidden " + className}
      style={{ height, background: palette.deep }}
    >
      {failed ? (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 45% at 30% 35%, " +
              palette.ink +
              "cc, transparent 70%), " +
              "radial-gradient(ellipse 50% 40% at 75% 70%, " +
              palette.ink +
              "88, transparent 70%), " +
              "radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.8) 100%), " +
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
