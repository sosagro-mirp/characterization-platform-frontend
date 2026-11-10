"use client";

import { ReactNode } from "react";

interface TooltipProps {
  label: string;
  children: ReactNode;
}

export default function Tooltip({ label, children }: TooltipProps) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-[10.5px] font-medium text-[var(--text-inverse)] bg-[var(--text-primary)] opacity-0 transition-opacity group-hover:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
