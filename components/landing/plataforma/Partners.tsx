import { partners } from "../../../lib/landing-content";

const proponente = partners.find((p) => p.role === "proponente");
const rest = partners.filter((p) => p.role !== "proponente");

export function Partners() {
  return (
    <section className="border-b border-[#2f3d31] bg-[#0b0f0c] py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[11px] font-bold uppercase tracking-wider text-[#8a9a8d]">
          {proponente?.name} coordina un proyecto respaldado por {partners.length}{" "}
          entidades de cuádruple hélice
        </p>

        <ul
          role="list"
          className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        >
          {rest.map((p) => (
            <li
              key={p.slug}
              className="text-sm font-bold tracking-tight text-[#8a9a8d] transition-colors hover:text-[#f4f7f2]"
              title={p.name}
            >
              {p.shortName ?? p.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
