"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  GraduationCap,
  Video,
  Headphones,
  ChevronRight,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  BookOpen,
  Home,
  Circle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast, Toaster } from "sonner";

/* ── Interfaces ── */
interface ContentItem {
  id: string;
  courseId: string;
  title: string;
  description: string;
  fileType: string;
  r2Key: string;
  fileName: string;
  sortOrder: number;
  active: number;
}

/* ── File Type Config ── */
const fileTypeConfig: Record<string, { icon: React.ReactNode; label: string; color: string; bgColor: string }> = {
  video: { icon: <Video className="w-4 h-4" />, label: "Video", color: "text-blue-400", bgColor: "bg-blue-500/15" },
  audio: { icon: <Headphones className="w-4 h-4" />, label: "Audio", color: "text-violet-400", bgColor: "bg-violet-500/15" },
  pdf: { icon: <FileText className="w-4 h-4" />, label: "PDF", color: "text-red-400", bgColor: "bg-red-500/15" },
  document: { icon: <FileText className="w-4 h-4" />, label: "Documento", color: "text-amber-400", bgColor: "bg-amber-500/15" },
};

function getFileType(fileName: string, fileType?: string): string {
  if (fileType && fileType !== "") return fileType;
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) return "video";
  if (["mp3", "wav", "ogg", "m4a", "flac", "aac"].includes(ext)) return "audio";
  if (["pdf"].includes(ext)) return "pdf";
  return "document";
}

/* ── Custom Audio Player Component (Enhanced) ── */
function AudioPlayer({ src, title }: { src: string; title: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current) return;
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
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    }
  };

  const progressPct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-mystic-900/80 to-mystic-950/60 rounded-xl border border-mystic-700/40 p-5 sm:p-6">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setPlaying(false)}
        preload="metadata"
      />

      {/* Audio header with album art style */}
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600/30 to-mystic-800/60 flex items-center justify-center border border-violet-500/20 shrink-0">
          <Headphones className="w-6 h-6 text-violet-300" />
        </div>
        <div>
          <h3 className="font-serif text-lg text-foreground">{title}</h3>
          <p className="text-mystic-400 text-sm font-sans">Clase de audio</p>
        </div>
      </div>

      {/* Waveform-like progress bar */}
      <div
        ref={progressRef}
        onClick={handleSeek}
        className="w-full h-8 cursor-pointer mb-3 group relative flex items-end gap-px"
      >
        {Array.from({ length: 80 }).map((_, i) => {
          const barPct = (i / 80) * 100;
          const isActive = barPct <= progressPct;
          const h = 20 + Math.sin(i * 0.4) * 35 + Math.cos(i * 0.25) * 20 + Math.sin(i * 0.7) * 15;
          return (
            <div
              key={i}
              className="flex-1 rounded-full transition-colors duration-100"
              style={{
                height: `${Math.max(12, h)}%`,
                backgroundColor: isActive
                  ? "rgba(139, 92, 246, 0.7)"
                  : "rgba(42, 37, 32, 0.6)",
              }}
            />
          );
        })}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-violet-300 transition-all duration-100"
          style={{ left: `${progressPct}%` }}
        >
          <div className="absolute -top-0.5 -left-1 w-2.5 h-2.5 bg-violet-300 rounded-full" />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <span className="text-mystic-400 text-xs font-sans w-16">{formatTime(currentTime)}</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-mystic-300 hover:text-foreground h-9 w-9" onClick={() => skip(-10)}>
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button
            className="h-11 w-11 rounded-full bg-violet-500 hover:bg-violet-400 text-white shadow-lg shadow-violet-500/20"
            onClick={togglePlay}
          >
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-mystic-300 hover:text-foreground h-9 w-9" onClick={() => skip(10)}>
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 w-16 justify-end">
          <Button variant="ghost" size="icon" className="text-mystic-400 hover:text-foreground h-8 w-8" onClick={() => setMuted(!muted)}>
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      <div className="text-right mt-1">
        <span className="text-mystic-500 text-xs font-sans">{formatTime(duration)}</span>
      </div>
    </div>
  );
}

