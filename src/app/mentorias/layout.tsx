import type { Metadata } from "next";
import { MentoriaJsonLd, BreadcrumbJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Mentorías en Registros Akáshicos | Eter Somos",
  description: "Mentorías 1:1 para lectores de Registros Akáshicos: integrá la lectura, ganá seguridad en tu canal y practicá acompañada por Fer Cardozo.",
  alternates: { canonical: "https://www.etersomos.com/mentorias" },
  openGraph: {
    title: "Mentorías en Registros Akáshicos | Eter Somos",
    description: "Mentorías 1:1 para lectores de Registros Akáshicos: integrá la lectura, ganá seguridad en tu canal y practicá acompañada por Fer Cardozo.",
    url: "https://www.etersomos.com/mentorias",
    siteName: "Eter Somos",
    locale: "es_AR",
    type: "website",
    images: [{ url: "https://www.etersomos.com/hero-bg-v2.webp", width: 1920, height: 1080, alt: "Eter Somos - Registros Akáshicos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mentorías en Registros Akáshicos | Eter Somos",
    description: "Mentorías 1:1 para lectores de Registros Akáshicos: integrá la lectura, ganá seguridad en tu canal y practicá acompañada por Fer Cardozo.",
    images: ["https://www.etersomos.com/hero-bg-v2.webp"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MentoriaJsonLd />
      <BreadcrumbJsonLd items={[{ name: "Inicio", url: "https://www.etersomos.com/" }, { name: "Mentorías", url: "https://www.etersomos.com/mentorias" }]} />
      {children}
    </>
  );
}
