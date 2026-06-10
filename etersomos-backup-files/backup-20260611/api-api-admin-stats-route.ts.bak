import { NextResponse } from "next/server";
import { db, ensureSchema } from "@/lib/db";

export async function GET() {
  try {
    await ensureSchema();

    // ── Reading Bookings ──
    const bookings = await db.readingBooking.findMany({
      orderBy: { createdAt: "desc" },
    });

    // ── Crystal Orders (includes course enrollments) ──
    const allOrders = await db.crystalOrder.findMany({
      orderBy: { createdAt: "desc" },
    });

    const crystalOrders = allOrders.filter((o) => !o.notes?.startsWith("CURSO:"));
    const courseEnrollments = allOrders.filter((o) => o.notes?.startsWith("CURSO:"));

    // ── Memberships ──
    let memberships = [];
    try {
      memberships = await db.membership.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch {
      // Table might not exist yet in Turso if ensureSchema didn't run
    }

    // ── Revenue ──
    const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);
    const crystalRevenue = crystalOrders.reduce((sum, o) => sum + o.total, 0);
    const courseRevenue = courseEnrollments.reduce((sum, o) => sum + o.total, 0);

    // ── Recent activity (last 7 days) ──
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentBookings = bookings.filter((b) => new Date(b.createdAt) >= sevenDaysAgo);
    const recentOrders = allOrders.filter((o) => new Date(o.createdAt) >= sevenDaysAgo);
    const recentMemberships = memberships.filter((m) => new Date(m.createdAt) >= sevenDaysAgo);

    // ── Payment methods breakdown ──
    const paymentBreakdown = allOrders.reduce(
      (acc, o) => {
        const method = o.paymentMethod || "desconocido";
        if (!acc[method]) acc[method] = { count: 0, total: 0 };
        acc[method].count++;
        acc[method].total += o.total;
        return acc;
      },
      {} as Record<string, { count: number; total: number }>
    );

    // ── Status breakdown ──
    const bookingStatuses = bookings.reduce(
      (acc, b) => {
        const s = b.status || "pendiente";
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const orderStatuses = allOrders.reduce(
      (acc, o) => {
        const s = o.status || "pendiente";
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return NextResponse.json({
      overview: {
        totalBookings: bookings.length,
        totalCrystalOrders: crystalOrders.length,
        totalCourseEnrollments: courseEnrollments.length,
        totalMemberships: memberships.length,
        totalRevenue,
        crystalRevenue,
        courseRevenue,
        recentBookings: recentBookings.length,
        recentOrders: recentOrders.length,
        recentMemberships: recentMemberships.length,
      },
      paymentBreakdown,
      bookingStatuses,
      orderStatuses,
    });
  } catch (error) {
    console.error("[Admin Stats] Error:", error);
    const detail = error instanceof Error ? error.message : String(error);
    const isAuth = detail.includes("401") || detail.includes("auth");
    return NextResponse.json(
      { 
        error: isAuth 
          ? "Token de autenticacion de Turso no configurado. Necesitas agregar DATABASE_AUTH_TOKEN en Vercel." 
          : "Error al obtener estadisticas",
        detail 
      },
      { status: 500 }
    );
  }
}
