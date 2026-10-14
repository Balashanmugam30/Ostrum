import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms & Conditions — Ostrum',
  description:
    'Terms and Conditions governing the use of the Ostrum public website and project enquiry channels.',
};

export default function TermsAndConditionsPage() {
  const lastUpdated = '15 October 2026';

  return (
    <div className="min-h-screen bg-[#050505] text-[#E4E4E7] antialiased selection:bg-white selection:text-black">
      {/* Top Header / Back Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#050505]/85 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-condensed text-xl font-bold uppercase tracking-wider text-white hover:text-[#F04438] transition-colors"
          >
            OSTRUM
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#A1A1AA] hover:text-white transition-colors"
          >
            <span aria-hidden="true">←</span> Back to Ostrum
          </Link>
        </div>
      </header>

      {/* Main Document Body */}
      <main className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
        {/* Document Header */}
        <div className="border-b border-white/10 pb-10 mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.24em] font-semibold text-[#F04438] mb-3">
            LEGAL TERMS
          </p>
          <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Terms &amp; Conditions
          </h1>
          <p className="font-mono text-xs text-[#71717A]">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* 12 Required Sections in Order */}
        <div className="space-y-12 font-sans text-base sm:text-lg leading-relaxed text-[#D4D4D8]">
          {/* Section 1 */}
          <section id="acceptance" className="scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-baseline gap-3">
              <span className="font-mono text-sm text-[#F04438]">01</span>
              About These Terms and Acceptance
            </h2>
            <p>
              These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of the public website operated by Ostrum (&quot;we&quot;, &quot;our&quot;, or &quot;Ostrum&quot;), accessible at ostrum.co and associated subdomains. By browsing, viewing, or interacting with this website, you acknowledge that you have read, understood, and agreed to be bound by these Terms, subject to all applicable statutory rules and laws. If you do not agree with any part of these Terms, you should discontinue use of the website immediately.
            </p>
          </section>

          {/* Section 2 */}
          <section id="website-purpose" className="scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-baseline gap-3">
              <span className="font-mono text-sm text-[#F04438]">02</span>
              Website Purpose
            </h2>
            <p>
              This website serves as an informational showcase of Ostrum&apos;s capabilities, digital transformation services, engineering work, and technological explorations. The publication of case studies, methodologies, visual concepts, or capabilities on this website does not constitute a formal commercial offer, binding warranty, or executed service agreement.
            </p>
          </section>

          {/* Section 3 */}
          <section id="enquiries-and-proposals" className="scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-baseline gap-3">
              <span className="font-mono text-sm text-[#F04438]">03</span>
              Project Enquiries and Proposals
            </h2>
            <p>
              Submitting an enquiry through our contact form or communicating via email does not establish an attorney-client, agency, fiduciary, or commercial relationship, nor does it guarantee project intake, pricing, or studio capacity.
            </p>
            <p className="mt-3">
              All client engagements are formally established exclusively through separately negotiated and signed Statements of Work (SOW), Master Services Agreements (MSA), or binding written proposals. Specific project agreements govern scope, deliverables, timelines, fee structures, payment milestones, IP ownership transfer, and warranties. In the event of any conflict between these general website terms and a signed project contract, the signed project agreement shall govern to the extent valid under applicable law.
            </p>
          </section>

          {/* Section 4 */}
          <section id="acceptable-use" className="scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-baseline gap-3">
              <span className="font-mono text-sm text-[#F04438]">04</span>
              Acceptable Use
            </h2>
            <p>
              You agree to use this website only for legitimate, lawful purposes in accordance with these Terms. You agree not to:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-[#A1A1AA]">
              <li>Deploy automated scripts, bots, spiders, or scrapers to extract website assets, source code, or proprietary visual simulations without prior written consent;</li>
              <li>Attempt to gain unauthorized access to our servers, infrastructure, or connected networks;</li>
              <li>Introduce malicious code, viruses, trojans, or Denial of Service (DoS) attacks;</li>
              <li>Submit deceptive, abusive, or automated spam enquiries through our contact and communication channels;</li>
              <li>Reverse engineer, disassemble, or decompile any interactive WebGL shaders or proprietary codebases powering this site.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="intellectual-property" className="scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-baseline gap-3">
              <span className="font-mono text-sm text-[#F04438]">05</span>
              Intellectual Property
            </h2>
            <p>
              All website text, visual design, animations, 3D simulations, graphics, code, and trade dress are the exclusive property of Ostrum or its licensors, protected by copyright, trademark, and intellectual property laws. You may not reproduce, modify, distribute, or publicly display any part of this website without our explicit prior written permission.
            </p>
            <p className="mt-3">
              Trademarks, brand names, and client logos featured in portfolio showcases belong to their respective owners. Deliverables created for client engagements are governed by the specific intellectual property assignment provisions set out in individual project contracts.
            </p>
          </section>

          {/* Section 6 */}
          <section id="accuracy-and-changes" className="scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-baseline gap-3">
              <span className="font-mono text-sm text-[#F04438]">06</span>
              Accuracy and Content Changes
            </h2>
            <p>
              While we strive to maintain accurate, up-to-date information on this website, materials are provided in good faith on an &quot;as-is&quot; basis. We reserve the right to modify, update, or remove any content, technical descriptions, or case studies at any time without prior notice.
            </p>
          </section>

          {/* Section 7 */}
          <section id="third-party-links" className="scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-baseline gap-3">
              <span className="font-mono text-sm text-[#F04438]">07</span>
              Third-Party Sites and Services
            </h2>
            <p>
              This website may contain links to external third-party websites or services. These links are provided solely for your convenience. Ostrum does not endorse, control, or assume responsibility for the content, privacy policies, or practices of any third-party websites. Accessing external links is strictly at your own discretion.
            </p>
          </section>

          {/* Section 8 */}
          <section id="availability-disclaimers" className="scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-baseline gap-3">
              <span className="font-mono text-sm text-[#F04438]">08</span>
              Availability and Disclaimers
            </h2>
            <p>
              We do not warrant that the website will operate uninterrupted, secure, or entirely error-free, or that defects will be immediately corrected. To the fullest extent permitted by applicable law, Ostrum disclaims all statutory and implied warranties, including merchantability, fitness for a particular purpose, and non-infringement.
            </p>
          </section>

          {/* Section 9 */}
          <section id="limitation-of-liability" className="scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-baseline gap-3">
              <span className="font-mono text-sm text-[#F04438]">09</span>
              Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, Ostrum and its team members shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your access to or inability to use this website. Nothing in these Terms shall limit or exclude liability for death, personal injury caused by negligence, fraudulent misrepresentation, or any liability that cannot be excluded under applicable law.
            </p>
          </section>

          {/* Section 10 */}
          <section id="changes-to-terms" className="scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-baseline gap-3">
              <span className="font-mono text-sm text-[#F04438]">10</span>
              Changes to These Terms
            </h2>
            <p>
              We may revise these Terms periodically to reflect updates to our website, legal developments, or business operations. Any modifications will be posted directly to this page with an updated &quot;Last Updated&quot; date. Your continued use of the website following any changes constitutes acceptance of the revised Terms.
            </p>
          </section>

          {/* Section 11 */}
          <section id="governing-law" className="scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-baseline gap-3">
              <span className="font-mono text-sm text-[#F04438]">11</span>
              Governing Law and Jurisdiction
            </h2>
            <p>
              These Terms and any non-contractual obligations arising out of or in connection with them shall be governed by and construed in accordance with the substantive laws of India, including the Indian Contract Act, 1872. Any disputes shall be subject to resolution under applicable statutory provisions.
            </p>
            <p className="mt-2 text-xs text-[#71717A] italic">
              [Note for Legal Review: Specific municipal court jurisdiction and registered corporate entity details subject to final confirmation by Ostrum.]
            </p>
          </section>

          {/* Section 12 */}
          <section id="contact" className="scroll-mt-24 pt-6 border-t border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-baseline gap-3">
              <span className="font-mono text-sm text-[#F04438]">12</span>
              Contact Information
            </h2>
            <p>
              If you have any questions or clarifications regarding these Terms, please reach out to our team:
            </p>
            <p className="mt-3 font-mono text-sm text-white">
              Email:{' '}
              <a
                href="mailto:hello@ostrum.co"
                className="text-[#F04438] hover:underline"
              >
                hello@ostrum.co
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-white/10 py-8 px-6 text-center font-mono text-xs text-[#71717A]">
        © {new Date().getFullYear()} Ostrum. All rights reserved.
      </footer>
    </div>
  );
}
