import { ifct4c, subIndicators } from "../../../lib/landing-content";

export function Outcomes() {
  return (
    <section
      id="indicador"
      className="scroll-mt-24 border-t border-[#2f3d31] bg-[#a3e635] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#0b0f0c]/15 bg-[#0b0f0c]/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0b0f0c]">
            {ifct4c.name}
          </span>
          <h2 className="font-[family-name:var(--font-plataforma-narrow)] text-3xl font-bold tracking-tight text-balance text-[#0b0f0c] lg:text-5xl">
            {ifct4c.fullName}
          </h2>
          <p className="text-sm text-[#0b0f0c]/70 lg:text-base">
            {ifct4c.formula}
          </p>
        </div>

        <div className="mx-auto mt-10 flex max-w-md items-center justify-center gap-6 lg:mt-12">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-[#0b0f0c]/60">
              Línea base
            </p>
            <p className="font-[family-name:var(--font-plataforma-narrow)] text-4xl font-bold text-[#0b0f0c] lg:text-5xl">
              {ifct4c.baseline}
            </p>
          </div>
          <div className="h-px flex-1 bg-[#0b0f0c]/20" aria-hidden="true" />
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-[#0b0f0c]/60">
              Meta
            </p>
            <p className="font-[family-name:var(--font-plataforma-narrow)] text-4xl font-bold text-[#0b0f0c] lg:text-5xl">
              {ifct4c.target}
            </p>
          </div>
        </div>

        <ul
          role="list"
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3 lg:mt-16"
        >
          {subIndicators.map((sub) => (
            <li key={sub.key}>
              <article className="flex h-full flex-col gap-3 rounded-2xl border border-[#0b0f0c]/15 bg-[#0b0f0c] p-6">
                <p className="text-sm font-bold tracking-tight text-[#f4f7f2]">
                  {sub.name}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#8a9a8d]">
                    Base <b className="text-[#f4f7f2]">{sub.baseline}</b>
                  </span>
                  <span className="text-[#8a9a8d]" aria-hidden="true">
                    →
                  </span>
                  <span className="text-xs text-[#8a9a8d]">
                    Meta <b className="text-[#a3e635]">{sub.target}</b>
                  </span>
                </div>
                {sub.description ? (
                  <p className="text-xs leading-relaxed text-[#8a9a8d]">
                    {sub.description}
                  </p>
                ) : null}
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
