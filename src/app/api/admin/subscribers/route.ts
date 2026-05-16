import { NextResponse } from "next/server";
import { db, ensureSchema } from "@/lib/db";

export async function GET() {
  try {
    await ensureSchema();

    let subscribers = [];
    try {
      subscribers = await db.newsletterSubscriber.findMany({
        orderBy: { subscribedAt: "desc" },
      });
    } catch {
      subscribers = [];
    }

    return NextResponse.json({ subscribers });
  } catch (error) {
    console.error("[Admin Subscribers] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener suscriptores" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureSchema();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

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
