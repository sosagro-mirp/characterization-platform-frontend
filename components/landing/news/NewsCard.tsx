import { ArrowUpRight, CalendarDays } from "lucide-react";
import type { NewsEntry, NewsTag } from "../../../lib/landing-content";

const tagStyle: Record<NewsTag, string> = {
  Evento: "bg-brand text-white",
  Publicación: "bg-brand-dark text-white",
  Convocatoria: "bg-accent text-brand-dark",
  Hito: "bg-gray-900 text-white",
};

const monthFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

interface NewsCardProps {
  entry: NewsEntry;
}

const cardClass =
  "group flex h-full flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-brand/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2";

const staticCardClass =
  "flex h-full flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5";

export function NewsCard({ entry }: NewsCardProps) {
  const dateObj = new Date(entry.date);
  const dateLabel = isNaN(dateObj.getTime())
    ? entry.date
    : monthFormatter.format(dateObj);

  const isExternal = Boolean(entry.url);

  const inner = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tagStyle[entry.tag]}`}
        >
          {entry.tag}
        </span>
        {isExternal ? (
          <ArrowUpRight
            className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand"
            aria-hidden="true"
          />
        ) : null}
      </div>

      <time
        dateTime={entry.date}
        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500"
      >
        <CalendarDays className="h-3 w-3" aria-hidden="true" />
        {dateLabel}
      </time>

      <h3 className="text-base font-bold tracking-tight text-balance leading-snug">
        {entry.title}
      </h3>

      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
        {entry.summary}
      </p>
    </>
  );

  if (isExternal) {
    return (
      <a
        href={entry.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClass}
      >
        {inner}
      </a>
    );
  }

  return <article className={staticCardClass}>{inner}</article>;
}
