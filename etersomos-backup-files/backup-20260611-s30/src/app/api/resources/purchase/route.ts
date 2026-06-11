import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 15;

const CREATE_PURCHASE_TABLE_SQL = [
  "CREATE TABLE IF NOT EXISTS ResourcePurchase (",
  "id TEXT NOT NULL PRIMARY KEY,",
  "resourceId TEXT NOT NULL,",
  "resourceTitle TEXT NOT NULL DEFAULT '',",
  "customerName TEXT NOT NULL,",
  "customerEmail TEXT NOT NULL,",
  "paymentMethod TEXT NOT NULL,",
  "paymentId TEXT,",
  "amount REAL NOT NULL DEFAULT 0,",
  "downloadToken TEXT NOT NULL UNIQUE,",
  "status TEXT NOT NULL DEFAULT 'pendiente',",
  "createdAt TEXT NOT NULL DEFAULT (datetime('now'))",
  ")",
].join(" ");

/** Ensure the ResourcePurchase table exists */
async function ensurePurchaseTable() {
  await db.$executeRawUnsafe(CREATE_PURCHASE_TABLE_SQL, []);
}

// POST: Create a new resource purchase (called after payment confirmation)
export async function POST(request: NextRequest) {
  try {
    await ensurePurchaseTable();

    const body = await request.json();
    const { resourceId, resourceTitle, customerName, customerEmail, paymentMethod, paymentId, amount } = body;

    if (!resourceId || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios." },
        { status: 400 }
      );
    }

    // Generate ID
    const idResult = await db.$executeRawUnsafe("SELECT lower(hex(randomblob(12))) as id", []);
    const id = (idResult as any)?.rows?.[0]?.id;
    if (!id) throw new Error("Failed to generate ID");

    // Generate download token (random hex)
    const tokenResult = await db.$executeRawUnsafe("SELECT lower(hex(randomblob(16))) as token", []);
    const downloadToken = (tokenResult as any)?.rows?.[0]?.token;
    if (!downloadToken) throw new Error("Failed to generate token");

    await db.$executeRawUnsafe(
      "INSERT INTO ResourcePurchase (id, resourceId, resourceTitle, customerName, customerEmail, paymentMethod, paymentId, amount, downloadToken, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, resourceId, resourceTitle || "", customerName.trim(), customerEmail.trim().toLowerCase(), paymentMethod, paymentId || null, amount || 0, downloadToken, "pagado"]
    );

    return NextResponse.json({
      success: true,
      purchaseId: id,
      downloadToken,
      downloadUrl: `/api/resources/download?key=RESOURCE_R2KEY&token=${downloadToken}`,
    }, { status: 201 });
  } catch (err) {
    console.error("Error creating resource purchase:", err);
    return NextResponse.json(
      { error: "Error al registrar la compra del recurso." },
      { status: 500 }
    );
  }
}

// GET: Verify a download token and return the associated resource r2Key
export async function GET(request: NextRequest) {
  try {
    await ensurePurchaseTable();

    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token de descarga requerido." },
        { status: 400 }
      );
    }

    // Look up the purchase by download token
    const result = await db.$executeRawUnsafe(
      "SELECT * FROM ResourcePurchase WHERE downloadToken = ? AND status = 'pagado'",
      [token]
    );
    const rows = (result as any)?.rows || [];

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Token de descarga inválido o expirado." },
        { status: 404 }
      );
    }

    const purchase = rows[0];

    // Now look up the resource to get the r2Key
    const resourceResult = await db.$executeRawUnsafe(
      "SELECT r2Key, title FROM Resource WHERE id = ?",
      [purchase.resourceId]
    );
    const resourceRows = (resourceResult as any)?.rows || [];

    if (resourceRows.length === 0) {
      return NextResponse.json(
        { error: "Recurso no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      r2Key: resourceRows[0].r2Key,
      title: resourceRows[0].title || purchase.resourceTitle,
      customerEmail: purchase.customerEmail,
    });
  } catch (err) {
    console.error("Error verifying purchase token:", err);
    return NextResponse.json(
      { error: "Error al verificar el token de descarga." },
      { status: 500 }
    );
  }
}
