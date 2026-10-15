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
  | 'stageA'    // Pearl Emergence (pearl-white field, centering sculpture)
  | 'stageB'    // Crimson Energy Transition (sweeping red field across viewport)
  | 'stageC'    // Hero Handoff (transition to dark hero, model docking into 'O')
  | 'complete'; // Completed, interaction restored, overlay unmounted

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

  const gatesRef = useRef({
    model: false,
    firstFrame: false,
    fonts: false,
    heroTarget: false,
  });

  const isTriggeredRef = useRef(false);
  const minStageAPassedRef = useRef(false);

  // Check session storage on client mount
  useEffect(() => {
    if (!isHomepage) {
      setPhase('complete');
      return;
    }

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const isReplayRequested = urlParams.get('replay') === 'true' || urlParams.get('replay') === '1';

      if (!isReplayRequested) {
        const hasViewed = sessionStorage.getItem(SESSION_KEY);
        if (hasViewed) {
          setPhase('complete');
          setHandoffProgress(1);
          setEnergyProgress(1);
          return;
        }
      }
    } catch {
      // Graceful fallback if sessionStorage is inaccessible
    }

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('complete');
      setHandoffProgress(1);
      setEnergyProgress(1);
      return;
    }
  }, [isHomepage]);

  // Lock scroll during preloader on homepage
  useEffect(() => {
    if (!isHomepage || phase === 'complete') {
      document.body.style.overflow = '';
      if (typeof window !== 'undefined' && (window as any).lenis) {
        (window as any).lenis.start?.();
      }
      return;
    }

    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    if (typeof window !== 'undefined' && (window as any).lenis) {
      (window as any).lenis.stop?.();
    }

    return () => {
      document.body.style.overflow = '';
      if (typeof window !== 'undefined' && (window as any).lenis) {
        (window as any).lenis.start?.();
      }
    };
  }, [isHomepage, phase]);

  // Execute Stage B (Crimson Energy Transition) and Stage C (Hero Handoff)
  const executeSequence = useCallback(() => {
    if (isTriggeredRef.current) return;
    isTriggeredRef.current = true;

    // Start Stage B: Crimson Energy Transition
    setPhase('stageB');
    window.dispatchEvent(new CustomEvent('ostrum:preloader-stageB'));

    // Animate energy progress across 1.35s
    const energyProxy = { p: 0 };
    gsap.to(energyProxy, {
      p: 1,
      duration: 1.35,
      ease: 'power2.inOut',
      onUpdate: () => {
        setEnergyProgress(energyProxy.p);
        window.dispatchEvent(
          new CustomEvent('ostrum:energy-progress', { detail: energyProxy.p })
        );
      },
      onComplete: () => {
        // Transition into Stage C: Hero Handoff
        setPhase('stageC');
        window.dispatchEvent(new CustomEvent('ostrum:preloader-stageC'));

        const handoffProxy = { p: 0 };
        gsap.to(handoffProxy, {
          p: 1,
          duration: 1.35,
          ease: 'power3.inOut',
          onUpdate: () => {
            setHandoffProgress(handoffProxy.p);
            window.dispatchEvent(
              new CustomEvent('ostrum:handoff-progress', { detail: handoffProxy.p })
            );
          },
          onComplete: () => {
            setHandoffProgress(1);
            setPhase('complete');
            document.body.style.overflow = '';
            if (typeof window !== 'undefined' && (window as any).lenis) {
              (window as any).lenis.start?.();
            }
            try {
              sessionStorage.setItem(SESSION_KEY, 'true');
            } catch {}
            window.dispatchEvent(new CustomEvent('ostrum:preloader-complete'));
          },
        });
      },
    });
  }, []);

  const checkAllGates = useCallback(() => {
    const g = gatesRef.current;
    if (
      minStageAPassedRef.current &&
      g.model &&
      g.firstFrame &&
      g.fonts &&
      g.heroTarget
    ) {
      executeSequence();
    }
  }, [executeSequence]);

  // Minimum Stage A duration (~1.2s) so the pearl emergence can be appreciated
  useEffect(() => {
    if (!isHomepage || phase === 'complete') return;
    const timer = setTimeout(() => {
      minStageAPassedRef.current = true;
      checkAllGates();
    }, 1200);
    return () => clearTimeout(timer);
  }, [isHomepage, phase, checkAllGates]);

  // Readiness Gate 1: Fonts
  useEffect(() => {
    if (!isHomepage) return;
    let isSubscribed = true;

    const loadFonts = async () => {
      try {
        if (typeof document !== 'undefined' && document.fonts) {
          await document.fonts.ready;
          await Promise.allSettled([
            document.fonts.load('400 1em "Romie"'),
            document.fonts.load('400 1em "Neue Montreal"'),
          ]);
        }
      } catch (err) {
        console.warn('[Preloader] Font check fallback:', err);
      } finally {
        if (isSubscribed) {
          gatesRef.current.fonts = true;
          checkAllGates();
        }
      }
    };

    loadFonts();
    return () => {
      isSubscribed = false;
    };
  }, [isHomepage, checkAllGates]);

  // Safety Timeout: Never let the user get stuck if any asset or WebGL fails (4.5s)
  useEffect(() => {
    if (!isHomepage || phase === 'complete') return;

    const safetyTimer = setTimeout(() => {
      if (!isTriggeredRef.current) {
        console.warn('[Preloader] Safety timeout reached, triggering handoff');
        gatesRef.current.model = true;
        gatesRef.current.firstFrame = true;
        gatesRef.current.fonts = true;
        gatesRef.current.heroTarget = true;
        executeSequence();
      }
    }, 4500);

    return () => clearTimeout(safetyTimer);
  }, [isHomepage, phase, executeSequence]);

  const reportModelReady = useCallback(() => {
    gatesRef.current.model = true;
    checkAllGates();
  }, [checkAllGates]);

  const reportFirstFrame = useCallback(() => {
    gatesRef.current.firstFrame = true;
    checkAllGates();
  }, [checkAllGates]);

  const reportHeroTargetReady = useCallback(() => {
    gatesRef.current.heroTarget = true;
    checkAllGates();
  }, [checkAllGates]);

  const reportError = useCallback(
    (err: string) => {
      console.warn('[Preloader] Error reported, triggering fallback:', err);
      executeSequence();
    },
    [executeSequence]
  );

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
