"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast, Toaster } from "sonner";

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

const fileTypeConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  video: { icon: <Video className="w-5 h-5 text-blue-400" />, label: "Video", color: "text-blue-400" },
  audio: { icon: <Headphones className="w-5 h-5 text-violet-400" />, label: "Audio", color: "text-violet-400" },
  pdf: { icon: <FileText className="w-5 h-5 text-red-400" />, label: "PDF", color: "text-red-400" },
  document: { icon: <FileText className="w-5 h-5 text-amber-400" />, label: "Documento", color: "text-amber-400" },
};

function getFileType(fileName: string, fileType?: string): string {
  if (fileType && fileType !== "") return fileType;
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) return "video";
  if (["mp3", "wav", "ogg", "m4a", "flac", "aac"].includes(ext)) return "audio";
  if (["pdf"].includes(ext)) return "pdf";
  return "document";
}

/* ── Custom Audio Player Component ── */
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
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    }
  };

  return (
    <div className="bg-mystic-900/80 rounded-xl border border-mystic-700/40 p-5">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setPlaying(false)}
        preload="metadata"
      />
      <div className="flex items-center gap-3 mb-4">
        <Headphones className="w-6 h-6 text-violet-400" />
        <h3 className="font-serif text-lg text-foreground">{title}</h3>
      </div>
      {/* Progress bar */}
      <div
        ref={progressRef}
        onClick={handleSeek}
        className="w-full h-2 bg-mystic-700/60 rounded-full cursor-pointer mb-4 group"
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
        <span className="text-mystic-400 text-xs font-sans w-16">
          {formatTime(currentTime)}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-mystic-300 hover:text-foreground h-8 w-8" onClick={() => skip(-10)}>
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button
            className="h-10 w-10 rounded-full bg-violet-500 hover:bg-violet-400 text-white"
            onClick={togglePlay}
          >
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-mystic-300 hover:text-foreground h-8 w-8" onClick={() => skip(10)}>
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 w-16 justify-end">
          <Button variant="ghost" size="icon" className="text-mystic-400 hover:text-foreground h-8 w-8" onClick={() => setMuted(!muted)}>
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      <div className="text-right">
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
  const playerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    verifyAndLoad();
  }, [courseId]);

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

  const verifyAndLoad = async () => {
    try {
      const meRes = await fetch("/api/student/auth/me");
      if (!meRes.ok) {
        router.push("/aula/login");
        return;
      }
      const res = await fetch(`/api/student/course-content?courseId=${courseId}`);
      if (res.ok) {
        const data = await res.json();
        const items = data.contents || [];
        setContents(items);
        // Auto-select first item
        if (items.length > 0) {
          const sorted = [...items].sort((a: ContentItem, b: ContentItem) => (a.sortOrder || 0) - (b.sortOrder || 0));
          setActiveContent(sorted[0]);
        }
      }
    } catch {
      router.push("/aula/login");
    } finally {
      setLoading(false);
    }
  };

  const getStreamUrl = useCallback((r2Key: string) => {
    return `/api/student/stream?key=${encodeURIComponent(r2Key)}`;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-violet-400" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  const sortedContents = [...contents].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-br from-mystic-950 via-mystic-950 to-violet-950/40 -z-10" />

      <header className="bg-mystic-900/60 backdrop-blur-xl border-b border-mystic-700/40 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-mystic-400" onClick={() => router.push("/aula")}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Aula
            </Button>
            <GraduationCap className="w-5 h-5 text-blue-400" />
            <span className="font-serif text-lg text-foreground">Curso: {courseId}</span>
          </div>
          <Badge variant="outline" className="border-violet-500/30 text-violet-300 gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Solo reproducción
          </Badge>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {contents.length === 0 ? (
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
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Player area */}
            <div className="lg:col-span-2 space-y-4">
              <div ref={playerContainerRef} className="select-none" style={{ userSelect: "none" }}>
                {activeContent ? (
                  <>
                    {getFileType(activeContent.fileName, activeContent.fileType) === "video" && (
                      <div className="relative rounded-xl overflow-hidden border border-mystic-700/40 bg-black">
                        <video
                          key={activeContent.id}
                          controls
                          controlsList="nodownload nofullscreen noremoteplayback"
                          disablePictureInPicture
                          disableRemotePlayback
                          className="w-full max-h-[70vh]"
                          onContextMenu={(e) => e.preventDefault()}
                        >
                          <source src={getStreamUrl(activeContent.r2Key)} type={activeContent.fileName.endsWith(".webm") ? "video/webm" : "video/mp4"} />
                          Tu navegador no soja la reproducción de video.
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
                      <div className="bg-mystic-900/80 rounded-xl border border-mystic-700/40 overflow-hidden" style={{ height: "70vh" }}>
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

                    {/* Active content info */}
                    <div className="mt-3">
                      <h2 className="font-serif text-xl text-foreground">{activeContent.title}</h2>
                      {activeContent.description && (
                        <p className="text-mystic-300 text-sm font-sans mt-1">{activeContent.description}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="bg-mystic-900/60 rounded-xl border border-mystic-700/40 p-12 text-center">
                    <Play className="w-12 h-12 text-mystic-600 mx-auto mb-3" />
                    <p className="text-mystic-400 font-serif">Seleccioná una clase para reproducir</p>
                  </div>
                )}
              </div>
            </div>

            {/* Playlist sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-mystic-900/60 border-mystic-700/40 sticky top-20">
                <CardContent className="p-4">
                  <h3 className="text-mystic-400 text-xs font-josefin uppercase tracking-wider mb-3">
                    Contenido del curso ({sortedContents.length})
                  </h3>
                  <div className="space-y-1 max-h-[calc(100vh-12rem)] overflow-y-auto">
                    {sortedContents.map((item, index) => {
                      const ft = getFileType(item.fileName, item.fileType);
                      const config = fileTypeConfig[ft] || fileTypeConfig.document;
                      const isActive = activeContent?.id === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveContent(item)}
                          className={`w-full text-left px-3 py-3 rounded-lg transition-all text-sm group ${
                            isActive
                              ? "bg-violet-500/20 border border-violet-500/30 text-violet-200"
                              : "hover:bg-mystic-800/60 text-mystic-300 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              isActive ? "bg-violet-500/30" : "bg-mystic-800/60"
                            }`}>
                              {isActive ? (
                                <Play className="w-3.5 h-3.5 text-violet-300" />
                              ) : (
                                <span className="text-mystic-500 text-xs font-sans">{index + 1}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate font-sans">{item.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-xs ${config.color}`}>{config.label}</span>
                                {item.description && (
                                  <span className="text-mystic-500 text-xs font-sans truncate">
                                    · {item.description}
                                  </span>
                                )}
                              </div>
                            </div>
                            {!isActive && (
                              <ChevronRight className="w-4 h-4 text-mystic-600 group-hover:text-mystic-400 shrink-0 transition-colors" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      <Toaster richColors position="top-center" />
    </div>
  );
}
