"use client";

import { Trash2, UsersRound } from "lucide-react";
import { UserListItem } from "@/app/(admin)/types";
import Tooltip from "@/components/common/Tooltip";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  researcher: "Investigador",
  pollster: "Encuestador",
};

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-[var(--danger-bg)] text-[var(--danger-fg)]",
  researcher: "bg-[var(--info-bg)] text-[var(--info-fg)]",
  pollster: "bg-[var(--warning-bg)] text-[var(--warning-fg)]",
};

function initials(name: string, lastName: string): string {
  return `${name[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "—";
}

interface UsersTableProps {
  users: UserListItem[];
  onEdit: (userId: string) => void;
  onDelete: (user: UserListItem) => void;
}

export default function UsersTable({ users, onEdit, onDelete }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
        <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-[var(--surface-muted)]">
          <UsersRound className="size-5 text-[var(--text-muted)]" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          No hay usuarios todavía
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full text-xs">
        <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[10.5px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          <tr>
            <th className="px-3 py-2.5 text-left">Nombre</th>
            <th className="px-3 py-2.5 text-left">Correo</th>
            <th className="px-3 py-2.5 text-left">Rol</th>
            <th className="px-3 py-2.5 text-left">Creado</th>
            <th className="px-3 py-2.5 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {users.map((u) => (
            <tr key={u.userId} className="hover:bg-[var(--surface-muted)] transition-colors">
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[var(--surface-muted)] text-[10px] font-bold text-[var(--text-muted)]">
                    {initials(u.name, u.lastName)}
                  </span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {u.name} {u.lastName}
                  </span>
                </div>
              </td>
              <td className="px-3 py-2.5 truncate text-[var(--text-muted)]">{u.email}</td>
              <td className="px-3 py-2.5">
                {u.role ? (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium whitespace-nowrap ${ROLE_BADGE[u.role.name] ?? "bg-[var(--surface-muted)] text-[var(--text-muted)]"}`}
                  >
                    {ROLE_LABELS[u.role.name] ?? u.role.name}
                  </span>
                ) : (
                  <span className="text-[var(--text-muted)]">—</span>
                )}
              </td>
              <td className="px-3 py-2.5 text-[var(--text-muted)]">
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
              <td className="px-3 py-2.5 text-right">
                <div className="inline-flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onEdit(u.userId)}
                    className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors"
                  >
                    Editar
                  </button>
                  <Tooltip label="Eliminar usuario">
                    <button
                      type="button"
                      onClick={() => onDelete(u)}
                      className="rounded-md p-1.5 text-[var(--danger-fg)] border border-[var(--danger-fg)]/40 hover:bg-[var(--danger-bg)] transition-colors"
                      aria-label="Eliminar usuario"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    </button>
                  </Tooltip>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
