'use client';

import React, { useState } from 'react';

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
      setErrorMessage('Network error occurred. You can reach us directly at hello@theostrum.com.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      data-testid="contact-section"
      className="relative z-20 w-full overflow-hidden select-text text-black bg-transparent"
      aria-label="Contact and Project Enquiry"
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-16 lg:px-20 pt-24 sm:pt-32 lg:pt-36 pb-32 sm:pb-44 lg:pb-52">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Heading & Concise Technical Scope */}
          <div className="lg:col-span-5 flex flex-col items-start lg:sticky lg:top-28">
            <h2
              data-testid="contact-heading"
              className="font-condensed font-bold uppercase text-[#FFF8F3] tracking-[-0.01em] select-none"
              style={{
                fontSize: 'clamp(3.2rem, 7.5vw, 96px)',
                lineHeight: '0.92',
                color: '#FFF8F3',
              }}
            >
              Reach Out
              <br />
              To Us
            </h2>

            <p className="font-sans text-base sm:text-lg text-[#FFF8F3]/90 leading-relaxed max-w-md mt-6 sm:mt-8 font-normal">
              Tell us about the product, system, or digital experience you&apos;re building. We&apos;ll review your requirements and discuss the next steps.
            </p>
          </div>

          {/* Right Column: Solid Warm-White Form Panel */}
          <div className="lg:col-span-7 w-full flex justify-center lg:justify-end">
            <div
              data-testid="contact-form-panel"
              className="w-full max-w-[580px] rounded-[28px] bg-[#FFF8F3] border border-[#DCD4CE] shadow-[0_24px_60px_-15px_rgba(20,10,10,0.08),0_8px_24px_-4px_rgba(20,10,10,0.04)] relative overflow-hidden"
            >
              <div
                id="contact-form"
                className="p-8 sm:p-10 text-black select-text"
              >
                {submitSuccess ? (
                  <div
                    data-testid="contact-success-state"
                    className="py-16 flex flex-col items-center text-center select-none"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#D24B2C]/10 border border-[#D24B2C]/30 flex items-center justify-center text-[#D24B2C] text-2xl mb-6 font-semibold">
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
                      className="px-8 py-3.5 rounded-full bg-[#050505] text-white font-sans font-semibold text-sm hover:bg-black transition-colors cursor-pointer"
                    >
                      Submit Another Enquiry
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    data-testid="contact-enquiry-form"
                    className="flex flex-col gap-4 sm:gap-4.5"
                  >
                    {/* Panel Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-black/10">
                      <span className="font-sans text-xs uppercase tracking-wider text-[#1F2937] font-bold">
                        Project Enquiry
                      </span>
                      <span className="font-mono text-[11px] text-[#6B7280]">
                        <span className="text-[#D24B2C]">*</span> Required
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

                    {/* 1. Name — required */}
                    <div className="flex flex-col gap-1.5 w-full">
                      <label
                        htmlFor="contact-name"
                        className="font-sans text-xs uppercase tracking-wider text-[#1F2937] font-semibold"
                      >
                        Name <span className="text-[#D24B2C]">*</span>
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
                        className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-[#FFFFFF] hover:border-[#B8AEA6] focus:border-[#D24B2C] focus:ring-2 focus:ring-[#D24B2C]/20 text-[#111827] placeholder:text-[#6B7280] border border-[#DCD4CE] outline-none transition-all font-sans text-sm"
                      />
                    </div>

                    {/* 2. Work Email — required */}
                    <div className="flex flex-col gap-1.5 w-full">
                      <label
                        htmlFor="contact-email"
                        className="font-sans text-xs uppercase tracking-wider text-[#1F2937] font-semibold"
                      >
                        Work Email <span className="text-[#D24B2C]">*</span>
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
                        className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-[#FFFFFF] hover:border-[#B8AEA6] focus:border-[#D24B2C] focus:ring-2 focus:ring-[#D24B2C]/20 text-[#111827] placeholder:text-[#6B7280] border border-[#DCD4CE] outline-none transition-all font-sans text-sm"
                      />
                    </div>

                    {/* 3. Company — optional */}
                    <div className="flex flex-col gap-1.5 w-full">
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
                        className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-[#FFFFFF] hover:border-[#B8AEA6] focus:border-[#D24B2C] focus:ring-2 focus:ring-[#D24B2C]/20 text-[#111827] placeholder:text-[#6B7280] border border-[#DCD4CE] outline-none transition-all font-sans text-sm"
                      />
                    </div>

                    {/* 4. Project Type — optional select */}
                    <div className="flex flex-col gap-1.5 w-full">
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
                        className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-[#FFFFFF] hover:border-[#B8AEA6] focus:border-[#D24B2C] focus:ring-2 focus:ring-[#D24B2C]/20 text-[#111827] border border-[#DCD4CE] outline-none transition-all font-sans text-sm cursor-pointer"
                      >
                        <option value="">Select project type...</option>
                        {PROJECT_TYPE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 5. Phone Number — optional */}
                    <div className="flex flex-col gap-1.5 w-full">
                      <label
                        htmlFor="contact-phone"
                        className="font-sans text-xs uppercase tracking-wider text-[#1F2937] font-semibold"
                      >
                        Phone Number <span className="text-[#6B7280] font-normal text-[11px]">(Optional)</span>
                      </label>
                      <input
                        id="contact-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. +61 400 000 000"
                        className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-[#FFFFFF] hover:border-[#B8AEA6] focus:border-[#D24B2C] focus:ring-2 focus:ring-[#D24B2C]/20 text-[#111827] placeholder:text-[#6B7280] border border-[#DCD4CE] outline-none transition-all font-sans text-sm"
                      />
                    </div>

                    {/* 6. Message — required */}
                    <div className="flex flex-col gap-1.5 w-full">
                      <label
                        htmlFor="contact-message"
                        className="font-sans text-xs uppercase tracking-wider text-[#1F2937] font-semibold"
                      >
                        Message <span className="text-[#D24B2C]">*</span>
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Describe your project goals, scope, and technical timeline..."
                        className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-[#FFFFFF] hover:border-[#B8AEA6] focus:border-[#D24B2C] focus:ring-2 focus:ring-[#D24B2C]/20 text-[#111827] placeholder:text-[#6B7280] border border-[#DCD4CE] outline-none transition-all font-sans text-sm min-h-[120px] resize-y"
                      />
                    </div>

                    {/* 7. Send Enquiry Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 px-8 rounded-full bg-[#050505] hover:bg-black text-white font-sans font-semibold text-base transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.18)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.28)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer group"
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
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OstrumContactSection;
