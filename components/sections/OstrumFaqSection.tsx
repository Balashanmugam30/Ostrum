'use client';

import React, { useState } from 'react';
import { OSTRUM_FAQ_DATA, FaqItem } from '@/data/faq';

export interface OstrumFaqSectionProps {
  items?: FaqItem[];
}

export function OstrumFaqSection({ items = OSTRUM_FAQ_DATA }: OstrumFaqSectionProps) {
  // First question open by default, matching reference
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      data-testid="faq-section"
      className="relative z-20 w-full overflow-hidden select-text text-black"
      style={{
        background: `
          radial-gradient(ellipse 65% 50% at 20% 35%, rgba(215, 230, 248, 0.5) 0%, transparent 70%),
          radial-gradient(ellipse 55% 55% at 85% 65%, rgba(225, 236, 250, 0.45) 0%, transparent 70%),
          linear-gradient(180deg, #FFFFFF 0%, #F4F7FB 40%, #E8EEF5 75%, #E3EAF2 100%)
        `,
      }}
      aria-label="Frequently Asked Questions"
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-16 lg:px-20 py-24 sm:py-32 lg:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Monumental FAQ Heading & Introduction */}
          <div className="lg:col-span-5 flex flex-col items-start lg:sticky lg:top-28">
            <span className="font-mono text-xs sm:text-sm uppercase tracking-[0.24em] font-semibold text-[#D24B2C] mb-4">
              QUESTIONS &amp; ANSWERS
            </span>
            <h2
              data-testid="faq-heading"
              className="font-condensed font-bold uppercase text-black tracking-[-0.01em] select-none"
              style={{
                fontSize: 'clamp(3.8rem, 9.5vw, 120px)',
                lineHeight: '0.88',
                color: '#000000',
              }}
            >
              FAQ
            </h2>
            <p className="font-sans text-base sm:text-lg text-[#4A5568] leading-relaxed max-w-sm mt-6 font-normal">
              Everything you need to know about partnering with Ostrum, our engineering practices, and delivering digital transformation.
            </p>
          </div>

          {/* Right Column: Clean Expandable Accordion List */}
          <div className="lg:col-span-7 flex flex-col w-full border-t border-black/10">
            {items.map((item, index) => {
              const isOpen = openId === item.id;
              return (
                <div
                  key={item.id}
                  data-testid={`faq-item-${index}`}
                  className="border-b border-black/10 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${item.id}`}
                    id={`faq-question-${item.id}`}
                    className="w-full flex items-center justify-between text-left py-6 sm:py-7 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#182B49] rounded-sm transition-colors"
                  >
                    <span
                      className={`font-sans text-base sm:text-lg md:text-xl font-medium tracking-tight pr-6 transition-colors duration-200 ${
                        isOpen ? 'text-[#182B49] font-semibold' : 'text-[#161514] group-hover:text-[#182B49]'
                      }`}
                    >
                      {item.question}
                    </span>

                    {/* Minimal Plus / Minus Indicator Icon */}
                    <span
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isOpen
                          ? 'bg-[#182B49] text-white rotate-180 shadow-sm'
                          : 'border border-black/20 text-black/75 group-hover:border-black/50 group-hover:text-black'
                      }`}
                      aria-hidden="true"
                    >
                      {isOpen ? (
                        <svg
                          className="w-3.5 h-3.5"
                          viewBox="0 0 14 14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <line x1="2" y1="7" x2="12" y2="7" />
                        </svg>
                      ) : (
                        <svg
                          className="w-3.5 h-3.5"
                          viewBox="0 0 14 14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <line x1="7" y1="2" x2="7" y2="12" />
                          <line x1="2" y1="7" x2="12" y2="7" />
                        </svg>
                      )}
                    </span>
                  </button>

                  {/* Smooth Restrained Expand / Collapse Container */}
                  <div
                    id={`faq-answer-${item.id}`}
                    role="region"
                    aria-labelledby={`faq-question-${item.id}`}
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="font-sans text-sm sm:text-base md:text-[16.5px] leading-relaxed text-[#4A5568] pb-7 pt-1 max-w-2xl font-normal">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default OstrumFaqSection;
