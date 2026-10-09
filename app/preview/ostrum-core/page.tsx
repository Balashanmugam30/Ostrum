'use client';

import React, { useState } from 'react';
import {
  OstrumCore3D,
  OstrumMaterialVariationKey,
  OSTRUM_VARIATIONS,
} from '@/components/visuals/OstrumCore3D';

export default function OstrumCore3DPreviewPage() {
  const [activeVariation, setActiveVariation] =
    useState<OstrumMaterialVariationKey>('ostrum-pearl');
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [cameraDistance, setCameraDistance] = useState(7.5); // 7.5 = standard; 5.2 = close-up
  const [autoRotate, setAutoRotate] = useState(false);
  const [cleanPresentation, setCleanPresentation] = useState(false);

  const rotationRadians = (rotationDegrees * Math.PI) / 180;
  const currentConfig = OSTRUM_VARIATIONS[activeVariation];

  const variationKeys: OstrumMaterialVariationKey[] = [
    'ostrum-pearl',
    'crimson-porcelain',
    'sculptural-satin',
  ];

  const angles = [
    { label: '0° Front', deg: 0 },
    { label: '45° 3/4 View', deg: 45 },
    { label: '90° Side', deg: 90 },
    { label: '135° 3/4 Rev', deg: 135 },
    { label: '180° Back', deg: 180 },
    { label: '270° Opp Side', deg: 270 },
    { label: '360° Full Loop', deg: 360 },
  ];

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-6 select-none bg-transparent">
      {/* Top Header Bar */}
      <header className="z-20 w-full max-w-6xl flex flex-wrap items-center justify-between gap-4 pt-20 sm:pt-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/50">
              Ostrum 3D Signature Stage
            </span>
          </div>
          <h1 className="font-serif text-xl sm:text-2xl tracking-tight text-white/90">
            {currentConfig.name}
          </h1>
          <p className="text-xs text-white/60 font-sans max-w-md">
            {currentConfig.subtitle} &mdash;{' '}
            <span className="text-amber-300/80 italic">{currentConfig.character}</span>
          </p>
        </div>

        {/* Top Actions: Framing & Presentation Mode */}
        <div className="flex items-center gap-2">
          {/* Camera Framing Toggle */}
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 text-xs font-mono">
            <button
              onClick={() => setCameraDistance(7.5)}
              className={`px-3 py-1.5 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                cameraDistance === 7.5
                  ? 'bg-white/20 text-white font-medium shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
              aria-label="Standard Camera Framing"
            >
              Standard
            </button>
            <button
              onClick={() => setCameraDistance(5.2)}
              className={`px-3 py-1.5 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                cameraDistance === 5.2
                  ? 'bg-white/20 text-white font-medium shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
              aria-label="Close-up Camera Framing"
            >
              Close-Up
            </button>
          </div>

          {/* Clean Presentation Mode Toggle */}
          <button
            onClick={() => setCleanPresentation(!cleanPresentation)}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono border transition-all focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
              cleanPresentation
                ? 'bg-amber-400/20 text-amber-200 border-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border-white/10'
            }`}
            aria-label={
              cleanPresentation
                ? 'Exit Clean Presentation Mode'
                : 'Enter Clean Presentation Mode'
            }
          >
            {cleanPresentation ? 'Show Controls' : 'Clean Presentation'}
          </button>
        </div>
      </header>

      {/* 3D Model Center Stage (Unobstructed, transparent) */}
      <main
        className="relative w-full max-w-5xl h-[62vh] sm:h-[68vh] flex items-center justify-center my-auto"
        data-testid="stage-viewport"
      >
        <OstrumCore3D
          variation={activeVariation}
          rotationY={rotationRadians}
          autoRotate={autoRotate}
          cameraDistance={cameraDistance}
          className="w-full h-full"
          scale={cameraDistance === 5.2 ? 1.05 : 1.0}
        />
      </main>

      {/* Floating Control Studio Bar (Bottom) */}
      {!cleanPresentation ? (
        <footer
          className="z-20 w-full max-w-4xl bg-black/45 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-2xl transition-all"
          data-testid="preview-control-bar"
        >
          {/* Row 1: Variation Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <span className="font-mono text-xs uppercase tracking-wider text-white/50">
              Material Variation
            </span>
            <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
              {variationKeys.map((key) => {
                const conf = OSTRUM_VARIATIONS[key];
                const isActive = activeVariation === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveVariation(key)}
                    className={`px-3 py-2 rounded-xl text-xs font-mono text-center transition-all focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                      isActive
                        ? 'bg-amber-400/25 text-amber-200 border border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.25)] font-medium'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                    aria-pressed={isActive}
                  >
                    {conf.name.replace('Variation ', 'Var ')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Target Angles & Auto-Rotate */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-xs text-white/40 mr-1 hidden sm:inline">
                Angle:
              </span>
              {angles.map((a) => (
                <button
                  key={a.deg}
                  onClick={() => {
                    setAutoRotate(false);
                    setRotationDegrees(a.deg);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                    rotationDegrees === a.deg && !autoRotate
                      ? 'bg-amber-400/25 text-amber-200 border border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.2)] font-semibold'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
                  aria-label={`Rotate to ${a.label}`}
                >
                  {a.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAutoRotate(false);
                  setRotationDegrees(0);
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-white/5 text-white/60 hover:text-white border border-white/5 transition-all focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
                aria-label="Reset Angle to 0 degrees"
              >
                Reset
              </button>
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                  autoRotate
                    ? 'bg-emerald-400/25 text-emerald-200 border border-emerald-400/40 shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
                aria-label="Toggle Auto-Rotation"
              >
                {autoRotate ? 'Auto: ON' : 'Auto: OFF'}
              </button>
            </div>
          </div>

          {/* Row 3: Continuous Angle Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-mono text-white/70">
              <span>Scrub Angle (0° &mdash; 360°)</span>
              <span className="text-amber-300 font-semibold">{rotationDegrees.toFixed(1)}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={rotationDegrees}
              onChange={(e) => {
                setAutoRotate(false);
                setRotationDegrees(parseFloat(e.target.value));
              }}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
              aria-label="Rotation Angle Scrubber"
            />
          </div>
        </footer>
      ) : (
        /* Minimal pill in clean presentation mode */
        <div className="z-20 fixed bottom-6 flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/15 px-4 py-2 rounded-full shadow-2xl">
          <span className="text-xs font-mono text-white/70">
            {currentConfig.name.split('—')[1]?.trim() || currentConfig.name} &bull;{' '}
            <span className="text-amber-300">{rotationDegrees.toFixed(0)}°</span>
          </span>
          <button
            onClick={() => setCleanPresentation(false)}
            className="text-xs font-mono text-white/90 hover:text-amber-300 underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
          >
            Show Controls
          </button>
        </div>
      )}
    </div>
  );
}
