"use client";

// A portfolio showcase built as a circular ring that opens into a large 3D perspective drum.
//
// At rest (turn = 0), the projects form a generous circular ring (68–74% viewport height)
// around a minimal, restrained central label ("Selected Work").
//
// As the user turns the wheel (turn >= 1), the ring transitions into a two-column drum:
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

export interface WorksWheelProps extends Omit<
  React.ComponentPropsWithoutRef<"section">,
  "children"
> {
  items: WorksWheelItem[];
  /** Sits in the middle of the ring at rest. @default "Selected Work" */
  label?: string;
  /** Callback fired when the active project index changes. */
  onActiveChange?: (index: number) => void;
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
/** Quiet time after the last wheel event before the wheel settles on an item. */
const SETTLE = 140;
/** Fraction of the remaining distance closed each frame. 1 = no smoothing. */
const EASE = 0.28;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Stage = { w: number; h: number };

const rad = (deg: number) => (deg * Math.PI) / 180;

/** How far left the arc has carried something that has turned `drumDeg` off the front. */
const bowAt = (drumDeg: number, bow: number) =>
  -bow * (1 - Math.cos(rad(drumDeg)));

/** Places each card in the 3D space across ring (m=0) and drum (m=1) states. */
function place(
  ringDeg: number,
  drumDeg: number,
  ringR: number,
  drumR: number,
  bow: number,
  m: number,
) {
  return (
    `translateX(${m * bowAt(drumDeg, bow)}px)` +
    ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
    ` rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`
  );
}

export function WorksWheel({
  items,
  label = "Selected Work",
  onActiveChange,
  className,
  ...props
}: WorksWheelProps) {
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

  // Geometry calculations: Large initial ring (71% viewport height) + large right drum thumbnail (44% width)
  const metrics = React.useMemo(() => {
    const { w, h } = stage;
    if (!h || !w) {
      return {
        cardW: 420,
        cardH: 290,
        ringR: 260,
        ringScale: 0.28,
        drumR: 500,
        bow: 380,
        depth: 650,
        drumShiftX: 0,
        isDesktop: true,
      };
    }

    const isDesktop = w >= 1024;
    const isTablet = w >= 768 && w < 1024;
    const isMobile = w < 768;

    // Drum mode thumbnail size:
    // Desktop: 42-46% viewport width, 48-56% viewport height
    // Tablet/Mobile: responsive width
    const cardW = isDesktop
      ? Math.min(w * 0.44, h * 0.54 * CARD_RATIO)
      : isTablet
      ? Math.min(w * 0.58, h * 0.48 * CARD_RATIO)
      : Math.min(w * 0.82, 340);

    const cardH = cardW / CARD_RATIO;

    // In drum mode, shift the drum to the right on desktop to create a 2-column layout
    const drumShiftX = isDesktop ? w * 0.20 : 0;

    // In ring mode (m = 0), target total ring height footprint: 70-72% of viewport height
    const targetRingH = isMobile
      ? Math.min(h * 0.56, w * 0.88)
      : isTablet
      ? h * 0.66
      : h * 0.71;

    // Card scale inside ring mode
    const ringScale = isMobile ? 0.36 : isTablet ? 0.32 : 0.28;
    const visualCardH = cardH * ringScale;

    // Ring radius calibrated so outer card bounds equal targetRingH
    const ringR = Math.max(10, (targetRingH - visualCardH) / 2);

    const drumR = cardH * DRUM;
    const bow = cardH * BOW;
    const depth = cardH * LENS;

    return {
      cardW,
      cardH,
      ringR,
      ringScale,
      drumR,
      bow,
      depth,
      drumShiftX,
      isDesktop,
    };
  }, [stage, count]);

  // Demand-driven rAF loop: sleeps when settled, wakes when turning
  const isAnimating = React.useRef(false);
  const animFrame = React.useRef(0);

  const renderScene = React.useCallback(() => {
    const { ringR, ringScale, drumR, bow, drumShiftX } = metrics;
    const t = turn.current;
    const m = clamp(t, 0, 1);
    const pos = Math.max(0, t - 1);

    // Drum shifts toward the right as it opens, making space for the left text column
    if (wheelRef.current) {
      wheelRef.current.style.transform = `translateX(${m * drumShiftX}px) translateZ(${-m * drumR}px)`;
    }

    for (let i = 0; i < count; i++) {
      const d = i - pos;
      const drumDeg = d * STEP;
      const card = cardRefs.current[i];
      if (card) {
        card.style.transform = place(
          d * (360 / count),
          drumDeg,
          ringR,
          drumR,
          bow,
          m,
        );
        card.style.opacity = m > 0.5 && Math.abs(d) > CULL ? "0" : "1";
        card.style.zIndex = String(Math.round(100 - Math.abs(d) * 2));
      }
      const face = card?.firstElementChild as HTMLElement | null;
      if (face) face.style.transform = `scale(${lerp(ringScale, 1, m)})`;
    }

    // Central label fades away as drum opens
    if (labelRef.current) {
      labelRef.current.style.opacity = String(Math.max(0, 1 - m * 2.2));
    }
    // Left text panel fades in smoothly
    if (leftPanelRef.current) {
      leftPanelRef.current.style.opacity = String(Math.max(0, (m - 0.15) / 0.85));
    }

    const near = clamp(Math.round(pos), 0, last);
    if (near !== activeRef.current) {
      activeRef.current = near;
      setActive(near);
      onActiveChange?.(near);
    }
  }, [metrics, count, last, onActiveChange]);

  const renderSceneRef = React.useRef(renderScene);
  renderSceneRef.current = renderScene;

  const wakeLoop = React.useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const step = () => {
      const gap = target.current - turn.current;
      if (Math.abs(gap) < 0.003) {
        turn.current = target.current;
      } else {
        turn.current += gap * (reduced ? 1 : EASE);
      }

      renderSceneRef.current();

      if (Math.abs(target.current - turn.current) < 0.003) {
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

  // Expose imperative wheel controls on stage DOM element for tests & external drivers
  React.useEffect(() => {
    if (stageRef.current) {
      (stageRef.current as any)._worksWheel = {
        turn,
        target,
        to,
        snapTo: (next: number) => {
          const val = clamp(next, 0, last + 1);
          target.current = val;
          turn.current = val;
          renderSceneRef.current();
        },
      };
    }
  });

  // Initial draw & re-render on stage metrics update
  React.useEffect(() => {
    if (!stage.h) return;
    renderScene();
    wakeLoop();
    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
      isAnimating.current = false;
    };
  }, [stage.h, renderScene, wakeLoop]);

  // Native wheel listener with natural scroll continuation at boundaries
  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      const rect = el.getBoundingClientRect();

      // If scrolling into view from below or above, let the page scroll naturally
      if (rect.top > 10 && event.deltaY > 0) {
        el.removeAttribute("data-lenis-prevent");
        return;
      }
      if (rect.bottom < window.innerHeight - 10 && event.deltaY < 0) {
        el.removeAttribute("data-lenis-prevent");
        return;
      }

      const next = target.current + event.deltaY / WHEEL_UNITS;
      const isTrapped = next > 0 && next < last + 1;

      if (isTrapped) {
        event.preventDefault();
        el.setAttribute("data-lenis-prevent", "true");
      } else {
        el.removeAttribute("data-lenis-prevent");
      }

      to(next);

      window.clearTimeout(settling.current);
      settling.current = window.setTimeout(() => {
        to(Math.round(target.current));
        if (target.current <= 0 || target.current >= last + 1) {
          el.removeAttribute("data-lenis-prevent");
        }
      }, SETTLE);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(settling.current);
    };
  }, [to, last]);

  // Pointer drag vs click separation (>7px = drag, <=7px = click)
  const drag = React.useRef<number | null>(null);
  const pointerStart = React.useRef<{ x: number; y: number } | null>(null);
  const isDragging = React.useRef(false);
  const capturedPointerId = React.useRef<number | null>(null);
  const settling = React.useRef(0);

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
      to(target.current + (drag.current - event.clientY) / DRAG_UNITS);
      drag.current = event.clientY;
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
      if (target.current > 1) to(Math.round(target.current));
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

    // Clicking an off-front card smoothly brings it to front
    if (index !== active) {
      e.preventDefault();
      to(index + 1);
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
        "relative h-full min-h-[24rem] w-full overflow-hidden select-none",
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
        className="focus-visible:outline-current absolute inset-0 cursor-grab touch-pan-x outline-none focus-visible:outline-2 focus-visible:-outline-offset-4 active:cursor-grabbing"
        style={{ perspective: `${metrics.depth}px` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") to(Math.round(target.current) + 1);
          else if (event.key === "ArrowUp") to(Math.round(target.current) - 1);
          else return;
          event.preventDefault();
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
                <span className="relative block size-full overflow-hidden rounded-2xl shadow-[0_24px_50px_-12px_rgba(0,0,0,0.55)] border border-white/10 bg-black/40 transition-all duration-300 group-hover:border-[#d1001c]/40 group-hover:shadow-[0_25px_50px_-12px_rgba(209,0,28,0.25)]">
                  <img
                    src={item.image}
                    alt={item.title}
                    draggable={false}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="eager"
                  />
                  {/* Subtle live destination indicator on front card */}
                  {item.href?.startsWith("http") && (
                    <span className="pointer-events-none absolute right-3.5 bottom-3.5 flex translate-y-1 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium opacity-0 backdrop-blur-md transition group-hover:translate-y-0 group-hover:opacity-100 shadow-sm bg-black/80 text-white border border-white/15">
                      <svg
                        viewBox="0 0 12 12"
                        className="size-2.5 text-[#d1001c]"
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
        <span className="font-sans font-semibold tracking-tight text-xl sm:text-2xl md:text-3xl text-white/90">
          {label}
        </span>
      </div>

      {/* Left Column: Active Project Information in Drum Mode */}
      <div
        ref={leftPanelRef}
        className="pointer-events-none absolute top-1/2 left-[6%] sm:left-[8%] lg:left-[9%] -translate-y-1/2 max-w-[85vw] sm:max-w-[42vw] lg:max-w-[36vw] z-20 select-none"
        style={{ opacity: 0 }}
      >
        <h3 className="font-sans font-bold tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-[1.08] mb-4">
          {items[active]?.title}
        </h3>
        <p className="font-sans text-sm sm:text-base lg:text-lg text-white/75 leading-relaxed mb-6 max-w-[32ch] sm:max-w-[38ch]">
          {items[active]?.description}
        </p>
        {items[active]?.href?.startsWith("http") && (
          <div className="pointer-events-auto">
            <a
              href={items[active]?.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-[#d1001c] hover:text-white transition-colors group"
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
}

// 9 Bespoke Ostrum Projects: 2 Verified Client Systems + 7 Studio Concept Explorations
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
    title: "Signal",
    description:
      "Decentralized real-time market telemetry and quantitative data streaming engine for autonomous trading protocols.",
    image: "/images/works/signal.jpg",
    href: "#signal",
  },
  {
    title: "Atlas",
    description:
      "Spatial ledger and geographic information platform coordinating urban logistics and infrastructure deployment.",
    image: "/images/works/atlas.jpg",
    href: "#atlas",
  },
  {
    title: "MNESA",
    description:
      "High-dimensional neural memory retrieval system enabling persistent context indexing across distributed intelligence nodes.",
    image: "/images/works/mnesa.jpg",
    href: "#mnesa",
  },
  {
    title: "NeuroMove",
    description:
      "Biomechanical telemetry studio translating kinematic sensor streams into adaptive motor rehabilitation diagnostics.",
    image: "/images/works/neuromove.jpg",
    href: "#neuromove",
  },
  {
    title: "Form",
    description:
      "Parametric digital synthesis workspace uniting generative geometry, material constraints and industrial tooling pipelines.",
    image: "/images/works/form.jpg",
    href: "#form",
  },
  {
    title: "Orbit",
    description:
      "Distributed edge computing protocol managing synchronized state validation across autonomous physical devices.",
    image: "/images/works/orbit.jpg",
    href: "#orbit",
  },
  {
    title: "Origin",
    description:
      "Algorithmic venture formulation framework transforming high-entropy market opportunities into production-ready software ventures.",
    image: "/images/works/origin.jpg",
    href: "#origin",
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
