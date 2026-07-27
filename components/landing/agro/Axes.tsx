"use client";

import { useState } from "react";
import { FlaskConical, Microscope, Recycle, type LucideIcon } from "lucide-react";
import { axes, type Axis } from "../../../lib/landing-content";
import { AgroSection } from "./AgroSection";
import { AgroSectionHeading } from "./AgroSectionHeading";

const iconMap: Record<Axis["iconName"], LucideIcon> = {
  Microscope,
  Recycle,
  FlaskConical,
};

/** Fases del proyecto (OE1-OE3) presentadas como tabs editoriales. */
export function Axes() {
  const [activeCode, setActiveCode] = useState<Axis["code"]>(axes[0].code);
  const activeAxis = axes.find((a) => a.code === activeCode) ?? axes[0];
  const Icon = iconMap[activeAxis.iconName];

  return (
    <AgroSection id="fases" tone="cream">
      <AgroSectionHeading
        kicker="Estructura del proyecto"
        title="Tres fases articuladas en cinco años"
        subtitle="La captura y análisis de datos alimenta los procesos de bioeconomía y, en paralelo, los métodos analíticos del centro de referencia."
      />

      <div className="mt-10 flex flex-wrap gap-2 lg:mt-12" role="tablist" aria-label="Fases del proyecto">
        {axes.map((axis) => {
          const isActive = axis.code === activeCode;
          return (
            <button
              key={axis.code}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`fase-panel-${axis.code}`}
              id={`fase-tab-${axis.code}`}
              onClick={() => setActiveCode(axis.code)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-[#14532D] text-white"
                  : "border border-[#D8D2BD] bg-[#FFFFFF] text-[#6B6552] hover:bg-[#EEF3E6]"
              }`}
            >
              {axis.code} · {axis.title}
            </button>
          );
        })}
      </div>

      <div
        id={`fase-panel-${activeAxis.code}`}
        role="tabpanel"
        aria-labelledby={`fase-tab-${activeAxis.code}`}
        className="mt-6 grid grid-cols-1 gap-8 rounded-3xl border border-[#E9E3D3] bg-[#FFFFFF] p-6 lg:mt-8 lg:grid-cols-[1fr_2fr] lg:gap-10 lg:p-10"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF3E6] text-[#166534]">
              <Icon className="h-6 w-6" aria-hidden="true" strokeWidth={1.75} />
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                activeAxis.status === "active"
                  ? "bg-[#14532D] text-white"
                  : "bg-[#EEF3E6] text-[#6B6552]"
              }`}
            >
              {activeAxis.status === "active" ? "Fase activa" : "Próxima fase"}
            </span>
          </div>
          <h3 className="font-[family-name:var(--font-agro-serif)] text-2xl font-medium tracking-tight text-[#20281F] text-balance">
            {activeAxis.title}
          </h3>
          <p className="text-sm italic text-[#166534]">{activeAxis.tagline}</p>
        </div>

        <div className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-[#20281F]">
            {activeAxis.description}
          </p>
          <ul role="list" className="flex flex-col gap-3 border-t border-[#E9E3D3] pt-4">
            {activeAxis.activities.map((activity) => (
              <li key={activity} className="flex items-start gap-2.5 text-sm text-[#20281F]">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#15803D]"
                  aria-hidden="true"
                />
                <span>{activity}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AgroSection>
  );
}
