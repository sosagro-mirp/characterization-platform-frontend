import {
  CreateInstrumentRequest,
  InstrumentDetail,
  InstrumentListItem,
  UpdateInstrumentRequest,
} from "@/app/(admin)/types";

const base = () =>
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export async function getInstruments(): Promise<InstrumentListItem[]> {
  const res = await fetch(`${base()}/api/instruments`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch instruments: ${res.status}`);
  return res.json();
}

export async function getInstrumentById(id: string): Promise<InstrumentDetail> {
  const res = await fetch(`${base()}/api/instruments/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch instrument: ${res.status}`);
  return res.json();
}

export async function createInstrument(
  data: CreateInstrumentRequest
): Promise<InstrumentListItem> {
  const res = await fetch(`${base()}/api/instruments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create instrument: ${res.status}`);
  return res.json();
}

export async function updateInstrument(
  id: string,
  data: UpdateInstrumentRequest
): Promise<InstrumentListItem> {
  const res = await fetch(`${base()}/api/instruments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update instrument: ${res.status}`);
  return res.json();
}

export async function deleteInstrument(id: string): Promise<void> {
  const res = await fetch(`${base()}/api/instruments/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete instrument: ${res.status}`);
}

export async function getInstrumentForEditor(id: string): Promise<{
  instrumentId: string;
  name: string;
  version: number;
  publishDate: string;
  isActive: boolean;
  actorTypes: import("@/app/(admin)/types").ActorTypeSummary[];
  sections: import("@/app/(admin)/types").SectionDetail[];
}> {
  const [meta, render] = await Promise.all([
    getInstrumentById(id),
    fetch(`${base()}/api/instruments/${id}/render`, {
      cache: "no-store",
    }).then((r) => {
      if (!r.ok) throw new Error(`Failed to fetch render: ${r.status}`);
      return r.json();
    }),
  ]);

  return {
    instrumentId: meta.instrumentId,
    name: meta.name,
    version: meta.version,
    publishDate: meta.publishDate,
    isActive: meta.isActive,
    actorTypes: meta.actorTypes ?? [],
    sections: (render.sections ?? []).map(
      (sec: {
        sectionId: string;
        name: string;
        order: number;
        questions: unknown[];
      }) => ({
        sectionId: sec.sectionId,
        name: sec.name,
        order: sec.order,
        createdAt: "",
        updatedAt: "",
        questions: sec.questions ?? [],
      })
    ),
  };
}
