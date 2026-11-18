"use client";

import type { BuilderChartEvent, BuilderChartEventType } from "@/app/(admin)/types";

const EVENT_LABELS: Record<BuilderChartEventType, string> = {
  created: "Creado",
  updated: "Editado",
  published: "Publicado",
  unpublished: "Despublicado",
  archived: "Archivado",
  restored: "Restaurado",
};

const dateFormat = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Bogota",
});

/** Historial de eventos del gráfico (P7 del 108), del más reciente al más antiguo. */
export default function EventHistory({ events }: { events: BuilderChartEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-[var(--text-muted)]">Sin eventos.</p>;
  }
  return (
    <ol className="flex flex-col gap-2">
      {events.toReversed().map((event) => (
        <li key={event.eventId} className="flex flex-wrap gap-x-3 text-sm">
          <time dateTime={event.createdAt} className="text-[var(--text-muted)]">
            {dateFormat.format(new Date(event.createdAt))}
          </time>
          <span className="font-medium">{EVENT_LABELS[event.eventType] ?? event.eventType}</span>
          {event.userId === null && (
            <span className="text-xs text-[var(--text-muted)]">(sistema o API)</span>
          )}
        </li>
      ))}
    </ol>
  );
}
