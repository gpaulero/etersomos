import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Curso Nivel 2 de Registros Akáshicos | Eter Somos",
  description: "Formación en Registros Akáshicos Nivel 2 con acompañamiento 1:1 de Fer Cardozo. Materiales, práctica y aula virtual incluida.",
  alternates: { canonical: "https://www.etersomos.com/cursos/n2" },
  openGraph: {
    title: "Curso Nivel 2 de Registros Akáshicos | Eter Somos",
    description: "Formación en Registros Akáshicos Nivel 2 con acompañamiento 1:1 de Fer Cardozo. Materiales, práctica y aula virtual incluida.",
    url: "https://www.etersomos.com/cursos/n2",
    siteName: "Eter Somos",
    locale: "es_AR",
    type: "website",
    images: [{ url: "https://www.etersomos.com/hero-bg-v2.webp", width: 1920, height: 1080, alt: "Eter Somos - Registros Akáshicos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Curso Nivel 2 de Registros Akáshicos | Eter Somos",
    description: "Formación en Registros Akáshicos Nivel 2 con acompañamiento 1:1 de Fer Cardozo. Materiales, práctica y aula virtual incluida.",
    images: ["https://www.etersomos.com/hero-bg-v2.webp"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Inicio", url: "https://www.etersomos.com/" }, { name: "Cursos", url: "https://www.etersomos.com/cursos" }, { name: "Nivel 2", url: "https://www.etersomos.com/cursos/n2" }]} />
      {children}
    </>
  );
}
