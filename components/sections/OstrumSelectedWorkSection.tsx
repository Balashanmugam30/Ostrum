'use client';

import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  (window as any).ScrollTrigger = ScrollTrigger;
}

export type ProjectCategory = 'business' | 'ventures';

export interface ProjectData {
  id: string;
  slug: string;
  category: ProjectCategory;
  categoryLabel: string;
  badge: string;
  title: string;
  subtitle: string;
  clientOrNature: string;
  sectorOrType: string;
  problem: string;
  solution: string;
  stack: string[];
  metrics: { label: string; value: string }[];
  featured?: boolean;
}

export const SELECTED_PROJECTS: ProjectData[] = [
  // ==========================================
  // BUSINESS SYSTEMS (Real operational work)
  // ==========================================
  {
    id: 'campus360',
    slug: 'campus360-erp',
    category: 'business',
    categoryLabel: 'Business Systems',
    badge: 'Demonstration Case Study',
    title: 'Campus360 Enterprise ERP',
    subtitle: 'Unified admissions, automated fee settlement & WhatsApp parent communication.',
    clientOrNature: 'St. Jude International Academy (K-12 Network)',
    sectorOrType: 'Higher & Secondary Education',
    problem:
      'Admissions staff spent over 300 hours each season copying paper application forms into fragmented spreadsheets, reconciling bank transfers by hand, and answering repetitive WhatsApp queries manually.',
    solution:
      'Engineered an edge-deployed portal featuring automated WhatsApp prospect responses via Meta Cloud API, online tuition fee settlement, and unified student record synchronization.',
    stack: ['Next.js 15', 'PostgreSQL', 'Meta Cloud WhatsApp API', 'Tailwind CSS'],
    metrics: [
      { label: 'Admissions Workflow', value: 'Automated Multi-Stage' },
      { label: 'Prospect Response', value: 'Instant Edge Trigger' },
      { label: 'Student Records', value: '100% Paperless Sync' },
    ],
    featured: true,
  },
  {
    id: 'aura-living',
    slug: 'aura-living-commerce',
    category: 'business',
    categoryLabel: 'Business Systems',
    badge: 'Demonstration Case Study',
    title: 'Aura Living Multi-Store Commerce',
    subtitle: 'Connected omni-channel retail system syncing physical POS and e-commerce.',
    clientOrNature: 'Aura Home & Lifestyle (4 Boutique Outlets)',
    sectorOrType: 'Luxury Retail & E-Commerce',
    problem:
      'Store associates had zero visibility into inventory across neighboring boutique outlets or the central warehouse, resulting in frequent stockouts, lost sales, and disappointed customers.',
    solution:
      'Deployed an omni-channel inventory hub with continuous bi-directional POS bridge synchronization, digital WhatsApp receipts, and automated store-to-store transfer reservations.',
    stack: ['React 19', 'Node.js', 'POS Bridge Connector', 'PostgreSQL'],
    metrics: [
      { label: 'Multi-Store Stock', value: 'Real-Time Sync' },
      { label: 'POS Synchronization', value: 'Bi-Directional' },
      { label: 'Checkout Experience', value: 'Unified Omnichannel' },
    ],
    featured: false,
  },
  {
    id: 'greenfield-logistics',
    slug: 'greenfield-fleet-dispatch',
    category: 'business',
    categoryLabel: 'Business Systems',
    badge: 'Demonstration Case Study',
    title: 'Greenfield Fleet Dispatch & CRM',
    subtitle: 'Automated driver dispatch, bill-of-lading OCR extraction & client tracking.',
    clientOrNature: 'Greenfield Freightways',
    sectorOrType: 'B2B Logistics & Supply Chain',
    problem:
      'Consignment statuses and paper bills of lading were manually transcribed into spreadsheets every evening, delaying same-day client billing and triggering disputes.',
    solution:
      'Built a centralized driver dispatch application featuring camera OCR bill-of-lading extraction, automated delivery confirmation timestamps, and live consignment tracking.',
    stack: ['TypeScript', 'Python OCR Service', 'Supabase', 'Next.js App Router'],
    metrics: [
      { label: 'Invoice Settlement', value: 'Same-Day' },
      { label: 'Consignment Tracking', value: 'Live Status' },
      { label: 'Legacy Workbooks', value: 'Fully Retired' },
    ],
    featured: false,
  },

  // ==========================================
  // ORIGINAL VENTURES (Internal software & labs)
  // ==========================================
  {
    id: 'continuum-runtime',
    slug: 'ostrum-continuum-runtime',
    category: 'ventures',
    categoryLabel: 'Original Ventures',
    badge: 'Internal Venture Concept',
    title: 'Ostrum Continuum 3D Runtime',
    subtitle: 'Procedural WebGL & multi-section continuous 3D narrative framework.',
    clientOrNature: 'Ostrum Creative Engineering Core',
    sectorOrType: 'Creative WebGL Infrastructure',
    problem:
      'Traditional 3D web experiences suffer from jarring section boundaries, duplicate WebGL canvas instantiation, heavy CPU memory leaks, and erratic scroll lag on high-DPR screens.',
    solution:
      'Architected a single-canvas WebGL runtime featuring continuous multi-section object docking, dynamic refractive caustics, and adaptive DPR scaling synchronized with GSAP ScrollTrigger.',
    stack: ['Three.js', 'WebGL GLSL', 'GSAP ScrollTrigger', 'TypeScript'],
    metrics: [
      { label: 'WebGL Contexts', value: 'Single Global Canvas' },
      { label: 'Section Docking', value: 'Zero-Drift Sync' },
      { label: 'Frame Budget', value: 'Sub-16ms Frametimes' },
    ],
    featured: true,
  },
  {
    id: 'autopilot-assistant',
    slug: 'autopilot-operations-assistant',
    category: 'ventures',
    categoryLabel: 'Original Ventures',
    badge: 'Original Venture',
    title: 'AutoPilot Operations Assistant',
    subtitle: 'Autonomous WhatsApp & ERP agent with deterministic tool execution.',
    clientOrNature: 'Ostrum Autonomous Labs',
    sectorOrType: 'Practical AI Infrastructure',
    problem:
      'Off-the-shelf chatbot widgets offer no deep integration with relational databases or ERPs, forcing support staff to copy-paste customer inquiries across disconnected software.',
    solution:
      'Engineered an autonomous tool-calling engine connecting Meta Cloud WhatsApp API directly to relational PostgreSQL databases for automated customer inquiry resolution.',
    stack: ['Next.js App Router', 'Meta Cloud WhatsApp API', 'PostgreSQL', 'LLM Tool Execution'],
    metrics: [
      { label: 'Tool Execution', value: 'Deterministic Tool-Calling' },
      { label: 'Database Bridge', value: 'Direct PostgreSQL' },
      { label: 'Resolution Time', value: 'Instant Edge Reply' },
    ],
    featured: false,
  },
  {
    id: 'kinetic-topology',
    slug: 'kinetic-topology-lab',
    category: 'ventures',
    categoryLabel: 'Original Ventures',
    badge: 'Internal Lab / Concept',
    title: 'Kinetic Topology Lab',
    subtitle: 'Interactive physics strands, procedural geometry & magnetic cursor layers.',
    clientOrNature: 'Ostrum Interaction Research',
    sectorOrType: 'Creative Technology Lab',
    problem:
      'Digital studio websites rely on static screenshots that fail to communicate dynamic physical depth, reactive spatial tactile feedback, or brand-specific material craft.',
    solution:
      'Engineered a suite of custom interactive UI primitives including magnetic cursor attractors, reactive living threads, and refractive glass shaders engineered for 60fps editorial layouts.',
    stack: ['HTML5 Canvas 2D', 'WebGL', 'Vector Physics', 'Tailwind CSS'],
    metrics: [
      { label: 'Micro-Interactions', value: 'Silky 60fps Physics' },
      { label: 'Interaction Model', value: 'Magnetic Attractors' },
      { label: 'Bundle Impact', value: 'Zero Dependency Bloat' },
    ],
    featured: false,
  },
];

