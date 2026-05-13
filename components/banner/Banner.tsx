import Image from "next/image"
import Link from "next/link"

export const Banner = () => {
    return (
        <div>
            <div className='lg:flex'>
                <div className="lg:w-[50%] 2xl:w-[60%] px-6 lg:pl-32 2xl:pl-64 lg:py-32 ">
                    <div className="max-w-max rounded-lg px-3 py-1 text-xs lg:text-sm border border-gray-200 mb-4 flex items-center font-medium">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2">
                        </div>
                        SGR · CTeI 2023–2024 · Código SIGP 108927

                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold  pr-12 lg:max-w-xl md:pr-0">Ciencia de datos y <span className="text-green-600">bioeconomia </span>
                        para el Campo Colombiano</h1>
                    <p className="mt-6 text-gray-500 font-light max-w-xl">Fortalecemos las capacidades científico-tecnológicas de los sectores de café, cacao, cannabis y cáñamo en seis departamentos del país, para impulsar una producción sostenible, competitiva e inclusiva.</p>
                    <Link href="/instrument" className="w-full md:max-w-max mt-6 bg-green-400 py-3 px-6 rounded-lg text-sm font-bold hover:bg-green-500 transition-colors md:mr-4 inline-block text-center">Conocer el proyecto</Link>
                    <button className="w-full md:max-w-max mt-4 bg-transparent py-3 px-6 rounded-lg text-sm font-bold hover:bg-green-500 transition-colors border ">Vincularse</button>

                </div>
                <div className="lg:w-[50%] 2xl:w-[40%] mt-12 md:mt-6 lg:mt-0">
                    <div className='bg-white w-full lg:h-full overflow-hidden'>
                        <Image src="/campesino.jpg" alt="campesino" width={1000} height={1000} className="w-full h-full object-cover" />
                        <Image src="/campesino2.jpg" alt="campesino2" width={1000} height={1000} className="w-full h-full object-cover lg:hidden" />
                    </div>
                </div >
            </div>
            {/* <div className="px-6 lg:pl-32 2xl:pl-64 lg:pt-6 text-xs mt-4 lg:mt-6 font-light text-gray-500 flex flex-col gap-4 ">
                <p>Instituciones vinculadas</p>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6">
                    <Image
                        src="/logos-institucionales/logo-itm.png"
                        alt="logo"
                        width={300}
                        height={300}
                        className="h-10 w-auto object-contain sm:h-10 md:h-18"
                    />
                    <Image
                        src="/logos-institucionales/logo-ufps.jpg"
                        alt="logo"
                        width={300}
                        height={300}
                        className="h-10 w-auto object-contain sm:h-10 md:h-16"
                    />
                    <Image
                        src="/logos-institucionales/logo-iue.png"
                        alt="logo"
                        width={300}
                        height={300}
                        className="h-10 w-auto object-contain sm:h-10 md:h-16"
                    />
                    <Image
                        src="/logos-institucionales/logo-uni-amazonia.png"
                        alt="logo"
                        width={300}
                        height={300}
                        className="h-10 w-auto object-contain sm:h-10 md:h-24"
                    />
                    <Image
                        src="/logos-institucionales/logo-uni-choco.png"
                        alt="logo"
                        width={300}
                        height={300}
                        className="h-10 w-auto object-contain sm:h-10 md:h-24"
                    />
                </div>
            </div> */}
        </div>
    )
}
