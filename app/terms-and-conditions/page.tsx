import React from 'react';
import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/site-config';
import {
  LegalDocumentLayout,
  type LegalSectionItem,
} from '@/components/legal/LegalDocumentLayout';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description:
    'Terms and Conditions governing the use of the Ostrum public website, technology showcase, and project enquiry channels.',
  alternates: {
    canonical: '/terms-and-conditions',
  },
  openGraph: {
    title: 'Terms & Conditions — OSTRUM',
    description:
      'Terms and Conditions governing the use of the Ostrum public website, technology showcase, and project enquiry channels.',
    url: '/terms-and-conditions',
    images: ['/images/ostrum-og.png'],
  },
};

const SECTIONS: LegalSectionItem[] = [
  { id: 'acceptance', num: '01', title: 'Acceptance of Terms' },
  { id: 'identity', num: '02', title: 'Studio Identity & Planned Brand Domain' },
  { id: 'showcase', num: '03', title: 'Nature of Website & Non-Binding Showcase' },
  { id: 'enquiries', num: '04', title: 'Project Enquiries & Commercial Engagements' },
  { id: 'acceptable-use', num: '05', title: 'Acceptable Use & System Integrity' },
  { id: 'intellectual-property', num: '06', title: 'Intellectual Property & Studio Assets' },
  { id: 'case-studies', num: '07', title: 'Client Case Studies & Attribution' },
  { id: 'external-links', num: '08', title: 'External Links & Open-Source Repositories' },
  { id: 'availability', num: '09', title: 'Availability & Maintenance' },
  { id: 'disclaimers', num: '10', title: 'Disclaimers of Warranties' },
  { id: 'liability', num: '11', title: 'Limitation of Liability' },
  { id: 'indemnification', num: '12', title: 'Indemnification' },
  { id: 'modifications', num: '13', title: 'Modifications to Terms' },
  { id: 'severability', num: '14', title: 'Severability & Entire Agreement' },
  { id: 'governing-law', num: '15', title: 'Governing Law & Dispute Resolution' },
  { id: 'contact', num: '16', title: 'Contact & Legal Notices' },
];

