import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Inscripción recibida | Eter Somos",
  robots: { index: false, follow: false },
};

export default function CursosGraciasPage() {
  return (
    <div className="max-w-2xl mx-auto text-center py-10">
      <div className="mx-auto w-20 h-20 rounded-full bg-violet-500/15 border border-violet-400/30 flex items-center justify-center mb-6">
        <CheckCircle2 className="size-10 text-violet-400" />
      </div>
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
        ¡Gracias por completar tu inscripción!
      </h1>
      <p className="text-foreground/70 text-base sm:text-lg leading-relaxed mb-6">
        Recibimos tu solicitud correctamente. Te enviaremos por email los accesos
        al Aula Virtual una vez que confirmemos tu contribución.
      </p>
      <div className="glass-light rounded-2xl p-6 text-sm text-foreground/70 leading-relaxed mb-8">
        Recordá que tu inscripción se confirma una vez realizada tu contribución.
        Si elegiste transferencia o Western Union, envianos el comprobante por
        WhatsApp al +54 9 3518 62-9325 o a etersomos@gmail.com.
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/cursos">
          <Button
            variant="outline"
            className="rounded-full border-foreground/20 text-foreground/80 hover:bg-foreground/5 hover:text-foreground"
          >
            Ver otros cursos
          </Button>
        </Link>
        <Link href="/">
          <Button className="rounded-full bg-violet-500 hover:bg-violet-600 text-white">
            Volver al inicio
            <ArrowRight className="size-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
