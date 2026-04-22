"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CursosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050a18]">
      {/* Top nav bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#050a18]/80 border-b border-mystic-700/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center">
          <Link
            href="/#cursos"
            className="flex items-center gap-2 text-foreground/60 hover:text-gold-400 transition-colors text-sm font-medium group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            Volver a Cursos
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-mystic-700/20 mt-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 text-center text-xs text-foreground/30">
          <p>Eter Somos &middot; Registros Ak&aacute;shicos</p>
        </div>
      </footer>
    </div>
  );
}
