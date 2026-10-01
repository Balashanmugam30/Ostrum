'use client';

import React, { useState } from 'react';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { CornerCrosses } from '@/components/ui/CornerCrosses';
import { RollingButton } from '@/components/ui/RollingButton';

export function ProjectBrief() {
  const [selectedObjective, setSelectedObjective] = useState<string>('New Custom Web Application');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    timeline: '',
    notes: '',
  });

  const objectives = [
    'New Custom Web Application',
    'Business Software / ERP / CRM',
    'WhatsApp AI & Automation',
    'Brand Identity & Full Overhaul',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Project Brief Submitted:', {
      objective: selectedObjective,
      ...formData,
    });
    setSubmitted(true);
  };

  return (
    <section
      id="brief"
      aria-labelledby="brief-title"
      className="py-24 sm:py-32 bg-surface-bisque border-b border-border-subtle"
    >
      <div className="max-w-[980px] mx-auto px-6 md:px-8">
        <div className="text-center mb-12">
          <SectionKicker centered>Chapter 16 // Project Brief Flow</SectionKicker>

          <h2
            id="brief-title"
            className="font-display font-bold text-3xl sm:text-4xl lg:text-[44px] leading-tight tracking-tight text-ink-primary mb-3"
          >
            Initiate your project brief.
          </h2>

          <p className="text-base sm:text-lg text-ink-slate max-w-xl mx-auto leading-relaxed">
            Select your requirements below. We will review your operational scope and respond within 24 business hours with an honest assessment and timeline:
          </p>
        </div>

        <div className="relative bg-surface-card border border-border-subtle rounded-2xl p-8 sm:p-12 shadow-card">
          <CornerCrosses />

          {/* 4-Step Progress Indicator Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-6 mb-8 font-mono text-xs font-semibold">
            <span className="text-accent-terracotta">01. OBJECTIVE</span>
            <span className="text-ink-muted">02. SCALE</span>
            <span className="text-ink-muted">03. TIMELINE</span>
            <span className="text-ink-muted">04. CONTACT</span>
          </div>

          {/* Step 1: Objective Selector */}
          <div className="mb-8">
            <label className="block font-display font-bold text-base text-ink-primary mb-3">
              Step 1: What is your primary objective?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {objectives.map((obj) => {
                const isSelected = selectedObjective === obj;
                return (
                  <button
                    key={obj}
                    type="button"
                    onClick={() => setSelectedObjective(obj)}
                    className={`flex items-center justify-between p-4 rounded-xl border text-sm font-medium transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'border-accent-terracotta bg-accent-terracotta-tint text-accent-terracotta font-semibold'
                        : 'border-border-subtle bg-canvas-pearl text-ink-primary hover:border-border-strong'
                    }`}
                  >
                    <span>{obj}</span>
                    <span className="font-mono text-xs">{isSelected ? '✔' : '+'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label htmlFor="brief-name" className="block font-display font-bold text-xs uppercase tracking-wider text-ink-primary mb-2">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  id="brief-name"
                  required
                  placeholder="e.g. Anand Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border-subtle bg-canvas-pearl text-ink-primary text-sm focus:outline-none focus:border-accent-terracotta transition-colors"
                />
              </div>

              <div>
                <label htmlFor="brief-email" className="block font-display font-bold text-xs uppercase tracking-wider text-ink-primary mb-2">
                  Work Email *
                </label>
                <input
                  type="email"
                  id="brief-email"
                  required
                  placeholder="anand@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border-subtle bg-canvas-pearl text-ink-primary text-sm focus:outline-none focus:border-accent-terracotta transition-colors"
                />
              </div>

              <div>
                <label htmlFor="brief-company" className="block font-display font-bold text-xs uppercase tracking-wider text-ink-primary mb-2">
                  Company / Organization *
                </label>
                <input
                  type="text"
                  id="brief-company"
                  required
                  placeholder="e.g. Apex Health Logistics"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border-subtle bg-canvas-pearl text-ink-primary text-sm focus:outline-none focus:border-accent-terracotta transition-colors"
                />
              </div>

              <div>
                <label htmlFor="brief-timeline" className="block font-display font-bold text-xs uppercase tracking-wider text-ink-primary mb-2">
                  Desired Launch Timeline
                </label>
                <input
                  type="text"
                  id="brief-timeline"
                  placeholder="e.g. 6 to 10 Weeks"
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border-subtle bg-canvas-pearl text-ink-primary text-sm focus:outline-none focus:border-accent-terracotta transition-colors"
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="brief-notes" className="block font-display font-bold text-xs uppercase tracking-wider text-ink-primary mb-2">
                Project Summary or Current Bottleneck
              </label>
              <textarea
                id="brief-notes"
                rows={3}
                placeholder="Tell us briefly about what you want to build or what software issue is slowing your team down..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-border-subtle bg-canvas-pearl text-ink-primary text-sm focus:outline-none focus:border-accent-terracotta transition-colors"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <span className="font-mono text-xs text-ink-slate flex items-center gap-1.5">
                <span>🔒</span> Privacy guaranteed. Zero sales spam or unsolicited pitches.
              </span>

              <RollingButton
                type="submit"
                variant="terracotta"
                className="py-3 px-8 text-sm font-bold"
                subLabel="24-Hour Founder Response"
              >
                Submit Project Brief for Review
              </RollingButton>
            </div>
          </form>

          {submitted && (
            <div
              role="alert"
              className="mt-6 p-5 rounded-xl bg-accent-sage-tint border border-accent-sage text-accent-sage font-medium text-sm flex items-center gap-3 animate-fade-in"
            >
              <span className="text-lg">✔</span>
              <span>
                <strong>Brief Received.</strong> Thank you! Our engineering principals will review your requirements and reach out within 24 business hours.
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
