import {
  CreateQuestionRequest,
  QuestionDetail,
  UpdateQuestionRequest,
} from "@/app/(admin)/types";

const base = () =>
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export async function getQuestion(
  sectionId: string,
  questionId: string
): Promise<QuestionDetail> {
  const res = await fetch(
    `${base()}/api/sections/${sectionId}/questions/${questionId}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`Failed to fetch question: ${res.status}`);
  return res.json();
}

export async function createQuestion(
  sectionId: string,
  data: CreateQuestionRequest
): Promise<QuestionDetail> {
  const res = await fetch(`${base()}/api/sections/${sectionId}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create question: ${res.status}`);
  return res.json();
}

export async function updateQuestion(
  sectionId: string,
  questionId: string,
  data: UpdateQuestionRequest
): Promise<QuestionDetail> {
  const res = await fetch(
    `${base()}/api/sections/${sectionId}/questions/${questionId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) throw new Error(`Failed to update question: ${res.status}`);
  return res.json();
}

export async function deleteQuestion(
  sectionId: string,
  questionId: string
): Promise<void> {
  const res = await fetch(
    `${base()}/api/sections/${sectionId}/questions/${questionId}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error(`Failed to delete question: ${res.status}`);
}
