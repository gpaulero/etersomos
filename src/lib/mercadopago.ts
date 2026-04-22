/**
 * MercadoPago integration for Eter Somos
 * Uses MercadoPago SDK v2.x (mercadopago@2.x)
 * Production mode by default
 */

const MERCADOPAGO_ACCESS_TOKEN =
  process.env.MERCADOPAGO_ACCESS_TOKEN || "";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://etersomos.vercel.app";

interface CartItemForPayment {
  id: number;
  name: string;
  quantity: number;
  price: number; // ARS price
}

/**
 * Create a MercadoPago checkout preference
 * Returns the init_point URL for redirect
 */
export async function createMercadoPagoPreference(
  items: CartItemForPayment[],
  sessionId: string,
  buyerEmail: string
): Promise<{ id: string; initPoint: string; sandboxInitPoint: string }> {
  // SDK v2.x — pass config to Preference constructor
  const { MercadoPagoConfig, Preference } = await import("mercadopago");

  const client = new Preference(
    new MercadoPagoConfig({ access_token: MERCADOPAGO_ACCESS_TOKEN })
  );

  const preference = await client.create({
    body: {
      items: items.map((item) => ({
        id: item.id.toString(),
        title: item.name,
        unit_price: item.price,
        quantity: item.quantity,
        currency_id: "ARS",
        category_id: "art",
      })),
      payer: buyerEmail ? { email: buyerEmail } : undefined,
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
    },
  });

  if (!preference?.id) {
    throw new Error("Failed to create MercadoPago preference");
  }

  return {
    id: preference.id,
    initPoint: preference.init_point || "",
    sandboxInitPoint: preference.sandbox_init_point || "",
  };
}
