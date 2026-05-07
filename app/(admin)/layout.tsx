import Link from "next/link";
import Script from "next/script";
import { Suspense } from "react";
import AdminGuard from "@/components/auth/AdminGuard";

const ANTI_FLASH = `
(function () {
  try {
    var raw = window.localStorage.getItem('sosagro.theme');
    var mode = 'system';
    if (raw) {
      try { mode = (JSON.parse(raw).state || {}).mode || 'system'; } catch (e) {}
    }
    var sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var effective = mode === 'system' ? (sysDark ? 'dark' : 'light') : mode;
    var apply = function () {
      var el = document.getElementById('admin-shell');
      if (el) el.classList.toggle('dark', effective === 'dark');
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', apply, { once: true });
    } else {
      apply();
    }
  } catch (e) {}
})();
`;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <Script
        id="admin-theme-anti-flash"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: ANTI_FLASH }}
      />
      <AdminGuard>
        <div id="admin-shell" className="flex min-h-screen bg-neutral-50">
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
