"use client";

import { useSyncExternalStore } from "react";
import { useThemeStore, resolveEffectiveTheme } from "@/store/useThemeStore";

function subscribeSystemDark(callback: () => void) {
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSystemDarkSnapshot() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getServerSystemDarkSnapshot() {
  return false;
}

export function useIsAdminDark(): boolean {
  const mode = useThemeStore((s) => s.mode);
  const systemDark = useSyncExternalStore(
    subscribeSystemDark,
    getSystemDarkSnapshot,
    getServerSystemDarkSnapshot,
  );
  return resolveEffectiveTheme(mode, systemDark) === "dark";
}
