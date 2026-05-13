"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/services/auth.service";
import { ApiError } from "@/lib/apiClient";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function isSafeFrom(value: string | null): value is string {
    if (!value) return false;
    if (!value.startsWith("/") || value.startsWith("//")) return false;
    if (value.startsWith("/login")) return false;
    return true;
  }

  function fallbackForRole(role: string | null): string {
    if (role === "admin" || role === "researcher") return "/admin/instruments";
    return "/instrument";
  }

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
      const target = isSafeFrom(from) ? from : fallbackForRole(user.role);
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

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full lg:pr-12 flex flex-col mt-8"
      noValidate
    >
      <input
        type="email"
        required
        autoComplete="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        className="w-full mt-6 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-red-300/40 border border-gray-400 placeholder:text-gray-300 font-light text-gray-100 disabled:opacity-60"
      />
      <input
        type="password"
        required
        minLength={8}
        autoComplete="current-password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
        className="w-full mt-6 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-red-300/40 border border-gray-400 placeholder:text-gray-300 font-light text-gray-100 disabled:opacity-60"
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
