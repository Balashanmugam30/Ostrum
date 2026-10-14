"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import type {
  CSSProperties,
  ReactNode,
} from "react";

type OstrumLiquidGlassProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  radius?: number;
};

export default function OstrumLiquidGlass({
  children,
  className = "",
  style = {},
  radius = 28,
}: OstrumLiquidGlassProps) {
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  const filterId = `ostrum-glass-filter-${rawId}`;
  const redGradientId = `ostrum-glass-red-${rawId}`;
  const blueGradientId = `ostrum-glass-blue-${rawId}`;

  const containerRef = useRef<HTMLDivElement>(null);
  const displacementImageRef = useRef<SVGFEImageElement>(null);

  const redChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const greenChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const blueChannelRef = useRef<SVGFEDisplacementMapElement>(null);

  const [chromiumRefraction, setChromiumRefraction] =
    useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;

    const isChromium =
      /Chrome|Chromium|Edg|OPR/i.test(userAgent);

    const supportsBackdropBlur =
      typeof CSS !== "undefined" && CSS.supports("backdrop-filter", "blur(1px)");

    setChromiumRefraction(
      isChromium && supportsBackdropBlur
    );
  }, []);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) return;

    let frameId: number | undefined;

    const refreshDisplacementMap = () => {
      const bounds = element.getBoundingClientRect();

      if (bounds.width < 2 || bounds.height < 2) return;

      const width = Math.ceil(bounds.width);
      const height = Math.ceil(bounds.height);

      const cornerRadius = Math.min(
        radius,
        width / 2,
        height / 2
      );

      const edgeSize = Math.max(
        1,
        Math.min(width, height) * 0.035
      );

      const innerWidth = Math.max(
        1,
        width - edgeSize * 2
      );

      const innerHeight = Math.max(
        1,
        height - edgeSize * 2
      );

      const innerRadius = Math.max(
        0,
        cornerRadius - edgeSize
      );

      const displacementMap = `
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="${width}"
          height="${height}"
          viewBox="0 0 ${width} ${height}"
        >
          <defs>
            <linearGradient
              id="${redGradientId}"
              x1="100%"
              y1="0%"
              x2="0%"
              y2="0%"
            >
              <stop
                offset="0%"
                stop-color="red"
                stop-opacity="0"
              />
              <stop
                offset="100%"
                stop-color="red"
                stop-opacity="1"
              />
            </linearGradient>

            <linearGradient
              id="${blueGradientId}"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop
                offset="0%"
                stop-color="blue"
                stop-opacity="0"
              />
              <stop
                offset="100%"
                stop-color="blue"
                stop-opacity="1"
              />
            </linearGradient>
          </defs>

          <rect
            width="${width}"
            height="${height}"
            fill="black"
          />

          <rect
            width="${width}"
            height="${height}"
            rx="${cornerRadius}"
            fill="url(#${redGradientId})"
          />

          <rect
            width="${width}"
            height="${height}"
            rx="${cornerRadius}"
            fill="url(#${blueGradientId})"
            style="mix-blend-mode:difference"
          />

          <rect
            x="${edgeSize}"
            y="${edgeSize}"
            width="${innerWidth}"
            height="${innerHeight}"
            rx="${innerRadius}"
            fill="hsl(0 0% 56% / 0.9)"
            style="filter:blur(0.5px)"
          />
        </svg>
      `;

      const dataUri =
        `data:image/svg+xml,${encodeURIComponent(
          displacementMap
        )}`;

      displacementImageRef.current?.setAttribute(
        "href",
        dataUri
      );

      // A restrained optical effect is intentional.
      // These are softer than the source's default settings.
      redChannelRef.current?.setAttribute(
        "scale",
        "-74"
      );

      greenChannelRef.current?.setAttribute(
        "scale",
        "-71"
      );

      blueChannelRef.current?.setAttribute(
        "scale",
        "-68"
      );

      [redChannelRef, greenChannelRef, blueChannelRef]
        .forEach((ref) => {
          ref.current?.setAttribute(
            "xChannelSelector",
            "R"
          );

          ref.current?.setAttribute(
            "yChannelSelector",
            "G"
          );
        });
    };

    const scheduleRefresh = () => {
      if (frameId !== undefined) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(
        refreshDisplacementMap
      );
    };

    scheduleRefresh();

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(scheduleRefresh)
        : null;

    observer?.observe(element);

    return () => {
      if (frameId !== undefined) {
        cancelAnimationFrame(frameId);
      }

      observer?.disconnect();
    };
  }, [
    radius,
    redGradientId,
    blueGradientId,
  ]);

  const fallbackBlur = "blur(20px) saturate(1.18)";

  const surfaceStyle: CSSProperties = {
    ...style,

    position: "relative",
    isolation: "isolate",
    overflow: "hidden",

    borderRadius: `${radius}px`,

    background: "rgba(255, 255, 255, 0.30)",

    border: "1px solid rgba(255, 255, 255, 0.76)",

    backdropFilter: chromiumRefraction
      ? `url(#${filterId}) saturate(1.12)`
      : fallbackBlur,

    WebkitBackdropFilter: chromiumRefraction
      ? undefined
      : fallbackBlur,

    boxShadow: [
      "0 22px 60px rgba(72, 53, 97, 0.10)",
      "0 4px 16px rgba(72, 53, 97, 0.05)",
      "inset 0 1px 0 rgba(255, 255, 255, 0.92)",
      "inset 0 -1px 0 rgba(255, 255, 255, 0.38)",
    ].join(", "),
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={surfaceStyle}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        <defs>
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
          >
            <feImage
              ref={displacementImageRef}
              href="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='1'%20height='1'/%3E"
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              result="map"
            />

            <feDisplacementMap
              ref={redChannelRef}
              in="SourceGraphic"
              in2="map"
              result="displacedRed"
            />

            <feColorMatrix
              in="displacedRed"
              type="matrix"
              values="
                1 0 0 0 0
                0 0 0 0 0
                0 0 0 0 0
                0 0 0 1 0
              "
              result="red"
            />

            <feDisplacementMap
              ref={greenChannelRef}
              in="SourceGraphic"
              in2="map"
              result="displacedGreen"
            />

            <feColorMatrix
              in="displacedGreen"
              type="matrix"
              values="
                0 0 0 0 0
                0 1 0 0 0
                0 0 0 0 0
                0 0 0 1 0
              "
              result="green"
            />

            <feDisplacementMap
              ref={blueChannelRef}
              in="SourceGraphic"
              in2="map"
              result="displacedBlue"
            />

            <feColorMatrix
              in="displacedBlue"
              type="matrix"
              values="
                0 0 0 0 0
                0 0 0 0 0
                0 0 1 0 0
                0 0 0 1 0
              "
              result="blue"
            />

            <feBlend
              in="red"
              in2="green"
              mode="screen"
              result="redGreen"
            />

            <feBlend
              in="redGreen"
              in2="blue"
              mode="screen"
              result="combined"
            />

            <feGaussianBlur
              in="combined"
              stdDeviation="0.45"
            />
          </filter>
        </defs>
      </svg>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          minWidth: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
