import { NextRequest, NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";
import { getCrystalPrice } from "@/lib/pricing";

/* ── POST: Create PayPal order from cart items ─────────────────────────── */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, sessionId } = body;

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

    // Convert ARS prices to USD using our pricing system
    const paypalItems = items.map((item: { id: number; name: string; quantity: number }) => {
      const pricing = getCrystalPrice(item.id);
      const usdPrice = pricing?.usd || Math.round(item.price / 1000);
      return {
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: usdPrice,
      };
    });

    const order = await createPayPalOrder(paypalItems, sessionId);

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        approvalUrl: order.approvalUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PayPal create order error:", error);
    const message =
      error instanceof Error ? error.message : "Error al crear la orden de PayPal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
