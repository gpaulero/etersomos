import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aula Virtual — Eter Somos',
  description: 'Tu espacio personal de aprendizaje con Fer Cardozo',
}

export default function AulaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-mystic-950 text-foreground font-sans">
      {children}
    </div>
  )
}
