import React from 'react';

export function CornerCrosses() {
  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-[5px] -left-[5px] font-mono text-[11px] leading-none text-border-strong select-none"
      >
        +
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-[5px] -right-[5px] font-mono text-[11px] leading-none text-border-strong select-none"
      >
        +
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[5px] -left-[5px] font-mono text-[11px] leading-none text-border-strong select-none"
      >
        +
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[5px] -right-[5px] font-mono text-[11px] leading-none text-border-strong select-none"
      >
        +
      </span>
    </>
  );
}
