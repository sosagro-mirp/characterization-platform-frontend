/**
 * Spec 79 — layout mínimo del canal público. Sin PollsterNav (esa barra
 * ofrece navegación a rutas autenticadas: "Salir de la encuesta" → /campaign,
 * enlaces al panel) ni ningún otro chrome de la aplicación interna. El
 * encabezado de marca vive dentro de InstrumentQuestionFlow/
 * PublicConsentStep, igual que en el flujo de encuestador.
 */
export default function PublicSurveyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
