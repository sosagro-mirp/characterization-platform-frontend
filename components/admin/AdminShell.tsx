"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import NewRequestModal from "@/components/admin/requests/NewRequestModal";

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const role = useAuthStore((s) => s.user?.role ?? null);
  const [showReportModal, setShowReportModal] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, []);

  const navLinkClass = (href: string) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return `rounded-md border-l-4 px-3 py-2 text-sm font-medium transition-colors ${
      active
        ? "border-brand bg-brand-subtle-bg text-brand-subtle-fg"
        : "border-transparent text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
    }`;
  };

  return (
    <div
      id="admin-shell"
      className="flex h-screen pt-[72px] lg:pt-[80px] bg-surface-muted text-text-primary"
    >

      <aside className="w-64 shrink-0 overflow-y-auto border-r border-[var(--border)] bg-[var(--surface)] px-4 py-6 flex flex-col gap-1 h-full">
        <p className="my-4 px-3 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Administración
        </p>
        <Link href="/admin/instruments" className={navLinkClass("/admin/instruments")}>
          Instrumentos
        </Link>
        <Link href="/admin/campaigns" className={navLinkClass("/admin/campaigns")}>
          Campañas
        </Link>
        <Link href="/admin/farmers" className={navLinkClass("/admin/farmers")}>
          Agricultores
        </Link>
        {(role === "admin" || role === "researcher") && (
          <Link href="/admin/consents" className={navLinkClass("/admin/consents")}>
            Consentimiento
          </Link>
        )}
        {role === "admin" && (
          <Link href="/admin/users" className={navLinkClass("/admin/users")}>
            Usuarios
          </Link>
        )}
        {role === "admin" && (
          <Link href="/admin/requests" className={navLinkClass("/admin/requests")}>
            Solicitudes
          </Link>
        )}
        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <Link
            href="/campaign"
            className="block rounded-md px-3 py-2 text-sm font-medium bg-brand hover:scale-105 transition-transform uppercase text-center text-brand-foreground"
          >
            Aplicar encuestas
          </Link>
          <p className="mt-2 px-1 text-xs text-[var(--text-muted)]">
            Aplica un instrumento directamente a un agricultor desde una campaña activa.
          </p>
        </div>

        <div className="mt-auto pt-4 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors"
          >
            <TriangleAlert className="size-5 shrink-0" />
            Reportar un problema
          </button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>

      {showReportModal && (
        <NewRequestModal
          onClose={() => setShowReportModal(false)}
          onCreated={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
