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
      <div className="flex w-max animate-marquee items-center gap-12 md:gap-16">
        {[...logos, ...logos].map((logo, i) => (
          <img
            key={`${logo.src}-${i < logos.length ? "a" : "b"}`}
            src={logo.src}
            alt={logo.alt}
            className="h-10 w-auto object-contain grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100"
          />
        ))}
      </div>
    </div>
  );
}
