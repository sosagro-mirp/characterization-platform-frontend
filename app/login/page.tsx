import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
    title: "SosAgro 4.C ",
    description: "SosAgro 4.C es un proyecto financiado por el ministerio de ciencia ...",
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
                    <form action="" className="w-full lg:pr-12 flex flex-col mt-8 ">
                        <input type="email" placeholder="Correo electrónico" className="w-full mt-6 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-red-300/40 border border-gray-400 placeholder:text-gray-300 font-light" />
                        <input type="password" placeholder="Contraseña" className="w-full mt-6 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-red-300/40 border border-gray-400 placeholder:text-gray-300 font-light" />
                        <button type="submit" className="w-full mt-6 bg-green-200 font-semibold py-4 rounded-lg hover:bg-green-500 transition-colors ">Iniciar sesión</button>
                    </form>
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
