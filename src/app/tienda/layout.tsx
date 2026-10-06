import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Tienda de Cristales y Minerales | Eter Somos",
  description: "Cristales y minerales elegidos intuitivamente para acompañar tu proceso energético. Envíos a todo el país.",
  alternates: { canonical: "https://www.etersomos.com/tienda" },
  openGraph: {
    title: "Tienda de Cristales y Minerales | Eter Somos",
    description: "Cristales y minerales elegidos intuitivamente para acompañar tu proceso energético. Envíos a todo el país.",
    url: "https://www.etersomos.com/tienda",
    siteName: "Eter Somos",
    locale: "es_AR",
    type: "website",
    images: [{ url: "https://www.etersomos.com/hero-bg-v2.webp", width: 1920, height: 1080, alt: "Eter Somos - Registros Akáshicos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tienda de Cristales y Minerales | Eter Somos",
    description: "Cristales y minerales elegidos intuitivamente para acompañar tu proceso energético. Envíos a todo el país.",
    images: ["https://www.etersomos.com/hero-bg-v2.webp"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Inicio", url: "https://www.etersomos.com/" }, { name: "Tienda", url: "https://www.etersomos.com/tienda" }]} />
      {children}
    </>
  );
}
