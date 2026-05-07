"use client";

import { RefObject, useEffect } from "react";
import { useThemeStore, resolveEffectiveTheme } from "@/store/useThemeStore";

export function useApplyAdminTheme(ref: RefObject<HTMLElement | null>) {
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const mql = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const effective = resolveEffectiveTheme(mode, mql.matches);
      node.classList.toggle("dark", effective === "dark");
    };

    apply();

    if (mode !== "system") return;

    const listener = () => apply();
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, [mode, ref]);
}
