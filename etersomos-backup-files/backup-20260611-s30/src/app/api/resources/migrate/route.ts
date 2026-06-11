import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET() {
  try {
    const prisma = new PrismaClient();
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Resource" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL DEFAULT '',
        "fileType" TEXT NOT NULL DEFAULT 'documento',
        "r2Key" TEXT NOT NULL,
        "fileName" TEXT NOT NULL,
        "price" REAL NOT NULL DEFAULT 0,
        "fileSize" INTEGER NOT NULL DEFAULT 0,
        "active" BOOLEAN NOT NULL DEFAULT 1,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "Resource_r2Key_key" ON "Resource"("r2Key");
    `);
    await prisma.$disconnect();
    return NextResponse.json({ success: true, message: "Tabla Resource creada" });
  } catch (err) {
    console.error("Migration error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
