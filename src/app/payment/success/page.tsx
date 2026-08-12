"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Loader2, Sparkles, ShoppingBag, BookOpen, Eye, ArrowLeft, AlertTriangle, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CheckoutType } from "@/lib/course-payment";

type PaymentStatus = "processing" | "success" | "error";

interface CheckoutSession {
  type?: CheckoutType;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  notes: string;
  items: Array<{ id: number; name: string; quantity: number; price: number }>;
  total: number;
  paymentMethod: string;
  paymentId: string | null;
  createdAt: string;
  extraData?: Record<string, unknown>;
  // Resource purchase fields
  resourceId?: string;
  resourceTitle?: string;
  r2Key?: string;
}

/* Type-specific display config */
const TYPE_CONFIG: Record<string, {
  processingTitle: string;
  successTitle: string;
  successMessage: (name: string) => string;
  summaryLabel: string;
  summaryIcon: React.ReactNode;
}> = {
  crystal_order: {
    processingTitle: "Procesando tu pedido...",
    successTitle: "¡Pedido Confirmado!",
    successMessage: (name) => `Gracias por tu compra, ${name}. Recibirás un email de confirmación pronto.`,
    summaryLabel: "Resumen del pedido",
    summaryIcon: <ShoppingBag className="size-4" />,
  },
  course_enrollment: {
    processingTitle: "Procesando tu inscripción...",
    successTitle: "¡Inscripción Confirmada!",
    successMessage: (name) => `¡Bienvenido/a, ${name}! Gracias por completar tu inscripción. Te enviaremos los accesos al Aula Virtual por email.`,
    summaryLabel: "Resumen de inscripción",
    summaryIcon: <BookOpen className="size-4" />,
  },
  reading: {
    processingTitle: "Procesando tu solicitud...",
    successTitle: "¡Solicitud Registrada!",
    successMessage: (name) => `${name}, tu solicitud de lectura fue registrada. Vas a recibir un email con tus credenciales para ingresar al Aula Virtual, donde podrás escuchar tu lectura cuando esté lista.`,
    summaryLabel: "Resumen de solicitud",
    summaryIcon: <Eye className="size-4" />,
  },
  resource_purchase: {
    processingTitle: "Procesando tu compra...",
    successTitle: "¡Acceso Confirmado!",
    successMessage: (name) => `¡Gracias, ${name}! Tu compra fue confirmada. Ya podés descargar el recurso.`,
    summaryLabel: "Resumen de compra",
    summaryIcon: <FileText className="size-4" />,
  },
};

