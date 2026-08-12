"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "sonner";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/student/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "El enlace expiró o es inválido");
        return;
      }
      setDone(true);
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
          <h1 className="font-serif text-2xl sm:text-3xl text-foreground mb-2">Nueva contraseña</h1>
          <p className="text-mystic-300 font-sans text-sm">Elegí una contraseña nueva para tu cuenta</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-mystic-900/60 backdrop-blur-xl border border-mystic-700/40 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-violet-950/20"
        >
          {done ? (
            <div className="text-center py-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-violet-500/15 border border-violet-400/30 flex items-center justify-center mb-5">
                <CheckCircle2 className="size-8 text-violet-400" />
              </div>
              <h2 className="font-serif text-xl text-foreground mb-3">¡Contraseña actualizada!</h2>
              <p className="text-mystic-300 font-sans text-sm leading-relaxed mb-6">
                Tu contraseña se restableció correctamente. Ya podés entrar al Aula Virtual con tu nueva contraseña.
              </p>
              <Link href="/aula/login">
                <Button className="bg-violet-500 hover:bg-violet-400 text-white gap-2">
                  <Lock className="w-4 h-4" />
                  Iniciar sesión
                </Button>
              </Link>
            </div>
          ) : !token ? (
            <div className="text-center py-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border border-red-400/30 flex items-center justify-center mb-5">
                <AlertCircle className="size-8 text-red-400" />
              </div>
              <h2 className="font-serif text-xl text-foreground mb-3">Enlace inválido</h2>
              <p className="text-mystic-300 font-sans text-sm leading-relaxed mb-6">
                Este enlace no es válido o está incompleto. Pedí uno nuevo desde la página de recuperación.
              </p>
              <Link href="/aula/recuperar">
                <Button variant="outline" className="border-violet-400/40 text-violet-300 hover:bg-violet-400/10">
                  Pedir nuevo enlace
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-mystic-300 text-sm font-sans">Nueva contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mystic-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-mystic-800/60 border-mystic-600/40 text-foreground placeholder:text-mystic-500 h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm" className="text-mystic-300 text-sm font-sans">Confirmar contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mystic-500" />
                    <Input
                      id="confirm"
                      type="password"
                      placeholder="Repetí la contraseña"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="pl-10 bg-mystic-800/60 border-mystic-600/40 text-foreground placeholder:text-mystic-500 h-11"
                    />
                  </div>
                </div>
                {error && (
                  <p className="text-red-400 text-sm font-sans flex items-center gap-2">
                    <AlertCircle className="size-4 shrink-0" />
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-violet-500 hover:bg-violet-400 text-white gap-2 h-11 text-sm shadow-lg shadow-violet-500/20"
                >
                  {loading ? "Guardando..." : "Restablecer contraseña"}
                </Button>
              </form>
              <div className="mt-6 pt-5 border-t border-mystic-700/40 text-center">
                <Link href="/aula/recuperar" className="text-mystic-400 hover:text-violet-400 text-sm font-sans transition-colors">
                  Pedir un enlace nuevo
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
}

export default function AulaResetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ResetForm />
    </Suspense>
  );
}
