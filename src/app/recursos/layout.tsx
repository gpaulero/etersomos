import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Recursos Espirituales Gratuitos | Eter Somos",
  description: "Meditaciones guiadas, PDFs y recursos espirituales gratuitos para tu camino de autoconocimiento. Descargalos o escuchalos online.",
  alternates: { canonical: "https://www.etersomos.com/recursos" },
  openGraph: {
    title: "Recursos Espirituales Gratuitos | Eter Somos",
    description: "Meditaciones guiadas, PDFs y recursos espirituales gratuitos para tu camino de autoconocimiento. Descargalos o escuchalos online.",
    url: "https://www.etersomos.com/recursos",
    siteName: "Eter Somos",
    locale: "es_AR",
    type: "website",
    images: [{ url: "https://www.etersomos.com/hero-bg-v2.webp", width: 1920, height: 1080, alt: "Eter Somos - Registros Akáshicos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Recursos Espirituales Gratuitos | Eter Somos",
    description: "Meditaciones guiadas, PDFs y recursos espirituales gratuitos para tu camino de autoconocimiento. Descargalos o escuchalos online.",
    images: ["https://www.etersomos.com/hero-bg-v2.webp"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Inicio", url: "https://www.etersomos.com/" }, { name: "Recursos", url: "https://www.etersomos.com/recursos" }]} />
      {children}
    </>
  );
}
