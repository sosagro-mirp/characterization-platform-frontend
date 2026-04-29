"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

const ADMIN_ROLE = "admin";

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

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || !user) {
      const search = searchParams.toString();
      const from = search ? `${pathname}?${search}` : pathname;
      router.replace(`/login?from=${encodeURIComponent(from)}`);
      return;
    }
    if (user.role !== ADMIN_ROLE) {
      router.replace("/");
    }
  }, [hydrated, isAuthenticated, user, router, pathname, searchParams]);

  if (!hydrated || !isAuthenticated || !user || user.role !== ADMIN_ROLE) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-neutral-50 text-sm text-neutral-500"
        aria-busy="true"
      >
        Verificando sesión…
      </div>
    );
  }

  return <>{children}</>;
}
