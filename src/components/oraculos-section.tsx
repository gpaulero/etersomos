import { Sparkles, ExternalLink } from "lucide-react";

const oraculos = [
  { title: "El camino de la vida", oracle: "Oráculo Guardianes de la Luz", desc: "Una tirada para iluminar tu momento presente y el sentido de tu camino.", url: "https://forms.gle/zEmvA5R12tFLeB9n8" },
  { title: "Portal Estelar", oracle: "Oráculo Portal de Luz", desc: "Mensajes de apertura y conexión con tu potencial estelar.", url: "https://forms.gle/sP7wd5VaaJhQetNWA" },
  { title: "Mensajes de vidas pasadas", oracle: "Oráculo de Brian Weiss", desc: "Lecturas de vidas pasadas para comprender patrones de esta encarnación.", url: "" },
];

export default function OraculosSection() {
  return (
    <section className="py-10 sm:py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block text-violet-400 text-xs font-sans font-semibold tracking-[0.3em] uppercase mb-3">Oráculos</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-foreground">Tiradas y mensajes guiados</h2>
          <p className="text-foreground/60 font-sans text-sm sm:text-base max-w-2xl mx-auto mt-3">
            Completá el formulario del oráculo que te llame. Cada formulario incluye un ítem de contribución voluntaria (ARS): ingresá el monto que consideres adecuado y justo por el intercambio.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {oraculos.map((o) => (
            <div key={o.title} className="glass rounded-2xl border border-violet-500/20 p-6 flex flex-col gap-3 hover:border-violet-500/40 transition-all">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-violet-400" />
                <span className="text-[10px] font-sans uppercase tracking-[0.18em] text-violet-300">{o.oracle}</span>
              </div>
              <h3 className="font-serif font-semibold text-foreground text-lg">{o.title}</h3>
              <p className="text-foreground/60 font-sans text-xs leading-relaxed flex-1">{o.desc}</p>
              {o.url ? (
                <a href={o.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-sans font-semibold px-4 py-2.5 transition-colors">
                  Completar formulario <ExternalLink className="size-3.5" />
                </a>
              ) : (
                <span className="inline-flex items-center justify-center gap-2 rounded-full border border-mystic-700/40 bg-mystic-900/40 text-foreground/50 text-xs font-sans font-semibold px-4 py-2.5">
                  En construcción
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
