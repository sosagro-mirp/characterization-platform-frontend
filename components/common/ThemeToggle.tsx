"use client";

import { Moon, Monitor, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import type { ThemePreference } from "@/lib/theme/resolveTheme";

const ICON_BY_PREFERENCE = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

const TEXT_BY_PREFERENCE: Record<ThemePreference, string> = {
  light: "Claro",
  dark: "Oscuro",
  system: "Sistema",
};

const ARIA_LABEL_BY_PREFERENCE: Record<ThemePreference, string> = {
  light: "Tema claro activo — cambiar a oscuro",
  dark: "Tema oscuro activo — cambiar a sistema",
  system: "Tema según el sistema activo — cambiar a claro",
};

interface ThemeToggleProps {
  className?: string;
  iconSize?: number;
  /** "icon" (solo icono, para barras compactas) o "labeled" (icono + texto, para menús). */
  variant?: "icon" | "labeled";
}

export function ThemeToggle({ className = "", iconSize = 20, variant = "icon" }: ThemeToggleProps) {
  const { preference, cyclePreference } = useTheme();
  const hydrated = useIsHydrated();
  // Antes de hidratar se asume "system" (valor inicial del store) para evitar
  // un parpadeo de icono distinto al que ya aplicó el script anti-FOUC.
  const shownPreference: ThemePreference = hydrated ? preference : "system";
  const Icon = ICON_BY_PREFERENCE[shownPreference];

  if (variant === "labeled") {
    return (
      <button
        type="button"
        onClick={cyclePreference}
        aria-label={ARIA_LABEL_BY_PREFERENCE[shownPreference]}
        className={`flex w-full items-center justify-center gap-2 rounded-lg border border-brand dark:border-[#fde047] py-3 text-center text-sm font-bold text-brand transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${className}`}
      >
        <Icon size={iconSize} aria-hidden="true" />
        Tema: {TEXT_BY_PREFERENCE[shownPreference]}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={cyclePreference}
      aria-label={ARIA_LABEL_BY_PREFERENCE[shownPreference]}
      className={`inline-flex items-center justify-center rounded-lg p-2 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${className}`}
    >
      <Icon size={iconSize} aria-hidden="true" />
    </button>
  );
}
