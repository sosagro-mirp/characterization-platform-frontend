"use client";

import { useState } from "react";
import { FlaskConical, Microscope, Recycle, type LucideIcon } from "lucide-react";
import { axes, type Axis } from "../../../lib/landing-content";
import { SectionHeader } from "./SectionHeader";

const iconByName: Record<Axis["iconName"], LucideIcon> = {
  Microscope,
  Recycle,
  FlaskConical,
};

const statusLabel: Record<Axis["status"], string> = {
  active: "En ejecución",
  upcoming: "Próxima fase",
};

export function Axes() {
  const [activeCode, setActiveCode] = useState<Axis["code"]>(axes[0].code);
  const active = axes.find((a) => a.code === activeCode) ?? axes[0];
  const ActiveIcon = iconByName[active.iconName];

  return (
    <section
      id="fases"
      className="scroll-mt-24 border-t border-[#2f3d31] bg-[#0b0f0c] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Fases del proyecto"
          title="Tres objetivos específicos, una misma hoja de ruta"
          subtitle="OE1 despliega la infraestructura de datos que habilita a OE2 y OE3, orientados a bioeconomía y análisis de referencia."
        />

        <div className="mt-12 lg:mt-16">
          <div
            role="tablist"
            aria-label="Fases del proyecto"
            className="flex flex-wrap justify-center gap-2"
          >
            {axes.map((axis) => {
              const Icon = iconByName[axis.iconName];
              const isActive = axis.code === activeCode;
              return (
                <button
                  key={axis.code}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveCode(axis.code)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                    isActive
                      ? "border-[#a3e635]/50 bg-[#a3e635] text-[#0b0f0c]"
                      : "border-[#2f3d31] bg-[#10140f] text-[#8a9a8d] hover:text-[#f4f7f2]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {axis.code}
                </button>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-[#2f3d31] bg-[#10140f] p-6 lg:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
              <div className="flex shrink-0 items-center gap-4 lg:flex-col lg:items-start lg:gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1f2921] text-[#a3e635]">
                  <ActiveIcon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    active.status === "active"
                      ? "bg-[#1f2921] text-[#a3e635]"
                      : "bg-[#1a1f1c] text-[#8a9a8d]"
                  }`}
                >
                  {statusLabel[active.status]}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#a3e635]">
                    {active.code} · {active.tagline}
                  </p>
                  <h3 className="mt-1 text-xl font-bold tracking-tight text-[#f4f7f2] lg:text-2xl">
                    {active.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-[#8a9a8d]">
                  {active.description}
                </p>
                <ul role="list" className="mt-2 flex flex-col gap-2">
                  {active.activities.map((activity) => (
                    <li
                      key={activity}
                      className="flex items-start gap-2 text-sm text-[#f4f7f2]"
                    >
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#a3e635]"
                        aria-hidden="true"
                      />
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
