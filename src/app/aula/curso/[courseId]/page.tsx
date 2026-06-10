"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Download,
  FileText,
  GraduationCap,
  Video,
  Headphones,
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

const fileTypeIcons: Record<string, React.ReactNode> = {
  video: <Video className="w-5 h-5 text-blue-400" />,
  audio: <Headphones className="w-5 h-5 text-violet-400" />,
  pdf: <FileText className="w-5 h-5 text-red-400" />,
  document: <FileText className="w-5 h-5 text-amber-400" />,
};

function getFileTypeCategory(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) return "video";
  if (["mp3", "wav", "ogg", "m4a", "flac", "aac"].includes(ext)) return "audio";
  if (["pdf"].includes(ext)) return "pdf";
  return "document";
}

export default function CursoPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyAndLoad();
  }, [courseId]);

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
        setContents(data.contents || []);
      }
    } catch {
      router.push("/aula/login");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (item: ContentItem) => {
    try {
      const res = await fetch(`/api/resources/download?key=${encodeURIComponent(item.r2Key)}&student=1`);
      if (!res.ok) {
        toast.error("No se pudo descargar el archivo");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Error al descargar");
    }
  };

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

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-br from-mystic-950 via-mystic-950 to-violet-950/40 -z-10" />

      <header className="bg-mystic-900/60 backdrop-blur-xl border-b border-mystic-700/40 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-mystic-400" onClick={() => router.push("/aula")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Aula
          </Button>
          <GraduationCap className="w-5 h-5 text-blue-400" />
          <span className="font-serif text-lg text-foreground">Contenido del Curso</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {contents.length === 0 ? (
          <Card className="bg-mystic-900/60 border-mystic-700/40">
            <CardContent className="p-12 text-center">
              <GraduationCap className="w-12 h-12 text-mystic-600 mx-auto mb-4" />
              <h3 className="font-serif text-xl text-foreground mb-2">Sin contenido disponible</h3>
              <p className="text-mystic-400 font-sans text-sm">
                Este curso aún no tiene material disponible. Fer lo estará subiendo pronto.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {contents
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((item) => {
                const category = getFileTypeCategory(item.fileName);
                const icon = fileTypeIcons[category] || fileTypeIcons.document;
                return (
                  <Card
                    key={item.id}
                    className="bg-mystic-900/60 border-mystic-700/40 backdrop-blur hover:border-violet-500/30 transition-colors"
                  >
                    <CardContent className="p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="shrink-0">{icon}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-foreground truncate">{item.title}</h3>
                          {item.description && (
                            <p className="text-mystic-400 text-sm font-sans truncate">{item.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs text-mystic-400 border-mystic-600/40">
                              {item.fileName.split(".").pop()?.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-violet-400/40 text-violet-300 hover:bg-violet-400/10 gap-1 shrink-0"
                        onClick={() => handleDownload(item)}
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Descargar</span>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </main>
      <Toaster richColors position="top-center" />
    </div>
  );
}
