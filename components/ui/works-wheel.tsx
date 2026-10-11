"use client";

// A portfolio index built as a wheel you turn.
//
// At rest the work sits in a ring around a title, each card tangent to the
// circle. The first notch of scroll blows the ring open into a vertical drum:
// the card at the front lies flat and full size, the ones above and below
// rotate away into hard perspective and run off the top and bottom of the
// frame. Keep turning and the drum carries the next piece round to the front.
//
// The whole thing is one number - `turn` - read by a single demand-driven rAF
// loop that writes transforms straight to the DOM. 0 is the ring, 1 is the drum
// with item 0 at the front, and every whole number after that is one more item.
import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProjectTheme {
  bg: string;
  text: string;
  subtext: string;
  accent: string;
  badgeBg: string;
  badgeText: string;
}

export interface WorksWheelItem {
  /** Project name. Shown beside the front card and in the index. */
  title: string;
  /** Short category / capability descriptor */
  category: string;
  /** Cover art. Local path under /images/works/ or remote URL */
  image: string;
  /** Where the card links to. Real HTTPS URL or anchor */
  href?: string;
  /** Whether the project is an experimental studio concept */
  isConcept?: boolean;
  /** Bespoke pastel theme for this project */
  theme: ProjectTheme;
}

export interface WorksWheelProps extends Omit<
  React.ComponentPropsWithoutRef<"section">,
  "children"
> {
  items: WorksWheelItem[];
  /** Sits in the middle of the ring. @default "OSTRUM / WORKS" */
  label?: string;
  /** Label on the card's hover affordance. @default "View" */
  action?: string;
  /** Callback fired when the active project index changes */
  onActiveChange?: (index: number) => void;
  /** Active project theme passed down for styling labels and indexes */
  activeTheme?: ProjectTheme;
}

/* Sizing and geometry calibrated so ring occupies 65-70% of viewport height at rest,
   leaving 15-18% breathing room above and below to prevent clipping. */
const CARD_H = 0.24; // front card height, ratio of stage height (desktop)
const CARD_MAX_W = 0.22; // max width ratio of stage width (desktop)
const CARD_RATIO = 1.45; // card width / height
const STEP = 40; // degrees between cards on the drum
const DRUM = 2.22; // drum radius, in card heights
const LENS = 2.7; // perspective distance
const RING_R = 1.14; // ring radius
const BOW = 1.82; // arc bow offset
const CULL = 1.6; // cull cards far behind perspective

/** How much of a wheel-notch or a dragged pixel counts as one item. */
const WHEEL_UNITS = 900;
const DRAG_UNITS = 420;
/** Quiet time after the last wheel event before the wheel settles on an item. */
const SETTLE = 140;
/** Fraction of the remaining distance closed each frame. 1 = no smoothing. */
const EASE = 0.12;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Stage = { w: number; h: number };

const rad = (deg: number) => (deg * Math.PI) / 180;

/** How far left the arc has carried something that has turned `drumDeg` off the
    front. Zero at the front, so the piece being read stays centred. */
const bowAt = (drumDeg: number, bow: number) =>
  -bow * (1 - Math.cos(rad(drumDeg)));

