import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 15;

function verifyAuth(request: NextRequest): boolean {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return false;
  return token === process.env.ADMIN_API_SECRET;
}

function mapRow(r: Record<string, unknown>) {
  // Support both schemas: new (price) and old v5 (priceArs/priceUsd)
  const price = Number(r.price) || 0;
  const priceArs = Number(r.priceArs) || 0;
  const priceUsd = Number(r.priceUsd) || 0;

  return {
    id: r.id as string,
    title: r.title as string,
    description: r.description as string,
    fileType: r.fileType as string,
    r2Key: r.r2Key as string,
    fileName: r.fileName as string,
    fileSize: Number(r.fileSize) || 0,
    price: price || priceArs || 0,
    priceArs: priceArs || price || 0,
    priceUsd: priceUsd || 0,
    category: r.category as string || "",
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
  "category TEXT NOT NULL DEFAULT '',",
  "fileType TEXT NOT NULL DEFAULT 'documento',",
  "r2Key TEXT NOT NULL UNIQUE,",
  "fileName TEXT NOT NULL DEFAULT '',",
  "fileSize INTEGER NOT NULL DEFAULT 0,",
  "priceArs INTEGER NOT NULL DEFAULT 0,",
  "priceUsd INTEGER NOT NULL DEFAULT 0,",
  "price REAL NOT NULL DEFAULT 0,",
  "active INTEGER NOT NULL DEFAULT 1,",
  "sortOrder INTEGER NOT NULL DEFAULT 0,",
  "createdAt TEXT NOT NULL DEFAULT (datetime('now')),",
  "updatedAt TEXT NOT NULL DEFAULT (datetime('now'))",
  ")",
].join(" ");

/** Migrate columns that might be missing from older schema versions */
async function migrateResourceTable() {
  const migrations = [
    "ALTER TABLE Resource ADD COLUMN sortOrder INTEGER DEFAULT 0",
    "ALTER TABLE Resource ADD COLUMN category TEXT DEFAULT ''",
    "ALTER TABLE Resource ADD COLUMN priceArs INTEGER DEFAULT 0",
    "ALTER TABLE Resource ADD COLUMN priceUsd INTEGER DEFAULT 0",
    "ALTER TABLE Resource ADD COLUMN price REAL DEFAULT 0",
  ];
  for (const sql of migrations) {
    try {
      await db.$executeRawUnsafe(sql, []);
    } catch (e: any) {
      // "duplicate column" is expected if column already exists
      if (!String(e?.message || "").includes("duplicate column")) {
        console.warn("Migration warning:", e?.message);
      }
    }
  }
}

// GET
export async function GET(request: NextRequest) {
  const isPublic = new URL(request.url).searchParams.get("public") === "true";

  try {
    // Ensure table exists + run migrations
    await db.$executeRawUnsafe(CREATE_TABLE_SQL, []);
    await migrateResourceTable();

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
    const { title, description, fileType, r2Key, fileName, fileSize, price, priceArs, priceUsd, category } = body;

    if (!title || !r2Key) {
      return NextResponse.json({ error: "Se requieren titulo y r2Key" }, { status: 400 });
    }

    // Ensure table exists + run migrations
    await db.$executeRawUnsafe(CREATE_TABLE_SQL, []);
    await migrateResourceTable();

    // Generate ID
    const idResult = await db.$executeRawUnsafe("SELECT lower(hex(randomblob(12))) as id", []);
    const id = (idResult as any)?.rows?.[0]?.id;
    if (!id) throw new Error("Failed to generate ID");

    // Insert — write to ALL price columns for compatibility with both schemas
    await db.$executeRawUnsafe(
      "INSERT INTO Resource (id, title, description, category, fileType, r2Key, fileName, fileSize, priceArs, priceUsd, price, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)",
      [id, title, description || "", category || "", fileType || "documento", r2Key, fileName || "", fileSize || 0, priceArs || price || 0, priceUsd || 0, price || priceArs || 0]
    );

    // Invalidate public resources page cache
    revalidatePath('/recursos');
    revalidatePath('/', 'layout');

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
    const { id, title, description, fileType, price, priceArs, priceUsd, category, active, r2Key, fileName, fileSize } = body;

    if (!id) {
      return NextResponse.json({ error: "Se requiere el campo 'id'" }, { status: 400 });
    }

    const sets: string[] = [];
    const values: unknown[] = [];
    if (title !== undefined) { sets.push('"title" = ?'); values.push(title); }
    if (description !== undefined) { sets.push('"description" = ?'); values.push(description); }
    if (category !== undefined) { sets.push('"category" = ?'); values.push(category); }
    if (fileType !== undefined) { sets.push('"fileType" = ?'); values.push(fileType); }
    if (r2Key !== undefined) { sets.push('"r2Key" = ?'); values.push(r2Key); }
    if (fileName !== undefined) { sets.push('"fileName" = ?'); values.push(fileName); }
    if (fileSize !== undefined) { sets.push('"fileSize" = ?'); values.push(fileSize); }
    // Update all price columns for compatibility
    if (price !== undefined) { sets.push('"price" = ?'); values.push(price); sets.push('"priceArs" = ?'); values.push(price); }
    if (priceArs !== undefined) { sets.push('"priceArs" = ?'); values.push(priceArs); }
    if (priceUsd !== undefined) { sets.push('"priceUsd" = ?'); values.push(priceUsd); }
    if (active !== undefined) { sets.push('"active" = ?'); values.push(active ? 1 : 0); }
    sets.push('"updatedAt" = datetime(\'now\')');

    const sql = "UPDATE Resource SET " + sets.join(", ") + " WHERE id = ?";
    await db.$executeRawUnsafe(sql, [...values, id]);

    // Invalidate public resources page cache
    revalidatePath('/recursos');
    revalidatePath('/', 'layout');

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

    // Invalidate public resources page cache
    revalidatePath('/recursos');
    revalidatePath('/', 'layout');

    return NextResponse.json({ message: "Recurso eliminado correctamente" });
  } catch (err) {
    console.error("Error deleting resource:", err);
    return NextResponse.json({ error: "Error al eliminar recurso" }, { status: 500 });
  }
}
