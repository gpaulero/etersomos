import nodemailer from "nodemailer";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "etersomos@gmail.com";
const SMTP_USER = process.env.SMTP_USER || "etersomos@gmail.com";

type OrderType = "crystal" | "course" | "mentoria" | "reading" | "resource";

interface EmailItem {
  name: string;
  quantity: number;
  price: number;
}

/* ═══════════════════════════════════════════════════════════════════════
   BRAND DESIGN TOKENS — matches etersomos.com.ar website aesthetic
   ═══════════════════════════════════════════════════════════════════════ */

const BRAND = {
  // Backgrounds
  bg:          '#0a0908',  // mystic-950 — page background
  card:        '#161310',  // card backgrounds
  cardInner:   '#1a1714',  // secondary / inner card bg (mystic-800)
  // Text
  text:        '#f0ebe5',  // foreground — primary text
  muted:       '#8a7e72',  // mystic-400 — muted text
  mutedDark:   '#5c5349',  // mystic-500 — footer muted text
  // Accent
  violet:      '#a78bfa',  // violet-400 — primary accent (labels, headings)
  violetDark:  '#8b5cf6',  // violet-500 — CTA buttons
  violetDeep:  '#7c3aed',  // violet-600 — button hover / gradient
  violetDeeper:'#5b21b6',  // violet-800 — gradient end
  warm:        '#ebe3d6',  // gold-200 — warm sand accent
  // Borders
  border:      '#2a2520',  // mystic-700
  borderLight: 'rgba(42,37,32,0.4)',
  borderAccent:'rgba(167,139,250,0.2)',  // violet border accent
  // Fonts
  fontSerif:   "Georgia, 'Playfair Display', 'Times New Roman', serif",
  fontSans:    "Helvetica, Arial, 'Josefin Sans', sans-serif",
  // Radius
  radius:      '10px',
  radiusPill:  '50px',
} as const;

/* ── Shared email shell wrapper ─────────────────────────────────────── */

function emailShell(content: string): string {
  return `
  <div style="background: ${BRAND.bg}; padding: 20px 0;">
    <div style="max-width: 560px; margin: 0 auto; font-family: ${BRAND.fontSans}; background: ${BRAND.card}; border-radius: ${BRAND.radius}; overflow: hidden; border: 1px solid ${BRAND.borderLight};">
      ${content}
    </div>
  </div>`;
}

function headerBlock(title: string, subtitle?: string): string {
  return `
    <div style="background: linear-gradient(135deg, ${BRAND.cardInner} 0%, ${BRAND.bg} 100%); padding: 40px 24px; text-align: center; border-bottom: 1px solid ${BRAND.borderLight};">
      <h1 style="margin: 0; font-family: ${BRAND.fontSerif}; color: ${BRAND.violet}; font-size: 22px; letter-spacing: 0.05em;">${title}</h1>
      ${subtitle ? `<p style="margin: 8px 0 0; color: ${BRAND.muted}; font-size: 13px;">${subtitle}</p>` : ''}
    </div>`;
}

function footerBlock(): string {
  return `
    <div style="padding: 24px; text-align: center; border-top: 1px solid ${BRAND.borderLight};">
      <p style="margin: 0; font-family: ${BRAND.fontSerif}; color: ${BRAND.violet}; font-size: 14px; font-weight: 600;">Eter Somos</p>
      <p style="margin: 4px 0 0; color: ${BRAND.mutedDark}; font-size: 12px;">Registros Akashicos y Cristales</p>
      <p style="margin: 8px 0 0; color: ${BRAND.mutedDark}; font-size: 11px;">etersomos@gmail.com</p>
    </div>`;
}

function ctaButton(url: string, label: string): string {
  return `
    <div style="padding: 0 24px 24px; text-align: center;">
      <a href="${url}" style="display: inline-block; background: ${BRAND.violetDark}; color: ${BRAND.bg}; padding: 14px 36px; border-radius: ${BRAND.radiusPill}; text-decoration: none; font-family: ${BRAND.fontSerif}; font-weight: 600; font-size: 16px; letter-spacing: 0.02em; box-shadow: 0 4px 14px rgba(139,92,246,0.3);">${label}</a>
    </div>`;
}

function sectionLabel(text: string): string {
  return `<p style="margin: 0 0 8px; color: ${BRAND.violet}; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3em; font-weight: 600;">${text}</p>`;
}

/* ── Shared: Create Nodemailer transporter ─────────────────────────────── */

function createTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("SMTP_USER and SMTP_APP_PASSWORD must be configured in environment variables");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
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
  const transporter = createTransporter();

  const subjects: Record<OrderType, string> = {
    crystal: `Nuevo pedido de cristales - ${params.customerName} - $${params.total.toLocaleString("es-AR")} ARS`,
    course: `Nueva inscripcion a curso - ${params.customerName} - $${params.total.toLocaleString("es-AR")} ARS`,
    mentoria: `Nueva inscripcion a mentoria - ${params.customerName} - $${params.total.toLocaleString("es-AR")} ARS`,
    reading: `Nueva solicitud de lectura - ${params.customerName} - $${params.total.toLocaleString("es-AR")} ARS`,
    resource: `Nueva contribucion a recurso - ${params.customerName}`,
  };

  const html = buildAdminHtml(params);

  await transporter.sendMail({
    from: `"Eter Somos" <${SMTP_USER}>`,
    to: ADMIN_EMAIL,
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
    case "mentoria":
      return buildMentoriaAdminHtml(params);
    case "reading":
      return buildReadingAdminHtml(params);
    case "resource":
      return buildResourceAdminHtml(params);
  }
}

/* ── Admin email shared helpers ──────────────────────────────────────── */

function adminHeader(title: string): string {
  return `
    <div style="background: linear-gradient(135deg, ${BRAND.cardInner} 0%, ${BRAND.bg} 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid ${BRAND.borderLight};">
      <h1 style="margin: 0; font-family: ${BRAND.fontSerif}; color: ${BRAND.violet}; font-size: 20px; letter-spacing: 0.1em;">${title}</h1>
      <p style="margin: 8px 0 0; color: ${BRAND.muted}; font-size: 13px;">Eter Somos | Registros Akashicos</p>
    </div>`;
}

function adminSectionHeading(text: string): string {
  return `<h2 style="margin: 0 0 16px; font-family: ${BRAND.fontSerif}; color: ${BRAND.violet}; font-size: 16px; border-bottom: 1px solid ${BRAND.borderLight}; padding-bottom: 8px;">${text}</h2>`;
}

function adminFooter(typeLabel: string): string {
  return `
    <div style="padding: 16px 24px; text-align: center; border-top: 1px solid ${BRAND.borderLight}; color: ${BRAND.mutedDark}; font-size: 12px;">
      <p>Eter Somos | Registros Akashicos y Cristales</p>
      <p>Este ${typeLabel} fue procesado automaticamente.</p>
    </div>`;
}

function adminDataRow(label: string, value: string): string {
  return `<tr><td style="padding: 4px 0; color: ${BRAND.muted};">${label}:</td><td style="padding: 4px 0; color: ${BRAND.text}; font-weight: 600;">${escapeHtml(value)}</td></tr>`;
}

/* ── Crystal Admin Email ──────────────────────────────────────────────── */

