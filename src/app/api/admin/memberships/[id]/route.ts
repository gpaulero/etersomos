import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, ensureSchema } from "@/lib/db";

const VALID_STATUSES = ["activa", "pendiente", "cancelada", "vencida"];

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSchema();

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Estado invalido: ${VALID_STATUSES.join(", ")}` },
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

    // Revalidate pages that display membership data
    revalidatePath('/', 'layout');
    revalidatePath('/membresias');

    return NextResponse.json({ success: true, membership: updated });
  } catch (error) {
    console.error("[Admin Memberships] Update error:", error);
    return NextResponse.json({ error: "Error al actualizar membresia" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSchema();

    const { id } = await params;
    const existing = await db.membership.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Membresia no encontrada" }, { status: 404 });
    }

    await db.membership.delete({ where: { id } });

    // Revalidate after delete
    revalidatePath('/', 'layout');
    revalidatePath('/membresias');

    return NextResponse.json({ success: true, message: "Membresia eliminada correctamente" });
  } catch (error) {
    console.error("[Admin Memberships] Delete error:", error);
    return NextResponse.json({ error: "Error al eliminar membresia" }, { status: 500 });
  }
}
