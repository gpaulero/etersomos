import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = "https://www.etersomos.com";

export const metadata: Metadata = {
  title: "1er Nivel con Práctica — Registros Akáshicos",
  description:
    "Curso completo de Registros Akáshicos Nivel 1 con práctica incluida. El más elegido por los alumnos. $35.000 ARS / US$30. Con Fer Cardozo.",
  alternates: {
    canonical: `${SITE_URL}/cursos/n1-practica`,
  },
  openGraph: {
    title: "1er Nivel con Práctica — Registros Akáshicos | Eter Somos",
    description:
      "Curso completo Nivel 1 con práctica incluida. $35.000 ARS / US$30.",
    url: `${SITE_URL}/cursos/n1-practica`,
    type: "website",
    locale: "es_AR",
  },
};

export default function N1PracticaLayout({
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
          { name: "N1 con Práctica", url: `${SITE_URL}/cursos/n1-practica` },
        ]}
      />
      {children}
    </>
  );
}
