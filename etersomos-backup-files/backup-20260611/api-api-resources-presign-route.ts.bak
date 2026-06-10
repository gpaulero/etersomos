import { NextRequest, NextResponse } from "next/server";
import { getPresignedUploadUrl } from "@/lib/r2";

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
    const { fileName, contentType } = await request.json();

    if (!fileName || typeof fileName !== "string") {
      return NextResponse.json(
        { error: "Se requiere el campo 'fileName'" },
        { status: 400 }
      );
    }

    // Sanitize fileName - only allow safe characters
    const sanitized = fileName.replace(/[^a-zA-Z0-9._\-() ]/g, "_");
    const type = contentType || "application/octet-stream";

    const { url, key } = await getPresignedUploadUrl(sanitized, type);

    return NextResponse.json({ uploadUrl: url, key });
  } catch (err) {
    console.error("Error generating presigned URL:", err);
    return NextResponse.json(
      { error: "Error al generar URL de subida" },
      { status: 500 }
    );
  }
}
