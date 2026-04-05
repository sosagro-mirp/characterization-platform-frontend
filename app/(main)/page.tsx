import Image from 'next/image';
import { Banner } from '../../components/banner/Banner';

export default function Home() {
  return (
    <section className="mt-19 pt-12 lg:py-0  flex flex-col gap-6">
      <Banner />

      <div className='mt-6 lg:mt-24 flex flex-col justify-center items-center px-4'>
        <div className="max-w-max rounded-lg px-3 py-1 text-xs lg:text-sm border border-gray-200 mb-4 flex items-center font-medium">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2">
          </div>
          Lorem ipsum dolor
        </div>
        <h2 className='text-4xl lg:text-5xl font-bold text-center lg:max-w-xl'>Lorem ipsum dolor sit amet consectetur adipisicing elit.</h2>
        <p className='text-center text-gray-500 mt-6 text-sm lg:text-base lg:max-w-3xl'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <div className='w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mt-12 md:px-12 lg:px-0'>
          <div className='border border-gray-200 p-6 rounded-lg w-full shadow-lg'>
            <div className='rounded-md overflow-hidden h-72'>
              <Image src="/cafe.jpg" alt="campesino" width={200} height={200} className="w-full h-full object-cover" />
            </div>
            <h3 className='font-bold text-2xl mt-8'>Lorem ipsum dolor</h3>
            <p className='text-gray-500 text-sm'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </div>
          <div className='border border-gray-200 p-6 rounded-lg w-full shadow-lg' >
            <div className='rounded-md overflow-hidden h-72'>
              <Image src="/cafe.jpg" alt="campesino" width={200} height={200} className="w-full h-full object-cover" />
            </div>
            <h3 className='font-bold text-2xl mt-8'>Lorem ipsum dolor</h3>
            <p className='text-gray-500 text-sm'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </div>
        </div>
      </div>

      <div className='w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 lg:mt-0 '>
        <div className='border border-gray-200 p-6 rounded-lg w-full shadow-lg' >
          <div className='overflow-hidden w-16 h-16 rounded-full bg-green-200 flex items-center justify-center'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-green-500">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
            </svg>
          </div>
          <h3 className='font-bold text-2xl mt-8'>Lorem ipsum dolor</h3>
          <p className='text-gray-500 text-sm'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
        <div className='border border-gray-200 p-6 rounded-lg w-full shadow-lg' >
          <div className='overflow-hidden w-16 h-16 rounded-full bg-green-200 flex items-center justify-center'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-green-500">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
            </svg>

          </div>
          <h3 className='font-bold text-2xl mt-8'>Lorem ipsum dolor</h3>
          <p className='text-gray-500 text-sm'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
        <div className='border border-gray-200 p-6 rounded-lg w-full shadow-lg' >
          <div className='overflow-hidden w-16 h-16 rounded-full bg-green-200 flex items-center justify-center'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-green-500">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
            </svg>

          </div>
          <h3 className='font-bold text-2xl mt-8'>Lorem ipsum dolor</h3>
          <p className='text-gray-500 text-sm'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
      </div>

      <div className='px-4'>
        <div className='border border-gray-200 rounded-lg p-6 flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto lg:mt-24 lg:items-center'>
          <div className='lg:max-w-xs order-1'>
            <div className='bg-gray-200 rounded-md flex flex-col justify-center items-center p-6'>
              <div className='bg-white rounded-full p-4'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-green-500">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 0 1-1.161.886l-.143.048a1.107 1.107 0 0 0-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 0 1-1.652.928l-.679-.906a1.125 1.125 0 0 0-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 0 0-8.862 12.872M12.75 3.031a9 9 0 0 1 6.69 14.036m0 0-.177-.529A2.25 2.25 0 0 0 17.128 15H16.5l-.324-.324a1.453 1.453 0 0 0-2.328.377l-.036.073a1.586 1.586 0 0 1-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 0 1-5.276 3.67m0 0a9 9 0 0 1-10.275-4.835M15.75 9c0 .896-.393 1.7-1.016 2.25" />
                </svg>
              </div>
              <h3 className='font-bold text-lg my-4'>Lorem ipsum dolor</h3>
              <p className='text-gray-500 text-sm text-center'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
            <div className=' rounded-md flex flex-col justify-center items-center p-6'>
              <div className='bg-gray-200 rounded-full p-4'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-green-500">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 0 1-1.161.886l-.143.048a1.107 1.107 0 0 0-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 0 1-1.652.928l-.679-.906a1.125 1.125 0 0 0-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 0 0-8.862 12.872M12.75 3.031a9 9 0 0 1 6.69 14.036m0 0-.177-.529A2.25 2.25 0 0 0 17.128 15H16.5l-.324-.324a1.453 1.453 0 0 0-2.328.377l-.036.073a1.586 1.586 0 0 1-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 0 1-5.276 3.67m0 0a9 9 0 0 1-10.275-4.835M15.75 9c0 .896-.393 1.7-1.016 2.25" />
                </svg>
              </div>
              <h3 className='font-bold text-lg my-4'>Lorem ipsum dolor</h3>
              <p className='text-gray-500 text-sm text-center'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
          </div>
          <Image src="/celular4.png" alt="logo" width={1000} height={1000} className='w-full md:w-1/2 lg:w-1/3 md:mx-auto mt-8 p-6 order-3 lg:order-2' />
          <div className='lg:max-w-xs order-2 lg:order-3'>
            <div className='bg-gray-200 rounded-md flex flex-col justify-center items-center p-6'>
              <div className='bg-white rounded-full p-4'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-green-500">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 0 1-1.161.886l-.143.048a1.107 1.107 0 0 0-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 0 1-1.652.928l-.679-.906a1.125 1.125 0 0 0-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 0 0-8.862 12.872M12.75 3.031a9 9 0 0 1 6.69 14.036m0 0-.177-.529A2.25 2.25 0 0 0 17.128 15H16.5l-.324-.324a1.453 1.453 0 0 0-2.328.377l-.036.073a1.586 1.586 0 0 1-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 0 1-5.276 3.67m0 0a9 9 0 0 1-10.275-4.835M15.75 9c0 .896-.393 1.7-1.016 2.25" />
                </svg>
              </div>
              <h3 className='font-bold text-lg my-4'>Lorem ipsum dolor</h3>
              <p className='text-gray-500 text-sm text-center'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
            <div className='rounded-md flex flex-col justify-center items-center p-6'>
              <div className='bg-white rounded-full p-4'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-green-500">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 0 1-1.161.886l-.143.048a1.107 1.107 0 0 0-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 0 1-1.652.928l-.679-.906a1.125 1.125 0 0 0-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 0 0-8.862 12.872M12.75 3.031a9 9 0 0 1 6.69 14.036m0 0-.177-.529A2.25 2.25 0 0 0 17.128 15H16.5l-.324-.324a1.453 1.453 0 0 0-2.328.377l-.036.073a1.586 1.586 0 0 1-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 0 1-5.276 3.67m0 0a9 9 0 0 1-10.275-4.835M15.75 9c0 .896-.393 1.7-1.016 2.25" />
                </svg>
              </div>
              <h3 className='font-bold text-lg my-4'>Lorem ipsum dolor</h3>
              <p className='text-gray-500 text-sm text-center'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-6 lg:mt-24 flex flex-col justify-center items-center px-4'>
        <div className="max-w-max rounded-lg px-3 py-1 text-xs lg:text-sm border border-gray-200 mb-4 flex items-center font-medium">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2">
          </div>
          Lorem ipsum dolor
        </div>
        <h2 className='text-3xl lg:text-5xl font-bold text-center max-w-2xl'>Lorem ipsum dolor sit amet consectetur adipisicing elit.</h2>
        <p className='text-center text-gray-500 mt-6 text-sm lg:text-base'>Lorem ipsum dolor sit amet</p>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 lg:mt-12 max-w-6xl mx-auto mt-8'>
          <div className='border border-gray-200 p-6 rounded-lg'>
            <div className='flex items-center gap-1 '>
              <Image src="/campesino2.jpg" alt="campesino" width={100} height={100} className="rounded-full h-10 w-10 object-cover" />
              <div className='flex flex-col justify-center min-w-0'>
                <h3 className='font-bold text-xs ml-2'>Lorem ipsum dolor</h3>
                <p className='text-gray-500 text-xs ml-2'>Lorem ipsum dolor sit amet.</p>
              </div>
              <Image src="/logo-itm2.png" alt="campesino" width={100} height={100} className="h-9  object-cover ml-auto" />
            </div>
            <div>
              <p className='text-base mt-6'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus saepe ea ratione asperiores suscipit, dicta, exercitationem harum odit accusantium reiciendis tempore eaque pariatur? Adipisci minus nobis ipsa, est assumenda non.</p>
            </div>
            <div className='flex gap-2 text-xs mt-6 text-gray-700 [&>p]:bg-gray-100 [&>p]:p-2 [&>p]:rounded-lg'>
              <p>Research</p>
              <p>Development</p>
            </div>
          </div>
          <div className='border border-gray-200 p-6 rounded-lg'>
            <div className='flex items-center gap-1'>
              <Image src="/campesino2.jpg" alt="campesino" width={100} height={100} className="rounded-full h-10 w-10 object-cover" />
              <div className='flex flex-col justify-center min-w-0'>
                <h3 className='font-bold text-xs ml-2'>Lorem ipsum dolor</h3>
                <p className='text-gray-500 text-xs ml-2'>Lorem ipsum dolor sit amet.</p>
              </div>
              <Image src="/logo-itm2.png" alt="campesino" width={100} height={100} className="rounded-full h-9 object-cover ml-auto" />
            </div>
            <div>
              <p className='text-base mt-6'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus saepe ea ratione asperiores suscipit, dicta, exercitationem harum odit accusantium reiciendis tempore eaque pariatur? Adipisci minus nobis ipsa, est assumenda non.</p>
            </div>
            <div className='flex gap-2 text-xs mt-6 text-gray-700 [&>p]:bg-gray-100 [&>p]:p-2 [&>p]:rounded-lg'>
              <p>Research</p>
              <p>Development</p>
            </div>
          </div>
        </div>
      </div>

      <div className=" bg-green-900 py-12 lg:py-32 px-4 lg:mt-24">
        <h1 className="text-white text-4xl md:text-4xl lg:text-5xl  font-bold capitalize text-center max-w-3xl mx-auto">Lorem ipsum, dolor sit amet consectetur adipisicing elit</h1>
        <p className="mt-6 text-center px-4 text-gray-200 font-light max-w-xl mx-auto">Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.</p>
        <div className="flex justify-center">
          <button className="w-full md:max-w-max mt-6 bg-green-400 py-3 px-6 rounded-lg text-sm font-bold hover:bg-green-500 transition-colors">Empecemos</button>
        </div>
      </div>
    </section >
  );
}
