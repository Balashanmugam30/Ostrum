'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

let refreshTimer: number | null = null;
let refreshRaf = 0;

/**
 * Coalesces bursts of ScrollTrigger.refresh() calls during initial mount
 * across multiple pinned sections into a single frame-aligned pass.
 */
export function scheduleScrollTriggerRefresh(delayMs = 40): void {
  if (typeof window === 'undefined') return;
  if (refreshTimer !== null) {
    window.clearTimeout(refreshTimer);
  }
  refreshTimer = window.setTimeout(() => {
    refreshTimer = null;
    if (refreshRaf) window.cancelAnimationFrame(refreshRaf);
    refreshRaf = window.requestAnimationFrame(() => {
      refreshRaf = 0;
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });
  }, delayMs);
}
