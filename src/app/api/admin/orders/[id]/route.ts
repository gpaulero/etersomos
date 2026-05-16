import { NextRequest, NextResponse } from "next/server";
import { db, ensureSchema } from "@/lib/db";

// Valid statuses for crystal orders
const VALID_CRYSTAL_STATUSES = ["pendiente", "preparando", "enviado", "entregado", "cancelado"];
// Valid statuses for course enrollments
const VALID_COURSE_STATUSES = ["inscrito", "en_curso", "completado", "cancelado"];

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSchema();

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Estado requerido" }, { status: 400 });
    }

    const allValid = [...VALID_CRYSTAL_STATUSES, ...VALID_COURSE_STATUSES];
    if (!allValid.includes(status)) {
      return NextResponse.json(
        { error: `Estado invalido. Valores permitidos: ${allValid.join(", ")}` },
        { status: 400 }
      );
    }

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

      const result = await client.execute({
        sql: "UPDATE CrystalOrder SET status = ?, updatedAt = ? WHERE id = ?",
        args: [status, new Date().toISOString(), id],
      });

      if (result.rowsAffected === 0) {
        return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
      }

      const fetchResult = await client.execute({
        sql: "SELECT * FROM CrystalOrder WHERE id = ?",
        args: [id],
      });

      return NextResponse.json({ success: true, order: fetchResult.rows[0] });
    } else {
      const existing = await db.crystalOrder.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
      }

      const updated = await db.crystalOrder.update({
        where: { id },
        data: { status },
      });

      return NextResponse.json({ success: true, order: updated });
    }
  } catch (error) {
    console.error("[Admin Orders] Error updating order:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
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

      const check = await client.execute({
        sql: "SELECT id FROM CrystalOrder WHERE id = ?",
        args: [id],
      });
      if (check.rows.length === 0) {
        return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
      }

      await client.execute({
        sql: "DELETE FROM CrystalOrder WHERE id = ?",
        args: [id],
      });
    } else {
      const existing = await db.crystalOrder.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
      }
      await db.crystalOrder.delete({ where: { id } });
    }

    return NextResponse.json({ success: true, message: "Pedido eliminado correctamente" });
  } catch (error) {
    console.error("[Admin Orders] Error deleting order:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
