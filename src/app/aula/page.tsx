"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  Eye,
  LogOut,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Headphones,
  Download,
  AlertTriangle,
  Home,
  MessageCircle,
  Calendar,
  Star,
  Menu,
  X,
  ArrowRight,
  Moon,
  FileText,
  Image,
  Paperclip,
  ExternalLink,
  Crown,
  Mail,
  Gem,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast, Toaster } from "sonner";

/* ── Interfaces ── */
interface Student {
  id: string;
  email: string;
  nombre: string;
  phone?: string;
}

interface Attachment {
  id: string;
  enrollmentId: string;
  r2Key: string;
  fileName: string;
  fileType: string; // 'pdf' | 'imagen' | 'documento'
  fileSize: number;
  mimeType: string;
  sortOrder: number;
  createdAt: string;
}

interface Enrollment {
  id: string;
  type: string;
  referenceId: string;
  title: string;
  status: string;
  assignedBy: string | null;
  notes: string | null;
  r2Key?: string;
  fileName?: string;
  expiresAt?: string | null;
  createdAt: string;
  attachments?: Attachment[];
}

/* ── Status & Type Config ── */
const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  activa: { label: "Activa", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  pendiente: { label: "Pendiente", color: "bg-amber-500/20 text-amber-300 border-amber-500/30", icon: <Clock className="w-3.5 h-3.5" /> },
  en_progreso: { label: "En progreso", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: <Eye className="w-3.5 h-3.5" /> },
  completada: { label: "Completada", color: "bg-violet-500/20 text-violet-300 border-violet-500/30", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  entregada: { label: "Entregada", color: "bg-violet-500/20 text-violet-300 border-violet-500/30", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  cancelada: { label: "Cancelada", color: "bg-red-500/20 text-red-300 border-red-500/30", icon: <AlertCircle className="w-3.5 h-3.5" /> },
  expirada: { label: "Expirada", color: "bg-red-500/20 text-red-300 border-red-500/30", icon: <AlertCircle className="w-3.5 h-3.5" /> },
};

const typeConfig: Record<string, { label: string; icon: React.ReactNode; color: string; gradient: string }> = {
  curso: { label: "Curso", icon: <GraduationCap className="w-5 h-5" />, color: "text-blue-400", gradient: "from-blue-600/20 to-mystic-900/40" },
  lectura: { label: "Lectura", icon: <BookOpen className="w-5 h-5" />, color: "text-violet-400", gradient: "from-violet-600/20 to-mystic-900/40" },
  mentoria: { label: "Mentoría", icon: <Sparkles className="w-5 h-5" />, color: "text-amber-400", gradient: "from-amber-600/20 to-mystic-900/40" },
};

/* ── Spiritual Quotes ── */
const spiritualQuotes = [
  "El universo conspira a favor de quien se atreve a escuchar su voz interior.",
  "Cada paso en tu camino espiritual te acerca a la verdad que ya habita en vos.",
  "Los Registros Akáshicos guardan la memoria de tu alma — abrí la puerta.",
  "La sabiduría no se busca afuera, se recuerda desde adentro.",
  "Sos el cosmos experimentándose a sí mismo con consciencia.",
  "En el silencio habitan las respuestas que la mente no alcanza a formular.",
];

/* ── Nav Items ── */
const navItems = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "cursos", label: "Mis Cursos", icon: GraduationCap },
  { id: "lecturas", label: "Mis Lecturas", icon: BookOpen },
  { id: "mentorias", label: "Mentorías", icon: MessageCircle },
  { id: "membresias", label: "Mis Membresías", icon: Crown },
  { id: "perfil", label: "Mi Perfil", icon: User },
];

