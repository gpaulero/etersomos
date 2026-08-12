"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Mail, Lock, ArrowRight, UserPlus, Sparkles, Eye, EyeOff, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "sonner";

/* ── Floating Orb Component ── */
function FloatingOrb({ delay, duration, size, x, y, color }: {
  delay: number;
  duration: number;
  size: number;
  x: string;
  y: string;
  color: string;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
        filter: "blur(40px)",
      }}
      animate={{
        y: [0, -30, 10, -20, 0],
        x: [0, 15, -10, 5, 0],
        opacity: [0.3, 0.5, 0.3, 0.6, 0.3],
        scale: [1, 1.1, 0.95, 1.05, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

/* ── Twinkling Star Component ── */
function TwinkleStar({ delay, x, y }: { delay: number; x: string; y: string }) {
  return (
    <motion.div
      className="absolute w-1 h-1 bg-cream-200 rounded-full pointer-events-none"
      style={{ left: x, top: y }}
      animate={{
        opacity: [0.1, 0.6, 0.1],
        scale: [0.8, 1.2, 0.8],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export default function AulaLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  /* Generate star positions (static, won't change between renders) */
  const stars = [
    { x: "10%", y: "15%", delay: 0 },
    { x: "25%", y: "8%", delay: 1.2 },
    { x: "45%", y: "20%", delay: 0.8 },
    { x: "60%", y: "5%", delay: 2.1 },
    { x: "80%", y: "18%", delay: 0.5 },
    { x: "90%", y: "30%", delay: 1.5 },
    { x: "15%", y: "55%", delay: 1.8 },
    { x: "75%", y: "60%", delay: 0.3 },
    { x: "50%", y: "75%", delay: 2.5 },
    { x: "30%", y: "85%", delay: 1.0 },
    { x: "85%", y: "80%", delay: 0.7 },
    { x: "5%", y: "70%", delay: 1.9 },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Deep background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/70 via-mystic-950 to-mystic-950" />

      {/* Floating mystical orbs */}
      <FloatingOrb delay={0} duration={8} size={300} x="15%" y="20%" color="rgba(139, 92, 246, 0.12)" />
      <FloatingOrb delay={2} duration={10} size={250} x="65%" y="15%" color="rgba(167, 139, 250, 0.08)" />
      <FloatingOrb delay={4} duration={12} size={200} x="75%" y="60%" color="rgba(191, 176, 154, 0.06)" />
      <FloatingOrb delay={1} duration={9} size={180} x="10%" y="65%" color="rgba(139, 92, 246, 0.08)" />
      <FloatingOrb delay={3} duration={11} size={220} x="40%" y="70%" color="rgba(167, 139, 250, 0.06)" />

      {/* Twinkling stars */}
      {stars.map((star, i) => (
        <TwinkleStar key={i} delay={star.delay} x={star.x} y={star.y} />
      ))}

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-block">
            <motion.div
              className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-2 border-violet-400/30 shadow-lg shadow-violet-500/10"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <img src="/images/logo-etersomos.jpg" alt="Eter Somos" className="w-full h-full object-cover" />
            </motion.div>
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground mb-2">Aula Virtual</h1>
          <p className="text-mystic-300 font-sans text-sm">
            Tu espacio de aprendizaje con Fer Cardozo
          </p>
          <p className="text-mystic-500 font-sans text-xs mt-1 italic">
            &ldquo;El conocimiento del alma es el camino hacia la libertad&rdquo;
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-mystic-900/60 backdrop-blur-xl border border-mystic-700/40 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-violet-950/20"
        >
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-violet-400" />
            </div>
            <h2 className="font-serif text-xl text-foreground">Iniciar sesión</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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

            <div className="space-y-2">
              <Label htmlFor="password" className="text-mystic-300 text-sm font-sans">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mystic-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-mystic-800/60 border-mystic-600/40 text-foreground placeholder:text-mystic-500 h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-mystic-500 hover:text-mystic-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-500 hover:bg-violet-400 text-white font-josefin gap-2 h-11 text-sm shadow-lg shadow-violet-500/20"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
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

          <div className="mt-4 text-center">
            <Link
              href="/aula/recuperar"
              className="text-violet-300/80 hover:text-violet-300 text-sm font-sans underline-offset-2 hover:underline transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <div className="mt-6 pt-5 border-t border-mystic-700/40 text-center">
            <p className="text-mystic-400 text-sm mb-3 font-sans">¿Todavía no tenés cuenta?</p>
            <Link href="/aula/registro">
              <Button variant="outline" className="border-violet-400/40 text-violet-300 hover:bg-violet-400/10 gap-2">
                <UserPlus className="w-4 h-4" />
                Crear cuenta
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-6"
        >
          <Link href="/" className="text-mystic-400 hover:text-violet-400 text-sm font-sans transition-colors inline-flex items-center gap-1">
            <ArrowRight className="w-3 h-3 rotate-180" />
            Volver al inicio
          </Link>
        </motion.div>
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
}
