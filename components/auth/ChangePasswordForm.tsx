"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { changePassword } from "@/services/auth.service";
import { useAuthStore } from "@/store/useAuthStore";
import { ApiError } from "@/lib/apiClient";

export default function ChangePasswordForm() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function destinationForRole(role: string | null): string {
    if (role === "admin" || role === "researcher") return "/admin/instruments";
    return "/instrument";
  }

  function validate(): string | null {
    if (!currentPassword) return "Ingresa tu contraseña actual.";
    if (!newPassword) return "Ingresa la nueva contraseña.";
    if (newPassword.length < 8) return "La nueva contraseña debe tener al menos 8 caracteres.";
    if (newPassword !== confirmPassword) return "Las contraseñas no coinciden.";
    if (newPassword === currentPassword) return "La nueva contraseña debe ser diferente a la actual.";
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
    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      router.replace(destinationForRole(user?.role ?? null));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("La contraseña actual es incorrecta.");
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("No fue posible cambiar la contraseña. Intenta de nuevo.");
      }
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 rounded-xl border border-[var(--brand)]/30 bg-[var(--brand)]/5 px-4 py-3 text-sm text-[var(--text-primary)]">
        Por seguridad, debes establecer una contraseña personal antes de continuar.
        Tu contraseña temporal fue asignada por el administrador.
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Contraseña actual <span className="text-[var(--danger-fg)]">*</span>
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Nueva contraseña <span className="text-[var(--danger-fg)]">*</span>
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Confirmar nueva contraseña <span className="text-[var(--danger-fg)]">*</span>
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            autoComplete="new-password"
            placeholder="Repite la nueva contraseña"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:opacity-60"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="text-sm text-[var(--danger-fg)] rounded-lg bg-[var(--danger-bg)] px-3 py-2"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Guardando…" : "Establecer nueva contraseña"}
        </button>
      </form>
    </div>
  );
}
