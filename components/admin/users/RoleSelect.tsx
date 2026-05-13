"use client";

import { RoleSummary } from "@/app/(admin)/types";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  researcher: "Investigador",
  pollster: "Encuestador",
};

interface RoleSelectProps {
  roles: RoleSummary[];
  value: string;
  onChange: (roleId: string) => void;
  disabled?: boolean;
  required?: boolean;
  id?: string;
}

export default function RoleSelect({
  roles,
  value,
  onChange,
  disabled,
  required,
  id,
}: RoleSelectProps) {
  return (
    <select
      id={id}
      required={required}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-[var(--surface)] disabled:opacity-60"
    >
      <option value="">Seleccionar rol…</option>
      {roles.map((r) => (
        <option key={r.roleId} value={r.roleId}>
          {ROLE_LABELS[r.name] ?? r.name}
        </option>
      ))}
    </select>
  );
}
