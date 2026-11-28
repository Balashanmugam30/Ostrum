'use client';

import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scheduleScrollTriggerRefresh } from '@/lib/scroll-refresh';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Configure after the client plugin has initialized and identified touch
    // input. Mobile browser chrome can change viewport height while scrolling;
    // remeasuring long pinned scenes on every toolbar transition can shift
    // their handoffs and expose empty surfaces.
    ScrollTrigger.config({ ignoreMobileResize: true });

    // Android's native compositor can repaint past GSAP pin boundaries before
    // the main thread updates the pinned sections. Normalize only touch phones
    // so reverse scrolling stays synchronized without changing desktop input.
    const mobileTouch = window.matchMedia(
      '(max-width: 767px) and (pointer: coarse)'
    ).matches;
    const mobileNormalizer = mobileTouch
      ? ScrollTrigger.normalizeScroll({ allowNestedScroll: true })
      : null;
    const cleanupNormalizer = () => mobileNormalizer?.kill();

    // Keep touch scrolling native on phones and tablets. Lenis can compete with
    // browser momentum and pinned ScrollTriggers during fast touch scrolls.
    const desktopPointer = window.matchMedia(
      '(min-width: 768px) and (hover: hover) and (pointer: fine)'
    );
    if (!desktopPointer.matches) return cleanupNormalizer;

    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) return cleanupNormalizer;

    let isDisposed = false;
    let lenisInstance: import('lenis').default | null = null;
    let updateTicker: ((time: number) => void) | null = null;

    Promise.all([
      import('lenis'),
      import('lenis/dist/lenis.css' as string),
    ]).then(([{ default: Lenis }]) => {
      if (isDisposed) return;

      const lenis = new Lenis({
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.95,
        touchMultiplier: 1.0,
        autoRaf: false, // Fully synchronized with GSAP ticker below
      });

      lenisInstance = lenis;
      (window as any).lenis = lenis;

      // Synchronize Lenis scroll position with GSAP ScrollTrigger
      lenis.on('scroll', ScrollTrigger.update);

      // Drive Lenis through GSAP ticker with correct second-to-millisecond conversion
      updateTicker = (time: number) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(updateTicker);
      gsap.ticker.lagSmoothing(0);

      // Refresh ScrollTrigger once fonts and assets are ready
      if (typeof document !== 'undefined' && document.fonts) {
        document.fonts.ready.then(() => {
          if (!isDisposed) scheduleScrollTriggerRefresh();
        });
      }
    });

    return () => {
      isDisposed = true;
      delete (window as any).lenis;
      if (updateTicker) gsap.ticker.remove(updateTicker);
      lenisInstance?.destroy();
      cleanupNormalizer();
    };
  }, []);

  return <>{children}</>;
}
