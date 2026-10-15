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
  | 'stageA'    // Pearl / Ivory 2D Introduction
  | 'stageB'    // Crimson 2D Energy Sweep
  | 'stageC'    // Hero Reveal & Dark Transition
  | 'complete'; // Finished, scroll unlocked, overlay unmounted

export interface PreloaderContextValue {
  phase: PreloaderPhase;
  isReady: boolean;
  isComplete: boolean;
  handoffProgress: number; // 0 to 1 during stageC
  energyProgress: number;  // 0 to 1 during stageB
  reportModelReady: () => void;
  reportFirstFrame: () => void;
  reportHeroTargetReady: () => void;
  reportError: (err: string) => void;
}

const PreloaderContext = createContext<PreloaderContextValue | null>(null);

const SESSION_KEY = 'ostrum_intro_viewed_v2';

export function PreloaderProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomepage = pathname === '/' || pathname === '' || pathname === '/fr';

  // Uniform initial state to prevent any SSR hydration mismatch
  const [phase, setPhase] = useState<PreloaderPhase>('stageA');
  const [handoffProgress, setHandoffProgress] = useState(0);
  const [energyProgress, setEnergyProgress] = useState(0);

  const isTriggeredRef = useRef(false);
  const isCompletedRef = useRef(false);

  // Complete helper: unlocks scroll and stores session flag
  const completeIntro = useCallback(() => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;
    setPhase('complete');
    setEnergyProgress(1);
    setHandoffProgress(1);

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

  // Main 2D Cinematic Sequence (Autonomous, decoupled from 3D models and fonts)
  useEffect(() => {
    if (!isHomepage || isCompletedRef.current) return;

    if (typeof window !== 'undefined') {
      (window as any).__ostrumPhase = 'stageA';
    }

    // Stage A Hold Timer: 850ms of deliberate pearl-white composition
    const stageATimer = setTimeout(() => {
      if (isCompletedRef.current || isTriggeredRef.current) return;
      isTriggeredRef.current = true;

      // Start Stage B: Crimson 2D Energy Sweep
      setPhase('stageB');
      if (typeof window !== 'undefined') {
        (window as any).__ostrumPhase = 'stageB';
      }
      window.dispatchEvent(new CustomEvent('ostrum:preloader-stageB'));

      const energyProxy = { p: 0 };
      gsap.to(energyProxy, {
        p: 1,
        duration: 0.85,
        ease: 'power2.inOut',
        onUpdate: () => {
          setEnergyProgress(energyProxy.p);
          window.dispatchEvent(
            new CustomEvent('ostrum:energy-progress', { detail: energyProxy.p })
          );
        },
        onComplete: () => {
          // Start Stage C: Reveal the Dark Hero
          setPhase('stageC');
          if (typeof window !== 'undefined') {
            (window as any).__ostrumPhase = 'stageC';
          }
          window.dispatchEvent(new CustomEvent('ostrum:preloader-stageC'));

          const handoffProxy = { p: 0 };
          gsap.to(handoffProxy, {
            p: 1,
            duration: 0.80,
            ease: 'power3.inOut',
            onUpdate: () => {
              setHandoffProgress(handoffProxy.p);
              window.dispatchEvent(
                new CustomEvent('ostrum:handoff-progress', { detail: handoffProxy.p })
              );
            },
            onComplete: () => {
              if (typeof window !== 'undefined') {
                (window as any).__ostrumPhase = 'complete';
              }
              completeIntro();
            },
          });
        },
      });
    }, 750);

    // Absolute fail-safe: Under no circumstances will a user be stuck for more than 2.8s
    const hardTimeout = setTimeout(() => {
      if (!isCompletedRef.current) {
        console.warn('[Preloader] Hard timeout reached, completing intro');
        completeIntro();
      }
    }, 2800);

    return () => {
      clearTimeout(stageATimer);
      clearTimeout(hardTimeout);
    };
  }, [isHomepage, completeIntro]);

  // Safe backward-compatible stubs (the loader does NOT wait for any 3D asset or font)
  const reportModelReady = useCallback(() => {}, []);
  const reportFirstFrame = useCallback(() => {}, []);
  const reportHeroTargetReady = useCallback(() => {}, []);
  const reportError = useCallback((_err: string) => {}, []);

  return (
    <PreloaderContext.Provider
      value={{
        phase,
        isReady: phase === 'stageC' || phase === 'complete',
        isComplete: phase === 'complete',
        handoffProgress,
        energyProgress,
        reportModelReady,
        reportFirstFrame,
        reportHeroTargetReady,
        reportError,
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
      handoffProgress: 1,
      energyProgress: 1,
      reportModelReady: () => {},
      reportFirstFrame: () => {},
      reportHeroTargetReady: () => {},
      reportError: () => {},
    };
  }
  return ctx;
}
