import { NextResponse } from "next/server";
import { db, ensureSchema } from "@/lib/db";

export async function GET() {
  try {
    await ensureSchema();

    const orders = await db.crystalOrder.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Separate crystal orders from course enrollments
    const enriched = orders.map((order) => {
      const isCourse = order.notes?.startsWith("CURSO:");
      let courseData = null;
      if (isCourse) {
        try {
          const jsonStr = order.notes.replace(/^CURSO:\s*/, "");
          courseData = JSON.parse(jsonStr);
        } catch {
          courseData = null;
        }
      }

      let items = [];
      try {
        items = JSON.parse(order.items);
      } catch {
        items = [];
      }

      return {
        id: order.id,
        type: isCourse ? "course" : "crystal",
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        address: order.address,
        city: order.city,
        province: order.province,
        postalCode: order.postalCode,
        notes: order.notes,
        items,
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentId: order.paymentId,
        status: order.status,
        courseData,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    });

    return NextResponse.json({ orders: enriched });
  } catch (error) {
    console.error("[Admin Orders] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener pedidos" },
      { status: 500 }
    );
  }
}
