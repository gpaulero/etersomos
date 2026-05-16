import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-mystic-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <Sparkles className="size-12 text-gold-400 mx-auto mb-4" />
          <h1 className="text-8xl font-serif font-bold text-gold-400 mb-2">404</h1>
          <p className="text-foreground/60 text-lg">Parece que esta página se perdió en los Registros Akáshicos.</p>
        </div>
        <p className="text-foreground/40 text-sm mb-8">
          Lo que buscás no existe o fue movida. Volvé al inicio para continuar tu camino.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-foreground hover:bg-foreground/80 text-background rounded-full font-serif font-medium transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft className="size-4" />
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
