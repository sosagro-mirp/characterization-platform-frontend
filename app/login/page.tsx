import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
    title: "SosAgro 4.C — Iniciar sesión",
    description: "Inicia sesión en la plataforma de caracterización SosAgro 4.C.",
};


export default function LoginPage() {
    return (
        <section className="bg-green-900 h-screen lg:flex">

            <div className="lg:w-[50%] lg:pl-12 pt-4 md:pt-6 lg:pt-12 px-4 md:px-6 flex flex-col ">
                <div className="max-w-max bg-green-300 p-3 rounded-lg text-sm mb-12 flex items-center font-medium gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    <Link href="/" className="text-green-800 font-medium"> Volver al inicio</Link>
                </div>
                <div className="w-full mt-12 lg:mt-24 max-w-xl mx-auto lg:mx-0 lg:max-w-full">
                    <h1 className="text-4xl text-gray-200 font-bold text-center lg:text-left">Inicia sesión</h1>
                    <p className="text-gray-200 mt-2 font-light text-center lg:text-left">Por favor ingresa tus credenciales.</p>
                    <Suspense fallback={null}>
                        <LoginForm />
                    </Suspense>
                </div>
            </div>
            <div className="hidden lg:block w-[50%] h-full overflow-hidden">
                <Image
                    src="/cacao.jpg"
                    alt="campesino"
                    width={1000}
                    height={1000}
                    className="w-full h-full object-cover"
                />
            </div>
            {/*  */}

        </section>
    );
}
