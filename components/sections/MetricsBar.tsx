import React from 'react';

export function MetricsBar() {
  const metrics = [
    {
      value: '99.98%',
      label: 'System Uptime SLA across deployed production architectures',
    },
    {
      value: '310ms',
      label: 'Average automated inquiry & WhatsApp data pipeline latency',
    },
    {
      value: '100%',
      label: 'Intellectual property & source code transferred directly to you',
    },
    {
      value: '0',
      label: 'Legacy software vendor lock-in or recurring proprietary seat fees',
    },
  ];

  return (
    <section className="bg-surface-card border-b border-border-subtle py-10 md:py-12" aria-label="Key Performance Indicators">
      <div className="max-w-[1240px] mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {metrics.map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                idx !== 0 ? 'lg:border-l lg:border-border-subtle lg:pl-8' : ''
              }`}
            >
              <span className="font-display font-extrabold text-3xl sm:text-4xl text-ink-primary tracking-tight leading-none mb-2">
                {item.value}
              </span>
              <p className="text-[13.5px] font-medium text-ink-slate leading-snug">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
