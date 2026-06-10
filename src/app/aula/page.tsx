"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast, Toaster } from "sonner";

interface Student {
  id: string;
  email: string;
  nombre: string;
  phone?: string;
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
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  activa: { label: "Activa", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  pendiente: { label: "Pendiente", color: "bg-amber-500/20 text-amber-300 border-amber-500/30", icon: <Clock className="w-3.5 h-3.5" /> },
  en_progreso: { label: "En progreso", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: <Eye className="w-3.5 h-3.5" /> },
  completada: { label: "Completada", color: "bg-violet-500/20 text-violet-300 border-violet-500/30", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  entregada: { label: "Entregada", color: "bg-violet-500/20 text-violet-300 border-violet-500/30", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  cancelada: { label: "Cancelada", color: "bg-red-500/20 text-red-300 border-red-500/30", icon: <AlertCircle className="w-3.5 h-3.5" /> },
  expirada: { label: "Expirada", color: "bg-red-500/20 text-red-300 border-red-500/30", icon: <AlertCircle className="w-3.5 h-3.5" /> },
};

const typeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  curso: { label: "Curso", icon: <GraduationCap className="w-5 h-5" />, color: "text-blue-400" },
  lectura: { label: "Lectura", icon: <BookOpen className="w-5 h-5" />, color: "text-violet-400" },
  mentoria: { label: "Mentoría", icon: <Sparkles className="w-5 h-5" />, color: "text-gold-400" },
};

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

/* ── Inline Audio Player for Lecturas ── */
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

  // Check if expired
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
    <div className="bg-mystic-900/80 rounded-xl border border-violet-500/20 p-4 mt-3 select-none" style={{ userSelect: "none" }}>
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
      <div className="flex items-center gap-2 mb-3">
        <Headphones className="w-4 h-4 text-violet-400" />
        <span className="text-violet-300 text-xs font-sans font-medium">Audio de tu lectura</span>
      </div>
      {/* Progress bar */}
      <div
        ref={progressRef}
        onClick={handleSeek}
        className="w-full h-2 bg-mystic-700/60 rounded-full cursor-pointer mb-3 group"
      >
        <div
          className="h-full bg-violet-500 rounded-full transition-all group-hover:bg-violet-400 relative"
          style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-violet-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <span className="text-mystic-400 text-xs font-sans w-12">{formatTime(currentTime)}</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-mystic-300 hover:text-foreground h-7 w-7" onClick={() => skip(-10)}>
            <SkipBack className="w-3.5 h-3.5" />
          </Button>
          <Button
            className="h-9 w-9 rounded-full bg-violet-500 hover:bg-violet-400 text-white"
            onClick={togglePlay}
            disabled={loading}
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-mystic-300 hover:text-foreground h-7 w-7" onClick={() => skip(10)}>
            <SkipForward className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="flex items-center gap-1 w-12 justify-end">
          <Button variant="ghost" size="icon" className="text-mystic-400 hover:text-foreground h-7 w-7" onClick={() => setMuted(!muted)}>
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </Button>
          <span className="text-mystic-500 text-xs font-sans">{formatTime(duration)}</span>
        </div>
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
          <div className={`flex items-center gap-1 text-xs font-sans ${
            timeInfo.urgent ? "text-amber-300" : "text-mystic-400"
          }`}>
            <Clock className="w-3 h-3" />
            {timeInfo.text}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AulaDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEnrollment, setExpandedEnrollment] = useState<string | null>(null);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      // Get student profile
      const meRes = await fetch("/api/student/auth/me");
      if (!meRes.ok) {
        router.push("/aula/login");
        return;
      }
      const meData = await meRes.json();
      setStudent(meData);

