/**
 * Servicio de notificaciones para Eter Somos
 *
 * WHASTAPP: Usa WhatsApp Business Cloud API (Meta).
 *   Para configurar:
 *   1. Creá una app en developers.facebook.com
 *   2. Activá WhatsApp Business API
 *   3. Obtené PHONE_NUMBER_ID y ACCESS_TOKEN
 *   4. Configurá las variables en .env
 *
 *   Alternativa gratuita: usá CallMeBot (callmebot.com) - 20 msgs/día gratis.
 *   Solo necesitás registrarte y obtener un API key.
 *
 * GOOGLE CALENDAR: Genera enlaces de evento sin necesidad de API keys.
 *   El enlace se abre en Google Calendar con todos los datos pre-cargados.
 */

interface BookingData {
  name: string;
  email: string;
  phone: string;
  readingType: string;
  preferredDate?: string | null;
  preferredTime?: string | null;
  message?: string | null;
}

// ─── WhatsApp Notification ──────────────────────────────────────────────

const WHATSAPP_PROVIDER = (process.env.WHATSAPP_PROVIDER || "link").toLowerCase();

/**
 * Sends WhatsApp notification to admin when a new booking is created.
 * Returns the WhatsApp message link as fallback.
 */
export async function sendWhatsAppNotification(booking: BookingData): Promise<{
  success: boolean;
  method: string;
  link?: string;
}> {
  const adminPhone = process.env.ADMIN_PHONE || "";
  const text = buildWhatsAppMessage(booking);

  if (!adminPhone) {
    // No admin phone configured, return the link for manual use
    const link = buildWhatsAppLink("", text);
    return { success: false, method: "no_config", link };
  }

  if (WHATSAPP_PROVIDER === "callmebot") {
    return sendViaCallMeBot(adminPhone, text);
  }

  if (WHATSAPP_PROVIDER === "meta") {
    return sendViaMetaAPI(adminPhone, text);
  }

  // Default: generate wa.me link (admin can click it manually)
  const link = buildWhatsAppLink(adminPhone, text);
  return { success: true, method: "link", link };
}

function buildWhatsAppMessage(booking: BookingData): string {
  const lines = [
    "✨ *NUEVA RESERVA - Eter Somos* ✨",
    "",
    `👤 *Nombre:* ${booking.name}`,
    `📧 *Email:* ${booking.email}`,
    `📱 *Teléfono:* ${booking.phone}`,
    `🔮 *Lectura:* ${booking.readingType}`,
  ];
  if (booking.preferredDate) {
    lines.push(`📅 *Fecha preferida:* ${booking.preferredDate}`);
  }
  if (booking.preferredTime) {
    lines.push(`🕐 *Horario:* ${booking.preferredTime}`);
  }
  if (booking.message) {
    lines.push(`💬 *Mensaje:* ${booking.message}`);
  }
  lines.push("");
  lines.push("⚠️ Recordá: La lectura debe enviarse en un plazo de 5 días.");
  return encodeURIComponent(lines.join("\n"));
}

