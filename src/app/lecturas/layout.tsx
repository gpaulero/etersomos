import type { Metadata } from "next";
import { LecturaJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Lecturas Akáshicas Online | Eter Somos",
  description: "Pedí tu lectura akáshica personalizada en audio. Recibila en tu aula virtual, escuchala cuando quieras y acompañala con una guía en PDF. Lecturas de Registros Akáshicos por Fer Cardozo.",
  alternates: { canonical: "https://www.etersomos.com/lecturas" },
  openGraph: {
    title: "Lecturas Akáshicas Online | Eter Somos",
    description: "Pedí tu lectura akáshica personalizada en audio. Recibila en tu aula virtual, escuchala cuando quieras y acompañala con una guía en PDF. Lecturas de Registros Akáshicos por Fer Cardozo.",
    url: "https://www.etersomos.com/lecturas",
    siteName: "Eter Somos",
    locale: "es_AR",
    type: "website",
    images: [{ url: "https://www.etersomos.com/hero-bg-v2.webp", width: 1920, height: 1080, alt: "Eter Somos - Registros Akáshicos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lecturas Akáshicas Online | Eter Somos",
    description: "Pedí tu lectura akáshica personalizada en audio. Recibila en tu aula virtual, escuchala cuando quieras y acompañala con una guía en PDF. Lecturas de Registros Akáshicos por Fer Cardozo.",
    images: ["https://www.etersomos.com/hero-bg-v2.webp"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LecturaJsonLd />
      {children}
    </>
  );
}
