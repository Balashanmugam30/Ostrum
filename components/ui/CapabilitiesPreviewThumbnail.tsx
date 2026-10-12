'use client';

import React from 'react';
import { CAPABILITIES_DATA } from '@/components/sections/OstrumCapabilitiesSection';

export function CapabilitiesPreviewThumbnail({
  className = '',
}: {
  className?: string;
}) {
  return (
    <div
      data-testid="capabilities-transition-preview"
      className={`relative w-full h-full overflow-hidden rounded-2xl select-none pointer-events-none flex flex-col justify-between p-3.5 sm:p-5 md:p-6 shadow-[0_20px_45px_-10px_rgba(11,11,16,0.14)] border border-black/[0.08] bg-white ${className}`}
      style={{
        background:
          'linear-gradient(180deg, rgba(191,235,247,0.48) 0%, rgba(255,255,255,0.94) 13%, #FFFFFF 26%)',
        backgroundColor: '#FFFFFF',
      }}
      aria-label="Capabilities Miniature Preview"
    >
      {/* Miniature Header */}
      <div className="w-full flex items-start justify-between gap-2 shrink-0">
        <div>
          <h4 className="font-sans font-bold tracking-tight text-[#0B0B10] text-sm sm:text-base md:text-lg leading-tight">
            Our Capabilities
          </h4>
          <p className="font-sans text-[10px] sm:text-[11px] text-black/60 leading-relaxed max-w-[28ch] sm:max-w-[32ch] mt-0.5 line-clamp-2">
            Systems that move businesses forward—digital experiences, software &amp; hardware.
          </p>
        </div>
        <span className="font-mono text-[9px] sm:text-[10px] font-semibold text-black/45 tracking-wider shrink-0 mt-0.5">
          01 / 06
        </span>
      </div>

      {/* Miniature Horizontal Catalogue Row */}
      <div className="relative w-full my-auto py-1 overflow-hidden">
        {/* Soft edge fades on mini catalogue */}
        <div
          className="absolute left-0 top-0 bottom-0 w-4 z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(to right, rgba(255,255,255,0.9), transparent)',
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-4 z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(to left, rgba(255,255,255,0.9), transparent)',
          }}
        />

        <div className="flex items-stretch gap-2 sm:gap-2.5 overflow-hidden pl-1">
          {CAPABILITIES_DATA.map((card) => (
            <div
              key={card.index}
              className="shrink-0 w-[85px] sm:w-[105px] md:w-[115px] h-[115px] sm:h-[135px] md:h-[145px] rounded-xl p-2 sm:p-2.5 flex flex-col justify-between border border-black/[0.06] shadow-sm"
              style={{
                background: card.gradient,
              }}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-mono text-[8px] sm:text-[9px] font-bold text-black/50">
                  {card.index.split(' ')[0]}
                </span>
                <span className="w-1 h-1 rounded-full bg-black/25" />
              </div>

              {/* Miniature Sculptural Artwork Glyph */}
              <div className="w-full flex items-center justify-center my-auto py-1">
                {card.variant === 1 && (
                  // Icosahedron faceted crystal
                  <svg
                    viewBox="0 0 24 24"
                    className="w-7 h-7 sm:w-9 sm:h-9 text-[#8443D6] opacity-80"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  >
                    <polygon points="12 2 21 8 21 16 12 22 3 16 3 8" fill="rgba(215,181,250,0.4)" />
                    <line x1="12" y1="2" x2="12" y2="22" />
                    <line x1="3" y1="8" x2="21" y2="16" />
                    <line x1="21" y1="8" x2="3" y2="16" />
                  </svg>
                )}
                {card.variant === 2 && (
                  // Neural orbital core
                  <svg
                    viewBox="0 0 24 24"
                    className="w-7 h-7 sm:w-9 sm:h-9 text-[#078567] opacity-80"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  >
                    <circle cx="12" cy="12" r="4.5" fill="#86FFF8" stroke="#00C4B4" />
                    <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-30 12 12)" />
                    <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(30 12 12)" />
                  </svg>
                )}
                {card.variant === 3 && (
                  // Isometric modular cubes
                  <svg
                    viewBox="0 0 24 24"
                    className="w-7 h-7 sm:w-9 sm:h-9 text-[#D47E20] opacity-80"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  >
                    <path d="M12 2 L19 6 L12 10 L5 6 Z" fill="rgba(250,194,116,0.6)" />
                    <path d="M5 6 L12 10 L12 17 L5 13 Z" fill="rgba(242,164,96,0.7)" />
                    <path d="M19 6 L12 10 L12 17 L19 13 Z" fill="rgba(212,126,32,0.8)" />
                  </svg>
                )}
                {card.variant === 4 && (
                  // Layered plates
                  <svg
                    viewBox="0 0 24 24"
                    className="w-7 h-7 sm:w-9 sm:h-9 text-[#362BEB] opacity-80"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  >
                    <ellipse cx="12" cy="7" rx="8" ry="2.5" fill="rgba(187,203,255,0.6)" />
                    <ellipse cx="12" cy="12" rx="8" ry="2.5" fill="rgba(187,203,255,0.7)" />
                    <ellipse cx="12" cy="17" rx="8" ry="2.5" fill="rgba(187,203,255,0.8)" />
                  </svg>
                )}
                {card.variant === 5 && (
                  // Precision sensor cylinder
                  <svg
                    viewBox="0 0 24 24"
                    className="w-7 h-7 sm:w-9 sm:h-9 text-[#0B8462] opacity-80"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  >
                    <rect x="7" y="5" width="10" height="14" rx="2" fill="rgba(189,236,207,0.7)" />
                    <ellipse cx="12" cy="5" rx="5" ry="1.5" />
                    <line x1="4" y1="12" x2="20" y2="12" strokeWidth="1.6" />
                  </svg>
                )}
                {card.variant === 6 && (
                  // Torus knot loop
                  <svg
                    viewBox="0 0 24 24"
                    className="w-7 h-7 sm:w-9 sm:h-9 text-[#A03598] opacity-80"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  >
                    <circle cx="9" cy="12" r="5" strokeWidth="1.4" />
                    <circle cx="15" cy="12" r="5" strokeWidth="1.4" />
                    <path d="M12 7 Q14 12 12 17" strokeWidth="1.4" />
                  </svg>
                )}
              </div>

              {/* Title & Tag snippet */}
              <div className="shrink-0">
                <p className="font-sans font-bold text-[8px] sm:text-[9px] text-[#0B0B10] leading-tight truncate">
                  {card.title}
                </p>
                <p className="font-sans text-[7px] text-black/55 truncate mt-0.5">
                  {card.tags[0]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Miniature Status Baseline */}
      <div className="w-full flex items-center justify-between font-mono text-[8px] sm:text-[9px] text-black/40 shrink-0 pt-1 border-t border-black/[0.04]">
        <span>CAPABILITIES CATALOGUE</span>
        <span>SCROLL TO ENTER →</span>
      </div>
    </div>
  );
}

export default CapabilitiesPreviewThumbnail;
