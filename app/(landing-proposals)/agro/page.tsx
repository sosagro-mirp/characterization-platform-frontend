import type { Metadata } from "next";
import { AgroLandingPage } from "@/components/landing/agro/AgroLandingPage";

export const metadata: Metadata = {
  title: "Propuesta Agro — SOS Agro 4C",
  robots: { index: false, follow: false },
};

export default function AgroProposalPage() {
  return <AgroLandingPage />;
}
