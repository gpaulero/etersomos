import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = "https://www.etersomos.com";

export const metadata: Metadata = {
  title: "Membresías Espirituales",
  description:
    "Tres caminos de conexión y expansión espiritual: Raíz de Luz, Corazón Solar y Puente Estelar. Recibí contenido exclusivo cada mes desde $5.000 ARS/mes.",
  alternates: {
    canonical: `${SITE_URL}/membresias`,
  },
  openGraph: {
    title: "Membresías Espirituales | Eter Somos",
    description:
      "Suscribite a Raíz de Luz, Corazón Solar o Puente Estelar y recibí contenido espiritual exclusivo cada mes.",
    url: `${SITE_URL}/membresias`,
    type: "website",
    locale: "es_AR",
    images: [
      {
        url: `${SITE_URL}/images/membresias-bg.webp`,
        width: 1200,
        height: 630,
        alt: "Membresías Eter Somos — Contenido Espiritual Exclusivo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Membresías Espirituales | Eter Somos",
    description:
      "Suscribite a contenido espiritual exclusivo cada mes.",
  },
};

export default function MembresiasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-mystic-950">
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: SITE_URL },
          { name: "Membresías", url: `${SITE_URL}/membresias` },
        ]}
      />
      {/* Top nav bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-mystic-950/80 border-b border-mystic-700/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center">
          <Link
            href="/#membresias"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mystic-900/60 border border-mystic-700/40 text-foreground/70 hover:text-violet-400 hover:border-violet-400/30 transition-all text-sm font-medium group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-mystic-700/20 mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-center text-xs text-foreground/30">
          <p>Eter Somos &middot; Registros Ak&aacute;shicos</p>
        </div>
      </footer>
    </div>
  );
}
