import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "SosAgro 4.C ",
    description: "SosAgro 4.C es un proyecto financiado por el ministerio de ciencia ...",
};


export default function LoginPage() {
    return (
        <section className="bg-green-900 py-24 lg:py-42 flex flex-col items-center justify-center mt-12">
            <Link href="/" className=' text-gray-200'>
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-leaf"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3.055 14.328l-.018 -.168l-.004 -.043a11 11 0 0 1 -.047 -1.12c.018 -6.29 4.29 -9.997 13 -9.997h4.014a1 1 0 0 1 1 1l-.002 2.057c-.498 8.701 -4.74 12.943 -11.998 12.943h-2.631a16 16 0 0 0 -.375 2.11a1 1 0 1 1 -1.988 -.22q .174 -1.568 .58 -2.947l-.118 -.146l-.208 -.28l-.157 -.229l-.182 -.293l-.098 -.171l-.065 -.122a6 6 0 0 1 -.397 -.941l-.072 -.237l-.085 -.327l-.057 -.268l-.043 -.242zm8.539 -4.242c-2.845 1.265 -4.854 3.13 -6.108 5.583q .098 .2 .218 .4l.185 .281l.07 .097q .12 .164 .258 .329l.197 .224h.649c1.037 -2.271 2.777 -3.946 5.343 -5.086a1 1 0 0 0 -.812 -1.828" /></svg>
            </Link>
            <h1 className="text-2xl text-gray-200 font-bold mt-6">Inicia sesión</h1>
            <p className="text-gray-200 mt-2 font-light text-sm ">Por favor ingresa tus credenciales.</p>
            <form action="" className="w-full px-6 flex flex-col items-center mt-8 max-w-lg">
                <input type="email" placeholder="Correo electrónico" className="w-full mt-6 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-red-300/40 border border-gray-400 placeholder:text-gray-300 font-light" />
                <input type="password" placeholder="Contraseña" className="w-full mt-6 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-red-300/40 border border-gray-400 placeholder:text-gray-300 font-light" />
                <button type="submit" className="w-full max-w-lg mt-6 bg-green-200 font-semibold py-4 rounded-lg hover:bg-green-500 transition-colors text-sm">Iniciar sesión</button>
            </form>

        </section>
    );
}
