import { ActorTypeSummary } from "@/app/(admin)/types";

const base = () =>
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export async function getActorTypes(): Promise<ActorTypeSummary[]> {
  const res = await fetch(`${base()}/api/actor-types`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch actor types: ${res.status}`);
  return res.json();
}
