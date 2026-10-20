'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';

export type PreloaderPhase =
  | 'preparing'     // Pure black screen, rolling counter at 000, central charcoal track ready
  | 'counting'      // Rolling counter advances 000 -> 100, thick 3D serpentine ribbon advances
  | 'transforming'  // Ribbon coils inward into 3D Möbius loop, pearl-silver sheen, resolves into GLB
  | 'docking'       // Sculpture travels from center to measured hero 'O' anchor, hero reveals
  | 'complete'      // Finished, overlays unmounted, scroll unlocked, model active in scroll journey
  | 'fallback';     // Failsafe safety state

export interface PreloaderContextValue {
  phase: PreloaderPhase;
  isReady: boolean;
  isComplete: boolean;
  introProgress: number;       // 0 to 1 during counting
  transformProgress: number;   // 0 to 1 during transforming
  dockProgress: number;        // 0 to 1 during docking
  progressPercent: number;     // 0 to 100 for the bottom-left rolling counter
  overlayOpacity: number;      // 1 to 0 for synchronized background blend
  counterOpacity: number;      // 1 to 0 for decoupled counter disappearance
  handoffProgress: number;     // Backward-compatibility
  energyProgress: number;      // Backward-compatibility
  reportModelReady: () => void;
  reportFirstFrame: () => void;
  reportHeroTargetReady: () => void;
  reportError: (err: string) => void;
  completeIntro: () => void;
}

const PreloaderContext = createContext<PreloaderContextValue | null>(null);

const SESSION_KEY = 'ostrum_lusion_intro_v1';

