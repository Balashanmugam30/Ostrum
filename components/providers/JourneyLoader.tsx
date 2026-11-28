'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const OstrumContinuousJourney = dynamic(
  () =>
    import('@/components/visuals/OstrumContinuousJourney').then(
      (mod) => mod.OstrumContinuousJourney,
    ),
  { ssr: false },
);

/**
 * Defers the Three.js / GLTF hero journey chunk off the critical initial HTML/layout
 * hydration bundle and avoids loading Three.js entirely on legal routes.
 */
export function JourneyLoader() {
  const pathname = usePathname();
  const isLegalPage =
    pathname?.startsWith('/terms-and-conditions') ||
    pathname?.startsWith('/privacy-policy');

  if (isLegalPage) {
    return null;
  }

  return <OstrumContinuousJourney />;
}
