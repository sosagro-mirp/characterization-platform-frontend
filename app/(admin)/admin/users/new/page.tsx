"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreateUserRequest, RoleSummary } from "@/app/(admin)/types";
import { listRoles } from "@/services/roles.service";
import { createUser } from "@/services/users.service";
import { ApiError } from "@/lib/apiClient";
import UserForm from "@/components/admin/users/UserForm";

export default function NewUserPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<RoleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [topError, setTopError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setRoles(await listRoles());
      } catch (err) {
        setTopError(
          err instanceof Error ? err.message : "Error al cargar roles.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSubmit(data: CreateUserRequest | Partial<CreateUserRequest>) {
    setEmailError(null);
    setTopError(null);
    try {
      await createUser(data as CreateUserRequest);
      router.push("/admin/users");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setEmailError("Este correo ya está registrado.");
        throw err;
      }
      const message =
        err instanceof Error ? err.message : "Error al crear usuario.";
      setTopError(message);
      throw err;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Nuevo usuario
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Crea un usuario asignándole un rol del sistema.
        </p>
      </div>

      {topError && (
        <p className="text-sm text-[var(--danger-fg)] rounded-lg bg-[var(--danger-bg)] px-3 py-2">
          {topError}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Cargando…</p>
      ) : (
        <UserForm
          mode="create"
          roles={roles}
          onSubmit={handleSubmit}
          submitLabel="Crear usuario"
          emailError={emailError}
        />
      )}
    </div>
  );
}
