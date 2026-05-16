/**
 * Default CMS content values — these mirror the hardcoded values from the site.
 * Used by the seed function to populate SiteContent on first load.
 * The seed ONLY inserts if the key doesn't exist yet.
 */

export interface SiteContentItem {
  key: string
  value: string
  section: string
  label: string
  type: 'text' | 'number' | 'url' | 'textarea' | 'json' | 'boolean'
}

/* ── Products (from page.tsx and tienda/page.tsx) ── */
const defaultProducts = [
  { id: 1, name: "Amatista", price: 15000, image: "/images/amethyst.png", description: "Protección y paz interior. Ideal para meditación y conexión espiritual.", category: "Amatista" },
  { id: 2, name: "Cuarzo Rosa", price: 12000, image: "/images/rose-quartz.png", description: "Amor propio y sanación emocional. Atrae energías de amor y compasión.", category: "Cuarzo Rosa" },
  { id: 3, name: "Cuarzo Claro", price: 10000, image: "/images/clear-quartz.png", description: "Amplificador energético universal. Limpieza y armonización de chakras.", category: "Cuarzo Claro" },
  { id: 4, name: "Citrino", price: 13000, image: "/images/citrine.png", description: "Prosperidad y abundancia. Estimula la creatividad y la autoconfianza.", category: "Citrino" },
  { id: 5, name: "Turmalina Negra", price: 11000, image: "/images/tourmaline.png", description: "Protección contra energías negativas. Radicación y conexión a tierra.", category: "Turmalina" },
  { id: 6, name: "Selinita", price: 14000, image: "/images/selenite.png", description: "Paz y claridad mental. Conexión con guías espirituales y ángeles.", category: "Selinita" },
]

const defaultCategories = ["Todos", "Amatista", "Cuarzo Rosa", "Cuarzo Claro", "Citrino", "Turmalina", "Selinita"]

/* ── Testimonials ── */
const defaultTestimonials = [
  { name: "Valentina R.", location: "Buenos Aires, Argentina", quote: "La lectura cambió mi perspectiva de la vida por completo. Sentí una paz interior que no tenía desde hacía años. Ahora entiendo mi camino con mucha más claridad.", rating: 5 },
  { name: "Martín G.", location: "Córdoba, Argentina", quote: "Increíble experiencia. La lectura me ayudó a entender muchas dinámicas de mi vida y a sanar heridas que arrastraba desde hacía tiempo. La grabación me sirvió para volver a escucharla varias veces.", rating: 5 },
  { name: "Luciana P.", location: "Rosario, Argentina", quote: "El curso de Nivel Inicial superó todas mis expectativas. Ahora puedo conectarme con mis propios registros y la transformación en mi día a día es asombrosa.", rating: 5 },
]

/* ── FAQ ── */
const defaultFaqItems = [
  { question: "¿Qué son los Registros Akáshicos?", answer: "Los Registros Akáshicos son una dimensión energética que almacena cada pensamiento, emoción y acción de todas las almas. Es como una biblioteca universal del conocimiento donde podés acceder a la sabiduría de tu alma." },
  { question: "¿Cómo funciona una lectura?", answer: "A través de una conexión sagrada, accedo a los registros de tu alma para responder tus preguntas. Recibís la lectura grabada en audio, personalizada y confidencial." },
  { question: "¿Es seguro o confidencial?", answer: "Absolutamente. Todo lo que se comparte en una lectura es estrictamente confidencial. No se comparte información con terceros bajo ninguna circunstancia." },
  { question: "¿Necesito experiencia previa para los cursos?", answer: "No. El Nivel 1 Teórico es ideal para principiantes. El Nivel con Práctica y el Nivel 2 van paso a paso con acompañamiento personalizado." },
  { question: "¿Las membresías tienen compromiso?", answer: "No. Podés cancelar tu membresía en cualquier momento desde MercadoPago o PayPal. Sin preguntas, sin penalidades." },
  { question: "¿Hacen envíos de cristales a todo el país?", answer: "Sí, enviamos cristales a toda Argentina. Cada pieza es seleccionada y empaquetada con cuidado y protección energética." },
]

