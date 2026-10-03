"use client";

// Boundary de error de ruta: muestra el error REAL en pantalla para diagnostico
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ padding: 24, fontFamily: "monospace", color: "#f0ebe5", background: "#0a0908", minHeight: "100vh" }}>
      <h2 style={{ color: "#a78bfa", fontSize: 18 }}>Algo falló al renderizar esta página</h2>
      <pre style={{ whiteSpace: "pre-wrap", color: "#ff8080", fontSize: 14 }}>{error?.message || "Error desconocido"}</pre>
      <pre style={{ whiteSpace: "pre-wrap", color: "#8a7e72", fontSize: 11 }}>{(error?.stack || "").split("\n").slice(0, 10).join("\n")}</pre>
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button onClick={reset} style={{ padding: "8px 16px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>Reintentar</button>
        <button onClick={() => window.location.reload()} style={{ padding: "8px 16px", background: "#2a2520", color: "#f0ebe5", border: "1px solid #444", borderRadius: 8, cursor: "pointer" }}>Recargar</button>
      </div>
    </div>
  );
}
