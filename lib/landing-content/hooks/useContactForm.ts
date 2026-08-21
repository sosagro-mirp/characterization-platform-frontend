"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";

export interface ContactFormValues {
  name: string;
  email: string;
  organization: string;
  role: string;
  topic: string;
  message: string;
  consent: boolean;
}

const EMPTY_FORM: ContactFormValues = {
  name: "",
  email: "",
  organization: "",
  role: "",
  topic: "",
  message: "",
  consent: false,
};

/**
 * Estado y validación del formulario de contacto, compartido entre las 4
 * variantes de landing. No envía a un backend real (ver spec04, fuera de
 * alcance): al enviar, valida campos requeridos y muestra la pantalla de
 * confirmación local.
 */
export function useContactForm() {
  const [form, setForm] = useState<ContactFormValues>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);

  const setField = (key: keyof ContactFormValues) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const value =
      e.target instanceof HTMLInputElement && e.target.type === "checkbox"
        ? e.target.checked
        : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleConsent = () =>
    setForm((prev) => ({ ...prev, consent: !prev.consent }));

  const isValid =
    form.name.trim() !== "" &&
    form.email.trim() !== "" &&
    form.message.trim().length >= 20 &&
    form.consent;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid) return;
    // TODO: conectar a endpoint del backend cuando esté disponible
    setSubmitted(true);
  };

  return {
    form,
    setField,
    toggleConsent,
    isValid,
    submitted,
    handleSubmit,
  };
}
