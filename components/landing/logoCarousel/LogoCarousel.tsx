const logos = [
  { src: "/logos-institucionales/logo-itm.png",         alt: "ITM" },
  { src: "/logos-institucionales/logo_minciencias.png",  alt: "Minciencias" },
  { src: "/logos-institucionales/logo-iue.png",          alt: "Institución Universitaria de Envigado" },
  { src: "/logos-institucionales/logo-ufps.png",         alt: "Universidad Francisco de Paula Santander Ocaña" },
  { src: "/logos-institucionales/logo-ufro.png",         alt: "Universidad de la Frontera" },
  { src: "/logos-institucionales/logo-uni-amazonia.png", alt: "Universidad de la Amazonia" },
  { src: "/logos-institucionales/logo-uni-choco.png",    alt: "Universidad Tecnológica del Chocó" },
];

export function LogoCarousel() {
  return (
    <div
      aria-label="Entidades aliadas"
      className="w-full overflow-hidden border-y border-gray-100 bg-white py-8"
    >
      {/*
        Two identical copies of the logo strip, each with symmetric px padding.
        This guarantees that -50% translateX == exactly one strip width,
        eliminating the gap-boundary jump that occurs when using flex gap.
      */}
      <div className="flex animate-marquee">
        {[0, 1].map((setIndex) => (
          <div key={setIndex} className="flex flex-shrink-0 items-center">
            {logos.map((logo) => (
              <div key={logo.src} className="flex-shrink-0 px-10 md:px-14">
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="h-14 w-auto max-w-[130px] object-contain grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
