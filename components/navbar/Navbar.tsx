"use client";

import Link from 'next/link';
import { useState } from 'react';
import Image from "next/image"

export const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen((prevState) => !prevState);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <>
            <nav className='fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200'>
                <div className='flex items-center justify-between w-full px-6 lg:px-12 py-4'>
                    <Link href="/" className='flex gap-3 items-center text-green-900'>
                        <Image
                            src="/logo.jpg"
                            alt="logo"
                            width={300}
                            height={300}
                            className="h-10 w-auto object-contain sm:h-10 md:h-12"
                        />
                        {/* <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-leaf"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3.055 14.328l-.018 -.168l-.004 -.043a11 11 0 0 1 -.047 -1.12c.018 -6.29 4.29 -9.997 13 -9.997h4.014a1 1 0 0 1 1 1l-.002 2.057c-.498 8.701 -4.74 12.943 -11.998 12.943h-2.631a16 16 0 0 0 -.375 2.11a1 1 0 1 1 -1.988 -.22q .174 -1.568 .58 -2.947l-.118 -.146l-.208 -.28l-.157 -.229l-.182 -.293l-.098 -.171l-.065 -.122a6 6 0 0 1 -.397 -.941l-.072 -.237l-.085 -.327l-.057 -.268l-.043 -.242zm8.539 -4.242c-2.845 1.265 -4.854 3.13 -6.108 5.583q .098 .2 .218 .4l.185 .281l.07 .097q .12 .164 .258 .329l.197 .224h.649c1.037 -2.271 2.777 -3.946 5.343 -5.086a1 1 0 0 0 -.812 -1.828" /></svg> */}
                        <h1 className='text-2xl font-semibold '>SosAgro 4C</h1>
                    </Link>
                    <ul className='hidden lg:flex gap-6 text-gray-700 tracking-tight text-sm'>
                        <li>Productos</li>
                        <li>Integraciones</li>
                        <li>Acerca de nosotros</li>
                        <li>Contacto</li>
                        <li>Dashboard</li>
                    </ul>
                    <div className='flex gap-4 items-center'>
                        <div className='border border-gray-200 rounded-full p-2'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                            </svg>
                        </div>
                        <div className='hidden lg:flex gap-2'>
                            <Link href="/login" className='hidden lg:inline-block px-4 py-2 rounded-2xl border border-gray-200 text-sm font-bold tracking-normal'>Iniciar sesion</Link>
                            <Link href="/instruments" className='hidden lg:inline-block px-4 py-2 rounded-2xl bg-green-400 text-sm font-bold tracking-normal'>Instrumentos</Link>
                            <Link href="/admin/instruments" className='hidden lg:inline-block px-4 py-2 rounded-2xl border border-green-700 text-green-700 text-sm font-bold tracking-normal'>Administrar</Link>
                        </div>
                        <button
                            type="button"
                            onClick={toggleMenu}
                            className='lg:hidden p-2 text-gray-700 transition-colors hover:bg-gray-100'
                            aria-controls="mobile-menu"
                            aria-expanded={isMenuOpen}
                            aria-label={isMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className={`size-7 transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : 'rotate-0'}`}
                            >
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            <div
                id="mobile-menu"
                aria-hidden={!isMenuOpen}
                className={`lg:hidden fixed mt-4 inset-0 z-40 bg-white transition-all duration-300 ease-in-out ${isMenuOpen
                    ? 'opacity-100 pointer-events-auto translate-y-0'
                    : 'opacity-0 pointer-events-none -translate-y-2'
                    }`}
            >
                <ul className='mt-16 px-6 [&>li]:py-4 text-lg tracking-tight border-t border-gray-100'>
                    <li>
                        <Link href="/#productos" onClick={closeMenu} className='block'>Productos</Link>
                    </li>
                    <li>
                        <Link href="/#integraciones" onClick={closeMenu} className='block'>Integraciones</Link>
                    </li>
                    <li>
                        <Link href="/#acerca" onClick={closeMenu} className='block'>Acerca de nosotros</Link>
                    </li>
                    <li>
                        <Link href="/#contacto" onClick={closeMenu} className='block'>Contacto</Link>
                    </li>
                    <li className='mt-4 rounded-2xl border border-gray-200 text-center text-sm font-bold tracking-normal'>
                        <Link href="/login" onClick={closeMenu} className='block px-4'>Iniciar sesion</Link>
                    </li>
                    <li className='mt-4 rounded-2xl bg-green-400 py-3 text-center text-sm font-bold tracking-normal'>
                        <Link href="/instruments" onClick={closeMenu} className='block'>Instrumentos</Link>
                    </li>
                    <li className='mt-2 rounded-2xl border border-green-700 py-3 text-center text-sm font-bold tracking-normal'>
                        <Link href="/admin/instruments" onClick={closeMenu} className='block text-green-700'>Administrar</Link>
                    </li>
                </ul>
            </div>
        </>
    )
}
