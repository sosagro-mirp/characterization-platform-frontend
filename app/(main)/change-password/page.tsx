import { Suspense } from "react";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";

export const metadata = {
  title: "Cambiar contraseña — SOSAgro",
};

export default function ChangePasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-start justify-center py-24 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          Cambiar contraseña
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">
          Es tu primer acceso al sistema. Crea una contraseña personal para continuar.
        </p>
        <Suspense>
          <ChangePasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
