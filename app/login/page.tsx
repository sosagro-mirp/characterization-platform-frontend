import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { heroStats } from "@/lib/landing-content";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
    title: "Iniciar sesión",
    description: "Inicia sesión en la plataforma de caracterización SOS Agro 4C.",
};

export default function LoginPage() {
    return (
        <section className="h-dvh overflow-hidden pt-[72px] lg:pt-[80px]">
            <div className="grid h-full lg:grid-cols-2">

                {/* BRAND PANEL — acento interactivo reactivo (verde en claro, amarillo en oscuro), igual criterio que el resto de la app */}
                <div className="relative hidden lg:flex flex-col overflow-hidden bg-brand-dark px-10 py-10 text-white dark:bg-[#3f2d05] xl:px-14 xl:py-12">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-[0.08] dark:opacity-[0.06]"
                        style={{
                            backgroundImage:
                                "linear-gradient(#dcfce7 1px, transparent 1px), linear-gradient(90deg, #dcfce7 1px, transparent 1px)",
                            backgroundSize: "42px 42px",
                        }}
                    />

                    <div className="relative flex flex-1 flex-col justify-center max-w-md">
                        <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight xl:text-4xl">
                            Plataforma de datos del proyecto
                        </h1>
                        <p className="text-sm leading-relaxed text-brand-light/90 dark:text-yellow-50/80">
                            Gestioná instrumentos, campañas y respuestas de caracterización
                            agrícola en las cuatro cadenas productivas de los seis
                            departamentos priorizados.
                        </p>
                    </div>

                    <div className="relative flex flex-wrap gap-9">
                        {heroStats.map((stat) => (
                            <div key={stat.key}>
                                <div className="mb-1.5 text-2xl font-extrabold leading-none text-yellow-400 dark:text-yellow-300">
                                    {stat.value}
                                </div>
                                <div className="text-[11px] leading-tight text-brand-light/70 dark:text-yellow-100/70">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FORM PANEL */}
                <div className="flex h-full flex-col justify-center overflow-y-auto bg-background px-6 py-8 sm:px-10 lg:px-14">
                    <div className="mx-auto w-full max-w-md">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand-subtle-bg px-3.5 py-1.5 text-[11.5px] tracking-wide text-brand-subtle-fg">
                            <span className="text-brand">●</span> iniciar sesión
                        </div>
                        <h2 className="mb-2 text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl">
                            Bienvenido de vuelta
                        </h2>
                        <p className="mb-8 text-sm leading-relaxed text-text-muted">
                            Ingresa tus credenciales para acceder a la plataforma.
                        </p>

                        <Suspense fallback={null}>
                            <LoginForm />
                        </Suspense>

                        <p className="mt-8 text-sm text-text-muted">
                            ¿Primera vez?{" "}
                            <Link href="/register" className="font-medium text-brand hover:underline">
                                Crea tu cuenta
                            </Link>
                        </p>

                        <div className="mt-10 border-t border-[var(--border)] pt-5 text-[10.5px] text-text-muted">
                            © {new Date().getFullYear()} Sos Agro 4.C — PDET/ZOMAC
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
