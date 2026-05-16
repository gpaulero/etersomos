import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Curso Teórico Registros Akáshicos | Eter Somos",
  description:
    "Aprendé a conectar con tus Registros Akáshicos con nuestro curso teórico online de 8 módulos audiovisuales. Contribución voluntaria.",
};

export default function N1TeoricoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
