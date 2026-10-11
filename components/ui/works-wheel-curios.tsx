"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * WorksWheelCurios — A collection of lightweight sculptural ornaments
 * (porcelain loops, optical ruby glass droplets, champagne metallic beads,
 * and delicate orbital trajectories) that float in the left and right negative space
 * beside the initial circular Works Wheel.
 *
 * Disappearance:
 * - At rest (turn = 0), they float gently with subtle parallax.
 * - As the wheel opens into drum mode (turn: 0.0 -> 0.70), they drift outward,
 *   scale down slightly, and fade to 0 opacity.
 * - At turn >= 0.70 (drum mode / project presentation), they are completely hidden
 *   and unmounted/paused to save all GPU/CPU resources.
 * - Reverse scroll restores them smoothly.
 */

export interface WorksWheelCuriosHandle {
  setTurn: (turn: number) => void;
  setPointer: (x: number, y: number) => void;
}

export interface WorksWheelCuriosProps {
  /** Optional initial turn value (default 0) */
  initialTurn?: number;
  className?: string;
}

export const WorksWheelCurios = React.forwardRef<
  WorksWheelCuriosHandle,
  WorksWheelCuriosProps
>(function WorksWheelCurios({ initialTurn = 0, className }, ref) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const leftGroupRef = React.useRef<HTMLDivElement>(null);
  const rightGroupRef = React.useRef<HTMLDivElement>(null);

  // Animation and state refs (direct DOM manipulation for 60-120fps with 0 React re-renders)
  const turnRef = React.useRef(initialTurn);
  const pointerTarget = React.useRef({ x: 0, y: 0 });
  const pointerCurrent = React.useRef({ x: 0, y: 0 });
  const animFrame = React.useRef(0);
  const isVisibleRef = React.useRef(true);
  const loopRef = React.useRef<((now: number) => void) | null>(null);
  const lastTimeRef = React.useRef(0);

  // Reduced motion preference
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Update layout and transforms based on turn and pointer
  const updateTransforms = React.useCallback(() => {
    const turn = turnRef.current;
    const m = Math.min(1, Math.max(0, turn));
    // Exit progress: from turn 0.0 to 0.65
    const exitP = Math.min(1, Math.max(0, m / 0.65));
    const opacity = 1.0 - exitP;
    const scale = 1.0 - exitP * 0.16;

    if (opacity <= 0.001) {
      if (isVisibleRef.current && containerRef.current) {
        containerRef.current.style.visibility = "hidden";
        containerRef.current.style.opacity = "0";
        isVisibleRef.current = false;
      }
      return;
    }

    if (!isVisibleRef.current && containerRef.current) {
      containerRef.current.style.visibility = "visible";
      isVisibleRef.current = true;
    }

    const px = pointerCurrent.current.x;
    const py = pointerCurrent.current.y;

    // Left group: drifts slightly left as wheel opens
    if (leftGroupRef.current) {
      const shiftX = -exitP * 65 + px * 14;
      const shiftY = py * 10;
      leftGroupRef.current.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0) scale(${scale})`;
      leftGroupRef.current.style.opacity = String(opacity);
    }

    // Right group: drifts slightly right as wheel opens
    if (rightGroupRef.current) {
      const shiftX = exitP * 65 + px * 14;
      const shiftY = py * 10;
      rightGroupRef.current.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0) scale(${scale})`;
      rightGroupRef.current.style.opacity = String(opacity);
    }

    if (containerRef.current) {
      containerRef.current.style.opacity = String(opacity);
    }
  }, []);

  // Expose imperative API
  React.useImperativeHandle(
    ref,
    () => ({
      setTurn: (val: number) => {
        turnRef.current = val;
        updateTransforms();
        if (animFrame.current === 0 && val < 0.70 && loopRef.current) {
          lastTimeRef.current = performance.now();
          animFrame.current = requestAnimationFrame(loopRef.current);
        }
      },
      setPointer: (x: number, y: number) => {
        pointerTarget.current = { x, y };
        if (animFrame.current === 0 && turnRef.current < 0.70 && loopRef.current) {
          lastTimeRef.current = performance.now();
          animFrame.current = requestAnimationFrame(loopRef.current);
        }
      },
    }),
    [updateTransforms]
  );

  // Smooth floating loop with time-based inertia for subtle parallax
  React.useEffect(() => {
    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      if (!reduced) {
        // Smoothly interpolate pointer with inertia
        const k = 1 - Math.exp(-dt * 6);
        pointerCurrent.current.x +=
          (pointerTarget.current.x - pointerCurrent.current.x) * k;
        pointerCurrent.current.y +=
          (pointerTarget.current.y - pointerCurrent.current.y) * k;
      }

      updateTransforms();

      // Only continue loop if curio is visible or partially visible
      const m = Math.min(1, Math.max(0, turnRef.current));
      if (m < 0.70 || Math.abs(pointerTarget.current.x - pointerCurrent.current.x) > 0.001) {
        animFrame.current = requestAnimationFrame(loop);
      } else {
        animFrame.current = 0;
      }
    };

    loopRef.current = loop;
    animFrame.current = requestAnimationFrame(loop);

    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
      loopRef.current = null;
    };
  }, [reduced, updateTransforms]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-testid="works-wheel-curios"
      className={cn(
        "pointer-events-none absolute inset-0 z-10 size-full overflow-hidden select-none",
        className
      )}
      style={{
        opacity: initialTurn > 0.65 ? 0 : 1,
        visibility: initialTurn > 0.65 ? "hidden" : "visible",
      }}
    >
      {/* ======================================================== */}
      {/* LEFT SCULPTURAL GROUP (Porcelain Loop, Ruby Droplet, Orbit) */}
      {/* ======================================================== */}
      <div
        ref={leftGroupRef}
        className="absolute inset-y-0 left-0 w-1/3 min-w-[260px] max-w-[440px] will-change-transform"
      >
        {/* Curio L1: Porcelain Möbius Loop (Upper Left) */}
        <div
          className={cn(
            "absolute top-[22%] left-[12%] sm:left-[16%] md:left-[20%]",
            reduced ? "" : "animate-[curioFloatA_7.6s_easeInOut_infinite]"
          )}
        >
          <svg
            width="82"
            height="74"
            viewBox="0 0 82 74"
            fill="none"
            className="drop-shadow-[0_16px_28px_rgba(0,0,0,0.65)]"
          >
            <defs>
              <linearGradient id="porcelainGrad" x1="12" y1="8" x2="70" y2="66" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="28%" stopColor="#FAF6F2" />
                <stop offset="68%" stopColor="#E5DDD6" />
                <stop offset="100%" stopColor="#8C7D73" />
              </linearGradient>
              <radialGradient id="porcelainShine" cx="36" cy="24" r="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="orbitWireL1" x1="0" y1="0" x2="82" y2="74" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#D8C9C5" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#D8C9C5" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#D8C9C5" stopOpacity="0.35" />
              </linearGradient>
            </defs>
            {/* Fine orbital ring around the loop */}
            <ellipse
              cx="41"
              cy="37"
              rx="38"
              ry="18"
              transform="rotate(-26 41 37)"
              stroke="url(#orbitWireL1)"
              strokeWidth="0.85"
              strokeDasharray="2 3"
            />
            {/* Porcelain sculpted loop body */}
            <path
              d="M24 44C16 38 18 24 28 17C38 10 54 12 61 22C68 32 62 46 51 52C40 58 28 54 22 48"
              stroke="url(#porcelainGrad)"
              strokeWidth="9.5"
              strokeLinecap="round"
            />
            {/* Internal inner twist shadow */}
            <path
              d="M31 22C38 17 50 18 56 26C62 34 56 46 47 50"
              stroke="#6E6056"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeOpacity="0.4"
            />
            {/* Ceramic specular crest highlight */}
            <path
              d="M30 18C37 13 49 14 55 22"
              stroke="url(#porcelainShine)"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Curio L2: Optical Ruby Glass Droplet (Lower Left) */}
        <div
          className={cn(
            "absolute bottom-[20%] left-[16%] sm:left-[22%] md:left-[26%]",
            reduced ? "" : "animate-[curioFloatB_8.4s_easeInOut_infinite]"
          )}
        >
          <svg
            width="60"
            height="78"
            viewBox="0 0 60 78"
            fill="none"
            className="drop-shadow-[0_20px_32px_rgba(133,11,27,0.45)]"
          >
            <defs>
              <linearGradient id="rubyGlassGrad" x1="14" y1="12" x2="48" y2="72" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#C9184A" />
                <stop offset="45%" stopColor="#850B1B" />
                <stop offset="85%" stopColor="#4A050E" />
                <stop offset="100%" stopColor="#2B0207" />
              </linearGradient>
              <radialGradient id="rubyCaustic" cx="30" cy="54" r="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FF4D6D" stopOpacity="0.8" />
                <stop offset="65%" stopColor="#850B1B" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="rubySpecular" x1="18" y1="16" x2="34" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#FFCCD5" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#FFCCD5" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Translucent glass droplet body */}
            <path
              d="M30 6C30 6 12 36 12 50C12 62.15 20.06 72 30 72C39.94 72 48 62.15 48 50C48 36 30 6 30 6Z"
              fill="url(#rubyGlassGrad)"
            />
            {/* Inner caustic refraction glow */}
            <ellipse cx="30" cy="52" rx="14" ry="12" fill="url(#rubyCaustic)" />
            {/* Crisp outer curvature highlight */}
            <path
              d="M26 14C23 24 16 38 16 48C16 54 18 60 22 64"
              stroke="url(#rubySpecular)"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            {/* Micro ivory bead suspended above the apex */}
            <circle cx="30" cy="3" r="2.2" fill="#FAF6F2" />
          </svg>
        </div>

        {/* Curio L3: Elliptical Orbit & Champagne Bead (Mid Outer Left) */}
        <div
          className={cn(
            "hidden sm:block absolute top-[47%] left-[6%] sm:left-[8%] md:left-[10%]",
            reduced ? "" : "animate-[curioFloatC_6.8s_easeInOut_infinite]"
          )}
        >
          <svg
            width="104"
            height="56"
            viewBox="0 0 104 56"
            fill="none"
            className="drop-shadow-[0_12px_24px_rgba(0,0,0,0.55)]"
          >
            <defs>
              <linearGradient id="champagneBeadGrad" x1="48" y1="2" x2="62" y2="16" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="#E8DDD9" />
                <stop offset="85%" stopColor="#9C8882" />
                <stop offset="100%" stopColor="#4A3C38" />
              </linearGradient>
            </defs>
            {/* Inclined orbital trajectory */}
            <ellipse
              cx="52"
              cy="28"
              rx="46"
              ry="19"
              transform="rotate(-18 52 28)"
              stroke="#D8C9C5"
              strokeOpacity="0.28"
              strokeWidth="0.8"
            />
            {/* Polished champagne metallic sphere */}
            <circle cx="56" cy="10" r="6" fill="url(#champagneBeadGrad)" />
            {/* Micro glint sparkle */}
            <path
              d="M56 6L57 10L61 10L58 12L59 16L56 13L53 16L54 12L51 10L55 10Z"
              fill="#FFFFFF"
              opacity="0.85"
            />
          </svg>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT SCULPTURAL GROUP (Dual Satellite, Palladium Sphere) */}
      {/* ======================================================== */}
      <div
        ref={rightGroupRef}
        className="absolute inset-y-0 right-0 w-1/3 min-w-[260px] max-w-[440px] will-change-transform"
      >
        {/* Curio R1: Dual Ivory & Ruby Satellite (Upper Right) */}
        <div
          className={cn(
            "absolute top-[24%] right-[12%] sm:right-[16%] md:right-[20%]",
            reduced ? "" : "animate-[curioFloatB_7.9s_easeInOut_infinite]"
          )}
        >
          <svg
            width="88"
            height="76"
            viewBox="0 0 88 76"
            fill="none"
            className="drop-shadow-[0_18px_30px_rgba(0,0,0,0.6)]"
          >
            <defs>
              <radialGradient id="satIvoryGrad" cx="30" cy="28" r="16" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="45%" stopColor="#FAF6F2" />
                <stop offset="85%" stopColor="#D5CCC5" />
                <stop offset="100%" stopColor="#6B5F57" />
              </radialGradient>
              <radialGradient id="satRubyGrad" cx="62" cy="50" r="10" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FF4D6D" />
                <stop offset="40%" stopColor="#850B1B" />
                <stop offset="100%" stopColor="#300308" />
              </radialGradient>
            </defs>
            {/* Fine curved linking tether */}
            <path
              d="M34 32C46 36 56 42 62 50"
              stroke="#D8C9C5"
              strokeOpacity="0.32"
              strokeWidth="0.85"
            />
            {/* Primary ivory porcelain orb */}
            <circle cx="34" cy="30" r="15" fill="url(#satIvoryGrad)" />
            {/* Secondary ruby cabochon */}
            <circle cx="64" cy="52" r="8" fill="url(#satRubyGrad)" />
            {/* Delicate halo ring around ruby */}
            <ellipse
              cx="64"
              cy="52"
              rx="15"
              ry="6"
              transform="rotate(28 64 52)"
              stroke="#FFCCD5"
              strokeOpacity="0.4"
              strokeWidth="0.75"
            />
          </svg>
        </div>

        {/* Curio R2: Champagne Palladium Sphere (Lower Right) */}
        <div
          className={cn(
            "absolute bottom-[22%] right-[16%] sm:right-[22%] md:right-[25%]",
            reduced ? "" : "animate-[curioFloatA_8.8s_easeInOut_infinite]"
          )}
        >
          <svg
            width="78"
            height="78"
            viewBox="0 0 78 78"
            fill="none"
            className="drop-shadow-[0_20px_34px_rgba(0,0,0,0.65)]"
          >
            <defs>
              <radialGradient id="champagneOrbGrad" cx="34" cy="32" r="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="35%" stopColor="#E6DAD6" />
                <stop offset="75%" stopColor="#9C8B85" />
                <stop offset="100%" stopColor="#3E322F" />
              </radialGradient>
              <linearGradient id="orbGlow" x1="0" y1="0" x2="78" y2="78" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#850B1B" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#850B1B" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Subtle ruby ambient aura */}
            <circle cx="39" cy="39" r="34" fill="url(#orbGlow)" />
            {/* Tilted orbital ring */}
            <ellipse
              cx="39"
              cy="39"
              rx="33"
              ry="13"
              transform="rotate(32 39 39)"
              stroke="#D8C9C5"
              strokeOpacity="0.38"
              strokeWidth="0.9"
            />
            {/* Solid metallic sphere */}
            <circle cx="39" cy="39" r="18" fill="url(#champagneOrbGrad)" />
            {/* Anisotropic specular gleam */}
            <ellipse
              cx="34"
              cy="31"
              rx="5"
              ry="3"
              transform="rotate(-25 34 31)"
              fill="#FFFFFF"
              opacity="0.9"
            />
          </svg>
        </div>

        {/* Curio R3: Breathing Optical Glint (Mid Outer Right) */}
        <div
          className={cn(
            "hidden sm:block absolute top-[48%] right-[6%] sm:right-[8%] md:right-[11%]",
            reduced ? "" : "animate-[curioFloatC_7.2s_easeInOut_infinite]"
          )}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            className="opacity-75"
          >
            {/* 4-point optical star flare */}
            <path
              d="M18 2C18 10 14 18 6 18C14 18 18 26 18 34C18 26 22 18 30 18C22 18 18 10 18 2Z"
              fill="#FAF6F2"
            />
            <circle cx="18" cy="18" r="3" fill="#FFFFFF" />
          </svg>
        </div>
      </div>
    </div>
  );
});

export default WorksWheelCurios;
