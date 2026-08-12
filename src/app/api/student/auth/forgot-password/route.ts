import { NextRequest, NextResponse } from "next/server";
import { createPasswordResetToken } from "@/lib/student-auth";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const normalized = String(email || "").trim().toLowerCase();
    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return NextResponse.json({ error: "Ingresá un email válido" }, { status: 400 });
    }
    const result = await createPasswordResetToken(normalized);
    if (result) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.etersomos.com";
      await sendPasswordResetEmail({
        customerEmail: normalized,
        resetUrl: `${baseUrl}/aula/reset?token=${result.token}`,
      });
    }
    // Respuesta genérica: no revelar si el email existe
    return NextResponse.json({
      success: true,
      message: "Si existe una cuenta con ese email, te enviamos las instrucciones.",
    });
  } catch (error) {
    console.error("[forgot-password]", error);
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
  }
}
