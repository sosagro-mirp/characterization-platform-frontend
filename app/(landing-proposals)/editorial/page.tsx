import type { Metadata } from "next";
import { EditorialLandingPage } from "@/components/landing/editorial/EditorialLandingPage";

export const metadata: Metadata = {
  title: "Propuesta Editorial — SOS Agro 4C",
  robots: { index: false, follow: false },
};

export default function EditorialProposalPage() {
  return <EditorialLandingPage />;
}
