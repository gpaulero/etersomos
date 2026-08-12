"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "sonner";

export default function AulaRecuperarPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Ingresá tu email");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/student/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al procesar la solicitud");
        return;
      }
      setSent(true);
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/70 via-mystic-950 to-mystic-950" />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-block">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-2 border-violet-400/30 shadow-lg shadow-violet-500/10">
              <img src="/images/logo-etersomos.jpg" alt="Eter Somos" className="w-full h-full object-cover" />
            </div>
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl text-foreground mb-2">Recuperar contraseña</h1>
          <p className="text-mystic-300 font-sans text-sm">Te enviaremos un enlace para restablecerla</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-mystic-900/60 backdrop-blur-xl border border-mystic-700/40 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-violet-950/20"
        >
          {sent ? (
            <div className="text-center py-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-violet-500/15 border border-violet-400/30 flex items-center justify-center mb-5">
                <CheckCircle2 className="size-8 text-violet-400" />
              </div>
              <h2 className="font-serif text-xl text-foreground mb-3">Revisá tu email</h2>
              <p className="text-mystic-300 font-sans text-sm leading-relaxed mb-6">
                Si existe una cuenta con ese email, te enviamos un enlace para restablecer tu contraseña.
                El enlace expira en 30 minutos. Revisá también la carpeta de spam.
              </p>
              <Link href="/aula/login">
                <Button variant="outline" className="border-violet-400/40 text-violet-300 hover:bg-violet-400/10 gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Volver al login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-mystic-300 text-sm font-sans">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mystic-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-mystic-800/60 border-mystic-600/40 text-foreground placeholder:text-mystic-500 h-11"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-500 hover:bg-violet-400 text-white gap-2 h-11 text-sm shadow-lg shadow-violet-500/20"
              >
                {loading ? "Enviando..." : (
                  <>
                    Enviar enlace
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-mystic-700/40 text-center">
            <Link href="/aula/login" className="text-mystic-400 hover:text-violet-400 text-sm font-sans transition-colors">
              Volver a iniciar sesión
            </Link>
          </div>
        </motion.div>
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
}
