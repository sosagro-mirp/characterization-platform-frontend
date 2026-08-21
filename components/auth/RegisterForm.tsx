"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/services/auth.service";
import { ApiError } from "@/lib/apiClient";

export default function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationCode, setValidationCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    if (!name.trim()) return "Ingresa tu nombre.";
    if (!lastName.trim()) return "Ingresa tu apellido.";
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return "Ingresa tu correo electrónico.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) return "El correo electrónico no tiene un formato válido.";
    if (!password) return "Ingresa tu contraseña.";
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (!validationCode.trim()) return "Ingresa el código de validación.";
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
      await register({
        name: name.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        validationCode: validationCode.trim(),
      });
      router.replace("/login?registered=true");
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError("Código de validación incorrecto.");
      } else if (err instanceof ApiError && err.status === 409) {
        setError("Este correo ya está registrado. Intenta iniciar sesión.");
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("No fue posible completar el registro. Intenta de nuevo.");
      }
      setLoading(false);
    }
  }

  const inputClass =
    "w-full box-border border-0 border-b border-[var(--border)] bg-transparent px-0.5 py-2 font-mono text-[13.5px] text-text-primary outline-none placeholder:text-text-muted focus:border-brand disabled:opacity-60";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col" noValidate>
      {error && (
        <p
          role="alert"
          className="mb-6 rounded-md border border-[var(--danger-fg)]/30 bg-[var(--danger-bg)] px-3.5 py-3 text-xs leading-relaxed text-[var(--danger-fg)]"
        >
          {error}
        </p>
      )}

      <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <label htmlFor="register-name" className="block">
          <div className="mb-1.5 text-[11.5px] text-text-muted">Nombre</div>
          <input
            id="register-name"
            type="text"
            required
            autoComplete="given-name"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            className={inputClass}
          />
        </label>
        <label htmlFor="register-last-name" className="block">
          <div className="mb-1.5 text-[11.5px] text-text-muted">Apellido</div>
          <input
            id="register-last-name"
            type="text"
            required
            autoComplete="family-name"
            placeholder="Apellido"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={loading}
            className={inputClass}
          />
        </label>
      </div>

      <label htmlFor="register-email" className="block mb-6">
        <div className="mb-1.5 text-[11.5px] text-text-muted">Correo electrónico</div>
        <input
          id="register-email"
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

      <label htmlFor="register-password" className="block mb-6">
        <div className="mb-1.5 text-[11.5px] text-text-muted">Contraseña</div>
        <input
          id="register-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className={inputClass}
        />
      </label>

      <label htmlFor="register-validation-code" className="block mb-8">
        <div className="mb-1.5 text-[11.5px] text-text-muted">Código de validación</div>
        <input
          id="register-validation-code"
          type="text"
          required
          autoComplete="off"
          placeholder="Código compartido en la presentación"
          value={validationCode}
          onChange={(e) => setValidationCode(e.target.value)}
          disabled={loading}
          className={inputClass}
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-brand py-3.5 text-[13.5px] font-semibold text-brand-foreground transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        {loading ? "Creando cuenta…" : "Crear cuenta"}
      </button>
    </form>
  );
}