export function PreloaderProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomepage = pathname === '/' || pathname === '' || pathname === '/fr';

  // Uniform initial state to prevent any SSR hydration mismatch
  const [phase, setPhase] = useState<PreloaderPhase>('preparing');
  const [introProgress, setIntroProgress] = useState(0);
  const [transformProgress, setTransformProgress] = useState(0);
  const [dockProgress, setDockProgress] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [overlayOpacity, setOverlayOpacity] = useState(1);
  const [counterOpacity, setCounterOpacity] = useState(1);

  const isTriggeredRef = useRef(false);
  const isCompletedRef = useRef(false);
  const isModelReadyRef = useRef(false);
  const isHeroTargetReadyRef = useRef(false);

  // Complete helper: unlocks scroll and stores session flag
  const completeIntro = useCallback(() => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;
    setPhase('complete');
    setIntroProgress(1);
    setTransformProgress(1);
    setDockProgress(1);
    setProgressPercent(100);
    setCounterOpacity(0);

    if (typeof window !== 'undefined') {
      (window as any).__ostrumPhase = 'complete';
      (window as any).__ostrumIntroProgress = 1;
      (window as any).__ostrumTransformProgress = 1;
      (window as any).__ostrumDockProgress = 1;
      (window as any).__ostrumCounterOpacity = 0;
    }

    document.body.style.overflow = '';
    if (typeof window !== 'undefined' && (window as any).lenis) {
      (window as any).lenis.start?.();
    }
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch {}
    window.dispatchEvent(new CustomEvent('ostrum:preloader-complete'));
  }, []);

  // Client-side initialization check (Reduced Motion & Session Storage)
  useEffect(() => {
    if (!isHomepage) {
      completeIntro();
      return;
    }

    // Check prefers-reduced-motion: Instant clean skip
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      completeIntro();
      return;
    }

    // Check session storage (unless developer ?replay=true is passed)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const isReplayRequested = urlParams.get('replay') === 'true' || urlParams.get('replay') === '1';

      if (!isReplayRequested) {
        const hasViewed = sessionStorage.getItem(SESSION_KEY);
        if (hasViewed) {
          completeIntro();
          return;
        }
      }
    } catch {
      // Graceful fallback
    }

    // Lock scroll during active preloader
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    if (typeof window !== 'undefined' && (window as any).lenis) {
      (window as any).lenis.stop?.();
    }
  }, [isHomepage, completeIntro]);

  // Master Lusion-Inspired Cinematic Timeline (~6.6s total choreography)
  useEffect(() => {
    if (!isHomepage || isCompletedRef.current || isTriggeredRef.current) return;
    isTriggeredRef.current = true;

    if (typeof window !== 'undefined') {
      (window as any).__ostrumPhase = 'preparing';
      (window as any).__ostrumIntroProgress = 0;
      (window as any).__ostrumTransformProgress = 0;
      (window as any).__ostrumDockProgress = 0;
    }

    const proxy = {
      progress: 0,
      percent: 0,
      transform: 0,
      dock: 0,
      overlayOpacity: 1,
      counterOpacity: 1,
    };

    const masterTl = gsap.timeline({
      paused: false,
      onUpdate: () => {
        if (isCompletedRef.current) return;
        const t = masterTl.time();
        let currentPhase: PreloaderPhase = 'preparing';
        if (t >= 6.95) {
          currentPhase = 'complete';
        } else if (t >= 5.6) {
          currentPhase = 'docking';
        } else if (t >= 4.2) {
          currentPhase = 'transforming';
        } else if (t >= 0.4) {
          currentPhase = 'counting';
        }

        setPhase(currentPhase);
        setIntroProgress(proxy.progress);
        setProgressPercent(Math.round(proxy.percent));
        setTransformProgress(proxy.transform);
        setDockProgress(proxy.dock);
        setOverlayOpacity(proxy.overlayOpacity);
        setCounterOpacity(proxy.counterOpacity);

        if (typeof window !== 'undefined') {
          (window as any).__ostrumPhase = currentPhase;
          (window as any).__ostrumIntroProgress = proxy.progress;
          (window as any).__ostrumProgressPercent = Math.round(proxy.percent);
          (window as any).__ostrumTransformProgress = proxy.transform;
          (window as any).__ostrumDockProgress = proxy.dock;
          (window as any).__ostrumOverlayOpacity = proxy.overlayOpacity;
          (window as any).__ostrumCounterOpacity = proxy.counterOpacity;
          window.dispatchEvent(
            new CustomEvent('ostrum:intro-progress', {
              detail: {
                progress: proxy.progress,
                percent: Math.round(proxy.percent),
                transform: proxy.transform,
                dock: proxy.dock,
                overlayOpacity: proxy.overlayOpacity,
                counterOpacity: proxy.counterOpacity,
              },
            })
          );
        }
      },
      onComplete: () => {
        completeIntro();
      },
    });

    if (typeof window !== 'undefined') {
      (window as any).__ostrumMasterTl = masterTl;
      (window as any).__ostrumSetPercent = (pct: number) => {
        proxy.percent = pct;
        setProgressPercent(Math.round(pct));
        (window as any).__ostrumProgressPercent = Math.round(pct);
      };
    }

    // STAGE 0: PREPARING (0.0s - 0.4s)
    // Pure black screen, rolling counter initialized at 000, central charcoal track ready
    masterTl.add(() => {
      setPhase('preparing');
      if (typeof window !== 'undefined') (window as any).__ostrumPhase = 'preparing';
      window.dispatchEvent(new CustomEvent('ostrum:preloader-preparing'));
    }, 0);
    masterTl.fromTo(proxy,
      { progress: 0, percent: 0, counterOpacity: 1 },
      {
        progress: 0.02,
        percent: 0,
        counterOpacity: 1,
        duration: 0.40,
        ease: 'none',
      },
      0
    );

    // STAGE 1: COUNTING (0.4s - 4.2s, 3.8s duration)
    // Rolling counter rolls bottom-left from 000 -> 100
    // Thick 3D serpentine ribbon advances smoothly along central track
    masterTl.add(() => {
      setPhase('counting');
      if (typeof window !== 'undefined') (window as any).__ostrumPhase = 'counting';
      window.dispatchEvent(new CustomEvent('ostrum:preloader-counting'));
    }, 0.40);
    masterTl.fromTo(proxy,
      { progress: 0.02, percent: 0 },
      {
        progress: 1.0,
        percent: 100,
        duration: 3.80,
        ease: 'power1.inOut',
      },
      0.40
    );

    // STAGE 2: TRANSFORMING & SCULPTURE SETTLING ON BLACK (4.2s - 5.4s, 1.2s duration)
    // Counter reaches 100 and holds. The 3D ribbon coils inward, folds into 3D Möbius loop,
    // sweeps with pearl-silver sheen & crimson illumination, smoothly resolving into the real GLB.
    // The completed sculpture settles at center on the pure black screen (#000000) holding 100.
    masterTl.add(() => {
      setPhase('transforming');
      if (typeof window !== 'undefined') (window as any).__ostrumPhase = 'transforming';
      window.dispatchEvent(new CustomEvent('ostrum:preloader-transforming'));
    }, 4.20);
    masterTl.to(proxy, {
      transform: 1.0,
      duration: 1.20,
      ease: 'power2.inOut',
    }, 4.20);

    // STAGE 2B: QUICK COUNTER DISAPPEARANCE ON BLACK (5.40s - 5.60s, 200ms duration)
    // 100 disappears quickly while the completed 3D sculpture is held visible and settled
    // on the black screen, strictly BEFORE the sculpture begins moving into the hero 'O'.
    masterTl.to(proxy, {
      counterOpacity: 0.0,
      duration: 0.20,
      ease: 'power2.out',
    }, 5.40);

    // STAGE 3: CONTINUOUS DOCKING & CHOREOGRAPHED BLEND (5.60s - 7.00s, 1.40s duration)
    // Begins strictly after counter is completely gone (counterOpacity is 0.0).
    // The sculpture travels from center to hero 'O'.
    // First half (5.60s - 6.30s): travels across pure black.
    // Second half (6.30s - 7.00s): overlay smoothly fades out (1 -> 0) revealing hero crimson background.
    masterTl.add(() => {
      setPhase('docking');
      if (typeof window !== 'undefined') (window as any).__ostrumPhase = 'docking';
      window.dispatchEvent(new CustomEvent('ostrum:preloader-docking'));
    }, 5.60);
    masterTl.to(proxy, {
      dock: 1.0,
      duration: 1.40,
      ease: 'power2.inOut',
    }, 5.60);
    masterTl.to(proxy, {
      overlayOpacity: 0.0,
      duration: 0.70,
      ease: 'power2.inOut',
    }, 6.30);

    // STAGE 4: COMPLETE (7.00s+)
    // Sculpture is settled inside hero 'O', overlay is completely at 0 opacity.
    // Overlays unmounted, scroll unlocked, continuous journey seamlessly takes over.
    masterTl.add(() => {
      setPhase('complete');
      if (typeof window !== 'undefined') (window as any).__ostrumPhase = 'complete';
      completeIntro();
    }, 7.00);

    // Hard fail-safe timeout: guarantees no visitor is stuck indefinitely
    const hardTimeout = setTimeout(() => {
      if (!isCompletedRef.current && !masterTl.paused()) {
        console.warn('[PreloaderContext] Hard timeout reached, completing intro');
        setPhase('fallback');
        completeIntro();
      }
    }, 12000);

    return () => {
      clearTimeout(hardTimeout);
      masterTl.kill();
    };
  }, [isHomepage, completeIntro]);

  // Asset readiness callbacks
  const reportModelReady = useCallback(() => {
    isModelReadyRef.current = true;
    if (typeof window !== 'undefined') {
      (window as any).__ostrumModelReady = true;
    }
  }, []);

  const reportFirstFrame = useCallback(() => {
    if (typeof window !== 'undefined') {
      (window as any).__ostrumFirstFrame = true;
    }
  }, []);

  const reportHeroTargetReady = useCallback(() => {
    isHeroTargetReadyRef.current = true;
    if (typeof window !== 'undefined') {
      (window as any).__ostrumHeroTargetReady = true;
    }
  }, []);

  const reportError = useCallback((err: string) => {
    console.warn('[PreloaderContext] Asset reporting error:', err);
    // If model fails to load, gracefully fall back
    if (!isCompletedRef.current) {
      setTimeout(() => completeIntro(), 1500);
    }
  }, [completeIntro]);

  return (
    <PreloaderContext.Provider
      value={{
        phase,
        isReady: phase === 'docking' || phase === 'complete',
        isComplete: phase === 'complete',
        introProgress,
        transformProgress,
        dockProgress,
        progressPercent,
        overlayOpacity,
        counterOpacity,
        handoffProgress: phase === 'docking' || phase === 'complete' ? 1 : 0,
        energyProgress: introProgress,
        reportModelReady,
        reportFirstFrame,
        reportHeroTargetReady,
        reportError,
        completeIntro,
      }}
    >
      {children}
    </PreloaderContext.Provider>
  );
}

export function usePreloader(): PreloaderContextValue {
  const ctx = useContext(PreloaderContext);
  if (!ctx) {
    return {
      phase: 'complete',
      isReady: true,
      isComplete: true,
      introProgress: 1,
      transformProgress: 1,
      dockProgress: 1,
      progressPercent: 100,
      overlayOpacity: 0,
      counterOpacity: 0,
      handoffProgress: 1,
      energyProgress: 1,
      reportModelReady: () => {},
      reportFirstFrame: () => {},
      reportHeroTargetReady: () => {},
      reportError: () => {},
      completeIntro: () => {},
    };
  }
  return ctx;
}
