import React from 'react';
import Link from 'next/link';
import { SectionKicker } from '@/components/ui/SectionKicker';

export const metadata = {
  title: 'Privacy Policy — Ostrum',
  description: 'Ostrum studio privacy policy and data governance practices.',
};

export default function PrivacyPage() {
  return (
    <div className="py-20 sm:py-28 bg-canvas-warm">
      <div className="max-w-[800px] mx-auto px-6 md:px-8">
        <SectionKicker>Legal & Data Governance</SectionKicker>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ink-primary tracking-tight mb-8">
          Privacy Policy
        </h1>

        <div className="flex flex-col gap-6 text-sm sm:text-base text-ink-slate leading-relaxed">
          <p>
            Last Updated: October 2026
          </p>
          <p>
            Ostrum Technologies (&quot;Ostrum&quot;, &quot;we&quot;, &quot;us&quot;) respects the privacy of our clients and site visitors. This Privacy Policy outlines our transparent approach to personal information collected via our website (https://ostrum.studio) and project inquiry brief channels.
          </p>
          <h2 className="font-display font-bold text-xl text-ink-primary mt-4">
            1. Information We Collect
          </h2>
          <p>
            When you submit a project brief or contact inquiry, we collect your name, business email address, company name, and project requirements. We collect this information solely to evaluate your technical scope and respond to your inquiry.
          </p>
          <h2 className="font-display font-bold text-xl text-ink-primary mt-4">
            2. How We Use Your Information
          </h2>
          <p>
            We never sell, rent, monetize, or share your contact details or project briefs with third-party data brokers or marketing lists. Your details are accessed exclusively by our founding principals and assigned senior engineers.
          </p>
          <h2 className="font-display font-bold text-xl text-ink-primary mt-4">
            3. Data Security & Storage
          </h2>
          <p>
            All website traffic and form submissions are encrypted in transit via Transport Layer Security (TLS 1.3). Data stored within our CRM pipelines adheres to strict enterprise encryption standards.
          </p>
          <div className="pt-8 mt-8 border-t border-border-subtle">
            <Link href="/" className="font-mono text-xs font-semibold text-accent-terracotta hover:underline">
              ← Return to Studio Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
