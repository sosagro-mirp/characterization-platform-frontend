"use client";

import Link from "next/link";
import { useIsAdminDark } from "@/lib/theme/useApplyAdminTheme";
import ThemeToggle from "@/components/admin/ThemeToggle";
import { useAuthStore } from "@/store/useAuthStore";

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const isDark = useIsAdminDark();
  const role = useAuthStore((s) => s.user?.role ?? null);

  return (
    <div
      id="admin-shell"
      suppressHydrationWarning
      className={`flex min-h-screen bg-[var(--surface-muted)] text-[var(--text-primary)] ${isDark ? "dark" : ""}`}
    >
      <aside className="w-56 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] px-4 py-6 flex flex-col gap-1">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Administración
        </p>
        <Link
          href="/admin/instruments"
          className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors"
        >
          Instrumentos
        </Link>
        <Link
          href="/admin/campaigns"
          className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors"
        >
          Campañas
        </Link>
        {role === "admin" && (
          <Link
            href="/admin/users"
            className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors"
          >
            Usuarios
          </Link>
        )}
        <div className="mt-auto pt-4 border-t border-[var(--border)]">
          <ThemeToggle />
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
