import AdminOnlyGuard from "@/components/auth/AdminOnlyGuard";

export default function UsersAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminOnlyGuard>{children}</AdminOnlyGuard>;
}
