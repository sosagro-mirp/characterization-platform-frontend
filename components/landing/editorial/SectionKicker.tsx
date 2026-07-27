/**
 * Encabezado numerado compartido entre las secciones de la propuesta
 * "Editorial" (ej. "02 — Cadenas productivas"), en línea con el índice del
 * `SideNav`. Vive en su propio archivo para que cada sección lo importe sin
 * acoplarse a otra sección de contenido.
 */
export function SectionKicker({
  number,
  label,
}: {
  number: string;
  label: string;
}) {
  return (
    <p className="flex items-center gap-3 font-[family-name:var(--font-editorial-mono)] text-xs uppercase tracking-[0.2em] text-[#15803d]">
      <span>{number}</span>
      <span aria-hidden="true">—</span>
      <span>{label}</span>
    </p>
  );
}
