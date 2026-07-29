const logos = [
  { src: "/logos-institucionales/logo-itm-vertical.png", alt: "ITM" },
  { src: "/logos-institucionales/logo-minciencias.png",  alt: "Minciencias", scale: 1.2 },
  { src: "/logos-institucionales/logo-envigado-sello.png", alt: "Institución Universitaria de Envigado", scale: 1.15 },
  { src: "/logos-institucionales/logo-ufps.png",         alt: "Universidad Francisco de Paula Santander Ocaña", scale: 1.15 },
  { src: "/logos-institucionales/logo-ufro.png",         alt: "Universidad de la Frontera" },
  { src: "/logos-institucionales/logo-uni-amazonia.png", alt: "Universidad de la Amazonia", scale: 1.15 },
  { src: "/logos-institucionales/logo-uni-choco.png",    alt: "Universidad Tecnológica del Chocó", scale: 1.15 },
  { src: "/logos-institucionales/logo-natucafe.png",     alt: "Natucafé" },
  { src: "/logos-institucionales/logo-terracan-colombia.png", alt: "Terra Cann Colombia", scale: 1.15 },
  { src: "/logos-institucionales/logo-gentech.png",      alt: "Gentech Biosciences" },
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
              <div key={logo.src} className="flex-shrink-0 px-6 md:px-8">
                {/*
                  Fixed-size box (not h-* w-auto): every logo occupies the same
                  footprint regardless of its own aspect ratio, so a wide lockup
                  (ITM) and a narrow/portrait mark (Gentech, UFPS) read as the
                  same "size" in the row instead of the wide one dominating it.
                */}
                <div className="flex h-14 w-28 md:h-16 md:w-32 items-center justify-center">
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    style={logo.scale ? { transform: `scale(${logo.scale})` } : undefined}
                    className="max-h-full max-w-full object-contain grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100"
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