function buildWhatsAppLink(phone: string, encodedText: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

async function sendViaCallMeBot(
  adminPhone: string,
  text: string
): Promise<{ success: boolean; method: string; link?: string }> {
  const apiKey = process.env.CALLMEBOT_API_KEY || "";
  if (!apiKey) {
    const link = buildWhatsAppLink(adminPhone, text);
    return { success: false, method: "callmebot_no_key", link };
  }

  try {
    const cleanPhone = adminPhone.replace(/[^0-9]/g, "");
    const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&apikey=${apiKey}&text=${text}`;
    const res = await fetch(url);
    if (res.ok) {
      return { success: true, method: "callmebot" };
    }
    return { success: false, method: "callmebot_error", link: buildWhatsAppLink(adminPhone, text) };
  } catch {
    return { success: false, method: "callmebot_error", link: buildWhatsAppLink(adminPhone, text) };
  }
}

async function sendViaMetaAPI(
  adminPhone: string,
  text: string
): Promise<{ success: boolean; method: string; link?: string }> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || "";

  if (!phoneNumberId || !accessToken) {
    const link = buildWhatsAppLink(adminPhone, text);
    return { success: false, method: "meta_no_creds", link };
  }

  try {
    const cleanPhone = adminPhone.replace(/[^0-9]/g, "");
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: cleanPhone,
        type: "text",
        text: { body: decodeURIComponent(text) },
      }),
    });

    if (res.ok) {
      return { success: true, method: "meta_api" };
    }
    return { success: false, method: "meta_error", link: buildWhatsAppLink(adminPhone, text) };
  } catch {
    return { success: false, method: "meta_error", link: buildWhatsAppLink(adminPhone, text) };
  }
}

/**
 * Build WhatsApp link to contact a client about their booking
 */
export function buildClientWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

// ─── Google Calendar ─────────────────────────────────────────────────────

/**
 * Generates a Google Calendar event link for a confirmed booking.
 * The event is created with a 60/75/90 min duration depending on reading type.
 */
export function generateGoogleCalendarLink(
  booking: BookingData,
  eventDate?: string
): string {
  const durationMap: Record<string, number> = {
    "Lectura Individual": 60,
    "Lectura de Pareja": 90,
    "Lectura Profesional": 75,
  };

  const duration = durationMap[booking.readingType] || 60;

  // Use preferred date or today
  let dateStr = eventDate || booking.preferredDate || new Date().toISOString().split("T")[0];
  // Handle ISO format (has T)
  if (dateStr.includes("T")) {
    dateStr = dateStr.split("T")[0];
  }

  // Parse time preference
  const timeMap: Record<string, string> = {
    "Mañana": "10:00",
    "Tarde": "15:00",
    "Noche": "19:00",
  };
  const startTime = timeMap[booking.preferredTime || ""] || "10:00";

  // Build ISO datetime strings for Google Calendar
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, mins] = startTime.split(":").map(Number);

  const start = new Date(year, month - 1, day, hours, mins, 0);
  const end = new Date(start.getTime() + duration * 60 * 1000);

  const formatCalendarDate = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `[ETER SOMOS] ${booking.readingType} - ${booking.name}`,
    dates: `${formatCalendarDate(start)}/${formatCalendarDate(end)}`,
    details: [
      `Lectura Akáshica para ${booking.name}`,
      `Tipo: ${booking.readingType}`,
      `Email: ${booking.email}`,
      `Teléfono: ${booking.phone}`,
      booking.message ? `Mensaje del consultante: ${booking.message}` : "",
      "",
      "⚠️ PLAZO: Enviar la lectura grabada por email dentro de los 5 días.",
      "",
      "---",
      "Eter Somos | Registros Akáshicos",
    ]
      .filter(Boolean)
      .join("\n"),
    location: "Online (envío por email)",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ─── Deadline calculator ─────────────────────────────────────────────────

/**
 * Calculates the deadline (5 business days from confirmation date).
 * Returns { deadline, isOverdue, daysRemaining, statusText }
 */
export function calculateDeadline(confirmedAt: Date | string): {
  deadline: Date;
  isOverdue: boolean;
  daysRemaining: number;
  statusText: string;
} {
  const confirmed = new Date(confirmedAt);
  const deadline = new Date(confirmed);
  let businessDays = 0;

  while (businessDays < 5) {
    deadline.setDate(deadline.getDate() + 1);
    const dayOfWeek = deadline.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++;
    }
  }

  deadline.setHours(23, 59, 59, 999);

  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const calendarDays = Math.ceil(
    (deadline.getTime() - confirmed.getTime()) / (1000 * 60 * 60 * 24)
  );

  const isOverdue = diffDays < 0;
  const daysRemaining = Math.max(0, diffDays);

  let statusText: string;
  if (isOverdue) {
    statusText = `Vencida hace ${Math.abs(diffDays)} día(s)`;
  } else if (diffDays === 0) {
    statusText = "Vence hoy";
  } else if (diffDays <= 2) {
    statusText = `${diffDays} día(s) restante(s) - Apurarse!`;
  } else {
    statusText = `${diffDays} día(s) restante(s)`;
  }

  return { deadline, isOverdue, daysRemaining, statusText };
}
