import type { Metadata } from "next";
import { PlataformaLandingPage } from "@/components/landing/plataforma/PlataformaLandingPage";

export const metadata: Metadata = {
  title: "Propuesta Plataforma — SOS Agro 4C",
  robots: { index: false, follow: false },
};

export default function PlataformaProposalPage() {
  return <PlataformaLandingPage />;
}
