import Link from "next/link";
import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Solicitud recibida | Eter Somos",
  robots: { index: false, follow: false },
};

export default function LecturasGraciasPage() {
  return (
    <div className="min-h-screen bg-mystic-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-mystic-950/80 border-b border-mystic-700/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mystic-900/60 border border-mystic-700/40 text-foreground/70 hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center flex-1">
        <div className="mx-auto w-20 h-20 rounded-full bg-violet-500/15 border border-violet-400/30 flex items-center justify-center mb-6">
          <CheckCircle2 className="size-10 text-violet-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
          ¡Gracias por solicitar tu lectura!
        </h1>
        <p className="text-foreground/70 text-base sm:text-lg leading-relaxed mb-6">
          Recibimos tu solicitud correctamente. Te enviaremos por email los accesos
          al Aula Virtual, donde podrás escuchar tu lectura cuando esté lista.
        </p>
        <div className="glass-light rounded-2xl p-6 text-sm text-foreground/70 leading-relaxed mb-8 text-left sm:text-center">
          Recordá que tu lectura comenzará una vez realizada tu contribución.
          Si elegiste transferencia o Western Union, envianos el comprobante por
          WhatsApp al +54 9 3518 62-9325 o a etersomos@gmail.com.
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/lecturas">
            <Button
              variant="outline"
              className="rounded-full border-foreground/20 text-foreground/80 hover:bg-foreground/5 hover:text-foreground"
            >
              Volver a lecturas
            </Button>
          </Link>
          <Link href="/">
            <Button className="rounded-full bg-violet-500 hover:bg-violet-600 text-white">
              Volver al inicio
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </Link>
        </div>
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
