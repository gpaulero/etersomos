import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Membresías Eter Somos | Suscripción de Contenido Espiritual",
  description:
    "Tres caminos de conexión y expansión espiritual. Suscribite a Raíz de Luz, Corazón Solar o Puente Estelar y recibí contenido exclusivo cada mes.",
};

export default function MembresiasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-mystic-950">
      {/* Top nav bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-mystic-950/80 border-b border-mystic-700/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center">
          <Link
            href="/#membresias"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mystic-900/60 border border-mystic-700/40 text-foreground/70 hover:text-gold-400 hover:border-gold-400/30 transition-all text-sm font-medium group"
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
