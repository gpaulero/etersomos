import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { db, ensureSchema } from "@/lib/db";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "etersomos@gmail.com";
const SENDER = "Eter Somos <onboarding@resend.dev>";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "El email es obligatorio" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email invalido" },
        { status: 400 }
      );
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.error("[Newsletter] RESEND_API_KEY not configured");
      return NextResponse.json(
        { error: "Servicio de email no configurado" },
        { status: 500 }
      );
    }

    await ensureSchema();

    const id = crypto.randomUUID();
    const trimmedEmail = email.trim().toLowerCase();

    try {
      await db.newsletterSubscriber.create({
        data: {
          id,
          email: trimmedEmail,
          subscribedAt: new Date().toISOString(),
        },
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes("UNIQUE constraint failed") || msg.includes("duplicate") || msg.includes("unique")) {
        return NextResponse.json(
          { error: "Este email ya esta suscrito" },
          { status: 409 }
        );
      }
      throw error;
    }

    const resend = new Resend(resendKey);

    await resend.emails.send({
      from: SENDER,
      to: [ADMIN_EMAIL],
      subject: `Nuevo suscriptor al newsletter — ${trimmedEmail}`,
      html: `
        <div style="max-width: 560px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #161310; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1a1510 0%, #0d0b08 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #2a252066;">
            <h1 style="margin: 0; color: #d4a853; font-size: 22px; letter-spacing: 0.1em;">NUEVO SUSCRIPTOR NEWSLETTER</h1>
            <p style="margin: 8px 0 0; color: #8a8070; font-size: 13px;">Eter Somos | Recursos Gratuitos</p>
          </div>
          <div style="padding: 24px;">
            <h2 style="margin: 0 0 16px; color: #d4a853; font-size: 17px; border-bottom: 1px solid #2a252066; padding-bottom: 8px;">Datos del Suscriptor</h2>
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #8a8070;">Email:</td>
                <td style="padding: 6px 0; color: #f0ebe5;">${escapeHtml(trimmedEmail)}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #8a8070;">Fecha:</td>
                <td style="padding: 6px 0; color: #f0ebe5;">${new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Cordoba" })}</td>
              </tr>
            </table>
          </div>
          <div style="padding: 0 24px 24px;">
            <div style="margin-top: 16px; padding: 12px 16px; background: #d4a85310; border: 1px solid #d4a85330; border-radius: 8px;">
              <p style="margin: 0; color: #d4a853; font-size: 13px;">
                El usuario se suscribio desde la seccion Recursos Gratuitos del sitio web.
              </p>
            </div>
          </div>
          <div style="padding: 16px 24px; text-align: center; border-top: 1px solid #2a252066; color: #5a5545; font-size: 12px;">
            <p>Eter Somos | Newsletter</p>
            <p>Registro automatico desde el sitio web.</p>
          </div>
        </div>
      `,
    });

    console.log(`[Newsletter] New subscriber: ${trimmedEmail}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Newsletter] Error processing subscription:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
