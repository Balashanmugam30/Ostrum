'use client';

import React, { useState, useEffect, useRef } from 'react';
import { OSTRUM_FAQ_DATA, FaqItem } from '@/data/faq';

export interface OstrumFaqSectionProps {
  items?: FaqItem[];
}

export function OstrumFaqSection({ items = OSTRUM_FAQ_DATA }: OstrumFaqSectionProps) {
  // First question open by default
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null);
  const [typedLength, setTypedLength] = useState<number>(() => items[0]?.answer.length || 0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  const openIdRef = useRef<string | null>(openId);
  openIdRef.current = openId;

  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = () => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  };

  const openQuestion = (id: string) => {
    if (openIdRef.current === id) return;
    openIdRef.current = id;
    clearTimer();
    setOpenId(id);

    const targetItem = items.find((it) => it.id === id);
    if (!targetItem) return;

    if (prefersReducedMotion) {
      setTypedLength(targetItem.answer.length);
      return;
    }

    setTypedLength(0);
    const targetLength = targetItem.answer.length;
    let currentLength = 0;
    const speedMs = 18; // 18ms per character (within 15-22ms range)

    typingTimerRef.current = setInterval(() => {
      currentLength += 1;
      setTypedLength(currentLength);
      if (currentLength >= targetLength) {
        clearTimer();
      }
    }, speedMs);
  };

  const toggleQuestion = (id: string) => {
    if (openIdRef.current === id) {
      clearTimer();
      openIdRef.current = null;
      setOpenId(null);
      setTypedLength(0);
    } else {
      openQuestion(id);
    }
  };

  // If reduced motion is activated while open, immediately show full text
  useEffect(() => {
    if (prefersReducedMotion && openId) {
      clearTimer();
      const currentItem = items.find((it) => it.id === openId);
      if (currentItem) {
        setTypedLength(currentItem.answer.length);
      }
    }
  }, [prefersReducedMotion, openId, items]);

  // Clean up any ongoing typing operations on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  return (
    <section
      id="faq"
      data-testid="faq-section"
      className="relative z-20 w-full overflow-hidden select-text text-black bg-transparent"
      aria-label="Frequently Asked Questions"
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-16 lg:px-20 py-24 sm:py-32 lg:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Monumental Heading & Clean Supporting Copy */}
          <div className="lg:col-span-5 flex flex-col items-start lg:sticky lg:top-28">
            <h2
              data-testid="faq-heading"
              className="font-condensed font-bold uppercase text-[#161514] tracking-[-0.01em] select-text"
              style={{
                fontSize: 'clamp(2.8rem, 6vw, 76px)',
                lineHeight: '0.92',
                color: '#161514',
              }}
            >
              Frequently Asked Questions
            </h2>
            <p className="font-sans text-base sm:text-lg text-[#242424] leading-relaxed max-w-sm mt-6 font-normal">
              Clear insights into our engineering scope, collaborative process, and technical delivery.
            </p>
          </div>

          {/* Right Column: Clean Expandable Accordion List with Hover Typewriter */}
          <div className="lg:col-span-7 flex flex-col w-full border-t border-black/15">
            {items.map((item, index) => {
              const isOpen = openId === item.id;
              return (
                <div
                  key={item.id}
                  data-testid={`faq-item-${index}`}
                  onMouseEnter={() => openQuestion(item.id)}
                  onPointerEnter={() => openQuestion(item.id)}
                  className="border-b border-black/15 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleQuestion(item.id)}
                    onMouseEnter={() => openQuestion(item.id)}
                    onPointerEnter={() => openQuestion(item.id)}
                    onFocus={(e) => {
                      if (typeof e.target.matches === 'function' && e.target.matches(':focus-visible')) {
                        openQuestion(item.id);
                      }
                    }}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${item.id}`}
                    id={`faq-question-${item.id}`}
                    className="w-full flex items-center justify-between text-left py-6 sm:py-7 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D24B2C] rounded-sm transition-colors cursor-pointer"
                  >
                    <span
                      className={`font-sans text-base sm:text-lg md:text-xl tracking-tight pr-6 transition-colors duration-200 text-[#161514] ${
                        isOpen
                          ? 'font-semibold'
                          : 'font-medium group-hover:text-black'
                      }`}
                    >
                      {item.question}
                    </span>

                    {/* Minimal Plus / Minus Indicator Icon */}
                    <span
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isOpen
                          ? 'bg-[#42100F] text-[#FFF8F3] rotate-180 shadow-sm'
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

                  {/* Smooth Restrained Expand / Collapse Container with Typewriter Display */}
                  <div
                    id={`faq-answer-${item.id}`}
                    role="region"
                    aria-labelledby={`faq-question-${item.id}`}
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                      isOpen
                        ? 'grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="overflow-hidden">
                      {/* Accessible Full Answer for Screen Readers */}
                      <p className="sr-only">{item.answer}</p>

                      {/* Visual Letter-by-Letter Animated Text */}
                      <p
                        aria-hidden="true"
                        className="font-sans text-sm sm:text-base md:text-[16px] leading-relaxed text-[#242424] pb-7 pt-1 max-w-2xl font-normal"
                      >
                        {isOpen ? item.answer.slice(0, typedLength) : ''}
                        {isOpen && typedLength < item.answer.length && (
                          <span
                            className="inline-block w-[2px] h-[1.1em] bg-[#D24B2C] ml-0.5 align-middle animate-pulse"
                            aria-hidden="true"
                          />
                        )}
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
