import { apiClient } from "@/lib/apiClient";
import { ActorTypeSummary } from "@/app/(admin)/types";

export function getActorTypes(): Promise<ActorTypeSummary[]> {
  return apiClient.get<ActorTypeSummary[]>("/api/actor-types", {
    cache: "no-store",
  });
}
