"use client";

import { toast } from "sonner";

interface CoursePaymentData {
  courseId: string;
  courseName: string;
  email: string;
  name: string;
  phone: string;
  price: number;
  paymentMethod: "mercadopago" | "paypal";
  enrollmentData: Record<string, unknown>;
}

export async function initiateCoursePayment(data: CoursePaymentData) {
  const sessionId = `course_${data.courseId}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

  // Save enrollment form data
  localStorage.setItem(
    `courseEnrollment_${data.courseId}`,
    JSON.stringify(data.enrollmentData)
  );

  // Save checkout session (format expected by /payment/success page)
  const session = {
    type: "course_enrollment",
    courseId: data.courseId,
    courseName: data.courseName,
    customerName: data.name,
    customerEmail: data.email,
    customerPhone: data.phone,
    address: "Curso online",
    city: "N/A",
    province: "N/A",
    postalCode: "0000",
    notes: `Inscripción a curso: ${data.courseName}`,
    items: [{ id: 0, name: data.courseName, quantity: 1, price: data.price }],
    total: data.price,
    paymentMethod: data.paymentMethod,
    paymentId: null,
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(`checkoutSession_${sessionId}`, JSON.stringify(session));

  if (data.paymentMethod === "mercadopago") {
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
    const res = await fetch("/api/payments/create-paypal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ id: 0, name: data.courseName, quantity: 1, price: data.price }],
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
