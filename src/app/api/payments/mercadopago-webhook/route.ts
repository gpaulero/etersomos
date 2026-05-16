import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendAdminNotification } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 15;

/**
 * MercadoPago Webhook / IPN handler
 *
 * Handles payment notifications from MercadoPago:
 * - Verifies payment status via MP API
 * - If payment is approved and no order exists yet (user didn't return to success page),
 *   creates the order record and sends notification emails
 * - If payment is approved and order exists but pending, marks it as paid
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

    // Only process payment-related notifications
    if (type !== "payment" && action !== "payment.created" && action !== "payment.updated") {
      console.log("[MP Webhook] Ignoring non-payment notification:", type, action);
      return NextResponse.json({ status: "ignored" }, { status: 200 });
    }

    const paymentId = data?.id;
    if (!paymentId) {
      console.log("[MP Webhook] No payment ID in notification");
      return NextResponse.json({ status: "ok" }, { status: 200 });
    }

    // Verify payment status with MercadoPago API
    const mpAccessToken = process.env.MP_ACCESS_TOKEN;
    if (!mpAccessToken) {
      console.error("[MP Webhook] MP_ACCESS_TOKEN not configured");
      return NextResponse.json({ status: "ok" }, { status: 200 });
    }

    try {
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${mpAccessToken}`,
        },
      });

      if (!mpResponse.ok) {
        console.error("[MP Webhook] Failed to verify payment with MP API:", mpResponse.status);
        return NextResponse.json({ status: "ok" }, { status: 200 });
      }

      const paymentData = await mpResponse.json();
      const paymentStatus = paymentData.status;
      const mpPaymentId = String(paymentData.id);

      console.log("[MP Webhook] Payment status:", paymentStatus, "ID:", mpPaymentId);

      // Only process approved payments
      if (paymentStatus !== "approved") {
        console.log("[MP Webhook] Payment not approved, status:", paymentStatus);
        return NextResponse.json({ status: "ok" }, { status: 200 });
      }

      // Check if we already have an order with this payment ID
      const existingOrder = await db.crystalOrder.findFirst({
        where: { paymentId: mpPaymentId },
      });

      if (existingOrder) {
        // Order already exists — update status if still pending
        if (existingOrder.status === "pendiente") {
          await db.crystalOrder.update({
            where: { id: existingOrder.id },
            data: { status: "pagado" },
          });
          console.log("[MP Webhook] Updated order", existingOrder.id, "to pagado");
        } else {
          console.log("[MP Webhook] Order already processed:", existingOrder.id);
        }
        return NextResponse.json({ status: "ok" }, { status: 200 });
      }

      // Check if we have a reading booking with this payment ID
      const existingBooking = await db.readingBooking.findFirst({
        where: { phone: { contains: mpPaymentId } },
      });

      if (existingBooking) {
        if (existingBooking.status === "pendiente") {
          await db.readingBooking.update({
            where: { id: existingBooking.id },
            data: { status: "confirmada" },
          });
          console.log("[MP Webhook] Updated booking", existingBooking.id, "to confirmada");
        }
        return NextResponse.json({ status: "ok" }, { status: 200 });
      }

      // No existing order found — the user didn't return to the success page
      // We can't create the full order without the session data (stored in client localStorage)
      // Send admin notification so they can manually process this
      console.warn("[MP Webhook] Approved payment with no matching order:", mpPaymentId);

      try {
        await sendAdminNotification({
          type: "crystal", // reuse template
          customerName: paymentData.payer?.first_name || "Desconocido",
          customerEmail: paymentData.payer?.email || "N/A",
          customerPhone: "",
          items: [{ id: 1, name: "Pago sin orden (webhook)", quantity: 1, price: paymentData.transaction_amount || 0 }],
          total: paymentData.transaction_amount || 0,
          paymentMethod: "mercadopago",
          paymentId: mpPaymentId,
          orderId: "WEBHOOK-NO-ORDER",
          extraData: {
            webhookAlert: true,
            mpPaymentId,
            payerEmail: paymentData.payer?.email,
            description: paymentData.description,
            dateApproved: paymentData.date_approved,
          },
        });
        console.log("[MP Webhook] Sent admin notification for unclaimed payment:", mpPaymentId);
      } catch (emailErr) {
        console.error("[MP Webhook] Failed to send admin notification:", emailErr);
      }

      return NextResponse.json({ status: "ok" }, { status: 200 });
    } catch (verifyErr) {
      console.error("[MP Webhook] Error verifying payment:", verifyErr);
      // Return 200 so MP doesn't keep retrying
      return NextResponse.json({ status: "ok" }, { status: 200 });
    }
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
