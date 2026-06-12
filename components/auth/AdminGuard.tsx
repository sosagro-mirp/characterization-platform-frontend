"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useIsHydrated } from "@/hooks/useIsHydrated";

const PANEL_ROLES = ["admin", "researcher"];

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const hydrated = useIsHydrated();

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || !user) {
      const search = searchParams.toString();
      const from = search ? `${pathname}?${search}` : pathname;
      router.replace(`/login?from=${encodeURIComponent(from)}`);
      return;
    }
    if (!user.role || !PANEL_ROLES.includes(user.role)) {
      router.replace("/instrument");
    }
  }, [hydrated, isAuthenticated, user, router, pathname, searchParams]);

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
