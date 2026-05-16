import { NextResponse } from "next/server";
import { db, ensureSchema } from "@/lib/db";

export async function GET() {
  try {
    await ensureSchema();

    let memberships = [];
    try {
      memberships = await db.membership.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch {
      memberships = [];
    }

    return NextResponse.json({ memberships });
  } catch (error) {
    console.error("[Admin Memberships] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener membresias" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await ensureSchema();

    const body = await request.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const validStatuses = ["activa", "cancelada", "vencida"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Estado invalido: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const existing = await db.membership.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Membresia no encontrada" }, { status: 404 });
    }

    const updated = await db.membership.update({
      where: { id },
      data: { status: status || existing.status },
    });

    return NextResponse.json({ success: true, membership: updated });
  } catch (error) {
    console.error("[Admin Memberships] Update error:", error);
    return NextResponse.json(
      { error: "Error al actualizar membresia" },
      { status: 500 }
    );
  }
}
