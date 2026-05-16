import { NextRequest, NextResponse } from "next/server";
import { createMercadoPagoPreference } from "@/lib/mercadopago";

/* ── POST: Create MercadoPago preference from cart items ──────────────── */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, sessionId, buyerEmail } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "No hay productos en el carrito." },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: "Sesión de checkout requerida." },
        { status: 400 }
      );
    }

    // Items already have ARS prices from the cart
    const mpItems = items.map((item: { id: number; name: string; quantity: number; price: number }) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price, // ARS
    }));

    const preference = await createMercadoPagoPreference(
      mpItems,
      sessionId,
      buyerEmail || ""
    );

    return NextResponse.json(
      {
        success: true,
        preferenceId: preference.id,
        initPoint: preference.initPoint,
        sandboxInitPoint: preference.sandboxInitPoint,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("MercadoPago create preference error:", error);
    const message =
      error instanceof Error ? error.message : "Error al crear la preferencia de MercadoPago.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
