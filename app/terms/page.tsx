import React from 'react';
import Link from 'next/link';
import { SectionKicker } from '@/components/ui/SectionKicker';

export const metadata = {
  title: 'Terms of Service & IP Transfer — Ostrum',
  description: 'Ostrum studio commercial terms and 100% intellectual property ownership guarantees.',
};

export default function TermsPage() {
  return (
    <div className="py-20 sm:py-28 bg-canvas-warm">
      <div className="max-w-[800px] mx-auto px-6 md:px-8">
        <SectionKicker>Commercial Terms & Guarantees</SectionKicker>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ink-primary tracking-tight mb-8">
          Terms of Service & IP Transfer
        </h1>

        <div className="flex flex-col gap-6 text-sm sm:text-base text-ink-slate leading-relaxed">
          <p>
            Last Updated: October 2026
          </p>
          <p>
            These Terms govern engagements with Ostrum Technologies. Our founding standard is simple: total clarity, milestone-based deliverables, and complete intellectual property ownership.
          </p>
          <h2 className="font-display font-bold text-xl text-ink-primary mt-4">
            1. 100% Intellectual Property Ownership Guarantee
          </h2>
          <p>
            Unlike proprietary SaaS vendors or consultancies that retain rights to custom code, Ostrum transfers 100% full source code, database architectures, digital assets, and documentation to your company upon milestone completion. You face zero vendor lock-in.
          </p>
          <h2 className="font-display font-bold text-xl text-ink-primary mt-4">
            2. Milestone-Based Deliverables
          </h2>
          <p>
            Every custom system build is structured into two-week functional milestones. If a deliverable fails to conform to the approved technical specification, our team refines it until it satisfies the acceptance criteria without extra charges.
          </p>
          <h2 className="font-display font-bold text-xl text-ink-primary mt-4">
            3. Confidentiality
          </h2>
          <p>
            All client proprietary workflows, database schemas, customer records, and commercial strategies shared during audits or builds remain strictly confidential under reciprocal Non-Disclosure Agreements (NDAs).
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
