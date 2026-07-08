import type { Metadata } from 'next';
import { Hero } from '../../components/landing/hero/Hero';
import { LogoCarousel } from '../../components/landing/logoCarousel/LogoCarousel';
import { Crops } from '../../components/landing/crops/Crops';
import { Territories } from '../../components/landing/territories/Territories';
import { Axes } from '../../components/landing/axes/Axes';
import { Participation } from '../../components/landing/participation/Participation';
import { Outcomes } from '../../components/landing/outcomes/Outcomes';
import { ResearchGroups } from '../../components/landing/researchGroups/ResearchGroups';
import { DashboardCta } from '../../components/landing/dashboard-cta/DashboardCta';
import { project } from '../../lib/landing-content';

export const metadata: Metadata = {
  title: 'SOS Agro 4C — Ciencia de datos para el campo colombiano',
  description:
    'Plataforma del proyecto SIGP 108927: caracterización agrícola, IoT y ciencia de datos para café, cacao, cannabis y cáñamo en Antioquia, Caquetá, Chocó, La Guajira, Meta y Norte de Santander.',
  keywords: [
    'SOS Agro 4C',
    'SIGP 108927',
    'ITM',
    'Minciencias',
    'Sistema General de Regalías',
    'ciencia de datos agrícola',
    'IoT agrícola',
    'café',
    'cacao',
    'cannabis',
    'cáñamo',
    'caracterización agrícola',
    'Colombia',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: '/',
    siteName: 'SOS Agro 4C',
    title: 'SOS Agro 4C — Ciencia de datos para el campo colombiano',
    description:
      'Fortaleciendo las capacidades científico-tecnológicas de los sectores del café, cacao, cannabis y cáñamo en seis departamentos de Colombia.',
    images: [
      {
        url: '/og/og-default.png',
        width: 1200,
        height: 630,
        alt: 'SOS Agro 4C — Proyecto SIGP 108927',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SOS Agro 4C',
    description:
      'Ciencia de datos, IoT y bioeconomía para café, cacao, cannabis y cáñamo en Colombia.',
    images: ['/og/og-default.png'],
  },
};

const projectJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ResearchProject',
  name: project.shortName,
  alternateName: project.fullName,
  identifier: `SIGP ${project.sigpCode}`,
  description: project.generalObjective,
  funder: {
    '@type': 'GovernmentOrganization',
    name: 'Sistema General de Regalías de Colombia',
  },
  sponsor: {
    '@type': 'GovernmentOrganization',
    name: 'Ministerio de Ciencia, Tecnología e Innovación (Minciencias)',
  },
  parentOrganization: {
    '@type': 'CollegeOrUniversity',
    name: project.proponent,
  },
  areaServed: [
    'Antioquia',
    'Caquetá',
    'Chocó',
    'La Guajira',
    'Meta',
    'Norte de Santander',
  ],
};

export default function Home() {
  return (
    <main className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />
      <Hero />
      <LogoCarousel />
      <Crops />
      <Territories />
      <Axes />
      <Outcomes />
      <ResearchGroups />
      <DashboardCta />
      <Participation />
    </main>
  );
}
