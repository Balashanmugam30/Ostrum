'use client';

import React from 'react';
import Link from 'next/link';
import SculptureHero from '@/components/ui/liquid-sculpture-hero';

export function OstrumLiquidSandCTA() {
  return (
    <section
      id="cta"
      data-testid="liquid-sand-cta-section"
      className="relative z-20 w-full min-h-[100svh] flex flex-col justify-center overflow-hidden select-text"
      style={{
        backgroundColor: '#050505',
        backgroundImage: 'linear-gradient(180deg, #0e0915 0%, #050505 14%, #050505 100%)',
      }}
      aria-label="Call to Action"
    >
      <SculptureHero
        theme="dark"
        darkBackground="#050505"
        background="#050505"
        textColor="#FAF9FF"
        accentColor="#FAF9FF"
        showNav={false}
        themeToggle={false}
        backdropText=""
        hint=""
        hintTouch=""
        showCredit={false}
        restStyle="image"
        sculptureScale={0.90}
        mobileSculptureScale={0.82}
        interactive={true}
        strength={1}
        radius={220}
        particleDensity={1}
        particleSpread={1}
        dotSize={1}
        turbulence={1}
        liquid={1}
        streaks={true}
        returnSpeed={1}
        ambient={false}
        ambientIntensity={1}
        speed={1}
        intro={false}
        height="100svh"
        darkSrc="https://cdn.21st.dev/assets/mirror/a1/a1fa387b6e417b26a25f317559c87cce4d241c1052c52a2b3bc2966b2aaf9b65.webp"
        mobileDarkSrc="https://cdn.21st.dev/assets/mirror/9a/9a82cb59be1bfde59855b79d7a565e487155a89f4d52eac74dcc10e267b2b6d1.webp"
      >
        <div className="relative z-10 w-full max-w-[1240px] mx-auto px-6 sm:px-10 flex flex-col items-center text-center -translate-y-2 sm:-translate-y-4">
          {/* Main Headline in Ostrum Condensed Font */}
          <h2
            data-testid="cta-heading"
            className="font-condensed font-bold uppercase text-[#FAF9FF] tracking-[-0.01em] select-none text-balance"
            style={{
              fontSize: 'clamp(3.2rem, 8.5vw, 118px)',
              lineHeight: '0.90',
              maxWidth: '1050px',
              textShadow: '0 2px 5px rgba(0,0,0,0.92), 0 4px 14px rgba(0,0,0,0.72), 0 0 24px rgba(0,0,0,0.38)',
            }}
          >
            HAVE AN IDEA?
            <br />
            LET’S BUILD IT.
          </h2>

          {/* Supporting Sentence */}
          <p
            className="font-sans text-base sm:text-lg md:text-xl text-[#FAF9FF] font-medium leading-relaxed max-w-xl mt-5 sm:mt-6 text-pretty select-none"
            style={{
              textShadow: '0 1px 3px rgba(0,0,0,0.95), 0 2px 9px rgba(0,0,0,0.62)',
            }}
          >
            Digital products, intelligent systems, and experiences built around what you need.
          </p>

          {/* Primary CTA Button pointing to /#contact */}
          <div className="mt-8 sm:mt-9">
            <Link
              href="/#contact"
              data-testid="cta-primary-button"
              className="inline-flex items-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-white hover:bg-[#FAF9FF] text-[#050505] font-sans text-base sm:text-lg font-bold shadow-[0_4px_24px_rgba(255,255,255,0.12)] hover:shadow-[0_8px_32px_rgba(255,255,255,0.24)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <span>Start a Project</span>
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 12L12 4M12 4H6M12 4V10" />
              </svg>
            </Link>
          </div>
        </div>
      </SculptureHero>
    </section>
  );
}

export default OstrumLiquidSandCTA;
