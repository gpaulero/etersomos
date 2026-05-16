import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 15;

function verifyAuth(request: NextRequest): boolean {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return false;
  return token === process.env.ADMIN_API_SECRET;
}

function mapRow(r: Record<string, unknown>) {
  return {
    id: r.id as string,
    title: r.title as string,
    description: r.description as string,
    fileType: r.fileType as string,
    r2Key: r.r2Key as string,
    fileName: r.fileName as string,
    fileSize: Number(r.fileSize) || 0,
    price: Number(r.price) || 0,
    active: r.active === 1 || r.active === true,
    order: Number(r.sortOrder) || 0,
    createdAt: String(r.createdAt || ""),
    url: "/api/resources/download?key=" + encodeURIComponent(r.r2Key as string),
  };
}

const CREATE_TABLE_SQL = [
  "CREATE TABLE IF NOT EXISTS Resource (",
  "id TEXT NOT NULL PRIMARY KEY,",
  "title TEXT NOT NULL DEFAULT '',",
  "description TEXT NOT NULL DEFAULT '',",
  "fileType TEXT NOT NULL DEFAULT 'documento',",
  "r2Key TEXT NOT NULL UNIQUE,",
  "fileName TEXT NOT NULL DEFAULT '',",
  "fileSize INTEGER NOT NULL DEFAULT 0,",
  "price REAL NOT NULL DEFAULT 0,",
  "active INTEGER NOT NULL DEFAULT 1,",
  "sortOrder INTEGER NOT NULL DEFAULT 0,",
  "createdAt TEXT NOT NULL DEFAULT (datetime('now')),",
  "updatedAt TEXT NOT NULL DEFAULT (datetime('now'))",
  ")",
].join(" ");

// GET
export async function GET(request: NextRequest) {
  const isPublic = new URL(request.url).searchParams.get("public") === "true";

  try {
    // Ensure table exists
    await db.$executeRawUnsafe(CREATE_TABLE_SQL, []);

    // Try to add sortOrder column if it doesn't exist (migration from old schema)
    try { await db.$executeRawUnsafe("ALTER TABLE Resource ADD COLUMN sortOrder INTEGER DEFAULT 0", []); } catch (e: any) {
      if (!String(e?.message || "").includes("duplicate column")) {
        console.warn("Could not add sortOrder column:", e?.message);
      }
    }

    const whereClause = isPublic ? " WHERE active = 1" : "";
    const sql = "SELECT * FROM Resource" + whereClause + " ORDER BY sortOrder ASC, createdAt DESC";
    const result = await db.$executeRawUnsafe(sql, []);
    const rows = (result as any)?.rows || [];

    return NextResponse.json({ resources: rows.map(mapRow) });
  } catch (err) {
    console.error("Error listing resources:", err);
    return NextResponse.json({ error: "Error al listar recursos", detail: String(err?.message || err) }, { status: 500 });
  }
}

// POST
export async function POST(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, fileType, r2Key, fileName, fileSize, price } = body;

    if (!title || !r2Key) {
      return NextResponse.json({ error: "Se requieren titulo y r2Key" }, { status: 400 });
    }

    // Ensure table exists
    await db.$executeRawUnsafe(CREATE_TABLE_SQL, []);

    // Generate ID
    const idResult = await db.$executeRawUnsafe("SELECT lower(hex(randomblob(12))) as id", []);
    const id = (idResult as any)?.rows?.[0]?.id;
    if (!id) throw new Error("Failed to generate ID");

    // Insert
    await db.$executeRawUnsafe(
      "INSERT INTO Resource (id, title, description, fileType, r2Key, fileName, fileSize, price, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)",
      [id, title, description || "", fileType || "documento", r2Key, fileName || "", fileSize || 0, price || 0]
    );

    return NextResponse.json({ message: "Recurso creado correctamente", id }, { status: 201 });
  } catch (err) {
    console.error("Error creating resource:", err);
    return NextResponse.json({ error: "Error al crear recurso", detail: String(err?.message || err) }, { status: 500 });
  }
}

// PUT
export async function PUT(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, title, description, fileType, price, active } = body;

    if (!id) {
      return NextResponse.json({ error: "Se requiere el campo 'id'" }, { status: 400 });
    }

    const sets: string[] = [];
    const values: unknown[] = [];
    if (title !== undefined) { sets.push('"title" = ?'); values.push(title); }
    if (description !== undefined) { sets.push('"description" = ?'); values.push(description); }
    if (fileType !== undefined) { sets.push('"fileType" = ?'); values.push(fileType); }
    if (price !== undefined) { sets.push('"price" = ?'); values.push(price); }
    if (active !== undefined) { sets.push('"active" = ?'); values.push(active ? 1 : 0); }
    sets.push('"updatedAt" = datetime(\'now\')');

    const sql = "UPDATE Resource SET " + sets.join(", ") + " WHERE id = ?";
    await db.$executeRawUnsafe(sql, [...values, id]);

    return NextResponse.json({ message: "Recurso actualizado" });
  } catch (err) {
    console.error("Error updating resource:", err);
    return NextResponse.json({ error: "Error al actualizar recurso" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Se requiere el campo 'id'" }, { status: 400 });
    }

    const result = await db.$executeRawUnsafe("SELECT r2Key FROM Resource WHERE id = ?", [id]);
    const rows = (result as any)?.rows || [];
    if (rows.length === 0) {
      return NextResponse.json({ error: "Recurso no encontrado" }, { status: 404 });
    }

    try {
      const { deleteResource } = await import("@/lib/r2");
      await deleteResource(rows[0].r2Key);
    } catch (e) {
      console.warn("Failed to delete from R2:", e);
    }

    await db.$executeRawUnsafe("DELETE FROM Resource WHERE id = ?", [id]);

    return NextResponse.json({ message: "Recurso eliminado correctamente" });
  } catch (err) {
    console.error("Error deleting resource:", err);
    return NextResponse.json({ error: "Error al eliminar recurso" }, { status: 500 });
  }
}