      // Get enrollments
      const enrRes = await fetch("/api/student/enrollments");
      if (enrRes.ok) {
        const enrData = await enrRes.json();
        setEnrollments(enrData.enrollments || []);
      }
    } catch {
      router.push("/aula/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/student/auth/logout", { method: "POST" });
    toast.success("Sesión cerrada");
    setTimeout(() => router.push("/aula/login"), 500);
  };

  const cursos = enrollments.filter((e) => e.type === "curso");
  const lecturas = enrollments.filter((e) => e.type === "lectura");
  const mentorias = enrollments.filter((e) => e.type === "mentoria");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 mx-auto mb-4 text-violet-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-mystic-300 font-sans">Cargando tu aula...</p>
        </div>
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-mystic-950 via-mystic-950 to-violet-950/40 -z-10" />

      {/* Header */}
      <header className="bg-mystic-900/60 backdrop-blur-xl border-b border-mystic-700/40 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-violet-400/30">
                <img src="/images/logo-etersomos.jpg" alt="Eter Somos" className="w-full h-full object-cover" />
              </div>
              <span className="font-serif text-lg text-foreground hidden sm:block">Aula Virtual</span>
            </Link>
            <span className="text-mystic-500 hidden md:block">|</span>
            <span className="text-mystic-300 font-sans text-sm hidden md:block">
              Hola, <span className="text-violet-300">{student.nombre}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" className="text-mystic-400 hover:text-foreground text-sm">
                ← Inicio
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="text-mystic-400 hover:text-foreground text-sm gap-1"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-2">
            Tu Aula Virtual
          </h1>
          <p className="text-mystic-300 font-sans">
            Acá podés ver tus cursos, escuchar y descargar tus lecturas, y acceder a tus mentorías con Fer Cardozo.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-mystic-900/60 border-mystic-700/40 backdrop-blur">
            <CardContent className="p-4 text-center">
              <GraduationCap className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <p className="text-2xl font-serif text-foreground">{cursos.length}</p>
              <p className="text-mystic-400 text-xs font-sans">Cursos</p>
            </CardContent>
          </Card>
          <Card className="bg-mystic-900/60 border-mystic-700/40 backdrop-blur">
            <CardContent className="p-4 text-center">
              <BookOpen className="w-6 h-6 text-violet-400 mx-auto mb-1" />
              <p className="text-2xl font-serif text-foreground">{lecturas.length}</p>
              <p className="text-mystic-400 text-xs font-sans">Lecturas</p>
            </CardContent>
          </Card>
          <Card className="bg-mystic-900/60 border-mystic-700/40 backdrop-blur">
            <CardContent className="p-4 text-center">
              <Sparkles className="w-6 h-6 text-gold-400 mx-auto mb-1" />
              <p className="text-2xl font-serif text-foreground">{mentorias.length}</p>
              <p className="text-mystic-400 text-xs font-sans">Mentorías</p>
            </CardContent>
          </Card>
          <Card className="bg-mystic-900/60 border-mystic-700/40 backdrop-blur">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
              <p className="text-2xl font-serif text-foreground">
                {enrollments.filter((e) => e.status === "completada" || e.status === "entregada").length}
              </p>
              <p className="text-mystic-400 text-xs font-sans">Completados</p>
            </CardContent>
          </Card>
        </div>

        {/* Sections */}
        {enrollments.length === 0 ? (
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
        ) : (
          <div className="space-y-8">
            {/* Lecturas - shown first since they have audio */}
            {lecturas.length > 0 && (
              <section>
                <h2 className="font-serif text-2xl text-foreground mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-violet-400" />
                  Mis Lecturas
                </h2>
                <div className="grid gap-4">
                  {lecturas.map((enr) => (
                    <LecturaCard
                      key={enr.id}
                      enrollment={enr}
                      expanded={expandedEnrollment === enr.id}
                      onToggle={() => setExpandedEnrollment(expandedEnrollment === enr.id ? null : enr.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Cursos */}
            {cursos.length > 0 && (
              <section>
                <h2 className="font-serif text-2xl text-foreground mb-4 flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-blue-400" />
                  Mis Cursos
                </h2>
                <div className="grid gap-4">
                  {cursos.map((enr) => (
                    <EnrollmentCard
                      key={enr.id}
                      enrollment={enr}
                      expanded={expandedEnrollment === enr.id}
                      onToggle={() => setExpandedEnrollment(expandedEnrollment === enr.id ? null : enr.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Mentorías */}
            {mentorias.length > 0 && (
              <section>
                <h2 className="font-serif text-2xl text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-gold-400" />
                  Mis Mentorías
                </h2>
                <div className="grid gap-4">
                  {mentorias.map((enr) => (
                    <EnrollmentCard
                      key={enr.id}
                      enrollment={enr}
                      expanded={expandedEnrollment === enr.id}
                      onToggle={() => setExpandedEnrollment(expandedEnrollment === enr.id ? null : enr.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Profile section */}
        <Card className="bg-mystic-900/40 border-mystic-700/30 mt-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-violet-400" />
              <h3 className="font-serif text-lg text-foreground">Mi Perfil</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-mystic-500 font-sans">Nombre</p>
                <p className="text-foreground font-sans">{student.nombre}</p>
              </div>
              <div>
                <p className="text-mystic-500 font-sans">Email</p>
                <p className="text-foreground font-sans">{student.email}</p>
              </div>
              <div>
                <p className="text-mystic-500 font-sans">Teléfono</p>
                <p className="text-foreground font-sans">{student.phone || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Toaster richColors position="top-center" />
    </div>
  );
}

/* ── Lectura Card Component (with inline audio player + download + expiration) ── */

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

  return (
    <Card className={`bg-mystic-900/60 backdrop-blur hover:border-violet-500/30 transition-colors ${
      isExpired ? "border-red-500/20 opacity-70" : "border-mystic-700/40"
    }`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="text-violet-400 mt-0.5 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-serif text-lg text-foreground truncate">{enrollment.title}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className={`${sc.color} text-xs gap-1 border`}>
                  {sc.icon}
                  {sc.label}
                </Badge>
                <span className="text-mystic-500 text-xs font-sans">Lectura</span>
                {hasAudio && !isExpired && (
                  <Badge variant="outline" className="text-xs border-violet-400/30 text-violet-300 gap-1">
                    <Headphones className="w-3 h-3" />
                    Audio disponible
                  </Badge>
                )}
                {hasAudio && isExpired && (
                  <Badge variant="outline" className="text-xs border-red-500/30 text-red-300 gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Audio expirado
                  </Badge>
                )}
                {timeInfo && !timeInfo.expired && (
                  <Badge variant="outline" className={`text-xs gap-1 ${
                    timeInfo.urgent
                      ? "border-amber-500/30 text-amber-300"
                      : "border-mystic-600/30 text-mystic-400"
                  }`}>
                    <Clock className="w-3 h-3" />
                    {timeInfo.text}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-mystic-400 shrink-0" onClick={onToggle}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-mystic-700/40 space-y-3">
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
            {/* Inline audio player with download */}
            {hasAudio && enrollment.r2Key && (
              <LecturaAudioPlayer
                r2Key={enrollment.r2Key}
                title={enrollment.title}
                fileName={enrollment.fileName}
                expiresAt={enrollment.expiresAt}
              />
            )}
            {!hasAudio && (
              <div className="bg-mystic-900/40 rounded-lg p-3 text-center">
                <Clock className="w-5 h-5 text-mystic-600 mx-auto mb-1" />
                <p className="text-mystic-500 text-xs font-sans">El audio de tu lectura estará disponible pronto</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Enrollment Card Component (cursos, mentorías) ── */

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
    <Card className="bg-mystic-900/60 border-mystic-700/40 backdrop-blur hover:border-violet-500/30 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`${tc.color} mt-0.5 shrink-0`}>{tc.icon}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-serif text-lg text-foreground truncate">{enrollment.title}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className={`${sc.color} text-xs gap-1 border`}>
                  {sc.icon}
                  {sc.label}
                </Badge>
                <span className="text-mystic-500 text-xs font-sans">{tc.label}</span>
                {dateStr && <span className="text-mystic-500 text-xs font-sans">· {dateStr}</span>}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-mystic-400 shrink-0" onClick={onToggle}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-mystic-700/40 space-y-3">
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
            {enrollment.type === "curso" && enrollment.status !== "pendiente" && (
              <Link href={`/aula/curso/${enrollment.referenceId || enrollment.id}`}>
                <Button className="bg-violet-500 hover:bg-violet-400 text-white text-sm gap-2 mt-2">
                  <Play className="w-4 h-4" />
                  Acceder al curso
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
