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
      <AdminGuard>
        <AdminShell>{children}</AdminShell>
      </AdminGuard>
    </Suspense>
  );
}
