/**
 * PayPal integration for Eter Somos
 * Uses PayPal REST API v2
 * Sandbox mode by default (switch to live with PAYPAL_MODE=live)
 */

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";
const PAYPAL_MODE = process.env.PAYPAL_MODE || "sandbox";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.etersomos.com";

const PAYPAL_BASE_URL =
  PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

interface PayPalAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface CartItemForPayment {
  id: number;
  name: string;
  quantity: number;
  price: number; // USD price
}

/** Get PayPal access token */
export async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString(
    "base64"
  );

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`PayPal auth failed: ${error}`);
  }

  const data: PayPalAccessTokenResponse = await res.json();
  return data.access_token;
}

/** Create a PayPal order */
export async function createPayPalOrder(
  items: CartItemForPayment[],
  sessionId: string
): Promise<{ id: string; approvalUrl: string }> {
  const accessToken = await getPayPalAccessToken();

  const totalUSD = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: sessionId,
          description: `Pedido Eter Somos - Cristales`,
          amount: {
            currency_code: "USD",
            value: totalUSD.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: totalUSD.toFixed(2),
              },
            },
          },
          items: items.map((item) => ({
            name: item.name,
            unit_amount: {
              currency_code: "USD",
              value: item.price.toFixed(2),
            },
            quantity: item.quantity.toString(),
            category: "PHYSICAL_GOODS",
          })),
        },
      ],
      application_context: {
        brand_name: "Eter Somos",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        return_url: `${BASE_URL}/payment/success?method=paypal&session=${sessionId}`,
        cancel_url: `${BASE_URL}/?payment=cancelled`,
      },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`PayPal create order failed: ${error}`);
  }

  const order = await res.json();

  const approvalLink = order.links?.find(
    (link: { rel: string; href: string }) => link.rel === "approve"
  );

  if (!approvalLink) {
    throw new Error("No approval URL found in PayPal response");
  }

  return {
    id: order.id,
    approvalUrl: approvalLink.href,
  };
}

/** Capture a PayPal order payment */
export async function capturePayPalOrder(
  orderId: string
): Promise<{ id: string; status: string; amount: string }> {
  const accessToken = await getPayPalAccessToken();

  const res = await fetch(
    `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`PayPal capture failed: ${error}`);
  }

  const capture = await res.json();

  return {
    id: capture.id,
    status: capture.status, // "COMPLETED"
    amount:
      capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ||
      "0",
  };
}
