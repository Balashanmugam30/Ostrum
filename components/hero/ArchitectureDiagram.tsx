import React from 'react';
import { CornerCrosses } from '@/components/ui/CornerCrosses';

export function ArchitectureDiagram() {
  return (
    <div className="relative bg-surface-card border border-border-subtle rounded-2xl p-6 sm:p-8 shadow-float">
      <CornerCrosses />

      <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-5 font-mono text-[11px] text-ink-muted">
        <span>OSTRUM ARCHITECTURE SCHEMATIC</span>
        <span className="text-accent-sage flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-sage animate-pulse" />
          SYNCHRONIZED
        </span>
      </div>

      <svg
        viewBox="0 0 460 280"
        className="w-full h-auto block select-none"
        aria-label="Connected Architecture Diagram"
      >
        {/* Subtle Background Grid Lines */}
        <line x1="20" y1="70" x2="440" y2="70" stroke="#E8E3DA" strokeDasharray="3 3" />
        <line x1="20" y1="140" x2="440" y2="140" stroke="#E8E3DA" strokeDasharray="3 3" />
        <line x1="20" y1="210" x2="440" y2="210" stroke="#E8E3DA" strokeDasharray="3 3" />

        {/* Central Connecting Axis */}
        <path
          d="M 90 70 L 230 140 L 370 70 M 230 140 L 230 210"
          stroke="#D24B2C"
          strokeWidth="2"
          fill="none"
        />

        {/* Node 1: Web Storefront */}
        <rect x="30" y="44" width="120" height="52" rx="8" fill="#FAF7F2" stroke="#D5CEBF" />
        <text
          x="90"
          y="66"
          textAnchor="middle"
          fontFamily="'Plus Jakarta Sans', -apple-system, sans-serif"
          fontWeight="700"
          fontSize="11"
          fill="#161514"
        >
          WEB STOREFRONT
        </text>
        <text
          x="90"
          y="82"
          textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="9"
          fill="#50545C"
        >
          Next.js · Edge
        </text>

        {/* Node 2: Core Connected ERP Engine */}
        <rect x="160" y="114" width="140" height="52" rx="8" fill="#182B49" stroke="#182B49" />
        <text
          x="230"
          y="136"
          textAnchor="middle"
          fontFamily="'Plus Jakarta Sans', -apple-system, sans-serif"
          fontWeight="700"
          fontSize="11"
          fill="#FFFFFF"
        >
          CONNECTED ERP
        </text>
        <text
          x="230"
          y="152"
          textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="9"
          fill="#93C5FD"
        >
          Sync Pipeline
        </text>

        {/* Node 3: AI WhatsApp Automation */}
        <rect x="310" y="44" width="120" height="52" rx="8" fill="#FAF7F2" stroke="#D5CEBF" />
        <text
          x="370"
          y="66"
          textAnchor="middle"
          fontFamily="'Plus Jakarta Sans', -apple-system, sans-serif"
          fontWeight="700"
          fontSize="11"
          fill="#161514"
        >
          AI WHATSAPP
        </text>
        <text
          x="370"
          y="82"
          textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="9"
          fill="#50545C"
        >
          Meta Cloud API
        </text>

        {/* Node 4: Retail POS & Central Stock */}
        <rect x="160" y="184" width="140" height="52" rx="8" fill="#FAF7F2" stroke="#D5CEBF" />
        <text
          x="230"
          y="206"
          textAnchor="middle"
          fontFamily="'Plus Jakarta Sans', -apple-system, sans-serif"
          fontWeight="700"
          fontSize="11"
          fill="#161514"
        >
          RETAIL POS / STOCK
        </text>
        <text
          x="230"
          y="222"
          textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="9"
          fill="#50545C"
        >
          PostgreSQL Hub
        </text>

        {/* Connected Pulse Status Dots */}
        <circle cx="90" cy="70" r="4" fill="#D24B2C" />
        <circle cx="230" cy="140" r="5" fill="#2B543D" />
        <circle cx="370" cy="70" r="4" fill="#D24B2C" />
        <circle cx="230" cy="210" r="4" fill="#DE8E26" />
      </svg>

      <p className="font-sans text-xs text-ink-slate mt-4 text-center">
        Multi-node real-time synchronization: zero duplicate entry, instant data flow across operations.
      </p>
    </div>
  );
}
