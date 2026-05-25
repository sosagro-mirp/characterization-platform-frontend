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
    "w-full mt-6 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-red-300/40 border border-gray-400 placeholder:text-gray-300 font-light text-gray-100 disabled:opacity-60";

  return (
    <form onSubmit={handleSubmit} className="w-full lg:pr-12 flex flex-col mt-8" noValidate>
      <input
        type="text"
        required
        autoComplete="given-name"
        placeholder="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={loading}
        className={inputClass}
      />
      <input
        type="text"
        required
        autoComplete="family-name"
        placeholder="Apellido"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        disabled={loading}
        className={inputClass}
      />
      <input
        type="email"
        required
        autoComplete="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        className={inputClass}
      />
      <input
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
        className={inputClass}
      />
      <input
        type="text"
        required
        autoComplete="off"
        placeholder="Código de validación"
        value={validationCode}
        onChange={(e) => setValidationCode(e.target.value)}
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
        {loading ? "Creando cuenta…" : "Crear cuenta"}
      </button>
    </form>
  );
}
