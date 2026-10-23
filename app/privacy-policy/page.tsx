import React from 'react';
import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/site-config';
import {
  LegalDocumentLayout,
  type LegalSectionItem,
} from '@/components/legal/LegalDocumentLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy Policy outlining the collection, use, security, and protection of personal data in compliance with the DPDP Act and international privacy principles.',
  alternates: {
    canonical: '/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy — OSTRUM',
    description:
      'Privacy Policy outlining the collection, use, security, and protection of personal data in compliance with the DPDP Act and international privacy principles.',
    url: '/privacy-policy',
    images: ['/images/ostrum-og.png'],
  },
};

const SECTIONS: LegalSectionItem[] = [
  { id: 'commitment', num: '01', title: 'Commitment to Privacy & Scope' },
  { id: 'controller', num: '02', title: 'Studio Identity & Data Controller' },
  { id: 'data-collected', num: '03', title: 'Personal Information We Collect' },
  { id: 'legal-bases', num: '04', title: 'Legal Bases for Processing' },
  { id: 'purposes', num: '05', title: 'Purposes of Processing' },
  { id: 'retention', num: '06', title: 'Retention of Enquiry Data' },
  { id: 'service-providers', num: '07', title: 'Third-Party Service Providers' },
  { id: 'international-transfers', num: '08', title: 'International Data Transfers' },
  { id: 'cookies', num: '09', title: 'Cookies & Local Storage' },
  { id: 'security', num: '10', title: 'Data Security Measures' },
  { id: 'your-rights', num: '11', title: 'Your Data Protection Rights' },
  { id: 'children', num: '12', title: "Children's Privacy" },
  { id: 'do-not-track', num: '13', title: 'Do Not Track & Browser Privacy Controls' },
  { id: 'changes', num: '14', title: 'Changes to This Privacy Policy' },
  { id: 'contact', num: '15', title: 'Contact Us & Grievance Redressal' },
];

