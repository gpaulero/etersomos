import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Membresías de Registros Akáshicos | Eter Somos",
  description: "Membresías mensuales con contenido exclusivo: meditaciones, lecturas y material espiritual nuevo cada mes en tu aula virtual.",
  alternates: { canonical: "https://www.etersomos.com/membresias" },
  openGraph: {
    title: "Membresías de Registros Akáshicos | Eter Somos",
    description: "Membresías mensuales con contenido exclusivo: meditaciones, lecturas y material espiritual nuevo cada mes en tu aula virtual.",
    url: "https://www.etersomos.com/membresias",
    siteName: "Eter Somos",
    locale: "es_AR",
    type: "website",
    images: [{ url: "https://www.etersomos.com/hero-bg-v2.webp", width: 1920, height: 1080, alt: "Eter Somos - Registros Akáshicos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Membresías de Registros Akáshicos | Eter Somos",
    description: "Membresías mensuales con contenido exclusivo: meditaciones, lecturas y material espiritual nuevo cada mes en tu aula virtual.",
    images: ["https://www.etersomos.com/hero-bg-v2.webp"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Inicio", url: "https://www.etersomos.com/" }, { name: "Membresías", url: "https://www.etersomos.com/membresias" }]} />
      {children}
    </>
  );
}
