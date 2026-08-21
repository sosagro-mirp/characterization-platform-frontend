"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { login } from "@/services/auth.service";
import { ApiError } from "@/lib/apiClient";
import { isSafeRedirectPath } from "@/lib/safeRedirect";
import { defaultRouteForRole } from "@/lib/roleRouting";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const registered = searchParams.get("registered") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return "Ingresa tu correo electrónico.";
    if (!password) return "Ingresa tu contraseña.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return "El correo electrónico no tiene un formato válido.";
    }
    if (password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres.";
    }
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const { user } = await login({ email: email.trim(), password });
      if (user.mustChangePassword) {
        router.replace("/change-password");
        return;
      }
      const target = isSafeRedirectPath(from) ? from : defaultRouteForRole(user.role);
      router.replace(target);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Credenciales inválidas. Verifica tu correo y contraseña.");
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("No fue posible iniciar sesión. Intenta de nuevo.");
      }
      setLoading(false);
    }
  }

  const inputClass =
    "w-full box-border border-0 border-b border-[var(--border)] bg-transparent px-0.5 py-2 font-mono text-[13.5px] text-text-primary outline-none placeholder:text-text-muted focus:border-brand disabled:opacity-60";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col" noValidate>
      {registered && (
        <p
          role="status"
          className="mb-6 rounded-md border border-brand/30 bg-brand-subtle-bg px-3 py-2 text-sm text-brand-subtle-fg"
        >
          Cuenta creada exitosamente. Ya puedes iniciar sesión.
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mb-6 rounded-md border border-[var(--danger-fg)]/30 bg-[var(--danger-bg)] px-3.5 py-3 text-xs leading-relaxed text-[var(--danger-fg)]"
        >
          {error}
        </p>
      )}

      <label htmlFor="login-email" className="block mb-6">
        <div className="mb-1.5 text-[11.5px] text-text-muted">Correo electrónico</div>
        <input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          placeholder="nombre@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className={inputClass}
        />
      </label>

      <label htmlFor="login-password" className="block mb-8">
        <div className="mb-1.5 flex items-baseline justify-between gap-2.5">
          <span className="text-[11.5px] text-text-muted">Contraseña</span>
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            disabled={loading}
            aria-pressed={showPassword}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="flex items-center gap-1 text-[11px] font-medium text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded disabled:opacity-60"
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            {showPassword ? "ocultar" : "mostrar"}
          </button>
        </div>
        <input
          id="login-password"
          type={showPassword ? "text" : "password"}
          required
          minLength={8}
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className={inputClass}
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-brand py-3.5 text-[13.5px] font-semibold text-brand-foreground transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        {loading ? "Verificando…" : "Ingresar"}
      </button>
    </form>
  );
}
