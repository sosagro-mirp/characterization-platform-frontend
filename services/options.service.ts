import {
  CreateOptionRequest,
  OptionDetail,
  UpdateOptionRequest,
} from "@/app/(admin)/types";

const base = () =>
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export async function batchCreateOptions(
  questionId: string,
  options: CreateOptionRequest[]
): Promise<OptionDetail[]> {
  const res = await fetch(
    `${base()}/api/questions/${questionId}/options/batch`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    }
  );
  if (!res.ok)
    throw new Error(`Failed to batch create options: ${res.status}`);
  return res.json();
}

export async function updateOption(
  questionId: string,
  optionId: string,
  data: UpdateOptionRequest
): Promise<OptionDetail> {
  const res = await fetch(
    `${base()}/api/questions/${questionId}/options/${optionId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) throw new Error(`Failed to update option: ${res.status}`);
  return res.json();
}

export async function deleteOption(
  questionId: string,
  optionId: string
): Promise<void> {
  const res = await fetch(
    `${base()}/api/questions/${questionId}/options/${optionId}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error(`Failed to delete option: ${res.status}`);
}