function buildCrystalAdminHtml(params: AdminNotificationParams): string {
  const extra = params.extraData || {};
  const itemsRows = params.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 16px; border-bottom: 1px solid ${BRAND.borderLight}; color: ${BRAND.text};">${escapeHtml(item.name)}</td>
        <td style="padding: 10px 16px; border-bottom: 1px solid ${BRAND.borderLight}; color: ${BRAND.text}; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 16px; border-bottom: 1px solid ${BRAND.borderLight}; color: ${BRAND.violet}; text-align: right;">$${item.price.toLocaleString("es-AR")} ARS</td>
      </tr>`
    )
    .join("");

  return emailShell(`
    ${adminHeader("NUEVO PEDIDO DE CRISTALES")}
    <div style="padding: 24px;">
      ${adminSectionHeading("Datos del Comprador")}
      <table style="width: 100%; font-size: 14px;">
        ${adminDataRow("Nombre", params.customerName)}
        ${adminDataRow("Email", params.customerEmail)}
        ${adminDataRow("Telefono", params.customerPhone || "")}
        ${extra.address ? adminDataRow("Direccion", String(extra.address)) : ""}
        ${extra.city ? adminDataRow("Ciudad", String(extra.city)) : ""}
        ${extra.province ? adminDataRow("Provincia", String(extra.province)) : ""}
        ${extra.postalCode ? adminDataRow("C.P.", String(extra.postalCode)) : ""}
      </table>
      ${extra.notes ? `<p style="margin: 12px 0 0; color: ${BRAND.muted}; font-size: 14px;">Notas: <span style="color: ${BRAND.text};">${escapeHtml(String(extra.notes))}</span></p>` : ""}
    </div>
    <div style="padding: 0 24px;">
      ${adminSectionHeading("Cristales")}
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="border-bottom: 2px solid ${BRAND.borderAccent};">
            <th style="padding: 8px 16px; text-align: left; color: ${BRAND.violet};">Producto</th>
            <th style="padding: 8px 16px; text-align: center; color: ${BRAND.violet};">Cantidad</th>
            <th style="padding: 8px 16px; text-align: right; color: ${BRAND.violet};">Precio</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 12px 16px; color: ${BRAND.text}; font-weight: 700; font-size: 16px; text-align: right;">Total:</td>
            <td style="padding: 12px 16px; color: ${BRAND.violet}; font-weight: 700; font-size: 18px; text-align: right;">$${params.total.toLocaleString("es-AR")} ARS</td>
          </tr>
        </tfoot>
      </table>
    </div>
    <div style="padding: 24px;">
      ${adminSectionHeading("Pago")}
      <table style="width: 100%; font-size: 14px;">
        ${adminDataRow("Metodo", paymentLabel(params.paymentMethod))}
        <tr><td style="padding: 4px 0; color: ${BRAND.muted};">ID de Pago:</td><td style="padding: 4px 0; color: ${BRAND.text}; font-family: monospace; font-size: 12px;">${params.paymentId || "N/A"}</td></tr>
        <tr><td style="padding: 4px 0; color: ${BRAND.muted};">ID de Pedido:</td><td style="padding: 4px 0; color: ${BRAND.text}; font-family: monospace; font-size: 12px;">${params.orderId || "N/A"}</td></tr>
      </table>
    </div>
    ${adminFooter("pedido")}
  `);
}

/* ── Course Admin Email ───────────────────────────────────────────────── */

function buildCourseAdminHtml(params: AdminNotificationParams): string {
  const extra = params.extraData || {};
  const formData = (extra.formData || extra.enrollmentData || {}) as Record<string, string>;

  const detailRows = [
    ["Email", params.customerEmail],
    ["Telefono", params.customerPhone || ""],
    ["Nacionalidad", formData.nacionalidad || formData.nationality || ""],
    ["Ciudad de Nacimiento", formData.ciudadNacimiento || formData.birthCity || ""],
    ["Ciudad de Residencia", formData.ciudadResidencia || formData.residenceCity || ""],
    ["Estado Civil", formData.estadoCivil || formData.maritalStatus || ""],
  ]
    .filter(([, val]) => val)
    .map(([label, val]) => adminDataRow(label, val))
    .join("");

  const courseName = params.items[0]?.name || "Curso";

  return emailShell(`
    ${adminHeader("NUEVA INSCRIPCION A CURSO")}
    <div style="padding: 24px;">
      ${adminSectionHeading("Datos del Inscripto")}
      <table style="width: 100%; font-size: 14px;">
        ${adminDataRow("Nombre", params.customerName)}
        ${detailRows}
      </table>
    </div>
    <div style="padding: 0 24px;">
      ${adminSectionHeading("Curso")}
      <div style="background: ${BRAND.cardInner}; border: 1px solid ${BRAND.borderLight}; border-radius: ${BRAND.radius}; padding: 16px; margin-bottom: 16px;">
        <p style="margin: 0; color: ${BRAND.text}; font-size: 16px; font-weight: 600;">${escapeHtml(courseName)}</p>
        <p style="margin: 8px 0 0; color: ${BRAND.violet}; font-size: 20px; font-weight: 700;">$${params.total.toLocaleString("es-AR")} ARS</p>
      </div>
    </div>
    <div style="padding: 24px;">
      ${adminSectionHeading("Pago")}
      <table style="width: 100%; font-size: 14px;">
        ${adminDataRow("Metodo", paymentLabel(params.paymentMethod))}
        <tr><td style="padding: 4px 0; color: ${BRAND.muted};">ID de Pago:</td><td style="padding: 4px 0; color: ${BRAND.text}; font-family: monospace; font-size: 12px;">${params.paymentId || "N/A"}</td></tr>
        <tr><td style="padding: 4px 0; color: ${BRAND.muted};">ID de Registro:</td><td style="padding: 4px 0; color: ${BRAND.text}; font-family: monospace; font-size: 12px;">${params.orderId || "N/A"}</td></tr>
      </table>
    </div>
    ${adminFooter("inscripcion")}
  `);
}

/* ── Mentoria Admin Email ──────────────────────────────────────────────── */

function buildMentoriaAdminHtml(params: AdminNotificationParams): string {
  const extra = params.extraData || {};
  const formData = (extra.formData || extra.enrollmentData || {}) as Record<string, string>;

  const detailRows = [
    ["Email", params.customerEmail],
    ["Telefono", params.customerPhone || ""],
    ["Nacionalidad", formData.nacionalidad || ""],
    ["Ciudad", formData.ciudad || ""],
    ["Nivel completado", formData.nivelCompletado || ""],
    ["Cantidad de encuentros", formData.cantEncuentros || ""],
    ["Precio por encuentro", formData.precioPorEncuentro ? `$${Number(formData.precioPorEncuentro).toLocaleString("es-AR")} ARS` : ""],
    ["Motivo", formData.motivo || ""],
    ["Disponibilidad", formData.disponibilidad || ""],
    ["Como se entero", formData.comoSeEnteraste || ""],
    ["Recomendado por", formData.recomendadoNombre || ""],
  ]
    .filter(([, val]) => val)
    .map(([label, val]) => adminDataRow(label, val))
    .join("");

  const mentoriaName = params.items[0]?.name || "Mentoria Akashica";

  return emailShell(`
    ${adminHeader("NUEVA INSCRIPCION A MENTORIA")}
    <div style="padding: 24px;">
      ${adminSectionHeading("Datos del Inscripto")}
      <table style="width: 100%; font-size: 14px;">
        ${adminDataRow("Nombre", params.customerName)}
        ${detailRows}
      </table>
    </div>
    <div style="padding: 0 24px;">
      ${adminSectionHeading("Mentoria")}
      <div style="background: ${BRAND.cardInner}; border: 1px solid ${BRAND.borderLight}; border-radius: ${BRAND.radius}; padding: 16px; margin-bottom: 16px;">
        <p style="margin: 0; color: ${BRAND.text}; font-size: 16px; font-weight: 600;">${escapeHtml(mentoriaName)}</p>
        <p style="margin: 8px 0 0; color: ${BRAND.violet}; font-size: 20px; font-weight: 700;">$${params.total.toLocaleString("es-AR")} ARS</p>
      </div>
    </div>
    <div style="padding: 24px;">
      ${adminSectionHeading("Pago")}
      <table style="width: 100%; font-size: 14px;">
        ${adminDataRow("Metodo", paymentLabel(params.paymentMethod))}
        <tr><td style="padding: 4px 0; color: ${BRAND.muted};">ID de Pago:</td><td style="padding: 4px 0; color: ${BRAND.text}; font-family: monospace; font-size: 12px;">${params.paymentId || "N/A"}</td></tr>
        <tr><td style="padding: 4px 0; color: ${BRAND.muted};">ID de Registro:</td><td style="padding: 4px 0; color: ${BRAND.text}; font-family: monospace; font-size: 12px;">${params.orderId || "N/A"}</td></tr>
      </table>
    </div>
    ${adminFooter("inscripcion")}
  `);
}

/* ── Reading Admin Email ──────────────────────────────────────────────── */

function buildReadingAdminHtml(params: AdminNotificationParams): string {
  const extra = params.extraData || {};
  const formData = (extra.formData || {}) as Record<string, string>;

  const detailRows = [
    ["Email", params.customerEmail],
    ["Telefono", params.customerPhone || ""],
    ["Fecha de Nacimiento", formData.fechaNacimiento || ""],
    ["Nacionalidad", formData.nacionalidad || ""],
    ["Ciudad de Nacimiento", formData.ciudadNacimiento || ""],
    ["Ciudad de Residencia", formData.ciudadResidencia || ""],
    ["Estado Civil", formData.estadoCivil || ""],
  ]
    .filter(([, val]) => val)
    .map(([label, val]) => adminDataRow(label, val))
    .join("");

  const healthRows = [
    ["Enfermedad Cronica", formData.enfermedadCronica || ""],
    ["Medicacion", formData.medicacion || ""],
    ["Terapia Psicologica", formData.terapiaPsicologica === "Si" ? `Si (${formData.terapiaPsicologicaDuracion || ""})` : (formData.terapiaPsicologica || "")],
    ["Terapia Psiquiatrica", formData.terapiaPsiquiatrica === "Si" ? `Si (${formData.terapiaPsiquiatricaDuracion || ""})` : (formData.terapiaPsiquiatrica || "")],
    ["Medicacion Psiquiatrica", formData.medicacionPsiquiatrica || ""],
  ]
    .filter(([, val]) => val)
    .map(([label, val]) => adminDataRow(label, val))
    .join("");

  return emailShell(`
    ${adminHeader("NUEVA SOLICITUD DE LECTURA")}
    <div style="padding: 24px;">
      ${adminSectionHeading("Datos del Consultante")}
      <table style="width: 100%; font-size: 14px;">
        ${adminDataRow("Nombre", params.customerName)}
        ${detailRows}
      </table>
    </div>
    ${healthRows ? `
    <div style="padding: 0 24px;">
      ${adminSectionHeading("Salud")}
      <table style="width: 100%; font-size: 13px;">${healthRows}</table>
    </div>` : ""}
    <div style="padding: 24px;">
      ${adminSectionHeading("Preguntas al Campo Akashico")}
      <div style="background: ${BRAND.cardInner}; border: 1px solid ${BRAND.borderLight}; border-radius: ${BRAND.radius}; padding: 16px; margin-bottom: 12px;">
        ${sectionLabel("Pregunta N 1")}
        <p style="margin: 0; color: ${BRAND.text}; font-size: 15px;">${escapeHtml(formData.pregunta1 || "")}</p>
      </div>
      <div style="background: ${BRAND.cardInner}; border: 1px solid ${BRAND.borderLight}; border-radius: ${BRAND.radius}; padding: 16px;">
        ${sectionLabel("Pregunta N 2")}
        <p style="margin: 0; color: ${BRAND.text}; font-size: 15px;">${escapeHtml(formData.pregunta2 || "")}</p>
      </div>
      ${formData.contextoAdicional ? `<p style="margin: 12px 0 0; color: ${BRAND.muted}; font-size: 14px;">Contexto adicional: <span style="color: ${BRAND.text};">${escapeHtml(formData.contextoAdicional)}</span></p>` : ""}
    </div>
    <div style="padding: 24px;">
      ${adminSectionHeading("Pago")}
      <table style="width: 100%; font-size: 14px;">
        ${adminDataRow("Metodo", paymentLabel(params.paymentMethod))}
        <tr><td style="padding: 4px 0; color: ${BRAND.muted};">Monto:</td><td style="padding: 4px 0; color: ${BRAND.violet}; font-weight: 700;">$${params.total.toLocaleString("es-AR")} ARS</td></tr>
        <tr><td style="padding: 4px 0; color: ${BRAND.muted};">ID de Pago:</td><td style="padding: 4px 0; color: ${BRAND.text}; font-family: monospace; font-size: 12px;">${params.paymentId || "N/A"}</td></tr>
        <tr><td style="padding: 4px 0; color: ${BRAND.muted};">ID de Solicitud:</td><td style="padding: 4px 0; color: ${BRAND.text}; font-family: monospace; font-size: 12px;">${params.orderId || "N/A"}</td></tr>
      </table>
    </div>
    ${adminFooter("solicitud")}
  `);
}

/* ── Resource Contribution Admin Email ─────────────────────────────────── */

function buildResourceAdminHtml(params: AdminNotificationParams): string {
  const extra = params.extraData || {};
  const resourceTitle = (extra.resourceTitle as string) || params.items[0]?.name || "Recurso";

  return emailShell(`
    ${adminHeader("NUEVA CONTRIBUCION A RECURSO")}
    <div style="padding: 24px;">
      ${adminSectionHeading("Datos del Contribuyente")}
      <table style="width: 100%; font-size: 14px;">
        ${adminDataRow("Nombre", params.customerName)}
        ${adminDataRow("Email", params.customerEmail)}
      </table>
    </div>
    <div style="padding: 0 24px;">
      ${adminSectionHeading("Recurso")}
      <div style="background: ${BRAND.cardInner}; border: 1px solid ${BRAND.borderLight}; border-radius: ${BRAND.radius}; padding: 16px; margin-bottom: 16px;">
        <p style="margin: 0; color: ${BRAND.text}; font-size: 16px; font-weight: 600;">${escapeHtml(resourceTitle)}</p>
        ${params.total > 0 ? `<p style="margin: 8px 0 0; color: ${BRAND.violet}; font-size: 20px; font-weight: 700;">$${params.total.toLocaleString("es-AR")} ARS</p>` : `<p style="margin: 8px 0 0; color: ${BRAND.muted}; font-size: 14px;">Contribucion voluntaria (sin monto fijo)</p>`}
      </div>
    </div>
    <div style="padding: 24px;">
      ${adminSectionHeading("Pago")}
      <table style="width: 100%; font-size: 14px;">
        ${adminDataRow("Metodo", paymentLabel(params.paymentMethod))}
        <tr><td style="padding: 4px 0; color: ${BRAND.muted};">ID de Pago:</td><td style="padding: 4px 0; color: ${BRAND.text}; font-family: monospace; font-size: 12px;">${params.paymentId || "N/A"}</td></tr>
        <tr><td style="padding: 4px 0; color: ${BRAND.muted};">ID de Registro:</td><td style="padding: 4px 0; color: ${BRAND.text}; font-family: monospace; font-size: 12px;">${params.orderId || "N/A"}</td></tr>
      </table>
    </div>
    ${extra.webhookAlert ? `
    <div style="padding: 16px 24px; background: #3a1510; border-top: 1px solid ${BRAND.borderAccent};">
      <p style="margin: 0; color: ${BRAND.violet}; font-size: 14px; font-weight: 600;">Alerta: Pago recibido via webhook sin orden asociada</p>
      <p style="margin: 4px 0 0; color: ${BRAND.text}; font-size: 13px;">El usuario pago pero no regreso a la pagina de confirmacion. Verifica manualmente.</p>
    </div>
    ` : ""}
    ${adminFooter("contribucion")}
  `);
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
  const transporter = createTransporter();

  const typeLabels: Record<OrderType, string> = {
    crystal: "pedido",
    course: "inscripcion",
    mentoria: "inscripcion a mentoria",
    reading: "solicitud de lectura",
    resource: "contribucion",
  };

  const html = buildCustomerHtml(params);

  await transporter.sendMail({
    from: `"Eter Somos" <${SMTP_USER}>`,
    to: [params.customerEmail],
    subject: `Eter Somos - Confirmacion de tu ${typeLabels[params.type]}`,
    html,
  });

  console.log(`[Email] Customer confirmation sent to ${params.customerEmail}`);
}

function buildCustomerHtml(params: CustomerConfirmationParams): string {
  const typeLabels: Record<OrderType, { title: string; description: string; nextSteps: string[] }> = {
    crystal: {
      title: "Pedido de Cristales Confirmado",
      description: "Tu pedido ha sido registrado exitosamente. Te contactaremos cuando tu pedido este listo para envio.",
      nextSteps: [
        "Te enviaremos un email con los detalles del envio una vez que tu pedido este listo.",
        "Si tenes alguna consulta, podes escribirnos por WhatsApp o email.",
      ],
    },
    course: {
      title: "Inscripcion al Curso Confirmada",
      description: "Tu inscripcion ha sido registrada exitosamente. Bienvenido/a a tu camino de aprendizaje. Vas a recibir un email aparte con tus datos de acceso al Aula Virtual.",
      nextSteps: [
        "Vas a recibir tus credenciales de acceso al Aula Virtual por email.",
        "En el Aula Virtual vas a encontrar el material del curso y las clases.",
        "Si tenes alguna consulta, no dudes en escribirnos.",
      ],
    },
    mentoria: {
      title: "Inscripcion a Mentoria Confirmada",
      description: "Tu inscripcion a las mentorias ha sido registrada exitosamente. Te acompanaremos en tu camino de profundizacion. Vas a recibir un email aparte con tus datos de acceso al Aula Virtual.",
      nextSteps: [
        "Vas a recibir tus credenciales de acceso al Aula Virtual por email.",
        "Te contactaremos para coordinar los horarios de los encuentros.",
        "Los encuentros son por videollamada 1:1 de 2 horas cada uno.",
        "Si tenes alguna consulta, no dudes en escribirnos.",
      ],
    },
    reading: {
      title: "Solicitud de Lectura Registrada",
      description: "Tu solicitud de lectura akashica ha sido registrada exitosamente. Vas a recibir un email aparte con tus datos de acceso al Aula Virtual, donde podras ver tu lectura cuando este lista.",
      nextSteps: [
        "Vas a recibir tus credenciales de acceso al Aula Virtual por email.",
        "Tu lectura estara disponible en el Aula Virtual en los proximos 5 dias habiles.",
        "Si necesitamos informacion adicional, te contactaremos.",
        "Recorda: las preguntas se responden de forma profunda y espiritual.",
      ],
    },
    resource: {
      title: "Contribucion Recibida",
      description: "Gracias por tu contribucion voluntaria. Tu apoyo nos permite seguir creando y compartiendo contenido.",
      nextSteps: [
        "El recurso ya esta disponible para descarga.",
        "Si tenes algun problema, no dudes en contactarnos.",
      ],
    },
  };

  const info = typeLabels[params.type];
  const itemsList = params.items
    .map((item) => `<li style="padding: 4px 0; color: ${BRAND.text}; font-size: 14px;">${escapeHtml(item.name)} - <span style="color: ${BRAND.violet};">$${item.price.toLocaleString("es-AR")} ARS</span></li>`)
    .join("");

  const nextStepsHtml = info.nextSteps
    .map((step) => `<li style="padding: 4px 0; color: ${BRAND.text}; font-size: 14px;">${step}</li>`)
    .join("");

  return emailShell(`
    ${headerBlock(info.title, "Eter Somos | Registros Akashicos")}
    <div style="padding: 24px;">
      <p style="margin: 0 0 16px; color: ${BRAND.text}; font-size: 15px; line-height: 1.6;">
        Hola, <strong style="color: ${BRAND.violet};">${escapeHtml(params.customerName)}</strong>! ${info.description}
      </p>
      ${itemsList ? `
      <div style="background: ${BRAND.cardInner}; border: 1px solid ${BRAND.borderLight}; border-radius: ${BRAND.radius}; padding: 16px; margin-bottom: 20px;">
        ${sectionLabel("Detalle")}
        <ul style="margin: 0; padding-left: 16px;">${itemsList}</ul>
        <p style="margin: 12px 0 0; color: ${BRAND.violet}; font-weight: 700; font-size: 16px; text-align: right;">Total: $${params.total.toLocaleString("es-AR")} ARS</p>
        <p style="margin: 4px 0 0; color: ${BRAND.muted}; font-size: 12px; text-align: right;">Pago: ${paymentLabel(params.paymentMethod)}</p>
      </div>
      ` : ""}
    </div>
    <div style="padding: 0 24px 24px;">
      <h2 style="margin: 0 0 12px; font-family: ${BRAND.fontSerif}; color: ${BRAND.violet}; font-size: 16px;">Que sigue?</h2>
      <ul style="margin: 0; padding-left: 20px;">${nextStepsHtml}</ul>
    </div>
    ${footerBlock()}
  `);
}

/* ═══════════════════════════════════════════════════════════════════════
   AULA VIRTUAL WELCOME EMAIL
   Sent automatically when a NEW student is created via auto-enrollment.
   ═══════════════════════════════════════════════════════════════════════ */

export async function sendAulaWelcomeEmail(params: {
  customerName: string
  customerEmail: string
  password: string
  enrollmentType: 'curso' | 'lectura' | 'mentoria'
  enrollmentTitle: string
}): Promise<void> {
  const transporter = createTransporter();

  const typeLabels = {
    curso: 'curso',
    lectura: 'lectura',
    mentoria: 'mentoria',
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://etersomos-iota.vercel.app';
  const aulaUrl = `${baseUrl}/aula`;

  const html = emailShell(`
    ${headerBlock("TU AULA VIRTUAL ESTA LISTA", "Eter Somos | Registros Akashicos")}
    <div style="padding: 24px;">
      <p style="margin: 0 0 16px; color: ${BRAND.text}; font-size: 15px; line-height: 1.6;">
        Hola, <strong style="color: ${BRAND.violet};">${escapeHtml(params.customerName)}</strong>! Tu inscripcion a la ${typeLabels[params.enrollmentType]} ha sido confirmada y te hemos creado una cuenta en el Aula Virtual para que accedas a tu contenido.
      </p>
      <div style="background: ${BRAND.cardInner}; border: 1px solid ${BRAND.borderLight}; border-radius: ${BRAND.radius}; padding: 16px; margin-bottom: 20px;">
        ${sectionLabel("Tu inscripcion")}
        <p style="margin: 0; color: ${BRAND.text}; font-size: 16px; font-weight: 600;">${escapeHtml(params.enrollmentTitle)}</p>
      </div>
    </div>
    <div style="padding: 0 24px 24px;">
      <h2 style="margin: 0 0 16px; font-family: ${BRAND.fontSerif}; color: ${BRAND.violet}; font-size: 18px; border-bottom: 1px solid ${BRAND.borderLight}; padding-bottom: 8px;">Tus datos de acceso</h2>
      <div style="background: ${BRAND.cardInner}; border: 1px solid ${BRAND.borderAccent}; border-radius: ${BRAND.radius}; padding: 16px;">
        <table style="width: 100%; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: ${BRAND.muted}; width: 30%;">Email:</td>
            <td style="padding: 6px 0; color: ${BRAND.text}; font-weight: 600;">${escapeHtml(params.customerEmail)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: ${BRAND.muted};">Contrasena:</td>
            <td style="padding: 6px 0; color: ${BRAND.violet}; font-family: monospace; font-size: 16px; font-weight: 700; letter-spacing: 0.1em;">${escapeHtml(params.password)}</td>
          </tr>
        </table>
        <p style="margin: 12px 0 0; color: ${BRAND.muted}; font-size: 12px;">Podes cambiar tu contrasena desde tu perfil en el Aula Virtual.</p>
      </div>
    </div>
    ${ctaButton(aulaUrl, "Ingresar al Aula Virtual")}
    <div style="padding: 0 24px 24px;">
      <h2 style="margin: 0 0 12px; font-family: ${BRAND.fontSerif}; color: ${BRAND.violet}; font-size: 16px;">Que encontras en el Aula?</h2>
      <ul style="margin: 0; padding-left: 20px;">
        <li style="padding: 4px 0; color: ${BRAND.text}; font-size: 14px;">Acceso a tus cursos, lecturas y mentorias</li>
        <li style="padding: 4px 0; color: ${BRAND.text}; font-size: 14px;">Material de estudio y contenido exclusivo</li>
        <li style="padding: 4px 0; color: ${BRAND.text}; font-size: 14px;">Seguimiento de tu progreso</li>
        <li style="padding: 4px 0; color: ${BRAND.text}; font-size: 14px;">Descarga de audios y documentos</li>
      </ul>
    </div>
    ${footerBlock()}
  `);

  await transporter.sendMail({
    from: `"Eter Somos" <${SMTP_USER}>`,
    to: [params.customerEmail],
    subject: `Eter Somos - Tu acceso al Aula Virtual (${typeLabels[params.enrollmentType]}: ${params.enrollmentTitle})`,
    html,
  });

  console.log(`[Email] Aula welcome email sent to ${params.customerEmail}`);
}

/* ═══════════════════════════════════════════════════════════════════════
   LECTURA READY EMAIL
   Sent when the admin uploads the lectura audio to the Aula Virtual.
   Notifies the student that their reading is ready to listen to.
   ═══════════════════════════════════════════════════════════════════════ */

export async function sendLecturaReadyEmail(params: {
  customerName: string
  customerEmail: string
  enrollmentTitle: string
}): Promise<void> {
  const transporter = createTransporter();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://etersomos-iota.vercel.app';
  const aulaUrl = `${baseUrl}/aula`;

  const html = emailShell(`
    ${headerBlock("TU LECTURA ESTA LISTA", "Eter Somos | Registros Akashicos")}
    <div style="padding: 24px;">
      <p style="margin: 0 0 16px; color: ${BRAND.text}; font-size: 15px; line-height: 1.6;">
        Hola, <strong style="color: ${BRAND.violet};">${escapeHtml(params.customerName)}</strong>! Tu lectura ya esta disponible en el Aula Virtual. Podes escucharla cuando quieras desde tu cuenta.
      </p>
      <div style="background: ${BRAND.cardInner}; border: 1px solid ${BRAND.borderLight}; border-radius: ${BRAND.radius}; padding: 16px; margin-bottom: 20px;">
        ${sectionLabel("Tu lectura")}
        <p style="margin: 0; color: ${BRAND.text}; font-size: 16px; font-weight: 600;">${escapeHtml(params.enrollmentTitle)}</p>
      </div>
      <div style="background: ${BRAND.cardInner}; border: 1px solid ${BRAND.borderAccent}; border-radius: ${BRAND.radius}; padding: 16px;">
        <p style="margin: 0; color: ${BRAND.muted}; font-size: 13px; line-height: 1.5;">
          Ingresa al Aula Virtual con tu email y contrasena para acceder al audio de tu lectura. Si no recordas tu contrasena, podes restablecerla desde la pagina de login.
        </p>
      </div>
    </div>
    ${ctaButton(aulaUrl, "Escuchar mi lectura")}
    ${footerBlock()}
  `);

  await transporter.sendMail({
    from: `"Eter Somos" <${SMTP_USER}>`,
    to: [params.customerEmail],
    subject: `Eter Somos - Tu lectura esta lista! (${params.enrollmentTitle})`,
    html,
  });

  console.log(`[Email] Lectura ready email sent to ${params.customerEmail}`);
}

/* ═══════════════════════════════════════════════════════════════════════
   AULA VIRTUAL EXISTING STUDENT EMAIL
   Sent when an existing student makes a new purchase (reading/course/mentoria).
   Reminds them to log in with their existing credentials.
   ═══════════════════════════════════════════════════════════════════════ */

export async function sendAulaExistingStudentEmail(params: {
  customerName: string
  customerEmail: string
  enrollmentType: 'curso' | 'lectura' | 'mentoria'
  enrollmentTitle: string
}): Promise<void> {
  const transporter = createTransporter();

  const typeLabels = {
    curso: 'curso',
    lectura: 'lectura',
    mentoria: 'mentoria',
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://etersomos-iota.vercel.app';
  const aulaUrl = `${baseUrl}/aula`;

  const html = emailShell(`
    ${headerBlock("NUEVA INSCRIPCION EN TU AULA", "Eter Somos | Registros Akashicos")}
    <div style="padding: 24px;">
      <p style="margin: 0 0 16px; color: ${BRAND.text}; font-size: 15px; line-height: 1.6;">
        Hola, <strong style="color: ${BRAND.violet};">${escapeHtml(params.customerName)}</strong>! Se registro una nueva inscripcion a la ${typeLabels[params.enrollmentType]} en tu cuenta del Aula Virtual. Podes acceder con tus credenciales habituales.
      </p>
      <div style="background: ${BRAND.cardInner}; border: 1px solid ${BRAND.borderLight}; border-radius: ${BRAND.radius}; padding: 16px; margin-bottom: 20px;">
        ${sectionLabel("Nueva inscripcion")}
        <p style="margin: 0; color: ${BRAND.text}; font-size: 16px; font-weight: 600;">${escapeHtml(params.enrollmentTitle)}</p>
      </div>
      <div style="background: ${BRAND.cardInner}; border: 1px solid ${BRAND.borderAccent}; border-radius: ${BRAND.radius}; padding: 16px;">
        <p style="margin: 0; color: ${BRAND.muted}; font-size: 13px; line-height: 1.5;">
          Ingresa al Aula Virtual con tu email y contrasena habitual. Si no recordas tu contrasena, podes restablecerla desde la pagina de login.
        </p>
      </div>
    </div>
    ${ctaButton(aulaUrl, "Ingresar al Aula Virtual")}
    ${footerBlock()}
  `);

  await transporter.sendMail({
    from: `"Eter Somos" <${SMTP_USER}>`,
    to: [params.customerEmail],
    subject: `Eter Somos - Nueva inscripcion en tu Aula Virtual (${typeLabels[params.enrollmentType]}: ${params.enrollmentTitle})`,
    html,
  });

  console.log(`[Email] Aula existing student email sent to ${params.customerEmail}`);
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
