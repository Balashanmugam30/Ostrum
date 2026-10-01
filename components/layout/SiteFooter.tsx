import React from 'react';
import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer role="contentinfo" className="bg-[#12151B] text-[#ECEFF4] pt-20 pb-10 border-t border-[#2B3342]">
      <div className="max-w-[1240px] mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <h4 className="font-display font-extrabold text-2xl tracking-tight text-white mb-3">
              OSTRUM
            </h4>
            <p className="text-sm text-[#9CA3AF] leading-relaxed max-w-sm">
              Art-directed technology and design studio. We unite brand identity, web storefronts, custom ERP/CRM business tools, and practical WhatsApp automation into one synchronized engine.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h5 className="font-mono text-xs uppercase tracking-widest text-accent-terracotta mb-4">
              Navigation
            </h5>
            <ul className="flex flex-col gap-2.5 text-sm text-[#9CA3AF]">
              <li><a href="#philosophy" className="hover:text-white transition-colors">Philosophy</a></li>
              <li><a href="#capabilities" className="hover:text-white transition-colors">Disciplines</a></li>
              <li><a href="#works" className="hover:text-white transition-colors">Selected Works</a></li>
              <li><a href="#blueprint" className="hover:text-white transition-colors">Architecture Blueprint</a></li>
              <li><a href="#stack" className="hover:text-white transition-colors">Tooling Stack</a></li>
              <li><a href="#workflow" className="hover:text-white transition-colors">Delivery Process</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">Studio Genesis</a></li>
            </ul>
          </div>

          {/* Core Capabilities */}
          <div>
            <h5 className="font-mono text-xs uppercase tracking-widest text-accent-terracotta mb-4">
              Core Capabilities
            </h5>
            <ul className="flex flex-col gap-2.5 text-sm text-[#9CA3AF]">
              <li><a href="#capabilities" className="hover:text-white transition-colors">Order & Stock ERP</a></li>
              <li><a href="#capabilities" className="hover:text-white transition-colors">Sales CRM Pipeline</a></li>
              <li><a href="#capabilities" className="hover:text-white transition-colors">Campus Administration</a></li>
              <li><a href="#capabilities" className="hover:text-white transition-colors">WhatsApp AI Agents</a></li>
              <li><a href="#capabilities" className="hover:text-white transition-colors">Retail Billing & POS</a></li>
              <li><a href="#capabilities" className="hover:text-white transition-colors">Architecture Audits</a></li>
            </ul>
          </div>

          {/* Direct Contact & Telemetry */}
          <div>
            <h5 className="font-mono text-xs uppercase tracking-widest text-accent-terracotta mb-4">
              Direct Contact
            </h5>
            <ul className="flex flex-col gap-2.5 text-sm text-[#9CA3AF]">
              <li>
                <a href="mailto:hello@ostrum.studio" className="hover:text-white transition-colors font-medium">
                  hello@ostrum.studio
                </a>
              </li>
              <li><a href="#brief" className="hover:text-white transition-colors">Submit Project Brief</a></li>
              <li><span>Bangalore · Worldwide</span></li>
              <li className="pt-2">
                <span className="font-mono text-xs text-accent-sage flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent-sage animate-pulse" />
                  SYSTEM: OPERATIONAL
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="border-t border-[#232B38] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#6B7280]">
          <span>© 2026 OSTRUM TECHNOLOGIES & DESIGN STUDIO. ALL RIGHTS RESERVED.</span>
          <span>CLARTÉ-CRAFT TRANSLATION · LIGHT-FIRST · 17-CHAPTER ARCHITECTURE</span>
        </div>
      </div>
    </footer>
  );
}
