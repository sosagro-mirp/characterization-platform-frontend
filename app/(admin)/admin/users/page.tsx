"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { UserListItem } from "@/app/(admin)/types";
import { listUsers } from "@/services/users.service";
import UsersTable from "@/components/admin/users/UsersTable";

export default function UsersListPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      setUsers(await listUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar usuarios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Usuarios
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {loading
              ? "Gestiona usuarios y sus roles."
              : `${users.length} usuario${users.length === 1 ? "" : "s"} con acceso al panel`}
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors"
        >
          <Plus className="size-5 shrink-0" />
          Nuevo usuario
        </Link>
      </div>

      {error && (
        <p className="text-sm text-[var(--danger-fg)] rounded-lg bg-[var(--danger-bg)] px-3 py-2">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Cargando…</p>
      ) : (
        <UsersTable
          users={users}
          onEdit={(userId) => router.push(`/admin/users/${userId}`)}
        />
      )}
    </div>
  );
}
