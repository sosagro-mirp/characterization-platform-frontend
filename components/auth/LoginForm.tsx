"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
    "w-full mt-6 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-red-300/40 border border-gray-400 placeholder:text-gray-300 font-light text-gray-100 disabled:opacity-60";

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full lg:pr-12 flex flex-col mt-8"
      noValidate
    >
      {registered && (
        <p
          role="status"
          className="text-sm text-green-200 bg-green-900/60 border border-green-400/40 rounded-md px-3 py-2"
        >
          Cuenta creada exitosamente. Ya puedes iniciar sesión.
        </p>
      )}
      <label htmlFor="login-email" className="sr-only">
        Correo electrónico
      </label>
      <input
        id="login-email"
        type="email"
        required
        autoComplete="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        className={inputClass}
      />
      <label htmlFor="login-password" className="sr-only">
        Contraseña
      </label>
      <input
        id="login-password"
        type="password"
        required
        minLength={8}
        autoComplete="current-password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
        className={inputClass}
      />

      {error && (
        <p
          role="alert"
          className="mt-4 text-sm text-red-200 bg-red-900/40 border border-red-400/40 rounded-md px-3 py-2"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-6 bg-green-200 font-semibold py-4 rounded-lg hover:bg-green-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Iniciando sesión…" : "Iniciar sesión"}
      </button>
    </form>
  );
}