/* ── Helper: time remaining until expiration ── */
function getTimeRemaining(expiresAt: string): { text: string; urgent: boolean; expired: boolean } {
  const now = Date.now();
  const expires = new Date(expiresAt).getTime();
  const diff = expires - now;

  if (diff <= 0) {
    return { text: "Expirada", urgent: true, expired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 7) {
    return { text: `${days} días restantes`, urgent: false, expired: false };
  }
  if (days > 0) {
    return { text: `${days}d ${hours}h restantes`, urgent: days <= 3, expired: false };
  }
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { text: `${hours}h ${minutes}m restantes`, urgent: true, expired: false };
}

/* ── Greeting based on time of day ── */
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 18) return "Buenas tardes";
  return "Buenas noches";
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ── Inline Audio Player for Lecturas (Enhanced) ── */
function LecturaAudioPlayer({
  r2Key,
  title,
  fileName,
  expiresAt,
}: {
  r2Key: string;
  title: string;
  fileName?: string;
  expiresAt?: string | null;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const progressRef = useRef<HTMLDivElement>(null);

  const streamUrl = `/api/student/stream?key=${encodeURIComponent(r2Key)}`;
  const downloadUrl = `/api/student/download-lectura?key=${encodeURIComponent(r2Key)}`;

  const isExpired = expiresAt ? new Date(expiresAt).getTime() < Date.now() : false;
  const timeInfo = expiresAt ? getTimeRemaining(expiresAt) : null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    audioRef.current.currentTime = pct * duration;
  };

  const formatTime = (t: number) => {
    if (!t || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const skip = (seconds: number) => {
    if (audioRef.current && duration) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    }
  };

  const progressPct = duration ? (currentTime / duration) * 100 : 0;

  if (isExpired) {
    return (
      <div className="bg-red-950/30 rounded-xl border border-red-500/20 p-4 mt-3">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-red-300 text-xs font-sans font-medium">Lectura expirada</span>
        </div>
        <p className="text-red-400/70 text-xs font-sans">
          El audio de esta lectura ya no está disponible porque expiró el{" "}
          {expiresAt && new Date(expiresAt).toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" })}.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-r from-violet-950/40 via-mystic-900/80 to-mystic-900/80 rounded-xl border border-violet-500/20 p-5 mt-3 select-none"
      style={{ userSelect: "none" }}
    >
      <audio
        ref={audioRef}
        src={streamUrl}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
            setLoading(false);
          }
        }}
        onEnded={() => setPlaying(false)}
        onCanPlay={() => setLoading(false)}
        preload="metadata"
      />

      {/* Album art style header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-600/40 to-mystic-800/60 flex items-center justify-center border border-violet-500/20 shrink-0">
          {playing ? (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Headphones className="w-5 h-5 text-violet-300" />
            </motion.div>
          ) : (
            <Headphones className="w-5 h-5 text-violet-300" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-violet-200 text-sm font-serif truncate">{title}</p>
          <p className="text-violet-400/60 text-xs font-sans">Audio de tu lectura</p>
        </div>
      </div>

      {/* Waveform-like progress bar */}
      <div
        ref={progressRef}
        onClick={handleSeek}
        className="w-full h-8 cursor-pointer mb-2 group relative flex items-end gap-px"
      >
        {Array.from({ length: 60 }).map((_, i) => {
          const barPct = (i / 60) * 100;
          const isActive = barPct <= progressPct;
          const h = 20 + Math.sin(i * 0.5) * 40 + Math.cos(i * 0.3) * 20;
          return (
            <div
              key={i}
              className="flex-1 rounded-full transition-all duration-150"
              style={{
                height: `${Math.max(15, h)}%`,
                backgroundColor: isActive
                  ? "rgba(139, 92, 246, 0.7)"
                  : "rgba(42, 37, 32, 0.6)",
              }}
            />
          );
        })}
        {/* Playhead indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-violet-300 transition-all duration-100"
          style={{ left: `${progressPct}%` }}
        >
          <div className="absolute -top-0.5 -left-1 w-2.5 h-2.5 bg-violet-300 rounded-full" />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <span className="text-mystic-400 text-xs font-sans w-12">{formatTime(currentTime)}</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-mystic-300 hover:text-foreground h-8 w-8" onClick={() => skip(-10)}>
            <SkipBack className="w-3.5 h-3.5" />
          </Button>
          <Button
            className="h-10 w-10 rounded-full bg-violet-500 hover:bg-violet-400 text-white shadow-lg shadow-violet-500/20"
            onClick={togglePlay}
            disabled={loading}
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-mystic-300 hover:text-foreground h-8 w-8" onClick={() => skip(10)}>
            <SkipForward className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="flex items-center gap-1 w-12 justify-end">
          <Button variant="ghost" size="icon" className="text-mystic-400 hover:text-foreground h-7 w-7" onClick={() => setMuted(!muted)}>
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>
      <div className="text-right mt-1">
        <span className="text-mystic-500 text-xs font-sans">{formatTime(duration)}</span>
      </div>

      {/* Download button + expiration info */}
      <div className="mt-3 pt-3 border-t border-mystic-700/40 flex items-center justify-between gap-3">
        <a
          href={downloadUrl}
          download={fileName || "lectura.mp3"}
          className="inline-flex items-center gap-1.5 text-violet-300 hover:text-violet-200 text-xs font-sans transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Descargar audio
        </a>
        {timeInfo && (
          <div
            className={`flex items-center gap-1 text-xs font-sans px-2 py-1 rounded-full ${
              timeInfo.urgent
                ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                : "text-mystic-400"
            }`}
          >
            <Clock className="w-3 h-3" />
            {timeInfo.text}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Sidebar Component (defined outside render to avoid state reset) ── */
function SidebarContent({
  activeSection,
  onNavClick,
  onLogout,
  lecturasCount,
  cursosCount,
  visibleNav,
}: {
  activeSection: string;
  onNavClick: (id: string) => void;
  onLogout: () => void;
  lecturasCount: number;
  cursosCount: number;
  visibleNav?: string[];
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div className="p-4 border-b border-mystic-700/40">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-violet-400/30 shrink-0">
            <img src="/images/logo-etersomos.jpg" alt="Eter Somos" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="font-serif text-base text-foreground block leading-tight">Aula Virtual</span>
            <span className="text-mystic-500 text-[10px] font-sans uppercase tracking-wider">Eter Somos</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.filter((item) => !visibleNav || visibleNav.includes(item.id)).map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-all ${
                isActive
                  ? "bg-violet-500/15 text-violet-200 border border-violet-500/20"
                  : "text-mystic-400 hover:text-foreground hover:bg-mystic-800/40 border border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-violet-400" : ""}`} />
              <span>{item.label}</span>
              {item.id === "lecturas" && lecturasCount > 0 && (
                <span className="ml-auto bg-violet-500/20 text-violet-300 text-[10px] px-1.5 py-0.5 rounded-full">
                  {lecturasCount}
                </span>
              )}
              {item.id === "cursos" && cursosCount > 0 && (
                <span className="ml-auto bg-blue-500/20 text-blue-300 text-[10px] px-1.5 py-0.5 rounded-full">
                  {cursosCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      {/* Portal abierto */}
      <div className="p-3 mt-auto">
        <div className="rounded-xl border border-violet-500/20 bg-mystic-900/60 p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600/40 to-mystic-800/60 border border-violet-500/20 flex items-center justify-center shrink-0">
            <Gem className="w-5 h-5 text-violet-300" />
          </div>
          <div>
            <p className="text-violet-200 text-xs font-sans font-semibold">Portal Abierto</p>
            <p className="text-mystic-500 text-[10px] font-sans">Confía. Estás siendo guiada.</p>
          </div>
        </div>
      </div>


      {/* Bottom section */}
      <div className="p-3 border-t border-mystic-700/40 space-y-1">
        <Link href="/">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans text-mystic-400 hover:text-foreground hover:bg-mystic-800/40 transition-all">
            <Home className="w-4 h-4" />
            <span>Ir al inicio</span>
          </button>
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans text-mystic-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}

/* ── Main Dashboard Component ── */
export default function AulaDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEnrollment, setExpandedEnrollment] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("inicio");
  const [contentCounts, setContentCounts] = useState<Record<string, number>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const loadStudentData = async () => {
    try {
      const meRes = await fetch("/api/student/auth/me");
      if (!meRes.ok) {
        router.push("/aula/login");
        return;
      }
      const meData = await meRes.json();
      setStudent(meData);

      const enrRes = await fetch("/api/student/enrollments");
      if (enrRes.ok) {
        const enrData = await enrRes.json();
        const list = enrData.enrollments || [];
        setEnrollments(list);
        const counts: Record<string, number> = {};
        await Promise.all(
          list.filter((e: any) => e.type === "curso" && e.referenceId).map(async (e: any) => {
            try {
              const cRes = await fetch(`/api/student/course-content?courseId=${e.referenceId}`);
              if (cRes.ok) {
                const cd = await cRes.json();
                const arr = Array.isArray(cd) ? cd : cd.content || [];
                counts[e.referenceId] = arr.filter((c: any) => c.active !== 0 && c.active !== false).length;
              }
            } catch {}
          })
        );
        setContentCounts(counts);
      }
    } catch {
      router.push("/aula/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/student/auth/logout", { method: "POST" });
    toast.success("Sesión cerrada");
    setTimeout(() => router.push("/aula/login"), 500);
  };

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const cursos = enrollments.filter((e) => e.type === "curso");
  const lecturas = enrollments.filter((e) => e.type === "lectura");
  const mentorias = enrollments.filter((e) => e.type === "mentoria");
  const membresias = enrollments.filter((e) => e.type === "membresia");
  const completedCount = enrollments.filter((e) => e.status === "completada" || e.status === "entregada").length;
  const visibleNav = ["inicio", ...(cursos.length ? ["cursos"] : []), ...(lecturas.length ? ["lecturas"] : []), ...(mentorias.length ? ["mentorias"] : []), ...(membresias.length ? ["membresias"] : []), "perfil"];
  const continueEnrollment = cursos.find((c: any) => c.lastContentId) || cursos[0] || null;
  const continueProgress = continueEnrollment ? (() => { const total = contentCounts[(continueEnrollment as any).referenceId] || 0; let done = 0; try { done = (JSON.parse((continueEnrollment as any).completedContent || "[]") || []).length; } catch {} if (!total) return null; return Math.min(100, Math.round((done / total) * 100)); })() : null;
  const quote = spiritualQuotes[Math.floor(Date.now() / 86400000) % spiritualQuotes.length];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-10 h-10 mx-auto mb-4 border-2 border-violet-500/30 border-t-violet-400 rounded-full"
          />
          <p className="text-mystic-300 font-sans text-sm">Cargando tu aula...</p>
        </div>
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-mystic-950 via-mystic-950 to-violet-950/40 -z-10" />

      {/* Mobile Header */}
      <header className="lg:hidden bg-mystic-900/80 backdrop-blur-xl border-b border-mystic-700/40 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-violet-400/30">
              <img src="/images/logo-etersomos.jpg" alt="Eter Somos" className="w-full h-full object-cover" />
            </div>
            <span className="font-serif text-base text-foreground">Aula Virtual</span>
          </div>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-mystic-300">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-mystic-950 border-mystic-700/40 p-0 w-64">
              <SheetHeader className="sr-only">
                <SheetTitle>Navegación</SheetTitle>
              </SheetHeader>
              <SidebarContent
                activeSection={activeSection}
                onNavClick={handleNavClick}
                onLogout={handleLogout}
                lecturasCount={lecturas.length}
                cursosCount={cursos.length}
                visibleNav={visibleNav}
              />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-60 bg-mystic-950/90 backdrop-blur-xl border-r border-mystic-700/40 z-40">
          <SidebarContent
            activeSection={activeSection}
            onNavClick={handleNavClick}
            onLogout={handleLogout}
            lecturasCount={lecturas.length}
            cursosCount={cursos.length}
            visibleNav={visibleNav}
          />
        </aside>

        {/* Main Content Area */}
        <main ref={mainRef} className="flex-1 lg:ml-60">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

            {/* ─── WELCOME HERO ─── */}
            <section id="inicio" className="mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Moon className="w-4 h-4 text-violet-400" />
                  <span className="text-mystic-400 text-sm font-sans capitalize">{getFormattedDate()}</span>
                </div>
                <h1 className="font-serif font-semibold text-2xl sm:text-3xl md:text-4xl text-foreground mb-2">
                  {getGreeting()}, <span className="text-violet-300">{student.nombre.split(" ")[0]}</span>
                </h1>
                <p className="text-mystic-300/80 font-sans text-sm italic max-w-lg">
                  &ldquo;{quote}&rdquo;
                </p>
              </motion.div>

              {continueEnrollment && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="mt-5">
                  <Card className="bg-violet-500/10 border-violet-500/25 backdrop-blur overflow-hidden">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Sparkles className="w-4 h-4 text-violet-300" />
                        <span className="text-violet-300 text-xs font-sans uppercase tracking-wider">Continuar donde lo dejaste</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                          <p className="font-serif text-base sm:text-lg text-foreground truncate">{continueEnrollment.title}</p>
                          {continueProgress !== null && (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="w-40 h-1.5 bg-mystic-800/60 rounded-full overflow-hidden">
                                <div className="h-full bg-violet-400 rounded-full" style={{ width: `${continueProgress}%` }} />
                              </div>
                              <span className="text-mystic-300 text-xs font-sans">{continueProgress}%</span>
                            </div>
                          )}
                        </div>
                        <Link href={`/aula/curso/${continueEnrollment.referenceId || continueEnrollment.id}`}>
                          <Button className="bg-violet-500 hover:bg-violet-400 text-white gap-2 shrink-0">
                            Continuar
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </section>

            {/* ─── STATS ─── */}
            <section className="mb-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { icon: GraduationCap, count: cursos.length, label: "Cursos", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", barColor: "bg-blue-500" },
                  { icon: BookOpen, count: lecturas.length, label: "Lecturas", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", barColor: "bg-violet-500" },
                  { icon: Sparkles, count: mentorias.length, label: "Mentorías", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", barColor: "bg-amber-500" },
                  { icon: CheckCircle2, count: completedCount, label: "Completados", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", barColor: "bg-emerald-500" },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  const maxVal = Math.max(enrollments.length, 1);
                  const pct = Math.round((stat.count / maxVal) * 100);
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                    >
                      <Card className={`${stat.bg} ${stat.border} border backdrop-blur overflow-hidden`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Icon className={`w-5 h-5 ${stat.color}`} />
                            <span className={`text-2xl font-serif ${stat.color}`}>{stat.count}</span>
                          </div>
                          <p className="text-mystic-300 text-xs font-sans mb-2">{stat.label}</p>
                          <div className="w-full h-1.5 bg-mystic-800/60 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full ${stat.barColor} rounded-full`}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* ─── CONTENT SECTIONS ─── */}
            {enrollments.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="bg-mystic-900/60 border-mystic-700/40 backdrop-blur">
                  <CardContent className="p-12 text-center">
                    <BookOpen className="w-12 h-12 text-mystic-600 mx-auto mb-4" />
                    <h3 className="font-serif text-xl text-foreground mb-2">Tu aula está vacía</h3>
                    <p className="text-mystic-400 font-sans text-sm max-w-md mx-auto">
                      Cuando te inscribas a un curso, solicites una lectura o te asignen una mentoría,
                      van a aparecer acá. ¡Explorá lo que Eter Somos tiene para ofrecerte!
                    </p>
                    <Link href="/#espacios" className="inline-block mt-4">
                      <Button className="bg-violet-500 hover:bg-violet-400 text-white gap-2">
                        <Sparkles className="w-4 h-4" />
                        Ver servicios
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="space-y-10">

                {/* ─── LECTURAS ─── */}
                {lecturas.length > 0 && (
                  <section id="lecturas">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-violet-400" />
                          </div>
                          <h2 className="font-serif text-xl sm:text-2xl text-foreground">Mis Lecturas</h2>
                        </div>
                        <Badge variant="outline" className="border-violet-500/20 text-violet-300 text-xs">
                          {lecturas.length} {lecturas.length === 1 ? "lectura" : "lecturas"}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {lecturas.map((enr, i) => (
                          <motion.div
                            key={enr.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                          >
                            <LecturaCard
                              enrollment={enr}
                              expanded={expandedEnrollment === enr.id}
                              onToggle={() => setExpandedEnrollment(expandedEnrollment === enr.id ? null : enr.id)}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </section>
                )}

                {/* ─── CURSOS ─── */}
                {cursos.length > 0 && (
                  <section id="cursos">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                            <GraduationCap className="w-4 h-4 text-blue-400" />
                          </div>
                          <h2 className="font-serif text-xl sm:text-2xl text-foreground">Mis Cursos</h2>
                        </div>
                        <Badge variant="outline" className="border-blue-500/20 text-blue-300 text-xs">
                          {cursos.length} {cursos.length === 1 ? "curso" : "cursos"}
                        </Badge>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {cursos.map((enr, i) => (
                          <motion.div
                            key={enr.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                          >
                            <CourseCard
                              enrollment={enr}
                              expanded={expandedEnrollment === enr.id}
                              onToggle={() => setExpandedEnrollment(expandedEnrollment === enr.id ? null : enr.id)}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </section>
                )}

                {/* ─── MENTORÍAS ─── */}
                {mentorias.length > 0 && (
                  <section id="mentorias">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                          </div>
                          <h2 className="font-serif text-xl sm:text-2xl text-foreground">Mis Mentorías</h2>
                        </div>
                        <Badge variant="outline" className="border-amber-500/20 text-amber-300 text-xs">
                          {mentorias.length} {mentorias.length === 1 ? "mentoría" : "mentorías"}
                        </Badge>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {mentorias.map((enr, i) => (
                          <motion.div
                            key={enr.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                          >
                            <EnrollmentCard
                              enrollment={enr}
                              expanded={expandedEnrollment === enr.id}
                              onToggle={() => setExpandedEnrollment(expandedEnrollment === enr.id ? null : enr.id)}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </section>
                )}

                {membresias.length > 0 && (
                  <section id="membresias">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                            <Crown className="w-4 h-4 text-violet-300" />
                          </div>
                          <h2 className="font-serif text-xl sm:text-2xl text-foreground">Mis Membresías</h2>
                        </div>
                        <Badge variant="outline" className="border-violet-500/20 text-violet-300 text-xs">
                          {membresias.length} {membresias.length === 1 ? "membresía" : "membresías"}
                        </Badge>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {membresias.map((enr, i) => (
                          <motion.div key={enr.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
                            <Card className="bg-mystic-900/40 border-violet-500/20 overflow-hidden">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Crown className="w-4 h-4 text-violet-300" />
                                  <p className="font-serif text-base text-foreground truncate">{enr.title}</p>
                                </div>
                                <p className="text-mystic-400 text-xs font-sans mb-3">Contenido nuevo cada mes mientras tu membresía esté activa.</p>
                                <Link href={`/aula/curso/${enr.referenceId || enr.id}`}>
                                  <Button size="sm" className="w-full bg-violet-500 hover:bg-violet-400 text-white gap-2">
                                    <Play className="w-3.5 h-3.5" /> Ver contenido del mes
                                  </Button>
                                </Link>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </section>
                )}

                {/* ─── PROFILE ── */}
                <section id="perfil">
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-mystic-800/60 border border-mystic-700/40 flex items-center justify-center">
                        <User className="w-4 h-4 text-mystic-300" />
                      </div>
                      <h2 className="font-serif text-xl sm:text-2xl text-foreground">Mi Perfil</h2>
                    </div>
                    <Card className="bg-mystic-900/40 border-mystic-700/30">
                      <CardContent className="p-5 sm:p-6">
                        <div className="flex items-center gap-4 mb-5">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600/30 to-mystic-800/50 border border-violet-500/20 flex items-center justify-center">
                            <span className="font-serif text-xl text-violet-300">
                              {student.nombre.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-serif text-lg text-foreground">{student.nombre}</p>
                            <p className="text-mystic-400 text-sm font-sans">{student.email}</p>
                          </div>
                        </div>
                        <Separator className="bg-mystic-700/30 mb-4" />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-mystic-500 font-sans text-xs uppercase tracking-wider mb-1">Nombre</p>
                            <p className="text-foreground font-sans">{student.nombre}</p>
                          </div>
                          <div>
                            <p className="text-mystic-500 font-sans text-xs uppercase tracking-wider mb-1">Email</p>
                            <p className="text-foreground font-sans">{student.email}</p>
                          </div>
                          <div>
                            <p className="text-mystic-500 font-sans text-xs uppercase tracking-wider mb-1">Teléfono</p>
                            <p className="text-foreground font-sans">{student.phone || "—"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>

      <Toaster richColors position="top-center" />
    </div>
  );
}

/* ── Attachment display helper ── */
function getAttachmentIcon(fileType: string, mimeType: string) {
  if (fileType === 'imagen' || mimeType.startsWith('image/')) return <Image className="w-4 h-4 text-emerald-400" />;
  if (fileType === 'pdf' || mimeType === 'application/pdf') return <FileText className="w-4 h-4 text-red-400" />;
  return <FileText className="w-4 h-4 text-blue-400" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── Attachments Section Component ── */
function AttachmentsSection({
  attachments,
  isExpired,
}: {
  attachments: Attachment[];
  isExpired: boolean;
}) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="mt-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Paperclip className="w-3.5 h-3.5 text-violet-400" />
        <span className="text-violet-300 text-xs font-sans uppercase tracking-wider">
          Archivos adjuntos ({attachments.length})
        </span>
      </div>
      <div className="space-y-2">
        {attachments.map((att) => {
          const streamUrl = `/api/student/stream?key=${encodeURIComponent(att.r2Key)}`;
          const downloadUrl = `/api/student/download-lectura?key=${encodeURIComponent(att.r2Key)}`;
          const isImage = att.fileType === 'imagen' || att.mimeType.startsWith('image/');

          return (
            <div
              key={att.id}
              className="bg-mystic-900/50 border border-mystic-700/30 rounded-lg p-3 flex items-start gap-3 group/att hover:border-violet-500/20 transition-colors"
            >
              {/* Icon / Preview */}
              <div className="shrink-0">
                {isImage && !isExpired ? (
                  <div className="w-12 h-12 rounded-md overflow-hidden border border-mystic-700/40 bg-mystic-800/60">
                    <img
                      src={streamUrl}
                      alt={att.fileName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-md border border-mystic-700/40 bg-mystic-800/60 flex items-center justify-center">
                    {getAttachmentIcon(att.fileType, att.mimeType)}
                  </div>
                )}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-mystic-200 text-sm font-sans truncate">{att.fileName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-mystic-500 text-xs font-sans">{formatFileSize(att.fileSize)}</span>
                  <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-mystic-700/40 text-mystic-400">
                    {att.fileType === 'pdf' ? 'PDF' : att.fileType === 'imagen' ? 'Imagen' : 'Documento'}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              {!isExpired ? (
                <div className="flex items-center gap-1 shrink-0">
                  {isImage && (
                    <a
                      href={streamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-mystic-400 hover:text-violet-300 transition-colors p-1"
                      title="Ver imagen"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <a
                    href={downloadUrl}
                    download={att.fileName}
                    className="text-mystic-400 hover:text-violet-300 transition-colors p-1"
                    title="Descargar"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <span className="text-red-400/60 text-xs font-sans shrink-0">Expirado</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Lectura Card Component (Enhanced) ── */
function LecturaCard({
  enrollment,
  expanded,
  onToggle,
}: {
  enrollment: Enrollment;
  expanded: boolean;
  onToggle: () => void;
}) {
  const sc = statusConfig[enrollment.status] || statusConfig.pendiente;
  const hasAudio = !!(enrollment.r2Key);
  const isExpired = enrollment.expiresAt ? new Date(enrollment.expiresAt).getTime() < Date.now() : false;
  const timeInfo = enrollment.expiresAt ? getTimeRemaining(enrollment.expiresAt) : null;
  const remainPct = enrollment.expiresAt ? Math.max(0, Math.min(100, ((new Date(enrollment.expiresAt).getTime() - Date.now()) / (180 * 24 * 60 * 60 * 1000)) * 100)) : 100;
  const isRecent = (Date.now() - new Date(enrollment.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
  const hasAttachments = !!(enrollment.attachments && enrollment.attachments.length > 0);

  return (
    <Card className={`bg-mystic-900/60 backdrop-blur hover:border-violet-500/30 transition-all group ${
      isExpired ? "border-red-500/20 opacity-70" : "border-mystic-700/40"
    }`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Album art style icon */}
            <div className={`w-11 h-11 rounded-lg shrink-0 flex items-center justify-center border ${
              isExpired
                ? "bg-red-950/40 border-red-500/20"
                : hasAudio
                ? "bg-gradient-to-br from-violet-600/30 to-mystic-800/60 border-violet-500/20"
                : "bg-mystic-800/60 border-mystic-700/40"
            }`}>
              {isExpired ? (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              ) : hasAudio ? (
                <Headphones className="w-5 h-5 text-violet-300" />
              ) : (
                <Clock className="w-5 h-5 text-mystic-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-serif text-base sm:text-lg text-foreground truncate">{enrollment.title}</h3>
                {isRecent && !isExpired && (
                  <Badge variant="outline" className="border-violet-400/30 text-violet-300 text-[10px] shrink-0">
                    Nueva
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`${sc.color} text-xs gap-1 border`}>
                  {sc.icon}
                  {sc.label}
                </Badge>
                <span className="text-mystic-500 text-xs font-sans">Lectura</span>
                {hasAudio && !isExpired && (
                  <Badge variant="outline" className="text-xs border-violet-400/30 text-violet-300 gap-1">
                    <Headphones className="w-3 h-3" />
                    Audio
                  </Badge>
                )}
                {hasAttachments && !isExpired && (
                  <Badge variant="outline" className="text-xs border-emerald-400/30 text-emerald-300 gap-1">
                    <Paperclip className="w-3 h-3" />
                    {enrollment.attachments!.length} {enrollment.attachments!.length === 1 ? 'adjunto' : 'adjuntos'}
                  </Badge>
                )}
                {timeInfo && !timeInfo.expired && (
                  <Badge variant="outline" className={`text-xs gap-1 ${
                    timeInfo.urgent
                      ? "border-amber-500/30 text-amber-300 bg-amber-500/5"
                      : "border-mystic-600/30 text-mystic-400"
                  }`}>
                    <Clock className="w-3 h-3" />
                    {timeInfo.text}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-mystic-400 shrink-0 h-8 w-8 p-0" onClick={onToggle}>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </Button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-mystic-700/40">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 space-y-4">
                    {hasAudio && enrollment.r2Key ? (
                      <LecturaAudioPlayer
                        r2Key={enrollment.r2Key}
                        title={enrollment.title}
                        fileName={enrollment.fileName}
                        expiresAt={enrollment.expiresAt}
                      />
                    ) : (
                      <div className="bg-mystic-900/40 rounded-lg p-4 text-center border border-mystic-700/30">
                        <Clock className="w-5 h-5 text-mystic-600 mx-auto mb-1" />
                        <p className="text-mystic-500 text-xs font-sans">El audio de tu lectura estará disponible pronto</p>
                      </div>
                    )}
                    <AttachmentsSection
                      attachments={enrollment.attachments || []}
                      isExpired={isExpired}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-xl border border-violet-500/20 bg-mystic-900/40 p-4">
                      <h4 className="text-violet-300 text-sm font-serif font-semibold mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Sobre tu lectura
                      </h4>
                      <p className="text-mystic-300 text-xs font-sans leading-relaxed mb-3">
                        Esta lectura fue realizada especialmente para vos. Escuchala en un espacio de calma y apertura.
                      </p>
                      <div className="flex items-center gap-2 text-xs font-sans text-mystic-400">
                        <Calendar className="w-3.5 h-3.5 text-violet-400" />
                        <span>Fecha de entrega: {new Date(enrollment.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-violet-500/20 bg-mystic-900/40 p-4">
                      <h4 className="text-violet-300 text-sm font-serif font-semibold mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Disponible por
                      </h4>
                      <p className="text-mystic-300 text-xs font-sans leading-relaxed mb-3">
                        Esta lectura estará disponible para vos durante 6 meses.
                      </p>
                      <div className="w-full h-1.5 bg-mystic-800/60 rounded-full overflow-hidden mb-1.5">
                        <div className="h-full bg-violet-500 rounded-full" style={{ width: `${remainPct}%` }} />
                      </div>
                      <p className="text-mystic-500 text-[11px] font-sans">{timeInfo ? timeInfo.text : "6 meses"} restantes</p>
                    </div>
                    <div className="rounded-xl border border-violet-500/20 bg-mystic-900/40 p-4">
                      <h4 className="text-violet-300 text-sm font-serif font-semibold mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4" /> ¿Necesitás algo?
                      </h4>
                      <p className="text-mystic-300 text-xs font-sans leading-relaxed mb-3">
                        Estoy aquí para acompañarte en tu camino.
                      </p>
                      <a href="mailto:etersomos@gmail.com" className="inline-block">
                        <Button variant="outline" size="sm" className="border-violet-500/30 text-violet-200 hover:bg-violet-500/10 gap-2">
                          <Mail className="w-3.5 h-3.5" /> Escribirme
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

/* ── Course Card Component (Rich Design) ── */
function CourseCard({
  enrollment,
  expanded,
  onToggle,
}: {
  enrollment: Enrollment;
  expanded: boolean;
  onToggle: () => void;
}) {
  const tc = typeConfig[enrollment.type] || typeConfig.curso;
  const sc = statusConfig[enrollment.status] || statusConfig.pendiente;
  const dateStr = enrollment.createdAt
    ? new Date(enrollment.createdAt).toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "numeric" })
    : "";
  const isActive = enrollment.status === "activa" || enrollment.status === "en_progreso";

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <Card className="bg-mystic-900/60 border-mystic-700/40 backdrop-blur hover:border-blue-500/30 transition-all overflow-hidden h-full flex flex-col">
        {/* Gradient header */}
        <div className={`h-20 bg-gradient-to-r ${tc.gradient} relative flex items-end p-4`}>
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className={`${sc.color} text-xs gap-1 border bg-mystic-950/60 backdrop-blur`}>
              {sc.icon}
              {sc.label}
            </Badge>
          </div>
          <div className="absolute top-3 left-3">
            <div className={`w-9 h-9 rounded-lg bg-mystic-950/50 backdrop-blur border border-mystic-700/40 flex items-center justify-center ${tc.color}`}>
              {tc.icon}
            </div>
          </div>
        </div>

        <CardContent className="p-4 flex-1 flex flex-col">
          <h3 className="font-serif text-base text-foreground mb-1 line-clamp-2">{enrollment.title}</h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-mystic-500 text-xs font-sans">{tc.label}</span>
            {dateStr && (
              <>
                <span className="text-mystic-600 text-xs">·</span>
                <span className="text-mystic-500 text-xs font-sans">{dateStr}</span>
              </>
            )}
          </div>

          <div className="mt-auto space-y-2">
            {isActive && enrollment.type === "curso" && (
              <Link href={`/aula/curso/${enrollment.referenceId || enrollment.id}`} className="block">
                <Button className="w-full bg-violet-500 hover:bg-violet-400 text-white text-sm gap-2 h-9">
                  <Play className="w-3.5 h-3.5" />
                  Continuar
                </Button>
              </Link>
            )}
            {!isActive && enrollment.type === "curso" && enrollment.status !== "pendiente" && (
              <Link href={`/aula/curso/${enrollment.referenceId || enrollment.id}`} className="block">
                <Button variant="outline" className="w-full border-mystic-600/40 text-mystic-300 text-sm gap-2 h-9 hover:bg-mystic-800/40">
                  <Eye className="w-3.5 h-3.5" />
                  Ver curso
                </Button>
              </Link>
            )}
            {(enrollment.notes || enrollment.assignedBy) && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-mystic-400 text-xs h-7"
                onClick={onToggle}
              >
                {expanded ? "Ocultar detalles" : "Ver detalles"}
                <motion.span
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-1"
                >
                  <ChevronDown className="w-3 h-3" />
                </motion.span>
              </Button>
            )}
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-mystic-700/40 space-y-2">
                  {enrollment.notes && (
                    <div>
                      <p className="text-mystic-500 text-xs font-sans mb-1">Notas</p>
                      <p className="text-mystic-200 text-sm font-sans">{enrollment.notes}</p>
                    </div>
                  )}
                  {enrollment.assignedBy && (
                    <div>
                      <p className="text-mystic-500 text-xs font-sans">
                        Asignado por: <span className="text-mystic-200">{enrollment.assignedBy}</span>
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Enrollment Card Component (Mentorías) ── */
function EnrollmentCard({
  enrollment,
  expanded,
  onToggle,
}: {
  enrollment: Enrollment;
  expanded: boolean;
  onToggle: () => void;
}) {
  const tc = typeConfig[enrollment.type] || typeConfig.curso;
  const sc = statusConfig[enrollment.status] || statusConfig.pendiente;
  const dateStr = enrollment.createdAt
    ? new Date(enrollment.createdAt).toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "numeric" })
    : "";

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <Card className="bg-mystic-900/60 border-mystic-700/40 backdrop-blur hover:border-amber-500/30 transition-all overflow-hidden h-full flex flex-col">
        {/* Gradient header */}
        <div className={`h-16 bg-gradient-to-r ${tc.gradient} relative flex items-center px-4`}>
          <div className="w-8 h-8 rounded-lg bg-mystic-950/50 backdrop-blur border border-mystic-700/40 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="ml-3">
            <Badge variant="outline" className={`${sc.color} text-xs gap-1 border bg-mystic-950/60 backdrop-blur`}>
              {sc.icon}
              {sc.label}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 flex-1 flex flex-col">
          <h3 className="font-serif text-base text-foreground mb-1 line-clamp-2">{enrollment.title}</h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-mystic-500 text-xs font-sans">{tc.label}</span>
            {dateStr && (
              <>
                <span className="text-mystic-600 text-xs">·</span>
                <span className="text-mystic-500 text-xs font-sans">{dateStr}</span>
              </>
            )}
          </div>

          <div className="mt-auto">
            {(enrollment.notes || enrollment.assignedBy) && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-mystic-400 text-xs h-7"
                onClick={onToggle}
              >
                {expanded ? "Ocultar detalles" : "Ver detalles"}
                <motion.span
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-1"
                >
                  <ChevronDown className="w-3 h-3" />
                </motion.span>
              </Button>
            )}
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-mystic-700/40 space-y-2">
                  {enrollment.notes && (
                    <div>
                      <p className="text-mystic-500 text-xs font-sans mb-1">Notas</p>
                      <p className="text-mystic-200 text-sm font-sans">{enrollment.notes}</p>
                    </div>
                  )}
                  {enrollment.assignedBy && (
                    <div>
                      <p className="text-mystic-500 text-xs font-sans">
                        Asignado por: <span className="text-mystic-200">{enrollment.assignedBy}</span>
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
