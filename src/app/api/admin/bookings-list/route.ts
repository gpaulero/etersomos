import { NextResponse } from "next/server";
import { db, ensureSchema } from "@/lib/db";
import { buildClientWhatsAppLink } from "@/lib/notifications";

export async function GET() {
  try {
    await ensureSchema();

    const bookings = await db.readingBooking.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Enrich with WhatsApp link for admin convenience
    const enriched = bookings.map((b) => ({
      ...b,
      status: b.status || "pendiente",
      clientWhatsAppLink: buildClientWhatsAppLink(
        b.phone,
        `Hola ${b.name}, soy de Eter Somos. Te escribo sobre tu reserva de ${b.readingType}.`
      ),
    }));

    return NextResponse.json({ bookings: enriched });
  } catch (error) {
    console.error("[Admin Bookings List] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener reservas" },
      { status: 500 }
    );
  }
}
