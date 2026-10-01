import React from 'react';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { ProjectBrief } from '@/components/sections/ProjectBrief';

export const metadata = {
  title: 'Contact & Project Inquiry — Ostrum',
  description: 'Initiate a project brief or schedule a consultation with Ostrum engineering principals.',
};

export default function ContactPage() {
  return (
    <div className="py-12 sm:py-20 bg-canvas-warm">
      <div className="max-w-[1240px] mx-auto px-6 md:px-8 text-center mb-8">
        <SectionKicker centered>Direct Engagement</SectionKicker>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-ink-primary tracking-tight mb-4">
          Start a Conversation
        </h1>
        <p className="text-base sm:text-lg text-ink-slate max-w-xl mx-auto leading-relaxed">
          Tell us what you are working on. We will review your requirements and respond with an honest architectural assessment within 24 business hours.
        </p>
      </div>

      <ProjectBrief />
    </div>
  );
}