/* ── Membership Tiers ── */
const defaultMembershipTiers = [
  {
    id: "raiz-de-luz",
    emoji: null,
    emojiImage: "/images/membresia-emoji-1.png",
    name: "Raíz de Luz",
    price: "$5.000 ARS · US$5",
    frequency: "2 envíos mensuales",
    description: "En esta suscripción recibirás contenido para reconectar con tu esencia, cultivar presencia y claridad interior. Cada envío alterna entre meditaciones guiadas y mensajes canalizados.",
    benefits: [
      "Ó una meditación guiada grabada (audio o video)",
      "Ó un mensaje canalizado o reflexión escrita",
      "Prácticas breves para integrar lo recibido",
      "Recomendaciones energéticas o lecturas inspiradoras",
    ],
    purpose: "Acompañarte a enraizar tu luz y recordar la conexión con tu alma desde la vida cotidiana.",
    featured: false,
    badge: "",
    mercadoPagoUrl: "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=244c453d0452470484210074b35bc22d",
    paypalUrl: "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-3GR129136U5304800NEETONQ",
  },
  {
    id: "corazon-solar",
    emoji: null,
    emojiImage: "/images/membresia-emoji-2.png",
    name: "Corazón Solar",
    price: "$10.000 ARS · US$8",
    frequency: "3 envíos mensuales",
    description: "Incluye todo lo que recibís en Raíz de Luz, con textos adaptados a la energía del corazón y una frecuencia más expansiva y crística.",
    benefits: [
      "Todo el contenido de Raíz de Luz",
      "Activación o meditación profunda exclusiva",
      "Mensaje canalizado extendido con guía de integración",
      "Ejercicios de apertura del corazón y expansión energética",
    ],
    purpose: "Habitar el corazón como centro de expansión, alegría, amor y coherencia.",
    featured: true,
    badge: "Más Popular",
    mercadoPagoUrl: "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=13240468afc8434ca121abe2b0644ede",
    paypalUrl: "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-00D22712PA695974NNEETRWY",
  },
  {
    id: "puente-estelar",
    emoji: null,
    emojiImage: "/images/membresia-emoji-3.png",
    name: "Puente Estelar",
    price: "$15.000 ARS · US$12",
    frequency: "4 envíos mensuales (uno por semana)",
    description: "Incluye todo lo de Corazón Solar, elevando la frecuencia hacia la conexión con guías y sabidurías estelares.",
    benefits: [
      "Todo el contenido de Corazón Solar",
      "Canalización de alta frecuencia exclusiva",
      "Mensajes de guías estelares con claves energéticas",
      "Reflexión o propuesta de servicio consciente",
    ],
    purpose: "Ser un canal estable y consciente en Luz, entre el cielo y la tierra.",
    featured: false,
    badge: "",
    mercadoPagoUrl: "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=3d3e910f53814b218026250694af5272",
    paypalUrl: "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-1TT73903VH987053VNEETSMA",
  },
]

