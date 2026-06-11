import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "2do Nivel Registros Akáshicos | Eter Somos",
  description:
    "Aprendé a consultar los Registros Akáshicos de otras personas. 10 módulos teóricos + 4 clases prácticas individuales.",
};

export default function N2Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
