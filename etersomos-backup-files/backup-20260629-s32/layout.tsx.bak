import type { Metadata } from "next";
import { Playfair_Display, Josefin_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SiteContentProvider } from "@/hooks/use-site-content";
import { LocalBusinessJsonLd, FAQJsonLd } from "@/components/json-ld";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const josefin = Josefin_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const SITE_URL = "https://www.etersomos.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Eter Somos | Registros Akáshicos — Lecturas, Cursos y Cristales",
    template: "%s | Eter Somos",
  },
  description:
    "Descubrí la sabiduría de tus Registros Akáshicos con Fer Cardozo. Lecturas personalizadas en audio, cursos de formación Nivel 1 y 2, mentorías, cristales y contenido espiritual exclusivo. Córdoba, Argentina.",
  keywords: [
    "Registros Akáshicos",
    "lectura akáshica",
    "lectura de registros akáshicos",
    "cursos Registros Akáshicos",
    "formación akáshica",
    "Fer Cardozo",
    "Eter Somos",
    "espiritualidad",
    "cristales energéticos",
    "cristales Argentina",
    "mentorías espirituales",
    "meditación",
    "sanación energética",
    "registros akashicos Argentina",
    "registros akashicos Córdoba",
    "curso nivel 1 registros akashicos",
    "curso nivel 2 registros akashicos",
  ],
  authors: [{ name: "Fer Cardozo", url: SITE_URL }],
  creator: "Eter Somos",
  publisher: "Eter Somos",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/logo-etersomos.jpg", type: "image/jpeg", sizes: "1772x1772" },
    ],
    apple: "/images/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: SITE_URL,
    siteName: "Eter Somos",
    title: "Eter Somos | Registros Akáshicos — Lecturas, Cursos y Cristales",
    description:
      "Descubrí la sabiduría de tus Registros Akáshicos con Fer Cardozo. Lecturas personalizadas, cursos de formación y cristales energéticos.",
    images: [
      {
        url: `${SITE_URL}/images/logo-etersomos.jpg`,
        width: 1200,
        height: 630,
        alt: "Eter Somos — Registros Akáshicos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eter Somos | Registros Akáshicos",
    description:
      "Lecturas de Registros Akáshicos, cursos de formación y cristales energéticos. Córdoba, Argentina.",
    images: [`${SITE_URL}/images/logo-etersomos.jpg`],
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "spirituality",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://www.etersomos.com" />
        <link rel="preconnect" href="https://www.etersomos.com" />
      </head>
      <body
        className={`${playfair.variable} ${josefin.variable} antialiased bg-background text-foreground`}
      >
        <LocalBusinessJsonLd />
        <FAQJsonLd />
        <SiteContentProvider>{children}</SiteContentProvider>
        <Toaster />
      </body>
    </html>
  );
}
