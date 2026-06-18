import type { Metadata } from "next";

const SITE_URL = "https://www.etersomos.com";

export const metadata: Metadata = {
  title: "Aula Virtual",
  description:
    "Tu espacio personal de aprendizaje espiritual con Fer Cardozo. Accedé a tus cursos, lecturas y mentorías de Registros Akáshicos.",
  alternates: {
    canonical: `${SITE_URL}/aula`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AulaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-mystic-950 text-foreground font-sans">
      {children}
    </div>
  );
}
