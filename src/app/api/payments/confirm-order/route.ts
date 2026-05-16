import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendAdminNotification, sendCustomerConfirmation } from "@/lib/email";

type OrderType = "crystal_order" | "course_enrollment" | "reading";

/* ── POST: Confirm any order type (save to DB + send emails) ─────────── */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type = "crystal_order",
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
      extraData,
    } = body as {
      type?: OrderType;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      address?: string;
      city?: string;
      province?: string;
      postalCode?: string;
      notes?: string;
      items: Array<{ id: number; name: string; quantity: number; price: number }>;
      total: number;
      paymentMethod: string;
      paymentId?: string | null;
      extraData?: Record<string, unknown>;
    };

    // Validate required fields for all types
    if (!customerName || !customerEmail) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios: nombre y email." },
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

    // Handle based on order type
    switch (type) {
      case "crystal_order":
        return handleCrystalOrder(body);
      case "course_enrollment":
        return handleCourseEnrollment(body);
      case "reading":
        return handleReadingOrder(body);
      default:
        return NextResponse.json(
          { error: `Tipo de pedido no válido: ${type}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Confirm order error:", error);
    return NextResponse.json(
      { error: "Error al confirmar el pedido. Intentá de nuevo." },
      { status: 500 }
    );
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   CRYSTAL ORDER HANDLER
   ═══════════════════════════════════════════════════════════════════════ */

async function handleCrystalOrder(body: Record<string, unknown>) {
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
  } = body as {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    notes?: string;
    items: Array<{ id: number; name: string; quantity: number; price: number }>;
    total: number;
    paymentMethod: string;
    paymentId?: string | null;
  };

  // Crystal orders require shipping address
  if (!customerPhone || !address || !city || !province || !postalCode) {
    return NextResponse.json(
      { error: "Faltan campos obligatorios del comprador (teléfono, dirección)." },
      { status: 400 }
    );
  }

  // Save to DB
  const order = await db.crystalOrder.create({
    data: {
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone.trim(),
      address: address.trim(),
      city: city.trim(),
      province: province.trim(),
      postalCode: postalCode.trim(),
      notes: (notes as string)?.trim() || null,
      items: JSON.stringify(items),
      total: parseFloat(String(total)) || 0,
      paymentMethod,
      paymentId: paymentId || null,
      status: "pagado",
    },
  });

  // Send emails (fire and forget, don't block response)
  sendEmails({
    type: "crystal",
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    items,
    total: order.total,
    paymentMethod: order.paymentMethod,
    paymentId: order.paymentId,
    orderId: order.id,
    extraData: {
      address: order.address,
      city: order.city,
      province: order.province,
      postalCode: order.postalCode,
      notes: order.notes,
    },
  });

  return NextResponse.json(
    {
      success: true,
      orderId: order.id,
      type: "crystal_order",
      message: "Pedido de cristales registrado con éxito.",
    },
    { status: 201 }
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   COURSE ENROLLMENT HANDLER
   ═══════════════════════════════════════════════════════════════════════ */

async function handleCourseEnrollment(body: Record<string, unknown>) {
  const {
    customerName,
    customerEmail,
    customerPhone,
    items,
    total,
    paymentMethod,
    paymentId,
    extraData,
  } = body as {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    items: Array<{ id: number; name: string; quantity: number; price: number }>;
    total: number;
    paymentMethod: string;
    paymentId?: string | null;
    extraData?: Record<string, unknown>;
  };

  // Save to CrystalOrder table with a marker (reuse existing model)
  // The items field will contain course info, and notes will contain enrollment data
  const order = await db.crystalOrder.create({
    data: {
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone?.trim() || "N/A",
      address: "Curso online",
      city: "N/A",
      province: "N/A",
      postalCode: "0000",
      notes: `CURSO: ${JSON.stringify(extraData || {})}`,
      items: JSON.stringify(items),
      total: parseFloat(String(total)) || 0,
      paymentMethod,
      paymentId: paymentId || null,
      status: "pagado",
    },
  });

  // Send emails
  sendEmails({
    type: "course",
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    items,
    total: order.total,
    paymentMethod: order.paymentMethod,
    paymentId: order.paymentId,
    orderId: order.id,
    extraData: extraData || {},
  });

  return NextResponse.json(
    {
      success: true,
      orderId: order.id,
      type: "course_enrollment",
      message: "Inscripción al curso registrada con éxito.",
    },
    { status: 201 }
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   READING ORDER HANDLER (via MP/PayPal)
   ═══════════════════════════════════════════════════════════════════════ */

async function handleReadingOrder(body: Record<string, unknown>) {
  const {
    customerName,
    customerEmail,
    customerPhone,
    items,
    total,
    paymentMethod,
    paymentId,
    extraData,
  } = body as {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    items: Array<{ id: number; name: string; quantity: number; price: number }>;
    total: number;
    paymentMethod: string;
    paymentId?: string | null;
    extraData?: Record<string, unknown>;
  };

  const formData = (extraData?.formData || {}) as Record<string, string>;

  // Save to ReadingBooking
  const booking = await db.readingBooking.create({
    data: {
      name: customerName.trim(),
      email: customerEmail.trim().toLowerCase(),
      phone: customerPhone?.trim() || "",
      readingType: "Lectura Akáshica Individual",
      message: [
        `Pago: ${paymentMethod}`,
        `Pregunta 1: ${formData.pregunta1 || ""}`,
        `Pregunta 2: ${formData.pregunta2 || ""}`,
        formData.contextoAdicional ? `Contexto: ${formData.contextoAdicional}` : "",
        `Formulario completo: ${JSON.stringify(formData)}`,
      ]
        .filter(Boolean)
        .join("\n"),
      status: "pendiente",
    },
  });

  // Send emails
  sendEmails({
    type: "reading",
    customerName: booking.name,
    customerEmail: booking.email,
    customerPhone: booking.phone,
    items,
    total: parseFloat(String(total)) || 0,
    paymentMethod,
    paymentId: paymentId || null,
    orderId: booking.id,
    extraData: extraData || {},
  });

  return NextResponse.json(
    {
      success: true,
      orderId: booking.id,
      type: "reading",
      message: "Solicitud de lectura registrada con éxito.",
    },
    { status: 201 }
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   EMAIL SENDING HELPER
   ═══════════════════════════════════════════════════════════════════════ */

interface EmailPayload {
  type: "crystal" | "course" | "reading";
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: Array<{ id: number; name: string; quantity: number; price: number }>;
  total: number;
  paymentMethod: string;
  paymentId: string | null;
  orderId: string;
  extraData?: Record<string, unknown>;
}

function sendEmails(payload: EmailPayload): void {
  // Fire and forget — never block the response
  (async () => {
    try {
      await sendAdminNotification({
        type: payload.type,
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        customerPhone: payload.customerPhone,
        items: payload.items,
        total: payload.total,
        paymentMethod: payload.paymentMethod,
        paymentId: payload.paymentId || undefined,
        orderId: payload.orderId,
        extraData: payload.extraData,
      });
    } catch (err) {
      console.error(`[Email] Failed to send admin notification for ${payload.type}:`, err);
    }

    try {
      await sendCustomerConfirmation({
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        type: payload.type,
        items: payload.items,
        total: payload.total,
        paymentMethod: payload.paymentMethod,
      });
    } catch (err) {
      console.error(`[Email] Failed to send customer confirmation for ${payload.type}:`, err);
      // In Resend sandbox, customer emails will fail unless the customer's email is verified
      // This is expected and will work once a custom domain is configured
    }
  })();
}
