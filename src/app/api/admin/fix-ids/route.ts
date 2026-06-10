import { NextResponse } from "next/server";
import { db, ensureSchema } from "@/lib/db";
import { randomUUID } from "crypto";

function generateId(): string {
  const uuid = randomUUID().replace(/-/g, '');
  return `cl${uuid.substring(0, 23)}`;
}

/**
 * POST /api/admin/fix-ids
 * One-time migration: assign IDs to records that have NULL ids in Turso.
 * This happens because the Turso proxy didn't auto-generate IDs like Prisma does.
 */
export async function POST() {
  try {
    await ensureSchema();

    const isTurso = (process.env.DATABASE_URL || "").startsWith("libsql://");

    if (!isTurso) {
      return NextResponse.json({ message: "Not needed for local SQLite (Prisma handles IDs)" });
    }

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

    const client = createClient({
      url: url.startsWith("libsql") && !url.includes("://") ? `libsql://${url}` : url,
      authToken,
    });

    const results: Record<string, number> = {};

    // Fix ReadingBooking records with NULL id
    try {
      const nullBookings = await client.execute({
        sql: "SELECT rowid FROM ReadingBooking WHERE id IS NULL",
        args: [],
      });
      for (const row of nullBookings.rows) {
        const newId = generateId();
        await client.execute({
          sql: "UPDATE ReadingBooking SET id = ? WHERE rowid = ?",
          args: [newId, row.rowid as number],
        });
      }
      results.ReadingBooking = nullBookings.rows.length;
    } catch (err) {
      results.ReadingBooking = -1;
      console.error("[FixIDs] Error fixing ReadingBooking:", err);
    }

    // Fix CrystalOrder records with NULL id
    try {
      const nullOrders = await client.execute({
        sql: "SELECT rowid FROM CrystalOrder WHERE id IS NULL",
        args: [],
      });
      for (const row of nullOrders.rows) {
        const newId = generateId();
        await client.execute({
          sql: "UPDATE CrystalOrder SET id = ? WHERE rowid = ?",
          args: [newId, row.rowid as number],
        });
      }
      results.CrystalOrder = nullOrders.rows.length;
    } catch (err) {
      results.CrystalOrder = -1;
      console.error("[FixIDs] Error fixing CrystalOrder:", err);
    }

    // Fix Membership records with NULL id
    try {
      const nullMemberships = await client.execute({
        sql: "SELECT rowid FROM Membership WHERE id IS NULL",
        args: [],
      });
      for (const row of nullMemberships.rows) {
        const newId = generateId();
        await client.execute({
          sql: "UPDATE Membership SET id = ? WHERE rowid = ?",
          args: [newId, row.rowid as number],
        });
      }
      results.Membership = nullMemberships.rows.length;
    } catch (err) {
      results.Membership = -1;
      console.error("[FixIDs] Error fixing Membership:", err);
    }

    // Fix Student records with NULL id
    try {
      const nullStudents = await client.execute({
        sql: "SELECT rowid FROM Student WHERE id IS NULL",
        args: [],
      });
      for (const row of nullStudents.rows) {
        const newId = generateId();
        await client.execute({
          sql: "UPDATE Student SET id = ? WHERE rowid = ?",
          args: [newId, row.rowid as number],
        });
      }
      results.Student = nullStudents.rows.length;
    } catch (err) {
      results.Student = -1;
      console.error("[FixIDs] Error fixing Student:", err);
    }

    // Fix StudentEnrollment records with NULL id
    try {
      const nullEnrollments = await client.execute({
        sql: "SELECT rowid FROM StudentEnrollment WHERE id IS NULL",
        args: [],
      });
      for (const row of nullEnrollments.rows) {
        const newId = generateId();
        await client.execute({
          sql: "UPDATE StudentEnrollment SET id = ? WHERE rowid = ?",
          args: [newId, row.rowid as number],
        });
      }
      results.StudentEnrollment = nullEnrollments.rows.length;
    } catch (err) {
      results.StudentEnrollment = -1;
      console.error("[FixIDs] Error fixing StudentEnrollment:", err);
    }

    // Fix NewsletterSubscriber records with NULL id
    try {
      const nullSubs = await client.execute({
        sql: "SELECT rowid FROM NewsletterSubscriber WHERE id IS NULL",
        args: [],
      });
      for (const row of nullSubs.rows) {
        const newId = generateId();
        await client.execute({
          sql: "UPDATE NewsletterSubscriber SET id = ? WHERE rowid = ?",
          args: [newId, row.rowid as number],
        });
      }
      results.NewsletterSubscriber = nullSubs.rows.length;
    } catch (err) {
      results.NewsletterSubscriber = -1;
      console.error("[FixIDs] Error fixing NewsletterSubscriber:", err);
    }

    return NextResponse.json({
      success: true,
      message: "IDs fixed for records with NULL ids",
      fixed: results,
    });
  } catch (error) {
    console.error("[FixIDs] Error:", error);
    return NextResponse.json(
      { error: "Error fixing IDs", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
