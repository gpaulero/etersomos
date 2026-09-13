"use client";

import { useEffect } from "react";

/**
 * Detecta fallos de carga de chunks JS viejos (cache del navegador tras un deploy)
 * y recarga la página una sola vez para buscar las versiones nuevas.
 * Evita el error "This page couldn't load" en navegadores con cache.
 */
export default function ChunkGuard() {
  useEffect(() => {
    const KEY = "chunk_reload_ts";
    const handler = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target || (target as any).tagName !== "SCRIPT") return;
      try {
        const last = Number(sessionStorage.getItem(KEY) || 0);
        const now = Date.now();
        if (now - last > 10000) {
          sessionStorage.setItem(KEY, String(now));
          window.location.reload();
        }
      } catch {}
    };
    window.addEventListener("error", handler, true);
    return () => window.removeEventListener("error", handler, true);
  }, []);
  return null;
}
