import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Curso con Práctica Registros Akáshicos | Eter Somos",
  description:
    "Curso de Registros Akáshicos con 2 clases prácticas individuales por videollamada. Aprendé a conectar con el Campo Akáshico.",
};

export default function N1PracticaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
