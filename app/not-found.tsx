import React from 'react';
import { PrimaryBtn } from '@/components/ui/PrimaryBtn';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20 px-6 text-center">
      <div className="max-w-md w-full flex flex-col items-center">
        <h1 className="h1 font-serif text-5xl text-white mb-4">
          404
        </h1>

        <p className="text-base text-white/70 leading-relaxed mb-8">
          The requested space does not exist.
        </p>

        <PrimaryBtn href="/" theme="white">
          Return Home
        </PrimaryBtn>
      </div>
    </div>
  );
}
