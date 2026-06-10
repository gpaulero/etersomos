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

    // Build dynamic SET clause
    const sets: string[] = [];
    const values: unknown[] = [];

    if (status !== undefined) {
      sets.push("status = ?");
      values.push(status);
    }
    if (deliveryDate !== undefined) {
      sets.push("deliveryDate = ?");
      values.push(deliveryDate || null);
    }
    if (sets.length > 0) {
      sets.push("updatedAt = ?");
      values.push(new Date().toISOString());
    }

    if (sets.length === 0) {
      return NextResponse.json(
        { error: "No se especificaron campos para actualizar" },
        { status: 400 }
      );
    }

    // Use direct SQL for Turso compatibility
    const isTurso = (process.env.DATABASE_URL || "").startsWith("libsql://");

    if (isTurso) {
      const { createClient } = await import("@libsql/client");
      const url = process.env.DATABASE_URL!;
      let authToken = process.env.DATABASE_AUTH_TOKEN;

      try {
        const u = new URL(url);
        if (u.searchParams.has("authToken")) {
          if (!authToken) authToken = u.searchParams.get("authToken") || undefined;
          u.searchParams.delete("authToken");
        }
      } catch {}

      const client = createClient({ url: url.startsWith("libsql") && !url.includes("://") ? `libsql://${url}` : url, authToken });

      const sql = `UPDATE ReadingBooking SET ${sets.join(", ")} WHERE id = ?`;
      const result = await client.execute({ sql, args: [...values, id] });

      if (result.rowsAffected === 0) {
        return NextResponse.json(
          { error: "Lectura no encontrada" },
          { status: 404 }
        );
      }

      // Fetch updated record
      const fetchResult = await client.execute({
        sql: "SELECT * FROM ReadingBooking WHERE id = ?",
        args: [id],
      });

      const row = fetchResult.rows[0];

      // Revalidate pages that display booking data
      revalidatePath('/', 'layout');
      revalidatePath('/lecturas');

      return NextResponse.json({ success: true, booking: row });
    } else {
      // Fallback for local Prisma
      const updateData: Record<string, unknown> = {};
      if (status !== undefined) updateData.status = status;
      if (deliveryDate !== undefined) updateData.deliveryDate = deliveryDate;

      const updated = await db.readingBooking.update({
        where: { id },
        data: updateData,
      });

      // Revalidate pages that display booking data
      revalidatePath('/', 'layout');
      revalidatePath('/lecturas');

      return NextResponse.json({ success: true, booking: updated });
    }
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
    const isTurso = (process.env.DATABASE_URL || "").startsWith("libsql://");

    if (isTurso) {
      const { createClient } = await import("@libsql/client");
      const url = process.env.DATABASE_URL!;
      let authToken = process.env.DATABASE_AUTH_TOKEN;

      try {
        const u = new URL(url);
        if (u.searchParams.has("authToken")) {
          if (!authToken) authToken = u.searchParams.get("authToken") || undefined;
          u.searchParams.delete("authToken");
        }
      } catch {}

      const client = createClient({ url: url.startsWith("libsql") && !url.includes("://") ? `libsql://${url}` : url, authToken });

      // Check if exists
      const check = await client.execute({
        sql: "SELECT id FROM ReadingBooking WHERE id = ?",
        args: [id],
      });
      if (check.rows.length === 0) {
        return NextResponse.json({ error: "Lectura no encontrada" }, { status: 404 });
      }

      await client.execute({
        sql: "DELETE FROM ReadingBooking WHERE id = ?",
        args: [id],
      });

      // Revalidate after delete
      revalidatePath('/', 'layout');
      revalidatePath('/lecturas');
    } else {
      const existing = await db.readingBooking.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ error: "Lectura no encontrada" }, { status: 404 });
      }
      await db.readingBooking.delete({ where: { id } });

      // Revalidate after delete
      revalidatePath('/', 'layout');
      revalidatePath('/lecturas');
    }

    return NextResponse.json({ success: true, message: "Lectura eliminada correctamente" });
  } catch (error) {
    console.error("[Admin Bookings] Error deleting booking:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
