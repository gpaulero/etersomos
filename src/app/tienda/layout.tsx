import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = "https://www.etersomos.com";

export const metadata: Metadata = {
  title: "Tienda de Cristales Energéticos",
  description:
    "Cristales seleccionados con amor e intención: Amatista, Cuarzo Rosa, Cuarzo Claro, Citrino, Turmalina Negra y Selinita. Envío a toda Argentina por MercadoPago.",
  alternates: {
    canonical: `${SITE_URL}/tienda`,
  },
  openGraph: {
    title: "Tienda de Cristales Energéticos | Eter Somos",
    description:
      "Cristales seleccionados con amor e intención para tu camino espiritual. Envío a toda Argentina.",
    url: `${SITE_URL}/tienda`,
    type: "website",
    locale: "es_AR",
    images: [
      {
        url: `${SITE_URL}/images/crystals-banner.webp`,
        width: 1200,
        height: 630,
        alt: "Tienda de Cristales Energéticos — Eter Somos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tienda de Cristales | Eter Somos",
    description:
      "Cristales seleccionados con amor para tu camino espiritual. Envío a toda Argentina.",
  },
};

export default function TiendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: SITE_URL },
          { name: "Tienda de Cristales", url: `${SITE_URL}/tienda` },
        ]}
      />
      {children}
    </>
  );
}
