'use client';

import React, { useState } from 'react';
import OstrumLiquidGlass from '@/components/ui/OstrumLiquidGlass';

interface FormData {
  name: string;
  email: string;
  company: string;
  projectType: string;
  phone: string;
  message: string;
}

const INITIAL_FORM_DATA: FormData = {
  name: '',
  email: '',
  company: '',
  projectType: '',
  phone: '',
  message: '',
};

const PROJECT_TYPE_OPTIONS = [
  'Digital Experiences (Web, Platforms, Portals)',
  'AI Systems & Agents (Autonomous Automation)',
  'Business Platforms (CRM, ERP, Operations)',
  'Software & Product Engineering (SaaS, APIs)',
  'Hardware & Connected Tech (IoT, Embedded)',
  'Custom Engineering & Architecture',
];

export function OstrumContactSection() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validation
    if (!formData.name.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }

    if (!formData.email.trim()) {
      setErrorMessage('Please enter your work email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!formData.message.trim()) {
      setErrorMessage('Please provide a message or describe your project.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitSuccess(true);
        setFormData(INITIAL_FORM_DATA);
      } else {
        setErrorMessage(data.error || 'Failed to submit enquiry. Please try again.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setErrorMessage('Network error occurred. You can reach us directly at hello@ostrum.co.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    const target = document.getElementById('contact-form') || document.getElementById('contact');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      const nameInput = document.getElementById('contact-name');
      if (nameInput) {
        setTimeout(() => nameInput.focus(), 500);
      }
    }
  };

  return (
    <section
      id="contact"
      data-testid="contact-section"
      className="relative z-20 w-full overflow-hidden select-text text-black"
      style={{
        background: `
          radial-gradient(ellipse 70% 50% at 80% 25%, rgba(255, 255, 255, 0.45) 0%, transparent 70%),
          radial-gradient(ellipse 60% 45% at 20% 60%, rgba(220, 231, 247, 0.5) 0%, transparent 70%),
          linear-gradient(180deg, #C7A6E3 0%, #D7C3EC 24%, #EBDCEB 46%, #DCE7F7 66%, #20242C 82%, #050505 92%, #050505 100%)
        `,
      }}
      aria-label="Contact and Project Enquiry"
    >
      {/* Upper Main Contact Region (Pastel Gradient Field) */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-16 lg:px-20 pt-24 sm:pt-32 lg:pt-36 pb-20 sm:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Heading & Concise Technical Scope */}
          <div className="lg:col-span-5 flex flex-col items-start lg:sticky lg:top-28">
            <h2
              data-testid="contact-heading"
              className="font-condensed font-bold uppercase text-black tracking-[-0.01em] select-none"
              style={{
                fontSize: 'clamp(3.2rem, 7.5vw, 96px)',
                lineHeight: '0.92',
                color: '#000000',
              }}
            >
              Reach Out
              <br />
              To Us
            </h2>

            <p className="font-sans text-base sm:text-lg text-[#2E3542] leading-relaxed max-w-md mt-6 sm:mt-8 font-normal">
              Have an ambitious product, intelligent AI system, or custom engineering challenge in mind? Tell us what you&apos;re building and we&apos;ll schedule a confidential technical consultation.
            </p>

            {/* Direct Studio Channels */}
            <div className="mt-8 pt-8 border-t border-black/15 w-full max-w-md flex flex-col gap-3 font-mono text-xs text-[#3E4552]">
              <div className="flex items-center justify-between">
                <span className="uppercase tracking-wider">Direct Studio Line:</span>
                <a
                  href="mailto:hello@ostrum.co"
                  className="font-semibold text-black hover:text-[#5B21B6] transition-colors"
                >
                  hello@ostrum.co
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="uppercase tracking-wider">Response Window:</span>
                <span className="font-semibold text-black">Within 24 Hours</span>
              </div>
            </div>
          </div>

          {/* Right Column: Liquid-Glass Form Panel */}
          <div className="lg:col-span-7 w-full flex justify-center lg:justify-end">
            <OstrumLiquidGlass
              radius={28}
              className="w-full max-w-[660px]"
            >
              <div
                id="contact-form"
                className="p-7 sm:p-9 md:p-10 text-black select-text"
              >
                {submitSuccess ? (
                  <div
                    data-testid="contact-success-state"
                    className="py-12 flex flex-col items-center text-center select-none"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#7A52A8]/15 border border-[#7A52A8]/30 flex items-center justify-center text-[#5A2C8F] text-2xl mb-6">
                      ✓
                    </div>
                    <h3 className="font-sans text-2xl sm:text-3xl font-bold text-black mb-3">
                      Enquiry Received
                    </h3>
                    <p className="font-sans text-sm sm:text-base text-[#3A4353] max-w-md leading-relaxed mb-8">
                      Thank you for reaching out. We have received your project details and a studio principal will review your requirements and respond within 24 hours.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitSuccess(false)}
                      className="px-8 py-3.5 rounded-full bg-[#111827] text-white font-sans font-semibold text-sm hover:bg-black transition-colors cursor-pointer"
                    >
                      Submit Another Enquiry
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    data-testid="contact-enquiry-form"
                    className="flex flex-col gap-4 sm:gap-5"
                  >
                    {/* Panel Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-black/10">
                      <span className="font-sans text-xs uppercase tracking-wider text-[#4A3B69] font-bold">
                        Project Enquiry
                      </span>
                      <span className="font-mono text-[11px] text-[#6B7280]">
                        * Required fields
                      </span>
                    </div>

                    {errorMessage && (
                      <div
                        role="alert"
                        className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-800 text-xs sm:text-sm font-sans flex items-center gap-3"
                      >
                        <span className="text-red-600 font-bold shrink-0">!</span>
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Row 1: Name & Work Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="contact-name"
                          className="font-sans text-xs uppercase tracking-wider text-[#1F2937] font-semibold"
                        >
                          Name <span className="text-[#8B5CF6]">*</span>
                        </label>
                        <input
                          id="contact-name"
                          name="name"
                          type="text"
                          required
                          autoComplete="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g. Elena Vance"
                          className="w-full px-4 py-3 rounded-xl bg-white/65 hover:bg-white/85 focus:bg-white text-[#111827] placeholder:text-[#6B7280] border border-black/10 focus:border-[#7A52A8] focus:ring-2 focus:ring-[#C7A6E3]/50 outline-none transition-all font-sans text-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="contact-email"
                          className="font-sans text-xs uppercase tracking-wider text-[#1F2937] font-semibold"
                        >
                          Work Email <span className="text-[#8B5CF6]">*</span>
                        </label>
                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="elena@company.com"
                          className="w-full px-4 py-3 rounded-xl bg-white/65 hover:bg-white/85 focus:bg-white text-[#111827] placeholder:text-[#6B7280] border border-black/10 focus:border-[#7A52A8] focus:ring-2 focus:ring-[#C7A6E3]/50 outline-none transition-all font-sans text-sm"
                        />
                      </div>
                    </div>

                    {/* Row 2: Company & Project Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="contact-company"
                          className="font-sans text-xs uppercase tracking-wider text-[#1F2937] font-semibold"
                        >
                          Company <span className="text-[#6B7280] font-normal text-[11px]">(Optional)</span>
                        </label>
                        <input
                          id="contact-company"
                          name="company"
                          type="text"
                          autoComplete="organization"
                          value={formData.company}
                          onChange={handleChange}
                          placeholder="e.g. Vance Dynamics"
                          className="w-full px-4 py-3 rounded-xl bg-white/65 hover:bg-white/85 focus:bg-white text-[#111827] placeholder:text-[#6B7280] border border-black/10 focus:border-[#7A52A8] focus:ring-2 focus:ring-[#C7A6E3]/50 outline-none transition-all font-sans text-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="contact-project-type"
                          className="font-sans text-xs uppercase tracking-wider text-[#1F2937] font-semibold"
                        >
                          Project Type <span className="text-[#6B7280] font-normal text-[11px]">(Optional)</span>
                        </label>
                        <select
                          id="contact-project-type"
                          name="projectType"
                          value={formData.projectType}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl bg-white/65 hover:bg-white/85 focus:bg-white text-[#111827] border border-black/10 focus:border-[#7A52A8] focus:ring-2 focus:ring-[#C7A6E3]/50 outline-none transition-all font-sans text-sm cursor-pointer"
                        >
                          <option value="">Select project type...</option>
                          {PROJECT_TYPE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Row 3: Phone (Optional) */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="contact-phone"
                        className="font-sans text-xs uppercase tracking-wider text-[#1F2937] font-semibold"
                      >
                        Phone number <span className="text-[#6B7280] font-normal text-[11px]">(Optional)</span>
                      </label>
                      <input
                        id="contact-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. +61 400 000 000"
                        className="w-full px-4 py-3 rounded-xl bg-white/65 hover:bg-white/85 focus:bg-white text-[#111827] placeholder:text-[#6B7280] border border-black/10 focus:border-[#7A52A8] focus:ring-2 focus:ring-[#C7A6E3]/50 outline-none transition-all font-sans text-sm"
                      />
                    </div>

                    {/* Row 4: Message (Required) */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="contact-message"
                        className="font-sans text-xs uppercase tracking-wider text-[#1F2937] font-semibold"
                      >
                        Message <span className="text-[#8B5CF6]">*</span>
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Describe your project goals, scope, and technical timeline..."
                        className="w-full px-4 py-3 rounded-xl bg-white/65 hover:bg-white/85 focus:bg-white text-[#111827] placeholder:text-[#6B7280] border border-black/10 focus:border-[#7A52A8] focus:ring-2 focus:ring-[#C7A6E3]/50 outline-none transition-all font-sans text-sm min-h-[110px] resize-y"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 px-8 rounded-full bg-[#111827] hover:bg-black text-white font-sans font-semibold text-base transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.22)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer group"
                      >
                        {isSubmitting ? (
                          <>
                            <span
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                              aria-hidden="true"
                            />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Enquiry</span>
                            <span
                              className="transition-transform group-hover:translate-x-1"
                              aria-hidden="true"
                            >
                              →
                            </span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Confidentiality Assurance */}
                    <p className="font-mono text-[11px] text-center text-[#525B6C] uppercase tracking-wider pt-1">
                      Strict Non-Disclosure Guaranteed · Direct Principal Response
                    </p>
                  </form>
                )}
              </div>
            </OstrumLiquidGlass>
          </div>
        </div>
      </div>

      {/* Lower Closing Sub-Region: Smooth Fade into Black CTA */}
      <div
        id="closing-cta"
        data-testid="closing-cta"
        className="w-full pt-16 sm:pt-24 pb-24 sm:pb-32 px-6 sm:px-10 md:px-16 lg:px-20 text-white select-text"
      >
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8 pt-12 border-t border-white/10">
          <div className="max-w-2xl">
            <h2
              className="font-condensed font-bold uppercase text-white tracking-[-0.01em] select-none"
              style={{
                fontSize: 'clamp(2.6rem, 5.5vw, 68px)',
                lineHeight: '0.92',
                color: '#FFFFFF',
              }}
            >
              Ready To Build?
            </h2>
            <p className="font-sans text-base sm:text-lg text-white/70 leading-relaxed max-w-lg mt-4 font-normal">
              Partner with Ostrum to engineer transformative software, intelligent systems, and scalable digital ventures.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end shrink-0">
            <button
              type="button"
              onClick={scrollToForm}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-[#0B0C0E] font-sans text-base sm:text-lg font-semibold transition-all duration-300 hover:bg-[#EBDCEB] hover:shadow-[0_10px_30px_rgba(255,255,255,0.18)] cursor-pointer group"
            >
              <span>Start a Conversation</span>
              <span
                className="transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </button>
            <p className="font-mono text-xs text-white/45 mt-3">
              Direct Principal Line · hello@ostrum.co
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OstrumContactSection;