/* ── All default CMS items ── */
export const defaultSiteContent: SiteContentItem[] = [
  // ── Site (general) ──
  { key: "site.hero_title", value: "Eter Somos", section: "site", label: "Título principal del Hero", type: "text" },
  { key: "site.hero_subtitle", value: "Registros Akáshicos · Lecturas · Cursos", section: "site", label: "Subtítulo del Hero", type: "text" },
  { key: "site.hero_tagline", value: "Tu espacio de conexión con la sabiduría del alma", section: "site", label: "Tagline del Hero", type: "text" },
  { key: "site.contact_email", value: "etersomos@gmail.com", section: "site", label: "Email de contacto", type: "text" },
  { key: "site.contact_whatsapp", value: "+54 9 3518 62-9325", section: "site", label: "WhatsApp (display)", type: "text" },
  { key: "site.contact_whatsapp_number", value: "5493518629325", section: "site", label: "WhatsApp número (para link)", type: "text" },
  { key: "site.instagram_url", value: "https://instagram.com/etersomos", section: "site", label: "URL de Instagram", type: "url" },
  { key: "site.hero_btn_services", value: "Ver servicios", section: "site", label: "Botón Hero - Ver servicios", type: "text" },
  { key: "site.hero_btn_reading", value: "Pedí tu Lectura", section: "site", label: "Botón Hero - Pedí tu Lectura", type: "text" },

  // ── Nav ──
  { key: "nav.link_inicio", value: "Inicio", section: "nav", label: "Link Inicio", type: "text" },
  { key: "nav.link_sesiones", value: "Sesiones", section: "nav", label: "Link Sesiones", type: "text" },
  { key: "nav.link_cursos", value: "Cursos", section: "nav", label: "Link Cursos", type: "text" },
  { key: "nav.link_membresia", value: "Membresía", section: "nav", label: "Link Membresía", type: "text" },
  { key: "nav.link_recursos", value: "Recursos", section: "nav", label: "Link Recursos", type: "text" },
  { key: "nav.link_tienda", value: "Tienda", section: "nav", label: "Link Tienda", type: "text" },
  { key: "nav.link_contacto", value: "Contacto", section: "nav", label: "Link Contacto", type: "text" },

  // ── Crystals (tienda) ──
  { key: "crystals.products", value: JSON.stringify(defaultProducts, null, 2), section: "crystals", label: "Productos de cristales (JSON)", type: "json" },
  { key: "crystals.categories", value: JSON.stringify(defaultCategories, null, 2), section: "crystals", label: "Categorías de cristales (JSON)", type: "json" },

  // ── Readings (lecturas) ──
  { key: "readings.price_ars", value: "18000", section: "readings", label: "Precio Lectura (ARS)", type: "number" },
  { key: "readings.price_usd", value: "20", section: "readings", label: "Precio Lectura (USD)", type: "number" },
  { key: "readings.description", value: "Accedé a los Registros de tu alma. Recibí una lectura personalizada grabada especialmente para vos.", section: "readings", label: "Descripción de Lecturas", type: "textarea" },
  { key: "readings.deadline_badge", value: "5 días hábiles", section: "readings", label: "Badge de plazo de entrega", type: "text" },

  // ── Courses ──
  { key: "courses.n1teorico_price_ars", value: "0", section: "courses", label: "N1 Teórico - Precio ARS", type: "number" },
  { key: "courses.n1teorico_price_usd", value: "0", section: "courses", label: "N1 Teórico - Precio USD", type: "number" },
  { key: "courses.n1teorico_badge", value: "", section: "courses", label: "N1 Teórico - Badge", type: "text" },
  { key: "courses.n1practica_price_ars", value: "35000", section: "courses", label: "N1 Práctica - Precio ARS", type: "number" },
  { key: "courses.n1practica_price_usd", value: "30", section: "courses", label: "N1 Práctica - Precio USD", type: "number" },
  { key: "courses.n1practica_badge", value: "Más Elegido", section: "courses", label: "N1 Práctica - Badge", type: "text" },
  { key: "courses.n2_price_ars", value: "45000", section: "courses", label: "N2 Completo - Precio ARS", type: "number" },
  { key: "courses.n2_price_usd", value: "45", section: "courses", label: "N2 Completo - Precio USD", type: "number" },
  { key: "courses.n2_badge", value: "", section: "courses", label: "N2 Completo - Badge", type: "text" },
  { key: "courses.ambos_price_ars", value: "70000", section: "courses", label: "Ambos Cursos - Precio ARS", type: "number" },
  { key: "courses.ambos_price_usd", value: "55", section: "courses", label: "Ambos Cursos - Precio USD", type: "number" },
  { key: "courses.ambos_badge", value: "Mejor Precio", section: "courses", label: "Ambos Cursos - Badge", type: "text" },

  // ── Memberships ──
  { key: "memberships.tiers", value: JSON.stringify(defaultMembershipTiers, null, 2), section: "memberships", label: "Planes de membresía (JSON)", type: "json" },

  // ── Testimonials ──
  { key: "testimonials.items", value: JSON.stringify(defaultTestimonials, null, 2), section: "testimonials", label: "Testimonios (JSON)", type: "json" },

  // ── Espacios ──
  { key: "espacios.subtitle", value: "Nuestros Espacios", section: "espacios", label: "Subtítulo de Espacios", type: "text" },
  { key: "espacios.heading", value: "¿Qué buscás?", section: "espacios", label: "Título de Espacios", type: "text" },
  { key: "espacios.card1_title", value: "Lecturas Akáshicas", section: "espacios", label: "Card 1 - Título", type: "text" },
  { key: "espacios.card1_desc", value: "Accedé a los Registros de tu alma. Recibí una lectura personalizada grabada especialmente para vos.", section: "espacios", label: "Card 1 - Descripción", type: "textarea" },
  { key: "espacios.card1_price", value: "Desde US$20", section: "espacios", label: "Card 1 - Precio", type: "text" },
  { key: "espacios.card2_title", value: "Cursos de Formación", section: "espacios", label: "Card 2 - Título", type: "text" },
  { key: "espacios.card2_desc", value: "Aprendé a conectarte con tus propios Registros Akáshicos. Niveles 1 y 2 con práctica individual.", section: "espacios", label: "Card 2 - Descripción", type: "textarea" },
  { key: "espacios.card2_price", value: "Desde contribución voluntaria", section: "espacios", label: "Card 2 - Precio", type: "text" },
  { key: "espacios.card3_title", value: "Membresías", section: "espacios", label: "Card 3 - Título", type: "text" },
  { key: "espacios.card3_desc", value: "Contenido exclusivo mensual para tu expansión espiritual. Meditaciones, canalizaciones y activaciones.", section: "espacios", label: "Card 3 - Descripción", type: "textarea" },
  { key: "espacios.card3_price", value: "Desde $5.000 ARS/mes", section: "espacios", label: "Card 3 - Precio", type: "text" },
  { key: "espacios.card4_title", value: "Cristales", section: "espacios", label: "Card 4 - Título", type: "text" },
  { key: "espacios.card4_desc", value: "Cristales seleccionados con amor e intención para acompañar tu camino espiritual.", section: "espacios", label: "Card 4 - Descripción", type: "textarea" },
  { key: "espacios.card4_price", value: "Solo envío en Argentina", section: "espacios", label: "Card 4 - Precio", type: "text" },

  // ── Home Sections ──
  { key: "home.sobre_title", value: "Sobre Fer", section: "home_sections", label: "Título sección Sobre Fer", type: "text" },
  { key: "home.sobre_bio_1", value: "Soy Fer, guía espiritual y lectora de Registros Akáshicos. Acompaño a personas en su proceso de autoconocimiento y sanación a través de esta herramienta ancestral.", section: "home_sections", label: "Bio de Fer - Párrafo 1", type: "textarea" },
  { key: "home.sobre_bio_2", value: "Desde hace años, me dedico a facilitar espacios de conexión con la esencia del alma. Cada lectura y cada curso que ofrezco nace desde un lugar de servicio y profundo respeto por el camino de cada ser.", section: "home_sections", label: "Bio de Fer - Párrafo 2", type: "textarea" },
  { key: "home.sobre_stat_lecturas", value: "500+", section: "home_sections", label: "Stat: Lecturas realizadas", type: "text" },
  { key: "home.sobre_stat_alumnos", value: "200+", section: "home_sections", label: "Stat: Alumnos formados", type: "text" },
  { key: "home.sobre_stat_anios", value: "5", section: "home_sections", label: "Stat: Años de experiencia", type: "text" },
  { key: "home.sobre_subtitle", value: "Conoce a tu guía", section: "home_sections", label: "Subtítulo sección Sobre Fer", type: "text" },
  { key: "home.sobre_stat_lecturas_label", value: "lecturas realizadas", section: "home_sections", label: "Stat label: lecturas realizadas", type: "text" },
  { key: "home.sobre_stat_alumnos_label", value: "alumnos formados", section: "home_sections", label: "Stat label: alumnos formados", type: "text" },
  { key: "home.sobre_stat_anios_label", value: "años de experiencia", section: "home_sections", label: "Stat label: años de experiencia", type: "text" },
  { key: "home.faq_items", value: JSON.stringify(defaultFaqItems, null, 2), section: "home_sections", label: "Preguntas frecuentes (JSON)", type: "json" },

  // ── Membresías Section ──
  { key: "membresias_section.subtitle", value: "Contenido exclusivo", section: "membresias_section", label: "Subtítulo sección Membresías", type: "text" },
  { key: "membresias_section.title", value: "Membresía Eter Somos", section: "membresias_section", label: "Título sección Membresías", type: "text" },
  { key: "membresias_section.description", value: "Elegí la frecuencia que más resuene con tu momento interior", section: "membresias_section", label: "Descripción sección Membresías", type: "textarea" },
  { key: "membresias_section.per_month", value: "por mes", section: "membresias_section", label: 'Texto "por mes"', type: "text" },
  { key: "membresias_section.btn_prefix", value: "Suscribirme a", section: "membresias_section", label: "Prefijo botón suscripción", type: "text" },
  { key: "membresias_section.cancel_note", value: "Cancelá en cualquier momento, sin compromiso.", section: "membresias_section", label: "Nota de cancelación", type: "text" },

  // ── Testimonials Section ──
  { key: "testimonials_section.title", value: "Testimonios", section: "testimonials_section", label: "Título sección Testimonios", type: "text" },
  { key: "testimonials_section.subtitle", value: "Lo que dicen nuestros consultantes", section: "testimonials_section", label: "Subtítulo sección Testimonios", type: "text" },

  // ── FAQ Section ──
  { key: "faq_section.title", value: "Resolvé tus dudas", section: "faq_section", label: "Título sección FAQ", type: "text" },
  { key: "faq_section.subtitle", value: "Preguntas Frecuentes", section: "faq_section", label: "Subtítulo sección FAQ", type: "text" },

  // ── Footer ──
  { key: "footer.description", value: "Lecturas, cursos y cristales para tu camino espiritual. Conexión con la sabiduría del alma.", section: "footer", label: "Descripción del Footer", type: "textarea" },
  { key: "footer.nav_title", value: "Navegación", section: "footer", label: "Título Navegación Footer", type: "text" },
  { key: "footer.contact_title", value: "Contacto", section: "footer", label: "Título Contacto Footer", type: "text" },
  { key: "footer.legal_title", value: "Legal", section: "footer", label: "Título Legal Footer", type: "text" },
  { key: "footer.legal_text", value: "Las lecturas akáshicas son una herramienta de autoconocimiento y crecimiento espiritual. No reemplazan ningún tratamiento médico o psicológico profesional.", section: "footer", label: "Texto Legal Footer", type: "textarea" },
  { key: "footer.copyright", value: "© 2026 Eter Somos. Todos los derechos reservados.", section: "footer", label: "Copyright Footer", type: "text" },

  // ── Booking Dialog ──
  { key: "booking.title", value: "Pedí tu Lectura", section: "booking", label: "Título diálogo de reserva", type: "text" },
  { key: "booking.description", value: "Completá el formulario y te contactaremos para coordinar tu lectura akáshica.", section: "booking", label: "Descripción diálogo de reserva", type: "text" },
  { key: "booking.btn_submit", value: "Enviar Solicitud", section: "booking", label: "Botón enviar solicitud", type: "text" },
  { key: "booking.btn_cancel", value: "Cancelar", section: "booking", label: "Botón cancelar", type: "text" },
  { key: "booking.success_title", value: "¡Solicitud enviada!", section: "booking", label: "Título éxito", type: "text" },
  { key: "booking.success_message", value: "Nos contactaremos pronto para coordinar tu lectura.", section: "booking", label: "Mensaje éxito", type: "text" },
  { key: "booking.field_name", value: "Nombre completo", section: "booking", label: "Label campo nombre", type: "text" },
  { key: "booking.field_email", value: "Email", section: "booking", label: "Label campo email", type: "text" },
  { key: "booking.field_phone", value: "Teléfono (WhatsApp)", section: "booking", label: "Label campo teléfono", type: "text" },
  { key: "booking.field_message", value: "Mensaje / Preguntas para la lectura", section: "booking", label: "Label campo mensaje", type: "text" },
  { key: "booking.placeholder_name", value: "Ej: María González", section: "booking", label: "Placeholder campo nombre", type: "text" },
  { key: "booking.placeholder_email", value: "Ej: maria@ejemplo.com", section: "booking", label: "Placeholder campo email", type: "text" },
  { key: "booking.placeholder_phone", value: "Ej: 1155123456", section: "booking", label: "Placeholder campo teléfono", type: "text" },
  { key: "booking.placeholder_message", value: "Contanos qué te gustaría explorar en tu lectura...", section: "booking", label: "Placeholder campo mensaje", type: "text" },
  { key: "booking.btn_submitting", value: "Enviando...", section: "booking", label: "Botón enviando (loading)", type: "text" },

  // ── Cart ──
  { key: "cart.title", value: "Tu Carrito", section: "cart", label: "Título del carrito", type: "text" },
  { key: "cart.empty", value: "Tu carrito está vacío", section: "cart", label: "Carrito vacío", type: "text" },
  { key: "cart.product_singular", value: "producto", section: "cart", label: "Producto (singular)", type: "text" },
  { key: "cart.product_plural", value: "productos", section: "cart", label: "Productos (plural)", type: "text" },
  { key: "cart.in_cart", value: "en tu carrito", section: "cart", label: "Texto 'en tu carrito'", type: "text" },
  { key: "cart.total_label", value: "Total", section: "cart", label: "Label Total", type: "text" },
  { key: "cart.btn_pay", value: "Pagar", section: "cart", label: "Botón Pagar", type: "text" },
  { key: "cart.trust_secure", value: "Pago seguro", section: "cart", label: "Badge: Pago seguro", type: "text" },
  { key: "cart.trust_encrypted", value: "Datos encriptados", section: "cart", label: "Badge: Datos encriptados", type: "text" },
  { key: "cart.empty_message", value: "Explorá nuestra tienda y agregá los cristales que resuenen con vos.", section: "cart", label: "Mensaje carrito vacío", type: "textarea" },
  { key: "cart.btn_see_crystals", value: "Ver Cristales", section: "cart", label: "Botón Ver Cristales", type: "text" },

  // ── Checkout ──
  { key: "checkout.title", value: "Finalizá tu Compra", section: "checkout", label: "Título checkout", type: "text" },
  { key: "checkout.description", value: "Completá tus datos de envío para recibir tus cristales.", section: "checkout", label: "Descripción checkout", type: "text" },
  { key: "checkout.field_name", value: "Nombre completo", section: "checkout", label: "Label campo nombre", type: "text" },
  { key: "checkout.field_email", value: "Email", section: "checkout", label: "Label campo email", type: "text" },
  { key: "checkout.field_phone", value: "Teléfono", section: "checkout", label: "Label campo teléfono", type: "text" },
  { key: "checkout.field_address", value: "Dirección (calle y número)", section: "checkout", label: "Label campo dirección", type: "text" },
  { key: "checkout.field_city", value: "Ciudad", section: "checkout", label: "Label campo ciudad", type: "text" },
  { key: "checkout.field_province", value: "Provincia", section: "checkout", label: "Label campo provincia", type: "text" },
  { key: "checkout.field_postal", value: "Código Postal", section: "checkout", label: "Label campo código postal", type: "text" },
  { key: "checkout.field_notes", value: "Notas adicionales", section: "checkout", label: "Label campo notas", type: "text" },
  { key: "checkout.placeholder_name", value: "Ej: María González", section: "checkout", label: "Placeholder nombre", type: "text" },
  { key: "checkout.placeholder_email", value: "Ej: maria@ejemplo.com", section: "checkout", label: "Placeholder email", type: "text" },
  { key: "checkout.placeholder_phone", value: "Ej: 1155123456", section: "checkout", label: "Placeholder teléfono", type: "text" },
  { key: "checkout.placeholder_address", value: "Ej: Av. Corrientes 1234", section: "checkout", label: "Placeholder dirección", type: "text" },
  { key: "checkout.placeholder_city", value: "Ej: Buenos Aires", section: "checkout", label: "Placeholder ciudad", type: "text" },
  { key: "checkout.placeholder_province", value: "Ej: CABA", section: "checkout", label: "Placeholder provincia", type: "text" },
  { key: "checkout.placeholder_postal", value: "Ej: 1234", section: "checkout", label: "Placeholder código postal", type: "text" },
  { key: "checkout.placeholder_notes", value: "Instrucciones especiales de envío, horarios preferidos...", section: "checkout", label: "Placeholder notas", type: "text" },
  { key: "checkout.order_summary", value: "Resumen del pedido", section: "checkout", label: "Label resumen del pedido", type: "text" },
  { key: "checkout.security_note", value: "Tus datos están protegidos con encriptación SSL. No almacenamos información de tarjetas de crédito.", section: "checkout", label: "Nota de seguridad", type: "textarea" },
  { key: "checkout.btn_processing", value: "Procesando...", section: "checkout", label: "Botón procesando (loading)", type: "text" },
  { key: "checkout.btn_pay_mercadopago", value: "Pagar con MercadoPago", section: "checkout", label: "Botón Pagar con MercadoPago", type: "text" },
]

export const sectionLabels: Record<string, string> = {
  nav: "Navegación",
  site: "Sitio General",
  crystals: "Cristales / Tienda",
  readings: "Lecturas Akáshicas",
  courses: "Cursos",
  memberships: "Membresías",
  testimonials: "Testimonios",
  espacios: "Espacios / Servicios",
  home_sections: "Secciones del Home",
  membresias_section: "Sección Membresías",
  testimonials_section: "Sección Testimonios",
  faq_section: "Sección FAQ",
  footer: "Pie de Página",
  booking: "Diálogo de Reserva",
  cart: "Carrito de Compras",
  checkout: "Checkout / Pago",
}

export const sectionOrder = ["nav", "site", "crystals", "readings", "courses", "memberships", "testimonials", "espacios", "home_sections", "membresias_section", "testimonials_section", "faq_section", "footer", "booking", "cart", "checkout"]
