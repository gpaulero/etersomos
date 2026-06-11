import { NextRequest, NextResponse } from "next/server";
import { db, ensureSchema } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await ensureSchema();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all"; // bookings, crystals, courses, memberships, all

    const contacts: Array<{ name: string; email: string; source: string; date: string }> = [];

    // Get bookings
    if (type === "all" || type === "bookings") {
      try {
        const bookings = await db.readingBooking.findMany({
          orderBy: { createdAt: "desc" },
        });
        for (const b of bookings) {
          contacts.push({
            name: b.name as string,
            email: b.email as string,
            source: "Lectura",
            date: b.createdAt instanceof Date ? b.createdAt.toISOString() : String(b.createdAt),
          });
        }
      } catch {}
    }

    // Get crystal orders
    if (type === "all" || type === "crystals") {
      try {
        const orders = await db.crystalOrder.findMany({
          orderBy: { createdAt: "desc" },
        });
        for (const o of orders) {
          const isCourse = String(o.notes || "").startsWith("CURSO:");
          if (!isCourse) {
            contacts.push({
              name: o.customerName as string,
              email: o.customerEmail as string,
              source: "Cristales",
              date: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
            });
          }
        }
      } catch {}
    }

    // Get course enrollments
    if (type === "all" || type === "courses") {
      try {
        const orders = await db.crystalOrder.findMany({
          orderBy: { createdAt: "desc" },
        });
        for (const o of orders) {
          const isCourse = String(o.notes || "").startsWith("CURSO:");
          if (isCourse) {
            contacts.push({
              name: o.customerName as string,
              email: o.customerEmail as string,
              source: "Curso",
              date: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
            });
          }
        }
      } catch {}
    }

    // Get memberships
    if (type === "all" || type === "memberships") {
      try {
        const memberships = await db.membership.findMany({
          orderBy: { createdAt: "desc" },
        });
        for (const m of memberships) {
          contacts.push({
            name: m.name as string,
            email: m.email as string,
            source: "Membresia",
            date: m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt),
          });
        }
      } catch {}
    }

    // Deduplicate by email (keep most recent)
    const seen = new Map<string, typeof contacts[0]>();
    for (const c of contacts) {
      if (!seen.has(c.email)) {
        seen.set(c.email, c);
      }
    }

    return NextResponse.json({
      contacts: Array.from(seen.values()),
      total: seen.size,
    });
  } catch (error) {
    console.error("[Admin Contacts] Error:", error);
    return NextResponse.json({ error: "Error al obtener contactos" }, { status: 500 });
  }
}
