import React from 'react';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { CornerCrosses } from '@/components/ui/CornerCrosses';

export function ToolingStack() {
  const categories = [
    {
      category: 'Frontend & Web',
      items: [
        { name: 'Next.js 15+ App Router', tag: 'React 19 SSR' },
        { name: 'TypeScript (Strict)', tag: 'Type Safety' },
        { name: 'Tailwind CSS', tag: 'Design Tokens' },
        { name: 'Web Standards', tag: 'WCAG 2.2 AA' },
      ],
    },
    {
      category: 'Backend & Databases',
      items: [
        { name: 'PostgreSQL', tag: 'Relational DB' },
        { name: 'Node.js / Bun', tag: 'High Concurrency' },
        { name: 'Python', tag: 'Data & OCR' },
        { name: 'Supabase', tag: 'Edge Postgres' },
      ],
    },
    {
      category: 'Automation & APIs',
      items: [
        { name: 'WhatsApp Cloud API', tag: 'Official Meta' },
        { name: 'Stripe & Razorpay', tag: 'PCI Payments' },
        { name: 'Anthropic & OpenAI', tag: 'Practical AI' },
        { name: 'REST & Webhooks', tag: 'Real-Time Sync' },
      ],
    },
    {
      category: 'Cloud & Observability',
      items: [
        { name: 'Vercel & AWS', tag: 'Global Edge' },
        { name: 'Cloudflare', tag: 'DDoS & CDN' },
        { name: 'Docker', tag: 'Containerized' },
        { name: 'GitHub Actions', tag: 'Automated CI/CD' },
      ],
    },
  ];

  return (
    <section
      id="stack"
      aria-labelledby="stack-title"
      className="py-32 sm:py-44 bg-canvas-cool border-b border-border-subtle"
    >
      <div className="max-w-[1240px] mx-auto px-6 md:px-8">
        <SectionKicker>Chapter 09 // Tooling & Infrastructure</SectionKicker>

        <h2
          id="stack-title"
          className="font-display font-bold text-3xl sm:text-4xl lg:text-[46px] leading-[1.08] tracking-tight text-ink-primary mb-4"
        >
          Built on proven, <span className="font-serif italic font-normal text-ink-primary/90">modern industry standards</span>.
        </h2>

        <p className="text-base sm:text-lg text-ink-slate max-w-2xl mb-12 leading-relaxed">
          We select reliable, high-performance technologies that are easy to maintain, globally supported, and free of vendor lock-in:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="relative bg-surface-card border border-border-subtle rounded-xl p-6 sm:p-7 shadow-subtle flex flex-col justify-between"
            >
              <CornerCrosses />

              <div>
                <h3 className="font-mono text-xs font-semibold text-accent-terracotta uppercase tracking-wider pb-3 mb-4 border-b border-border-subtle">
                  {cat.category}
                </h3>

                <ul className="flex flex-col gap-3">
                  {cat.items.map((tool, tIdx) => (
                    <li key={tIdx} className="flex justify-between items-center text-xs sm:text-[13px]">
                      <span className="font-semibold text-ink-primary">{tool.name}</span>
                      <span className="font-mono text-[11px] text-ink-muted">{tool.tag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
