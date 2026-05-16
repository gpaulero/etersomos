import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recursos Gratuitos | Eter Somos",
  description:
    "Meditaciones, guías y contenido exclusivo para tu crecimiento espiritual. Todo gratis.",
};

export default function RecursosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
