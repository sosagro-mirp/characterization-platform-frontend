"use client";

import { UserListItem } from "@/app/(admin)/types";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  researcher: "Investigador",
  pollster: "Encuestador",
};

interface UsersTableProps {
  users: UserListItem[];
  onEdit: (userId: string) => void;
  onDelete: (user: UserListItem) => void;
}

export default function UsersTable({ users, onEdit, onDelete }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)] py-12 text-center">
        No hay usuarios todavía.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--text-muted)]">
            <th className="px-4 py-3 font-medium">Nombre</th>
            <th className="px-4 py-3 font-medium">Correo</th>
            <th className="px-4 py-3 font-medium">Rol</th>
            <th className="px-4 py-3 font-medium">Creado</th>
            <th className="px-4 py-3 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr
              key={u.userId}
              className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-muted)]/40 transition-colors"
            >
              <td className="px-4 py-3 text-[var(--text-primary)]">
                {u.name} {u.lastName}
              </td>
              <td className="px-4 py-3 text-[var(--text-primary)]">{u.email}</td>
              <td className="px-4 py-3 text-[var(--text-primary)]">
                {u.role ? ROLE_LABELS[u.role.name] ?? u.role.name : "—"}
              </td>
              <td className="px-4 py-3 text-[var(--text-muted)]">
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="inline-flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(u.userId)}
                    className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(u)}
                    className="rounded-lg border border-[var(--danger-fg)]/40 px-3 py-1 text-xs font-medium text-[var(--danger-fg)] hover:bg-[var(--danger-bg)] transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
