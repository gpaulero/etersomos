import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendAdminNotification, sendCustomerConfirmationWithCredentials, sendCustomerConfirmationExistingStudent } from "@/lib/email";
import { ensureStudentWithEnrollment } from "@/lib/student-auth";

type OrderType = "crystal_order" | "course_enrollment" | "mentoria_enrollment" | "reading" | "resource_purchase";

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
      case "mentoria_enrollment":
        return handleMentoriaEnrollment(body);
      case "reading":
        return handleReadingOrder(body);
      case "resource_purchase":
        return handleResourcePurchase(body);
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
  // Crystal orders don't auto-enroll — no enrollmentType
  sendEmailsAndEnroll({
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

  // Send admin email + auto-enroll + ONE combined customer email
  sendEmailsAndEnroll({
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
    enrollmentType: 'curso',
    enrollmentTitle: items[0]?.name || 'Curso',
    referenceId: (extraData?.courseId as string) || items[0]?.id?.toString() || '',
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
   MENTORÍA ENROLLMENT HANDLER
   ═══════════════════════════════════════════════════════════════════════ */

async function handleMentoriaEnrollment(body: Record<string, unknown>) {
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
  const order = await db.crystalOrder.create({
    data: {
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone?.trim() || "N/A",
      address: "Mentoría online",
      city: "N/A",
      province: "N/A",
      postalCode: "0000",
      notes: `MENTORIA: ${JSON.stringify(extraData || {})}`,
      items: JSON.stringify(items),
      total: parseFloat(String(total)) || 0,
      paymentMethod,
      paymentId: paymentId || null,
      status: "pagado",
    },
  });

  // Send admin email + auto-enroll + ONE combined customer email
  sendEmailsAndEnroll({
    type: "mentoria",
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    items,
    total: order.total,
    paymentMethod: order.paymentMethod,
    paymentId: order.paymentId,
    orderId: order.id,
    extraData: extraData || {},
    enrollmentType: 'mentoria',
    enrollmentTitle: items[0]?.name || 'Mentoría Akáshica',
  });

  return NextResponse.json(
    {
      success: true,
      orderId: order.id,
      type: "mentoria_enrollment",
      message: "Inscripción a mentoría registrada con éxito.",
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

  // Send admin email + auto-enroll + ONE combined customer email
  sendEmailsAndEnroll({
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
    enrollmentType: 'lectura',
    enrollmentTitle: 'Lectura Akáshica Individual',
    referenceId: booking.id, // Each booking = unique enrollment
    notes: `Pago: ${paymentMethod}`,
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
   RESOURCE PURCHASE HANDLER
   ═══════════════════════════════════════════════════════════════════════ */

async function handleResourcePurchase(body: Record<string, unknown>) {
  const {
    customerName,
    customerEmail,
    items,
    total,
    paymentMethod,
    paymentId,
    extraData,
  } = body as {
    customerName: string;
    customerEmail: string;
    items: Array<{ id: number; name: string; quantity: number; price: number }>;
    total: number;
    paymentMethod: string;
    paymentId?: string | null;
    extraData?: Record<string, unknown>;
  };

  const resourceId = extraData?.resourceId as string || "";
  const resourceTitle = extraData?.resourceTitle as string || items[0]?.name || "Recurso";
  const r2Key = extraData?.r2Key as string || "";

  if (!resourceId) {
    return NextResponse.json(
      { error: "Falta el ID del recurso." },
      { status: 400 }
    );
  }

  // Create ResourcePurchase table if not exists
  const CREATE_PURCHASE_TABLE_SQL = [
    "CREATE TABLE IF NOT EXISTS ResourcePurchase (",
    "id TEXT NOT NULL PRIMARY KEY,",
    "resourceId TEXT NOT NULL,",
    "resourceTitle TEXT NOT NULL DEFAULT '',",
    "customerName TEXT NOT NULL,",
    "customerEmail TEXT NOT NULL,",
    "paymentMethod TEXT NOT NULL,",
    "paymentId TEXT,",
    "amount REAL NOT NULL DEFAULT 0,",
    "downloadToken TEXT NOT NULL UNIQUE,",
    "status TEXT NOT NULL DEFAULT 'pendiente',",
    "createdAt TEXT NOT NULL DEFAULT (datetime('now'))",
    ")",
  ].join(" ");
  await db.$executeRawUnsafe(CREATE_PURCHASE_TABLE_SQL, []);

  // Generate purchase ID
  const idResult = await db.$executeRawUnsafe("SELECT lower(hex(randomblob(12))) as id", []);
  const purchaseId = (idResult as any)?.rows?.[0]?.id;
  if (!purchaseId) throw new Error("Failed to generate purchase ID");

  // Generate download token
  const tokenResult = await db.$executeRawUnsafe("SELECT lower(hex(randomblob(16))) as token", []);
  const downloadToken = (tokenResult as any)?.rows?.[0]?.token;
  if (!downloadToken) throw new Error("Failed to generate download token");

  // Save purchase to DB
  await db.$executeRawUnsafe(
    "INSERT INTO ResourcePurchase (id, resourceId, resourceTitle, customerName, customerEmail, paymentMethod, paymentId, amount, downloadToken, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      purchaseId,
      resourceId,
      resourceTitle,
      customerName.trim(),
      customerEmail.trim().toLowerCase(),
      paymentMethod,
      paymentId || null,
      parseFloat(String(total)) || 0,
      downloadToken,
      "pagado",
    ]
  );

  // Send admin email + customer confirmation (no enrollment for resources)
  sendEmailsAndEnroll({
    type: "resource",
    customerName: customerName.trim(),
    customerEmail: customerEmail.trim().toLowerCase(),
    customerPhone: "",
    items,
    total: parseFloat(String(total)) || 0,
    paymentMethod,
    paymentId: paymentId || null,
    orderId: purchaseId,
    extraData: {
      resourcePurchase: true,
      resourceId,
      resourceTitle,
      downloadToken,
    },
  });

  return NextResponse.json(
    {
      success: true,
      orderId: purchaseId,
      type: "resource_purchase",
      downloadToken,
      r2Key,
      downloadUrl: r2Key
        ? `/api/resources/download?key=${encodeURIComponent(r2Key)}&token=${downloadToken}`
        : null,
      message: "Compra de recurso registrada con éxito.",
    },
    { status: 201 }
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   COMBINED: Send admin email + auto-enroll + send ONE customer email
   When someone pays for a course, reading, or mentoría, automatically:
   1. Create a Student record (if not exists)
   2. Create a StudentEnrollment
   3. Send admin notification email
   4. Send ONE customer email (combined confirmation + credentials or existing student notice)
   ═══════════════════════════════════════════════════════════════════════ */

interface EmailAndEnrollPayload {
  type: "crystal" | "course" | "mentoria" | "reading" | "resource";
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: Array<{ id: number; name: string; quantity: number; price: number }>;
  total: number;
  paymentMethod: string;
  paymentId: string | null;
  orderId: string;
  extraData?: Record<string, unknown>;
  // Enrollment params (optional — crystal/resource don't auto-enroll)
  enrollmentType?: 'curso' | 'lectura' | 'mentoria';
  enrollmentTitle?: string;
  referenceId?: string;
  notes?: string;
}

function sendEmailsAndEnroll(payload: EmailAndEnrollPayload): void {
  // Fire and forget — never block the response
  (async () => {
    // 1. Always send admin notification
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

    // 2. Auto-enroll + send combined customer email (for course/mentoria/reading)
    if (payload.enrollmentType && payload.enrollmentTitle) {
      try {
        const result = await ensureStudentWithEnrollment({
          name: payload.customerName,
          email: payload.customerEmail,
          phone: payload.customerPhone,
          enrollmentType: payload.enrollmentType,
          enrollmentTitle: payload.enrollmentTitle,
          referenceId: payload.referenceId,
          notes: payload.notes,
          assignedBy: 'auto-purchase',
        });

        console.log(
          `[AutoEnroll] ${result.isNewStudent ? 'NEW' : 'EXISTING'} student ${result.studentId}, enrollment ${result.enrollmentId}, newEnrollment=${result.isNewEnrollment}, hasPassword=${!!result.generatedPassword}`
        );

        // Send ONE combined email based on whether student is new or existing
        if (result.generatedPassword && result.isNewStudent) {
          await sendCustomerConfirmationWithCredentials({
            customerName: payload.customerName,
            customerEmail: payload.customerEmail.trim().toLowerCase(),
            type: payload.type,
            items: payload.items,
            total: payload.total,
            paymentMethod: payload.paymentMethod,
            password: result.generatedPassword,
            enrollmentType: payload.enrollmentType,
            enrollmentTitle: payload.enrollmentTitle,
          });
          console.log(`[AutoEnroll] Combined confirmation+credentials sent to ${payload.customerEmail}`);
        } else if (result.isNewEnrollment) {
          await sendCustomerConfirmationExistingStudent({
            customerName: payload.customerName,
            customerEmail: payload.customerEmail.trim().toLowerCase(),
            type: payload.type,
            items: payload.items,
            total: payload.total,
            paymentMethod: payload.paymentMethod,
            enrollmentType: payload.enrollmentType,
            enrollmentTitle: payload.enrollmentTitle,
          });
          console.log(`[AutoEnroll] Combined confirmation+existing-student sent to ${payload.customerEmail}`);
        } else {
          // Duplicate enrollment — still send a confirmation
          await sendCustomerConfirmationExistingStudent({
            customerName: payload.customerName,
            customerEmail: payload.customerEmail.trim().toLowerCase(),
            type: payload.type,
            items: payload.items,
            total: payload.total,
            paymentMethod: payload.paymentMethod,
            enrollmentType: payload.enrollmentType,
            enrollmentTitle: payload.enrollmentTitle,
          });
          console.log(`[AutoEnroll] Confirmation sent to ${payload.customerEmail} (duplicate enrollment)`);
        }
      } catch (err) {
        console.error('[AutoEnroll] Failed:', err);
      }
    } else {
      // 3. Crystal/resource — no enrollment, send simple confirmation
      try {
        await sendCustomerConfirmationExistingStudent({
          customerName: payload.customerName,
          customerEmail: payload.customerEmail.trim().toLowerCase(),
          type: payload.type,
          items: payload.items,
          total: payload.total,
          paymentMethod: payload.paymentMethod,
          enrollmentType: payload.type === 'crystal' ? 'curso' : 'lectura', // doesn't matter, no credentials shown
          enrollmentTitle: payload.items[0]?.name || 'Pedido',
        });
      } catch (err) {
        console.error(`[Email] Failed to send customer confirmation for ${payload.type}:`, err);
      }
    }
  })();
}
