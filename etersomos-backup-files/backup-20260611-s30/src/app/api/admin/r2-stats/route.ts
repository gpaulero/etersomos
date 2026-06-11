import { NextResponse } from "next/server";
import { getR2StorageStats } from "@/lib/r2";

export async function GET() {
  try {
    const stats = await getR2StorageStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("[R2 Stats] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas de almacenamiento" },
      { status: 500 }
    );
  }
}
