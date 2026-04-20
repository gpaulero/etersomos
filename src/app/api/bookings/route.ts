import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import {
  sendWhatsAppNotification,
  buildClientWhatsAppLink,
  generateGoogleCalendarLink,
  calculateDeadline,
} from "@/lib/notifications";

/* ── POST: Create a new booking + send WhatsApp notification ────────────── */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, readingType, preferredDate, preferredTime, message } = body;

    if (!name || !email || !phone || !readingType) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios: nombre, email, teléfono y tipo de lectura." },
        { status: 400 }
      );
    }

    const validReadingTypes = [
      "Lectura Individual",
      "Lectura de Pareja",
      "Lectura Profesional",
    ];

    if (!validReadingTypes.includes(readingType)) {
      return NextResponse.json(
        { error: "Tipo de lectura inválido." },
        { status: 400 }
      );
    }

    const booking = await db.readingBooking.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        readingType,
        preferredDate: preferredDate?.trim() || null,
        preferredTime: preferredTime?.trim() || null,
        message: message?.trim() || null,
      },
    });

    // ── WhatsApp notification (fire and forget, don't block response) ──
    sendWhatsAppNotification({
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      readingType: booking.readingType,
      preferredDate: booking.preferredDate,
      preferredTime: booking.preferredTime,
      message: booking.message,
    }).then((result) => {
      console.log(
        `[WhatsApp Notification] method=${result.method} success=${result.success}`
      );
      if (result.link) {
        console.log(`[WhatsApp Link] ${result.link}`);
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: "Reserva registrada con éxito. Nos comunicaremos pronto para confirmar tu turno.",
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
          preferredDate: b.preferredDate,
          preferredTime: b.preferredTime,
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

    const validStatuses = ["pendiente", "confirmada", "en_progreso", "enviada", "cancelada"];
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
