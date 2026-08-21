"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/useThemeStore";
import { applyTheme, syncThemeColorMeta } from "@/lib/theme/applyTheme";
import { resolveEffectiveTheme, type EffectiveTheme } from "@/lib/theme/resolveTheme";

const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(DARK_MEDIA_QUERY).matches;
}

export function useTheme() {
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  const cyclePreference = useThemeStore((s) => s.cyclePreference);
  const [systemPrefersDark, setSystemPrefersDark] = useState(getSystemPrefersDark);

  useEffect(() => {
    const media = window.matchMedia(DARK_MEDIA_QUERY);
    const handleChange = (event: MediaQueryListEvent) => setSystemPrefersDark(event.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const effectiveTheme: EffectiveTheme = resolveEffectiveTheme(preference, systemPrefersDark);

  useEffect(() => {
    applyTheme(effectiveTheme, document.documentElement);
    syncThemeColorMeta(effectiveTheme, document);
  }, [effectiveTheme]);

  return { preference, effectiveTheme, setPreference, cyclePreference };
}
