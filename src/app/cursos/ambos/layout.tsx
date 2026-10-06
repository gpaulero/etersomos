import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Formación Completa en Registros Akáshicos | Eter Somos",
  description: "Nivel 1 y Nivel 2 completos: formación integral en Registros Akáshicos con práctica 1:1, materiales y acompañamiento de Fer Cardozo.",
  alternates: { canonical: "https://www.etersomos.com/cursos/ambos" },
  openGraph: {
    title: "Formación Completa en Registros Akáshicos | Eter Somos",
    description: "Nivel 1 y Nivel 2 completos: formación integral en Registros Akáshicos con práctica 1:1, materiales y acompañamiento de Fer Cardozo.",
    url: "https://www.etersomos.com/cursos/ambos",
    siteName: "Eter Somos",
    locale: "es_AR",
    type: "website",
    images: [{ url: "https://www.etersomos.com/hero-bg-v2.webp", width: 1920, height: 1080, alt: "Eter Somos - Registros Akáshicos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Formación Completa en Registros Akáshicos | Eter Somos",
    description: "Nivel 1 y Nivel 2 completos: formación integral en Registros Akáshicos con práctica 1:1, materiales y acompañamiento de Fer Cardozo.",
    images: ["https://www.etersomos.com/hero-bg-v2.webp"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
