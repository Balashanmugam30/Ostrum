"use client";

// A portfolio showcase built as a circular ring that opens into a large 3D perspective drum.
//
// At rest (turn = 0), the projects form a generous circular ring (70–74% viewport height)
// around a minimal, restrained central label ("Selected Work").
//
// As the user scrolls (turn >= 1), the ring transitions into a two-column drum:
// - RIGHT: The active project artwork moves to the front as a large, cinematic thumbnail (42–46% width, 48–56% height).
// - LEFT: Clean, prominent project information (title, description, and live destination link).
// - Surrounding cards curve back into 3D perspective above and below.
import * as React from "react";
import { cn } from "@/lib/utils";

export interface WorksWheelItem {
  /** Project name. Displayed prominently on the left panel. */
  title: string;
  /** Short, meaningful editorial description. */
  description: string;
  /** Cover art. Local path under /images/works/ or remote URL. */
  image: string;
  /** Where the card links to (live HTTPS URL or anchor). */
  href?: string;
}

export interface ProjectTheme {
  /** Bold primary project color */
  primary: string;
  /** Distinct countertone or accent */
  secondary: string;
  /** Deep base atmosphere for negative space and contrast */
  deep: string;
  /** Specular metallic or pearl highlight */
  sheen: string;
  /** High-contrast text color for titles */
  textColor: string;
  /** Legible secondary text color for descriptions */
  textMuted: string;
  /** Theme-coordinated call-to-action link color */
  linkColor: string;
}

export const LIGHT_OVAL_THEME: ProjectTheme = {
  primary: "#362BEB",
  secondary: "#7482F8",
  deep: "#F1F1FA",
  sheen: "#FFFFFF",
  textColor: "#0B0B10",
  textMuted: "rgba(11, 11, 16, 0.75)",
  linkColor: "#362BEB",
};

export const PROJECT_THEMES: ProjectTheme[] = [
  // 1. TMR AI Car Care (Vermilion / Copper)
  {
    primary: "#C9362B",
    secondary: "#F19A68",
    deep: "#42100F",
    sheen: "#F8D7BD",
    textColor: "#FFF8F5",
    textMuted: "rgba(255, 248, 245, 0.82)",
    linkColor: "#F8D7BD",
  },
  // 2. Saraswati Driving School (Cobalt / Electric Blue)
  {
    primary: "#3047E8",
    secondary: "#68BDEB",
    deep: "#0F1A4E",
    sheen: "#D7E9FF",
    textColor: "#F4F8FF",
    textMuted: "rgba(244, 248, 255, 0.82)",
    linkColor: "#8EC8FF",
  },
  // 3. MNESA (Violet / Electric Purple)
  {
    primary: "#7438D8",
    secondary: "#B58AF0",
    deep: "#230E48",
    sheen: "#E4D5FF",
    textColor: "#FAF6FF",
    textMuted: "rgba(250, 246, 255, 0.82)",
    linkColor: "#D4B8FF",
  },
  // 4. NeuroMove (Jade / Emerald Green)
  {
    primary: "#078567",
    secondary: "#56CDAA",
    deep: "#063028",
    sheen: "#C7F0E2",
    textColor: "#F0FDF8",
    textMuted: "rgba(240, 253, 248, 0.82)",
    linkColor: "#7AEAC7",
  },
];

export interface WorksWheelHandle {
  setTurn: (val: number) => void;
  to: (next: number) => void;
  snapTo: (next: number) => void;
  getTurn: () => number;
}

export interface WorksWheelProps extends Omit<
  React.ComponentPropsWithoutRef<"section">,
  "children"
