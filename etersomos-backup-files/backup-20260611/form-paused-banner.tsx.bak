"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Loader2, CalendarOff } from "lucide-react";
import Link from "next/link";

interface FormPausedBannerProps {
  /** Key del formulario en settings (ej: "lecturas", "n1-teorico") */
  formKey: string;
  /** Mensaje personalizado opcional (si no se usa, se muestra el mensaje general) */
  customMessage?: string;
  /** Título personalizado opcional (si no se usa, se muestra "Formulario temporalmente deshabilitado") */
  customTitle?: string;
}

export default function FormPausedBanner({
  formKey,
  customMessage,
  customTitle,
}: FormPausedBannerProps) {
  const [isPaused, setIsPaused] = useState<boolean | null>(null);
  const [pauseMessage, setPauseMessage] = useState("");

  useEffect(() => {
    fetch(`/api/settings?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        const forms = data.forms || {};
        setIsPaused(forms[formKey] === false);
        setPauseMessage(data.pauseMessage || "");
      })
      .catch(() => setIsPaused(false));
  }, [formKey]);

  // Loading state while checking
  if (isPaused === null) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 text-violet-400 animate-spin" />
      </div>
    );
  }

  // Form is active — render nothing
  if (!isPaused) {
    return null;
  }

  // Form is paused
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="w-full"
      >
        <div className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/10 via-mystic-950 to-orange-500/10 p-8 sm:p-12 text-center">
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-400/15 border border-amber-400/20">
              <CalendarOff className="size-8 text-amber-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-serif font-semibold text-amber-300">
                {customTitle || "Formulario temporalmente deshabilitado"}
              </h2>
              <p className="text-foreground/60 max-w-md mx-auto leading-relaxed">
                {customMessage || pauseMessage || "Este formulario se encuentra en pausa. Por favor volvé más tarde."}
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-mystic-900/60 border border-mystic-700/40 text-foreground/70 hover:text-violet-400 hover:border-violet-400/30 transition-all text-sm font-medium"
              >
                <Pause className="size-4" />
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
