import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "eter2024admin";
const API_SECRET = process.env.ADMIN_API_SECRET;

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    if (!password) return NextResponse.json({ error: "Contrasena requerida" }, { status: 400 });
    if (typeof password !== "string" || password.length > 100) return NextResponse.json({ error: "Contrasena invalida" }, { status: 400 });
    if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: "Contrasena incorrecta" }, { status: 401 });
    if (!API_SECRET) return NextResponse.json({ error: "Error de configuracion" }, { status: 500 });
    return NextResponse.json({ success: true, token: API_SECRET });
  } catch {
    return NextResponse.json({ error: "Error al procesar" }, { status: 500 });
  }
}
