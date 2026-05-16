import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 15;

/**
 * MercadoPago Webhook / IPN handler
 *
 * MercadoPago sends notifications when a payment status changes.
 * This endpoint receives those notifications and can be used to:
 * - Confirm payments that were pending
 * - Update order status from "pendiente" to "pagado" or "rechazado"
 * - Handle payment refunds
 *
 * Currently, payments are confirmed on the client-side when the user
 * returns to the /payment/success page. This webhook serves as a
 * fallback for cases where the user doesn't return (closes browser, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // MercadoPago IPN notification format
    const { action, type, data } = body as {
      action?: string;
      type?: string;
      data?: { id?: string };
    };

    console.log("[MP Webhook] Received notification:", {
      action,
      type,
      id: data?.id,
    });

    // We acknowledge the notification immediately
    // The actual payment confirmation happens when the user returns
    // to /payment/success and the client calls /api/payments/confirm-order

    // For future enhancement: we could verify the payment status
    // via MercadoPago API here and auto-confirm pending orders

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err) {
    console.error("[MP Webhook] Error processing notification:", err);
    // Return 200 so MercadoPago doesn't retry
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}

// Handle GET requests (MercadoPago sometimes sends GET for IPN verification)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const topic = searchParams.get("topic");
  const id = searchParams.get("id");

  console.log("[MP Webhook] GET notification:", { topic, id });

  return NextResponse.json({ status: "ok" }, { status: 200 });
}
