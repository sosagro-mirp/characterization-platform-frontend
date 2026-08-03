"use client";

import Link from "next/link";
import { CampaignActiveSummary } from "@/app/(instrument)/types";

interface CampaignSelectorProps {
  campaigns: CampaignActiveSummary[];
}

export default function CampaignSelector({ campaigns }: CampaignSelectorProps) {
  if (campaigns.length === 0) {
    return (
      <p className="text-sm text-text-muted text-center py-10">
        No hay campañas activas en este momento.
      </p>
    );
  }
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {campaigns.map((c) => (
        <li key={c.campaignId}>
          <Link
            href={`/campaign/${c.campaignId}`}
            className="block rounded-2xl border border-[var(--border)] bg-surface p-5 hover:border-brand hover:shadow-sm transition-all"
          >
            <h3 className="text-base font-semibold text-text-primary">{c.name}</h3>
            {c.description && (
              <p className="mt-1 text-sm text-text-muted line-clamp-3">
                {c.description}
              </p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
