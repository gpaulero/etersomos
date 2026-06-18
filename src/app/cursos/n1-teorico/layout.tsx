import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = "https://www.etersomos.com";

export const metadata: Metadata = {
  title: "1er Nivel Solo Teórico — Registros Akáshicos",
  description:
    "Curso de introducción a los Registros Akáshicos. Aprendé los fundamentos teóricos de la lectura akáshica con Fer Cardozo. Contribución voluntaria.",
  alternates: {
    canonical: `${SITE_URL}/cursos/n1-teorico`,
  },
  openGraph: {
    title: "1er Nivel Solo Teórico — Registros Akáshicos | Eter Somos",
    description:
      "Curso introductorio de Registros Akáshicos. Contribución voluntaria.",
    url: `${SITE_URL}/cursos/n1-teorico`,
    type: "website",
    locale: "es_AR",
  },
};

export default function N1TeoricoLayout({
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
          { name: "N1 Teórico", url: `${SITE_URL}/cursos/n1-teorico` },
        ]}
      />
      {children}
    </>
  );
}
