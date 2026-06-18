import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CoursesJsonLd, BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = "https://www.etersomos.com";

export const metadata: Metadata = {
  title: "Cursos de Registros Akáshicos",
  description:
    "Formación completa en Registros Akáshicos: Nivel 1 Teórico (contribución voluntaria), Nivel 1 con Práctica ($35.000 ARS), Nivel 2 ($45.000 ARS) y pack de ambos cursos ($70.000 ARS). Con Fer Cardozo.",
  alternates: {
    canonical: `${SITE_URL}/cursos`,
  },
  openGraph: {
    title: "Cursos de Registros Akáshicos | Eter Somos",
    description:
      "Formación en Registros Akáshicos: desde Nivel 1 hasta Nivel 2 con práctica incluida.",
    url: `${SITE_URL}/cursos`,
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cursos de Registros Akáshicos | Eter Somos",
    description:
      "Formación completa en Registros Akáshicos con Fer Cardozo.",
  },
};

export default function CursosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-mystic-950">
      <CoursesJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: SITE_URL },
          { name: "Cursos", url: `${SITE_URL}/cursos` },
        ]}
      />
      {/* Top nav bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-mystic-950/80 border-b border-mystic-700/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mystic-900/60 border border-mystic-700/40 text-foreground/70 hover:text-gold-400 hover:border-gold-400/30 transition-all text-sm font-medium group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            Volver a Inicio
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-mystic-700/20 mt-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 text-center text-xs text-foreground/30">
          <p>Eter Somos &middot; Registros Ak&aacute;shicos</p>
        </div>
      </footer>
    </div>
  );
}
