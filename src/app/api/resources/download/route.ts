import { NextRequest, NextResponse } from "next/server";
import { getResourceStream } from "@/lib/r2";

export const runtime = "nodejs";
export const maxDuration = 15;

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

    const result = await getResourceStream(key);

    if (!result.Body) {
      return NextResponse.json(
        { error: "Archivo no encontrado" },
        { status: 404 }
      );
    }

    const fileName = key.split("/").pop() || "download";
    const contentType = result.ContentType || "application/octet-stream";

    return new NextResponse(result.Body as ReadableStream, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "Cache-Control": "public, max-age=3600",
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
