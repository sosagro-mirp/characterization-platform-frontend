"use client";

import { useAuthStore } from "@/store/useAuthStore";

export default function AdminOnly({ children }: { children: React.ReactNode }) {
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");
  if (!isAdmin) return null;
  return <>{children}</>;
}
