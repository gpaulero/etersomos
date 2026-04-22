import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "etersomos@gmail.com";

/* ── POST: Confirm crystal order (save to DB + send email) ────────────── */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      address,
      city,
      province,
      postalCode,
      notes,
      items,
      total,
      paymentMethod,
      paymentId,
    } = body;

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !address || !city || !province || !postalCode) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios del comprador." },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "No hay productos en el pedido." },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Método de pago no especificado." },
        { status: 400 }
      );
    }

    // Save order to DB
    const order = await db.crystalOrder.create({
      data: {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone.trim(),
        address: address.trim(),
        city: city.trim(),
        province: province.trim(),
        postalCode: postalCode.trim(),
        notes: notes?.trim() || null,
        items: JSON.stringify(items),
        total: parseFloat(total) || 0,
        paymentMethod,
        paymentId: paymentId || null,
        status: "pagado",
      },
    });

    // Send email notification to admin
    try {
      await sendCrystalOrderEmail({
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        address: order.address,
        city: order.city,
        province: order.province,
        postalCode: order.postalCode,
        notes: order.notes,
        items,
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentId: order.paymentId,
        orderId: order.id,
      });
    } catch (emailError) {
      console.error("Failed to send crystal order email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        message: "Pedido registrado con éxito.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Confirm order error:", error);
    return NextResponse.json(
      { error: "Error al confirmar el pedido. Intentá de nuevo." },
      { status: 500 }
    );
  }
}

/* ── Email Builder ─────────────────────────────────────────────────────── */

interface CrystalOrderEmailData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  notes: string | null;
  items: Array<{ id: number; name: string; quantity: number; price: number }>;
  total: number;
  paymentMethod: string;
  paymentId: string | null;
  orderId: string;
}

function buildCrystalOrderEmail(data: CrystalOrderEmailData): string {
  const paymentLabel =
    data.paymentMethod === "paypal"
      ? "PayPal"
      : data.paymentMethod === "mercadopago"
        ? "MercadoPago"
        : data.paymentMethod;

  const itemsRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 16px; border-bottom: 1px solid #2a252066; color: #f0ebe5;">${item.name}</td>
        <td style="padding: 10px 16px; border-bottom: 1px solid #2a252066; color: #f0ebe5; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 16px; border-bottom: 1px solid #2a252066; color: #d4a853; text-align: right;">$${item.price.toLocaleString("es-AR")} ARS</td>
      </tr>`
    )
    .join("");

  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #161310; border-radius: 12px; overflow: hidden;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1a1510 0%, #0d0b08 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #2a252066;">
        <h1 style="margin: 0; color: #d4a853; font-size: 24px; letter-spacing: 0.1em;">✨ NUEVO PEDIDO DE CRISTALES</h1>
        <p style="margin: 8px 0 0; color: #8a8070; font-size: 14px;">Eter Somos | Registros Akáshicos</p>
      </div>

      <!-- Customer Info -->
      <div style="padding: 24px;">
        <h2 style="margin: 0 0 16px; color: #d4a853; font-size: 18px; border-bottom: 1px solid #2a252066; padding-bottom: 8px;">👤 Datos del Comprador</h2>
        <table style="width: 100%; font-size: 14px;">
          <tr><td style="padding: 4px 0; color: #8a8070;">Nombre:</td><td style="padding: 4px 0; color: #f0ebe5; font-weight: 600;">${data.customerName}</td></tr>
          <tr><td style="padding: 4px 0; color: #8a8070;">Email:</td><td style="padding: 4px 0; color: #f0ebe5;">${data.customerEmail}</td></tr>
          <tr><td style="padding: 4px 0; color: #8a8070;">Teléfono:</td><td style="padding: 4px 0; color: #f0ebe5;">${data.customerPhone}</td></tr>
          <tr><td style="padding: 4px 0; color: #8a8070;">Dirección:</td><td style="padding: 4px 0; color: #f0ebe5;">${data.address}</td></tr>
          <tr><td style="padding: 4px 0; color: #8a8070;">Ciudad:</td><td style="padding: 4px 0; color: #f0ebe5;">${data.city}</td></tr>
          <tr><td style="padding: 4px 0; color: #8a8070;">Provincia:</td><td style="padding: 4px 0; color: #f0ebe5;">${data.province}</td></tr>
          <tr><td style="padding: 4px 0; color: #8a8070;">C.P.:</td><td style="padding: 4px 0; color: #f0ebe5;">${data.postalCode}</td></tr>
        </table>
        ${data.notes ? `<p style="margin: 12px 0 0; color: #8a8070; font-size: 14px;">Notas: <span style="color: #f0ebe5;">${data.notes}</span></p>` : ""}
      </div>

      <!-- Items Table -->
      <div style="padding: 0 24px;">
        <h2 style="margin: 0 0 16px; color: #d4a853; font-size: 18px; border-bottom: 1px solid #2a252066; padding-bottom: 8px;">💎 Cristales</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="border-bottom: 2px solid #d4a85333;">
              <th style="padding: 8px 16px; text-align: left; color: #d4a853;">Producto</th>
              <th style="padding: 8px 16px; text-align: center; color: #d4a853;">Cantidad</th>
              <th style="padding: 8px 16px; text-align: right; color: #d4a853;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 12px 16px; color: #f0ebe5; font-weight: 700; font-size: 16px; text-align: right;">Total:</td>
              <td style="padding: 12px 16px; color: #d4a853; font-weight: 700; font-size: 18px; text-align: right;">$${data.total.toLocaleString("es-AR")} ARS</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Payment Info -->
      <div style="padding: 24px;">
        <h2 style="margin: 0 0 12px; color: #d4a853; font-size: 18px; border-bottom: 1px solid #2a252066; padding-bottom: 8px;">💳 Pago</h2>
        <table style="width: 100%; font-size: 14px;">
          <tr><td style="padding: 4px 0; color: #8a8070;">Método:</td><td style="padding: 4px 0; color: #f0ebe5; font-weight: 600;">${paymentLabel}</td></tr>
          <tr><td style="padding: 4px 0; color: #8a8070;">ID de Pago:</td><td style="padding: 4px 0; color: #f0ebe5; font-family: monospace; font-size: 12px;">${data.paymentId || "N/A"}</td></tr>
          <tr><td style="padding: 4px 0; color: #8a8070;">ID de Pedido:</td><td style="padding: 4px 0; color: #f0ebe5; font-family: monospace; font-size: 12px;">${data.orderId}</td></tr>
        </table>
      </div>

      <!-- Footer -->
      <div style="padding: 16px 24px; text-align: center; border-top: 1px solid #2a252066; color: #5a5545; font-size: 12px;">
        <p>Eter Somos | Registros Akáshicos y Cristales</p>
        <p>Este pedido fue procesado automáticamente.</p>
      </div>
    </div>
  `;
}

async function sendCrystalOrderEmail(data: CrystalOrderEmailData): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const html = buildCrystalOrderEmail(data);

  await resend.emails.send({
    from: "Eter Somos <onboarding@resend.dev>",
    to: [ADMIN_EMAIL],
    subject: `✨ Nuevo pedido de cristales - ${data.customerName} - $${data.total.toLocaleString("es-AR")} ARS`,
    html,
  });
}
