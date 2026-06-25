"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  RoleSummary,
  UpdateUserRequest,
  UserDetail,
} from "@/app/(admin)/types";
import { listRoles } from "@/services/roles.service";
import {
  deleteUser,
  getUser,
  updateUser,
} from "@/services/users.service";
import { ApiError } from "@/lib/apiClient";
import { useAuthStore } from "@/store/useAuthStore";
import UserForm from "@/components/admin/users/UserForm";
import ConfirmDialog from "@/components/instrument-editor/ConfirmDialog";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const userId = params.id;
  const currentUserId = useAuthStore((s) => s.user?.userId ?? null);

  const [user, setUser] = useState<UserDetail | null>(null);
  const [roles, setRoles] = useState<RoleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [topError, setTopError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<UpdateUserRequest | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [u, r] = await Promise.all([getUser(userId), listRoles()]);
        if (!cancelled) {
          setUser(u);
          setRoles(r);
        }
      } catch (err) {
        if (!cancelled)
          setTopError(err instanceof Error ? err.message : "Error al cargar usuario.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  async function executeUpdate(data: UpdateUserRequest) {
    setEmailError(null);
    setTopError(null);
    try {
      const updated = await updateUser(userId, data);
      setUser(updated);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setEmailError("Este correo ya está registrado.");
        throw err;
      }
      const message = err instanceof Error ? err.message : "Error al actualizar.";
      setTopError(message);
      throw err;
    }
  }

  async function handleSubmit(data: UpdateUserRequest) {
    if (
      currentUserId === userId &&
      data.roleId &&
      user?.role?.roleId !== data.roleId
    ) {
      const newRoleName = roles.find((r) => r.roleId === data.roleId)?.name;
      if (newRoleName !== "admin") {
        setPendingUpdate(data);
        return;
      }
    }
    await executeUpdate(data);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteUser(userId);
      setConfirmDelete(false);
      router.push("/admin/users");
    } catch (err) {
      setTopError(err instanceof Error ? err.message : "Error al eliminar.");
      setDeleting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-[var(--text-muted)]">Cargando…</p>;
  }

  if (!user) {
    return (
      <p className="text-sm text-[var(--danger-fg)]">
        {topError ?? "Usuario no encontrado."}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Editar usuario
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {user.name} {user.lastName} — {user.email}
        </p>
      </div>

      {topError && (
        <p className="text-sm text-[var(--danger-fg)] rounded-lg bg-[var(--danger-bg)] px-3 py-2">
          {topError}
        </p>
      )}

      <UserForm
        mode="edit"
        roles={roles}
        initial={user}
        onSubmit={handleSubmit}
        submitLabel="Guardar cambios"
        emailError={emailError}
      />

      <div className="pt-6 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="rounded-xl border border-[var(--danger-fg)]/40 px-4 py-2 text-sm font-medium text-[var(--danger-fg)] hover:bg-[var(--danger-bg)] transition-colors"
        >
          Eliminar usuario
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Eliminar usuario"
        description={`¿Eliminar a ${user.name} ${user.lastName}? Esta acción no se puede deshacer.`}
        confirmLabel={deleting ? "Eliminando…" : "Sí, eliminar"}
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <ConfirmDialog
        open={!!pendingUpdate}
        title="Cambiar tu propio rol"
        description="Dejarás de tener acceso al panel de administración. ¿Continuar?"
        confirmLabel="Sí, cambiar rol"
        destructive
        onConfirm={() => { if (pendingUpdate) executeUpdate(pendingUpdate); setPendingUpdate(null); }}
        onCancel={() => setPendingUpdate(null)}
      />
    </div>
  );
}
