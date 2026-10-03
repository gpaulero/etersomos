"use client";

import { useEffect } from "react";

/**
 * Detecta fallos de carga de chunks JS viejos (cache del navegador tras un deploy)
 * y recarga la página una sola vez para buscar las versiones nuevas.
 * Cubre tanto errores de <script>/<link> como rechazos de import() dinámico
 * (los que aparecen al renderizar un bloque nuevo, ej: el formulario tras los checks).
 * Evita el error "This page couldn't load" en navegadores con cache.
 */
export default function ChunkGuard() {
  useEffect(() => {
    const KEY = "chunk_reload_ts";
    const CHUNK_RE = /chunk|failed to load|loading chunk|dynamically imported|import declaration|module script/i;

    const maybeReload = () => {
      try {
        const last = Number(sessionStorage.getItem(KEY) || 0);
        const now = Date.now();
        if (now - last > 10000) {
          sessionStorage.setItem(KEY, String(now));
          window.location.reload();
        }
      } catch {}
    };

    const onError = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "SCRIPT" || target.tagName === "LINK")) {
        maybeReload();
        return;
      }
      const msg = (event as ErrorEvent).message || "";
      if (CHUNK_RE.test(msg)) maybeReload();
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason as any;
      const msg = String(reason?.message || reason || "");
      if (CHUNK_RE.test(msg)) maybeReload();
    };

    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return null;
}
