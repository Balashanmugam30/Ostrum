import React from 'react';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { CornerCrosses } from '@/components/ui/CornerCrosses';
import { RollingButton } from '@/components/ui/RollingButton';
import { pricingData } from '@/content/pricing';

export function EngagementModels() {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-title"
      className="py-24 sm:py-32 bg-surface-card border-b border-border-subtle"
    >
      <div className="max-w-[1240px] mx-auto px-6 md:px-8">
        <SectionKicker>Chapter 13 // Engagement Models</SectionKicker>

        <h2
          id="pricing-title"
          className="font-display font-bold text-3xl sm:text-4xl lg:text-[44px] leading-tight tracking-tight text-ink-primary mb-3"
        >
          Clear investment. No hidden extras.
        </h2>

        <p className="text-base sm:text-lg text-ink-slate max-w-2xl mb-12 leading-relaxed">
          Choose the engagement model that best matches your company&apos;s stage and immediate operational priorities:
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {pricingData.map((tier) => (
            <div
              key={tier.id}
              className={`relative bg-surface-card rounded-2xl p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 ${
                tier.featured
                  ? 'border-2 border-accent-terracotta shadow-card lg:-translate-y-2'
                  : 'border border-border-subtle shadow-subtle hover:border-border-strong'
              }`}
            >
              <CornerCrosses />

              <div>
                {tier.badge && (
                  <span className="inline-block font-mono text-[11px] font-bold text-accent-terracotta bg-accent-terracotta-tint border border-accent-terracotta/30 px-3 py-1 rounded-full mb-4">
                    {tier.badge}
                  </span>
                )}

                <h3 className="font-display font-bold text-2xl text-ink-primary mb-2">
                  {tier.name}
                </h3>

                <p className="text-sm text-ink-slate mb-6 min-h-[40px] leading-relaxed">
                  {tier.description}
                </p>

                <div className="mb-8 pb-6 border-b border-border-subtle">
                  <span className="font-display font-extrabold text-4xl text-ink-primary">
                    {tier.price}
                  </span>
                  <span className="font-mono text-xs text-ink-muted ml-2">
                    / {tier.period}
                  </span>
                </div>

                <ul className="flex flex-col gap-3.5 mb-10 text-sm text-ink-slate">
                  {tier.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <span className="text-accent-sage font-bold select-none" aria-hidden="true">
                        ✔
                      </span>
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <RollingButton
                href={tier.ctaHref}
                variant={tier.featured ? 'terracotta' : 'secondary'}
                className="w-full justify-center py-3 text-sm font-bold"
                subLabel="Zero Sales Spam Guaranteed"
              >
                {tier.ctaText}
              </RollingButton>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
