'use client';

import * as React from 'react';

/**
 * Beam Wordmark Footer — Ostrum Adaptation
 *
 * Adapted from the 21st.dev component by Kedhar.
 * Full backdrop beam, wash, bands, glow, grain, and top hairline removed.
 * Retains only the letter-level beam illumination (warm red + pearl-white highlights),
 * pointer tracking, wordmark fitting, hover lift, click-hop, and foot crop.
 */

// #region beam math
export const clamp = (v: number, lo: number, hi: number): number =>
  v < lo ? lo : v > hi ? hi : v;

/** "#3d6bff" / "#36f" → "61, 107, 255". Anything unparseable falls back. */
export const hexToRgb = (
  hex: string,
  fallback: string = '255, 77, 48'
): string => {
  if (typeof window !== 'undefined' && hex && hex.startsWith('var(')) {
    try {
      const varName = hex.replace(/var\((--[^,\)]+).*\)/, '$1').trim();
      const computed = getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();
      if (computed) hex = computed;
    } catch {
      // ignore
    }
  }
  const m = /^#?([\da-f]{3}|[\da-f]{6})$/i.exec((hex || '').trim());
  if (!m) return fallback;
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
  const n = parseInt(h, 16);
  return ((n >> 16) & 255) + ', ' + ((n >> 8) & 255) + ', ' + (n & 255);
};

/**
 * Font size (px) that makes a word measured at 100px span `target` px.
 */
export const fitSize = (
  measuredAt100: number,
  target: number,
  cap: number
): number => {
  if (!(measuredAt100 > 0) || !(target > 0)) return 0;
  const targetWidth = target * 0.955;
  const size = (100 * targetWidth) / measuredAt100;
  return cap > 0 ? Math.min(size, cap) : size;
};

/** Where the beam sits (% across the section) for a pointer at `u` (0 → 1 across). */
export const beamTarget = (u: number, lo: number = 30, hi: number = 82): number =>
  lo + (hi - lo) * clamp(Number.isFinite(u) ? u : 0.5, 0, 1);

/** The beam's idle sway: two slow, unrelated sines so it never visibly loops. */
export const drift = (t: number, centre: number = 58, amp: number = 9): number =>
  centre + amp * (0.7 * Math.sin(t * 0.21) + 0.3 * Math.sin(t * 0.077 + 1.3));

/** Frame-rate independent ease toward a target: `k` is the fraction closed per 1/60s. */
export const approach = (
  from: number,
  to: number,
  k: number,
  dt: number
): number =>
  to + (from - to) * Math.pow(1 - clamp(k, 0, 1), clamp(dt, 0, 0.1) * 60);

/**
 * Where the baseline sits in a `line-height: 1` box, as a fraction of the font
 * size, from the font's ascent and descent at 100px.
 */
export const baselineAt = (ascent: number, descent: number): number => {
  if (!(ascent > 0) || !(descent >= 0)) return 0.8;
  return clamp(((100 - ascent - descent) / 2 + ascent) / 100, 0.5, 1.2);
};

/** Visible wordmark height: down to the baseline, plus `cut` em below it. */
export const wordHeight = (
  fontSize: number,
  baseline: number,
  cut: number
): number =>
  Math.max(
    0,
    fontSize * (baseline + clamp(Number.isFinite(cut) ? cut : 0, -0.4, 0.4))
  );

// Baseline of the wordmark's actual font, read off a canvas.
const measureBaseline = (
  family: string,
  weight: number,
  text: string
): number => {
  try {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return 0.8;
    ctx.font = weight + ' 100px ' + family;
    const m = ctx.measureText(text);
    return baselineAt(m.fontBoundingBoxAscent, m.fontBoundingBoxDescent);
  } catch {
    return 0.8;
  }
};
// #endregion

export type FooterSocial = {
  label: string;
  href?: string;
  icon: React.ReactNode;
};

export type FooterLink = { label: string; href?: string };
export type FooterColumn = { title: string; links: FooterLink[] };

export type BeamWordmarkFooterProps = {
  brand?: string;
  wordmark?: string;
  company?: string;
  year?: number;
  socials?: FooterSocial[];
  columns?: FooterColumn[];
  onLinkClick?: (label: string, href?: string) => void;
  cut?: number;
  background?: string;
  ink?: string;
  muted?: string;
  accent?: string;
  wordTop?: string;
  wordFoot?: string;
  fontSans?: string;
  wordWeight?: number;
  animate?: boolean;
  className?: string;
  children?: React.ReactNode;
};

