import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = "https://www.etersomos.com";

export const metadata: Metadata = {
  title: "Ambos Cursos — Pack Nivel 1 + Nivel 2 Registros Akáshicos",
  description:
    "Pack completo: Nivel 1 + Nivel 2 de Registros Akáshicos con el mejor precio. $70.000 ARS / US$55. Formación integral con Fer Cardozo.",
  alternates: {
    canonical: `${SITE_URL}/cursos/ambos`,
  },
  openGraph: {
    title: "Ambos Cursos — Pack Completo | Eter Somos",
    description:
      "Pack Nivel 1 + Nivel 2 de Registros Akáshicos. $70.000 ARS / US$55.",
    url: `${SITE_URL}/cursos/ambos`,
    type: "website",
    locale: "es_AR",
  },
};

export default function AmbosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: SITE_URL },
          { name: "Cursos", url: `${SITE_URL}/cursos` },
          { name: "Ambos Cursos", url: `${SITE_URL}/cursos/ambos` },
        ]}
      />
      {children}
    </>
  );
}
