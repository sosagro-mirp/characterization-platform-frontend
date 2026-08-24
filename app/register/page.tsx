import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
    title: "SosAgro 4.C — Crear cuenta",
    description: "Crea tu cuenta de investigador en la plataforma de caracterización SosAgro 4.C.",
    manifest: "/manifest.json",
};

export default function RegisterPage() {
    return (
        <section className="min-h-dvh pt-[72px] lg:pt-[80px]">
            <div className="grid min-h-[calc(100dvh-72px)] lg:min-h-[calc(100dvh-80px)] lg:grid-cols-2">

                {/* BRAND PANEL — acento interactivo reactivo (verde en claro, amarillo en oscuro), igual criterio que /login */}
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
                            Sumate al equipo de investigación
                        </h1>
                        <p className="text-sm leading-relaxed text-brand-light/90 dark:text-yellow-50/80">
                            Creá tu cuenta con el código de validación compartido por el
                            equipo de coordinación para gestionar instrumentos y campañas de
                            caracterización agrícola.
                        </p>
                    </div>

                    <div className="relative text-[11px] leading-relaxed text-brand-light/70 dark:text-yellow-100/70">
                        ¿Ya tenés cuenta?{" "}
                        <Link href="/login" className="font-medium text-white hover:underline">
                            Inicia sesión
                        </Link>
                    </div>
                </div>

                {/* FORM PANEL */}
                <div className="flex flex-col justify-center bg-background px-6 py-10 sm:px-10 lg:px-14">
                    <div className="mx-auto w-full max-w-md">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand-subtle-bg px-3.5 py-1.5 text-[11.5px] tracking-wide text-brand-subtle-fg">
                            <span className="text-brand">●</span> crear cuenta
                        </div>
                        <h2 className="mb-2 text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl">
                            Crea tu cuenta
                        </h2>
                        <p className="mb-8 text-sm leading-relaxed text-text-muted">
                            Completá tus datos y el código de validación de la presentación.
                        </p>

                        <Suspense fallback={null}>
                            <RegisterForm />
                        </Suspense>

                        <p className="mt-8 text-sm text-text-muted lg:hidden">
                            ¿Ya tenés cuenta?{" "}
                            <Link href="/login" className="font-medium text-brand hover:underline">
                                Inicia sesión
                            </Link>
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
}
