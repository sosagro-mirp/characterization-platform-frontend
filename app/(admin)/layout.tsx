import Link from "next/link";
import { Suspense } from "react";
import AdminGuard from "@/components/auth/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      {/* Pantallas pequeñas y tablet: bloqueo con mensaje */}
      <div className="lg:hidden flex min-h-screen flex-col items-center justify-center gap-6 bg-surface-muted px-8 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-subtle-bg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-8 text-brand-subtle-fg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">
            Panel de administración
          </h1>
          <p className="mt-2 text-sm text-text-muted max-w-xs">
            Este panel está optimizado para pantallas grandes. Por favor, ábrelo
            desde un computador de escritorio o portátil.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground hover:bg-brand-hover transition-colors"
        >
          Volver al inicio
        </Link>
      </div>

      {/* Desktop: panel completo */}
      <div className="hidden lg:block">
        <AdminShell>
          <AdminGuard>{children}</AdminGuard>
        </AdminShell>
      </div>
    </Suspense>
  );
}
