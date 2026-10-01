'use client';

import React, { useState } from 'react';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { faqsData } from '@/content/faqs';

export function FaqAccordion() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="py-32 sm:py-44 bg-canvas-cool border-b border-border-subtle"
    >
      <div className="max-w-[860px] mx-auto px-6 md:px-8">
        <div className="text-center mb-12">
          <SectionKicker centered>Chapter 15 // Critical Inquiries</SectionKicker>

          <h2
            id="faq-title"
            className="font-display font-bold text-3xl sm:text-4xl lg:text-[46px] leading-[1.08] tracking-tight text-ink-primary mb-4"
          >
            Frequently asked <span className="font-serif italic font-normal text-ink-primary/90">questions</span>.
          </h2>

          <p className="text-base sm:text-lg text-ink-slate max-w-xl mx-auto leading-relaxed">
            Honest, straightforward answers to the practical questions business leaders ask before partnering with us:
          </p>
        </div>

        <div className="flex flex-col gap-3.5">
          {faqsData.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden transition-colors hover:border-border-strong"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${item.id}`}
                  className="w-full text-left p-6 sm:p-7 flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-terracotta"
                >
                  <span className="font-display font-bold text-base sm:text-lg text-ink-primary">
                    {item.question}
                  </span>
                  <span
                    className={`font-mono text-xl text-accent-terracotta transition-transform duration-200 select-none ${
                      isOpen ? 'rotate-45' : 'rotate-0'
                    }`}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${item.id}`}
                    role="region"
                    className="px-6 pb-6 sm:px-7 sm:pb-7 text-sm sm:text-[15px] text-ink-slate leading-relaxed border-t border-border-subtle/50 pt-4"
                  >
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
