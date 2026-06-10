import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_APP_PASSWORD;

  if (!user || !pass) {
    return NextResponse.json(
      { error: "SMTP_USER or SMTP_APP_PASSWORD not configured", user: user || "MISSING", pass: pass ? "***configured***" : "MISSING" },
      { status: 500 }
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    // Verify connection
    await transporter.verify();

    // Send test email
    const info = await transporter.sendMail({
      from: `"Eter Somos" <${user}>`,
      to: user, // send to self
      subject: "Test SMTP - Eter Somos",
      html: `
        <div style="max-width: 500px; margin: 0 auto; font-family: sans-serif; background: #161310; border-radius: 12px; padding: 32px;">
          <h1 style="color: #d4a853;">Test SMTP Exitoso</h1>
          <p style="color: #f0ebe5;">Este email confirma que Gmail SMTP esta funcionando correctamente en Eter Somos.</p>
          <p style="color: #8a8070; font-size: 12px;">Enviado: ${new Date().toISOString()}</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully!",
      messageId: info.messageId,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to send email", details: msg },
      { status: 500 }
    );
  }
}
