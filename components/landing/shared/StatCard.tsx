interface StatCardProps {
  value: string;
  label: string;
  description?: string;
  /** Color de fondo opcional (matiza la jerarquía visual del grid) */
  tone?: "default" | "brand" | "muted";
}

const toneClass = {
  default: "bg-white",
  brand: "bg-green-100",
  muted: "bg-gray-50",
} as const;

export function StatCard({ value, label, description, tone = "default" }: StatCardProps) {
  return (
    <div
      className={`border border-gray-200 rounded-lg p-8 lg:p-12 w-full ${toneClass[tone]}`}
    >
      <p className="font-bold text-3xl lg:text-4xl tracking-tight">{value}</p>
      <p className="text-gray-700 text-sm mt-2 font-medium">{label}</p>
      {description ? (
        <p className="text-gray-600 text-xs mt-3 leading-relaxed">{description}</p>
      ) : null}
    </div>
  );
}
