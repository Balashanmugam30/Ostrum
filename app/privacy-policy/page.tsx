import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — Ostrum',
  description:
    'Privacy Policy outlining the collection, use, and protection of personal data in compliance with India DPDP Act and applicable principles.',
};

export default function PrivacyPolicyPage() {
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
            DATA PRIVACY &amp; PROTECTION
          </p>
          <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Privacy Policy
          </h1>
          <p className="font-mono text-xs text-[#71717A]">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* 13 Required Sections in Exact Order */}
        <div className="space-y-12 font-sans text-base sm:text-lg leading-relaxed text-[#D4D4D8]">
          {/* Section 1 */}
          <section id="scope-and-contact" className="scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-baseline gap-3">
              <span className="font-mono text-sm text-[#F04438]">01</span>
              Scope and Contact
            </h2>
            <p>
              This Privacy Policy explains how Ostrum (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) handles personal information collected through our public website (ostrum.co) and our project enquiry channels. This policy is formulated in alignment with the Digital Personal Data Protection Act, 2023 (DPDP Act) and the Digital Personal Data Protection Rules, 2025 of India, to the extent applicable.
            </p>
            <p className="mt-3">
              If you have any questions, rights requests, or feedback regarding your personal data, you may reach us directly at{' '}
              <a
                href="mailto:hello@ostrum.co"
                className="text-[#F04438] hover:underline"
              >
                hello@ostrum.co
              </a>
              .
            </p>
          </section>

          {/* Section 2 */}
          <section id="information-collected" className="scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-baseline gap-3">
              <span className="font-mono text-sm text-[#F04438]">02</span>
              Information Collected
            </h2>
            <p>
              We collect information that you voluntarily provide to us when submitting an enquiry or contacting our studio. Specifically, our live contact form provides for the following fields:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-[#A1A1AA]">
              <li><strong className="text-white">Full Name:</strong> To address you and identify your enquiry;</li>
              <li><strong className="text-white">Work Email:</strong> To communicate regarding project scope and follow-ups;</li>
              <li><strong className="text-white">Company / Organization:</strong> To understand your business context and operational scope;</li>
              <li><strong className="text-white">Project Type / Category:</strong> To evaluate fit with our engineering, AI, platform, or experience design capabilities;</li>
              <li><strong className="text-white">Phone Number (Optional):</strong> To facilitate direct coordination if provided;</li>
              <li><strong className="text-white">Project Description / Message:</strong> Detailed notes and technical requirements you provide.</li>
            </ul>
            <p className="mt-4">
              <strong className="text-white">Technical Logs:</strong> When accessing the website, standard web server runtime and hosting infrastructure may record standard operational connection logs, including IP address, user-agent, request timestamp, and HTTP response code. These logs are used strictly for service delivery, infrastructure health, and cybersecurity monitoring.
            </p>
          </section>

          {/* Section 3 */}
          <section id="why-information-used" className="scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-baseline gap-3">
              <span className="font-mono text-sm text-[#F04438]">03</span>
              Why Information is Used
            </h2>
            <p>
              We process personal information exclusively for specified, legitimate business purposes:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-[#A1A1AA]">
              <li>Responding to incoming project enquiries and requests for proposals;</li>
              <li>Evaluating technical compatibility, project timelines, and studio bandwidth;</li>
              <li>Communicating with you regarding requested services and potential collaborations;</li>
              <li>Operating, securing, and defending our website infrastructure against malicious activity;</li>
              <li>Maintaining necessary internal business records and fulfilling statutory compliance obligations.</li>
            </ul>
            <p className="mt-3">
              We do not use submitted enquiry details for unsolicited promotional email blasts or newsletters, nor do we run marketing mailing lists on this website.
            </p>
          </section>

          {/* Section 4 */}
          <section id="legal-basis" className="scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-baseline gap-3">
              <span className="font-mono text-sm text-[#F04438]">04</span>
              Legal Basis and Permission
            </h2>
            <p>
              Under applicable data protection principles, including the DPDP Act 2023, our processing of your personal information is based on your voluntary submission and consent when sending an enquiry, as well as our legitimate business interest in responding to commercial enquiries initiated by you.
            </p>
            <p className="mt-3">
              Where data processing is necessary to take preliminary steps prior to entering into a formal client contract, processing is carried out for that specific purpose. You may withdraw consent for further communication at any time by notifying us at{' '}
              <a
                href="mailto:hello@ostrum.co"
                className="text-[#F04438] hover:underline"
              >
                hello@ostrum.co
              </a>
              .
            </p>
          </section>

          {/* Section 5 */}
          <section id="data-sharing" className="scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-baseline gap-3">
              <span className="font-mono text-sm text-[#F04438]">05</span>
              Data Sharing and Processors
            </h2>
            <p>
              Ostrum does not sell, rent, or trade your personal information. We do not provide your data to third-party data brokers or marketing networks.
            </p>
            <p className="mt-3">
              Your information may only be processed by operational infrastructure vendors who provide cloud hosting, application runtime, domain hosting, or secure email dispatch services essential to delivering our website and communicating with you. These vendors act strictly under contractual obligations to process data securely and solely for the operational purposes we instruct.
            </p>
          </section>

          {/* Section 6 */}
          <section id="international-transfers" className="scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-baseline gap-3">
              <span className="font-mono text-sm text-[#F04438]">06</span>
              Cross-Border Data Transfers
            </h2>
            <p>
              Depending on the geographic deployment of cloud hosting infrastructure (such as Vercel, cloud server clusters, or global edge content delivery networks), data submitted through the website may transit through servers located outside of India. All such transfers are conducted in accordance with applicable statutory regulations and established cybersecurity safeguards.
            </p>
          </section>

          {/* Section 7 */}
          <section id="data-retention" className="scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-baseline gap-3">
              <span className="font-mono text-sm text-[#F04438]">07</span>
              Data Retention
            </h2>
            <p>
              We retain project enquiry details only for as long as reasonably required to evaluate and respond to your request, conduct preliminary discussions, preserve legitimate business records of commercial enquiries, or satisfy legal and dispute resolution requirements.
            </p>
            <p className="mt-3">
              When an enquiry does not lead to a commercial engagement and is no longer needed for auditing or communications, the associated personal information is securely removed or anonymized.
            </p>
          </section>

          {/* Section 8 */}
          <section id="security" className="scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-baseline gap-3">
              <span className="font-mono text-sm text-[#F04438]">08</span>
              Security Safeguards
            </h2>
            <p>
              We employ reasonable technical and organizational safeguards to protect submitted personal data against unauthorized access, loss, misuse, or alteration. All web communications are transmitted over modern encrypted protocols (HTTPS/TLS).
            </p>
            <p className="mt-3">
              However, no electronic transmission over the Internet can be guaranteed as 100% invulnerable. We encourage you to exercise prudence and avoid submitting sensitive personal credentials or financial account numbers through general contact forms.
            </p>
          </section>

          {/* Section 9 */}
          <section id="rights-and-choices" className="scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-baseline gap-3">
              <span className="font-mono text-sm text-[#F04438]">09</span>
              Your Rights and Choices
            </h2>
            <p>
              Subject to applicable laws, including the DPDP Act 2023, you have rights regarding the personal information you share with us:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-[#A1A1AA]">
              <li><strong className="text-white">Right to Access:</strong> You may request a summary of the personal data we hold about your enquiry;</li>
              <li><strong className="text-white">Right to Correction:</strong> You may request correction of inaccurate, incomplete, or outdated data;</li>
              <li><strong className="text-white">Right to Erasure:</strong> You may request the deletion of your personal data where it is no longer required for the purpose for which it was collected;</li>
              <li><strong className="text-white">Right to Withdraw Consent:</strong> You may revoke consent for ongoing communications at any time.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please email{' '}
              <a
                href="mailto:hello@ostrum.co"
                className="text-[#F04438] hover:underline"
              >
                hello@ostrum.co
              </a>
              . We will review and respond to verified requests within statutory timeframes.
            </p>
          </section>

          {/* Section 10 */}
          <section id="cookies-and-analytics" className="scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-baseline gap-3">
              <span className="font-mono text-sm text-[#F04438]">10</span>
              Cookies and Analytics
            </h2>
            <p>
              Our website is designed with a privacy-respecting posture. We do not deploy third-party advertising tracking cookies, behavioral remarketing pixels, or invasive surveillance scripts on this website.
            </p>
            <p className="mt-3">
              Essential technical session mechanisms may be used strictly to ensure correct page delivery, smooth scrolling performance, and theme consistency. If optional performance analytics are integrated in the future, this policy will be updated with relevant transparency details.
            </p>
          </section>

          {/* Section 11 */}
          <section id="childrens-privacy" className="scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-baseline gap-3">
              <span className="font-mono text-sm text-[#F04438]">11</span>
              Children&apos;s Privacy
            </h2>
            <p>
              Our website and services are intended exclusively for commercial, business, and professional audiences. We do not knowingly solicit or collect personal information from children under the age of 18. If a parent or legal guardian discovers that a child has submitted personal details through our form, please alert us at{' '}
              <a
                href="mailto:hello@ostrum.co"
                className="text-[#F04438] hover:underline"
              >
                hello@ostrum.co
              </a>
              , and we will promptly delete the data.
            </p>
          </section>

          {/* Section 12 */}
          <section id="external-links" className="scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-baseline gap-3">
              <span className="font-mono text-sm text-[#F04438]">12</span>
              External Links
            </h2>
            <p>
              This website may reference external third-party links or industry references for convenience. We have no authority over, and assume no responsibility for, the content or privacy standards of external websites. We encourage you to review the privacy policies of any third-party destinations you visit.
            </p>
          </section>

          {/* Section 13 */}
          <section id="policy-changes-and-contact" className="scroll-mt-24 pt-6 border-t border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-baseline gap-3">
              <span className="font-mono text-sm text-[#F04438]">13</span>
              Policy Changes and Contact
            </h2>
            <p>
              We reserve the right to revise this Privacy Policy to reflect evolving regulatory frameworks or adjustments to our technical architecture. Updated versions will be published on this page with the modified &quot;Last Updated&quot; date indicated at the top.
            </p>
            <div className="mt-4 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
              <p className="font-mono text-xs uppercase tracking-wider text-[#A1A1AA] mb-1">
                Data Controller &amp; Inquiries
              </p>
              <p className="font-sans font-semibold text-white">
                Ostrum Studio
              </p>
              <p className="font-mono text-sm text-[#D4D4D8] mt-1">
                Contact:{' '}
                <a
                  href="mailto:hello@ostrum.co"
                  className="text-[#F04438] hover:underline"
                >
                  hello@ostrum.co
                </a>
              </p>
            </div>
            <p className="mt-4 text-xs text-[#71717A] italic">
              [Note for Legal Review: Final registered corporate entity details, grievance officer designations, and physical registered office addresses subject to legal owner verification before production deployment.]
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