> {
  items: WorksWheelItem[];
  /** Sits in the middle of the ring at rest. @default "Selected Work" */
  label?: string;
  /** Dynamic color theme for typography and atmosphere */
  theme?: ProjectTheme;
  /** Callback fired when the active project index changes. */
  onActiveChange?: (index: number) => void;
  /** Callback fired whenever the wheel turn value updates (for curios sync) */
  onTurnChange?: (turn: number) => void;
  /** Optional callback fired when an off-front card is clicked or navigated to */
  onSelectProject?: (index: number) => void;
  /** Optional callback fired when dragging vertically on the stage */
  onDragScroll?: (deltaY: number) => void;
  /** Whether the wheel is controlled externally by ScrollTrigger */
  controlled?: boolean;
}

/* Sizing and geometry calibrated for large circular catalogue and large right-side drum presentation */
const CARD_RATIO = 1.45; // card width / height
const STEP = 38; // degrees between cards on the drum
const DRUM = 2.22; // drum radius, in card heights
const LENS = 2.7; // perspective distance
const BOW = 1.82; // arc bow offset
const CULL = 1.6; // cull cards far behind perspective

/** How much of a wheel-notch or a dragged pixel counts as one item. */
const WHEEL_UNITS = 900;
const DRAG_UNITS = 420;
/** Quiet time after the last wheel event before the standalone wheel settles on an item. */
const SETTLE = 140;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Stage = { w: number; h: number };

const rad = (deg: number) => (deg * Math.PI) / 180;

/** How far left the arc has carried something that has turned `drumDeg` off the front. */
const bowAt = (drumDeg: number, bow: number) =>
  -bow * (1 - Math.cos(rad(drumDeg)));

