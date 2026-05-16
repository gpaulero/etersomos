import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";

/* ── POST: Capture a PayPal order payment ─────────────────────────────── */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "ID de orden de PayPal requerido." },
        { status: 400 }
      );
    }

    const capture = await capturePayPalOrder(orderId);

    if (capture.status !== "COMPLETED") {
      return NextResponse.json(
        { error: `Pago no completado. Estado: ${capture.status}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        captureId: capture.id,
        status: capture.status,
        amount: capture.amount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PayPal capture error:", error);
    const message =
      error instanceof Error ? error.message : "Error al capturar el pago de PayPal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
