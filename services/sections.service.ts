import {
  CreateSectionRequest,
  SectionSummary,
  UpdateSectionRequest,
} from "@/app/(admin)/types";

const base = () =>
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export async function getSections(
  instrumentId: string
): Promise<SectionSummary[]> {
  const res = await fetch(
    `${base()}/api/instruments/${instrumentId}/sections`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`Failed to fetch sections: ${res.status}`);
  return res.json();
}

export async function createSection(
  instrumentId: string,
  data: CreateSectionRequest
): Promise<SectionSummary> {
  const res = await fetch(
    `${base()}/api/instruments/${instrumentId}/sections`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) throw new Error(`Failed to create section: ${res.status}`);
  return res.json();
}

export async function updateSection(
  instrumentId: string,
  sectionId: string,
  data: UpdateSectionRequest
): Promise<SectionSummary> {
  const res = await fetch(
    `${base()}/api/instruments/${instrumentId}/sections/${sectionId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) throw new Error(`Failed to update section: ${res.status}`);
  return res.json();
}

export async function deleteSection(
  instrumentId: string,
  sectionId: string
): Promise<void> {
  const res = await fetch(
    `${base()}/api/instruments/${instrumentId}/sections/${sectionId}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error(`Failed to delete section: ${res.status}`);
}
