"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Separator } from "@/components/ui/separator";
import {
  Instagram,
  Menu,
  ChevronRight,
  MessageCircle,
  Mail,
  FileText,
  Video,
  Music,
  Headphones,
  BookOpen,
  Heart,
  Loader2,
  ArrowRight,
  Gift,
  Play,
  X,
  Lock,
  CreditCard,
} from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";
import { ProtectedVideoPlayer, ProtectedAudioPlayer } from "@/components/protected-player";
import { initiateResourcePayment } from "@/lib/resource-payment";

/* ======================================================================== */
/*                            NAV LINKS                                      */
/* ======================================================================== */

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Sesiones", href: "/lecturas" },
  { label: "Cursos", href: "/cursos" },
  { label: "Membresía", href: "/#membresias" },
  { label: "Recursos", href: "/recursos" },
  { label: "Tienda", href: "/tienda" },
  { label: "Contacto", href: "/#contacto" },
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

interface PurchaseState {
  resource: Resource | null;
  step: "select" | "paying";
  name: string;
  email: string;
  paymentMethod: "mercadopago" | "paypal";
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
      return { icon: Music, label: "Audio", color: "text-blue-400", bg: "bg-blue-500/15" };
    case "video":
      return { icon: Video, label: "Video", color: "text-rose-400", bg: "bg-rose-500/15" };
    case "imagen":
      return { icon: FileText, label: "Imagen", color: "text-emerald-400", bg: "bg-emerald-500/15" };
    case "guia":
      return { icon: BookOpen, label: "Guía", color: "text-gold-400", bg: "bg-gold-400/15" };
    case "documento":
      return { icon: FileText, label: "Documento", color: "text-foreground/60", bg: "bg-mystic-800/60" };
    default:
      return { icon: FileText, label: "Documento", color: "text-foreground/60", bg: "bg-mystic-800/60" };
  }
}

function formatPriceArs(price: number): string {
  if (price <= 0) return null;
  return `$${price.toLocaleString("es-AR", { minimumFractionDigits: 0 })} ARS`;
}

function formatPriceUsd(price: number): string {
  if (price <= 0) return null;
  return `USD $${price}`;
}

/* ======================================================================== */
/*                           MAIN PAGE                                       */
/* ======================================================================== */