export default function PrivacyPolicyPage() {
  const lastUpdated = '20 October 2026';

  return (
    <LegalDocumentLayout
      title="Privacy Policy"
      badge="PRIVACY POLICY"
      effectiveDate={lastUpdated}
      activeTab="privacy"
      sections={SECTIONS}
    >
      {/* Section 1 */}
      <section id="commitment" className="scroll-mt-24 pb-10 border-b border-[#E5DFD7]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#050505] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#64120F] font-semibold">01</span>
          Commitment to Privacy &amp; Scope
        </h2>
        <p>
          OSTRUM (&ldquo;Ostrum&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed to transparent, lawful, and ethical data governance. This Privacy Policy outlines our practices regarding the collection, processing, storage, and protection of personal information obtained through our public website, project intake forms, and electronic communications.
        </p>
        <p className="mt-3">
          Our practices are architected in alignment with the Digital Personal Data Protection Act, 2023 (DPDP Act) and the Digital Personal Data Protection Rules, 2025 of India, alongside recognized international privacy principles, including the General Data Protection Regulation (GDPR) to the extent applicable to international visitors.
        </p>
      </section>

      {/* Section 2 */}
      <section id="controller" className="scroll-mt-24 pb-10 border-b border-[#E5DFD7]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#050505] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#64120F] font-semibold">02</span>
          Studio Identity &amp; Data Controller
        </h2>
        <p>
          The data controller responsible for personal information processed through this website is OSTRUM. Studio operations and inquiries are centrally administered through our designated contact mailbox at <a href={`mailto:${SITE_CONFIG.contactEmail}`} className="text-[#64120F] hover:underline font-medium">{SITE_CONFIG.contactEmail}</a>.
        </p>
        <p className="mt-3">
          Our planned primary domain is <code className="px-1.5 py-0.5 rounded bg-[#FAF7F2] text-[#050505] font-mono text-xs">{SITE_CONFIG.baseUrl}</code>. All electronic correspondence submitted through form handlers or direct email arrives directly in our studio triage queue.
        </p>
      </section>

      {/* Section 3 */}
      <section id="data-collected" className="scroll-mt-24 pb-10 border-b border-[#E5DFD7]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#050505] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#64120F] font-semibold">03</span>
          Personal Information We Collect
        </h2>
        <p>
          We practice strict data minimization. We only collect information that is voluntarily provided by you or technically necessary to operate and secure our website:
        </p>
        <div className="mt-4 space-y-4">
          <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD7]">
            <h3 className="font-bold text-[#050505] text-sm">A. Information You Voluntarily Provide</h3>
            <p className="mt-1 text-xs sm:text-sm text-[#302A28]">
              When you submit a project enquiry through our contact form, we collect:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-xs sm:text-sm text-[#302A28]">
              <li><strong>Full Name:</strong> To address you professionally in communications;</li>
              <li><strong>Work Email Address:</strong> To respond to your inquiry and discuss project scope;</li>
              <li><strong>Company / Organization Name:</strong> To contextualize business requirements;</li>
              <li><strong>Project Classification:</strong> Selected service track (e.g., AI Systems, Digital Experiences, Custom Engineering);</li>
              <li><strong>Telephone Number (Optional):</strong> If provided, for direct scheduling coordination;</li>
              <li><strong>Project Description / Message:</strong> Information you choose to share regarding your technical goals and requirements.</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD7]">
            <h3 className="font-bold text-[#050505] text-sm">B. Technical &amp; Diagnostic Telemetry</h3>
            <p className="mt-1 text-xs sm:text-sm text-[#302A28]">
              When you browse our website, our hosting infrastructure automatically logs standard technical metadata, including your IP address (anonymized where feasible), browser type and version, operating system, referring URL, timestamp of access, and general hardware capabilities (e.g. WebGL support for 3D visual rendering).
            </p>
          </div>
        </div>
      </section>

      {/* Section 4 */}
      <section id="legal-bases" className="scroll-mt-24 pb-10 border-b border-[#E5DFD7]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#050505] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#64120F] font-semibold">04</span>
          Legal Bases for Processing
        </h2>
        <p>
          Under applicable data protection laws, we process your personal data based upon the following lawful grounds:
        </p>
        <ul className="list-disc pl-5 mt-3 space-y-2 text-[#302A28]">
          <li><strong>Legitimate Interests:</strong> Operating, securing, diagnosing, and enhancing our public studio platform, and responding accurately to commercial inquiries initiated by prospective clients;</li>
          <li><strong>Pre-Contractual Measures:</strong> Evaluating technical project parameters, preparing engineering estimates, and drafting proposals at your express request prior to entering into a formal agreement;</li>
          <li><strong>Statutory Compliance:</strong> Fulfilling accounting, recordkeeping, and regulatory obligations mandated by applicable Indian law;</li>
          <li><strong>Consent:</strong> Where explicitly requested for specific communications or voluntary feedback.</li>
        </ul>
      </section>

      {/* Section 5 */}
      <section id="purposes" className="scroll-mt-24 pb-10 border-b border-[#E5DFD7]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#050505] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#64120F] font-semibold">05</span>
          Purposes of Processing
        </h2>
        <p>
          We utilize collected information exclusively for the following defined purposes:
        </p>
        <ul className="list-disc pl-5 mt-3 space-y-1.5 text-[#302A28]">
          <li>Reviewing and responding to project enquiries, architecture consultations, and studio inquiries;</li>
          <li>Conducting preliminary technical scoping, resource allocation, and feasibility assessments;</li>
          <li>Drafting Statements of Work (SOW) and commercial proposals;</li>
          <li>Preventing fraudulent form submissions, brute-force attacks, and abusive bot interactions;</li>
          <li>Ensuring cross-browser compatibility and hardware-accelerated 3D rendering stability.</li>
        </ul>
        <p className="mt-3 font-medium text-[#050505]">
          We never sell, rent, monetize, or trade your personal or corporate information to third-party data brokers or marketing aggregators under any circumstances.
        </p>
      </section>

      {/* Section 6 */}
      <section id="retention" className="scroll-mt-24 pb-10 border-b border-[#E5DFD7]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#050505] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#64120F] font-semibold">06</span>
          Retention of Enquiry Data
        </h2>
        <p>
          We retain personal information submitted via project enquiries only for as long as necessary to fulfill the prospective business evaluation or satisfy statutory retention requirements.
        </p>
        <p className="mt-3">
          Enquiry submissions that do not result in an active commercial engagement are securely deleted or anonymized within 24 months of our last communication. Where an enquiry progresses to a formal client engagement, records are maintained in accordance with the governing master agreement and applicable commercial accounting laws.
        </p>
      </section>

      {/* Section 7 */}
      <section id="service-providers" className="scroll-mt-24 pb-10 border-b border-[#E5DFD7]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#050505] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#64120F] font-semibold">07</span>
          Third-Party Service Providers
        </h2>
        <p>
          To deliver a modern, resilient, high-speed web experience, we partner with specialized cloud infrastructure and hosting providers. These service providers act as data processors under binding obligations of confidentiality and security:
        </p>
        <ul className="list-disc pl-5 mt-3 space-y-1.5 text-[#302A28]">
          <li><strong>Edge Hosting &amp; Serverless Infrastructure:</strong> High-performance content delivery networks (CDNs) for static asset distribution and serverless API execution;</li>
          <li><strong>Email Delivery Infrastructure (Resend):</strong> Transactional email service provider utilized to route submitted project enquiries securely to studio notification mailboxes (<code className="px-1 py-0.5 rounded bg-[#FAF7F2] text-[#050505] font-mono text-xs">hello@theostrum.com</code>);</li>
          <li><strong>Security &amp; DDoS Shielding:</strong> Edge firewalls that monitor inbound request patterns to prevent distributed denial-of-service attacks.</li>
        </ul>
      </section>

      {/* Section 8 */}
      <section id="international-transfers" className="scroll-mt-24 pb-10 border-b border-[#E5DFD7]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#050505] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#64120F] font-semibold">08</span>
          International Data Transfers
        </h2>
        <p>
          As an engineering studio collaborating with clients and technical partners globally, information collected by our cloud infrastructure may be processed on secure servers located outside your jurisdiction.
        </p>
        <p className="mt-3">
          Whenever personal data is transferred across borders, we ensure that appropriate safeguards are established in accordance with applicable laws, including Standard Contractual Clauses (SCCs), robust technical encryption protocols, and verified compliance certifications.
        </p>
      </section>

      {/* Section 9 */}
      <section id="cookies" className="scroll-mt-24 pb-10 border-b border-[#E5DFD7]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#050505] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#64120F] font-semibold">09</span>
          Cookies &amp; Local Storage
        </h2>
        <p>
          Our public website does not employ third-party advertising cookies, cross-site behavioral tracking scripts, or commercial marketing pixels.
        </p>
        <p className="mt-3">
          We utilize only minimal, essential browser storage mechanisms necessary for the core operation of the site, including ephemeral session flags (such as recording completion of the initial visual cinematic sequence during a single browsing session) and user interface accessibility preferences (such as respecting <code className="px-1.5 py-0.5 rounded bg-[#FAF7F2] text-[#050505] font-mono text-xs">prefers-reduced-motion</code>).
        </p>
      </section>

      {/* Section 10 */}
      <section id="security" className="scroll-mt-24 pb-10 border-b border-[#E5DFD7]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#050505] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#64120F] font-semibold">10</span>
          Data Security Measures
        </h2>
        <p>
          We implement robust technical and organizational security controls designed to protect personal information from unauthorized access, alteration, disclosure, or accidental destruction.
        </p>
        <p className="mt-3">
          These controls include modern Transport Layer Security (TLS 1.3) encryption for all data in transit, strict least-privilege administrative access controls, containerized deployment pipelines, and automated security dependency auditing.
        </p>
      </section>

      {/* Section 11 */}
      <section id="your-rights" className="scroll-mt-24 pb-10 border-b border-[#E5DFD7]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#050505] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#64120F] font-semibold">11</span>
          Your Data Protection Rights
        </h2>
        <p>
          Under the DPDP Act 2023, the GDPR, and applicable privacy frameworks, you hold specific statutory rights regarding your personal data:
        </p>
        <ul className="list-disc pl-5 mt-3 space-y-1.5 text-[#302A28]">
          <li><strong>Right to Access:</strong> Request confirmation of whether we process your personal data and obtain a summary of such information;</li>
          <li><strong>Right to Correction &amp; Erasure:</strong> Request the correction of inaccurate data or the deletion of personal information no longer required for its original purpose;</li>
          <li><strong>Right to Restrict Processing:</strong> Request the restriction of processing under specified statutory circumstances;</li>
          <li><strong>Right to Data Portability:</strong> Obtain a structured, commonly used copy of data you provided to us;</li>
          <li><strong>Right to Withdraw Consent:</strong> Where processing relies on consent, withdraw that consent at any time without affecting past lawful processing.</li>
        </ul>
        <p className="mt-3">
          To exercise any of these rights, contact us at <a href={`mailto:${SITE_CONFIG.contactEmail}`} className="text-[#64120F] hover:underline font-medium">{SITE_CONFIG.contactEmail}</a>. We verify identity and respond within statutory timeframes.
        </p>
      </section>

      {/* Section 12 */}
      <section id="children" className="scroll-mt-24 pb-10 border-b border-[#E5DFD7]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#050505] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#64120F] font-semibold">12</span>
          Children&apos;s Privacy
        </h2>
        <p>
          Our website and digital engineering services are directed exclusively at business enterprises, technology founders, and adult professionals aged 18 and older.
        </p>
        <p className="mt-3">
          We do not knowingly collect, solicit, or maintain personal information from individuals under the age of 18. If we become aware that an individual under 18 has submitted personal information through our contact channels, we will take immediate steps to permanently expunge such records from our systems.
        </p>
      </section>

      {/* Section 13 */}
      <section id="do-not-track" className="scroll-mt-24 pb-10 border-b border-[#E5DFD7]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#050505] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#64120F] font-semibold">13</span>
          Do Not Track &amp; Browser Privacy Controls
        </h2>
        <p>
          Our public showcase website does not deploy third-party advertising cookies, commercial tracking pixels, or cross-site behavioral profiling tools. Standard website browsing does not initiate behavioral data capture mechanisms addressed by &ldquo;Do Not Track&rdquo; (DNT) or Global Privacy Control (GPC) signals.
        </p>
      </section>

      {/* Section 14 */}
      <section id="changes" className="scroll-mt-24 pb-10 border-b border-[#E5DFD7]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#050505] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#64120F] font-semibold">14</span>
          Changes to This Privacy Policy
        </h2>
        <p>
          We may periodically revise this Privacy Policy to reflect advancements in our technology stack, changes in studio structure, or updates to domestic and international privacy legislation.
        </p>
        <p className="mt-3">
          Any updates will be published directly to this page with an updated effective date. We encourage visitors to review this document periodically to stay informed about our data protection commitments.
        </p>
      </section>

      {/* Section 15 */}
      <section id="contact" className="scroll-mt-24 pt-2">
        <h2 className="text-xl sm:text-2xl font-bold text-[#050505] mb-3 flex items-baseline gap-3">
          <span className="font-mono text-sm text-[#64120F] font-semibold">15</span>
          Contact Us &amp; Grievance Redressal
        </h2>
        <p>
          If you have questions, inquiries, requests, or statutory grievances concerning this Privacy Policy or our data handling practices, please contact our studio team:
        </p>
        <div className="mt-4 p-5 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD7] font-mono text-xs sm:text-sm text-[#050505]">
          <p>
            <span className="text-[#70757E]">Studio Contact for Privacy Inquiries:</span>{' '}
            <a
              href={`mailto:${SITE_CONFIG.contactEmail}?subject=Privacy%20Inquiry`}
              className="text-[#64120F] font-semibold hover:underline"
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