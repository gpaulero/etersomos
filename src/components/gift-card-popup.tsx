"use client";

import { useEffect, useState } from "react";
import { X, Gift, Sparkles } from "lucide-react";

const WA_URL =
  "https://wa.me/5493518629325?text=" +
  encodeURIComponent("¡Hola Fer! Quiero regalar una Gift Card de Eter Somos (lectura de Registros Akáshicos o curso) ✨");

export default function GiftCardPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("giftcard_shown")) return;
    } catch {}
    const t = setTimeout(() => {
      setOpen(true);
      try {
        sessionStorage.setItem("giftcard_shown", "1");
      } catch {}
    }, 3 * 60 * 1000);
    return () => clearTimeout(t);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-mystic-950/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-md rounded-3xl border border-violet-500/40 bg-mystic-900/95 backdrop-blur-xl p-8 text-center shadow-2xl shadow-violet-950/50">
        <button
          onClick={() => setOpen(false)}
          aria-label="Cerrar"
          className="absolute top-4 right-4 text-foreground/50 hover:text-violet-300 transition-colors"
        >
          <X className="size-5" />
        </button>
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-violet-900/40 border border-violet-500/30">
          <Gift className="h-8 w-8 text-violet-300" />
        </div>
        <span className="inline-block text-violet-400 text-[10px] font-sans font-semibold tracking-[0.3em] uppercase mb-2">
          Gift Card
        </span>
        <h3 className="font-serif font-semibold text-foreground text-2xl mb-3">
          Regalá una experiencia que transforma
        </h3>
        <p className="text-foreground/70 font-sans text-sm leading-relaxed mb-6">
          Sorprendé a alguien que amás con una{" "}
          <strong className="text-violet-300">Lectura de Registros Akáshicos</strong> o uno de nuestros{" "}
          <strong className="text-violet-300">cursos</strong>. Pedila por WhatsApp y te la envío lista para regalar. ✨
        </p>
        <a
          href={WA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-sans font-semibold text-sm px-6 py-3 transition-colors"
        >
          <Sparkles className="h-4 w-4" /> Pedirla por WhatsApp
        </a>
        <button
          onClick={() => setOpen(false)}
          className="mt-3 text-foreground/50 hover:text-foreground/70 text-xs font-sans transition-colors"
        >
          Ahora no, gracias
        </button>
      </div>
    </div>
  );
}
