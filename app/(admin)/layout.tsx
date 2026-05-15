import Script from "next/script";
import { Suspense } from "react";
import AdminGuard from "@/components/auth/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";

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

      {/* Pantallas pequeñas y tablet: bloqueo con mensaje */}
      <div className="lg:hidden flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-8 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-8 text-green-700"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Panel de administración
          </h1>
          <p className="mt-2 text-sm text-gray-500 max-w-xs">
            Este panel está optimizado para pantallas grandes. Por favor, ábrelo
            desde un computador de escritorio o portátil.
          </p>
        </div>
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