export default function RecursosPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const constNavScrolled = useState(false);
  const navScrolled = constNavScrolled[0];
  const setNavScrolled = constNavScrolled[1];
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerResource, setPlayerResource] = useState<Resource | null>(null);
  const [inlineAudioOpen, setInlineAudioOpen] = useState<Record<string, boolean>>({});

  // Purchase dialog state
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [purchase, setPurchase] = useState<PurchaseState>({
    resource: null,
    step: "select",
    name: "",
    email: "",
    paymentMethod: "mercadopago",
  });
  const [purchasing, setPurchasing] = useState(false);

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

  /* ---- Handle purchase initiation ---- */
  const handlePurchase = async () => {
    if (!purchase.resource || !purchase.name.trim() || !purchase.email.trim()) {
      toast.error("Completá tu nombre y email para continuar.");
      return;
    }

    setPurchasing(true);
    try {
      await initiateResourcePayment({
        resourceId: purchase.resource.id,
        resourceTitle: purchase.resource.title,
        email: purchase.email.trim(),
        name: purchase.name.trim(),
        priceArs: purchase.resource.priceArs || purchase.resource.price || 0,
        priceUsd: purchase.resource.priceUsd || 0,
        paymentMethod: purchase.paymentMethod,
        r2Key: purchase.resource.r2Key || "",
      });
    } catch (err) {
      console.error("Purchase error:", err);
      toast.error("Error al iniciar el pago. Intentá de nuevo.");
      setPurchasing(false);
    }
  };

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
                {link.label}
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
            <motion.span variants={fadeInUp} transition={{ duration: 0.6, delay: 0.1 }} className="inline-block text-violet-400 text-xs font-sans font-semibold tracking-[0.3em] uppercase mb-3">
              Para tu crecimiento
            </motion.span>
            <motion.h1 variants={fadeInUp} transition={{ duration: 0.8, delay: 0.2 }} className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-foreground mb-3">
              Recursos
            </motion.h1>
            <motion.p variants={fadeInUp} transition={{ duration: 0.8, delay: 0.4 }} className="text-foreground/50 max-w-xl mx-auto font-sans">
              Meditaciones guiadas, guías y contenido exclusivo para tu camino espiritual
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
          {resourcesLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="size-6 text-violet-400 animate-spin" />
              <p className="text-foreground/40 text-sm font-sans">Cargando recursos...</p>
            </div>
          ) : resources.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
              <BookOpen className="size-12 text-foreground/10 mx-auto mb-4" />
              <p className="text-foreground/40 text-lg font-serif mb-2">Próximamente</p>
              <p className="text-foreground/25 text-sm font-sans max-w-md mx-auto">
                Estamos preparando meditaciones, guías y contenido para tu crecimiento espiritual. Suscribite al newsletter para enterarte cuando subamos algo nuevo.
              </p>
            </motion.div>
          ) : (
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {resources.map((resource) => {
                const typeInfo = getFileTypeInfo(resource.fileType);
                const TypeIcon = typeInfo.icon;
                const streamable = isStreamableType(resource.fileType);
                const isVideo = normalizeFileType(resource.fileType) === "video";
                const priceArs = resource.priceArs || resource.price || 0;
                const priceUsd = resource.priceUsd || 0;
                const isPaid = priceArs > 0 || priceUsd > 0;

                return (
                  <motion.div key={resource.id} variants={fadeInUp} transition={{ duration: 0.5 }}>
                    <div className="group relative h-full flex flex-col rounded-2xl border border-mystic-700/25 bg-mystic-900/40 hover:bg-mystic-800/40 hover:border-violet-500/20 transition-all duration-300 overflow-hidden">
                      {/* Top color accent bar */}
                      <div className={`h-1 w-full ${typeInfo.bg.replace("/15", "/40")}`} />

                      <div className="flex flex-col flex-1 p-5 sm:p-6">
                        {/* File type badge + price */}
                        <div className="flex items-center justify-between mb-4">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase ${typeInfo.bg} ${typeInfo.color}`}>
                            <TypeIcon className="size-3.5" />
                            {typeInfo.label}
                          </div>
                          {isPaid ? (
                            <span className="text-gold-400 text-xs font-medium flex items-center gap-1">
                              <Lock className="size-3" />
                              {formatPriceArs(priceArs) || formatPriceUsd(priceUsd)}
                            </span>
                          ) : (
                            <span className="text-emerald-400/70 text-xs font-medium">Gratis</span>
                          )}
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

                        {/* File info */}
                        <div className="mt-4 pt-4 border-t border-mystic-700/20">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-foreground/25 text-xs font-sans">
                              {formatFileSize(resource.fileSize)}
                            </span>
                            <span className="text-foreground/20 text-xs font-sans">
                              {resource.fileName}
                            </span>
                          </div>

                          {/* Price info for paid resources */}
                          {isPaid && (
                            <div className="mb-4 p-3 rounded-xl bg-gold-400/5 border border-gold-400/10">
                              <div className="flex items-center gap-2 mb-1">
                                <CreditCard className="size-3.5 text-gold-400/70" />
                                <span className="text-gold-400/80 text-xs font-medium font-sans">
                                  Acceso con contribución
                                </span>
                              </div>
                              <p className="text-foreground/35 text-xs leading-relaxed font-sans">
                                Elegí tu método de pago para acceder a este recurso.
                              </p>
                              {priceArs > 0 && (
                                <p className="text-foreground/50 text-xs mt-1 font-sans">
                                  MercadoPago: {formatPriceArs(priceArs)}
                                </p>
                              )}
                              {priceUsd > 0 && (
                                <p className="text-foreground/50 text-xs font-sans">
                                  PayPal: {formatPriceUsd(priceUsd)}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Free contribution note */}
                          {!isPaid && (
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Heart className="size-3.5 text-cream-400/60" />
                                <span className="text-cream-400/70 text-xs font-medium font-sans">
                                  Contribución voluntaria consciente
                                </span>
                              </div>
                              <p className="text-foreground/30 text-xs leading-relaxed font-sans">
                                Si este recurso resuena con vos, podés apoyar nuestro trabajo con una contribución libre.
                              </p>
                            </div>
                          )}

                          {/* Botones de acción */}
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
                            ) : isPaid ? (
                              /* ── Paid downloadable: Comprar y descargar ── */
                              <button
                                onClick={() => {
                                  setPurchase({
                                    resource,
                                    step: "select",
                                    name: "",
                                    email: "",
                                    paymentMethod: "mercadopago",
                                  });
                                  setPurchaseOpen(true);
                                }}
                                className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-gold-400/15 hover:bg-gold-400/25 text-gold-400 hover:text-gold-300 text-sm font-medium transition-all duration-200 border border-gold-400/20 hover:border-gold-400/40"
                              >
                                <Lock className="size-4" />
                                Comprar y descargar
                              </button>
                            ) : (
                              /* ── Free downloadable: Descargar ahora ── */
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-mystic-800/60 hover:bg-mystic-700/60 text-foreground/50 hover:text-foreground/70 text-sm font-medium transition-all duration-200 border border-mystic-700/20 hover:border-mystic-700/40"
                              >
                                <Gift className="size-4" />
                                Descargar ahora
                              </a>
                            )}

                            {/* Contribution links for free resources */}
                            {!isPaid && (
                              <>
                                <a
                                  href="https://link.mercadopago.com.ar/etersomos"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#009EE3]/15 hover:bg-[#009EE3]/25 text-[#009EE3] hover:text-[#00b8ff] text-sm font-medium transition-all duration-200 border border-[#009EE3]/20 hover:border-[#009EE3]/40"
                                >
                                  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7.5 18.5c-.3 0-.5-.1-.7-.3-.2-.2-.3-.4-.3-.7V6.5c0-.3.1-.5.3-.7.2-.2.4-.3.7-.3h5c1.6 0 2.9.5 3.9 1.4 1 1 1.5 2.2 1.5 3.6 0 1.4-.5 2.6-1.5 3.6-1 1-2.3 1.4-3.9 1.4H9v3.7c0 .3-.1.5-.3.7-.2.2-.4.3-.7.3h-.5z"/></svg>
                                  Contribuir con MercadoPago
                                </a>
                                <a
                                  href="https://paypal.me/registrosakashicos9"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#FFC439]/15 hover:bg-[#FFC439]/25 text-[#FFC439] hover:text-[#ffd060] text-sm font-medium transition-all duration-200 border border-[#FFC439]/20 hover:border-[#FFC439]/40"
                                >
                                  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 00-.607-.541c1.855 1.475 2.392 3.893 1.635 6.173-.77 2.32-2.947 3.834-5.578 3.834h-2.19c-.524 0-.968.382-1.05.9l-.56 3.553-.16 1.015c-.04.253-.253.44-.508.44H7.076"/></svg>
                                  Contribuir con PayPal
                                </a>
                              </>
                            )}
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
      {/*               RESOURCE PURCHASE DIALOG                        */}
      {/* ============================================================ */}
      <Dialog open={purchaseOpen} onOpenChange={setPurchaseOpen}>
        <DialogContent className="sm:max-w-md bg-mystic-950/95 backdrop-blur-xl border-mystic-700/30">
          <DialogHeader>
            <DialogTitle className="text-violet-400 font-serif flex items-center gap-2">
              <Lock className="size-5" />
              Acceder al recurso
            </DialogTitle>
            <DialogDescription className="text-foreground/50 font-sans">
              Completá tus datos y elegí el método de pago para descargar este recurso.
            </DialogDescription>
          </DialogHeader>

          {purchase.resource && (
            <div className="space-y-5 mt-2">
              {/* Resource info */}
              <div className="p-4 rounded-xl bg-mystic-900/50 border border-mystic-700/20">
                <h4 className="text-foreground font-serif font-semibold text-sm mb-1">
                  {purchase.resource.title}
                </h4>
                <div className="flex items-center gap-3 mt-2">
                  {(purchase.resource.priceArs || purchase.resource.price) > 0 && (
                    <span className="text-[#009EE3] text-xs font-medium bg-[#009EE3]/10 px-2 py-1 rounded-md">
                      MercadoPago: {formatPriceArs(purchase.resource.priceArs || purchase.resource.price)}
                    </span>
                  )}
                  {(purchase.resource.priceUsd || 0) > 0 && (
                    <span className="text-[#FFC439] text-xs font-medium bg-[#FFC439]/10 px-2 py-1 rounded-md">
                      PayPal: {formatPriceUsd(purchase.resource.priceUsd)}
                    </span>
                  )}
                </div>
              </div>

              {/* Name input */}
              <div>
                <label className="text-foreground/60 text-xs font-medium font-sans mb-1.5 block">
                  Tu nombre
                </label>
                <input
                  type="text"
                  value={purchase.name}
                  onChange={(e) => setPurchase(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ingresá tu nombre"
                  className="w-full px-4 py-2.5 rounded-xl bg-mystic-900/50 border border-mystic-700/30 text-foreground text-sm font-sans placeholder:text-foreground/25 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
                />
              </div>

              {/* Email input */}
              <div>
                <label className="text-foreground/60 text-xs font-medium font-sans mb-1.5 block">
                  Tu email
                </label>
                <input
                  type="email"
                  value={purchase.email}
                  onChange={(e) => setPurchase(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-mystic-900/50 border border-mystic-700/30 text-foreground text-sm font-sans placeholder:text-foreground/25 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
                />
                <p className="text-foreground/25 text-xs mt-1 font-sans">
                  Te enviaremos el enlace de descarga a este email.
                </p>
              </div>

              {/* Payment method selector */}
              <div>
                <label className="text-foreground/60 text-xs font-medium font-sans mb-2 block">
                  Método de pago
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPurchase(prev => ({ ...prev, paymentMethod: "mercadopago" }))}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 ${
                      purchase.paymentMethod === "mercadopago"
                        ? "bg-[#009EE3]/15 border-[#009EE3]/40 text-[#009EE3]"
                        : "bg-mystic-900/30 border-mystic-700/20 text-foreground/40 hover:border-mystic-700/40"
                    }`}
                  >
                    <svg className="size-6" viewBox="0 0 24 24" fill="currentColor"><path d="M7.5 18.5c-.3 0-.5-.1-.7-.3-.2-.2-.3-.4-.3-.7V6.5c0-.3.1-.5.3-.7.2-.2.4-.3.7-.3h5c1.6 0 2.9.5 3.9 1.4 1 1 1.5 2.2 1.5 3.6 0 1.4-.5 2.6-1.5 3.6-1 1-2.3 1.4-3.9 1.4H9v3.7c0 .3-.1.5-.3.7-.2.2-.4.3-.7.3h-.5z"/></svg>
                    <span className="text-xs font-medium">MercadoPago</span>
                    {(purchase.resource.priceArs || purchase.resource.price) > 0 && (
                      <span className="text-[10px] opacity-70">{formatPriceArs(purchase.resource.priceArs || purchase.resource.price)}</span>
                    )}
                  </button>
                  <button
                    onClick={() => setPurchase(prev => ({ ...prev, paymentMethod: "paypal" }))}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 ${
                      purchase.paymentMethod === "paypal"
                        ? "bg-[#FFC439]/15 border-[#FFC439]/40 text-[#FFC439]"
                        : "bg-mystic-900/30 border-mystic-700/20 text-foreground/40 hover:border-mystic-700/40"
                    }`}
                  >
                    <svg className="size-6" viewBox="0 0 24 24" fill="currentColor"><path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 00-.607-.541c1.855 1.475 2.392 3.893 1.635 6.173-.77 2.32-2.947 3.834-5.578 3.834h-2.19c-.524 0-.968.382-1.05.9l-.56 3.553-.16 1.015c-.04.253-.253.44-.508.44H7.076"/></svg>
                    <span className="text-xs font-medium">PayPal</span>
                    {(purchase.resource.priceUsd || 0) > 0 && (
                      <span className="text-[10px] opacity-70">{formatPriceUsd(purchase.resource.priceUsd)}</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Pay button */}
              <Button
                onClick={handlePurchase}
                disabled={purchasing || !purchase.name.trim() || !purchase.email.trim()}
                className={`w-full py-6 rounded-xl font-serif font-semibold text-sm transition-all duration-300 ${
                  purchase.paymentMethod === "mercadopago"
                    ? "bg-[#009EE3] hover:bg-[#00b8ff] text-white"
                    : "bg-[#FFC439] hover:bg-[#ffd060] text-black"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {purchasing ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Redirigiendo al pago...
                  </>
                ) : (
                  <>
                    <CreditCard className="size-4 mr-2" />
                    Pagar con {purchase.paymentMethod === "mercadopago" ? "MercadoPago" : "PayPal"}
                  </>
                )}
              </Button>

              <p className="text-foreground/25 text-xs text-center font-sans">
                Serás redirigido a la plataforma de pago segura. Una vez confirmado el pago, recibirás el enlace de descarga.
              </p>
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
                <div className="w-14 h-14 rounded-xl bg-cream-400/10 flex items-center justify-center mx-auto mb-5">
                  <Heart className="size-7 text-cream-400" />
                </div>
                <h2 className="text-xl font-serif font-semibold text-foreground mb-2">
                  Contribución Voluntaria Consciente
                </h2>
                <p className="text-cream-400/60 text-xs font-sans font-medium uppercase tracking-wider mb-3">
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
                    className="flex-1 inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-[#009EE3]/15 hover:bg-[#009EE3]/25 text-[#009EE3] hover:text-[#00b8ff] text-sm font-medium transition-all duration-200 border border-[#009EE3]/20 hover:border-[#009EE3]/40"
                  >
                    <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7.5 18.5c-.3 0-.5-.1-.7-.3-.2-.2-.3-.4-.3-.7V6.5c0-.3.1-.5.3-.7.2-.2.4-.3.7-.3h5c1.6 0 2.9.5 3.9 1.4 1 1 1.5 2.2 1.5 3.6 0 1.4-.5 2.6-1.5 3.6-1 1-2.3 1.4-3.9 1.4H9v3.7c0 .3-.1.5-.3.7-.2.2-.4.3-.7.3h-.5z"/></svg>
                    MercadoPago
                  </a>
                  <a
                    href="https://paypal.me/registrosakashicos9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-[#FFC439]/15 hover:bg-[#FFC439]/25 text-[#FFC439] hover:text-[#ffd060] text-sm font-medium transition-all duration-200 border border-[#FFC439]/20 hover:border-[#FFC439]/40"
                  >
                    <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 00-.607-.541c1.855 1.475 2.392 3.893 1.635 6.173-.77 2.32-2.947 3.834-5.578 3.834h-2.19c-.524 0-.968.382-1.05.9l-.56 3.553-.16 1.015c-.04.253-.253.44-.508.44H7.076"/></svg>
                    PayPal
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/*                          FOOTER                                */}
      {/* ============================================================ */}
      <footer className="border-t border-mystic-800/20 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <NextImage src="/images/logo-etersomos.jpg" alt="Eter Somos" width={36} height={36} className="rounded-full" />
                <span className="text-violet-400 font-serif font-bold tracking-[0.2em] uppercase text-lg">ETER SOMOS</span>
              </div>
              <p className="text-foreground/40 text-sm leading-relaxed font-sans">
                Lecturas, cursos y cristales para tu camino espiritual. Conexión con la sabiduría del alma.
              </p>
            </div>

            <div>
              <h3 className="text-violet-400 font-serif font-semibold mb-4 text-sm uppercase tracking-wider">Contacto</h3>
              <ul className="space-y-3">
                <li><a href="mailto:etersomos@gmail.com" className="flex items-center gap-2 text-foreground/40 hover:text-violet-400 transition-colors duration-300 text-sm font-sans"><Mail className="size-4" />etersomos@gmail.com</a></li>
                <li><a href="https://instagram.com/etersomos" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-foreground/40 hover:text-violet-400 transition-colors duration-300 text-sm font-sans"><Instagram className="size-4" />@etersomos</a></li>
                <li><a href="https://wa.me/5493518629325" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-foreground/40 hover:text-violet-400 transition-colors duration-300 text-sm font-sans"><MessageCircle className="size-4" />WhatsApp</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-violet-400 font-serif font-semibold mb-4 text-sm uppercase tracking-wider">Explorar</h3>
              <ul className="space-y-2.5 mb-4">
                <li><Link href="/lecturas" className="text-foreground/40 hover:text-violet-400 transition-colors duration-300 text-sm font-sans">Lecturas Akáshicas</Link></li>
                <li><Link href="/cursos" className="text-foreground/40 hover:text-violet-400 transition-colors duration-300 text-sm font-sans">Cursos de Formación</Link></li>
                <li><Link href="/tienda" className="text-foreground/40 hover:text-violet-400 transition-colors duration-300 text-sm font-sans">Tienda de Cristales</Link></li>
              </ul>
              <Link href="/" className="inline-flex items-center gap-2 text-violet-400/80 hover:text-violet-300 transition-colors duration-300 text-sm font-sans font-medium">
                Volver al inicio <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <Separator className="bg-mystic-800/20 my-10" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-foreground/30 text-sm font-sans">© 2026 Eter Somos. Todos los derechos reservados.</p>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com/etersomos" target="_blank" rel="noopener noreferrer" className="text-foreground/30 hover:text-violet-400 transition-colors duration-300" aria-label="Instagram"><Instagram className="size-5" /></a>
              <a href="https://wa.me/5493518629325" target="_blank" rel="noopener noreferrer" className="text-foreground/30 hover:text-violet-400 transition-colors duration-300" aria-label="WhatsApp"><MessageCircle className="size-5" /></a>
              <a href="mailto:etersomos@gmail.com" className="text-foreground/30 hover:text-violet-400 transition-colors duration-300" aria-label="Email"><Mail className="size-5" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
