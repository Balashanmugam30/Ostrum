'use client';

import React, { useEffect } from 'react';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { RollingButton } from '@/components/ui/RollingButton';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error Captured:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20 px-6">
      <div className="max-w-md w-full text-center">
        <SectionKicker centered>System Telemetry // Runtime Error</SectionKicker>

        <h1 className="font-display font-bold text-3xl text-ink-primary mt-4 mb-4">
          A temporary synchronization issue occurred.
        </h1>

        <p className="text-sm text-ink-slate leading-relaxed mb-8">
          Our telemetry engine has logged this event. You can attempt to re-render the view or return to the main overview.
        </p>

        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-full bg-accent-terracotta text-white font-semibold text-sm hover:bg-accent-terracotta-hover transition-colors"
          >
            Retry Synchronization
          </button>
          <RollingButton href="/" variant="secondary">
            Return Home
          </RollingButton>
        </div>
      </div>
    </div>
  );
}
