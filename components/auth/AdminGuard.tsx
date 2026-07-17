"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import {
  clearMustChangeCookie,
  clearRoleCookie,
  clearSessionCookie,
} from "@/lib/sessionCookie";

const PANEL_ROLES = ["admin", "researcher"];

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const hydrated = useIsHydrated();

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || !user) {
      // El store dice "no autenticado": sincroniza las cookies espejo para que
      // el middleware no crea que hay sesión y rebote de vuelta a esta ruta
      // (evita el ping-pong /admin ⇄ /login). El `from` es solo el pathname,
      // nunca la query, para que no se anide en cada vuelta.
      clearSessionCookie();
      clearRoleCookie();
      clearMustChangeCookie();
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!user.role || !PANEL_ROLES.includes(user.role)) {
      router.replace("/campaign");
    }
  }, [hydrated, isAuthenticated, user, router, pathname]);

  if (
    !hydrated ||
    !isAuthenticated ||
    !user ||
    !user.role ||
    !PANEL_ROLES.includes(user.role)
  ) {
    return (
      <div
        className="flex h-full min-h-[60vh] items-center justify-center text-sm text-[var(--text-muted)]"
        aria-busy="true"
      >
        Verificando sesión…
      </div>
    );
  }

  return <>{children}</>;
}
