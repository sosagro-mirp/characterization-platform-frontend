import Link from "next/link";
import { Suspense } from "react";
import AdminGuard from "@/components/auth/AdminGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <AdminGuard>
        <div className="flex min-h-screen bg-neutral-50">
          <aside className="w-56 shrink-0 border-r border-neutral-200 bg-white px-4 py-6 flex flex-col gap-1">
            <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Administración
            </p>
            <Link
              href="/admin/instruments"
              className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              Instrumentos
            </Link>
          </aside>
          <main className="flex-1 overflow-auto p-8">{children}</main>
        </div>
      </AdminGuard>
    </Suspense>
  );
}
