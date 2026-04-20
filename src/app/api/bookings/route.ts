import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

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

export async function GET() {
  try {
    const bookings = await db.readingBooking.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    return NextResponse.json(
      { error: "Error al obtener las reservas." },
      { status: 500 }
    );
  }
}
