import { NextRequest, NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/student-auth";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Enlace inválido" }, { status: 400 });
    }
    if (!password || String(password).length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
    }
    const ok = await resetPasswordWithToken(token, String(password));
    if (!ok) {
      return NextResponse.json({ error: "El enlace expiró o es inválido. Pedí uno nuevo." }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[reset-password]", error);
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
  }
}
