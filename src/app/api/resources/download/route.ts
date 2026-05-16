import { NextRequest, NextResponse } from "next/server";
import { getResourceStream } from "@/lib/r2";

export const runtime = "nodejs";
export const maxDuration = 15;

/** File extensions that should only be streamed (not directly downloadable) */
const STREAMABLE_EXTENSIONS = new Set([
  ".mp4", ".webm", ".mov", ".avi", ".mkv",
  ".mp3", ".wav", ".ogg", ".m4a", ".flac", ".aac",
]);

function isStreamableFile(key: string): boolean {
  const fileName = key.split("/").pop() || "";
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex === -1) return false;
  const ext = fileName.substring(dotIndex).toLowerCase();
  return STREAMABLE_EXTENSIONS.has(ext);
}

export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get("key");

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { error: "Se requiere el parametro 'key'" },
        { status: 400 }
      );
    }

    if (!key.startsWith("recursos/")) {
      return NextResponse.json(
        { error: "Ruta de archivo no permitida" },
        { status: 400 }
      );
    }

    // For video/audio files, only allow access from:
    // 1. Our protected player (sends X-Stream-Request header)
    // 2. Admin users (sends Authorization header with valid token)
    if (isStreamableFile(key)) {
      const streamHeader = request.headers.get("x-stream-request");
      const authHeader = request.headers.get("authorization")?.replace("Bearer ", "");
      const isAdmin = authHeader && authHeader === process.env.ADMIN_API_SECRET;

      if (streamHeader !== "true" && !isAdmin) {
        return NextResponse.json(
          { error: "Este contenido solo se puede reproducir, no descargar" },
          { status: 403 }
        );
      }
    }

    const result = await getResourceStream(key);

    if (!result.Body) {
      return NextResponse.json(
        { error: "Archivo no encontrado" },
        { status: 404 }
      );
    }

    const fileName = key.split("/").pop() || "download";
    const contentType = result.ContentType || "application/octet-stream";

    // For streamable files, never set Content-Disposition: attachment
    // and use no-cache to prevent browser caching that could be exploited
    const isMedia = isStreamableFile(key);

    return new NextResponse(result.Body as ReadableStream, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "Cache-Control": isMedia
          ? "no-store, no-cache, must-revalidate, proxy-revalidate"
          : "public, max-age=3600",
        ...(isMedia ? {
          "X-Content-Type-Options": "nosniff",
        } : {}),
      },
    });
  } catch (err) {
    console.error("Error downloading resource:", err);
    return NextResponse.json(
      { error: "Error al descargar el archivo" },
      { status: 500 }
    );
  }
}
