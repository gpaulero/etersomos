"use client";

// Boundary global: captura errores de root/chunks y muestra el mensaje real
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es">
      <body style={{ padding: 24, fontFamily: "monospace", color: "#f0ebe5", background: "#0a0908", minHeight: "100vh" }}>
        <h2 style={{ color: "#a78bfa", fontSize: 18 }}>El sitio encontró un error inesperado</h2>
        <pre style={{ whiteSpace: "pre-wrap", color: "#ff8080", fontSize: 14 }}>{(error as any)?.message || "Error desconocido"}</pre>
        <pre style={{ whiteSpace: "pre-wrap", color: "#8a7e72", fontSize: 11 }}>{((error as any)?.stack || "").split("\n").slice(0, 10).join("\n")}</pre>
        <button onClick={() => window.location.reload()} style={{ padding: "8px 16px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>Recargar</button>
      </body>
    </html>
  );
}
