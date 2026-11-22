'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const MEASUREMENT_ID = 'G-Z8VEVVW4GY';
const CONSENT_KEY = 'ostrum-analytics-consent';

function hasPrivacySignal() {
  return (
    navigator.globalPrivacyControl === true ||
    navigator.doNotTrack === '1' ||
    window.doNotTrack === '1'
  );
}

declare global {
  interface Navigator {
    readonly globalPrivacyControl?: boolean;
  }

  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    openOstrumAnalyticsPreferences?: () => void;
    doNotTrack?: string;
  }
}

function loadAnalytics() {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, { send_page_view: false });

  if (!document.querySelector(`script[data-ostrum-analytics="${MEASUREMENT_ID}"]`)) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    script.dataset.ostrumAnalytics = MEASUREMENT_ID;
    document.head.appendChild(script);
  }
}

export function AnalyticsConsent() {
  const pathname = usePathname();
  const [choice, setChoice] = useState<'accepted' | 'rejected' | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const loaded = useRef(false);

  const saveChoice = useCallback((nextChoice: 'accepted' | 'rejected') => {
    if (nextChoice === 'accepted' && hasPrivacySignal()) {
      window.localStorage.setItem(CONSENT_KEY, 'rejected');
      setChoice('rejected');
      setShowBanner(false);
      return;
    }
    window.localStorage.setItem(CONSENT_KEY, nextChoice);
    setChoice(nextChoice);
    setShowBanner(false);

    if (nextChoice === 'accepted') {
      if (!loaded.current) {
        loadAnalytics();
        loaded.current = true;
      }
      window.gtag?.('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
    } else if (loaded.current) {
      window.gtag?.('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
    }
  }, []);

  useEffect(() => {
    if (hasPrivacySignal()) {
      window.localStorage.setItem(CONSENT_KEY, 'rejected');
      setChoice('rejected');
      window.openOstrumAnalyticsPreferences = () => setShowBanner(true);
      return () => {
        delete window.openOstrumAnalyticsPreferences;
      };
    }

    const storedChoice = window.localStorage.getItem(CONSENT_KEY);
    if (storedChoice === 'accepted' || storedChoice === 'rejected') {
      setChoice(storedChoice);
      if (storedChoice === 'accepted') {
        loadAnalytics();
        window.gtag?.('consent', 'update', {
          analytics_storage: 'granted',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        });
        loaded.current = true;
      }
    } else {
      setShowBanner(true);
    }

    window.openOstrumAnalyticsPreferences = () => setShowBanner(true);
    return () => {
      delete window.openOstrumAnalyticsPreferences;
    };
  }, []);

  useEffect(() => {
    if (choice === 'accepted' && loaded.current) {
      window.gtag?.('event', 'page_view', {
        page_path: pathname,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [choice, pathname]);

  if (!showBanner) return null;

  return (
    <aside
      aria-label="Analytics cookie preferences"
      className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-3xl rounded-xl border border-white/15 bg-[#111] p-5 text-white shadow-2xl sm:inset-x-6 sm:p-6"
      role="dialog"
      aria-modal="false"
      aria-describedby="analytics-consent-description"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <h2 className="text-base font-semibold">Your privacy choices</h2>
          <p id="analytics-consent-description" className="mt-1 text-sm leading-6 text-white/75">
            With your permission, Ostrum Tech uses Google Analytics to understand visits and improve the website. Analytics is off unless you accept. Read our{' '}
            <a className="underline underline-offset-2" href="/privacy-policy#cookies">Privacy Policy</a>.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            className="min-h-11 rounded-lg border border-white/30 px-4 text-sm font-medium hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={() => saveChoice('rejected')}
            type="button"
          >
            Reject analytics
          </button>
          <button
            className="min-h-11 rounded-lg bg-white px-4 text-sm font-semibold text-black hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={() => saveChoice('accepted')}
            type="button"
          >
            Accept analytics
          </button>
        </div>
      </div>
    </aside>
  );
}

export function AnalyticsPreferencesButton() {
  return (
    <button
      className="mt-4 rounded-md border border-[#64120F] px-4 py-2 text-sm font-medium text-[#64120F] hover:bg-[#64120F] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#64120F]"
      onClick={() => window.openOstrumAnalyticsPreferences?.()}
      type="button"
    >
      Change analytics preferences
    </button>
  );
}
