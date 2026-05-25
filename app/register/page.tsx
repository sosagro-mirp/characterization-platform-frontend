import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
    title: "SosAgro 4.C — Crear cuenta",
    description: "Crea tu cuenta de investigador en la plataforma de caracterización SosAgro 4.C.",
    manifest: "/manifest.json",
};

export default function RegisterPage() {
    return (
        <section className="bg-green-900 min-h-screen lg:flex">

            <div className="lg:w-[50%] lg:pl-12 pt-4 md:pt-6 lg:pt-12 px-4 md:px-6 flex flex-col">
                <div className="max-w-max bg-green-300 p-3 rounded-lg text-sm mb-12 flex items-center font-medium gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    <Link href="/login" className="text-green-800 font-medium">Volver al inicio de sesión</Link>
                </div>
                <div className="w-full mt-4 lg:mt-12 max-w-xl mx-auto lg:mx-0 lg:max-w-full pb-12">
                    <h1 className="text-4xl text-gray-200 font-bold text-center lg:text-left">Crea tu cuenta</h1>
                    <p className="text-gray-200 mt-2 font-light text-center lg:text-left">Completa el formulario con tus datos y el código de validación.</p>
                    <Suspense fallback={null}>
                        <RegisterForm />
                    </Suspense>
                </div>
            </div>
            <div className="hidden lg:block w-[50%] h-screen sticky top-0 overflow-hidden">
                <Image
                    src="/crops/cacao.jpg"
                    alt="cultivos"
                    width={1000}
                    height={1000}
                    className="w-full h-full object-cover"
                />
            </div>

        </section>
    );
}
