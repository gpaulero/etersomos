import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, ensureSchema } from "@/lib/db";

const VALID_STATUSES = ["pendiente", "en_progreso", "entregada", "cancelada"];

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSchema();

    const { id } = await params;
    const body = await req.json();
    const { status, deliveryDate } = body;

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Estado invalido. Valores permitidos: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    // Build update data using the shared db proxy (handles Turso correctly)
    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (deliveryDate !== undefined) updateData.deliveryDate = deliveryDate || null;
    updateData.updatedAt = new Date();

    if (Object.keys(updateData).length <= 1 && updateData.updatedAt) {
      // Only updatedAt was set, no actual fields to update
      return NextResponse.json(
        { error: "No se especificaron campos para actualizar" },
        { status: 400 }
      );
    }

    // Check booking exists first
    const existing = await db.readingBooking.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Lectura no encontrada" },
        { status: 404 }
      );
    }

    const updated = await db.readingBooking.update({
      where: { id },
      data: updateData,
    });

    // Revalidate pages that display booking data
    revalidatePath('/', 'layout');
    revalidatePath('/lecturas');

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error("[Admin Bookings] Error updating booking:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSchema();

    const { id } = await params;

    const existing = await db.readingBooking.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Lectura no encontrada" }, { status: 404 });
    }

    await db.readingBooking.delete({ where: { id } });

    // Revalidate after delete
    revalidatePath('/', 'layout');
    revalidatePath('/lecturas');

    return NextResponse.json({ success: true, message: "Lectura eliminada correctamente" });
  } catch (error) {
    console.error("[Admin Bookings] Error deleting booking:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