function getConfig(type?: CheckoutType) {
  return TYPE_CONFIG[type || "crystal_order"] || TYPE_CONFIG.crystal_order;
}

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<PaymentStatus>("processing");
  const [errorMessage, setErrorMessage] = useState("");
  const [orderInfo, setOrderInfo] = useState<CheckoutSession | null>(null);
  const [downloadToken, setDownloadToken] = useState<string | null>(null);
  const hasRunRef = useRef(false);

  const processPayment = useCallback(
    async (
      method: string | null,
      sessionId: string,
      paypalToken: string | null
    ) => {
      const sessionKey = `checkoutSession_${sessionId}`;
      const sessionRaw = localStorage.getItem(sessionKey);

      if (!sessionRaw) {
        setStatus("error");
        setErrorMessage("La sesión de compra expiró o no existe.");
        return;
      }

      let session: CheckoutSession;
      try {
        session = JSON.parse(sessionRaw);
        setOrderInfo(session);
      } catch {
        setStatus("error");
        setErrorMessage("Error al leer los datos de la compra.");
        return;
      }

      const orderType = session.type || "crystal_order";
      const config = getConfig(orderType);

      try {
        let finalPaymentId = session.paymentId;

        if (method === "paypal" && paypalToken) {
          try {
            const captureRes = await fetch("/api/payments/capture-paypal", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: paypalToken }),
            });
            const captureData = await captureRes.json();
            if (captureRes.ok && captureData.success) {
              finalPaymentId = captureData.captureId;
            }
          } catch {
            console.log("PayPal capture failed or already captured, continuing...");
          }
        }

        const confirmRes = await fetch("/api/payments/confirm-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: orderType,
            customerName: session.customerName,
            customerEmail: session.customerEmail,
            customerPhone: session.customerPhone,
            address: session.address,
            city: session.city,
            province: session.province,
            postalCode: session.postalCode,
            notes: session.notes,
            items: session.items,
            total: session.total,
            paymentMethod: session.paymentMethod,
            paymentId: finalPaymentId || paypalToken || null,
            extraData: session.extraData,
          }),
        });

        const confirmData = await confirmRes.json();

        if (confirmRes.ok && confirmData.success) {
          localStorage.removeItem(sessionKey);

          // If this was a resource purchase, store the download token
          if (orderType === "resource_purchase" && confirmData.downloadToken) {
            setDownloadToken(confirmData.downloadToken);
          }

          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage(confirmData.error || "Error al confirmar el pedido.");
        }
      } catch {
        setStatus("error");
        setErrorMessage("Error de conexión. Intentá de nuevo.");
      }
    },
    []
  );

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const method = searchParams.get("method");
    const sessionId = searchParams.get("session");
    const paypalToken = searchParams.get("token");

    setTimeout(() => processPayment(method, sessionId || "missing", paypalToken), 0);
  }, [searchParams, processPayment]);

  const formatPrice = (price: number) =>
    `$${price.toLocaleString("es-AR")} ARS`;

  const orderType = orderInfo?.type || "crystal_order";
  const config = getConfig(orderType);
  const isCrystal = orderType === "crystal_order";
  const isResource = orderType === "resource_purchase";

  // Build download URL for resource purchase
  const downloadUrl = isResource && downloadToken && orderInfo?.r2Key
    ? `/api/resources/download?key=${encodeURIComponent(orderInfo.r2Key)}&token=${downloadToken}`
    : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full text-center"
      >
        {status === "processing" && (
          <div className="space-y-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-gold-500/10 flex items-center justify-center">
              <Loader2 className="size-10 text-gold-400 animate-spin" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-foreground">
              {config.processingTitle}
            </h1>
            <p className="text-foreground/60">
              Estamos confirmando tu pago y registrando la información. Esto puede
              tomar unos segundos.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="mx-auto w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center"
            >
              <Check className="size-10 text-green-400" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-foreground mb-2">
                {config.successTitle}
              </h1>
              <p className="text-foreground/60">
                {config.successMessage(orderInfo?.customerName || "")}
              </p>
            </motion.div>

            {/* Download button for resource purchase */}
            {isResource && downloadUrl && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <a
                  href={downloadUrl}
                  download
                  className="inline-flex items-center justify-center gap-2.5 w-full px-6 py-4 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 hover:text-violet-300 font-serif font-semibold text-base transition-all duration-200 border border-violet-500/30 hover:border-violet-500/50"
                >
                  <Download className="size-5" />
                  Descargar {orderInfo?.resourceTitle || "Recurso"}
                </a>
                <p className="text-foreground/30 text-xs mt-2 font-sans">
                  Este enlace de descarga es exclusivo para tu compra. Guardalo para futuras descargas.
                </p>
              </motion.div>
            )}

            {orderInfo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-mystic-900/50 border border-mystic-700/30 rounded-2xl p-6 text-left space-y-4"
              >
                <div className="flex items-center gap-2 text-gold-400 font-serif font-semibold">
                  {config.summaryIcon}
                  <span>{config.summaryLabel}</span>
                </div>

                {orderInfo.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-foreground/70">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="text-foreground/80">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}

                <div className="border-t border-mystic-700/30 pt-3">
                  <div className="flex justify-between font-bold">
                    <span className="text-gold-300">Total</span>
                    <span className="text-gold-400 font-serif">
                      {formatPrice(orderInfo.total)}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-foreground/40 space-y-1">
                  {isCrystal && (
                    <p>
                      Envío a: {orderInfo.address}, {orderInfo.city},{" "}
                      {orderInfo.province} ({orderInfo.postalCode})
                    </p>
                  )}
                  <p>
                    Método de pago:{" "}
                    {orderInfo.paymentMethod === "paypal"
                      ? "PayPal"
                      : orderInfo.paymentMethod === "mercadopago"
                        ? "MercadoPago"
                        : orderInfo.paymentMethod}
                  </p>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <Button
                onClick={() => router.push("/")}
                className="w-full bg-foreground hover:bg-foreground/80 text-background font-serif font-semibold py-6 rounded-full transition-all duration-300"
              >
                <Sparkles className="size-5 mr-2" />
                Volver a Eter Somos
              </Button>
            </motion.div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
              <AlertTriangle className="size-10 text-red-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-foreground">
              Error en el pago
            </h1>
            <p className="text-foreground/60">{errorMessage}</p>
            <Button
              onClick={() => router.push("/")}
              className="bg-foreground hover:bg-foreground/80 text-background font-serif font-semibold py-6 rounded-full transition-all duration-300"
            >
              <ArrowLeft className="size-5 mr-2" />
              Volver al inicio
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
          <Loader2 className="size-8 text-gold-400 animate-spin" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