export function OstrumSelectedWorkSection() {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('business');

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const showcaseContainerRef = useRef<HTMLDivElement>(null);

  const filteredProjects = SELECTED_PROJECTS.filter((p) => p.category === activeCategory);
  const featuredProject = filteredProjects.find((p) => p.featured) || filteredProjects[0];
  const supportingProjects = filteredProjects.filter((p) => p.id !== featuredProject.id);

  // GSAP ScrollTrigger Entrance Animation
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Section Header Entrance as the rising panel enters the viewport
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // 2. Showcase Container Entrance
      if (showcaseContainerRef.current) {
        gsap.fromTo(
          showcaseContainerRef.current,
          { opacity: 0, y: 48 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 65%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="selected-work"
      data-testid="selected-work-section"
      className="relative z-[20] w-full bg-[#080104] text-white overflow-hidden border-t border-white/10"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 90% 50% at 50% 0%, rgba(192, 24, 50, 0.12), transparent 70%), radial-gradient(ellipse 70% 40% at 50% 100%, rgba(15, 2, 6, 0.8), transparent 80%)',
      }}
    >
      {/* Luminous Top Hairline Glow Accent */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[88vw] max-w-[1540px] h-[1px] bg-gradient-to-r from-transparent via-[#C01832]/60 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <div className="w-[88vw] max-w-[1540px] mx-auto px-4 sm:px-6 md:px-8 pt-24 sm:pt-32 md:pt-40 pb-28 sm:pb-36">
        {/* ============================================================
            SECTION INTRODUCTION
            ============================================================ */}
        <div ref={headerRef} className="flex flex-col items-start mb-14 sm:mb-20">
          {/* Eyebrow */}
          <div className="flex items-center gap-2.5 mb-4">
            <span className="font-mono text-xs tracking-[0.22em] text-[#ff5c4a] font-semibold uppercase">
              04 / SELECTED WORK
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-white/75 font-medium">
              OSTRUM / SELECTED WORK
            </span>
          </div>

          {/* Main Headline */}
          <h2 className="font-sans font-medium text-[clamp(32px,4.4vw,68px)] leading-[1.06] tracking-[-0.02em] text-white max-w-4xl text-balance">
            Built for real problems. Made for what&apos;s next.
          </h2>

          {/* Supporting Statement */}
          <p className="mt-5 text-white/70 text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
            We engineer high-leverage business systems for ambitious operations, and build original
            ventures for friction worth eliminating.
          </p>

          {/* Editorial Category Selector */}
          <div
            role="tablist"
            aria-label="Project Categories"
            className="mt-8 sm:mt-10 inline-flex items-center p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
          >
            <button
              role="tab"
              aria-selected={activeCategory === 'business'}
              onClick={() => setActiveCategory('business')}
              className={`relative px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium tracking-wide transition-all duration-300 cursor-pointer ${
                activeCategory === 'business'
                  ? 'bg-[#C01832] text-white shadow-[0_0_20px_rgba(192,24,50,0.45)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Business Systems <span className="opacity-60 ml-1 text-[11px]">(3)</span>
            </button>

            <button
              role="tab"
              aria-selected={activeCategory === 'ventures'}
              onClick={() => setActiveCategory('ventures')}
              className={`relative px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium tracking-wide transition-all duration-300 cursor-pointer ${
                activeCategory === 'ventures'
                  ? 'bg-[#C01832] text-white shadow-[0_0_20px_rgba(192,24,50,0.45)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Original Ventures <span className="opacity-60 ml-1 text-[11px]">(3)</span>
            </button>
          </div>
        </div>

        {/* ============================================================
            PROJECT SHOWCASE REGION
            ============================================================ */}
        <div ref={showcaseContainerRef} className="w-full flex flex-col gap-12 sm:gap-16">
          {/* 1. ASYMMETRIC DOMINANT FEATURED PROJECT */}
          <div
            key={featuredProject.id}
            data-testid={`project-featured-${featuredProject.id}`}
            className="w-full rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 hover:border-[#C01832]/40 transition-all duration-500 p-6 sm:p-8 md:p-12 relative overflow-hidden group shadow-2xl backdrop-blur-sm"
          >
            {/* Ambient Corner Accent */}
            <div
              className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[#C01832]/10 blur-3xl pointer-events-none group-hover:bg-[#C01832]/20 transition-all duration-700"
              aria-hidden="true"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
              {/* Left Column: Metadata & Narrative (5 cols) */}
              <div className="lg:col-span-5 flex flex-col items-start z-10">
                {/* Badge & Nature */}
                <div className="flex flex-wrap items-center gap-2.5 mb-4">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#ff5c4a] bg-[#ff5c4a]/10 px-3 py-1 rounded-full font-medium">
                    {featuredProject.badge}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-white/50">
                    {featuredProject.sectorOrType}
                  </span>
                </div>

                {/* Client / Organization */}
                <div className="text-xs font-mono tracking-wider uppercase text-white/60 mb-2">
                  {featuredProject.clientOrNature}
                </div>

                {/* Title */}
                <h3 className="font-sans font-medium text-2xl sm:text-3xl md:text-4xl tracking-tight text-white leading-tight">
                  {featuredProject.title}
                </h3>

                {/* Subtitle */}
                <p className="mt-3 text-white/80 text-sm sm:text-base leading-relaxed">
                  {featuredProject.subtitle}
                </p>

                {/* Challenge & Solution */}
                <div className="mt-6 pt-6 border-t border-white/10 w-full flex flex-col gap-4 text-xs sm:text-[13px]">
                  <div>
                    <span className="text-white/40 uppercase font-mono tracking-wider block mb-1">
                      The Operational Challenge
                    </span>
                    <p className="text-white/75 leading-relaxed">{featuredProject.problem}</p>
                  </div>
                  <div>
                    <span className="text-white/40 uppercase font-mono tracking-wider block mb-1">
                      Engineered Solution
                    </span>
                    <p className="text-white/75 leading-relaxed">{featuredProject.solution}</p>
                  </div>
                </div>

                {/* Metrics Badges */}
                <div className="mt-6 grid grid-cols-3 gap-2 w-full">
                  {featuredProject.metrics.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col p-2.5 rounded-lg bg-white/[0.03] border border-white/5"
                    >
                      <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                        {m.label}
                      </span>
                      <span className="text-xs font-medium text-white mt-1 leading-snug">
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tech Stack Chips */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {featuredProject.stack.map((tech) => (
                    <span
                      key={tech}
                      className="text-[11px] font-mono px-2.5 py-1 rounded bg-white/5 border border-white/10 text-white/70"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Column: Bespoke Representative Visual Preview (7 cols) */}
              <div className="lg:col-span-7 w-full z-10">
                <div className="w-full aspect-[16/10] rounded-xl bg-black/80 border border-white/10 p-5 sm:p-7 flex flex-col justify-between relative overflow-hidden group-hover:border-white/20 transition-all duration-500 shadow-inner">
                  {/* Visual Interface Top Bar */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ff5c4a]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-white/30" />
                      <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                      <span className="ml-2 font-mono text-[11px] text-white/60 tracking-wider">
                        {featuredProject.id === 'campus360'
                          ? 'Campus360 System Console · Fall Admissions Engine'
                          : 'Ostrum WebGL Engine Core · Real-Time Telemetry'}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#ff5c4a] bg-[#ff5c4a]/10 px-2 py-0.5 rounded">
                      LIVE DEPLOYMENT
                    </span>
                  </div>

                  {/* Representative Diagram / Interface Structure */}
                  {featuredProject.id === 'campus360' ? (
                    // Campus360 Admissions Interface Composition
                    <div className="my-auto py-4 flex flex-col gap-4">
                      {/* Admissions Funnel Grid */}
                      <div className="grid grid-cols-4 gap-2.5 text-center">
                        <div className="p-3 rounded-lg bg-white/[0.04] border border-white/5">
                          <span className="text-[10px] font-mono uppercase text-white/40 block">Inquiries</span>
                          <span className="text-base sm:text-lg font-mono font-medium text-white">412</span>
                          <span className="text-[9px] text-[#ff5c4a] block mt-0.5">Automated Capture</span>
                        </div>
                        <div className="p-3 rounded-lg bg-white/[0.04] border border-white/5">
                          <span className="text-[10px] font-mono uppercase text-white/40 block">WhatsApp Sync</span>
                          <span className="text-base sm:text-lg font-mono font-medium text-white">100%</span>
                          <span className="text-[9px] text-white/50 block mt-0.5">Meta Cloud API</span>
                        </div>
                        <div className="p-3 rounded-lg bg-white/[0.04] border border-white/5">
                          <span className="text-[10px] font-mono uppercase text-white/40 block">Fees Settled</span>
                          <span className="text-base sm:text-lg font-mono font-medium text-white">142</span>
                          <span className="text-[9px] text-emerald-400 block mt-0.5">Reconciled</span>
                        </div>
                        <div className="p-3 rounded-lg bg-[#C01832]/20 border border-[#C01832]/30">
                          <span className="text-[10px] font-mono uppercase text-white/60 block">Enrolled</span>
                          <span className="text-base sm:text-lg font-mono font-medium text-white">138</span>
                          <span className="text-[9px] text-white/80 block mt-0.5">Digital Roster</span>
                        </div>
                      </div>

                      {/* Mocked Live Webhook Event */}
                      <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/10 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-white/80">POST /api/webhooks/whatsapp-receipt</span>
                        </div>
                        <span className="text-white/40">200 OK · 14ms</span>
                      </div>
                    </div>
                  ) : (
                    // Ostrum Continuum 3D Runtime Diagnostic HUD
                    <div className="my-auto py-4 flex flex-col gap-4">
                      {/* WebGL Matrix Grid */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg bg-white/[0.04] border border-white/5">
                          <span className="text-[10px] font-mono uppercase text-white/40 block">Camera Pos</span>
                          <span className="text-xs sm:text-sm font-mono text-white mt-1 block">X: 0.00 | Y: 0.00 | Z: 7.50</span>
                          <span className="text-[9px] text-emerald-400 block mt-0.5">Active Projection</span>
                        </div>
                        <div className="p-3 rounded-lg bg-white/[0.04] border border-white/5">
                          <span className="text-[10px] font-mono uppercase text-white/40 block">Rotation Arc</span>
                          <span className="text-xs sm:text-sm font-mono text-white mt-1 block">4.0π (Settled Front)</span>
                          <span className="text-[9px] text-[#ff5c4a] block mt-0.5">ScrollTrigger Sync</span>
                        </div>
                        <div className="p-3 rounded-lg bg-white/[0.04] border border-white/5">
                          <span className="text-[10px] font-mono uppercase text-white/40 block">Rendering Pipeline</span>
                          <span className="text-xs sm:text-sm font-mono text-white mt-1 block">Single Canvas Context</span>
                          <span className="text-[9px] text-emerald-400 block mt-0.5">DPR: 1.35 Adaptive</span>
                        </div>
                      </div>

                      {/* Frame Latency Monitor Bar */}
                      <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/10 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-white/80">GPU Frame Time: 13.8ms · 60 FPS Target</span>
                        </div>
                        <span className="text-[#ff5c4a]">ZERO DRAW-CALL DRIFT</span>
                      </div>
                    </div>
                  )}

                  {/* Visual Interface Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[10px] font-mono text-white/40">
                    <span>ARCHITECTURE BLUEPRINT</span>
                    <span>CONFIDENTIAL CLIENT SPECIFICATION</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. SUPPORTING PROJECTS ASYMMETRIC GRID (2 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
            {supportingProjects.map((project) => (
              <div
                key={project.id}
                data-testid={`project-card-${project.id}`}
                className="rounded-xl bg-gradient-to-b from-white/[0.03] to-white/[0.01] border border-white/10 hover:border-[#C01832]/40 transition-all duration-500 p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden backdrop-blur-sm"
              >
                {/* Header & Badges */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#ff5c4a] bg-[#ff5c4a]/10 px-2.5 py-0.5 rounded-full font-medium">
                      {project.badge}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
                      {project.sectorOrType}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono tracking-wider uppercase text-white/50 mb-1">
                    {project.clientOrNature}
                  </div>

                  <h4 className="font-sans font-medium text-xl sm:text-2xl text-white tracking-tight mt-1">
                    {project.title}
                  </h4>

                  <p className="mt-2.5 text-white/70 text-xs sm:text-sm leading-relaxed">
                    {project.subtitle}
                  </p>

                  {/* Interface Preview Schematic Box */}
                  <div className="mt-5 w-full aspect-[16/9] rounded-lg bg-black/70 border border-white/10 p-4 flex flex-col justify-between text-xs font-mono group-hover:border-white/20 transition-all duration-300">
                    <div className="flex items-center justify-between text-[10px] text-white/40 border-b border-white/5 pb-2">
                      <span>SYSTEM TELEMETRY</span>
                      <span className="text-emerald-400">ACTIVE</span>
                    </div>

                    <div className="my-auto py-2">
                      <p className="text-[11px] text-white/80 leading-relaxed font-sans">
                        {project.solution}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[9px] text-white/50">
                      {project.metrics.map((m, mIdx) => (
                        <div key={mIdx}>
                          <span className="text-white/30 block uppercase">{m.label}</span>
                          <span className="text-white/80 font-mono font-medium block truncate">
                            {m.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer: Tech Stack Chips & Action */}
                <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {project.stack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/60"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <span className="font-mono text-xs text-[#ff5c4a] group-hover:translate-x-1 transition-transform duration-300 inline-flex items-center gap-1">
                    Blueprint →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================
            STUDIO CLOSURE & INQUIRY PROMPT
            ============================================================ */}
        <div className="mt-24 sm:mt-32 pt-16 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h4 className="font-sans font-medium text-lg sm:text-xl text-white">
              Have a critical business system or original product to engineer?
            </h4>
            <p className="text-white/50 text-xs sm:text-sm mt-1">
              We engineer custom infrastructure and invest in problems worth solving.
            </p>
          </div>

          <a
            href="mailto:contact@ostrum.com"
            className="px-6 py-3 rounded-full bg-white text-black font-medium text-xs sm:text-sm tracking-wide hover:bg-white/90 hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] transition-all duration-300 whitespace-nowrap cursor-pointer"
          >
            Start a Conversation →
          </a>
        </div>
      </div>
    </section>
  );
}
