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
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
        Editar usuario
      </h1>

      {topError && (
        <p className="text-sm text-[var(--danger-fg)] rounded-lg bg-[var(--danger-bg)] px-3 py-2">
          {topError}
        </p>
      )}

      <section className="overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-6 py-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Datos de la cuenta
          </h2>
        </div>
        <div className="p-6">
          <UserForm
            mode="edit"
            roles={roles}
            initial={user}
            onSubmit={handleSubmit}
            submitLabel="Guardar cambios"
            emailError={emailError}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-[var(--danger-fg)]/40 bg-[var(--surface)]">
        <div className="border-b border-[var(--danger-fg)]/40 bg-[var(--danger-bg)] px-6 py-3">
          <h2 className="text-sm font-semibold text-[var(--danger-fg)]">
            Zona de peligro
          </h2>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 p-6">
          <p className="max-w-sm text-xs text-[var(--text-muted)] leading-relaxed">
            Eliminar este usuario revoca su acceso de forma permanente. Las encuestas que aplicó se conservan.
          </p>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="shrink-0 rounded-md bg-[var(--danger-fg)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Eliminar usuario
          </button>
        </div>
      </section>

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
