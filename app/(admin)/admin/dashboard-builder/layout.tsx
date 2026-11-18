import AdminOnlyGuard from "@/components/auth/AdminOnlyGuard";

// Spec 109 (P8): el constructor es solo para ADMIN.
export default function DashboardBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminOnlyGuard>{children}</AdminOnlyGuard>;
}
