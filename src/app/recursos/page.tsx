"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Instagram,
  Menu,
  ChevronRight,
  FileText,
  Video,
  Music,
  Headphones,
  BookOpen,
  Heart,
  Loader2,
  Play,
  X,
  Search,
  Download,
  Mail,
  Sparkles,
} from "lucide-react"
import { initiateCoursePayment } from "@/lib/course-payment";
import NextImage from "next/image";
import Link from "next/link";
import { ProtectedVideoPlayer, ProtectedAudioPlayer } from "@/components/protected-player";

/* ======================================================================== */
/*                            NAV LINKS                                      */
/* ======================================================================== */

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Lecturas", href: "/lecturas" },
  { label: "Cursos", href: "/cursos" },
  { label: "Mentorías", href: "/mentorias" },
  { label: "Membresías", href: "/membresias" },
  { label: "Recursos", href: "/recursos" },
  { label: "Tienda", href: "/tienda" },
  { label: "Aula", href: "/aula" },
];

/* ======================================================================== */
/*                            ANIMATION VARS                                 */
/* ======================================================================== */

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

/* ======================================================================== */
/*                            TYPES                                          */
/* ======================================================================== */

interface Resource {
  id: string;
  title: string;
  description: string;
  fileType: string;
  fileName: string;
  fileSize: number;
  price: number;
  priceArs?: number;
  priceUsd?: number;
  url: string;
  r2Key?: string;
  createdAt: string;
}

/* ======================================================================== */
/*                            HELPERS                                        */
/* ======================================================================== */

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function normalizeFileType(fileType: string): string {
  return fileType.startsWith("image/") ? "imagen"
    : fileType.startsWith("audio/") ? "audio"
    : fileType.startsWith("video/") ? "video"
    : fileType;
}

function isStreamableType(fileType: string): boolean {
  const normalized = normalizeFileType(fileType);
  return normalized === "video" || normalized === "audio" || normalized === "meditacion";
}

function getFileTypeInfo(fileType: string): {
  icon: React.ElementType;
  label: string;
  color: string;
  bg: string;
} {
  const normalized = normalizeFileType(fileType);

  switch (normalized) {
    case "meditacion":
      return { icon: Headphones, label: "Meditación", color: "text-violet-400", bg: "bg-violet-500/15" };
    case "audio":
      return { icon: Music, label: "Audio", color: "text-violet-300", bg: "bg-violet-500/15" };
    case "video":
      return { icon: Video, label: "Video", color: "text-violet-300", bg: "bg-violet-500/15" };
    case "imagen":
      return { icon: FileText, label: "Imagen", color: "text-violet-300", bg: "bg-violet-500/15" };
    case "guia":
      return { icon: BookOpen, label: "Guía", color: "text-violet-300", bg: "bg-violet-500/15" };
    case "documento":
      return { icon: FileText, label: "Documento", color: "text-foreground/60", bg: "bg-mystic-800/60" };
    default:
      return { icon: FileText, label: "Documento", color: "text-foreground/60", bg: "bg-mystic-800/60" };
  }
}

const TYPE_LABELS: Record<string, string> = {
  meditacion: "Meditaciones",
  audio: "Audios",
  video: "Videos",
  guia: "Guías",
  documento: "Documentos",
  imagen: "Imágenes",
};

/* ======================================================================== */
/*                           MAIN PAGE                                       */
/* ======================================================================== */

const oraculos = [
  { id: "camino-de-la-vida", title: "El camino de la vida", oracle: "Oráculo Guardianes de la Luz", desc: "Una tirada para iluminar tu momento presente y el sentido de tu camino.", activo: true },
  { id: "portal-estelar", title: "Portal Estelar", oracle: "Oráculo Portal de Luz", desc: "Mensajes de apertura y conexión con tu potencial estelar.", activo: true },
  { id: "vidas-pasadas", title: "Mensajes de vidas pasadas", oracle: "Oráculo de Brian Weiss", desc: "Lecturas de vidas pasadas para comprender patrones de esta encarnación.", activo: false },
];

