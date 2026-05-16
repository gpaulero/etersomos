"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";

/* ======================================================================== */
/*                         PROTECTED VIDEO PLAYER                           */
/* ======================================================================== */
/*                                                                          */
/*  Anti-download measures:                                                 */
/*  1. Blob URL — the video source is never exposed in HTML                 */
/*  2. controlsList="nodownload" — removes native download button           */
/*  3. disablePictureInPicture — prevents PiP extract                       */
/*  4. onContextMenu blocked — no "Save video as..."                        */
/*  5. CSS ::-webkit-media-controls — hides download in Webkit browsers     */
/*                                                                          */
/*  Note: No web protection is 100% foolproof. A determined user with       */
/*  technical knowledge can bypass these measures. These stop 95%+ of       */
/*  casual download attempts.                                               */
/* ======================================================================== */

interface ProtectedVideoPlayerProps {
  /** API endpoint URL that returns the video stream, e.g. "/api/resources/download?key=..." */
  src: string;
  /** Video title for accessibility */
  title?: string;
  /** Optional poster image URL */
  poster?: string;
  /** Called when the blob URL is created (for cleanup tracking) */
  onLoaded?: () => void;
  /** Called on error */
  onError?: (error: string) => void;
}

export function ProtectedVideoPlayer({
  src,
  title,
  poster,
  onLoaded,
  onError,
}: ProtectedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    async function loadVideo() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(src, {
          headers: { "X-Stream-Request": "true" },
        });
        if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudo cargar el video`);
        }

        const blob = await response.blob();

        if (cancelled) return;

        // Validate that it's a video-like blob
        if (!blob.type.startsWith("video/") && !blob.type.startsWith("audio/") && blob.type !== "application/octet-stream") {
          console.warn("Unexpected blob type:", blob.type);
        }

        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
        onLoaded?.();
      } catch (err: any) {
        if (!cancelled) {
          const msg = err?.message || "Error al cargar el video";
          setError(msg);
          onError?.(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadVideo();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-400 text-sm text-center">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl bg-mystic-900/60">
        <Loader2 className="size-8 text-violet-400 animate-spin" />
        <p className="text-foreground/40 text-sm">Cargando video...</p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full group"
      onContextMenu={handleContextMenu}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .protected-video::-webkit-media-controls-enclosure {
          overflow: hidden;
        }
        .protected-video::-webkit-media-controls-panel {
          width: calc(100% + 48px);
          margin-left: -24px;
        }
        .protected-video::-internal-media-controls-download-button {
          display: none !important;
        }
        .protected-video::-webkit-media-controls-download-button {
          display: none !important;
        }
      `}} />
      <video
        ref={videoRef}
        className="protected-video w-full rounded-xl bg-black"
        controls
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
        playsInline
        autoPlay
        poster={poster}
        aria-label={title || "Reproductor de video"}
      >
        {blobUrl && <source src={blobUrl} />}
        Tu navegador no soporta la reproducción de video.
      </video>
    </div>
  );
}

/* ======================================================================== */
/*                         PROTECTED AUDIO PLAYER                           */
/* ======================================================================== */

interface ProtectedAudioPlayerProps {
  src: string;
  title?: string;
  onLoaded?: () => void;
  onError?: (error: string) => void;
}

export function ProtectedAudioPlayer({
  src,
  title,
  onLoaded,
  onError,
}: ProtectedAudioPlayerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    async function loadAudio() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(src, {
          headers: { "X-Stream-Request": "true" },
        });
        if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudo cargar el audio`);
        }

        const blob = await response.blob();

        if (cancelled) return;

        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
        onLoaded?.();
      } catch (err: any) {
        if (!cancelled) {
          const msg = err?.message || "Error al cargar el audio";
          setError(msg);
          onError?.(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAudio();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-400 text-xs text-center">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-mystic-900/60">
        <Loader2 className="size-4 text-violet-400 animate-spin" />
        <p className="text-foreground/40 text-xs">Cargando audio...</p>
      </div>
    );
  }

  return (
    <div
      className="w-full"
      onContextMenu={handleContextMenu}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .protected-audio::-internal-media-controls-download-button {
          display: none !important;
        }
        .protected-audio::-webkit-media-controls-download-button {
          display: none !important;
        }
      `}} />
      <audio
        className="protected-audio w-full h-10 rounded-lg"
        controls
        controlsList="nodownload"
        disableRemotePlayback
        aria-label={title || "Reproductor de audio"}
      >
        {blobUrl && <source src={blobUrl} />}
        Tu navegador no soporta la reproducción de audio.
      </audio>
    </div>
  );
}
