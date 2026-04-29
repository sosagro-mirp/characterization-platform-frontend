import { FlaskConical, Microscope, Recycle, type LucideIcon } from "lucide-react";
import type { Axis } from "../../../lib/landing-content";

const iconMap: Record<Axis["iconName"], LucideIcon> = {
  Microscope,
  Recycle,
  FlaskConical,
};

interface AxisCardProps {
  axis: Axis;
}

export function AxisCard({ axis }: AxisCardProps) {
  const Icon = iconMap[axis.iconName];
  const isActive = axis.status === "active";

  return (
    <article
      className={`relative flex h-full flex-col gap-4 rounded-xl border p-6 transition-shadow ${
        isActive
          ? "border-brand/40 bg-brand-light/30 shadow-sm hover:shadow-md"
          : "border-gray-200 bg-white hover:shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-lg ${
            isActive ? "bg-brand text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={1.75} />
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
            isActive
              ? "bg-brand text-white"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {isActive ? (
            <span
              className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"
              aria-hidden="true"
            />
          ) : null}
          {isActive ? "Fase activa" : "Próxima fase"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-dark">
          {axis.code}
        </p>
        <h3 className="text-xl font-bold tracking-tight text-balance">
          {axis.title}
        </h3>
        <p className="text-xs text-gray-600 italic">{axis.tagline}</p>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed">
        {axis.description}
      </p>

      <ul role="list" className="mt-auto flex flex-col gap-2 pt-2 border-t border-gray-200/70">
        {axis.activities.map((a) => (
          <li
            key={a}
            className="flex items-start gap-2 text-xs text-gray-700"
          >
            <span
              className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                isActive ? "bg-brand" : "bg-gray-400"
              }`}
              aria-hidden="true"
            />
            <span>{a}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