/** Places each card in 3D space across wide oval (m=0) and 3D perspective drum (m=1) states without distorting card aspect ratios. */
function placeOval(
  ringDeg: number,
  drumDeg: number,
  ringRx: number,
  ringRy: number,
  drumR: number,
  bow: number,
  drumShiftX: number,
  drumShiftY: number,
  scale: number,
  m: number,
) {
  // 1. Ring (m = 0): Wide horizontal ellipse
  const rRad = rad(ringDeg);
  const ringX = ringRx * Math.sin(rRad);
  const ringY = -ringRy * Math.cos(rRad);
  // Restrained radial tilt around Z (max +/- 8 deg), never inverted upside down
  const ringRotZ = Math.sin(rRad) * 8;

  // 2. Drum (m = 1): 3D Cylinder on the right
  const dRad = rad(drumDeg);
  const drumX = drumShiftX - bow * (1 - Math.cos(dRad));
  const drumY = drumShiftY - drumR * Math.sin(dRad);
  const drumZ = drumR * (Math.cos(dRad) - 1);
  const drumRotX = drumDeg;

  // 3. Smooth continuous interpolation between oval and drum
  const curX = lerp(ringX, drumX, m);
  const curY = lerp(ringY, drumY, m);
  const curZ = lerp(0, drumZ, m);
  const curRotZ = (1 - m) * ringRotZ;
  const curRotX = m * drumRotX;

  return `translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, ${curZ.toFixed(2)}px) rotateZ(${curRotZ.toFixed(2)}deg) rotateX(${curRotX.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
}

function InteractiveCardArtwork({
  src,
  alt,
  href,
}: {
  src: string;
  alt: string;
  href?: string;
}) {
  const containerRef = React.useRef<HTMLSpanElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const sheenRef = React.useRef<HTMLSpanElement>(null);

  const handlePointerMove = (e: React.PointerEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;

    if (imgRef.current) {
      imgRef.current.style.transform = `translate3d(${nx * 8}px, ${ny * 8}px, 0) scale(1.05)`;
    }
    if (sheenRef.current) {
      sheenRef.current.style.opacity = "1";
      sheenRef.current.style.background = `radial-gradient(circle at ${(nx + 0.5) * 100}% ${(ny + 0.5) * 100}%, rgba(255,255,255,0.32) 0%, rgba(54,43,235,0.10) 38%, transparent 68%)`;
    }
  };

  const handlePointerLeave = () => {
    if (imgRef.current) {
      imgRef.current.style.transform = "translate3d(0, 0, 0) scale(1.0)";
    }
    if (sheenRef.current) {
      sheenRef.current.style.opacity = "0";
    }
  };

  return (
    <span
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative block size-full overflow-hidden rounded-2xl shadow-[0_20px_45px_-10px_rgba(11,11,16,0.18)] border border-black/[0.08] bg-white/40 backdrop-blur-sm transition-all duration-300 group-hover:border-[#362beb]/50 group-hover:shadow-[0_25px_50px_-10px_rgba(54,43,235,0.25)]"
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        draggable={false}
        className="size-full object-cover transition-transform duration-300 ease-out will-change-transform"
        loading="eager"
      />
      {/* Subtle fluid pearlescent reflection sheen */}
      <span
        ref={sheenRef}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 ease-out"
        aria-hidden="true"
      />
      {/* Subtle live destination indicator on front card */}
      {href?.startsWith("http") && (
        <span className="pointer-events-none absolute right-3.5 bottom-3.5 flex translate-y-1 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium opacity-0 backdrop-blur-md transition group-hover:translate-y-0 group-hover:opacity-100 shadow-sm bg-white/95 text-[#0b0b10] border border-black/10">
          <svg
            viewBox="0 0 12 12"
            className="size-2.5 text-[#362beb]"
            aria-hidden="true"
          >
            <path
              d="M3 9 9 3M4 3h5v5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Live Platform
        </span>
      )}
    </span>
  );
}

export const WorksWheel = React.forwardRef<WorksWheelHandle, WorksWheelProps>(
  function WorksWheel(
    {
      items,
      label = "Selected Work",
      theme,
      onActiveChange,
      onTurnChange,
      onSelectProject,
      onDragScroll,
      controlled = false,
      className,
      ...props
    },
    ref,
  ) {
    const stageRef = React.useRef<HTMLDivElement>(null);
    const wheelRef = React.useRef<HTMLDivElement>(null);
    const cardRefs = React.useRef<(HTMLElement | null)[]>([]);
    const labelRef = React.useRef<HTMLDivElement>(null);
    const leftPanelRef = React.useRef<HTMLDivElement>(null);

    // The wheel's position and target
    const turn = React.useRef(0);
    const target = React.useRef(0);
    const activeRef = React.useRef(0);
    const [active, setActive] = React.useState(0);
    const [stage, setStage] = React.useState<Stage>({ w: 0, h: 0 });

    const activeTheme =
      theme ??
      (active < PROJECT_THEMES.length
        ? PROJECT_THEMES[active]
        : LIGHT_OVAL_THEME);

    const count = items.length;
    const last = Math.max(count - 1, 0);

    // Reduced motion preference
    const [reduced, setReduced] = React.useState(false);
    React.useEffect(() => {
      const query = window.matchMedia("(prefers-reduced-motion: reduce)");
      const read = () => setReduced(query.matches);
      read();
      query.addEventListener("change", read);
      return () => query.removeEventListener("change", read);
    }, []);

    // Measure stage on resize
    React.useEffect(() => {
      const el = stageRef.current;
      if (!el) return;
      const read = () => setStage({ w: el.clientWidth, h: el.clientHeight });
      read();
      const ro = new ResizeObserver(read);
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    // Geometry calculations: Wide horizontal oval (82-88% width, 58-66% height) + large right drum thumbnail (44% width)
    const metrics = React.useMemo(() => {
      const { w, h } = stage;
      if (!h || !w) {
        return {
          cardW: 420,
          cardH: 290,
          ringRx: 450,
          ringRy: 180,
          ringScale: 0.50,
          drumR: 500,
          bow: 380,
          depth: 650,
          drumShiftX: 0,
          drumShiftY: 0,
          isDesktop: true,
        };
      }

      const isDesktop = w >= 1024;
      const isTablet = w >= 768 && w < 1024;
      const isMobile = w < 768;

      // Drum mode thumbnail size:
      // Desktop: 42-46% viewport width, 48-56% viewport height
      // Tablet: 48-54% viewport width
      // Mobile: 82-86% viewport width
      const cardW = isDesktop
        ? Math.min(w * 0.44, h * 0.54 * CARD_RATIO)
        : isTablet
        ? Math.min(w * 0.52, h * 0.46 * CARD_RATIO)
        : Math.min(w * 0.84, 340);

      const cardH = cardW / CARD_RATIO;

      // In drum mode, shift the drum to the right on desktop/tablet to create the 2-column layout
      const drumShiftX = isDesktop ? w * 0.22 : isTablet ? w * 0.20 : 0;
      const drumShiftY = isMobile ? -h * 0.12 : 0;

      // In oval mode (m = 0):
      // Desktop target footprint: 82-88% width, 58-66% height
      // Tablet target footprint: 84-88% width, 58-64% height
      // Mobile target footprint: 86-90% width, 50-56% height
      const targetRingW = isMobile
        ? Math.min(w * 0.88, 360)
        : isTablet
        ? w * 0.86
        : w * 0.85;

      const targetRingH = isMobile
        ? Math.min(h * 0.54, 440)
        : isTablet
        ? h * 0.62
        : h * 0.62;

      // Card scale inside oval mode (undistorted aspect ratio)
      const ringScale = isMobile ? 0.48 : isTablet ? 0.44 : 0.42;
      const visualCardW = cardW * ringScale;
      const visualCardH = cardH * ringScale;

      // Elliptical horizontal and vertical radii:
      const ringRx = Math.max(10, (targetRingW - visualCardW) / 2);
      const ringRy = Math.max(10, (targetRingH - visualCardH) / 2);

      const drumR = cardH * DRUM;
      const bow = cardH * BOW;
      const depth = cardH * LENS;

      return {
        cardW,
        cardH,
        ringRx,
        ringRy,
        ringScale,
        drumR,
        bow,
        depth,
        drumShiftX,
        drumShiftY,
        isDesktop,
      };
    }, [stage, count]);

    // Demand-driven rAF loop: sleeps when settled, wakes when turning
    const isAnimating = React.useRef(false);
    const animFrame = React.useRef(0);

    const renderScene = React.useCallback(() => {
      const { ringRx, ringRy, ringScale, drumR, bow, drumShiftX, drumShiftY } = metrics;
      const t = turn.current;
      const m = clamp(t, 0, 1);
      const pos = Math.max(0, t - 1);
      const curScale = lerp(ringScale, 1, m);

      if (wheelRef.current) {
        wheelRef.current.style.transform = "translate3d(0, 0, 0)";
      }

      for (let i = 0; i < count; i++) {
        const d = i - pos;
        const drumDeg = d * STEP;
        const card = cardRefs.current[i];
        if (card) {
          card.style.transform = placeOval(
            i * (360 / count),
            drumDeg,
            ringRx,
            ringRy,
            drumR,
            bow,
            drumShiftX,
            drumShiftY,
            curScale,
            m,
          );

          // Card opacity rule:
          // Front card (dist <= 0.45) is always fully visible (dominant presentation).
          // Off-front cards (dist > 0.45) are fully visible in the resting oval (m=0),
          // recede into perspective as the ring opens (m -> 0.4), and on the drum (m=1)
          // only appear when transitioning nearby (dist < 0.85).
          const dist = Math.abs(d);
          let cardOpacity = 0;
          if (dist <= 0.45) {
            cardOpacity = 1;
          } else {
            const ovalFade = Math.max(0, 1 - m * 2.5);
            let drumFade = 0;
            if (dist < 0.85) {
              const f = (0.85 - dist) / 0.40;
              drumFade = f * f;
            }
            cardOpacity = lerp(ovalFade, drumFade, m);
          }

          card.style.opacity = cardOpacity.toFixed(3);
          card.style.zIndex = String(Math.round(100 - dist * 10));
          card.style.pointerEvents = (m > 0.7 && dist > 0.45) || cardOpacity < 0.05 ? "none" : "auto";
        }
      }

      // Central label fades away as drum opens
      if (labelRef.current) {
        labelRef.current.style.opacity = String(Math.max(0, 1 - m * 2.2));
      }
      // Left text panel fades in as drum opens, with subtle sync during project changes
      if (leftPanelRef.current) {
        const morphFade = Math.max(0, (m - 0.20) / 0.80);
        const projectDistFromInt = Math.abs(pos - Math.round(pos));
        const projectFade = m > 0.8 ? Math.max(0.15, 1 - projectDistFromInt * 1.8) : 1;
        leftPanelRef.current.style.opacity = (morphFade * projectFade).toFixed(3);
      }

      const near = clamp(Math.round(pos), 0, last);
      if (near !== activeRef.current) {
        activeRef.current = near;
        setActive(near);
        onActiveChange?.(near);
      }
      onTurnChange?.(t);
    }, [metrics, count, last, onActiveChange, onTurnChange]);

    const renderSceneRef = React.useRef(renderScene);
    renderSceneRef.current = renderScene;

    const wakeLoop = React.useCallback(() => {
      if (isAnimating.current) return;
      isAnimating.current = true;

      let lastTime = performance.now();
      const step = (now: number) => {
        const dt = Math.min(0.08, (now - lastTime) / 1000);
        lastTime = now;

        const gap = target.current - turn.current;
        if (Math.abs(gap) < 0.002) {
          turn.current = target.current;
        } else {
          // Frame-rate independent exponential smoothing across 60Hz - 120Hz
          const alpha = 1 - Math.exp(-14 * dt);
          turn.current += gap * (reduced ? 1 : alpha);
        }

        renderSceneRef.current();

        if (Math.abs(target.current - turn.current) < 0.002) {
          turn.current = target.current;
          renderSceneRef.current();
          isAnimating.current = false;
          return;
        }

        animFrame.current = requestAnimationFrame(step);
      };

      animFrame.current = requestAnimationFrame(step);
    }, [reduced]);

    const to = React.useCallback(
      (next: number) => {
        target.current = clamp(next, 0, last + 1);
        wakeLoop();
      },
      [last, wakeLoop],
    );

    const setTurn = React.useCallback(
      (val: number) => {
        const clamped = clamp(val, 0, last + 1);
        turn.current = clamped;
        target.current = clamped;
        renderSceneRef.current();
      },
      [last],
    );

    // Expose imperative API through ref and on DOM element for tests
    React.useImperativeHandle(
      ref,
      () => ({
        setTurn,
        to,
        snapTo: (next: number) => setTurn(next),
        getTurn: () => turn.current,
      }),
      [setTurn, to],
    );

    React.useEffect(() => {
      if (stageRef.current) {
        (stageRef.current as any)._worksWheel = {
          turn,
          target,
          to,
          snapTo: (next: number) => setTurn(next),
          setTurn,
          getTurn: () => turn.current,
        };
      }
    });

    // Initial draw & re-render on stage metrics update
    React.useEffect(() => {
      if (!stage.h) return;
      renderScene();
      return () => {
        if (animFrame.current) cancelAnimationFrame(animFrame.current);
        isAnimating.current = false;
      };
    }, [stage.h, renderScene]);

    // Standalone native wheel listener (ONLY active when NOT controlled by ScrollTrigger)
    React.useEffect(() => {
      if (controlled) return;
      const el = stageRef.current;
      if (!el) return;

      const settling = { id: 0 };
      const onWheel = (event: WheelEvent) => {
        const rect = el.getBoundingClientRect();
        if (rect.top > 10 && event.deltaY > 0) return;
        if (rect.bottom < window.innerHeight - 10 && event.deltaY < 0) return;

        const next = target.current + event.deltaY / WHEEL_UNITS;
        const isTrapped = next > 0 && next < last + 1;

        if (isTrapped) {
          event.preventDefault();
        }

        to(next);

        window.clearTimeout(settling.id);
        settling.id = window.setTimeout(() => {
          // Never prematurely snap between 0 and 1 (preserves intermediate ring-to-drum progress)
          if (target.current > 1.0) {
            to(Math.round(target.current));
          }
        }, SETTLE);
      };

      el.addEventListener("wheel", onWheel, { passive: false });
      return () => {
        el.removeEventListener("wheel", onWheel);
        window.clearTimeout(settling.id);
      };
    }, [controlled, to, last]);

    // Pointer drag vs click separation (>7px = drag, <=7px = click)
    const drag = React.useRef<number | null>(null);
    const pointerStart = React.useRef<{ x: number; y: number } | null>(null);
    const isDragging = React.useRef(false);
    const capturedPointerId = React.useRef<number | null>(null);

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      pointerStart.current = { x: event.clientX, y: event.clientY };
      drag.current = event.clientY;
      isDragging.current = false;
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      if (drag.current === null || !pointerStart.current) return;
      const dx = event.clientX - pointerStart.current.x;
      const dy = event.clientY - pointerStart.current.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 7) {
        if (!isDragging.current) {
          isDragging.current = true;
          try {
            event.currentTarget.setPointerCapture(event.pointerId);
            capturedPointerId.current = event.pointerId;
          } catch (_) {}
        }
      }

      if (isDragging.current) {
        const deltaY = drag.current - event.clientY;
        drag.current = event.clientY;
        if (onDragScroll) {
          onDragScroll(deltaY);
        } else {
          to(target.current + deltaY / DRAG_UNITS);
        }
      }
    };

    const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
      if (capturedPointerId.current !== null) {
        try {
          event.currentTarget.releasePointerCapture(capturedPointerId.current);
        } catch (_) {}
        capturedPointerId.current = null;
      }
      drag.current = null;
      pointerStart.current = null;

      if (isDragging.current) {
        if (!controlled && target.current > 1) {
          to(Math.round(target.current));
        }
        setTimeout(() => {
          isDragging.current = false;
        }, 50);
      }
    };

    const handleCardClick = (
      e: React.MouseEvent,
      index: number,
      item: WorksWheelItem,
    ) => {
      if (isDragging.current) {
        e.preventDefault();
        return;
      }

      // Clicking an off-front card smoothly navigates to it
      if (index !== active) {
        e.preventDefault();
        if (onSelectProject) {
          onSelectProject(index);
        } else {
          to(index + 1);
        }
        return;
      }

      // Active front card: genuine client project opens in new tab
      if (item.href?.startsWith("http")) {
        e.preventDefault();
        window.open(item.href, "_blank", "noopener,noreferrer");
      } else {
        // Concept card: do not navigate away
        e.preventDefault();
      }
    };

    return (
      <section
        aria-label={label}
        className={cn(
          "relative h-full min-h-full w-full overflow-hidden select-none",
          className,
        )}
        {...props}
      >
        <div
          ref={stageRef}
          tabIndex={0}
          role="listbox"
          aria-label={label}
          aria-activedescendant={`works-wheel-${active}`}
          className="focus-visible:outline-current absolute inset-0 cursor-grab touch-pan-y outline-none focus-visible:outline-2 focus-visible:-outline-offset-4 active:cursor-grabbing"
          style={{ perspective: `${metrics.depth}px` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              if (onSelectProject) onSelectProject(Math.min(active + 1, last));
              else to(Math.round(target.current) + 1);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              if (onSelectProject) onSelectProject(Math.max(active - 1, 0));
              else to(Math.round(target.current) - 1);
            }
          }}
        >
          <div
            ref={wheelRef}
            className="absolute top-1/2 left-1/2 [transform-style:preserve-3d]"
          >
            {items.map((item, i) => {
              const isCurrent = i === active;
              return (
                <div
                  key={item.title}
                  id={`works-wheel-${i}`}
                  role="option"
                  aria-selected={isCurrent}
                  ref={(node: HTMLElement | null) => {
                    cardRefs.current[i] = node;
                  }}
                  onClick={(e) => handleCardClick(e, i, item)}
                  className="group absolute [backface-visibility:hidden] cursor-pointer"
                  style={{
                    width: metrics.cardW,
                    height: metrics.cardH,
                    marginLeft: -metrics.cardW / 2,
                    marginTop: -metrics.cardH / 2,
                  }}
                >
                  <InteractiveCardArtwork
                    src={item.image}
                    alt={item.title}
                    href={item.href}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Minimal Central Label: "Selected Work" (visible at rest when turn === 0) */}
        <div
          ref={labelRef}
          className="pointer-events-none absolute inset-0 grid place-items-center select-none z-10"
        >
          <span
            data-testid="works-wheel-center-label"
            className="font-sans font-semibold tracking-tight text-xl sm:text-2xl md:text-3xl transition-colors duration-300 ease-out"
            style={{ color: activeTheme.textColor }}
          >
            {label}
          </span>
        </div>

        {/* Left Column: Active Project Information in Drum Mode */}
        <div
          ref={leftPanelRef}
          className="pointer-events-none absolute top-1/2 left-[6%] sm:left-[8%] lg:left-[9%] -translate-y-1/2 max-w-[85vw] sm:max-w-[42vw] lg:max-w-[36vw] z-20 select-none"
          style={{ opacity: 0 }}
        >
          <h3
            className="font-sans font-bold tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.08] mb-4 transition-colors duration-300 ease-out"
            style={{ color: activeTheme.textColor }}
          >
            {items[active]?.title}
          </h3>
          <p
            className="font-sans text-sm sm:text-base lg:text-lg leading-relaxed mb-6 max-w-[32ch] sm:max-w-[38ch] transition-colors duration-300 ease-out"
            style={{ color: activeTheme.textMuted }}
          >
            {items[active]?.description}
          </p>
          {items[active]?.href?.startsWith("http") && (
            <div className="pointer-events-auto">
              <a
                href={items[active]?.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold transition-colors duration-300 ease-out group"
                style={{ color: activeTheme.linkColor }}
              >
                <span>Visit Platform</span>
                <span
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                >
                  ↗
                </span>
              </a>
            </div>
          )}
        </div>
      </section>
    );
  },
);

// 4 Genuine Ostrum Projects: 2 Verified Client Systems + 2 Original Studio Ventures
export const OSTRUM_WORKS: WorksWheelItem[] = [
  {
    title: "TMR AI Car Care",
    description:
      "Autonomous workflow and client intelligence platform built for high-precision luxury automotive detailing studios.",
    image: "/images/works/tmr-ai-car-care.jpg",
    href: "https://tmraicarcare.com/",
  },
  {
    title: "Saraswati Driving School",
    description:
      "Modern booking and fleet logistics infrastructure engineered for certified driver training and student dispatch.",
    image: "/images/works/saraswati-driving-school.jpg",
    href: "https://saraswati-driving-school.vercel.app/",
  },
  {
    title: "MNESA",
    description:
      "High-dimensional neural memory retrieval system enabling persistent context indexing across distributed intelligence nodes.",
    image: "/images/works/mnesa.jpg",
  },
  {
    title: "NeuroMove",
    description:
      "Biomechanical telemetry studio translating kinematic sensor streams into adaptive motor rehabilitation diagnostics.",
    image: "/images/works/neuromove.jpg",
  },
];

export function WorksWheelDemo() {
  return (
    <div className="w-full h-screen">
      <WorksWheel items={OSTRUM_WORKS} label="Selected Work" />
    </div>
  );
}

export default WorksWheel;
