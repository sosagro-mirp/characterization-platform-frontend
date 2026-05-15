"use client";

import { useState } from "react";
import {
  CreateUserRequest,
  RoleSummary,
  UpdateUserRequest,
  UserDetail,
} from "@/app/(admin)/types";
import RoleSelect from "./RoleSelect";

type UserFormMode = "create" | "edit";

interface UserFormProps {
  mode: UserFormMode;
  roles: RoleSummary[];
  initial?: UserDetail;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  submitLabel?: string;
  emailError?: string | null;
}

export default function UserForm({
  mode,
  roles,
  initial,
  onSubmit,
  submitLabel,
  emailError,
}: UserFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [lastName, setLastName] = useState(initial?.lastName ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(initial?.role?.roleId ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate(): string | null {
    if (!name.trim()) return "Ingresa el nombre.";
    if (!lastName.trim()) return "Ingresa el apellido.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      return "Correo electrónico no válido.";
    }
    if (mode === "create" && password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres.";
    }
    if (mode === "edit" && password && password.length < 8) {
      return "Si cambias la contraseña, debe tener al menos 8 caracteres.";
    }
    if (!roleId) return "Selecciona un rol.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      if (mode === "create") {
        const payload: CreateUserRequest = {
          name: name.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
          roleId,
        };
        await onSubmit(payload);
      } else {
        const payload: UpdateUserRequest = {};
        if (name.trim() !== initial?.name) payload.name = name.trim();
        if (lastName.trim() !== initial?.lastName) payload.lastName = lastName.trim();
        if (email.trim() !== initial?.email) payload.email = email.trim();
        if (password) payload.password = password;
        if (roleId !== initial?.role?.roleId) payload.roleId = roleId;
        await onSubmit(payload);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Nombre <span className="text-[var(--danger-fg)]">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={50}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Apellido <span className="text-[var(--danger-fg)]">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={50}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
          Correo electrónico <span className="text-[var(--danger-fg)]">*</span>
        </label>
        <input
          type="email"
          required
          maxLength={100}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
        />
        {emailError && (
          <p className="mt-1 text-xs text-[var(--danger-fg)]">{emailError}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
          Contraseña{" "}
          {mode === "create" && (
            <span className="text-[var(--danger-fg)]">*</span>
          )}
        </label>
        <input
          type="password"
          required={mode === "create"}
          minLength={8}
          maxLength={72}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={
            mode === "edit" ? "Dejar vacío para no cambiar" : "Mínimo 8 caracteres"
          }
          className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
        />
        {mode === "edit" && (
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Si estableces una nueva contraseña, el usuario deberá cambiarla en su próximo inicio de sesión.
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
          Rol <span className="text-[var(--danger-fg)]">*</span>
        </label>
        <RoleSelect roles={roles} value={roleId} onChange={setRoleId} required />
      </div>

      {error && (
        <p className="text-sm text-[var(--danger-fg)] rounded-lg bg-[var(--danger-bg)] px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-[var(--brand)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-50"
      >
        {saving ? "Guardando…" : submitLabel ?? "Guardar"}
      </button>
    </form>
  );
}
