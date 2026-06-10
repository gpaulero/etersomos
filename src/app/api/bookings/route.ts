import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import {
  sendWhatsAppNotification,
  buildClientWhatsAppLink,
  generateGoogleCalendarLink,
  calculateDeadline,
} from "@/lib/notifications";
import { sendAdminNotification, sendCustomerConfirmation, sendAulaWelcomeEmail } from "@/lib/email";
import { ensureStudentWithEnrollment } from "@/lib/student-auth";

/* ── POST: Create a new booking + send notifications ──────────────────── */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message, paymentMethod, formData } = body as {
      name: string;
      email: string;
      phone: string;
      message?: string;
      paymentMethod?: string;
      formData?: Record<string, string>;
    };

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios: nombre, email y teléfono." },
        { status: 400 }
      );
    }

    const booking = await db.readingBooking.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        readingType: "Lectura Akáshica Individual",
        message: message?.trim() || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // ── WhatsApp notification (fire and forget, don't block response) ──
    sendWhatsAppNotification({
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      readingType: booking.readingType,
      message: booking.message,
    }).then((result) => {
      console.log(
        `[WhatsApp Notification] method=${result.method} success=${result.success}`
      );
      if (result.link) {
        console.log(`[WhatsApp Link] ${result.link}`);
      }
    });

    // ── Email notification (fire and forget) ──
    // This fires for transfer/WU readings which come through the bookings API
    const method = paymentMethod || "transferencia";
    const formDataSafe = formData || {};

    // Determine price from CMS/DB, with hardcoded fallback
    let priceArs = 20000;
    let priceUsd = 20;
    try {
      const priceRow = await (db as any).siteContent.findUnique({ where: { key: 'readings.price_ars' } });
      if (priceRow?.value) priceArs = Number(priceRow.value) || 20000;
      const usdRow = await (db as any).siteContent.findUnique({ where: { key: 'readings.price_usd' } });
      if (usdRow?.value) priceUsd = Number(usdRow.value) || 20;
    } catch {}
    const total = (method === "paypal" || method === "western_union") ? priceUsd : priceArs;

    // ── Auto-enroll + send Aula Virtual credentials FIRST (critical, must succeed) ──
    // This is awaited so errors are properly logged and the user gets their credentials
    const enrollResult = await ensureStudentWithEnrollment({
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      enrollmentType: 'lectura',
      enrollmentTitle: 'Lectura Akáshica Individual',
      notes: `Pago: ${method}`,
      assignedBy: 'auto-booking',
    }).catch(err => {
      console.error("[AutoEnroll] Failed for booking:", err);
      return { generatedPassword: null } as any;
    });

    // ── Send all emails in parallel (non-blocking for response) ──
    Promise.all([
      // 1. Admin notification
      sendAdminNotification({
        type: "reading",
        customerName: booking.name,
        customerEmail: booking.email,
        customerPhone: booking.phone,
        items: [{ name: "Lectura del Campo Akáshico", quantity: 1, price: total }],
        total,
        paymentMethod: method,
        orderId: booking.id,
        extraData: { formData: formDataSafe },
      }).catch(err => console.error("[Email] Admin notification failed:", err)),

      // 2. Customer confirmation
      sendCustomerConfirmation({
        customerName: booking.name,
        customerEmail: booking.email,
        type: "reading",
        items: [{ name: "Lectura del Campo Akáshico", quantity: 1, price: total }],
        total,
        paymentMethod: method,
      }).catch(err => console.error("[Email] Customer confirmation failed:", err)),

      // 3. Aula Virtual credentials email (only if enrollment succeeded)
      enrollResult.generatedPassword
        ? sendAulaWelcomeEmail({
            customerName: booking.name,
            customerEmail: booking.email,
            password: enrollResult.generatedPassword,
            enrollmentType: 'lectura',
            enrollmentTitle: 'Lectura Akáshica Individual',
          }).catch(err => console.error("[Email] Aula welcome email failed:", err))
        : Promise.resolve(),
    ]).catch(() => {}); // swallow top-level errors, already handled per-promise

    return NextResponse.json(
      {
        success: true,
        message: "Solicitud registrada con éxito. Vas a recibir un email con tus credenciales para ingresar al Aula Virtual, donde podrás escuchar tu lectura cuando esté lista.",
        bookingId: booking.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear reserva:", error);
    return NextResponse.json(
      { error: "Hubo un error al procesar tu reserva. Intentá de nuevo en unos minutos." },
      { status: 500 }
    );
  }
}

/* ── GET: List all bookings ─────────────────────────────────────────────── */

export async function GET() {
  try {
    const bookings = await db.readingBooking.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Enrich with deadline and calendar info
    const enriched = bookings.map((b) => {
      const extras: Record<string, unknown> = {};

      if (b.status === "confirmada" && b.confirmedAt) {
        const deadlineInfo = calculateDeadline(b.confirmedAt);
        extras.deadlineInfo = deadlineInfo;

        extras.googleCalendarLink = generateGoogleCalendarLink({
          name: b.name,
          email: b.email,
          phone: b.phone,
          readingType: b.readingType,
          message: b.message,
        });
      }

      extras.clientWhatsAppLink = buildClientWhatsAppLink(
        b.phone,
        `Hola ${b.name}, soy de Eter Somos. Te escribo sobre tu reserva de ${b.readingType}.`
      );

      return { ...b, ...extras };
    });

    // Also return stats
    const stats = {
      total: bookings.length,
      pendiente: bookings.filter((b) => b.status === "pendiente").length,
      confirmada: bookings.filter((b) => b.status === "confirmada").length,
      en_progreso: bookings.filter((b) => b.status === "en_progreso").length,
      enviada: bookings.filter((b) => b.status === "enviada").length,
      cancelada: bookings.filter((b) => b.status === "cancelada").length,
    };

    return NextResponse.json({ bookings: enriched, stats }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    return NextResponse.json(
      { error: "Error al obtener las reservas." },
      { status: 500 }
    );
  }
}

/* ── PUT: Update booking status ────────────────────────────────────────── */

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "ID de reserva requerido." }, { status: 400 });
    }

    const validStatuses = ["pendiente", "en_progreso", "entregada", "cancelada"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Estado inválido. Estados válidos: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const existing = await db.readingBooking.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (status === "confirmada" && !existing.confirmedAt) {
      updateData.confirmedAt = new Date();
    }
    if (status === "enviada") {
      updateData.sentAt = new Date();
    }

    const updated = await db.readingBooking.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(
      { success: true, booking: updated, message: "Reserva actualizada correctamente." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar reserva:", error);
    return NextResponse.json(
      { error: "Error al actualizar la reserva." },
      { status: 500 }
    );
  }
}

/* ── DELETE: Delete a booking ──────────────────────────────────────────── */

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID de reserva requerido." }, { status: 400 });
    }

    await db.readingBooking.delete({ where: { id } });

    return NextResponse.json(
      { success: true, message: "Reserva eliminada correctamente." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar reserva:", error);
    return NextResponse.json(
      { error: "Error al eliminar la reserva." },
      { status: 500 }
    );
  }
}
