/**
 * MercadoPago integration for Eter Somos
 * Uses MercadoPago REST API directly (more reliable than SDK)
 * Production mode by default
 */

const MERCADOPAGO_ACCESS_TOKEN =
  process.env.MERCADOPAGO_ACCESS_TOKEN || "";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://etersomos-iota.vercel.app";

interface CartItemForPayment {
  id: number;
  name: string;
  quantity: number;
  price: number; // ARS price
}

interface MPPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

/**
 * Create a MercadoPago checkout preference via REST API
 * Returns the init_point URL for redirect
 */
export async function createMercadoPagoPreference(
  items: CartItemForPayment[],
  sessionId: string,
  buyerEmail: string
): Promise<{ id: string; initPoint: string; sandboxInitPoint: string }> {
  const body: Record<string, unknown> = {
    items: items.map((item) => ({
      id: item.id.toString(),
      title: item.name,
      unit_price: item.price,
      quantity: item.quantity,
      currency_id: "ARS",
      category_id: "art",
    })),
    back_urls: {
      success: `${BASE_URL}/payment/success?method=mercadopago&session=${sessionId}`,
      failure: `${BASE_URL}/?payment=failed`,
      pending: `${BASE_URL}/payment/success?method=mercadopago&session=${sessionId}&status=pending`,
    },
    auto_return: "approved",
    external_reference: sessionId,
    notification_url: `${BASE_URL}/api/payments/mercadopago-webhook`,
    metadata: {
      session_id: sessionId,
    },
    statement_descriptor: "ETER SOMOS",
    binary_mode: true,
  };

  if (buyerEmail) {
    body.payer = { email: buyerEmail };
  }

  const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": sessionId,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("MercadoPago API error:", res.status, errorText);
    throw new Error(`MercadoPago API error (${res.status}): ${errorText}`);
  }

  const data: MPPreferenceResponse = await res.json();

  if (!data.id) {
    throw new Error("MercadoPago: no se recibió ID de preferencia");
  }

  return {
    id: data.id,
    initPoint: data.init_point || "",
    sandboxInitPoint: data.sandbox_init_point || "",
  };
}
