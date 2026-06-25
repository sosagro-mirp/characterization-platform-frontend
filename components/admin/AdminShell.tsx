"use client";

import { useState } from "react";
import Link from "next/link";
import { Flag } from "lucide-react";
import { useIsAdminDark } from "@/lib/theme/useApplyAdminTheme";
import ThemeToggle from "@/components/admin/ThemeToggle";
import { useAuthStore } from "@/store/useAuthStore";
import NewRequestModal from "@/components/admin/requests/NewRequestModal";

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const isDark = useIsAdminDark();
  const role = useAuthStore((s) => s.user?.role ?? null);
  const [showReportModal, setShowReportModal] = useState(false);

  return (
    <div
      id="admin-shell"
      suppressHydrationWarning
      className={`flex h-screen bg-surface-muted text-text-primary ${isDark ? "dark" : ""}`}
    >

      <aside className="w-64 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] px-4 py-6 flex flex-col gap-1 h-full">
        <Link
          href="/"
          className="rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-colors bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          ← Volver al inicio
        </Link>
        <p className="my-4 px-3 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
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
        <Link
          href="/admin/farmers"
          className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors"
        >
          Agricultores
        </Link>
        {role === "admin" && (
          <Link
            href="/admin/users"
            className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors"
          >
            Usuarios
          </Link>
        )}
        {role === "admin" && (
          <Link
            href="/admin/requests"
            className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors"
          >
            Solicitudes
          </Link>
        )}
        <Link
          href="/campaign"
          className="rounded-lg mt-4 px-3 py-2 text-sm font-medium  bg-green-700 hover:scale-105 transition-transform uppercase text-center text-white"
        >
          Campañas
        </Link>

        <div className="mt-auto pt-4 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
          >
            <Flag className="size-5 shrink-0" />
            Reportar un problema
          </button>
          <ThemeToggle />
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>

      {showReportModal && (
        <NewRequestModal
          onClose={() => setShowReportModal(false)}
          onCreated={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
