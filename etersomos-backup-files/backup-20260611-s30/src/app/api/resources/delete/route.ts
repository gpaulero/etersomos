import { NextRequest, NextResponse } from "next/server";
import { deleteResource } from "@/lib/r2";

export const runtime = "nodejs";
export const maxDuration = 15;

function verifyAuth(request: NextRequest): boolean {
  const token = request.headers
    .get("authorization")
    ?.replace("Bearer ", "");
  if (!token) return false;
  return token === process.env.ADMIN_API_SECRET;
}

export async function POST(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { key } = body;

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { error: "Se requiere el campo 'key'" },
        { status: 400 }
      );
    }

    // Only allow deleting from recursos/ prefix
    if (!key.startsWith("recursos/")) {
      return NextResponse.json(
        { error: "Ruta de archivo no permitida" },
        { status: 400 }
      );
    }

    await deleteResource(key);

    return NextResponse.json({ message: "Archivo eliminado correctamente" });
  } catch (err) {
    console.error("Error deleting resource:", err);
    return NextResponse.json(
      { error: "Error al eliminar el archivo" },
      { status: 500 }
    );
  }
}
