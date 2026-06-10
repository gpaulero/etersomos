"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Mail, Lock, ArrowRight, UserPlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "sonner";

export default function AulaLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Completá email y contraseña");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/student/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al iniciar sesión");
        return;
      }
      toast.success(`¡Bienvenide, ${data.student.nombre}!`);
      setTimeout(() => router.push("/aula"), 500);
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/60 via-mystic-950 to-mystic-950" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gold-400/8 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-2 border-violet-400/30">
              <img src="/images/logo-etersomos.jpg" alt="Eter Somos" className="w-full h-full object-cover" />
            </div>
          </Link>
          <h1 className="font-serif text-3xl text-foreground mb-2">Aula Virtual</h1>
          <p className="text-mystic-300 font-sans text-sm">
            Tu espacio de aprendizaje con Fer Cardozo
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-mystic-900/60 backdrop-blur-xl border border-mystic-700/40 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-5 h-5 text-violet-400" />
            <h2 className="font-serif text-xl text-foreground">Iniciar sesión</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-mystic-300 text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mystic-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-mystic-800/60 border-mystic-600/40 text-foreground placeholder:text-mystic-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-mystic-300 text-sm">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mystic-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-mystic-800/60 border-mystic-600/40 text-foreground placeholder:text-mystic-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-500 hover:bg-violet-400 text-white font-josefin gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Ingresando...
                </span>
              ) : (
                <>
                  Ingresar al Aula
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-mystic-700/40 text-center">
            <p className="text-mystic-400 text-sm mb-3">¿Todavía no tenés cuenta?</p>
            <Link href="/aula/registro">
              <Button variant="outline" className="border-violet-400/40 text-violet-300 hover:bg-violet-400/10 gap-2">
                <UserPlus className="w-4 h-4" />
                Crear cuenta
              </Button>
            </Link>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-mystic-400 hover:text-violet-400 text-sm font-sans transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
}
