/**
 * Spec 66 (Fase 3, D8, 2026-08-10): locator explícito de las 4 preguntas
 * `yes_no` de S1b ("¿Cultiva actualmente Cacao/Café/Cannabis/Cáñamo?") que
 * el usuario pidió combinar en una sola gráfica en vez de 4 tarjetas
 * sueltas. No son mutuamente excluyentes (una finca puede cultivar más de
 * un producto) — por eso la combinación es `HorizontalBarChart` ("% Sí" por
 * cultivo), nunca una dona/torta (la suma podría superar 100 %, misma regla
 * que `multiple_choice`, `dashboard.md §3`).
 *
 * Locator por texto exacto (no por `questionId`, distinto por entorno) —
 * mismo patrón que `dashboard-question-curation.config.ts` en el backend,
 * pero este es puramente de presentación (agrupar tarjetas en el frontend),
 * no una decisión de privacidad/curaduría editorial que deba vivir en el
 * backend.
 */
export const CROP_CULTIVATION_QUESTIONS: { questionText: string; cropLabel: string }[] = [
  { questionText: "¿Cultiva actualmente Cacao?", cropLabel: "Cacao" },
  { questionText: "¿Cultiva actualmente Café?", cropLabel: "Café" },
  { questionText: "¿Cultiva actualmente Cannabis?", cropLabel: "Cannabis" },
  { questionText: "¿Cultiva actualmente Cáñamo?", cropLabel: "Cáñamo" },
];

const CROP_QUESTION_TEXTS = new Set(
  CROP_CULTIVATION_QUESTIONS.map((entry) => entry.questionText),
);

/** true si esta pregunta es una de las 4 combinadas — usado para excluirla
 * de la grilla de tarjetas individuales. */
export function isCropCultivationQuestion(questionText: string): boolean {
  return CROP_QUESTION_TEXTS.has(questionText);
}
