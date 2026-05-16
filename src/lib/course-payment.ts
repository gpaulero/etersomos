"use client";

import { toast } from "sonner";

export type CheckoutType = "crystal_order" | "course_enrollment" | "reading";

interface CoursePaymentData {
  courseId: string;
  courseName: string;
  email: string;
  name: string;
  phone: string;
  /** ARS price (used for MercadoPago) */
  price: number;
  /** USD price (used for PayPal). If not provided, falls back to ARS conversion. */
  usdPrice?: number;
  paymentMethod: "mercadopago" | "paypal";
  enrollmentData: Record<string, unknown>;
  /** Override the checkout session type. Defaults to "course_enrollment". */
  checkoutType?: CheckoutType;
}

export async function initiateCoursePayment(data: CoursePaymentData) {
  const sessionId = `course_${data.courseId}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  const checkoutType = data.checkoutType || "course_enrollment";

  // Save enrollment form data
  localStorage.setItem(
    `courseEnrollment_${data.courseId}`,
    JSON.stringify(data.enrollmentData)
  );

  // Save checkout session (format expected by /payment/success page)
  const session = {
    type: checkoutType,
    courseId: data.courseId,
    courseName: data.courseName,
    customerName: data.name,
    customerEmail: data.email,
    customerPhone: data.phone,
    address: checkoutType === "crystal_order" ? "" : "Curso online",
    city: checkoutType === "crystal_order" ? "" : "N/A",
    province: checkoutType === "crystal_order" ? "" : "N/A",
    postalCode: checkoutType === "crystal_order" ? "" : "0000",
    notes: checkoutType === "course_enrollment"
      ? `Inscripción a curso: ${data.courseName}`
      : checkoutType === "reading"
        ? `Lectura: ${data.courseName}`
        : "",
    items: [{ id: 0, name: data.courseName, quantity: 1, price: data.price }],
    total: data.price,
    paymentMethod: data.paymentMethod,
    paymentId: null,
    createdAt: new Date().toISOString(),
    extraData: data.enrollmentData,
  };

  localStorage.setItem(`checkoutSession_${sessionId}`, JSON.stringify(session));

  if (data.paymentMethod === "mercadopago") {
    // MercadoPago always uses ARS price
    const res = await fetch("/api/payments/create-mercadopago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ id: 0, name: data.courseName, quantity: 1, price: data.price }],
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
          name: data.courseName,
          quantity: 1,
          price: data.price, // ARS price (fallback)
          usdPrice: data.usdPrice, // USD price for PayPal
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
