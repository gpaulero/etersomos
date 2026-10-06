import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Curso Nivel 1 con Práctica de Registros Akáshicos | Eter Somos",
  description: "Formación Nivel 1 con práctica incluida: teoría completa más 2 clases prácticas 1:1 para aprender a consultar tus propios Registros Akáshicos.",
  alternates: { canonical: "https://www.etersomos.com/cursos/n1-practica" },
  openGraph: {
    title: "Curso Nivel 1 con Práctica de Registros Akáshicos | Eter Somos",
    description: "Formación Nivel 1 con práctica incluida: teoría completa más 2 clases prácticas 1:1 para aprender a consultar tus propios Registros Akáshicos.",
    url: "https://www.etersomos.com/cursos/n1-practica",
    siteName: "Eter Somos",
    locale: "es_AR",
    type: "website",
    images: [{ url: "https://www.etersomos.com/hero-bg-v2.webp", width: 1920, height: 1080, alt: "Eter Somos - Registros Akáshicos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Curso Nivel 1 con Práctica de Registros Akáshicos | Eter Somos",
    description: "Formación Nivel 1 con práctica incluida: teoría completa más 2 clases prácticas 1:1 para aprender a consultar tus propios Registros Akáshicos.",
    images: ["https://www.etersomos.com/hero-bg-v2.webp"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
