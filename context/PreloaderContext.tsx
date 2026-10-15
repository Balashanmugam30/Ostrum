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

export type PreloaderPhase = 'loading' | 'handoff' | 'complete';

export interface PreloaderContextValue {
  phase: PreloaderPhase;
  isReady: boolean;
  isComplete: boolean;
  handoffProgress: number;
  reportModelReady: () => void;
  reportFirstFrame: () => void;
  reportHeroTargetReady: () => void;
  reportError: (err: string) => void;
}

const PreloaderContext = createContext<PreloaderContextValue | null>(null);

export function PreloaderProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomepage = pathname === '/' || pathname === '' || pathname === '/fr';

  const [phase, setPhase] = useState<PreloaderPhase>(() =>
    isHomepage ? 'loading' : 'complete'
  );
  const [handoffProgress, setHandoffProgress] = useState(0);

  const gatesRef = useRef({
    model: false,
    firstFrame: false,
    bg: false,
    fonts: false,
    heroTarget: false,
  });

  const isTriggeredRef = useRef(false);
  const minTimePassedRef = useRef(false);

  // If not homepage, mark complete immediately
  useEffect(() => {
    if (!isHomepage) {
      setPhase('complete');
    }
  }, [isHomepage]);

  // Lock scroll during loading and handoff on homepage
  useEffect(() => {
    if (!isHomepage || phase === 'complete') return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    return () => {
      document.body.style.overflow = originalOverflow || '';
    };
  }, [isHomepage, phase]);

  // Deliberate minimum hold to prevent jarring micro-flash on warm cache
  useEffect(() => {
    if (!isHomepage || phase === 'complete') return;
    const timer = setTimeout(() => {
      minTimePassedRef.current = true;
      checkAllGates();
    }, 750);
    return () => clearTimeout(timer);
  }, [isHomepage, phase]);

  // Execute handoff animation
  const executeHandoff = useCallback(() => {
    if (isTriggeredRef.current) return;
    isTriggeredRef.current = true;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setHandoffProgress(1);
      setPhase('complete');
      document.body.style.overflow = '';
      window.dispatchEvent(new CustomEvent('ostrum:preloader-reveal'));
      window.dispatchEvent(
        new CustomEvent('ostrum:handoff-progress', { detail: 1 })
      );
      return;
    }

    setPhase('handoff');
    window.dispatchEvent(new CustomEvent('ostrum:preloader-handoff-start'));
    window.dispatchEvent(new CustomEvent('ostrum:preloader-reveal'));

    const proxy = { p: 0 };
    gsap.to(proxy, {
      p: 1,
      duration: 1.15,
      ease: 'power3.inOut',
      onUpdate: () => {
        setHandoffProgress(proxy.p);
        window.dispatchEvent(
          new CustomEvent('ostrum:handoff-progress', { detail: proxy.p })
        );
      },
      onComplete: () => {
        setHandoffProgress(1);
        setPhase('complete');
        document.body.style.overflow = '';
        window.dispatchEvent(new CustomEvent('ostrum:preloader-complete'));
      },
    });
  }, []);

  const checkAllGates = useCallback(() => {
    const g = gatesRef.current;
    if (
      minTimePassedRef.current &&
      g.model &&
      g.firstFrame &&
      g.bg &&
      g.fonts &&
      g.heroTarget
    ) {
      executeHandoff();
    }
  }, [executeHandoff]);

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

  // Readiness Gate 2: Background image asset
  useEffect(() => {
    if (!isHomepage) return;
    let isSubscribed = true;

    const img = new Image();
    img.src = '/images/bg.webp';

    const onBgDone = () => {
      if (isSubscribed) {
        gatesRef.current.bg = true;
        checkAllGates();
      }
    };

    if (img.complete) {
      onBgDone();
    } else {
      img.onload = onBgDone;
      img.onerror = onBgDone; // graceful fallback
    }

    return () => {
      isSubscribed = false;
    };
  }, [isHomepage, checkAllGates]);

  // Readiness Gate Safety Timeout (max 5s)
  useEffect(() => {
    if (!isHomepage || phase === 'complete') return;

    const safetyTimer = setTimeout(() => {
      if (!isTriggeredRef.current) {
        console.warn(
          '[Preloader] Safety timeout reached, triggering graceful handoff'
        );
        gatesRef.current.model = true;
        gatesRef.current.firstFrame = true;
        gatesRef.current.bg = true;
        gatesRef.current.fonts = true;
        gatesRef.current.heroTarget = true;
        executeHandoff();
      }
    }, 5000);

    return () => clearTimeout(safetyTimer);
  }, [isHomepage, phase, executeHandoff]);

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
      executeHandoff();
    },
    [executeHandoff]
  );

  return (
    <PreloaderContext.Provider
      value={{
        phase,
        isReady: phase !== 'loading',
        isComplete: phase === 'complete',
        handoffProgress,
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
      reportModelReady: () => {},
      reportFirstFrame: () => {},
      reportHeroTargetReady: () => {},
      reportError: () => {},
    };
  }
  return ctx;
}
