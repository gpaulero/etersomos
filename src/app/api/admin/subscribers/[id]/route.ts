import { NextRequest, NextResponse } from "next/server";
import { db, ensureSchema } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSchema();

    const { id } = await params;
    const existing = await db.newsletterSubscriber.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Suscriptor no encontrado" }, { status: 404 });
    }

    await db.newsletterSubscriber.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Suscriptor eliminado correctamente" });
  } catch (error) {
    console.error("[Admin Subscribers] Delete error:", error);
    return NextResponse.json({ error: "Error al eliminar suscriptor" }, { status: 500 });
  }
}
