import { NextRequest, NextResponse } from "next/server";
import { getResourceStream } from "@/lib/r2";
import { db } from "@/lib/db";

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

/** Check if a resource is paid (has price > 0) */
async function isPaidResource(key: string): Promise<{ paid: boolean; resourceId: string | null }> {
  try {
    const result = await db.$executeRawUnsafe(
      "SELECT id, price, priceArs FROM Resource WHERE r2Key = ?",
      [key]
    );
    const rows = (result as any)?.rows || [];
    if (rows.length === 0) return { paid: false, resourceId: null };

    const price = Number(rows[0].price) || 0;
    const priceArs = Number(rows[0].priceArs) || 0;
    const isPaid = price > 0 || priceArs > 0;

    return { paid: isPaid, resourceId: rows[0].id as string };
  } catch {
    return { paid: false, resourceId: null };
  }
}

/** Verify a download token against the ResourcePurchase table */
async function verifyDownloadToken(token: string, resourceId: string): Promise<boolean> {
  try {
    const result = await db.$executeRawUnsafe(
      "SELECT id FROM ResourcePurchase WHERE downloadToken = ? AND resourceId = ? AND status = 'pagado'",
      [token, resourceId]
    );
    const rows = (result as any)?.rows || [];
    return rows.length > 0;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get("key");
    const token = request.nextUrl.searchParams.get("token");

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

    const isStreamable = isStreamableFile(key);

    // ── Streamable files (video/audio): require X-Stream-Request header or admin auth ──
    if (isStreamable) {
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

    // ── Non-streamable paid files: require a valid download token ──
    if (!isStreamable) {
      const { paid, resourceId } = await isPaidResource(key);

      if (paid && resourceId) {
        // This is a paid downloadable resource — verify the token
        if (!token) {
          return NextResponse.json(
            { error: "Este recurso requiere compra. Obtenelo realizando el pago primero." },
            { status: 403 }
          );
        }

        const isValid = await verifyDownloadToken(token, resourceId);
        if (!isValid) {
          return NextResponse.json(
            { error: "Token de descarga inválido o expirado. Necesitás comprar el recurso primero." },
            { status: 403 }
          );
        }
      }
      // Free non-streamable files: no token needed, direct download
    }

    // ── Stream the file from R2 ──
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
    const isMedia = isStreamable;

    // For paid downloadable files, use attachment disposition and no-cache
    const disposition = isMedia
      ? `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`
      : `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`;

    return new NextResponse(result.Body as ReadableStream, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": disposition,
        "Cache-Control": isMedia
          ? "no-store, no-cache, must-revalidate, proxy-revalidate"
          : "private, max-age=300",
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