export default function TermsAndConditionsPage() {
  const lastUpdated = '20 October 2026';

  return (
    <LegalDocumentLayout
      title="Terms & Conditions"
      badge="LEGAL AGREEMENT · STUDIO TERMS"
      effectiveDate={lastUpdated}
      activeTab="terms"
      sections={SECTIONS}
    >
      {/* Section 1 */}
      <section id="acceptance" className="scroll-mt-24 pb-10 border-b border-[#EFEBE5]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#161514] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#D24B2C] font-semibold">01</span>
          Acceptance of Terms
        </h2>
        <p>
          These Terms and Conditions (&ldquo;Terms&rdquo;) establish the contractual relationship governing your access to and interaction with the public website, digital materials, code demonstrations, and communication channels of OSTRUM (&ldquo;Ostrum&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;).
        </p>
        <p className="mt-3">
          By accessing, browsing, reading, or submitting information through this website, you confirm that you have read, comprehended, and agreed to be bound by these Terms in full, alongside all applicable laws and regulations. If you do not agree with these Terms in their entirety, you must cease all access to and interaction with this website immediately.
        </p>
      </section>

      {/* Section 2 */}
      <section id="identity" className="scroll-mt-24 pb-10 border-b border-[#EFEBE5]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#161514] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#D24B2C] font-semibold">02</span>
          Studio Identity &amp; Planned Brand Domain
        </h2>
        <p>
          OSTRUM operates as an independent digital product engineering, technology architecture, and venture design studio. The studio is in the active process of acquiring and provisioning its primary branded domain, planned as <code className="px-1.5 py-0.5 rounded bg-[#FAF7F2] text-[#161514] font-mono text-xs">{SITE_CONFIG.baseUrl}</code>, with associated studio communications planned at <code className="px-1.5 py-0.5 rounded bg-[#FAF7F2] text-[#161514] font-mono text-xs">{SITE_CONFIG.contactEmail}</code>.
        </p>
        <p className="mt-3">
          The publication of planned domain endpoints, studio designations, and future infrastructure within this website reflects current architectural planning and does not assert that third-party domain registrar transfers, external mail server MX records, or related public infrastructure have concluded final administrative provisioning.
        </p>
      </section>

      {/* Section 3 */}
      <section id="showcase" className="scroll-mt-24 pb-10 border-b border-[#EFEBE5]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#161514] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#D24B2C] font-semibold">03</span>
          Nature of Website &amp; Non-Binding Showcase
        </h2>
        <p>
          This website functions solely as an informational, artistic, and technical showcase of Ostrum&apos;s capabilities, engineering methodologies, client solutions, and internal venture initiatives.
        </p>
        <p className="mt-3">
          Nothing contained on this website constitutes a binding commercial offer, guaranteed pricing schedule, contractual warranty, or unilateral commitment to perform engineering, advisory, or design services. Content, diagrams, technical architectures, and service summaries are published for illustrative and portfolio review purposes only.
        </p>
      </section>

      {/* Section 4 */}
      <section id="enquiries" className="scroll-mt-24 pb-10 border-b border-[#EFEBE5]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#161514] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#D24B2C] font-semibold">04</span>
          Project Enquiries &amp; Commercial Engagements
        </h2>
        <p>
          Transmission of information via our contact forms, direct email correspondence, or scheduling links does not create an attorney-client, agency, partnership, fiduciary, or commercial service relationship between you and Ostrum.
        </p>
        <p className="mt-3">
          Formal client engagements are created exclusively through mutually executed, definitive written agreements, including Master Services Agreements (MSA), Statements of Work (SOW), or formalized venture partnerships. Such formal agreements supersede these general website terms with respect to deliverables, milestones, fee structures, IP ownership transfer, confidentiality, and performance warranties.
        </p>
      </section>

      {/* Section 5 */}
      <section id="acceptable-use" className="scroll-mt-24 pb-10 border-b border-[#EFEBE5]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#161514] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#D24B2C] font-semibold">05</span>
          Acceptable Use &amp; System Integrity
        </h2>
        <p>
          You agree to utilize this website exclusively for lawful, ethical, and intended informational purposes. You expressly agree not to:
        </p>
        <ul className="list-disc pl-5 mt-3 space-y-2 text-[#50545C]">
          <li>Employ automated web crawlers, bots, scrapers, or programmatic extractors to mine source assets, 3D models, shader code, or studio text without prior express written authorization;</li>
          <li>Perform unauthorized penetration testing, vulnerability scanning, security probing, or denial-of-service (DoS/DDoS) simulations against our web servers or networks;</li>
          <li>Transmit automated spam, fraudulent project enquiries, deceptive requests, or abusive communications through form fields or direct mail endpoints;</li>
          <li>Inject malicious scripts, viruses, worms, Trojan horses, or harmful code designed to compromise browser rendering or server runtime integrity;</li>
          <li>Misrepresent your identity, affiliation, authority, or commercial intent in communications submitted to the studio.</li>
        </ul>
      </section>

      {/* Section 6 */}
      <section id="intellectual-property" className="scroll-mt-24 pb-10 border-b border-[#EFEBE5]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#161514] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#D24B2C] font-semibold">06</span>
          Intellectual Property &amp; Studio Assets
        </h2>
        <p>
          All website source code, typography arrangements, graphic marks, custom 3D models, WebGL shaders, visual animations, interaction choreography, editorial texts, and trade dress are the exclusive intellectual property of Ostrum or its licensors, protected by Indian and international copyright, trademark, and intellectual property conventions.
        </p>
        <p className="mt-3">
          No license, title, or interest in any studio intellectual property is granted to you by implication or otherwise. You may not reproduce, republish, redistribute, mirror, frame, decompile, or create derivative works from website materials without express advance written consent from an authorized principal of Ostrum.
        </p>
      </section>

      {/* Section 7 */}
      <section id="case-studies" className="scroll-mt-24 pb-10 border-b border-[#EFEBE5]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#161514] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#D24B2C] font-semibold">07</span>
          Client Case Studies &amp; Attribution
        </h2>
        <p>
          All client marks, corporate logos, trade names, and registered trademarks featured in our Selected Work and client showcases (including TMR AI Car Care and Saraswati Driving School) remain the exclusive property of their respective trademark holders.
        </p>
        <p className="mt-3">
          Showcase summaries, technical descriptions, and architectural narratives are presented accurately to demonstrate the studio&apos;s real engineering, design, and systems contribution. Testimonial statements marked as provisional or pending final formal client sign-off are maintained transparently and do not constitute fabricated third-party endorsements.
        </p>
      </section>

      {/* Section 8 */}
      <section id="external-links" className="scroll-mt-24 pb-10 border-b border-[#EFEBE5]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#161514] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#D24B2C] font-semibold">08</span>
          External Links &amp; Open-Source Repositories
        </h2>
        <p>
          This website provides hyperlinks to external destinations, including client live production deployments (such as tmraicarcare.com and saraswati-driving-school.vercel.app) and open-source GitHub repositories (including the MNESA repository at <a href={SITE_CONFIG.mnesaGithubUrl} target="_blank" rel="noopener noreferrer" className="text-[#D24B2C] hover:underline font-medium">{SITE_CONFIG.mnesaGithubUrl}</a>).
        </p>
        <p className="mt-3">
          These links are supplied solely for informational reference and technical verification. Ostrum does not exercise continuous control over third-party domains and assumes no responsibility for third-party content, terms of service, uptime, or privacy practices.
        </p>
      </section>

      {/* Section 9 */}
      <section id="availability" className="scroll-mt-24 pb-10 border-b border-[#EFEBE5]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#161514] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#D24B2C] font-semibold">09</span>
          Availability &amp; Maintenance
        </h2>
        <p>
          We strive to maintain continuous availability and fluid visual execution across modern devices and browsers. However, access to the website may occasionally be suspended, restricted, or degraded without notice to permit server maintenance, security upgrades, feature deployments, or emergency infrastructure remediation.
        </p>
        <p className="mt-3">
          Ostrum shall not be liable if, for any reason, all or any part of the website remains unavailable or exhibits reduced graphical fidelity on unsupported hardware, outdated browser versions, or constrained network connections.
        </p>
      </section>

      {/* Section 10 */}
      <section id="disclaimers" className="scroll-mt-24 pb-10 border-b border-[#EFEBE5]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#161514] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#D24B2C] font-semibold">10</span>
          Disclaimers of Warranties
        </h2>
        <p className="uppercase text-xs font-semibold tracking-wider text-[#161514]">
          Website Provided &ldquo;As Is&rdquo; and &ldquo;As Available&rdquo;
        </p>
        <p className="mt-2">
          To the maximum extent permitted by applicable law, this website and all published materials are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis, without warranties of any kind, whether express, statutory, or implied.
        </p>
        <p className="mt-3">
          Ostrum expressly disclaims all implied warranties of merchantability, fitness for a particular purpose, non-infringement, course of dealing, title, and performance reliability. We do not guarantee that the website will operate uninterrupted, error-free, immune from malicious intrusion, or that all display inaccuracies will be immediately corrected.
        </p>
      </section>

      {/* Section 11 */}
      <section id="liability" className="scroll-mt-24 pb-10 border-b border-[#EFEBE5]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#161514] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#D24B2C] font-semibold">11</span>
          Limitation of Liability
        </h2>
        <p>
          To the fullest extent permitted under applicable law, in no event shall Ostrum, its principals, officers, developers, designers, affiliates, or contractors be liable for any indirect, incidental, consequential, punitive, exemplary, or special damages whatsoever.
        </p>
        <p className="mt-3">
          This includes, without limitation, damages for loss of profits, commercial interruption, lost business data, goodwill impairment, or hardware malfunction arising out of or in connection with your access to, use of, or inability to use this website, whether grounded in contract, tort (including negligence), strict liability, or any other legal doctrine.
        </p>
        <p className="mt-3">
          To the maximum extent permissible by applicable law, our aggregate liability for direct claims arising solely out of your use of this public informational showcase website shall be limited to the minimum statutory amount recognized by the governing jurisdiction. (Note: Specific monetary liability caps remain subject to formal legal review upon commercial incorporation).
        </p>
      </section>

      {/* Section 12 */}
      <section id="indemnification" className="scroll-mt-24 pb-10 border-b border-[#EFEBE5]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#161514] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#D24B2C] font-semibold">12</span>
          Indemnification
        </h2>
        <p>
          You agree to defend, indemnify, and hold harmless Ostrum, its directors, developers, successors, and assigns from and against any third-party claims, liabilities, damages, judgments, losses, expenses, or costs (including reasonable legal fees) resulting directly from your breach of these Terms, unauthorized extraction of website intellectual property, or improper interaction with our digital systems.
        </p>
      </section>

      {/* Section 13 */}
      <section id="modifications" className="scroll-mt-24 pb-10 border-b border-[#EFEBE5]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#161514] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#D24B2C] font-semibold">13</span>
          Modifications to Terms
        </h2>
        <p>
          We reserve the right to revise, update, or amend these Terms at our discretion to reflect technical enhancements, architectural updates, statutory changes, or corporate restructuring.
        </p>
        <p className="mt-3">
          When changes occur, the updated version will be published on this page with a revised &ldquo;Effective Date&rdquo; header. Your continued use of the website following the posting of amended Terms constitutes binding acknowledgement and acceptance of those modifications.
        </p>
      </section>

      {/* Section 14 */}
      <section id="severability" className="scroll-mt-24 pb-10 border-b border-[#EFEBE5]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#161514] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#D24B2C] font-semibold">14</span>
          Severability &amp; Entire Agreement
        </h2>
        <p>
          If any individual provision of these Terms is determined by a court of competent jurisdiction to be unlawful, invalid, or unenforceable, that provision shall be enforced to the maximum extent permissible, and the remaining provisions of these Terms shall continue in full force and effect.
        </p>
        <p className="mt-3">
          These Terms constitute the entire understanding between you and Ostrum concerning your public exploration of this website, superseding prior digital discussions, drafts, or informal representations regarding general site access.
        </p>
      </section>

      {/* Section 15 */}
      <section id="governing-law" className="scroll-mt-24 pb-10 border-b border-[#EFEBE5]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#161514] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#D24B2C] font-semibold">15</span>
          Governing Law &amp; Dispute Resolution
        </h2>
        <p>
          These Terms and any dispute, controversy, or claim arising out of or in connection with them (including non-contractual disputes) shall be governed by and construed in accordance with the substantive laws of India, including the Indian Contract Act, 1872.
        </p>
        <p className="mt-3">
          In the event of any disagreement, the parties agree to first endeavor in good faith to resolve the matter through mutual, amicable executive consultation before initiating formal legal proceedings. Any statutory proceedings that cannot be resolved amicably shall be submitted to the jurisdiction of competent courts in India.
        </p>
      </section>

      {/* Section 16 */}
      <section id="contact" className="scroll-mt-24 pt-2">
        <h2 className="text-xl sm:text-2xl font-bold text-[#161514] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#D24B2C] font-semibold">16</span>
          Contact &amp; Legal Notices
        </h2>
        <p>
          Formal legal notices, queries regarding these Terms, or copyright inquiries should be directed to the studio leadership via our official enquiry channel:
        </p>
        <div className="mt-4 p-5 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD7] font-mono text-xs sm:text-sm text-[#161514]">
          <p>
            <span className="text-[#70757E]">Direct Inquiries:</span>{' '}
            <a
              href={`mailto:${SITE_CONFIG.contactEmail}`}
              className="text-[#D24B2C] font-semibold hover:underline"
            >
              {SITE_CONFIG.contactEmail}
            </a>
          </p>
          <p className="mt-1 text-[#70757E]">
            Studio Designation: OSTRUM Digital Engineering &amp; Technology Studio
          </p>
        </div>
      </section>
    </LegalDocumentLayout>
  );
}