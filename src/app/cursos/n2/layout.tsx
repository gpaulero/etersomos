import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = "https://www.etersomos.com";

export const metadata: Metadata = {
  title: "2do Nivel Completo — Registros Akáshicos",
  description:
    "Curso avanzado de Registros Akáshicos Nivel 2. Profundizá tu práctica akáshica con Fer Cardozo. $45.000 ARS / US$45. 10% descuento si ya completaste Nivel 1.",
  alternates: {
    canonical: `${SITE_URL}/cursos/n2`,
  },
  openGraph: {
    title: "2do Nivel Completo — Registros Akáshicos | Eter Somos",
    description:
      "Curso avanzado Nivel 2 de Registros Akáshicos. $45.000 ARS / US$45.",
    url: `${SITE_URL}/cursos/n2`,
    type: "website",
    locale: "es_AR",
  },
};

export default function N2Layout({
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
          { name: "N2 Completo", url: `${SITE_URL}/cursos/n2` },
        ]}
      />
      {children}
    </>
  );
}
