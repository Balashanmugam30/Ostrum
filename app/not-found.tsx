import React from 'react';
import Link from 'next/link';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { RollingButton } from '@/components/ui/RollingButton';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20 px-6">
      <div className="max-w-md w-full text-center">
        <SectionKicker centered>Error 404 // Page Missing</SectionKicker>

        <h1 className="font-display font-bold text-4xl text-ink-primary mt-4 mb-4">
          This coordinate does not exist.
        </h1>

        <p className="text-sm text-ink-slate leading-relaxed mb-8">
          The page or system blueprint you are looking for has been relocated or is currently undergoing synchronization.
        </p>

        <RollingButton href="/" variant="primary">
          Return to Studio Home ↗
        </RollingButton>
      </div>
    </div>
  );
}
