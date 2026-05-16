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
    const { name, email, membershipId, membershipName } = body;

    // Validate required fields
    if (!name || !email || !membershipId || !membershipName) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.error("[Membership] RESEND_API_KEY not configured");
      return NextResponse.json(
        { error: "Servicio de email no configurado" },
        { status: 500 }
      );
    }

    // Ensure DB schema (creates Membership table if not exists)
    await ensureSchema();

    // Save to database
    await db.membership.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        membershipId,
        membershipName,
        status: "activa",
      },
    });

    const resend = new Resend(resendKey);

    // Send admin notification
    await resend.emails.send({
      from: SENDER,
      to: [ADMIN_EMAIL],
      subject: `Nueva suscripcion registrada — ${membershipName} — ${name}`,
      html: `
        <div style="max-width: 560px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #161310; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1a1510 0%, #0d0b08 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #2a252066;">
            <h1 style="margin: 0; color: #d4a853; font-size: 22px; letter-spacing: 0.1em;">NUEVA SUSCRIPCION REGISTRADA</h1>
            <p style="margin: 8px 0 0; color: #8a8070; font-size: 13px;">Eter Somos | Membresias</p>
          </div>
          <div style="padding: 24px;">
            <h2 style="margin: 0 0 16px; color: #d4a853; font-size: 17px; border-bottom: 1px solid #2a252066; padding-bottom: 8px;">Datos del Suscriptor</h2>
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #8a8070;">Nombre:</td>
                <td style="padding: 6px 0; color: #f0ebe5; font-weight: 600;">${escapeHtml(name)}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #8a8070;">Email:</td>
                <td style="padding: 6px 0; color: #f0ebe5;">${escapeHtml(email)}</td>
              </tr>
            </table>
          </div>
          <div style="padding: 0 24px 24px;">
            <h2 style="margin: 0 0 12px; color: #d4a853; font-size: 17px; border-bottom: 1px solid #2a252066; padding-bottom: 8px;">Membresia Elegida</h2>
            <div style="background: #1a1510; border: 1px solid #2a252066; border-radius: 8px; padding: 16px;">
              <p style="margin: 0; color: #f0ebe5; font-size: 16px; font-weight: 600;">${escapeHtml(membershipName)}</p>
              <p style="margin: 6px 0 0; color: #8a8070; font-size: 12px;">ID: ${escapeHtml(membershipId)}</p>
              <p style="margin: 8px 0 0; color: #8a8070; font-size: 13px;">
                Registrado: ${new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Cordoba" })}
              </p>
            </div>
            <div style="margin-top: 16px; padding: 12px 16px; background: #d4a85310; border: 1px solid #d4a85330; border-radius: 8px;">
              <p style="margin: 0; color: #d4a853; font-size: 13px;">
                El suscriptor completo el formulario de inscripcion. Pendiente de pago en MercadoPago o PayPal.
              </p>
            </div>
          </div>
          <div style="padding: 16px 24px; text-align: center; border-top: 1px solid #2a252066; color: #5a5545; font-size: 12px;">
            <p>Eter Somos | Membresias</p>
            <p>Registro automatico desde el sitio web.</p>
          </div>
        </div>
      `,
    });

    console.log(`[Membership] Subscription registered: ${name} (${email}) -> ${membershipName}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Membership] Error processing subscription:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
