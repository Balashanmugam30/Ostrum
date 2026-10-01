import React from 'react';
import { HeroCanvas } from '@/components/hero/HeroCanvas';
import { MetricsBar } from '@/components/sections/MetricsBar';
import { PhilosophySection } from '@/components/sections/PhilosophySection';
import { CapabilitiesSection } from '@/components/sections/CapabilitiesSection';
import { SelectedWorks } from '@/components/sections/SelectedWorks';
import { SystemSandbox } from '@/components/sections/SystemSandbox';
import { DeepDiveBlueprint } from '@/components/sections/DeepDiveBlueprint';
import { ToolingStack } from '@/components/sections/ToolingStack';
import { WorkflowSection } from '@/components/sections/WorkflowSection';
import { StudioGenesis } from '@/components/sections/StudioGenesis';
import { ClientProof } from '@/components/sections/ClientProof';
import { EngagementModels } from '@/components/sections/EngagementModels';
import { FieldNotes } from '@/components/sections/FieldNotes';
import { FaqAccordion } from '@/components/sections/FaqAccordion';
import { ProjectBrief } from '@/components/sections/ProjectBrief';

export default function HomePage() {
  return (
    <main className="w-full">
      {/* Chapter 02: Hero Canvas & Architecture Visual */}
      <HeroCanvas />

      {/* Chapter 03: Live Proof & Engineering Metrics Bar */}
      <MetricsBar />

      {/* Chapter 04: Philosophy & Positioning Statement */}
      <PhilosophySection />

      {/* Chapter 05: Core Disciplines & Capability Matrix */}
      <CapabilitiesSection />

      {/* Chapter 06: Selected Works / Portfolio Showcase */}
      <SelectedWorks />

      {/* Chapter 07: Live Interactive Architectural Visualizer / Sandbox */}
      <SystemSandbox />

      {/* Chapter 08: Deep-Dive Featured Technical Study: Campus360 */}
      <DeepDiveBlueprint />

      {/* Chapter 09: Technology Stack & Modern Tooling Matrix */}
      <ToolingStack />

      {/* Chapter 10: 4-Stage Operational Delivery Progression */}
      <WorkflowSection />

      {/* Chapter 11: About Ostrum / Studio Genesis & Leadership */}
      <StudioGenesis />

      {/* Chapter 12: Client Proof, Partner Stories & Industry Endorsements */}
      <ClientProof />

      {/* Chapter 13: Transparent Engagement & Commercial Models */}
      <EngagementModels />

      {/* Chapter 14: Engineering Thinking & Technical Field Notes */}
      <FieldNotes />

      {/* Chapter 15: Critical Inquiries & Frequently Asked Questions */}
      <FaqAccordion />

      {/* Chapter 16: Structured Project Inquiry & Technical Brief Flow */}
      <ProjectBrief />
    </main>
  );
}
