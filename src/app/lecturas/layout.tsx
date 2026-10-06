import type { Metadata } from "next";
import { LecturaJsonLd, BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = "https://www.etersomos.com";

export const metadata: Metadata = {
  title: "Lectura de Registros Akáshicos",
  description:
    "Solicitá tu lectura personalizada del Campo Akáshico con Fer Cardozo. Respuestas grabadas en audio a 2 preguntas de tu alma. $20.000 ARS / US$20. Desde Córdoba al mundo.",
  alternates: {
    canonical: `${SITE_URL}/lecturas`,
  },
  openGraph: {
    title: "Lectura de Registros Akáshicos | Eter Somos",
    description:
      "Accedé a la sabiduría de tu alma. Lectura akáshica personalizada en audio con Fer Cardozo.",
    url: `${SITE_URL}/lecturas`,
    type: "website",
    locale: "es_AR",
    images: [
      {
        url: `${SITE_URL}/images/akashic-bg.png`,
        width: 1200,
        height: 630,
        alt: "Lectura de Registros Akáshicos — Eter Somos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lectura de Registros Akáshicos | Eter Somos",
    description:
      "Accedé a la sabiduría de tu alma. Lectura akáshica personalizada en audio.",
  },
};

export default function LecturasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LecturaJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: SITE_URL },
          { name: "Lecturas Akáshicas", url: `${SITE_URL}/lecturas` },
        ]}
      />
      {children}
    </>
  );
}
