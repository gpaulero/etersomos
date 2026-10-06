import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Curso Formación Completa de Registros Akáshicos | Eter Somos",
  description: "Formación en Registros Akáshicos Formación Completa con acompañamiento 1:1 de Fer Cardozo. Materiales, práctica y aula virtual incluida.",
  alternates: { canonical: "https://www.etersomos.com/cursos/ambos" },
  openGraph: {
    title: "Curso Formación Completa de Registros Akáshicos | Eter Somos",
    description: "Formación en Registros Akáshicos Formación Completa con acompañamiento 1:1 de Fer Cardozo. Materiales, práctica y aula virtual incluida.",
    url: "https://www.etersomos.com/cursos/ambos",
    siteName: "Eter Somos",
    locale: "es_AR",
    type: "website",
    images: [{ url: "https://www.etersomos.com/hero-bg-v2.webp", width: 1920, height: 1080, alt: "Eter Somos - Registros Akáshicos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Curso Formación Completa de Registros Akáshicos | Eter Somos",
    description: "Formación en Registros Akáshicos Formación Completa con acompañamiento 1:1 de Fer Cardozo. Materiales, práctica y aula virtual incluida.",
    images: ["https://www.etersomos.com/hero-bg-v2.webp"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Inicio", url: "https://www.etersomos.com/" }, { name: "Cursos", url: "https://www.etersomos.com/cursos" }, { name: "Formación Completa", url: "https://www.etersomos.com/cursos/ambos" }]} />
      {children}
    </>
  );
}
