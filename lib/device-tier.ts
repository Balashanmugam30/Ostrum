'use client';

/**
 * Separates physical handheld touch capability from responsive layout width.
 * Chrome's "Request desktop site" on phones expands `window.innerWidth` past 768px
 * while keeping coarse touch input and mobile GPU / WebGL pool constraints.
 */
export function isHandheldTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.innerWidth < 768) return true;

  const isPrimaryCoarse = window.matchMedia('(pointer: coarse)').matches;
  const hasAnyHover = window.matchMedia('(any-hover: hover)').matches;
  if (isPrimaryCoarse && !hasAnyHover) return true;

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  const hasTouch = typeof navigator !== 'undefined' ? navigator.maxTouchPoints > 0 : false;
  if (hasTouch && /Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return true;

  return false;
}

export function subscribeDeviceTierChange(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const queries = [
    window.matchMedia('(max-width: 767px)'),
    window.matchMedia('(pointer: coarse)'),
    window.matchMedia('(any-hover: hover)'),
  ];

  window.addEventListener('resize', onChange, { passive: true });
  queries.forEach((mq) => mq.addEventListener('change', onChange));

  return () => {
    window.removeEventListener('resize', onChange);
    queries.forEach((mq) => mq.removeEventListener('change', onChange));
  };
}
