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

    // Items can have an explicit USD price (courses/readings) or ARS price (crystals)
    // If item has usdPrice, use it directly. Otherwise convert from ARS.
    const paypalItems = items.map((item: { id: number; name: string; quantity: number; price: number; usdPrice?: number }) => {
      if (item.usdPrice && item.usdPrice > 0) {
        // Explicit USD price (courses, readings)
        return {
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.usdPrice,
        };
      }
      // Crystal — convert from ARS using pricing table
      const pricing = getCrystalPrice(item.id);
      const usdPrice = pricing?.usd || Math.round(item.price / 1000);
      return {
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: usdPrice,
      };
    });

    // Validate that all prices are > 0
    if (paypalItems.some((item) => item.price <= 0)) {
      return NextResponse.json(
        { error: "El precio en USD debe ser mayor a 0." },
        { status: 400 }
      );
    }

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
