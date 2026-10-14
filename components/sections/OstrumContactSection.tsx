'use client';

import React, { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  city: string;
  phone: string;
  company: string;
  position: string;
  message: string;
}

const INITIAL_FORM_DATA: FormData = {
  name: '',
  email: '',
  city: '',
  phone: '',
  company: '',
  position: '',
  message: '',
};

export function OstrumContactSection() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      setErrorMessage('Please enter your email address.');
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

  return (
    <section
      id="contact"
      data-testid="contact-section"
      className="relative z-20 w-full overflow-hidden select-text text-black"
      style={{
        background: `
          radial-gradient(ellipse 70% 60% at 85% 25%, rgba(134, 255, 248, 0.08) 0%, transparent 70%),
          radial-gradient(ellipse 60% 50% at 15% 75%, rgba(24, 43, 73, 0.06) 0%, transparent 70%),
          linear-gradient(180deg, #E3EAF2 0%, #DCE4EE 35%, #D4DEEA 70%, #CBD6E3 100%)
        `,
      }}
      aria-label="Contact and Project Enquiry"
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-16 lg:px-20 py-24 sm:py-32 lg:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Heading & Technical Invitation */}
          <div className="lg:col-span-5 flex flex-col items-start lg:sticky lg:top-28">
            <span className="font-mono text-xs sm:text-sm uppercase tracking-[0.24em] font-semibold text-[#D24B2C] mb-4">
              READY TO BUILD?
            </span>
            <h2
              data-testid="contact-heading"
              className="font-condensed font-bold uppercase text-black tracking-[-0.01em] select-none"
              style={{
                fontSize: 'clamp(3.5rem, 8vw, 105px)',
                lineHeight: '0.92',
                color: '#000000',
              }}
            >
              Reach Out
              <br />
              To Us
            </h2>

            <p className="font-sans text-base sm:text-lg text-[#3A4353] leading-relaxed max-w-md mt-6 sm:mt-8 font-normal">
              Have an ambitious product, intelligent AI system, or custom engineering challenge in mind? Tell us what you&apos;re building and we&apos;ll schedule a confidential technical consultation.
            </p>

            {/* Direct Channel Badges */}
            <div className="mt-8 pt-8 border-t border-black/10 w-full max-w-md flex flex-col gap-3 font-mono text-xs text-[#50545C]">
              <div className="flex items-center justify-between">
                <span className="uppercase tracking-wider">Direct Studio Line:</span>
                <a
                  href="mailto:hello@ostrum.co"
                  className="font-semibold text-black hover:text-[#D24B2C] transition-colors"
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

          {/* Right Column: Prominent Rounded Form Panel */}
          <div className="lg:col-span-7 w-full">
            <div
              className="w-full rounded-[24px] sm:rounded-[28px] p-7 sm:p-9 md:p-11 text-white border border-white/10 shadow-[0_24px_64px_-12px_rgba(10,15,26,0.35)] relative overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #162030 0%, #0F1624 55%, #0A0F1A 100%)',
              }}
            >
              {/* Subtle Atmospheric Internal Glow */}
              <div
                className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[90px] opacity-25 bg-[#86FFF8]"
                aria-hidden="true"
              />

              {submitSuccess ? (
                <div
                  data-testid="contact-success-state"
                  className="py-12 flex flex-col items-center text-center select-none"
                >
                  <div className="w-16 h-16 rounded-full bg-[#86FFF8]/15 border border-[#86FFF8]/40 flex items-center justify-center text-[#86FFF8] text-2xl mb-6">
                    ✓
                  </div>
                  <h3 className="font-sans text-2xl sm:text-3xl font-bold text-white mb-3">
                    Enquiry Received
                  </h3>
                  <p className="font-sans text-sm sm:text-base text-white/70 max-w-md leading-relaxed mb-8">
                    Thank you for reaching out. We have received your project details and a studio principal will review your requirements and respond within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitSuccess(false)}
                    className="px-8 py-3.5 rounded-full bg-white text-[#0A0F1A] font-sans font-semibold text-sm hover:bg-[#86FFF8] transition-colors"
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  data-testid="contact-enquiry-form"
                  className="flex flex-col gap-5 sm:gap-6 relative z-10"
                >
                  {/* Micro-header over form */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#86FFF8] font-semibold">
                      PROJECT ENQUIRY
                    </span>
                    <span className="font-mono text-[11px] text-white/40 uppercase tracking-widest">
                      * Required fields
                    </span>
                  </div>

                  {errorMessage && (
                    <div
                      role="alert"
                      className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs sm:text-sm font-sans flex items-center gap-3"
                    >
                      <span className="text-red-400 font-bold shrink-0">!</span>
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Row 1: Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="contact-name"
                        className="font-sans text-xs uppercase tracking-wider text-white/80 font-medium"
                      >
                        Name <span className="text-[#86FFF8]">*</span>
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
                        className="w-full px-5 py-3.5 rounded-full bg-white/[0.07] hover:bg-white/[0.1] focus:bg-white/[0.12] text-white placeholder:text-white/30 border border-white/10 focus:border-[#86FFF8]/60 focus:ring-2 focus:ring-[#86FFF8]/25 outline-none transition-all font-sans text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="contact-email"
                        className="font-sans text-xs uppercase tracking-wider text-white/80 font-medium"
                      >
                        Email address <span className="text-[#86FFF8]">*</span>
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
                        className="w-full px-5 py-3.5 rounded-full bg-white/[0.07] hover:bg-white/[0.1] focus:bg-white/[0.12] text-white placeholder:text-white/30 border border-white/10 focus:border-[#86FFF8]/60 focus:ring-2 focus:ring-[#86FFF8]/25 outline-none transition-all font-sans text-sm"
                      />
                    </div>
                  </div>

                  {/* Row 2: City & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="contact-city"
                        className="font-sans text-xs uppercase tracking-wider text-white/80 font-medium"
                      >
                        City
                      </label>
                      <input
                        id="contact-city"
                        name="city"
                        type="text"
                        autoComplete="address-level2"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="e.g. Melbourne / Remote"
                        className="w-full px-5 py-3.5 rounded-full bg-white/[0.07] hover:bg-white/[0.1] focus:bg-white/[0.12] text-white placeholder:text-white/30 border border-white/10 focus:border-[#86FFF8]/60 focus:ring-2 focus:ring-[#86FFF8]/25 outline-none transition-all font-sans text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="contact-phone"
                        className="font-sans text-xs uppercase tracking-wider text-white/80 font-medium"
                      >
                        Phone number
                      </label>
                      <input
                        id="contact-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. +61 400 000 000"
                        className="w-full px-5 py-3.5 rounded-full bg-white/[0.07] hover:bg-white/[0.1] focus:bg-white/[0.12] text-white placeholder:text-white/30 border border-white/10 focus:border-[#86FFF8]/60 focus:ring-2 focus:ring-[#86FFF8]/25 outline-none transition-all font-sans text-sm"
                      />
                    </div>
                  </div>

                  {/* Row 3: Company & Position */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="contact-company"
                        className="font-sans text-xs uppercase tracking-wider text-white/80 font-medium"
                      >
                        Company
                      </label>
                      <input
                        id="contact-company"
                        name="company"
                        type="text"
                        autoComplete="organization"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="e.g. Vance Dynamics"
                        className="w-full px-5 py-3.5 rounded-full bg-white/[0.07] hover:bg-white/[0.1] focus:bg-white/[0.12] text-white placeholder:text-white/30 border border-white/10 focus:border-[#86FFF8]/60 focus:ring-2 focus:ring-[#86FFF8]/25 outline-none transition-all font-sans text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="contact-position"
                        className="font-sans text-xs uppercase tracking-wider text-white/80 font-medium"
                      >
                        Position / Role
                      </label>
                      <input
                        id="contact-position"
                        name="position"
                        type="text"
                        autoComplete="organization-title"
                        value={formData.position}
                        onChange={handleChange}
                        placeholder="e.g. VP of Product / Founder"
                        className="w-full px-5 py-3.5 rounded-full bg-white/[0.07] hover:bg-white/[0.1] focus:bg-white/[0.12] text-white placeholder:text-white/30 border border-white/10 focus:border-[#86FFF8]/60 focus:ring-2 focus:ring-[#86FFF8]/25 outline-none transition-all font-sans text-sm"
                      />
                    </div>
                  </div>

                  {/* Full-Width Row: Message */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="contact-message"
                      className="font-sans text-xs uppercase tracking-wider text-white/80 font-medium"
                    >
                      Message <span className="text-[#86FFF8]">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Describe your project goals, scope, and technical timeline..."
                      className="w-full px-5 py-4 rounded-2xl bg-white/[0.07] hover:bg-white/[0.1] focus:bg-white/[0.12] text-white placeholder:text-white/30 border border-white/10 focus:border-[#86FFF8]/60 focus:ring-2 focus:ring-[#86FFF8]/25 outline-none transition-all font-sans text-sm min-h-[120px] resize-y"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-8 rounded-full bg-white hover:bg-[#86FFF8] text-[#0A0F1A] font-sans font-bold text-base sm:text-lg transition-all duration-300 shadow-[0_8px_20px_rgba(255,255,255,0.12)] hover:shadow-[0_12px_28px_rgba(134,255,248,0.25)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                    >
                      {isSubmitting ? (
                        <>
                          <span
                            className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"
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
                  <p className="font-mono text-[11px] text-center text-white/45 uppercase tracking-wider pt-1">
                    Strict Non-Disclosure Guaranteed · Direct Partner Response
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OstrumContactSection;
