import type { Metadata } from "next";
import { Playfair_Display, Josefin_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const josefin = Josefin_Sans({
  variable: "--font-josefin",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Eter Somos | Registros Akáshicos - Lecturas, Cursos y Cristales",
  description:
    "Descubre la sabiduría ancestral de tus Registros Akáshicos. Lecturas personalizadas, cursos de formación y tienda de cristales para tu camino espiritual.",
  keywords: [
    "Registros Akáshicos",
    "lectura akáshica",
    "espiritualidad",
    "cristales",
    "cursos espirituales",
    "sanación",
    "ETER SOMOS",
  ],
  icons: {
    icon: "/images/logo.png",
  },
  openGraph: {
    title: "Eter Somos | Registros Akáshicos",
    description:
      "Descubre la sabiduría ancestral de tus Registros Akáshicos. Lecturas personalizadas, cursos y cristales.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${josefin.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