export default function RecursosPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const constNavScrolled = useState(false);
  const navScrolled = constNavScrolled[0];
  const setNavScrolled = constNavScrolled[1];
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [selectedOracle, setSelectedOracle] = useState<(typeof oraculos)[number] | null>(null);
  const [oracleForm, setOracleForm] = useState({ nombre: "", email: "", monto: "", metodo: "mercadopago" as "mercadopago" | "paypal" | "transferencia" });
  const [oracleStep, setOracleStep] = useState<"form" | "transferencia">("form");

  const handleOracleSubmit = () => {
    if (!selectedOracle) return;
    if (!oracleForm.nombre.trim() || !oracleForm.email.includes("@") || !(Number(oracleForm.monto) > 0)) {
      toast.error("Completá nombre, email y un monto válido");
      return;
    }
    if (oracleForm.metodo === "transferencia") { setOracleStep("transferencia"); return; }
    initiateCoursePayment({
      courseId: selectedOracle.id,
      courseName: selectedOracle.title,
      email: oracleForm.email,
      name: oracleForm.nombre,
      phone: "",
      price: Number(oracleForm.monto),
      paymentMethod: oracleForm.metodo,
      enrollmentData: { tipo: "oraculo", oraculo: selectedOracle.title, oracle: selectedOracle.oracle },
      checkoutType: "resource_purchase",
    });
    setSelectedOracle(null);
    setOracleStep("form");
  };

  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerResource, setPlayerResource] = useState<Resource | null>(null);
  const [inlineAudioOpen, setInlineAudioOpen] = useState<Record<string, boolean>>({});

  /* ---- Nav scroll effect ---- */
  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ---- Fetch resources ---- */
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch("/api/resources?public=true");
        if (res.ok) {
          const data = await res.json();
          setResources(data.resources || []);
        } else {
          const errData = await res.json().catch(() => ({}));
          setFetchError(errData.error || `Error ${res.status}`);
        }
      } catch (err) {
        console.error("Error fetching resources:", err);
        setFetchError("No se pudo conectar con el servidor");
      } finally {
        setResourcesLoading(false);
      }
    };
    fetchResources();
  }, []);

  /* ---- Filtros (S42) ---- */
  const availableTypes = Array.from(new Set(resources.map((r) => normalizeFileType(r.fileType))));
  const filteredResources = resources.filter((r) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesType = typeFilter === "todos" || normalizeFileType(r.fileType) === typeFilter;
    const matchesSearch = !q || r.title.toLowerCase().includes(q) || (r.description || "").toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  /* ---- Floating stars ---- */
  const [starsCount, setStarsCount] = useState(15);
  useEffect(() => {
    setStarsCount(window.innerWidth < 640 ? 6 : 15);
  }, []);
  const stars = Array.from({ length: starsCount }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
  }));

  /* ================================================================== */
  /*                          RETURN JSX                                 */
  /* ================================================================== */

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#161310",
            color: "#f0ebe5",
            border: "1px solid #2a252066",
          },
        }}
      />

      {/* ============================================================ */}
      {/*                       NAVIGATION BAR                          */}
      {/* ============================================================ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          navScrolled ? "glass shadow-lg shadow-black/20" : "bg-transparent"
        }`}
      >
        <nav className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 lg:h-18">
          <Link href="/" className="flex items-center gap-2.5">
            <NextImage src="/images/logo-etersomos.jpg" alt="Eter Somos Logo" width={40} height={40} className="rounded-full" />
            <span className="text-violet-400 font-serif font-semibold text-lg tracking-[0.2em] uppercase">
              ETER SOMOS
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors duration-300 font-sans font-medium ${
                  link.href === "/recursos" ? "text-violet-400" : "text-foreground/60 hover:text-violet-400"
                }`}
              >
                {link.label === "Recursos" ? "Recursos" : link.label}
              </Link>
            ))}
            <a href="https://instagram.com/etersomos" target="_blank" rel="noopener noreferrer" className="text-foreground/50 hover:text-violet-400 transition-colors duration-300" aria-label="Instagram">
              <Instagram className="size-5" />
            </a>
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground/50 hover:text-violet-400">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-mystic-950/95 backdrop-blur-xl border-mystic-800/30 w-72">
                <SheetHeader>
                  <SheetTitle className="text-violet-400 font-serif tracking-[0.2em] uppercase">ETER SOMOS</SheetTitle>
                  <SheetDescription className="text-foreground/60">Navegación</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-1 mt-8">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className={`flex items-center justify-between px-4 py-3 rounded-xl hover:bg-mystic-900/50 transition-all duration-300 ${link.href === "/recursos" ? "text-violet-400" : "text-foreground/70 hover:text-violet-400"}`}>
                      {link.label}
                      <ChevronRight className="size-4" />
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>

      {/* ============================================================ */}
      {/*                        HERO / HEADER                          */}
      {/* ============================================================ */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-background to-background" />
        {stars.map((star) => (
          <div key={star.id} className="absolute rounded-full bg-violet-300/40 animate-twinkle pointer-events-none" style={{ left: star.left, top: star.top, width: star.size, height: star.size, animationDelay: `${star.delay}s`, animationDuration: `${star.duration}s` }} />
        ))}

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} transition={{ duration: 0.8 }}>
            <motion.div variants={fadeInUp} transition={{ duration: 0.6 }}>
              <div className="w-16 h-16 rounded-xl bg-violet-500/15 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="size-8 text-violet-400" />
              </div>
            </motion.div>
            <motion.h1 variants={fadeInUp} transition={{ duration: 0.8, delay: 0.2 }} className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-foreground mb-3">
              Recursos
            </motion.h1>
            <motion.p variants={fadeInUp} transition={{ duration: 0.8, delay: 0.4 }} className="text-foreground/50 max-w-xl mx-auto font-sans">
              Con contribución voluntaria consciente.
            </motion.p>
            <motion.p variants={fadeInUp} transition={{ duration: 0.8, delay: 0.5 }} className="text-foreground/40 max-w-xl mx-auto font-sans text-sm mt-2">
              Un espacio creado para apoyar la expansión espiritual de más personas. Tu aporte sostiene este proyecto y permite que pueda seguir creando y compartiendo este tipo de material.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*                   RESOURCE CARDS GRID                         */}
      {/* ============================================================ */}
      <section className="py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {fetchError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-sans text-center">
              {fetchError}
            </div>
          )}
          {/* Filtros (S42) */}
          {!resourcesLoading && resources.length > 0 && (
            <div className="mb-8 space-y-4">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-foreground/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por título..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-full bg-mystic-900/60 border border-mystic-700/30 text-foreground text-sm font-sans placeholder:text-foreground/30 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 outline-none transition-colors"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60 transition-colors" aria-label="Limpiar búsqueda">
                    <X className="size-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setTypeFilter("todos")}
                  className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium border transition-colors ${
                    typeFilter === "todos"
                      ? "bg-violet-500/20 border-violet-400/40 text-violet-300"
                      : "bg-mystic-900/40 border-mystic-700/30 text-foreground/50 hover:text-foreground/70 hover:border-mystic-600/40"
                  }`}
                >
                  Todos ({resources.length})
                </button>
                <button
                  onClick={() => setTypeFilter("oraculo")}
                  className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium border transition-colors ${
                    typeFilter === "oraculo"
                      ? "bg-violet-500/20 border-violet-400/40 text-violet-300"
                      : "bg-mystic-900/40 border-mystic-700/30 text-foreground/50 hover:text-foreground/70 hover:border-mystic-600/40"
                  }`}
                >
                  Oráculos ({oraculos.length})
                </button>
                {availableTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium border transition-colors ${
                      typeFilter === t
                        ? "bg-violet-500/20 border-violet-400/40 text-violet-300"
                        : "bg-mystic-900/40 border-mystic-700/30 text-foreground/50 hover:text-foreground/70 hover:border-mystic-600/40"
                    }`}
                  >
                    {TYPE_LABELS[t] || t} ({resources.filter((r) => normalizeFileType(r.fileType) === t).length})
                  </button>
                ))}
              </div>
            </div>
          )}

          {resourcesLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="size-6 text-violet-400 animate-spin" />
              <p className="text-foreground/40 text-sm font-sans">Cargando...</p>
            </div>
          ) : resources.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
              <BookOpen className="size-12 text-foreground/10 mx-auto mb-4" />
              <p className="text-foreground/40 text-lg font-serif mb-2">Próximamente</p>
              <p className="text-foreground/25 text-sm font-sans max-w-md mx-auto">
                Estamos preparando meditaciones, guías y contenido para tu crecimiento espiritual. Suscribite al newsletter para enterarte cuando subamos algo nuevo.
              </p>
            </motion.div>
          ) : filteredResources.length === 0 && typeFilter !== "oraculo" ? (
            <div className="text-center py-16">
              <Search className="size-10 text-foreground/10 mx-auto mb-4" />
              <p className="text-foreground/40 text-base font-serif mb-3">No encontramos recursos con esos filtros</p>
              <button
                onClick={() => { setSearchQuery(""); setTypeFilter("todos"); }}
                className="text-violet-400 hover:text-violet-300 text-sm font-sans underline underline-offset-4 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(typeFilter === "todos" || typeFilter === "oraculo") && oraculos.map((o) => (
                <motion.div key={o.id} variants={fadeInUp} transition={{ duration: 0.5 }}>
                  <div className="group relative h-full flex flex-col rounded-2xl border border-violet-500/25 bg-mystic-900/40 overflow-hidden hover:border-violet-500/45 transition-all">
                    <div className="h-1 w-full bg-violet-500/40" />
                    <div className="p-5 flex flex-col gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        <Sparkles className="size-4 text-violet-400" />
                        <span className="text-[10px] font-sans uppercase tracking-[0.18em] text-violet-300">{o.oracle}</span>
                      </div>
                      <h3 className="font-serif font-semibold text-foreground text-lg">{o.title}</h3>
                      {selectedOracle?.id === o.id ? (
                        <div className="space-y-2.5 flex-1">
                          <p className="text-foreground/60 font-sans text-[11px] leading-relaxed border-l-2 border-violet-500/40 pl-2">
                            Importante: la tirada se inicia una vez realizada la contribución, no antes.
                          </p>
                          {oracleStep === "form" ? (
                            <>
                              <input value={oracleForm.nombre} onChange={(e) => setOracleForm({ ...oracleForm, nombre: e.target.value })} placeholder="Nombre y apellido" className="w-full px-3 py-2 rounded-lg bg-mystic-900/60 border border-mystic-700/30 text-foreground text-sm font-sans" />
                              <input value={oracleForm.email} onChange={(e) => setOracleForm({ ...oracleForm, email: e.target.value })} placeholder="Email" type="email" className="w-full px-3 py-2 rounded-lg bg-mystic-900/60 border border-mystic-700/30 text-foreground text-sm font-sans" />
                              <div>
                                <label className="text-foreground/80 text-xs font-sans">Monto de contribución voluntaria (ARS)</label>
                                <input value={oracleForm.monto} onChange={(e) => setOracleForm({ ...oracleForm, monto: e.target.value })} type="number" min={1} className="w-full px-3 py-2 rounded-lg bg-mystic-900/60 border border-mystic-700/30 text-foreground text-sm font-sans mt-1" />
                                <p className="text-foreground/50 text-[11px] font-sans mt-1">Ingresá el monto que consideres adecuado y justo por el intercambio.</p>
                              </div>
                              <div className="grid grid-cols-3 gap-1.5">
                                {(["mercadopago", "paypal", "transferencia"] as const).map((m) => (
                                  <button key={m} onClick={() => setOracleForm({ ...oracleForm, metodo: m })} className={`px-1 py-2 rounded-lg border text-[11px] font-sans ${oracleForm.metodo === m ? "border-violet-400/60 bg-violet-400/5 text-violet-300" : "border-mystic-700/40 text-foreground/60"}`}>
                                    {m === "mercadopago" ? "MercadoPago" : m === "paypal" ? "PayPal" : "Transferencia"}
                                  </button>
                                ))}
                              </div>
                              <button onClick={handleOracleSubmit} className="w-full rounded-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-sans font-semibold px-4 py-2.5 transition-colors">
                                Continuar
                              </button>
                              <button onClick={() => { setSelectedOracle(null); setOracleStep("form"); }} className="w-full text-foreground/50 hover:text-foreground/70 text-[11px] font-sans transition-colors">
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <p className="text-foreground/70 font-sans text-xs leading-relaxed">
                                Para completar tu tirada por transferencia, escribinos por WhatsApp y coordinamos el pago y el envío del formulario.
                              </p>
                              <a href="https://wa.me/5493518629325" target="_blank" rel="noopener noreferrer" className="block w-full text-center rounded-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-sans font-semibold px-4 py-2.5">
                                Abrir WhatsApp
                              </a>
                              <button onClick={() => setOracleStep("form")} className="w-full text-foreground/50 hover:text-foreground/70 text-[11px] font-sans transition-colors">
                                Volver
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <>
                          <p className="text-foreground/60 font-sans text-xs leading-relaxed flex-1">{o.desc}</p>
                          {o.activo ? (
                            <button
                              onClick={() => { setSelectedOracle(o); setOracleForm({ nombre: "", email: "", monto: "", metodo: "mercadopago" }); setOracleStep("form"); }}
                              className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-sans font-semibold px-4 py-2.5 transition-colors"
                            >
                              Completar formulario
                            </button>
                          ) : (
                            <span className="inline-flex items-center justify-center gap-2 rounded-full border border-mystic-700/40 bg-mystic-900/40 text-foreground/50 text-xs font-sans font-semibold px-4 py-2.5">
                              En construcción
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {filteredResources.map((resource) => {
                const typeInfo = getFileTypeInfo(resource.fileType);
                const TypeIcon = typeInfo.icon;
                const streamable = isStreamableType(resource.fileType);
                const isVideo = normalizeFileType(resource.fileType) === "video";

                return (
                  <motion.div key={resource.id} variants={fadeInUp} transition={{ duration: 0.5 }}>
                    <div className="group relative h-full flex flex-col rounded-2xl border border-mystic-700/25 bg-mystic-900/40 hover:bg-mystic-800/40 hover:border-violet-500/20 transition-all duration-300 overflow-hidden">
                      {/* Top color accent bar */}
                      <div className={`h-1 w-full ${typeInfo.bg.replace("/15", "/40")}`} />

                      <div className="flex flex-col flex-1 p-5 sm:p-6">
                        {/* File type badge */}
                        <div className="flex items-center justify-between mb-4">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase ${typeInfo.bg} ${typeInfo.color}`}>
                            <TypeIcon className="size-3.5" />
                            {typeInfo.label}
                          </div>
                          <span className="text-violet-400/70 text-xs font-medium flex items-center gap-1">
                            <Heart className="size-3" />
                            Aportación libre
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-serif font-semibold text-foreground mb-2 leading-snug group-hover:text-violet-300 transition-colors">
                          {resource.title}
                        </h3>

                        {/* Description */}
                        {resource.description && (
                          <p className="text-foreground/45 text-sm font-sans leading-relaxed mb-4 line-clamp-3">
                            {resource.description}
                          </p>
                        )}

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* File info + actions */}
                        <div className="mt-4 pt-4 border-t border-mystic-700/20">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-foreground/25 text-xs font-sans">
                              {formatFileSize(resource.fileSize)}
                            </span>
                            <span className="text-foreground/20 text-xs font-sans">
                              {resource.fileName}
                            </span>
                          </div>

                          {/* Voluntary contribution note for all resources */}
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Heart className="size-3.5 text-violet-400/60" />
                              <span className="text-violet-400/70 text-xs font-medium font-sans">
                                Contribución voluntaria consciente
                              </span>
                            </div>
                            <p className="text-foreground/30 text-xs leading-relaxed font-sans">
                              Si resuena con vos, podés apoyar nuestro trabajo con una contribución libre. Sino, también podés acceder ahora y contribuir cuando puedas.
                            </p>
                          </div>

                          {/* Action buttons */}
                          <div className="flex flex-col gap-2">
                            {streamable ? (
                              /* ── Streamable: Reproducir ── */
                              <button
                                onClick={() => {
                                  if (isVideo) {
                                    setPlayerResource(resource);
                                    setPlayerOpen(true);
                                  } else {
                                    setInlineAudioOpen(prev => ({
                                      ...prev,
                                      [resource.id]: !prev[resource.id]
                                    }));
                                  }
                                }}
                                className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 hover:text-violet-300 text-sm font-medium transition-all duration-200 border border-violet-500/20 hover:border-violet-500/40"
                              >
                                <Play className="size-4" />
                                Reproducir
                              </button>
                            ) : (
                              /* ── Downloadable: Contribuir luego (access now, contribute later) ── */
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 text-violet-400 hover:text-violet-300 text-sm font-medium transition-all duration-200 border border-violet-500/20 hover:border-violet-500/40"
                              >
                                <Download className="size-4" />
                                Contribuir luego
                              </a>
                            )}

                            {/* Voluntary contribution links — clicking opens payment AND triggers download */}
                            <a
                              href={resource.url}
                              onClick={(e) => {
                                e.preventDefault();
                                window.open(resource.url, '_blank');
                                window.open('https://link.mercadopago.com.ar/etersomos', '_blank');
                              }}
                              className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 text-violet-400 hover:text-violet-300 text-sm font-medium transition-all duration-200 border border-violet-500/20 hover:border-violet-500/40"
                            >
                              <Heart className="size-4" />
                              Contribuir con MercadoPago
                            </a>
                            <a
                              href={resource.url}
                              onClick={(e) => {
                                e.preventDefault();
                                window.open(resource.url, '_blank');
                                window.open('https://paypal.me/registrosakashicos9', '_blank');
                              }}
                              className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-violet-400/15 hover:bg-violet-400/25 text-violet-300 hover:text-violet-200 text-sm font-medium transition-all duration-200 border border-violet-400/20 hover:border-violet-400/40"
                            >
                              <Heart className="size-4" />
                              Contribuir con PayPal
                            </a>
                          </div>

                          {/* Inline audio player (for audio / meditación) */}
                          {streamable && !isVideo && inlineAudioOpen[resource.id] && (
                            <div className="mt-3">
                              <ProtectedAudioPlayer
                                src={resource.url}
                                title={resource.title}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/*                  VIDEO PLAYER DIALOG                          */}
      {/* ============================================================ */}
      <Dialog open={playerOpen} onOpenChange={setPlayerOpen}>
        <DialogContent className="sm:max-w-3xl bg-mystic-950/95 backdrop-blur-xl border-mystic-700/30 p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>
              {playerResource?.title || "Reproductor de video"}
            </DialogTitle>
            <DialogDescription>
              Reproductor de video protegido
            </DialogDescription>
          </DialogHeader>
          {playerResource && (
            <div className="flex flex-col">
              {/* Video player */}
              <div className="w-full bg-black">
                <ProtectedVideoPlayer
                  src={playerResource.url}
                  title={playerResource.title}
                />
              </div>
              {/* Title bar */}
              <div className="px-5 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-foreground font-serif font-semibold text-base">
                    {playerResource.title}
                  </h3>
                  {playerResource.description && (
                    <p className="text-foreground/40 text-xs mt-1 line-clamp-2">
                      {playerResource.description}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPlayerOpen(false)}
                  className="text-foreground/50 hover:text-foreground hover:bg-mystic-800/50"
                >
                  <X className="size-5" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/*                 CONSCIOUS CONTRIBUTION SECTION                  */}
      {/* ============================================================ */}
      {resources.length > 0 && (
<section className="py-10 sm:py-16 px-4 sm:px-6">
          <div className="max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
              <div className="glass rounded-2xl p-8 sm:p-10 border-mystic-700/20 text-center">
                <div className="w-14 h-14 rounded-xl bg-violet-400/10 flex items-center justify-center mx-auto mb-5">
                  <Heart className="size-7 text-violet-400" />
                </div>
                <h2 className="text-xl font-serif font-semibold text-foreground mb-2">
                  Contribución Voluntaria Consciente
                </h2>
                <p className="text-violet-400/60 text-xs font-sans font-medium uppercase tracking-wider mb-3">
                  Amor como moneda de cambio
                </p>
                <p className="text-foreground/45 text-sm leading-relaxed mb-6 font-sans">
                  Cada recurso que compartimos nace desde el corazón y llega a vos de forma gratuita, porque creemos que la sabiduría espiritual no debería tener barreras económicas. Si estos contenidos resonaron con tu camino y sentís que te aportaron algo valioso, te invitamos a realizar una contribución voluntaria consciente. No es una obligación ni un precio, sino un intercambio energético que nos permite seguir creando, investigando y compartiendo con la comunidad.
                </p>
                <p className="text-foreground/35 text-sm leading-relaxed mb-8 font-sans">
                  Elegí la plataforma que más cómoda te resulte. Cualquier aporte, por pequeño que sea, es profundamente agradecido y hace una diferencia real en nuestro proyecto.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <a
                    href="https://link.mercadopago.com.ar/etersomos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 text-violet-400 hover:text-violet-300 text-sm font-medium transition-all duration-200 border border-violet-500/20 hover:border-violet-500/40"
                  >
                    <Heart className="size-4" />
                    MercadoPago
                  </a>
                  <a
                    href="https://paypal.me/registrosakashicos9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-violet-400/15 hover:bg-violet-400/25 text-violet-300 hover:text-violet-200 text-sm font-medium transition-all duration-200 border border-violet-400/20 hover:border-violet-400/40"
                  >
                    <Heart className="size-4" />
                    PayPal
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/*                          FOOTER                              */}
      {/* ============================================================ */}
      <footer className="mt-auto py-8 px-4 sm:px-6 border-t border-mystic-700/20">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <NextImage src="/images/logo-etersomos.jpg" alt="Eter Somos" width={28} height={28} className="rounded-full" />
            <span className="text-foreground/40 text-xs font-serif tracking-[0.15em] uppercase">Eter Somos</span>
          </Link>
          <div className="flex items-center gap-5">
            <a href="https://instagram.com/etersomos" target="_blank" rel="noopener noreferrer" className="text-foreground/30 hover:text-violet-400 transition-colors" aria-label="Instagram">
              <Instagram className="size-4" />
            </a>
            <a href="mailto:etersomos@gmail.com" className="text-foreground/30 hover:text-violet-400 transition-colors" aria-label="Email">
              <Mail className="size-4" />
            </a>
          </div>
          <p className="text-foreground/20 text-xs font-sans">
            Contribución voluntaria consciente.
          </p>
        </div>
      </footer>

    </div>
  );
}
