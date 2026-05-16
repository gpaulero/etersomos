"use client";

import { toast } from "sonner";

interface ResourcePaymentData {
  resourceId: string;
  resourceTitle: string;
  email: string;
  name: string;
  /** ARS price (used for MercadoPago) */
  priceArs: number;
  /** USD price (used for PayPal) */
  priceUsd: number;
  paymentMethod: "mercadopago" | "paypal";
  /** The r2Key of the resource (needed for download URL after purchase) */
  r2Key: string;
}

export async function initiateResourcePayment(data: ResourcePaymentData) {
  const sessionId = `resource_${data.resourceId}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

  // Save checkout session (format expected by /payment/success page)
  const session = {
    type: "resource_purchase" as const,
    resourceId: data.resourceId,
    resourceTitle: data.resourceTitle,
    r2Key: data.r2Key,
    customerName: data.name,
    customerEmail: data.email,
    customerPhone: "",
    address: "Recurso digital",
    city: "N/A",
    province: "N/A",
    postalCode: "0000",
    notes: `Recurso: ${data.resourceTitle}`,
    items: [{ id: 0, name: `Recurso: ${data.resourceTitle}`, quantity: 1, price: data.priceArs }],
    total: data.priceArs,
    paymentMethod: data.paymentMethod,
    paymentId: null,
    createdAt: new Date().toISOString(),
    extraData: {
      resourceId: data.resourceId,
      resourceTitle: data.resourceTitle,
      r2Key: data.r2Key,
      priceArs: data.priceArs,
      priceUsd: data.priceUsd,
    },
  };

  localStorage.setItem(`checkoutSession_${sessionId}`, JSON.stringify(session));

  if (data.paymentMethod === "mercadopago") {
    const res = await fetch("/api/payments/create-mercadopago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ id: 0, name: `Recurso: ${data.resourceTitle}`, quantity: 1, price: data.priceArs }],
        sessionId,
        buyerEmail: data.email,
      }),
    });
    const result = await res.json();
    if (res.ok && result.initPoint) {
      const s = JSON.parse(localStorage.getItem(`checkoutSession_${sessionId}`) || "{}");
      s.paymentId = result.preferenceId;
      localStorage.setItem(`checkoutSession_${sessionId}`, JSON.stringify(s));
      window.location.href = result.initPoint;
    } else {
      toast.error(result.error || "Error al crear la preferencia de MercadoPago");
    }
  } else {
    // PayPal uses USD price
    const res = await fetch("/api/payments/create-paypal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{
          id: 0,
          name: `Recurso: ${data.resourceTitle}`,
          quantity: 1,
          price: data.priceArs,
          usdPrice: data.priceUsd,
        }],
        sessionId,
      }),
    });
    const result = await res.json();
    if (res.ok && result.approvalUrl) {
      const s = JSON.parse(localStorage.getItem(`checkoutSession_${sessionId}`) || "{}");
      s.paymentId = result.orderId;
      localStorage.setItem(`checkoutSession_${sessionId}`, JSON.stringify(s));
      window.location.href = result.approvalUrl;
    } else {
      toast.error(result.error || "Error al crear la orden de PayPal");
    }
  }
}