/** Both states in one chain: the ring terms fall away as `m` reaches the drum,
    and the drum terms are still zero while the ring is up. */
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
  label = "OSTRUM / WORKS",
  action = "View",
  onActiveChange,
  activeTheme,
  className,
  ...props
}: WorksWheelProps) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const wheelRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLElement | null)[]>([]);
  const labelRef = React.useRef<HTMLDivElement>(null);
  const titleRef = React.useRef<HTMLDivElement>(null);

  // The wheel's position, and where it is heading. Only `active` is state -
  // everything else is written to the DOM, so turning the wheel is not a render.
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
    (el as any)._worksWheel = { turn, target, to };
    const read = () => setStage({ w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const metrics = React.useMemo(() => {
    const { w, h } = stage;
    if (!h || !w) {
      return {
        cardW: 280,
        cardH: 193,
        ringR: 220,
        ringScale: 0.5,
        drumR: 430,
        bow: 350,
        depth: 520,
        title: 32,
        index: 14,
      };
    }
    const isMob = w < 768;
    // Sizing calibrated so ring occupies 65-70% of viewport height at rest
    const cardH = isMob
      ? Math.min(h * 0.20, 160)
      : Math.min(h * CARD_H, (w * CARD_MAX_W) / CARD_RATIO);
    const cardW = cardH * CARD_RATIO;
    const drumR = cardH * DRUM;
    const ringR = cardH * RING_R;
    const ringScale = count
      ? clamp((((2 * Math.PI * ringR) / count) * 0.82) / (cardW || 1), 0.22, 1)
      : 1;

    return {
      cardW,
      cardH,
      ringR,
      ringScale,
      drumR,
      bow: cardH * BOW,
      depth: cardH * LENS,
      title: Math.max(18, Math.min(44, cardH * 0.16)),
      index: Math.max(11, Math.min(15, cardH * 0.065)),
    };
  }, [stage, count]);

  // Demand-driven rAF loop: sleeps when settled, wakes when target changes
  const isAnimating = React.useRef(false);
  const animFrame = React.useRef(0);

  const renderScene = React.useCallback(() => {
    const { ringR, ringScale, drumR, bow } = metrics;
    const t = turn.current;
    const m = clamp(t, 0, 1);
    const pos = Math.max(0, t - 1);

    if (wheelRef.current) {
      wheelRef.current.style.transform = `translateZ(${-m * drumR}px)`;
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

    if (labelRef.current) labelRef.current.style.opacity = String(1 - m);
    if (titleRef.current) titleRef.current.style.opacity = String(m);

    const near = clamp(Math.round(pos), 0, last);
    if (near !== activeRef.current) {
      activeRef.current = near;
      setActive(near);
      onActiveChange?.(near);
    }
  }, [metrics, count, last, onActiveChange]);

  const wakeLoop = React.useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const step = () => {
      const gap = target.current - turn.current;
      if (Math.abs(gap) < 0.0005) {
        turn.current = target.current;
      } else {
        turn.current += gap * (reduced ? 1 : EASE);
      }

      renderScene();

      if (Math.abs(target.current - turn.current) < 0.0005) {
        turn.current = target.current;
        renderScene();
        isAnimating.current = false;
        return;
      }

      animFrame.current = requestAnimationFrame(step);
    };

    animFrame.current = requestAnimationFrame(step);
  }, [reduced, renderScene]);

  const to = React.useCallback(
    (next: number) => {
      target.current = clamp(next, 0, last + 1);
      const targetPos = Math.max(0, target.current - 1);
      const targetNear = clamp(Math.round(targetPos), 0, last);
      if (targetNear !== activeRef.current) {
        activeRef.current = targetNear;
        setActive(targetNear);
        onActiveChange?.(targetNear);
      }
      wakeLoop();
    },
    [last, wakeLoop, onActiveChange],
  );

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

  // Native wheel listener with natural scroll continuation
  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      const rect = el.getBoundingClientRect();

      // If the section is scrolling into view from below, let the page scroll
      if (rect.top > 10 && event.deltaY > 0) {
        el.removeAttribute("data-lenis-prevent");
        return;
      }
      // If at bottom and scrolling up into view, let the page scroll
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
      // Land cleanly on an item
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

    // Clicking an off-front card rotates it to the front
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

  const currentTheme = items[active]?.theme || activeTheme;

  return (
    <section
      aria-label={label}
      className={cn(
        "relative h-full min-h-[24rem] w-full overflow-hidden select-none transition-colors duration-700 ease-out",
        className,
      )}
      style={{
        backgroundColor: currentTheme?.bg,
        color: currentTheme?.text,
      }}
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
            return (
              <div
                key={item.title}
                id={`works-wheel-${i}`}
                role="option"
                aria-selected={i === active}
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
                <span className="relative block size-full overflow-hidden rounded-xl shadow-[0_20px_45px_-15px_rgba(0,0,0,0.18)] border border-black/5 bg-black/5">
                  <img
                    src={item.image}
                    alt={item.title}
                    draggable={false}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="eager"
                  />
                  {/* Subtle hover badge */}
                  {item.href?.startsWith("http") ? (
                    <span
                      className="pointer-events-none absolute right-3 bottom-3 flex translate-y-1 items-center gap-1.5 rounded-full px-3 py-1 text-[0.72rem] font-medium opacity-0 backdrop-blur-md transition group-hover:translate-y-0 group-hover:opacity-100 shadow-sm"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.94)",
                        color: "#181411",
                      }}
                    >
                      <svg
                        viewBox="0 0 12 12"
                        className="size-2.5 text-[#d93829]"
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
                      Live System
                    </span>
                  ) : (
                    <span
                      className="pointer-events-none absolute right-3 bottom-3 flex translate-y-1 items-center gap-1 rounded-full px-2.5 py-1 text-[0.70rem] font-mono uppercase tracking-wider opacity-0 backdrop-blur-md transition group-hover:translate-y-0 group-hover:opacity-100 shadow-sm"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.94)",
                        color: "#5c5248",
                      }}
                    >
                      Concept
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ring center label (visible at rest when turn === 0) */}
      <div
        ref={labelRef}
        className="pointer-events-none absolute inset-0 grid place-items-center select-none"
      >
        <div className="flex flex-col items-center justify-center text-center px-4">
          <span
            className="font-mono uppercase tracking-[0.28em] text-[10px] sm:text-xs font-semibold mb-2"
            style={{ color: "#d93829" }}
          >
            SELECTED WORK
          </span>
          <h2
            className="font-sans font-bold tracking-tight text-2xl sm:text-4xl md:text-5xl"
            style={{ color: currentTheme?.text }}
          >
            OSTRUM <span style={{ color: "#d93829" }}>/</span> WORKS
          </h2>
          <p
            className="font-mono text-[10px] sm:text-xs tracking-wider uppercase mt-3 opacity-60"
            style={{ color: currentTheme?.subtext }}
          >
            Scroll or drag to explore
          </p>
        </div>
      </div>

      {/* Front-card editorial title display (visible when turn >= 1) */}
      <div
        ref={titleRef}
        className="pointer-events-none absolute top-1/2 left-[5%] sm:left-[8%] -translate-y-1/2 opacity-0 max-w-[34vw] sm:max-w-[28vw] z-10 select-none"
      >
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-xs font-mono font-medium uppercase tracking-wider"
            style={{
              backgroundColor: items[active]?.theme.badgeBg,
              color: items[active]?.theme.badgeText,
            }}
          >
            {items[active]?.isConcept ? "Concept" : "Verified Client"}
          </span>
        </div>
        <h3
          className="font-sans font-bold tracking-tight text-xl sm:text-3xl md:text-4xl lg:text-5xl leading-[1.08] mb-2 sm:mb-3"
          style={{ color: items[active]?.theme.text }}
        >
          {items[active]?.title}
        </h3>
        <p
          className="font-mono text-xs sm:text-sm tracking-wide"
          style={{ color: items[active]?.theme.subtext }}
        >
          {items[active]?.category}
        </p>
        {items[active]?.href?.startsWith("http") && (
          <div
            className="mt-3 sm:mt-4 flex items-center gap-1.5 text-xs sm:text-sm font-medium"
            style={{ color: "#d93829" }}
          >
            <span>Visit Live Platform</span>
            <span aria-hidden="true">↗</span>
          </div>
        )}
      </div>

      {/* Side project index on right edge */}
      <ol
        className="absolute top-[8%] right-[3%] sm:right-[4%] text-right leading-[1.8] z-10 hidden sm:block select-none"
        style={{ fontSize: metrics.index }}
      >
        {items.map((item, i) => {
          const isCurrent = i === active;
          return (
            <li key={item.title}>
              <button
                type="button"
                onClick={() => to(i + 1)}
                className="cursor-pointer transition-all duration-300 outline-none flex items-center justify-end gap-2 group ml-auto"
                style={{
                  color: isCurrent ? item.theme.text : item.theme.subtext,
                  fontWeight: isCurrent ? 600 : 400,
                  opacity: isCurrent ? 1 : 0.65,
                }}
              >
                <span className="font-mono text-[10px] opacity-60">0{i + 1}</span>
                <span className="group-hover:translate-x-[-2px] transition-transform">
                  {item.title}
                </span>
                {isCurrent && (
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-[#d93829]"
                    aria-hidden="true"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// 9 Bespoke Ostrum Projects: 2 Verified Client Systems + 7 Studio Concept Explorations
export const OSTRUM_WORKS: WorksWheelItem[] = [
  {
    title: "TMR AI Car Care",
    category: "Automotive Intelligence System",
    image: "/images/works/tmr-ai-car-care.jpg",
    href: "https://tmraicarcare.com/",
    isConcept: false,
    theme: {
      bg: "#F2E3D6",
      text: "#181411",
      subtext: "#5c5248",
      accent: "#d93829",
      badgeBg: "rgba(217, 56, 41, 0.12)",
      badgeText: "#b91c1c",
    },
  },
  {
    title: "Saraswati Driving School",
    category: "Fleet Logistics & Booking",
    image: "/images/works/saraswati-driving-school.jpg",
    href: "https://saraswati-driving-school.vercel.app/",
    isConcept: false,
    theme: {
      bg: "#DDE8D9",
      text: "#141a15",
      subtext: "#4d5b4e",
      accent: "#2563eb",
      badgeBg: "rgba(37, 99, 235, 0.12)",
      badgeText: "#1d4ed8",
    },
  },
  {
    title: "Signal",
    category: "Autonomous Market Infrastructure",
    image: "/images/works/signal.jpg",
    href: "#signal",
    isConcept: true,
    theme: {
      bg: "#DFE8F3",
      text: "#131822",
      subtext: "#4e596b",
      accent: "#e11d48",
      badgeBg: "rgba(19, 24, 34, 0.08)",
      badgeText: "#475569",
    },
  },
  {
    title: "Atlas",
    category: "Spatial Resource Ledger",
    image: "/images/works/atlas.jpg",
    href: "#atlas",
    isConcept: true,
    theme: {
      bg: "#E1E9ED",
      text: "#141a1d",
      subtext: "#50595e",
      accent: "#d93829",
      badgeBg: "rgba(20, 26, 29, 0.08)",
      badgeText: "#475569",
    },
  },
  {
    title: "MNESA",
    category: "Neural Retrieval Architecture",
    image: "/images/works/mnesa.jpg",
    href: "#mnesa",
    isConcept: true,
    theme: {
      bg: "#EAE1F2",
      text: "#1a1322",
      subtext: "#5b4e6b",
      accent: "#7c3aed",
      badgeBg: "rgba(26, 19, 34, 0.08)",
      badgeText: "#475569",
    },
  },
  {
    title: "NeuroMove",
    category: "Biomechanical Telemetry Studio",
    image: "/images/works/neuromove.jpg",
    href: "#neuromove",
    isConcept: true,
    theme: {
      bg: "#DCEFE7",
      text: "#121b16",
      subtext: "#46594f",
      accent: "#059669",
      badgeBg: "rgba(18, 27, 22, 0.08)",
      badgeText: "#475569",
    },
  },
  {
    title: "Form",
    category: "Generative Product Synthesis",
    image: "/images/works/form.jpg",
    href: "#form",
    isConcept: true,
    theme: {
      bg: "#F1DFE1",
      text: "#221316",
      subtext: "#6b4e54",
      accent: "#e11d48",
      badgeBg: "rgba(34, 19, 22, 0.08)",
      badgeText: "#475569",
    },
  },
  {
    title: "Orbit",
    category: "Kinetic Protocol Network",
    image: "/images/works/orbit.jpg",
    href: "#orbit",
    isConcept: true,
    theme: {
      bg: "#DCEDEF",
      text: "#121a1d",
      subtext: "#46585f",
      accent: "#0284c7",
      badgeBg: "rgba(18, 26, 29, 0.08)",
      badgeText: "#475569",
    },
  },
  {
    title: "Origin",
    category: "Venture Genesis Engine",
    image: "/images/works/origin.jpg",
    href: "#origin",
    isConcept: true,
    theme: {
      bg: "#F2E9D8",
      text: "#1c1711",
      subtext: "#5f5344",
      accent: "#d97706",
      badgeBg: "rgba(28, 23, 17, 0.08)",
      badgeText: "#475569",
    },
  },
];

export function WorksWheelDemo() {
  return (
    <div className="w-full h-screen">
      <WorksWheel items={OSTRUM_WORKS} label="OSTRUM / WORKS" action="View" />
    </div>
  );
}

export default WorksWheel;
