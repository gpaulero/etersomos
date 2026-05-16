import { Resend } from "resend";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "etersomos@gmail.com";
const SENDER = "Eter Somos <onboarding@resend.dev>";

type OrderType = "crystal" | "course" | "reading" | "resource";

interface EmailItem {
  name: string;
  quantity: number;
  price: number;
}

/* ── Shared: Create Resend instance ───────────────────────────────────── */

function createResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(apiKey);
}

/* ── Payment method label helper ──────────────────────────────────────── */

function paymentLabel(method: string): string {
  switch (method) {
    case "paypal":
      return "PayPal";
    case "mercadopago":
      return "MercadoPago";
    case "transferencia":
      return "Transferencia Brubank";
    case "western_union":
      return "Western Union";
    default:
      return method;
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   ADMIN NOTIFICATION EMAILS
   ═══════════════════════════════════════════════════════════════════════ */

interface AdminNotificationParams {
  type: OrderType;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: EmailItem[];
  total: number;
  paymentMethod: string;
  paymentId?: string;
  orderId?: string;
  extraData?: Record<string, unknown>;
}

export async function sendAdminNotification(params: AdminNotificationParams): Promise<void> {
  const resend = createResendClient();

  const subjects: Record<OrderType, string> = {
    crystal: `✨ Nuevo pedido de cristales - ${params.customerName} - $${params.total.toLocaleString("es-AR")} ARS`,
    course: `📚 Nueva inscripción a curso - ${params.customerName} - $${params.total.toLocaleString("es-AR")} ARS`,
    reading: `🔮 Nueva solicitud de lectura - ${params.customerName} - $${params.total.toLocaleString("es-AR")} ARS`,
    resource: `📥 Nueva contribución a recurso - ${params.customerName}`,
  };

  const html = buildAdminHtml(params);

  await resend.emails.send({
    from: SENDER,
    to: [ADMIN_EMAIL],
    subject: subjects[params.type],
    html,
  });

  console.log(`[Email] Admin notification sent for ${params.type}: ${params.orderId || "no-id"}`);
}

function buildAdminHtml(params: AdminNotificationParams): string {
  switch (params.type) {
    case "crystal":
      return buildCrystalAdminHtml(params);
    case "course":
      return buildCourseAdminHtml(params);
    case "reading":
      return buildReadingAdminHtml(params);
    case "resource":
      return buildResourceAdminHtml(params);
  }
}

/* ── Crystal Admin Email ──────────────────────────────────────────────── */

function buildCrystalAdminHtml(params: AdminNotificationParams): string {
  const extra = params.extraData || {};
  const itemsRows = params.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 16px; border-bottom: 1px solid #2a252066; color: #f0ebe5;">${escapeHtml(item.name)}</td>
        <td style="padding: 10px 16px; border-bottom: 1px solid #2a252066; color: #f0ebe5; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 16px; border-bottom: 1px solid #2a252066; color: #d4a853; text-align: right;">$${item.price.toLocaleString("es-AR")} ARS</td>
      </tr>`
    )
    .join("");

  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #161310; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1a1510 0%, #0d0b08 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #2a252066;">
        <h1 style="margin: 0; color: #d4a853; font-size: 24px; letter-spacing: 0.1em;">✨ NUEVO PEDIDO DE CRISTALES</h1>
        <p style="margin: 8px 0 0; color: #8a8070; font-size: 14px;">Eter Somos | Registros Akáshicos</p>
      </div>
      <div style="padding: 24px;">
        <h2 style="margin: 0 0 16px; color: #d4a853; font-size: 18px; border-bottom: 1px solid #2a252066; padding-bottom: 8px;">👤 Datos del Comprador</h2>
        <table style="width: 100%; font-size: 14px;">
          <tr><td style="padding: 4px 0; color: #8a8070;">Nombre:</td><td style="padding: 4px 0; color: #f0ebe5; font-weight: 600;">${escapeHtml(params.customerName)}</td></tr>
          <tr><td style="padding: 4px 0; color: #8a8070;">Email:</td><td style="padding: 4px 0; color: #f0ebe5;">${escapeHtml(params.customerEmail)}</td></tr>
          <tr><td style="padding: 4px 0; color: #8a8070;">Teléfono:</td><td style="padding: 4px 0; color: #f0ebe5;">${escapeHtml(params.customerPhone || "")}</td></tr>
          ${extra.address ? `<tr><td style="padding: 4px 0; color: #8a8070;">Dirección:</td><td style="padding: 4px 0; color: #f0ebe5;">${escapeHtml(String(extra.address))}</td></tr>` : ""}
          ${extra.city ? `<tr><td style="padding: 4px 0; color: #8a8070;">Ciudad:</td><td style="padding: 4px 0; color: #f0ebe5;">${escapeHtml(String(extra.city))}</td></tr>` : ""}
          ${extra.province ? `<tr><td style="padding: 4px 0; color: #8a8070;">Provincia:</td><td style="padding: 4px 0; color: #f0ebe5;">${escapeHtml(String(extra.province))}</td></tr>` : ""}
          ${extra.postalCode ? `<tr><td style="padding: 4px 0; color: #8a8070;">C.P.:</td><td style="padding: 4px 0; color: #f0ebe5;">${escapeHtml(String(extra.postalCode))}</td></tr>` : ""}
        </table>
        ${extra.notes ? `<p style="margin: 12px 0 0; color: #8a8070; font-size: 14px;">Notas: <span style="color: #f0ebe5;">${escapeHtml(String(extra.notes))}</span></p>` : ""}
      </div>
      <div style="padding: 0 24px;">
        <h2 style="margin: 0 0 16px; color: #d4a853; font-size: 18px; border-bottom: 1px solid #2a252066; padding-bottom: 8px;">💎 Cristales</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="border-bottom: 2px solid #d4a85333;">
              <th style="padding: 8px 16px; text-align: left; color: #d4a853;">Producto</th>
              <th style="padding: 8px 16px; text-align: center; color: #d4a853;">Cantidad</th>
              <th style="padding: 8px 16px; text-align: right; color: #d4a853;">Precio</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 12px 16px; color: #f0ebe5; font-weight: 700; font-size: 16px; text-align: right;">Total:</td>
              <td style="padding: 12px 16px; color: #d4a853; font-weight: 700; font-size: 18px; text-align: right;">$${params.total.toLocaleString("es-AR")} ARS</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div style="padding: 24px;">
        <h2 style="margin: 0 0 12px; color: #d4a853; font-size: 18px; border-bottom: 1px solid #2a252066; padding-bottom: 8px;">💳 Pago</h2>
        <table style="width: 100%; font-size: 14px;">
          <tr><td style="padding: 4px 0; color: #8a8070;">Método:</td><td style="padding: 4px 0; color: #f0ebe5; font-weight: 600;">${paymentLabel(params.paymentMethod)}</td></tr>
          <tr><td style="padding: 4px 0; color: #8a8070;">ID de Pago:</td><td style="padding: 4px 0; color: #f0ebe5; font-family: monospace; font-size: 12px;">${params.paymentId || "N/A"}</td></tr>
          <tr><td style="padding: 4px 0; color: #8a8070;">ID de Pedido:</td><td style="padding: 4px 0; color: #f0ebe5; font-family: monospace; font-size: 12px;">${params.orderId || "N/A"}</td></tr>
        </table>
      </div>
      <div style="padding: 16px 24px; text-align: center; border-top: 1px solid #2a252066; color: #5a5545; font-size: 12px;">
        <p>Eter Somos | Registros Akáshicos y Cristales</p>
        <p>Este pedido fue procesado automáticamente.</p>
      </div>
    </div>
  `;
}

/* ── Course Admin Email ───────────────────────────────────────────────── */

function buildCourseAdminHtml(params: AdminNotificationParams): string {
  const extra = params.extraData || {};
  const formData = (extra.formData || extra.enrollmentData || {}) as Record<string, string>;

  // Build enrollment detail rows
  const detailRows = [
    ["Email", params.customerEmail],
    ["Teléfono", params.customerPhone || ""],
    ["Nacionalidad", formData.nacionalidad || formData.nationality || ""],
    ["Ciudad de Nacimiento", formData.ciudadNacimiento || formData.birthCity || ""],
    ["Ciudad de Residencia", formData.ciudadResidencia || formData.residenceCity || ""],
    ["Estado Civil", formData.estadoCivil || formData.maritalStatus || ""],
  ]
    .filter(([, val]) => val)
    .map(
      ([label, val]) =>
        `<tr><td style="padding: 4px 0; color: #8a8070; width: 40%;">${label}:</td><td style="padding: 4px 0; color: #f0ebe5;">${escapeHtml(val)}</td></tr>`
    )
    .join("");

  const courseName = params.items[0]?.name || "Curso";

  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #161310; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1a1510 0%, #0d0b08 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #2a252066;">
        <h1 style="margin: 0; color: #d4a853; font-size: 24px; letter-spacing: 0.1em;">📚 NUEVA INSCRIPCIÓN A CURSO</h1>
        <p style="margin: 8px 0 0; color: #8a8070; font-size: 14px;">Eter Somos | Registros Akáshicos</p>
      </div>
      <div style="padding: 24px;">
        <h2 style="margin: 0 0 16px; color: #d4a853; font-size: 18px; border-bottom: 1px solid #2a252066; padding-bottom: 8px;">🎓 Datos del Inscripto</h2>
        <table style="width: 100%; font-size: 14px;">
          <tr><td style="padding: 4px 0; color: #8a8070;">Nombre:</td><td style="padding: 4px 0; color: #f0ebe5; font-weight: 600;">${escapeHtml(params.customerName)}</td></tr>
          ${detailRows}
        </table>
      </div>
      <div style="padding: 0 24px;">
        <h2 style="margin: 0 0 16px; color: #d4a853; font-size: 18px; border-bottom: 1px solid #2a252066; padding-bottom: 8px;">📖 Curso</h2>
        <div style="background: #1a1510; border: 1px solid #2a252066; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
          <p style="margin: 0; color: #f0ebe5; font-size: 16px; font-weight: 600;">${escapeHtml(courseName)}</p>
          <p style="margin: 8px 0 0; color: #d4a853; font-size: 20px; font-weight: 700;">$${params.total.toLocaleString("es-AR")} ARS</p>
        </div>
      </div>
      <div style="padding: 24px;">
        <h2 style="margin: 0 0 12px; color: #d4a853; font-size: 18px; border-bottom: 1px solid #2a252066; padding-bottom: 8px;">💳 Pago</h2>
        <table style="width: 100%; font-size: 14px;">
          <tr><td style="padding: 4px 0; color: #8a8070;">Método:</td><td style="padding: 4px 0; color: #f0ebe5; font-weight: 600;">${paymentLabel(params.paymentMethod)}</td></tr>
          <tr><td style="padding: 4px 0; color: #8a8070;">ID de Pago:</td><td style="padding: 4px 0; color: #f0ebe5; font-family: monospace; font-size: 12px;">${params.paymentId || "N/A"}</td></tr>
          <tr><td style="padding: 4px 0; color: #8a8070;">ID de Registro:</td><td style="padding: 4px 0; color: #f0ebe5; font-family: monospace; font-size: 12px;">${params.orderId || "N/A"}</td></tr>
        </table>
      </div>
      <div style="padding: 16px 24px; text-align: center; border-top: 1px solid #2a252066; color: #5a5545; font-size: 12px;">
        <p>Eter Somos | Registros Akáshicos</p>
        <p>Esta inscripción fue procesada automáticamente.</p>
      </div>
    </div>
  `;
}

/* ── Reading Admin Email ──────────────────────────────────────────────── */

function buildReadingAdminHtml(params: AdminNotificationParams): string {
  const extra = params.extraData || {};
  const formData = (extra.formData || {}) as Record<string, string>;

  // Build personal detail rows
  const detailRows = [
    ["Email", params.customerEmail],
    ["Teléfono", params.customerPhone || ""],
    ["Fecha de Nacimiento", formData.fechaNacimiento || ""],
    ["Nacionalidad", formData.nacionalidad || ""],
    ["Ciudad de Nacimiento", formData.ciudadNacimiento || ""],
    ["Ciudad de Residencia", formData.ciudadResidencia || ""],
    ["Estado Civil", formData.estadoCivil || ""],
  ]
    .filter(([, val]) => val)
    .map(
      ([label, val]) =>
        `<tr><td style="padding: 4px 0; color: #8a8070; width: 40%;">${label}:</td><td style="padding: 4px 0; color: #f0ebe5;">${escapeHtml(val)}</td></tr>`
    )
    .join("");

  // Health info
  const healthRows = [
    ["Enfermedad Crónica", formData.enfermedadCronica || ""],
    ["Medicación", formData.medicacion || ""],
    ["Terapia Psicológica", formData.terapiaPsicologica === "Sí" ? `Sí (${formData.terapiaPsicologicaDuracion || ""})` : (formData.terapiaPsicologica || "")],
    ["Terapia Psiquiátrica", formData.terapiaPsiquiatrica === "Sí" ? `Sí (${formData.terapiaPsiquiatricaDuracion || ""})` : (formData.terapiaPsiquiatrica || "")],
    ["Medicación Psiquiátrica", formData.medicacionPsiquiatrica || ""],
  ]
    .filter(([, val]) => val)
    .map(
      ([label, val]) =>
        `<tr><td style="padding: 4px 0; color: #8a8070; width: 40%;">${label}:</td><td style="padding: 4px 0; color: #f0ebe5;">${escapeHtml(val)}</td></tr>`
    )
    .join("");

  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #161310; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1a1510 0%, #0d0b08 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #2a252066;">
        <h1 style="margin: 0; color: #d4a853; font-size: 24px; letter-spacing: 0.1em;">🔮 NUEVA SOLICITUD DE LECTURA</h1>
        <p style="margin: 8px 0 0; color: #8a8070; font-size: 14px;">Eter Somos | Registros Akáshicos</p>
      </div>
      <div style="padding: 24px;">
        <h2 style="margin: 0 0 16px; color: #d4a853; font-size: 18px; border-bottom: 1px solid #2a252066; padding-bottom: 8px;">👤 Datos del Consultante</h2>
        <table style="width: 100%; font-size: 14px;">
          <tr><td style="padding: 4px 0; color: #8a8070;">Nombre:</td><td style="padding: 4px 0; color: #f0ebe5; font-weight: 600;">${escapeHtml(params.customerName)}</td></tr>
          ${detailRows}
        </table>
      </div>
      ${healthRows ? `
      <div style="padding: 0 24px;">
        <h2 style="margin: 0 0 12px; color: #d4a853; font-size: 16px; border-bottom: 1px solid #2a252066; padding-bottom: 6px;">🏥 Salud</h2>
        <table style="width: 100%; font-size: 13px;">${healthRows}</table>
      </div>` : ""}
      <div style="padding: 24px;">
        <h2 style="margin: 0 0 16px; color: #d4a853; font-size: 18px; border-bottom: 1px solid #2a252066; padding-bottom: 8px;">💫 Preguntas al Campo Akáshico</h2>
        <div style="background: #1a1510; border: 1px solid #2a252066; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
          <p style="margin: 0 0 4px; color: #8a8070; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Pregunta N° 1</p>
          <p style="margin: 0; color: #f0ebe5; font-size: 15px;">${escapeHtml(formData.pregunta1 || "")}</p>
        </div>
        <div style="background: #1a1510; border: 1px solid #2a252066; border-radius: 8px; padding: 16px;">
          <p style="margin: 0 0 4px; color: #8a8070; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Pregunta N° 2</p>
          <p style="margin: 0; color: #f0ebe5; font-size: 15px;">${escapeHtml(formData.pregunta2 || "")}</p>
        </div>
        ${formData.contextoAdicional ? `<p style="margin: 12px 0 0; color: #8a8070; font-size: 14px;">Contexto adicional: <span style="color: #f0ebe5;">${escapeHtml(formData.contextoAdicional)}</span></p>` : ""}
      </div>
      <div style="padding: 24px;">
        <h2 style="margin: 0 0 12px; color: #d4a853; font-size: 18px; border-bottom: 1px solid #2a252066; padding-bottom: 8px;">💳 Pago</h2>
        <table style="width: 100%; font-size: 14px;">
          <tr><td style="padding: 4px 0; color: #8a8070;">Método:</td><td style="padding: 4px 0; color: #f0ebe5; font-weight: 600;">${paymentLabel(params.paymentMethod)}</td></tr>
          <tr><td style="padding: 4px 0; color: #8a8070;">Monto:</td><td style="padding: 4px 0; color: #d4a853; font-weight: 700;">$${params.total.toLocaleString("es-AR")} ARS</td></tr>
          <tr><td style="padding: 4px 0; color: #8a8070;">ID de Pago:</td><td style="padding: 4px 0; color: #f0ebe5; font-family: monospace; font-size: 12px;">${params.paymentId || "N/A"}</td></tr>
          <tr><td style="padding: 4px 0; color: #8a8070;">ID de Solicitud:</td><td style="padding: 4px 0; color: #f0ebe5; font-family: monospace; font-size: 12px;">${params.orderId || "N/A"}</td></tr>
        </table>
      </div>
      <div style="padding: 16px 24px; text-align: center; border-top: 1px solid #2a252066; color: #5a5545; font-size: 12px;">
        <p>Eter Somos | Registros Akáshicos</p>
        <p>Esta solicitud fue procesada automáticamente.</p>
      </div>
    </div>
  `;
}

/* ── Resource Contribution Admin Email ─────────────────────────────────── */

function buildResourceAdminHtml(params: AdminNotificationParams): string {
  const extra = params.extraData || {};
  const resourceTitle = (extra.resourceTitle as string) || params.items[0]?.name || "Recurso";

  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #161310; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1a1510 0%, #0d0b08 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #2a252066;">
        <h1 style="margin: 0; color: #d4a853; font-size: 24px; letter-spacing: 0.1em;">📥 NUEVA CONTRIBUCIÓN A RECURSO</h1>
        <p style="margin: 8px 0 0; color: #8a8070; font-size: 14px;">Eter Somos | Contribución Voluntaria</p>
      </div>
      <div style="padding: 24px;">
        <h2 style="margin: 0 0 16px; color: #d4a853; font-size: 18px; border-bottom: 1px solid #2a252066; padding-bottom: 8px;">👤 Datos del Contribuyente</h2>
        <table style="width: 100%; font-size: 14px;">
          <tr><td style="padding: 4px 0; color: #8a8070;">Nombre:</td><td style="padding: 4px 0; color: #f0ebe5; font-weight: 600;">${escapeHtml(params.customerName)}</td></tr>
          <tr><td style="padding: 4px 0; color: #8a8070;">Email:</td><td style="padding: 4px 0; color: #f0ebe5;">${escapeHtml(params.customerEmail)}</td></tr>
        </table>
      </div>
      <div style="padding: 0 24px;">
        <h2 style="margin: 0 0 16px; color: #d4a853; font-size: 18px; border-bottom: 1px solid #2a252066; padding-bottom: 8px;">📥 Recurso</h2>
        <div style="background: #1a1510; border: 1px solid #2a252066; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
          <p style="margin: 0; color: #f0ebe5; font-size: 16px; font-weight: 600;">${escapeHtml(resourceTitle)}</p>
          ${params.total > 0 ? `<p style="margin: 8px 0 0; color: #d4a853; font-size: 20px; font-weight: 700;">$${params.total.toLocaleString("es-AR")} ARS</p>` : '<p style="margin: 8px 0 0; color: #8a8070; font-size: 14px;">Contribución voluntaria (sin monto fijo)</p>'}
        </div>
      </div>
      <div style="padding: 24px;">
        <h2 style="margin: 0 0 12px; color: #d4a853; font-size: 18px; border-bottom: 1px solid #2a252066; padding-bottom: 8px;">💳 Pago</h2>
        <table style="width: 100%; font-size: 14px;">
          <tr><td style="padding: 4px 0; color: #8a8070;">Método:</td><td style="padding: 4px 0; color: #f0ebe5; font-weight: 600;">${paymentLabel(params.paymentMethod)}</td></tr>
          <tr><td style="padding: 4px 0; color: #8a8070;">ID de Pago:</td><td style="padding: 4px 0; color: #f0ebe5; font-family: monospace; font-size: 12px;">${params.paymentId || "N/A"}</td></tr>
          <tr><td style="padding: 4px 0; color: #8a8070;">ID de Registro:</td><td style="padding: 4px 0; color: #f0ebe5; font-family: monospace; font-size: 12px;">${params.orderId || "N/A"}</td></tr>
        </table>
      </div>
      ${extra.webhookAlert ? `
      <div style="padding: 16px 24px; background: #3a1510; border-top: 1px solid #d4a85366;">
        <p style="margin: 0; color: #d4a853; font-size: 14px; font-weight: 600;">⚠️ Alerta: Pago recibido vía webhook sin orden asociada</p>
        <p style="margin: 4px 0 0; color: #f0ebe5; font-size: 13px;">El usuario pagó pero no regresó a la página de confirmación. Verificá manualmente.</p>
      </div>
      ` : ""}
      <div style="padding: 16px 24px; text-align: center; border-top: 1px solid #2a252066; color: #5a5545; font-size: 12px;">
        <p>Eter Somos | Registros Akáshicos</p>
        <p>Esta contribución fue procesada automáticamente.</p>
      </div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════════════════
   CUSTOMER CONFIRMATION EMAILS
   ═══════════════════════════════════════════════════════════════════════ */

interface CustomerConfirmationParams {
  customerName: string;
  customerEmail: string;
  type: OrderType;
  items: EmailItem[];
  total: number;
  paymentMethod: string;
}

export async function sendCustomerConfirmation(params: CustomerConfirmationParams): Promise<void> {
  const resend = createResendClient();

  const typeLabels: Record<OrderType, string> = {
    crystal: "pedido",
    course: "inscripción",
    reading: "solicitud de lectura",
    resource: "contribución",
  };

  const html = buildCustomerHtml(params);

  await resend.emails.send({
    from: SENDER,
    to: [params.customerEmail],
    subject: `Eter Somos — Confirmación de tu ${typeLabels[params.type]}`,
    html,
  });

  console.log(`[Email] Customer confirmation sent to ${params.customerEmail}`);
}

function buildCustomerHtml(params: CustomerConfirmationParams): string {
  const typeLabels: Record<OrderType, { title: string; icon: string; description: string; nextSteps: string[] }> = {
    crystal: {
      title: "Pedido de Cristales Confirmado",
      icon: "✨",
      description: "Tu pedido ha sido registrado exitosamente. Te contactaremos cuando tu pedido esté listo para envío.",
      nextSteps: [
        "Te enviaremos un email con los detalles del envío una vez que tu pedido esté listo.",
        "Si tenés alguna consulta, podés escribirnos por WhatsApp o email.",
      ],
    },
    course: {
      title: "Inscripción al Curso Confirmada",
      icon: "📚",
      description: "Tu inscripción ha sido registrada exitosamente. Bienvenido/a a tu camino de aprendizaje.",
      nextSteps: [
        "Te enviaremos los datos de acceso al curso por email.",
        "Te contactaremos con la información de las clases y material.",
        "Si tenés alguna consulta, no dudes en escribirnos.",
      ],
    },
    reading: {
      title: "Solicitud de Lectura Registrada",
      icon: "🔮",
      description: "Tu solicitud de lectura akáshica ha sido registrada exitosamente.",
      nextSteps: [
        "Recibirás tu lectura grabada por email en los próximos 5 días hábiles.",
        "Si necesitamos información adicional, te contactaremos.",
        "Recordá: las preguntas se responden de forma profunda y espiritual.",
      ],
    },
    resource: {
      title: "Contribución Recibida",
      icon: "📥",
      description: "Gracias por tu contribución voluntaria. Tu apoyo nos permite seguir creando y compartiendo contenido.",
      nextSteps: [
        "El recurso ya está disponible para descarga.",
        "Si tenés algún problema, no dudes en contactarnos.",
      ],
    },
  };

  const info = typeLabels[params.type];
  const itemsList = params.items
    .map((item) => `<li style="padding: 4px 0; color: #f0ebe5; font-size: 14px;">${escapeHtml(item.name)} — <span style="color: #d4a853;">$${item.price.toLocaleString("es-AR")} ARS</span></li>`)
    .join("");

  const nextStepsHtml = info.nextSteps
    .map((step) => `<li style="padding: 4px 0; color: #f0ebe5; font-size: 14px;">${step}</li>`)
    .join("");

  return `
    <div style="max-width: 560px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #161310; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1a1510 0%, #0d0b08 100%); padding: 40px 24px; text-align: center; border-bottom: 1px solid #2a252066;">
        <p style="margin: 0 0 8px; font-size: 36px;">${info.icon}</p>
        <h1 style="margin: 0; color: #d4a853; font-size: 22px; letter-spacing: 0.05em;">${info.title}</h1>
        <p style="margin: 8px 0 0; color: #8a8070; font-size: 13px;">Eter Somos | Registros Akáshicos</p>
      </div>

      <div style="padding: 24px;">
        <p style="margin: 0 0 16px; color: #f0ebe5; font-size: 15px; line-height: 1.6;">
          ¡Hola, <strong style="color: #d4a853;">${escapeHtml(params.customerName)}</strong>! ${info.description}
        </p>

        ${itemsList ? `
        <div style="background: #1a1510; border: 1px solid #2a252066; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <p style="margin: 0 0 8px; color: #d4a853; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Detalle</p>
          <ul style="margin: 0; padding-left: 16px;">${itemsList}</ul>
          <p style="margin: 12px 0 0; color: #d4a853; font-weight: 700; font-size: 16px; text-align: right;">Total: $${params.total.toLocaleString("es-AR")} ARS</p>
          <p style="margin: 4px 0 0; color: #8a8070; font-size: 12px; text-align: right;">Pago: ${paymentLabel(params.paymentMethod)}</p>
        </div>
        ` : ""}
      </div>

      <div style="padding: 0 24px 24px;">
        <h2 style="margin: 0 0 12px; color: #d4a853; font-size: 16px;">¿Qué sigue?</h2>
        <ul style="margin: 0; padding-left: 20px;">${nextStepsHtml}</ul>
      </div>

      <div style="padding: 24px; text-align: center; border-top: 1px solid #2a252066;">
        <p style="margin: 0; color: #d4a853; font-size: 14px; font-weight: 600;">Eter Somos</p>
        <p style="margin: 4px 0 0; color: #5a5545; font-size: 12px;">Registros Akáshicos y Cristales</p>
        <p style="margin: 8px 0 0; color: #5a5545; font-size: 11px;">etersomos@gmail.com</p>
      </div>
    </div>
  `;
}

/* ── HTML escape utility ──────────────────────────────────────────────── */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
