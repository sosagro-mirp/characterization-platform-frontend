export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-brand-dark flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono uppercase tracking-widest text-white/40">
            SOS Agro 4C
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Plataforma en mantenimiento
          </h1>
        </div>

        <p className="text-base text-white/70 text-pretty leading-relaxed">
          Estamos realizando actualizaciones para mejorar la plataforma.
          Volveremos a estar disponibles en breve.
        </p>

        <div className="w-12 h-px bg-white/20" aria-hidden="true" />

        <p className="text-xs text-white/40">
          Si tienes dudas, escríbenos a{" "}
          <a
            href="mailto:sosagro4c@itm.edu.co"
            className="underline underline-offset-2 hover:text-white/70 transition-colors"
          >
            sosagro4c@itm.edu.co
          </a>
        </p>
      </div>
    </main>
  );
}
