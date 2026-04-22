import { TypeOfQuestionSummary } from "@/app/(admin)/types";

const base = () =>
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export async function getTypesOfQuestions(): Promise<TypeOfQuestionSummary[]> {
  const res = await fetch(`${base()}/api/types-of-questions`, {
    cache: "no-store",
  });
  if (!res.ok)
    throw new Error(`Failed to fetch question types: ${res.status}`);
  return res.json();
}
