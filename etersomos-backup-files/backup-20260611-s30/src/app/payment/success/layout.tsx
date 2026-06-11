import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confirmación de Pago | Eter Somos",
  description: "Procesamiento de tu pago en Eter Somos.",
};

export default function PaymentSuccessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
