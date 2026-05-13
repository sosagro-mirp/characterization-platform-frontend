"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserListItem } from "@/app/(admin)/types";
import { deleteUser, listUsers } from "@/services/users.service";
import UsersTable from "@/components/admin/users/UsersTable";
import ConfirmDialog from "@/components/instrument-editor/ConfirmDialog";

export default function UsersListPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<UserListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  async function handleConfirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteUser(toDelete.userId);
      setToDelete(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar usuario.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Usuarios
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Gestiona usuarios y sus roles.
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] transition-colors"
        >
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
          onDelete={(user) => setToDelete(user)}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Eliminar usuario"
        description={
          toDelete
            ? `¿Eliminar a ${toDelete.name} ${toDelete.lastName} (${toDelete.email})? Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel={deleting ? "Eliminando…" : "Sí, eliminar"}
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
