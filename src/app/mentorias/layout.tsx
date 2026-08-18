import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MentoriaJsonLd, BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = "https://www.etersomos.com";

export const metadata: Metadata = {
  title: "Mentorías para Lectores Akáshicos",
  description:
    "Mentorías individuales por videollamada para graduados de Nivel 1 y 2. Sesión individual $20.000 ARS o pack 3+ sesiones $15.000 ARS/sesión. Acompañamiento personalizado con Fer Cardozo.",
  alternates: {
    canonical: `${SITE_URL}/mentorias`,
  },
  openGraph: {
    title: "Mentorías para Lectores Akáshicos | Eter Somos",
    description:
      "Mentorías individuales por videollamada para graduados de Registros Akáshicos.",
    url: `${SITE_URL}/mentorias`,
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary",
    title: "Mentorías Akáshicas | Eter Somos",
    description:
      "Mentorías individuales para graduados de Registros Akáshicos.",
  },
};

export default function MentoriasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-mystic-950">
      <MentoriaJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: SITE_URL },
          { name: "Mentorías", url: `${SITE_URL}/mentorias` },
        ]}
      />
      {/* Top nav bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-mystic-950/80 border-b border-mystic-700/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mystic-900/60 border border-mystic-700/40 text-foreground/70 hover:text-violet-400 hover:border-violet-400/30 transition-all text-sm font-medium group"
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
