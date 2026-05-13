"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

const ADMIN_ROLE = "admin";

export default function AdminOnlyGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }
    if (user.role !== ADMIN_ROLE) {
      router.replace("/admin/instruments");
    }
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated || !isAuthenticated || !user || user.role !== ADMIN_ROLE) {
    return (
      <div
        className="flex h-full min-h-[60vh] items-center justify-center text-sm text-[var(--text-muted)]"
        aria-busy="true"
      >
        Verificando permisos…
      </div>
    );
  }

  return <>{children}</>;
}
