import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Formación Completa Registros Akáshicos | Eter Somos",
  description:
    "Formación completa: 1er y 2do nivel de Registros Akáshicos. 18 módulos + 6 clases prácticas individuales. Mejor precio.",
};

export default function AmbosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
