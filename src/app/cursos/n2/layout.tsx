import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Curso Nivel 2 de Registros Akáshicos | Eter Somos",
  description: "Aprendé a consultar los Registros Akáshicos de otras personas: formación Nivel 2 con práctica incluida y acompañamiento personalizado.",
  alternates: { canonical: "https://www.etersomos.com/cursos/n2" },
  openGraph: {
    title: "Curso Nivel 2 de Registros Akáshicos | Eter Somos",
    description: "Aprendé a consultar los Registros Akáshicos de otras personas: formación Nivel 2 con práctica incluida y acompañamiento personalizado.",
    url: "https://www.etersomos.com/cursos/n2",
    siteName: "Eter Somos",
    locale: "es_AR",
    type: "website",
    images: [{ url: "https://www.etersomos.com/hero-bg-v2.webp", width: 1920, height: 1080, alt: "Eter Somos - Registros Akáshicos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Curso Nivel 2 de Registros Akáshicos | Eter Somos",
    description: "Aprendé a consultar los Registros Akáshicos de otras personas: formación Nivel 2 con práctica incluida y acompañamiento personalizado.",
    images: ["https://www.etersomos.com/hero-bg-v2.webp"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
