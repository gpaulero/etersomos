import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cursos de Registros Akáshicos Online | Eter Somos",
  description: "Formación en Registros Akáshicos: Nivel 1 teórico y con práctica, Nivel 2 y formación completa. Aprendé a conectar y consultar tus propios Registros con acompañamiento 1:1.",
  alternates: { canonical: "https://www.etersomos.com/cursos" },
  openGraph: {
    title: "Cursos de Registros Akáshicos Online | Eter Somos",
    description: "Formación en Registros Akáshicos: Nivel 1 teórico y con práctica, Nivel 2 y formación completa. Aprendé a conectar y consultar tus propios Registros con acompañamiento 1:1.",
    url: "https://www.etersomos.com/cursos",
    siteName: "Eter Somos",
    locale: "es_AR",
    type: "website",
    images: [{ url: "https://www.etersomos.com/hero-bg-v2.webp", width: 1920, height: 1080, alt: "Eter Somos - Registros Akáshicos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cursos de Registros Akáshicos Online | Eter Somos",
    description: "Formación en Registros Akáshicos: Nivel 1 teórico y con práctica, Nivel 2 y formación completa. Aprendé a conectar y consultar tus propios Registros con acompañamiento 1:1.",
    images: ["https://www.etersomos.com/hero-bg-v2.webp"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
