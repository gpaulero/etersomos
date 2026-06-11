import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tienda de Cristales | Eter Somos",
  description:
    "Cristales seleccionados con amor e intención para acompañar tu camino espiritual. Envío a toda Argentina.",
};

export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
