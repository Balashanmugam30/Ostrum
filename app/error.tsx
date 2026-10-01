'use client';

import React, { useEffect } from 'react';
import { PrimaryBtn } from '@/components/ui/PrimaryBtn';

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
    <div className="min-h-[80vh] flex items-center justify-center py-20 px-6 text-center">
      <div className="max-w-md w-full flex flex-col items-center">
        <h1 className="h1 font-serif text-4xl text-white mb-4">
          Something went wrong.
        </h1>

        <p className="text-sm text-white/70 leading-relaxed mb-8">
          An unexpected interruption occurred. You can retry or return to the main narrative.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <PrimaryBtn onClick={() => reset()}>
            Retry
          </PrimaryBtn>
          <PrimaryBtn href="/" theme="white">
            Return Home
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}