const SANS =
  'var(--font-display), "Neue Montreal", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

// Scoped stylesheet for the wordmark footer
const CSS = `
.bwf {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  container-type: inline-size;
  background: var(--bwf-bg);
  color: var(--bwf-ink);
  font-family: var(--bwf-sans);
  -webkit-font-smoothing: antialiased;
  touch-action: pan-y;
}
:where(.bwf) a { color: inherit; text-decoration: none; }
:where(.bwf) button { font: inherit; color: inherit; background: none; border: 0; padding: 0; margin: 0; cursor: pointer; }
:where(.bwf) ul { list-style: none; margin: 0; padding: 0; }
:where(.bwf) p { margin: 0; }
.bwf svg { max-width: none; display: block; }
.bwf .sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Wordmark layout */
.bwf-word {
  position: relative;
  z-index: 1;
  overflow: hidden;
  margin-top: clamp(32px, 8cqw, 100px);
  width: 100%;
}
.bwf-word-box {
  width: 100%;
  padding: 0 clamp(16px, 3.5cqw, 48px);
  max-width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
.bwf-word-in {
  display: inline-flex;
  white-space: nowrap;
  font-weight: var(--bwf-ww);
  line-height: 0.88;
  letter-spacing: normal;
  user-select: none;
  -webkit-user-select: none;
}
.bwf-lw {
  display: inline-block;
  translate: 0 0;
  transition: translate 1.25s cubic-bezier(.16, .84, .2, 1) var(--bwf-d, 0ms);
}
.bwf-lw:not(:last-child) {
  margin-right: -0.025em;
}
.bwf[data-in='false'] .bwf-lw {
  translate: 0 85%;
}

/* Letters with traveling beam and pointer glow */
.bwf-l {
  display: inline-block;
  cursor: pointer;
  color: transparent;
  letter-spacing: normal;
  padding-right: 0.04em;
  margin-right: -0.04em;
  -webkit-background-clip: text;
  background-clip: text;
  background-repeat: no-repeat;
  background-size: var(--bwf-rw) var(--bwf-rh);
  background-position: calc(var(--bwf-x) * -1) calc(var(--bwf-y) * -1);
  background-image:
    /* Layer 1: Mouse pointer glow */
    radial-gradient(circle 24cqw at var(--bwf-px) var(--bwf-py), rgba(var(--bwf-lit), calc(var(--bwf-g) * 0.95)), transparent 70%),
    /* Layer 2: Ambient/interactive beam */
    linear-gradient(
      var(--bwf-ang),
      transparent calc(var(--bwf-b) - 10%),
      rgba(var(--bwf-acc), 0.35) calc(var(--bwf-b) - 5%),
      rgba(var(--bwf-acc), 0.75) calc(var(--bwf-b) - 2%),
      rgba(255, 250, 248, 0.95) var(--bwf-b),
      rgba(var(--bwf-acc), 0.75) calc(var(--bwf-b) + 2%),
      rgba(var(--bwf-acc), 0.3) calc(var(--bwf-b) + 5%),
      transparent calc(var(--bwf-b) + 10%)
    ),
    /* Layer 3: Base vertical wordmark gradient */
    linear-gradient(180deg, var(--bwf-wt) var(--bwf-top), var(--bwf-wf) var(--bwf-bot));
  transition: transform .5s cubic-bezier(.2, .9, .25, 1.2), filter .4s;
  transform-origin: 50% 100%;
}
.bwf-l:hover {
  transform: translateY(-.048em);
  filter: brightness(1.4) saturate(1.15);
}
.bwf-l.is-hop {
  animation: bwf-hop .75s cubic-bezier(.2, .8, .2, 1);
}
@keyframes bwf-hop {
  0% { transform: translateY(0) scale(1, 1); }
  18% { transform: translateY(.02em) scale(1.06, .9); }
  45% { transform: translateY(-.14em) scale(.97, 1.05); }
  70% { transform: translateY(.01em) scale(1.02, .97); }
  100% { transform: translateY(-.048em) scale(1, 1); }
}

/* Bottom fade sinking wordmark into black background */
.bwf-foot {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 38%;
  z-index: 2;
  pointer-events: none;
  background: linear-gradient(180deg, transparent, rgba(var(--bwf-bg-rgb), .6) 50%, var(--bwf-bg));
}

@media (prefers-reduced-motion: reduce) {
  .bwf .bwf-lw, .bwf .bwf-l {
    transition: none !important;
    animation: none !important;
  }
  .bwf[data-in='false'] .bwf-lw {
    translate: none;
  }
}
`;

