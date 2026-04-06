import Image from "next/image"

export const Banner = () => {
    return (
        <div className='lg:flex'>
            <div className="lg:w-[50%] 2xl:w-[60%] px-6 lg:pl-32 2xl:pl-64 lg:pt-32 ">
                <div className="max-w-max rounded-lg px-3 py-1 text-xs lg:text-sm border border-gray-200 mb-4 flex items-center font-medium">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2">
                    </div>
                    Lorem ipsum dolor
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold capitalize pr-12 lg:max-w-xl md:pr-0">Lorem ipsum, dolor sit amet consectetur adipisicing elit</h1>
                <p className="mt-6 text-gray-500 font-light max-w-xl">Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.</p>
                <button className="w-full md:max-w-max mt-6 bg-green-400 py-3 px-6 rounded-lg text-sm font-bold hover:bg-green-500 transition-colors md:mr-4">Empecemos</button>
                <button className="w-full md:max-w-max mt-4 bg-transparent py-3 px-6 rounded-lg text-sm font-bold hover:bg-green-500 transition-colors border ">Lorem ipsum dolor</button>
                <div className="text-xs mt-4 lg:mt-6 font-light text-gray-500 flex flex-col gap-4 ">
                    <p>Lorem ipsum dolor sit amet.</p>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6">
                        <Image
                            src="/logo-itm2.png"
                            alt="logo"
                            width={300}
                            height={300}
                            className="h-10 w-auto object-contain sm:h-10 md:h-18"
                        />
                        <Image
                            src="/logo-itm2.png"
                            alt="logo"
                            width={300}
                            height={300}
                            className="h-10 w-auto object-contain sm:h-10 md:h-18"
                        />
                        <Image
                            src="/logo-itm2.png"
                            alt="logo"
                            width={300}
                            height={300}
                            className="h-10 w-auto object-contain sm:h-10 md:h-18"
                        />
                    </div>
                </div>
            </div>
            <div className="lg:w-[50%] 2xl:w-[40%] mt-12 md:mt-6 lg:mt-0">
                <div className='bg-white w-full lg:h-full overflow-hidden'>
                    <Image src="/campesino.jpg" alt="campesino" width={1000} height={1000} className="w-full h-full object-cover" />
                    <Image src="/campesino2.jpg" alt="campesino2" width={1000} height={1000} className="w-full h-full object-cover lg:hidden" />
                </div>
            </div >
        </div>
    )
}
