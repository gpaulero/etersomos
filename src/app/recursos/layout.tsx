import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = "https://www.etersomos.com";

export const metadata: Metadata = {
  title: "Recursos Espirituales Gratuitos",
  description:
    "Meditaciones, guías y contenidos con contribución voluntaria para tu expansión espiritual. Descargá recursos gratuitos y accedé a meditaciones guiadas.",
  alternates: {
    canonical: `${SITE_URL}/recursos`,
  },
  openGraph: {
    title: "Recursos Espirituales | Eter Somos",
    description:
      "Meditaciones, guías y contenidos gratuitos para tu camino espiritual.",
    url: `${SITE_URL}/recursos`,
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary",
    title: "Recursos Espirituales | Eter Somos",
    description:
      "Meditaciones y guías gratuitas para tu camino espiritual.",
  },
};

export default function RecursosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: SITE_URL },
          { name: "Recursos", url: `${SITE_URL}/recursos` },
        ]}
      />
      {children}
    </>
  );
}
