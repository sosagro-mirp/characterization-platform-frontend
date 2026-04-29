import type { Territory, TerritoryFlag } from "../../../lib/landing-content";

const flagStyle: Record<TerritoryFlag, string> = {
  PDET: "bg-accent text-brand-dark",
  ZOMAC: "bg-brand-light text-brand-dark border border-brand/30",
};

interface TerritoryItemProps {
  territory: Territory;
}

export function TerritoryItem({ territory }: TerritoryItemProps) {
  const allFlags = Array.from(
    new Set(territory.municipalities.flatMap((m) => m.flags))
  );

  return (
    <li className="rounded-lg border border-gray-200 bg-white p-5 transition-colors hover:border-brand/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold tracking-tight">
            {territory.department}
          </h3>
          <p className="text-xs text-gray-600 mt-0.5">{territory.region}</p>
        </div>
        {allFlags.length > 0 ? (
          <div className="flex shrink-0 gap-1.5">
            {allFlags.map((flag) => (
              <span
                key={flag}
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${flagStyle[flag]}`}
              >
                {flag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <ul
        role="list"
        className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-700"
      >
        {territory.municipalities.map((m, i) => (
          <li key={m.name} className="flex items-center gap-1.5">
            {i > 0 ? (
              <span className="text-gray-300" aria-hidden="true">
                ·
              </span>
            ) : null}
            <span>{m.name}</span>
            {m.flags.length > 0 ? (
              <span className="sr-only">
                {" "}
                ({m.flags.join(", ")})
              </span>
            ) : null}
            {m.flags.length > 0 ? (
              <span
                className="w-1.5 h-1.5 rounded-full bg-accent"
                title={m.flags.join(", ")}
                aria-hidden="true"
              />
            ) : null}
          </li>
        ))}
      </ul>
    </li>
  );
}