export default function BeamWordmarkFooter({
  brand = 'Ostrum',
  wordmark = 'OSTRUM',
  company = 'Ostrum',
  year = new Date().getFullYear(),
  cut = 0.14,
  background = '#050505',
  ink = '#F4F4F5',
  muted = '#92929B',
  accent = '#FF4D30',
  wordTop = '#220D10',
  wordFoot = '#050505',
  fontSans = SANS,
  wordWeight = 700,
  animate = true,
  className = '',
  children,
}: BeamWordmarkFooterProps) {
  const word = (wordmark ?? brand).trim() || brand;
  const letters = React.useMemo(() => Array.from(word), [word]);

  const rootRef = React.useRef<HTMLElement>(null);
  const wordRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState(0);
  const [base, setBase] = React.useState(0.8);
  const [seen, setSeen] = React.useState(false);

  // Pointer state lives in a ref and reaches the page as CSS variables
  const ptr = React.useRef({ u: 0.5, x: 0, y: 0, inside: false });

  // Fit the wordmark to the full width
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    const box = wordRef.current;
    const inner = innerRef.current;
    if (!root || !box || !inner) return;
    let frame = 0;

    const fit = () => {
      const wb = inner.parentElement ?? box;
      const padLeft = parseFloat(getComputedStyle(wb).paddingLeft) || 0;
      const padRight = parseFloat(getComputedStyle(wb).paddingRight) || 0;
      const target = wb.clientWidth - (padLeft + padRight);
      inner.style.fontSize = '100px';
      const measured = inner.getBoundingClientRect().width || inner.offsetWidth;
      setBase(
        measureBaseline(getComputedStyle(inner).fontFamily, wordWeight, word)
      );
      // Fit to fill ~95.5% width of the container
      const next = fitSize(measured, target, target * 0.45);
      inner.style.fontSize = next + 'px';
      setSize(next);
      place();
    };

    const place = () => {
      const r = root.getBoundingClientRect();
      root.style.setProperty('--bwf-rw', r.width + 'px');
      root.style.setProperty('--bwf-rh', r.height + 'px');
      const spans = inner.querySelectorAll<HTMLElement>('.bwf-l');
      let top = 0;
      spans.forEach((s, i) => {
        let x = 0;
        let y = 0;
        let el: HTMLElement | null = s;
        while (el && el !== root) {
          x += el.offsetLeft;
          y += el.offsetTop;
          el = el.offsetParent as HTMLElement | null;
        }
        s.style.setProperty('--bwf-x', x + 'px');
        s.style.setProperty('--bwf-y', y + 'px');
        if (i === 0) top = y;
      });
      root.style.setProperty('--bwf-top', top + 'px');
      root.style.setProperty(
        '--bwf-bot',
        top + (parseFloat(inner.style.fontSize) || 0) * 0.94 + 'px'
      );
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };

    fit();
    const ro = new ResizeObserver(schedule);
    ro.observe(root);
    let alive = true;
    const onFontLoad = () => alive && schedule();
    document.fonts?.ready.then(onFontLoad);
    document.fonts?.addEventListener?.('loadingdone', onFontLoad);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      ro.disconnect();
      document.fonts?.removeEventListener?.('loadingdone', onFontLoad);
    };
  }, [word, fontSans, wordWeight]);

  // Reveal once when footer enters viewport
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting);
        if (e.isIntersecting) setSeen(true);
      },
      { threshold: 0.08 }
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMq = () => setReduced(mq.matches);
    onMq();
    mq.addEventListener('change', onMq);
    return () => mq.removeEventListener('change', onMq);
  }, []);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const set = (b: number, px: number, py: number, g: number) => {
      root.style.setProperty('--bwf-b', b.toFixed(2) + '%');
      root.style.setProperty('--bwf-px', px.toFixed(1) + 'px');
      root.style.setProperty('--bwf-py', py.toFixed(1) + 'px');
      root.style.setProperty('--bwf-g', g.toFixed(3));
    };
    const still = reduced || !animate;
    if (still || !visible) {
      const p = ptr.current;
      set(58, p.x, p.y, p.inside ? 1 : 0);
      if (!still) return;
      const onMove = () =>
        set(58, ptr.current.x, ptr.current.y, ptr.current.inside ? 1 : 0);
      root.addEventListener('pointermove', onMove);
      root.addEventListener('pointerleave', onMove);
      return () => {
        root.removeEventListener('pointermove', onMove);
        root.removeEventListener('pointerleave', onMove);
      };
    }
    let raf = 0;
    let last = performance.now();
    let t = last / 1000;
    let b = 58;
    let px = ptr.current.x;
    let py = ptr.current.y;
    let g = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      t += dt;
      const p = ptr.current;
      const idle = drift(t);
      const target = p.inside ? beamTarget(p.u) * 0.75 + idle * 0.25 : idle;
      b = approach(b, target, 0.035, dt);
      px = approach(px, p.x, 0.16, dt);
      py = approach(py, p.y, 0.16, dt);
      g = approach(g, p.inside ? 1 : 0, 0.06, dt);
      set(b, px, py, g);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, animate, visible]);

  const onPointer = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const p = ptr.current;
    p.x = e.clientX - r.left;
    p.y = e.clientY - r.top;
    p.u = r.width ? p.x / r.width : 0.5;
    p.inside = e.type !== 'pointerleave';
  };

  const hop = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (reduced) return;
    const el = e.currentTarget;
    el.classList.remove('is-hop');
    void el.offsetWidth;
    el.classList.add('is-hop');
  };

  const vars = {
    '--bwf-bg': background,
    '--bwf-bg-rgb': hexToRgb(background, '5, 5, 5'),
    '--bwf-ink': ink,
    '--bwf-ink-rgb': hexToRgb(ink, '244, 244, 245'),
    '--bwf-muted': muted,
    '--bwf-acc': hexToRgb(accent, '255, 77, 48'),
    '--bwf-lit': hexToRgb(accent, '255, 77, 48'),
    '--bwf-wt': wordTop,
    '--bwf-wf': wordFoot,
    '--bwf-sans': fontSans,
    '--bwf-ww': String(wordWeight),
    '--bwf-ang': '118deg',
    '--bwf-b': '58%',
    '--bwf-px': '50%',
    '--bwf-py': '50%',
    '--bwf-g': '0',
    '--bwf-top': '0px',
    '--bwf-bot': '100%',
  } as React.CSSProperties;

  return (
    <footer
      ref={rootRef}
      id="studio-footer"
      data-testid="studio-footer"
      className={'bwf ' + className}
      style={vars}
      data-in={seen || reduced ? 'true' : 'false'}
      onPointerMove={onPointer}
      onPointerEnter={onPointer}
      onPointerLeave={onPointer}
      aria-label="Ostrum Studio Footer"
    >
      <style>{CSS}</style>

      {/* Children content (Top Contact Tiles, Navigation Directory, Copyright) */}
      {children}

      {/* Giant Bottom Wordmark */}
      <div
        ref={wordRef}
        data-testid="footer-wordmark-container"
        className="bwf-word"
        style={{
          height: size
            ? wordHeight(size, base, cut)
            : 'calc(' + (0.8 + cut) * 26 + 'cqw)',
        }}
      >
        <p className="sr-only">{word}</p>
        <div className="bwf-word-box">
          <div ref={innerRef} className="bwf-word-in" aria-hidden="true">
            {letters.map((ch, i) => (
              <span
                key={i}
                className="bwf-lw"
                style={
                  {
                    '--bwf-d': 220 + i * 70 + 'ms',
                  } as React.CSSProperties
                }
              >
                <span
                  className="bwf-l"
                  onClick={hop}
                  onAnimationEnd={(e) =>
                    e.currentTarget.classList.remove('is-hop')
                  }
                  title={word}
                >
                  {ch === ' ' ? '\u00A0' : ch}
                </span>
              </span>
            ))}
          </div>
        </div>
        <div className="bwf-foot" aria-hidden="true" />
      </div>
    </footer>
  );
}