/* ── Main Course Page ── */
export default function CursoPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeContent, setActiveContent] = useState<ContentItem | null>(null);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);

  const verifyAndLoad = useCallback(async () => {
    try {
      const meRes = await fetch("/api/student/auth/me");
      if (!meRes.ok) {
        router.push("/aula/login");
        return;
      }
      const enrRes = await fetch("/api/student/enrollments");
      let enr: any = null;
      if (enrRes.ok) {
        const ed = await enrRes.json();
        enr = (ed.enrollments || []).find((e: any) => e.type === "curso" && e.referenceId === courseId) || null;
        if (enr) setEnrollmentId(enr.id);
      }
      const res = await fetch(`/api/student/course-content?courseId=${courseId}`);
      if (res.ok) {
        const data = await res.json();
        const items = data.contents || [];
        setContents(items);
        if (items.length > 0) {
          const sorted = [...items].sort((a: ContentItem, b: ContentItem) => (a.sortOrder || 0) - (b.sortOrder || 0));
          if (enr) {
            let done: string[] = []; try { done = JSON.parse(enr.completedContent || "[]") || []; } catch {}
            setCompletedItems(new Set(done));
            const last = sorted.find((c: ContentItem) => c.id === enr.lastContentId);
            setActiveContent(last || sorted.find((c: ContentItem) => !done.includes(c.id)) || sorted[0]);
          } else { setActiveContent(sorted[0]); }
        }
      }
    } catch {
      router.push("/aula/login");
    } finally {
      setLoading(false);
    }
  }, [courseId, router]);

  useEffect(() => {
    verifyAndLoad();
  }, [verifyAndLoad]);

  // Anti-download: disable right-click on the player area
  useEffect(() => {
    const container = playerContainerRef.current;
    if (!container) return;
    const handler = (e: MouseEvent) => {
      e.preventDefault();
      toast("Este contenido es solo para reproducción", { description: "No se puede descargar" });
    };
    container.addEventListener("contextmenu", handler);
    return () => container.removeEventListener("contextmenu", handler);
  }, [activeContent]);

  const getStreamUrl = useCallback((r2Key: string) => {
    return `/api/student/stream?key=${encodeURIComponent(r2Key)}`;
  }, []);

  const sortedContents = [...contents].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const isUnlocked = (index: number) => index === 0 || completedItems.has(sortedContents[index - 1]?.id || "");
  const persistProgress = async (action: string, contentId?: string) => {
    if (!enrollmentId) return;
    try { await fetch("/api/student/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enrollmentId, contentId, action }) }); } catch {}
  };
  const markActiveComplete = () => {
    if (!activeContent) return;
    setCompletedItems((prev) => { const n = new Set(prev); n.add(activeContent.id); return n; });
    persistProgress("complete", activeContent.id);
    toast.success("Clase marcada como completada");
  };
  const activeIndex = activeContent ? sortedContents.findIndex((c) => c.id === activeContent.id) : -1;
  const prevContent = activeIndex > 0 ? sortedContents[activeIndex - 1] : null;
  const nextContent = activeIndex < sortedContents.length - 1 ? sortedContents[activeIndex + 1] : null;
  const progressPct = contents.length > 0 ? Math.round((completedItems.size / contents.length) * 100) : 0;

  const handleContentSelect = (item: ContentItem) => {
    const idx = sortedContents.findIndex((c) => c.id === item.id);
    if (!isUnlocked(idx)) { toast("Completá la clase anterior para desbloquear esta"); return; }
    setActiveContent(item);
    persistProgress("last", item.id);
    if (activeContent && activeContent.id !== item.id) {
      setCompletedItems((prev) => { const n = new Set(prev); n.add(activeContent.id); return n; });
      persistProgress("complete", activeContent.id);
    }
  };

  const handleNext = () => {
    if (nextContent) {
      if (activeContent) {
        setCompletedItems((prev) => { const n = new Set(prev); n.add(activeContent.id); return n; });
        persistProgress("complete", activeContent.id);
      }
      setActiveContent(nextContent);
      persistProgress("last", nextContent.id);
    }
  };

  const handlePrev = () => {
    if (prevContent) {
      setActiveContent(prevContent);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-400 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-br from-mystic-950 via-mystic-950 to-violet-950/40 -z-10" />

      {/* Header */}
      <header className="bg-mystic-900/80 backdrop-blur-xl border-b border-mystic-700/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="sm" className="text-mystic-400 shrink-0" onClick={() => router.push("/aula")}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Aula</span>
            </Button>
            <Separator orientation="vertical" className="h-5 bg-mystic-700/40 hidden sm:block" />
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm min-w-0">
              <Link href="/aula" className="text-mystic-400 hover:text-violet-300 font-sans shrink-0 hidden sm:inline transition-colors">
                Aula Virtual
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-mystic-600 hidden sm:block" />
              <span className="text-foreground font-serif truncate">
                {activeContent ? activeContent.title : `Curso ${courseId}`}
              </span>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {/* Progress indicator */}
            {contents.length > 0 && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-24 h-1.5 bg-mystic-800/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="text-mystic-400 text-xs font-sans">{completedItems.size}/{contents.length}</span>
              </div>
            )}
            <Badge variant="outline" className="border-violet-500/30 text-violet-300 gap-1 text-xs shrink-0">
              <ShieldCheck className="w-3 h-3" />
              Solo reproducción
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {contents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="bg-mystic-900/60 border-mystic-700/40">
              <CardContent className="p-12 text-center">
                <GraduationCap className="w-12 h-12 text-mystic-600 mx-auto mb-4" />
                <h3 className="font-serif text-xl text-foreground mb-2">Sin contenido disponible</h3>
                <p className="text-mystic-400 font-sans text-sm">
                  Este curso aún no tiene material disponible. Fer lo estará subiendo pronto.
                </p>
                <Link href="/aula">
                  <Button variant="outline" className="border-violet-400/30 text-violet-300 mt-4">
                    Volver al Aula
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Player area */}
            <div className="lg:col-span-2 space-y-4">
              {/* Active content title above player */}
              {activeContent && (
                <motion.div
                  key={activeContent.id + "-title"}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      (fileTypeConfig[getFileType(activeContent.fileName, activeContent.fileType)]?.bgColor) || "bg-mystic-800/60"
                    }`}>
                      {fileTypeConfig[getFileType(activeContent.fileName, activeContent.fileType)]?.icon || <FileText className="w-4 h-4 text-mystic-400" />}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-serif text-lg sm:text-xl text-foreground leading-tight">{activeContent.title}</h2>
                      {activeContent.description && (
                        <p className="text-mystic-400 text-sm font-sans mt-0.5">{activeContent.description}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={playerContainerRef} className="select-none" style={{ userSelect: "none" }}>
                {activeContent ? (
                  <motion.div
                    key={activeContent.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {getFileType(activeContent.fileName, activeContent.fileType) === "video" && (
                      <div className="relative rounded-xl overflow-hidden border border-mystic-700/40 bg-black shadow-2xl">
                        <video
                          key={activeContent.id}
                          controls
                          controlsList="nodownload nofullscreen noremoteplayback"
                          disablePictureInPicture
                          disableRemotePlayback
                          className="w-full max-h-[70vh]"
                          onContextMenu={(e) => e.preventDefault()}
                          onEnded={() => {
                            setCompletedItems((prev) => new Set(prev).add(activeContent.id));
                          }}
                        >
                          <source src={getStreamUrl(activeContent.r2Key)} type={activeContent.fileName.endsWith(".webm") ? "video/webm" : "video/mp4"} />
                          Tu navegador no soporta la reproducción de video.
                        </video>
                        {/* Watermark overlay */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03]">
                          <span className="text-white text-6xl font-serif transform -rotate-12 select-none">
                            ETER SOMOS
                          </span>
                        </div>
                      </div>
                    )}

                    {getFileType(activeContent.fileName, activeContent.fileType) === "audio" && (
                      <AudioPlayer
                        key={activeContent.id}
                        src={getStreamUrl(activeContent.r2Key)}
                        title={activeContent.title}
                      />
                    )}

                    {getFileType(activeContent.fileName, activeContent.fileType) === "pdf" && (
                      <div className="bg-mystic-900/80 rounded-xl border border-mystic-700/40 overflow-hidden shadow-2xl" style={{ height: "70vh" }}>
                        <iframe
                          key={activeContent.id}
                          src={getStreamUrl(activeContent.r2Key)}
                          className="w-full h-full"
                          title={activeContent.title}
                          onContextMenu={(e) => e.preventDefault()}
                          sandbox="allow-same-origin"
                        />
                      </div>
                    )}

                    {getFileType(activeContent.fileName, activeContent.fileType) === "document" && (
                      <div className="bg-mystic-900/80 rounded-xl border border-mystic-700/40 p-8 text-center">
                        <FileText className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                        <h3 className="font-serif text-lg text-foreground mb-2">{activeContent.title}</h3>
                        <p className="text-mystic-400 text-sm font-sans">
                          Este documento se visualiza en el reproductor integrado.
                        </p>
                        <iframe
                          key={activeContent.id}
                          src={getStreamUrl(activeContent.r2Key)}
                          className="w-full mt-4 rounded-lg border border-mystic-700/40"
                          style={{ height: "60vh" }}
                          title={activeContent.title}
                          sandbox="allow-same-origin"
                        />
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="bg-mystic-900/60 rounded-xl border border-mystic-700/40 p-12 text-center">
                    <Play className="w-12 h-12 text-mystic-600 mx-auto mb-3" />
                    <p className="text-mystic-400 font-serif">Seleccioná una clase para reproducir</p>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={!prevContent}
                  className="border-mystic-600/40 text-mystic-300 hover:bg-mystic-800/40 gap-2 disabled:opacity-30"
                >
                  <SkipBack className="w-4 h-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </Button>

                <div className="flex items-center gap-1.5 text-xs text-mystic-500 font-sans">
                  <span>Clase {activeIndex + 1} de {sortedContents.length}</span>
                  {/* Mini progress dots */}
                  <div className="hidden sm:flex items-center gap-1 ml-2">
                    {sortedContents.map((item, i) => (
                      <button
                        key={item.id}
                        onClick={() => handleContentSelect(item)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === activeIndex
                            ? "bg-violet-400 w-4"
                            : completedItems.has(item.id)
                            ? "bg-emerald-500/60"
                            : "bg-mystic-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={!nextContent}
                  className="border-mystic-600/40 text-mystic-300 hover:bg-mystic-800/40 gap-2 disabled:opacity-30"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Playlist sidebar */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-[68px]">
                <Card className="bg-mystic-900/60 border-mystic-700/40 overflow-hidden">
                  {/* Playlist Header */}
                  <div className="p-4 border-b border-mystic-700/40">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-mystic-300 text-xs font-josefin uppercase tracking-wider font-medium">
                        Contenido del curso
                      </h3>
                      <Badge variant="outline" className="text-[10px] border-mystic-700/40 text-mystic-400">
                        {completedItems.size}/{sortedContents.length}
                      </Badge>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-mystic-800/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <button onClick={markActiveComplete} className="mx-4 mb-3 w-[calc(100%-2rem)] text-xs font-sans text-violet-300 hover:text-violet-200 border border-violet-500/25 rounded-md py-1.5 transition-colors hover:bg-violet-500/10">
                    Marcar clase como completada
                  </button>

                  {/* Playlist Items */}
                  <ScrollArea className="max-h-[calc(100vh-14rem)]">
                    <div className="p-2">
                      {sortedContents.map((item, index) => {
                        const ft = getFileType(item.fileName, item.fileType);
                        const config = fileTypeConfig[ft] || fileTypeConfig.document;
                        const isActive = activeContent?.id === item.id;
                        const isCompleted = completedItems.has(item.id);
                        const locked = !isUnlocked(index);

                        return (
                          <motion.button
                            key={item.id}
                            onClick={() => handleContentSelect(item)}
                            className={`w-full text-left px-3 py-3 rounded-lg transition-all text-sm group mb-0.5 ${
                              isActive
                                ? "bg-violet-500/15 border border-violet-500/25 text-violet-200"
                                : isCompleted
                                ? "hover:bg-mystic-800/40 text-mystic-300 border border-transparent"
                                : "hover:bg-mystic-800/40 text-mystic-300 border border-transparent"
                            }`}
                            whileHover={{ x: 2 }}
                            transition={{ duration: 0.1 }}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                isActive
                                  ? "bg-violet-500/25"
                                  : isCompleted
                                  ? "bg-emerald-500/15"
                                  : "bg-mystic-800/60"
                              }`}>
                                {locked ? (
                                  <Lock className="w-3.5 h-3.5 text-mystic-500" />
                                ) : isActive ? (
                                  <Play className="w-3.5 h-3.5 text-violet-300" />
                                ) : isCompleted ?(
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <span className="text-mystic-500 text-xs font-sans">{index + 1}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`truncate font-sans text-sm ${isActive ? "text-violet-200" : ""}`}>
                                  {item.title}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className={`text-xs flex items-center gap-1 ${config.color}`}>
                                    {config.icon}
                                    {config.label}
                                  </span>
                                  {(item as any).module && (
                                    <span className="text-xs text-mystic-500">· {(item as any).module}</span>
                                  )}
                                </div>
                              </div>
                              {!isActive && !isCompleted && (
                                <ChevronRight className="w-4 h-4 text-mystic-600 group-hover:text-mystic-400 shrink-0 transition-colors" />
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>

      <Toaster richColors position="top-center" />
    </div>
  );
}
