"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/hooks/use-site-content";
import { cmsValue, cmsJson, cmsNumber } from "@/lib/cms-helpers";
import { defaultSiteContent } from "@/lib/cms-defaults";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Star,
  Instagram,
  Menu,
  Trash2,
  BookOpen,
  Eye,
  Sparkles,
  ArrowUp,
  ChevronRight,
  ChevronDown,
  MessageCircle,
  Mail,
  ArrowRight,
  Shield,
  Clock,
  Users,
  Award,
  Check,
  X,
  Send,
  Loader2,
  Calendar,
  Phone,
  FileText,
  CalendarCheck,
  AlertTriangle,
  ExternalLink,
  Lock,
  Landmark,
  Info,
  DollarSign,
  User,
  Heart,
  Gem,
  Power,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ======================================================================== */
/*                                 DATA                                      */
/* ======================================================================== */



const testimonials = [
  {
    name: "Valentina R.",
    location: "Buenos Aires, Argentina",
    quote:
      "La lectura cambió mi perspectiva de la vida por completo. Sentí una paz interior que no tenía desde hacía años. Ahora entiendo mi camino con mucha más claridad.",
    rating: 5,
  },
  {
    name: "Martín G.",
    location: "Córdoba, Argentina",
    quote:
      "Increíble experiencia. La lectura me ayudó a entender muchas dinámicas de mi vida y a sanar heridas que arrastraba desde hacía tiempo. La grabación me sirvió para volver a escucharla varias veces.",
    rating: 5,
  },
  {
    name: "Luciana P.",
    location: "Rosario, Argentina",
    quote:
      "El curso de Nivel Inicial superó todas mis expectativas. Ahora puedo conectarme con mis propios registros y la transformación en mi día a día es asombrosa.",
    rating: 5,
  },
];

const navLinksData = [
  { label: "Inicio", href: "#inicio", cmsKey: 'nav.link_inicio' },
  { label: "Lecturas", href: "/lecturas", cmsKey: 'nav.link_sesiones' },
  { label: "Cursos", href: "/cursos", cmsKey: 'nav.link_cursos' },
  { label: "Mentorías", href: "/mentorias", cmsKey: 'nav.link_mentorias' },
  { label: "Membresías", href: "/membresias", cmsKey: 'nav.link_membresia' },
  { label: "Recursos", href: "/recursos", cmsKey: 'nav.link_recursos' },
  { label: "Tienda", href: "/tienda", cmsKey: 'nav.link_tienda' },
  { label: "Aula", href: "/aula", cmsKey: 'nav.link_aula' },
];


/* ======================================================================== */
/*                           MEMBERSHIPS DATA                                */
/* ======================================================================== */

const membershipTiers = [
  {
    id: "raiz-de-luz",
    emoji: null,
    emojiImage: "/images/membresia-emoji-1.png",
    name: "Raíz de Luz",
    price: "$5.000 ARS · US$5",
    frequency: "2 envíos mensuales",
    description:
      "En esta suscripción recibirás contenido para reconectar con tu esencia, cultivar presencia y claridad interior. Cada envío alterna entre meditaciones guiadas y mensajes canalizados.",
    benefits: [
      "Ó una meditación guiada grabada (audio o video)",
      "Ó un mensaje canalizado o reflexión escrita",
      "Prácticas breves para integrar lo recibido",
      "Recomendaciones energéticas o lecturas inspiradoras",
    ],
    purpose:
      "Acompañarte a enraizar tu luz y recordar la conexión con tu alma desde la vida cotidiana.",
    featured: false,
    mercadoPagoUrl:
      "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=244c453d0452470484210074b35bc22d",
    paypalUrl:
      "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-3GR129136U5304800NEETONQ",
  },
  {
    id: "corazon-solar",
    emoji: null,
    emojiImage: "/images/membresia-emoji-2.png",
    name: "Corazón Solar",
    price: "$10.000 ARS · US$8",
    frequency: "3 envíos mensuales",
    description:
      "Incluye todo lo que recibís en Raíz de Luz, con textos adaptados a la energía del corazón y una frecuencia más expansiva y crística.",
    benefits: [
      "Todo el contenido de Raíz de Luz",
      "Activación o meditación profunda exclusiva",
      "Mensaje canalizado extendido con guía de integración",
      "Ejercicios de apertura del corazón y expansión energética",
    ],
    purpose:
      "Habitar el corazón como centro de expansión, alegría, amor y coherencia.",
    featured: true,
    badge: "Más Popular",
    mercadoPagoUrl:
      "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=13240468afc8434ca121abe2b0644ede",
    paypalUrl:
      "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-00D22712PA695974NNEETRWY",
  },
  {
    id: "puente-estelar",
    emoji: null,
    emojiImage: "/images/membresia-emoji-3.png",
    name: "Puente Estelar",
    price: "$15.000 ARS · US$12",
    frequency: "4 envíos mensuales (uno por semana)",
    description:
      "Incluye todo lo de Corazón Solar, elevando la frecuencia hacia la conexión con guías y sabidurías estelares.",
    benefits: [
      "Todo el contenido de Corazón Solar",
      "Canalización de alta frecuencia exclusiva",
      "Mensajes de guías estelares con claves energéticas",
      "Reflexión o propuesta de servicio consciente",
    ],
    purpose: "Ser un canal estable y consciente en Luz, entre el cielo y la tierra.",
    featured: false,
    mercadoPagoUrl:
      "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=3d3e910f53814b218026250694af5272",
    paypalUrl:
      "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-1TT73903VH987053VNEETSMA",
  },
];

/* ======================================================================== */
/*                            FAQ DATA                                       */
/* ======================================================================== */

const faqItems = [
  {
    question: "¿Qué son los Registros Akáshicos?",
    answer:
      "Akasha es un campo al que pertenecés, en sánscrito significa Éter, aquello que lo contiene todo, es un campo de memoria universal. Los Registros Akáshicos son información viva, vibracional. Conectar con ellos no solo es \"ver cosas\" es poder distinguir con claridad y honestidad, que te da miedo, lo que deseás, lo que sabés profundamente.",
  },
  {
    question: "¿Cómo funciona una lectura?",
    answer:
      "A través de una conexión sagrada, accedo a los registros de tu esencia para responder tus preguntas. Recibís la lectura grabada en audio a través del Aula Virtual, personalizada y confidencial.",
  },
  {
    question: "¿Es seguro o confidencial?",
    answer:
      "Absolutamente. Todo lo que se comparte en una lectura es estrictamente confidencial. No se comparte información con terceros bajo ninguna circunstancia.",
  },
  {
    question: "¿Necesito experiencia previa para los cursos?",
    answer:
      "No. El Nivel 1 Teórico es ideal para principiantes. El Nivel 1 con Práctica y el Nivel 2 van paso a paso con acompañamiento personalizado.",
  },
  {
    question: "¿Las membresías tienen compromiso?",
    answer:
      "No. Podés cancelar tu membresía en cualquier momento desde MercadoPago o PayPal. Sin preguntas, sin penalidades.",
  },
  {
    question: "¿Hacen envíos a todo el país?",
    answer:
      "Sí, desde nuestra tienda realizamos envíos a todo el país para que recibas tu pedido de forma segura y confiable.",
  },
];

/* ======================================================================== */
/*                            ANIMATION VARS                                 */
/* ======================================================================== */

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

/* ======================================================================== */
/*                           SECTION WRAPPER                                 */
/* ======================================================================== */

function AnimatedSection({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
}

/* ======================================================================== */
/*                               MAIN PAGE                                   */
/* ======================================================================== */

export default function Home() {
  const router = useRouter();
  const { cmsMap } = useSiteContent();

  // CMS-driven values with hardcoded fallbacks
  // SEO-optimized hero copy: incluye "Registros Akáshicos" como H1 principal
  const heroSubtitle = cmsValue(cmsMap, 'site.hero_subtitle', ""); // Eliminado subtítulo visible (SEO en H1 oculto)
  const heroTagline = cmsValue(cmsMap, 'site.hero_tagline', "Un espacio para vivir tu espiritualidad de forma cercana, humana y sobre todo desde la consciencia");
  const contactEmail = cmsValue(cmsMap, 'site.contact_email', "etersomos@gmail.com");
  const contactWhatsapp = cmsValue(cmsMap, 'site.contact_whatsapp', "+54 9 3518 62-9325");
  const contactWhatsappNumber = cmsValue(cmsMap, 'site.contact_whatsapp_number', "5493518629325");
  const instagramUrl = cmsValue(cmsMap, 'site.instagram_url', "https://instagram.com/etersomos");
  const sobreTitle = cmsValue(cmsMap, 'home.sobre_title', "Fer Cardozo");
  const sobreBio1 = cmsValue(cmsMap, 'home.sobre_bio_1', "Soy Fer Cardozo, Viajera, emprendedora, lectora y terapeuta de Conciencia Akáshica, canalizadora y activadora de la Energía Arcturiana. Acompaño a personas en su proceso de autoconocimiento y sanación a través de esta herramienta ancestral.");
  const sobreBio2 = cmsValue(cmsMap, 'home.sobre_bio_2', "Desde hace años, me dedico a facilitar espacios de conexión con la esencia del alma. Cada lectura y cada curso que ofrezco nace desde un lugar de servicio y profundo respeto por el camino de cada ser.");
  const sobreStatLecturas = cmsValue(cmsMap, 'home.sobre_stat_lecturas', "500+");
  const sobreStatAlumnos = cmsValue(cmsMap, 'home.sobre_stat_alumnos', "200+");
  const sobreStatAnios = cmsValue(cmsMap, 'home.sobre_stat_anios', "5");
  const readingsPriceArs = cmsNumber(cmsMap, 'readings.price_ars', 20000);
  const readingsPriceUsd = cmsNumber(cmsMap, 'readings.price_usd', 20);

  // Nav
  const navLinkInicio = cmsValue(cmsMap, 'nav.link_inicio', 'Inicio');
  const navLinkSesiones = cmsValue(cmsMap, 'nav.link_sesiones', 'Lecturas');
  const navLinkCursos = cmsValue(cmsMap, 'nav.link_cursos', 'Cursos');
  const navLinkMentorias = cmsValue(cmsMap, 'nav.link_mentorias', 'Mentorías');
  const navLinkMembresia = cmsValue(cmsMap, 'nav.link_membresia', 'Membresías');
  const navLinkRecursos = cmsValue(cmsMap, 'nav.link_recursos', 'Recursos');
  const navLinkTienda = cmsValue(cmsMap, 'nav.link_tienda', 'Tienda');
  const navLinkAula = cmsValue(cmsMap, 'nav.link_aula', 'Aula');

  // Hero buttons
  const heroBtnServices = cmsValue(cmsMap, 'site.hero_btn_services', 'Ver servicios');
  const heroBtnReading = cmsValue(cmsMap, 'site.hero_btn_reading', 'Pedí tu Lectura');

  // Espacios
  const espaciosSubtitle = cmsValue(cmsMap, 'espacios.subtitle', 'Nuestros Espacios');
  const espaciosHeading = cmsValue(cmsMap, 'espacios.heading', '¿Qué buscás?');
  const espaciosCard1Title = cmsValue(cmsMap, 'espacios.card1_title', 'Lectura de Registros Akáshicos');
  const espaciosCard1Desc = cmsValue(cmsMap, 'espacios.card1_desc', 'Traé claridad a los procesos que estás atravesando. Recibí una lectura personalizada grabada especialmente para vos.');
  const espaciosCard1Price = cmsValue(cmsMap, 'espacios.card1_price', '$20.000 ARS · US$20');
  const espaciosCard2Title = cmsValue(cmsMap, 'espacios.card2_title', 'Cursos de Formación');
  const espaciosCard2Desc = cmsValue(cmsMap, 'espacios.card2_desc', 'Aprendé a conectar con tus propios Registros Akáshicos y el de otras personas. Niveles 1 y 2 con práctica individual.');
  const espaciosCard2Price = cmsValue(cmsMap, 'espacios.card2_price', 'Desde contribución voluntaria');
  const espaciosCard3Title = cmsValue(cmsMap, 'espacios.card3_title', 'Membresías');
  const espaciosCard3Desc = cmsValue(cmsMap, 'espacios.card3_desc', 'Contenido exclusivo mensual para tu expansión espiritual. Meditaciones, canalizaciones y activaciones.');
  const espaciosCard3Price = cmsValue(cmsMap, 'espacios.card3_price', 'Desde $5.000 ARS · US$5/mes');
  const espaciosCard4Title = cmsValue(cmsMap, 'espacios.card4_title', 'Tienda');
  const espaciosCard4Desc = cmsValue(cmsMap, 'espacios.card4_desc', 'Cada pieza ha sido elegida por su energía, su significado y el valor que puede aportar a tu camino espiritual.');
  const espaciosCard4Price = cmsValue(cmsMap, 'espacios.card4_price', 'Solo envío en Argentina');

  // Sobre Fer extra labels
  const sobreSubtitle = cmsValue(cmsMap, 'home.sobre_subtitle', 'Conoce a tu guía');
  const sobreStatLecturasLabel = cmsValue(cmsMap, 'home.sobre_stat_lecturas_label', 'lecturas realizadas');
  const sobreStatAlumnosLabel = cmsValue(cmsMap, 'home.sobre_stat_alumnos_label', 'alumnos formados');
  const sobreStatAniosLabel = cmsValue(cmsMap, 'home.sobre_stat_anios_label', 'años de experiencia');

  // Membresías section
  const membresiasSubtitle = cmsValue(cmsMap, 'membresias_section.subtitle', 'Contenido exclusivo');
  const membresiasTitle = cmsValue(cmsMap, 'membresias_section.title', 'Membresía Eter Somos');
  const membresiasDescription = cmsValue(cmsMap, 'membresias_section.description', 'Elegí la frecuencia que más resuene con tu momento interior');
  const membresiasPerMonth = cmsValue(cmsMap, 'membresias_section.per_month', 'por mes');
  const membresiasBtnPrefix = cmsValue(cmsMap, 'membresias_section.btn_prefix', 'Suscribirme a');
  const membresiasCancelNote = cmsValue(cmsMap, 'membresias_section.cancel_note', 'Cancelá en cualquier momento, sin compromiso.');

  // Testimonials section
  const testimonialsSectionTitle = cmsValue(cmsMap, 'testimonials_section.title', 'Testimonios');
  const testimonialsSectionSubtitle = cmsValue(cmsMap, 'testimonials_section.subtitle', 'Lo que dicen nuestros consultantes');

  // FAQ section
  const faqSectionTitle = cmsValue(cmsMap, 'faq_section.title', 'Resolvé tus dudas');
  const faqSectionSubtitle = cmsValue(cmsMap, 'faq_section.subtitle', 'Preguntas Frecuentes');

  // Footer
  const footerDescription = cmsValue(cmsMap, 'footer.description', 'Lecturas, cursos y piezas consagradas para tu camino espiritual.');
  const footerNavTitle = cmsValue(cmsMap, 'footer.nav_title', 'Navegación');
  const footerContactTitle = cmsValue(cmsMap, 'footer.contact_title', 'Contacto');
  const footerLegalTitle = cmsValue(cmsMap, 'footer.legal_title', 'Legal');
  const footerLegalText = cmsValue(cmsMap, 'footer.legal_text', 'Las lecturas de Registros Akáshicas son una herramienta de autoconocimiento y crecimiento espiritual. No reemplazan ningún tratamiento médico o psicológico profesional.');
  const footerCopyright = cmsValue(cmsMap, 'footer.copyright', '© 2026 Eter Somos. Todos los derechos reservados.');

  // Booking dialog
  const bookingTitle = cmsValue(cmsMap, 'booking.title', 'Pedí tu Lectura');
  const bookingDescription = cmsValue(cmsMap, 'booking.description', 'Completá el formulario y te contactaremos para coordinar tu lectura akáshica.');
  const bookingBtnSubmit = cmsValue(cmsMap, 'booking.btn_submit', 'Enviar Solicitud');
  const bookingFieldName = cmsValue(cmsMap, 'booking.field_name', 'Nombre completo');
  const bookingFieldEmail = cmsValue(cmsMap, 'booking.field_email', 'Email');
  const bookingFieldPhone = cmsValue(cmsMap, 'booking.field_phone', 'Teléfono (WhatsApp)');
  const bookingFieldMessage = cmsValue(cmsMap, 'booking.field_message', 'Mensaje / Preguntas para la lectura');
  const bookingPlaceholderName = cmsValue(cmsMap, 'booking.placeholder_name', 'Ej: María González');
  const bookingPlaceholderEmail = cmsValue(cmsMap, 'booking.placeholder_email', 'Ej: maria@ejemplo.com');
  const bookingPlaceholderPhone = cmsValue(cmsMap, 'booking.placeholder_phone', 'Ej: 1155123456');
  const bookingPlaceholderMessage = cmsValue(cmsMap, 'booking.placeholder_message', 'Contanos qué te gustaría explorar en tu lectura...');
  const bookingBtnSubmitting = cmsValue(cmsMap, 'booking.btn_submitting', 'Enviando...');


  const cmsTestimonials = cmsJson(cmsMap, 'testimonials.items', testimonials);
  const cmsFaqItems = cmsJson(cmsMap, 'home.faq_items', faqItems);
  const cmsMembershipTiers = cmsJson(cmsMap, 'memberships.tiers', membershipTiers);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  /* ---- Newsletter state ---- */
  const [newsletterEmail, setNewsletterEmail] = useState("");


  /* ---- Admin state ---- */
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminPasswordDialogOpen, setAdminPasswordDialogOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminBookings, setAdminBookings] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState({
    total: 0,
    pendiente: 0,
    confirmada: 0,
    en_progreso: 0,
    enviada: 0,
    cancelada: 0,
  });
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminFilter, setAdminFilter] = useState("todos");

  /* ---- Form toggles state ---- */
  const [formToggles, setFormToggles] = useState<Record<string, boolean>>({});
  const [pauseMessage, setPauseMessage] = useState("");
  const [togglesLoading, setTogglesLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  /* ---- Logo triple-click refs ---- */
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---- Nav scroll effect ---- */
  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 40);
      setShowBackToTop(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ---- Smooth scroll helper ---- */
  const scrollTo = useCallback((href: string) => {
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  }, []);


  /* ---- Floating stars ---- */
  const [starsCount, setStarsCount] = useState(15);
  useEffect(() => {
    setStarsCount(window.innerWidth < 640 ? 6 : 15);
  }, []);
  const stars = Array.from({ length: starsCount }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
  }));

  /* ---- Form helpers ---- */
  const formatPrice = (price: number) =>
    `$${price.toLocaleString("es-AR")} ARS`;

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Ingresá tu nombre completo";
    if (!formData.email.trim()) errors.email = "Ingresá tu email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Ingresá un email válido";
    if (!formData.phone.trim()) errors.phone = "Ingresá tu teléfono";
    else if (!/^\d{7,15}$/.test(formData.phone.replace(/[\s()-]/g, "")))
      errors.phone = "Ingresá un teléfono válido (solo números)";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };


  const handleSubmitBooking = async () => {
    if (!validateForm()) return;
    setFormSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Solicitud registrada con éxito", {
          description:
            "Vas a recibir un email con tus credenciales para ingresar al Aula Virtual, donde podrás escuchar tu lectura cuando esté lista.",
          duration: 6000,
        });
        setFormData({ name: "", email: "", phone: "", message: "" });
        setFormErrors({});
        setBookingDialogOpen(false);
      } else {
        toast.error(data.error || "Error al registrar la reserva");
      }
    } catch {
      toast.error("Error de conexión. Intentá de nuevo.");
    } finally {
      setFormSubmitting(false);
    }
  };

  /* ---- Admin functions ---- */
  const fetchAdminData = async () => {
    setAdminLoading(true);
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (res.ok && data.bookings) {
        const bookings = data.bookings;
        setAdminBookings(bookings);
        setAdminStats({
          total: bookings.length,
          pendiente: bookings.filter((b: any) => b.status === "pendiente")
            .length,
          confirmada: bookings.filter((b: any) => b.status === "confirmada")
            .length,
          en_progreso: bookings.filter((b: any) => b.status === "en_progreso")
            .length,
          enviada: bookings.filter((b: any) => b.status === "enviada")
            .length,
          cancelada: bookings.filter((b: any) => b.status === "cancelada")
            .length,
        });
      }
    } catch {
      toast.error("Error al cargar las reservas");
    } finally {
      setAdminLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Estado actualizado a "${status}"`);
        fetchAdminData();
        if (selectedBooking && selectedBooking.id === id) {
          setSelectedBooking({ ...selectedBooking, status });
        }
      } else {
        toast.error(data.error || "Error al actualizar estado");
      }
    } catch {
      toast.error("Error de conexión");
    }
  };

  const handleDeleteBooking = async (id: number) => {
    if (
      !window.confirm(
        "¿Estás segura de que querés eliminar esta reserva? Esta acción no se puede deshacer."
      )
    )
      return;
    try {
      const res = await fetch(`/api/bookings?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Reserva eliminada correctamente");
        fetchAdminData();
        if (selectedBooking && selectedBooking.id === id) {
          setSelectedBooking(null);
        }
      } else {
        toast.error(data.error || "Error al eliminar");
      }
    } catch {
      toast.error("Error de conexión");
    }
  };

  const handleOpenAdmin = () => {
    const correctPassword =
      process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "eter2024admin";
    if (adminPasswordInput === correctPassword) {
      setAdminPasswordDialogOpen(false);
      setAdminPasswordInput("");
      setAdminOpen(true);
      fetchAdminData();
      fetchFormSettings();
    } else {
      toast.error("Contraseña incorrecta", {
        description:
          "No tenés permiso para acceder al panel de administración.",
      });
      setAdminPasswordInput("");
    }
  };

  /* ---- Form toggles functions ---- */
  const fetchFormSettings = async () => {
    try {
      const res = await fetch(`/api/settings?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      setFormToggles(data.forms || {});
      setPauseMessage(data.pauseMessage || "");
    } catch {
      toast.error("Error al cargar la configuración de formularios");
    }
  };

  const handleToggleForm = async (formKey: string) => {
    setTogglesLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          forms: { [formKey]: !formToggles[formKey] },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFormToggles(data.settings.forms || {});
        toast.success(
          !formToggles[formKey]
            ? "Formulario habilitado"
            : "Formulario pausado"
        );
      }
    } catch {
      toast.error("Error al cambiar el estado del formulario");
    } finally {
      setTogglesLoading(false);
    }
  };

  const handleSavePauseMessage = async () => {
    setTogglesLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pauseMessage }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Mensaje de pausa actualizado");
      }
    } catch {
      toast.error("Error al guardar el mensaje");
    } finally {
      setTogglesLoading(false);
    }
  };

  const handlePauseAll = async () => {
    setTogglesLoading(true);
    try {
      const allOff = Object.fromEntries(
        Object.keys(formToggles).map((k) => [k, false])
      );
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forms: allOff }),
      });
      const data = await res.json();
      if (res.ok) {
        setFormToggles(data.settings.forms || {});
        toast.success("Todos los formularios pausados");
      }
    } catch {
      toast.error("Error al pausar los formularios");
    } finally {
      setTogglesLoading(false);
    }
  };

  const handleResumeAll = async () => {
    setTogglesLoading(true);
    try {
      const allOn = Object.fromEntries(
        Object.keys(formToggles).map((k) => [k, true])
      );
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forms: allOn }),
      });
      const data = await res.json();
      if (res.ok) {
        setFormToggles(data.settings.forms || {});
        toast.success("Todos los formularios habilitados");
      }
    } catch {
      toast.error("Error al habilitar los formularios");
    } finally {
      setTogglesLoading(false);
    }
  };

  const formLabels: Record<string, string> = {
    lecturas: "Lecturas Akáshicas",
    "n1-teorico": "Curso N1 Teórico",
    "n1-con-practica": "Curso N1 con Práctica",
    "n2-completo": "Curso N2 Completo",
    ambos: "Ambos Cursos",
    membresias: "Membresías",
  };

  const statusConfig: Record<
    string,
    { label: string; bg: string; text: string; border: string }
  > = {
    pendiente: {
      label: "Pendiente",
      bg: "bg-yellow-500/20",
      text: "text-yellow-400",
      border: "border-yellow-500/30",
    },
    confirmada: {
      label: "Confirmada",
      bg: "bg-blue-500/20",
      text: "text-blue-400",
      border: "border-blue-500/30",
    },
    en_progreso: {
      label: "En Progreso",
      bg: "bg-orange-500/20",
      text: "text-orange-400",
      border: "border-orange-500/30",
    },
    enviada: {
      label: "Enviada",
      bg: "bg-green-500/20",
      text: "text-green-400",
      border: "border-green-500/30",
    },
    cancelada: {
      label: "Cancelada",
      bg: "bg-red-500/20",
      text: "text-red-400",
      border: "border-red-500/30",
    },
  };

  const formatBookingDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDeadlineInfo = (booking: any) => {
    if (booking.status !== "confirmada" || !booking.confirmedAt) return null;
    const confirmedDate = new Date(booking.confirmedAt);
    const deadline = new Date(confirmedDate);
    deadline.setDate(deadline.getDate() + 7);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return {
      deadline,
      daysRemaining,
      isOverdue: daysRemaining < 0,
      formattedDeadline: deadline.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };
  };

  const filteredBookings =
    adminFilter === "todos"
      ? adminBookings
      : adminBookings.filter((b: any) => b.status === adminFilter);

  /* ---- Featured membership ---- */
  const featuredTier = cmsMembershipTiers.find((t) => t.featured)!;
  const otherTiers = cmsMembershipTiers.filter((t) => !t.featured);

  /* ================================================================== */
  /*                          RETURN JSX                                 */
  /* ================================================================== */

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#161310",
            color: "#f0ebe5",
            border: "1px solid #2a252066",
          },
        }}
      />

      {/* ============================================================ */}
      {/*                       NAVIGATION BAR                          */}
      {/* ============================================================ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          navScrolled
            ? "glass shadow-lg shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 lg:h-18">
          {/* Logo */}
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("#inicio");
              logoClickCount.current++;
              if (logoClickCount.current >= 3) {
                logoClickCount.current = 0;
                window.location.href = "/admin";
                return;
              }
              if (logoClickTimer.current)
                clearTimeout(logoClickTimer.current);
              logoClickTimer.current = setTimeout(() => {
                logoClickCount.current = 0;
              }, 800);
            }}
            className="flex items-center gap-2.5"
          >
            <Image
              src="/images/logo-etersomos.jpg"
              alt="Eter Somos Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="text-violet-400 font-serif font-semibold text-lg tracking-[0.2em] uppercase">
              ETER SOMOS
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinksData.map((link) => {
              const label = cmsValue(cmsMap, link.cmsKey, link.label);
              return link.href.startsWith("/") ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-foreground/60 hover:text-violet-400 transition-colors duration-300 font-sans font-medium"
                >
                  {label}
                </Link>
              ) : (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="text-sm text-foreground/60 hover:text-violet-400 transition-colors duration-300 font-sans font-medium"
                >
                  {label}
                </button>
              );
            })}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/50 hover:text-violet-400 transition-colors duration-300"
              aria-label="Instagram"
            >
              <Instagram className="size-5" />
            </a>
          </div>

          {/* Mobile Menu */}
          <div className="flex lg:hidden items-center gap-2">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground/50 hover:text-violet-400"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-mystic-950/95 backdrop-blur-xl border-mystic-800/30 w-72"
              >
                <SheetHeader>
                  <SheetTitle className="text-violet-400 font-serif tracking-[0.2em] uppercase">
                    ETER SOMOS
                  </SheetTitle>
                  <SheetDescription className="text-foreground/60">
                    Navegación
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-1 mt-8">
                  {navLinksData.map((link) => {
                    const label = cmsValue(cmsMap, link.cmsKey, link.label);
                    return link.href.startsWith("/") ? (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-3 rounded-xl text-foreground/70 hover:text-violet-400 hover:bg-mystic-900/50 transition-all duration-300"
                      >
                        {label}
                        <ChevronRight className="size-4" />
                      </Link>
                    ) : (
                      <button
                        key={link.href}
                        onClick={() => scrollTo(link.href)}
                        className="flex items-center justify-between px-4 py-3 rounded-xl text-foreground/70 hover:text-violet-400 hover:bg-mystic-900/50 transition-all duration-300"
                      >
                        {label}
                        <ChevronRight className="size-4" />
                      </button>
                    );
                  })}
                  <Separator className="bg-mystic-800/30 my-4" />
                  <a
                    href="https://instagram.com/etersomos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/70 hover:text-violet-400 hover:bg-mystic-900/50 transition-all duration-300"
                  >
                    <Instagram className="size-5" />
                    <span>@etersomos</span>
                  </a>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>

      {/* ============================================================ */}
      {/*                        HERO SECTION                           */}
      {/* ============================================================ */}
      <section
        id="inicio"
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 sm:pt-20"
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/hero-bg-v2.webp')" }}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-mystic-950/80" />

        {/* Bottom fade to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent z-[1]" />

        {/* Floating stars */}
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-violet-300/40 animate-twinkle pointer-events-none"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}

        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.8 }}
            >
              <div className="mx-auto mb-8 w-36 h-36 sm:w-44 sm:h-44 md:w-44 md:h-44 rounded-full overflow-hidden animate-float shadow-2xl shadow-violet-900/20 relative ring-1 ring-violet-400/20">
                <img
                  src="/images/logo-etersomos.jpg"
                  alt="Eter Somos"
                  className="w-full h-full object-cover rounded-full opacity-90"
                />
              </div>
            </motion.div>

            {/* H1 SEO oculto (sr-only) — keywords para Google sin mostrar en UI */}
            <h1 className="sr-only">Registros Akáshicos en Argentina — Lecturas, Cursos y Cristales</h1>


            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-base sm:text-lg text-foreground/50 max-w-xl mx-auto mb-10 leading-relaxed font-sans"
            >
              {heroTagline}
            </motion.p>

            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                onClick={() => scrollTo("#espacios")}
                className="bg-violet-500 hover:bg-violet-600 text-white font-serif text-base px-8 py-6 rounded-full transition-all duration-300 hover:scale-105 shadow-lg shadow-violet-900/30"
              >
                {heroBtnServices}
                <ArrowRight className="size-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/lecturas")}
                className="border-foreground/20 text-foreground/80 hover:bg-foreground/5 hover:text-foreground font-sans font-medium text-base px-8 py-6 rounded-full transition-all duration-300 hover:scale-105"
              >
                <BookOpen className="size-5 mr-2" />
                {heroBtnReading}
              </Button>
            </motion.div>
          </motion.div>
        </div>


      </section>

      {/* ============================================================ */}
      {/*                    ESPACIOS SECTION                           */}
      {/* ============================================================ */}
      <AnimatedSection
        id="espacios"
        className="py-20 sm:py-28 px-4 sm:px-6"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div variants={staggerItem} className="text-center mb-16">
            <span className="inline-block text-violet-400 text-xs font-sans font-semibold tracking-[0.3em] uppercase mb-3">
              {espaciosSubtitle}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-foreground mb-2">
              {espaciosHeading}
            </h2>
            <div className="w-16 h-[2px] bg-violet-500/40 mx-auto mt-4" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Lecturas Akáshicas */}
            <motion.div variants={staggerItem}>
              <Link href="/lecturas">
                <div className="glass rounded-2xl p-6 sm:p-8 h-full border-mystic-700/20 hover:border-violet-500/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-violet-900/10 cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/15 flex items-center justify-center mb-4 group-hover:bg-violet-500/25 transition-colors duration-300">
                    <Eye className="size-6 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-foreground mb-2 group-hover:text-violet-300 transition-colors duration-300">
                    {espaciosCard1Title}
                  </h3>
                  <p className="text-foreground/50 text-sm leading-relaxed mb-4 font-sans">
                    {espaciosCard1Desc}
                  </p>
                  <span className="text-violet-400/80 text-xs font-sans font-semibold tracking-wider uppercase">
                    {espaciosCard1Price}
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Cursos de Formación */}
            <motion.div variants={staggerItem}>
              <Link href="/cursos">
                <div className="glass rounded-2xl p-6 sm:p-8 h-full border-mystic-700/20 hover:border-violet-500/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-violet-900/10 cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/15 flex items-center justify-center mb-4 group-hover:bg-violet-500/25 transition-colors duration-300">
                    <BookOpen className="size-6 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-foreground mb-2 group-hover:text-violet-300 transition-colors duration-300">
                    {espaciosCard2Title}
                  </h3>
                  <p className="text-foreground/50 text-sm leading-relaxed mb-4 font-sans">
                    {espaciosCard2Desc}
                  </p>
                  <span className="text-violet-400/80 text-xs font-sans font-semibold tracking-wider uppercase">
                    {espaciosCard2Price}
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Membresías */}
            <motion.div variants={staggerItem}>
              <Link href="/membresias">
                <div className="glass rounded-2xl p-6 sm:p-8 h-full border-mystic-700/20 hover:border-violet-500/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-violet-900/10 cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/15 flex items-center justify-center mb-4 group-hover:bg-violet-500/25 transition-colors duration-300">
                    <Sparkles className="size-6 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-foreground mb-2 group-hover:text-violet-300 transition-colors duration-300">
                    {espaciosCard3Title}
                  </h3>
                  <p className="text-foreground/50 text-sm leading-relaxed mb-4 font-sans">
                    {espaciosCard3Desc}
                  </p>
                  <span className="text-violet-400/80 text-xs font-sans font-semibold tracking-wider uppercase">
                    {espaciosCard3Price}
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Cristales */}
            <motion.div variants={staggerItem}>
              <Link href="/tienda">
                <div className="glass rounded-2xl p-6 sm:p-8 h-full border-mystic-700/20 hover:border-violet-500/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-violet-900/10 cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/15 flex items-center justify-center mb-4 group-hover:bg-violet-500/25 transition-colors duration-300">
                    <Gem className="size-6 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-foreground mb-2 group-hover:text-violet-300 transition-colors duration-300">
                    {espaciosCard4Title}
                  </h3>
                  <p className="text-foreground/50 text-sm leading-relaxed mb-4 font-sans">
                    {espaciosCard4Desc}
                  </p>
                  <span className="text-violet-400/80 text-xs font-sans font-semibold tracking-wider uppercase">
                    {espaciosCard4Price}
                  </span>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* ============================================================ */}
      {/*                      SOBRE FER SECTION                        */}
      {/* ============================================================ */}
      <AnimatedSection id="sobre" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={staggerItem} className="text-center mb-16">
            <span className="inline-block text-violet-400 text-xs font-sans font-semibold tracking-[0.3em] uppercase mb-3">
              {sobreSubtitle}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-white">
              Sobre {sobreTitle}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left: Fer Photo */}
            <motion.div variants={staggerItem}>
              <div className="aspect-[3/4] max-w-sm mx-auto md:mx-0 rounded-2xl overflow-hidden relative">
                <Image
                  src="/images/fer-sobre.webp"
                  alt="Fer - Eter Somos"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 384px, 384px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-mystic-950/40 via-transparent to-violet-950/20 pointer-events-none" />
              </div>
            </motion.div>

            {/* Right: Bio */}
            <motion.div
              variants={staggerItem}
              className="space-y-6 text-center md:text-left"
            >
              <p className="text-foreground/70 leading-relaxed font-sans text-base">
                {sobreBio1}
              </p>
              <p className="text-foreground/50 leading-relaxed font-sans text-base">
                {sobreBio2}
              </p>
              <Separator className="bg-mystic-800/30 max-w-xs mx-auto md:mx-0" />
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm font-sans">
                <div className="flex items-center gap-2">
                  <Eye className="size-4 text-violet-400" />
                  <span className="text-foreground/60">
                    <span className="text-violet-400 font-semibold font-serif">
                      {sobreStatLecturas}
                    </span>{" "}
                    {sobreStatLecturasLabel}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-violet-400" />
                  <span className="text-foreground/60">
                    <span className="text-violet-400 font-semibold font-serif">
                      {sobreStatAlumnos}
                    </span>{" "}
                    {sobreStatAlumnosLabel}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="size-4 text-violet-400" />
                  <span className="text-foreground/60">
                    <span className="text-violet-400 font-semibold font-serif">
                      {sobreStatAnios}
                    </span>{" "}
                    {sobreStatAniosLabel}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* ============================================================ */}
      {/*                    TESTIMONIALS SECTION                        */}
      {/* ============================================================ */}
      <AnimatedSection className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={staggerItem} className="text-center mb-16">
            <span className="inline-block text-violet-400 text-xs font-sans font-semibold tracking-[0.3em] uppercase mb-3">
              {testimonialsSectionTitle}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-foreground mb-3">
              {testimonialsSectionSubtitle}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {cmsTestimonials.map((testimonial) => (
              <motion.div key={testimonial.name} variants={staggerItem}>
                <div className="glass rounded-2xl p-6 sm:p-8 border-mystic-700/20 hover:border-violet-500/20 transition-all duration-500 h-full flex flex-col relative overflow-hidden">
                  <div className="absolute top-3 right-5 text-7xl text-violet-400/5 font-serif leading-none select-none">
                    &ldquo;
                  </div>
                  <div className="flex justify-center gap-0.5 mb-5 relative">
                    {Array.from({ length: testimonial.rating }).map(
                      (_, i) => (
                        <Star
                          key={i}
                          className="size-4 text-violet-400 fill-violet-400"
                        />
                      )
                    )}
                  </div>
                  <p className="text-foreground/60 italic leading-relaxed text-sm font-serif mb-6 flex-1 relative">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="text-center relative">
                    <p className="font-semibold text-foreground text-sm font-sans">
                      {testimonial.name}
                    </p>
                    <p className="text-foreground/40 text-xs mt-0.5 font-sans">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ============================================================ */}
      {/*                       FAQ SECTION                             */}
      {/* ============================================================ */}
      <AnimatedSection className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={staggerItem} className="text-center mb-16">
            <span className="inline-block text-violet-400 text-xs font-sans font-semibold tracking-[0.3em] uppercase mb-3">
              {faqSectionTitle}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-foreground mb-3">
              {faqSectionSubtitle}
            </h2>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Accordion type="single" collapsible className="space-y-3">
              {cmsFaqItems.map((item, idx) => (
                <AccordionItem
                  key={idx}
                  value={`faq-${idx}`}
                  className="glass rounded-xl border-mystic-700/20 overflow-hidden px-5"
                >
                  <AccordionTrigger className="text-foreground/80 hover:text-violet-300 hover:no-underline py-5 text-left font-sans font-medium text-sm sm:text-base transition-colors duration-300 [&[data-state=open]>svg]:text-violet-400">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-foreground/50 text-sm leading-relaxed font-sans pb-5">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ============================================================ */}
      {/*                          FOOTER                                */}
      {/* ============================================================ */}
      <footer id="contacto" className="border-t border-mystic-800/20 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <Image
                  src="/images/logo-etersomos.jpg"
                  alt="Eter Somos"
                  width={36}
                  height={36}
                  className="rounded-full"
                />
                <span className="text-violet-400 font-serif font-bold tracking-[0.2em] uppercase text-lg">
                  ETER SOMOS
                </span>
              </div>
              <p className="text-foreground/40 text-sm leading-relaxed font-sans">
                {footerDescription}
              </p>
            </div>

            {/* Navegación */}
            <div>
              <h3 className="text-violet-400 font-serif font-semibold mb-4 text-sm uppercase tracking-wider">
                {footerNavTitle}
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <button
                    onClick={() => scrollTo("#inicio")}
                    className="text-foreground/40 hover:text-violet-400 transition-colors duration-300 text-sm font-sans"
                  >
                    {navLinkInicio}
                  </button>
                </li>
                <li>
                  <Link
                    href="/lecturas"
                    className="text-foreground/40 hover:text-violet-400 transition-colors duration-300 text-sm font-sans"
                  >
                    {navLinkSesiones}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cursos"
                    className="text-foreground/40 hover:text-violet-400 transition-colors duration-300 text-sm font-sans"
                  >
                    {navLinkCursos}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/mentorias"
                    className="text-foreground/40 hover:text-violet-400 transition-colors duration-300 text-sm font-sans"
                  >
                    {navLinkMentorias}
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("#membresias")}
                    className="text-foreground/40 hover:text-violet-400 transition-colors duration-300 text-sm font-sans"
                  >
                    {navLinkMembresia}
                  </button>
                </li>
                <li>
                  <Link
                    href="/recursos"
                    className="text-foreground/40 hover:text-violet-400 transition-colors duration-300 text-sm font-sans"
                  >
                    {navLinkRecursos}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tienda"
                    className="text-foreground/40 hover:text-violet-400 transition-colors duration-300 text-sm font-sans"
                  >
                    {navLinkTienda}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/aula"
                    className="text-foreground/40 hover:text-violet-400 transition-colors duration-300 text-sm font-sans"
                  >
                    {navLinkAula}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h3 className="text-violet-400 font-serif font-semibold mb-4 text-sm uppercase tracking-wider">
                {footerContactTitle}
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="flex items-center gap-2 text-foreground/40 hover:text-violet-400 transition-colors duration-300 text-sm font-sans"
                  >
                    <Mail className="size-4" />
                    {contactEmail}
                  </a>
                </li>
                <li>
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-foreground/40 hover:text-violet-400 transition-colors duration-300 text-sm font-sans"
                  >
                    <Instagram className="size-4" />
                    @etersomos
                  </a>
                </li>
                <li>
                  <a
                    href={`https://wa.me/${contactWhatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-foreground/40 hover:text-violet-400 transition-colors duration-300 text-sm font-sans"
                  >
                    <MessageCircle className="size-4" />
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-violet-400 font-serif font-semibold mb-4 text-sm uppercase tracking-wider">
                {footerLegalTitle}
              </h3>
              <p className="text-foreground/40 text-sm leading-relaxed font-sans">
                {footerLegalText}
              </p>
            </div>
          </div>

          <Separator className="bg-mystic-800/20 my-10" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-foreground/30 text-sm font-sans">
              {footerCopyright}
            </p>
            <div className="flex items-center gap-4">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/30 hover:text-violet-400 transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram className="size-5" />
              </a>
              <a
                href={`https://wa.me/${contactWhatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/30 hover:text-violet-400 transition-colors duration-300"
                aria-label="WhatsApp"
              >
                <MessageCircle className="size-5" />
              </a>
              <a
                href={`mailto:${contactEmail}`}
                className="text-foreground/30 hover:text-violet-400 transition-colors duration-300"
                aria-label="Email"
              >
                <Mail className="size-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ============================================================ */}
      {/*                    BOOKING DIALOG                               */}
      {/* ============================================================ */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="bg-mystic-950/98 backdrop-blur-xl border-mystic-700/40 sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-violet-400 font-serif text-2xl flex items-center gap-2">
              <Calendar className="size-5" />
              {bookingTitle}
            </DialogTitle>
            <DialogDescription className="text-foreground/60 font-sans">
              {bookingDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="booking-name" className="text-foreground/80 text-sm font-medium font-sans">
                {bookingFieldName} <span className="text-violet-400">*</span>
              </Label>
              <Input
                id="booking-name"
                placeholder={bookingPlaceholderName}
                value={formData.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                className={`bg-mystic-900/50 border-mystic-700/40 focus:border-violet-500/60 text-foreground placeholder:text-foreground/30 font-sans ${formErrors.name ? "border-red-400/60" : ""}`}
              />
              {formErrors.name && (
                <p className="text-red-400 text-xs font-sans">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking-email" className="text-foreground/80 text-sm font-medium font-sans">
                {bookingFieldEmail} <span className="text-violet-400">*</span>
              </Label>
              <Input
                id="booking-email"
                type="email"
                placeholder={bookingPlaceholderEmail}
                value={formData.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
                className={`bg-mystic-900/50 border-mystic-700/40 focus:border-violet-500/60 text-foreground placeholder:text-foreground/30 font-sans ${formErrors.email ? "border-red-400/60" : ""}`}
              />
              {formErrors.email && (
                <p className="text-red-400 text-xs font-sans">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking-phone" className="text-foreground/80 text-sm font-medium font-sans">
                {bookingFieldPhone} <span className="text-violet-400">*</span>
              </Label>
              <Input
                id="booking-phone"
                type="tel"
                placeholder={bookingPlaceholderPhone}
                value={formData.phone}
                onChange={(e) => handleFormChange("phone", e.target.value)}
                className={`bg-mystic-900/50 border-mystic-700/40 focus:border-violet-500/60 text-foreground placeholder:text-foreground/30 font-sans ${formErrors.phone ? "border-red-400/60" : ""}`}
              />
              {formErrors.phone && (
                <p className="text-red-400 text-xs font-sans">{formErrors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking-message" className="text-foreground/80 text-sm font-medium font-sans">
                {bookingFieldMessage}
              </Label>
              <Textarea
                id="booking-message"
                placeholder={bookingPlaceholderMessage}
                rows={4}
                value={formData.message}
                onChange={(e) => handleFormChange("message", e.target.value)}
                className="bg-mystic-900/50 border-mystic-700/40 focus:border-violet-500/60 text-foreground placeholder:text-foreground/30 resize-none font-sans"
              />
            </div>

            <Button
              onClick={handleSubmitBooking}
              disabled={formSubmitting}
              className="w-full bg-violet-500 hover:bg-violet-600 text-white font-sans font-semibold py-5 rounded-full transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
            >
              {formSubmitting ? (
                <>
                  <Loader2 className="size-5 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="size-5 mr-2" />
                  {bookingBtnSubmit}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/*                    ADMIN PASSWORD DIALOG                       */}
      {/* ============================================================ */}
      <Dialog
        open={adminPasswordDialogOpen}
        onOpenChange={(open) => {
          setAdminPasswordDialogOpen(open);
          if (!open) setAdminPasswordInput("");
        }}
      >
        <DialogContent className="bg-mystic-950/98 backdrop-blur-xl border-mystic-700/40 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-violet-400 text-xl flex items-center gap-2 font-serif">
              <Lock className="size-5" />
              Panel de Administración
            </DialogTitle>
            <DialogDescription className="text-foreground/60 font-sans">
              Ingresá la contraseña para acceder al panel de
              administración.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label
                htmlFor="admin-password"
                className="text-foreground/80 text-sm font-sans"
              >
                Contraseña
              </Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Ingresá la contraseña..."
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleOpenAdmin();
                }}
                className="bg-mystic-900/50 border-mystic-700/40 focus:border-violet-500/60 text-foreground placeholder:text-foreground/30 font-sans"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setAdminPasswordDialogOpen(false);
                  setAdminPasswordInput("");
                }}
                className="flex-1 border-mystic-700/40 text-foreground/70 hover:text-foreground hover:bg-mystic-900/50 font-sans"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleOpenAdmin}
                disabled={!adminPasswordInput.trim()}
                className="flex-1 bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-400/30 font-semibold transition-all duration-200 disabled:opacity-50 font-sans"
              >
                Acceder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/*                       ADMIN PANEL                              */}
      {/* ============================================================ */}
      <Dialog open={adminOpen} onOpenChange={setAdminOpen}>
        <DialogContent className="bg-mystic-950/98 backdrop-blur-xl border-mystic-700/40 w-[95vw] max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-violet-400 text-2xl flex items-center gap-2 font-serif">
                <Shield className="size-6" />
                Panel de Administración
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAdminOpen(false)}
                className="text-foreground/60 hover:text-violet-400"
              >
                <X className="size-5" />
              </Button>
            </div>
            <DialogDescription className="text-foreground/60 font-sans">
              Gestión de reservas de lecturas akáshicas
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-4 mt-2">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
              <div className="glass rounded-xl p-4 border border-mystic-700/30">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <FileText className="size-4 text-violet-400" />
                  </div>
                  <span className="text-foreground/60 text-xs font-medium font-sans">
                    Total reservas
                  </span>
                </div>
                <p className="text-2xl font-bold text-violet-400 font-serif">
                  {adminStats.total}
                </p>
              </div>
              <div className="glass rounded-xl p-4 border border-mystic-700/30">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Clock className="size-4 text-yellow-400" />
                  </div>
                  <span className="text-foreground/60 text-xs font-medium font-sans">
                    Pendientes
                  </span>
                </div>
                <p className="text-2xl font-bold text-yellow-400 font-serif">
                  {adminStats.pendiente}
                </p>
              </div>
              <div className="glass rounded-xl p-4 border border-mystic-700/30">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <CalendarCheck className="size-4 text-blue-400" />
                  </div>
                  <span className="text-foreground/60 text-xs font-medium font-sans">
                    Confirmadas
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-400 font-serif">
                  {adminStats.confirmada}
                </p>
              </div>
              <div className="glass rounded-xl p-4 border border-mystic-700/30">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Check className="size-4 text-green-400" />
                  </div>
                  <span className="text-foreground/60 text-xs font-medium font-sans">
                    Enviadas
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-400 font-serif">
                  {adminStats.enviada}
                </p>
              </div>
            </div>

            {/* ── Form Toggles ── */}
            <div className="glass rounded-xl border border-mystic-700/30 p-4 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Power className="size-4 text-violet-400" />
                  <span className="text-sm font-medium text-foreground/80 font-sans">
                    Control de Formularios
                  </span>
                  {togglesLoading && (
                    <Loader2 className="size-3.5 text-violet-400 animate-spin" />
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePauseAll}
                    disabled={togglesLoading}
                    className="h-7 text-[11px] px-2.5 border-red-400/30 text-red-400 hover:bg-red-400/10 hover:text-red-300 font-sans"
                  >
                    Pausar todos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResumeAll}
                    disabled={togglesLoading}
                    className="h-7 text-[11px] px-2.5 border-green-400/30 text-green-400 hover:bg-green-400/10 hover:text-green-300 font-sans"
                  >
                    Activar todos
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {Object.entries(formLabels).map(([key, label]) => {
                  const isOn = formToggles[key] !== false;
                  return (
                    <button
                      key={key}
                      onClick={() => handleToggleForm(key)}
                      disabled={togglesLoading}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all duration-200 ${
                        isOn
                          ? "bg-green-500/10 border-green-400/30 text-green-300 hover:bg-green-500/15"
                          : "bg-red-500/10 border-red-400/30 text-red-300 hover:bg-red-500/15"
                      }`}
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          isOn ? "bg-green-400 shadow-sm shadow-green-400/50" : "bg-red-400"
                        }`}
                      />
                      <span className="text-xs font-sans truncate">{label}</span>
                    </button>
                  );
                })}
              </div>
              {/* Custom pause message */}
              <div className="mt-3 flex gap-2">
                <Input
                  value={pauseMessage}
                  onChange={(e) => setPauseMessage(e.target.value)}
                  placeholder="Mensaje que ven los usuarios cuando un formulario está pausado..."
                  className="flex-1 h-8 text-xs bg-mystic-900/50 border-mystic-700/30 focus:border-violet-400/50 text-foreground/80 placeholder:text-foreground/30 font-sans"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSavePauseMessage}
                  disabled={togglesLoading || !pauseMessage.trim()}
                  className="h-8 text-[11px] px-3 border-violet-400/30 text-violet-400 hover:bg-violet-400/10 font-sans shrink-0"
                >
                  Guardar
                </Button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="shrink-0">
              <Tabs value={adminFilter} onValueChange={setAdminFilter}>
                <TabsList className="bg-mystic-900/50 border border-mystic-700/30 flex-wrap h-auto gap-1 p-1">
                  <TabsTrigger value="todos" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400 text-foreground/60 text-xs px-3 py-1.5 font-sans">
                    Todos
                  </TabsTrigger>
                  <TabsTrigger value="pendiente" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400 text-foreground/60 text-xs px-3 py-1.5 font-sans">
                    Pendiente
                  </TabsTrigger>
                  <TabsTrigger value="confirmada" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 text-foreground/60 text-xs px-3 py-1.5 font-sans">
                    Confirmada
                  </TabsTrigger>
                  <TabsTrigger value="en_progreso" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 text-foreground/60 text-xs px-3 py-1.5 font-sans">
                    En Progreso
                  </TabsTrigger>
                  <TabsTrigger value="enviada" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-foreground/60 text-xs px-3 py-1.5 font-sans">
                    Enviada
                  </TabsTrigger>
                  <TabsTrigger value="cancelada" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 text-foreground/60 text-xs px-3 py-1.5 font-sans">
                    Cancelada
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Bookings List */}
            <div className="flex-1 overflow-hidden">
              {adminLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-8 text-violet-400 animate-spin" />
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="size-12 text-mystic-700 mb-3" />
                  <p className="text-foreground/50 text-sm font-sans">
                    {adminFilter === "todos"
                      ? "No hay reservas registradas"
                      : `No hay reservas con estado "${adminFilter}"`}
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-full max-h-[50vh]">
                  <div className="space-y-2 pr-4">
                    {filteredBookings.map((booking: any) => {
                      const sc =
                        statusConfig[booking.status] || statusConfig.pendiente;
                      const deadlineInfo = getDeadlineInfo(booking);
                      return (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="glass rounded-xl p-4 border border-mystic-700/20 hover:border-mystic-700/50 transition-all duration-200 cursor-pointer"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-foreground font-semibold text-sm truncate font-sans">
                                  {booking.name}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`${sc.bg} ${sc.text} ${sc.border} text-[10px] px-1.5 py-0 border font-sans`}
                                >
                                  {booking.readingType}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`${sc.bg} ${sc.text} ${sc.border} text-[10px] px-1.5 py-0 border font-sans`}
                                >
                                  {sc.label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-foreground/50 font-sans">
                                <span className="flex items-center gap-1">
                                  <Calendar className="size-3" />
                                  {formatBookingDate(booking.createdAt)}
                                </span>
                                {deadlineInfo && (
                                  <span
                                    className={`flex items-center gap-1 ${
                                      deadlineInfo.isOverdue
                                        ? "text-red-400"
                                        : deadlineInfo.daysRemaining <= 2
                                        ? "text-yellow-400"
                                        : "text-green-400"
                                    }`}
                                  >
                                    <AlertTriangle className="size-3" />
                                    {deadlineInfo.isOverdue
                                      ? `Vencida hace ${Math.abs(deadlineInfo.daysRemaining)} días`
                                      : `${deadlineInfo.daysRemaining} días restantes`}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {booking.status === "pendiente" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 font-sans"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(booking.id, "confirmada");
                                  }}
                                >
                                  Confirmar
                                </Button>
                              )}
                              {booking.status === "confirmada" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 font-sans"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(
                                      booking.id,
                                      "en_progreso"
                                    );
                                  }}
                                >
                                  Iniciar
                                </Button>
                              )}
                              {booking.status === "en_progreso" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs text-green-400 hover:text-green-300 hover:bg-green-500/10 font-sans"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(booking.id, "enviada");
                                  }}
                                >
                                  Marcar Enviada
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 font-sans"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBooking(booking);
                                }}
                              >
                                <Eye className="size-3 mr-1" />
                                Ver
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Detail Sheet */}
      <Sheet
        open={!!selectedBooking}
        onOpenChange={(open) => {
          if (!open) setSelectedBooking(null);
        }}
      >
        <SheetContent
          side="right"
          className="bg-mystic-950/98 backdrop-blur-xl border-mystic-700/40 w-[95vw] max-w-[500px] overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle className="text-violet-400 font-serif text-xl flex items-center gap-2">
              <Eye className="size-5" />
              Detalle de Reserva
            </SheetTitle>
            <SheetDescription className="text-foreground/60 font-sans">
              Información completa de la reserva
            </SheetDescription>
          </SheetHeader>

          {selectedBooking && (
            <div className="space-y-6 mt-6">
              {/* Status */}
              {(() => {
                const sc =
                  statusConfig[selectedBooking.status] ||
                  statusConfig.pendiente;
                return (
                  <div className="space-y-2">
                    <Label className="text-foreground/80 text-sm font-medium font-sans">
                      Estado
                    </Label>
                    <Select
                      value={selectedBooking.status}
                      onValueChange={(val) =>
                        handleStatusChange(selectedBooking.id, val)
                      }
                    >
                      <SelectTrigger className="bg-mystic-900/50 border-mystic-700/40 focus:border-violet-500/60 text-foreground font-sans">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-mystic-950 border-mystic-700/40">
                        <SelectItem
                          value="pendiente"
                          className="text-foreground focus:bg-mystic-800/50 focus:text-yellow-300 font-sans"
                        >
                          Pendiente
                        </SelectItem>
                        <SelectItem
                          value="confirmada"
                          className="text-foreground focus:bg-mystic-800/50 focus:text-blue-300 font-sans"
                        >
                          Confirmada
                        </SelectItem>
                        <SelectItem
                          value="en_progreso"
                          className="text-foreground focus:bg-mystic-800/50 focus:text-orange-300 font-sans"
                        >
                          En Progreso
                        </SelectItem>
                        <SelectItem
                          value="enviada"
                          className="text-foreground focus:bg-mystic-800/50 focus:text-green-300 font-sans"
                        >
                          Enviada
                        </SelectItem>
                        <SelectItem
                          value="cancelada"
                          className="text-foreground focus:bg-mystic-800/50 focus:text-red-300 font-sans"
                        >
                          Cancelada
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge
                      variant="outline"
                      className={`${sc.bg} ${sc.text} ${sc.border} text-xs px-2 py-0.5 border font-sans`}
                    >
                      {sc.label}
                    </Badge>
                  </div>
                );
              })()}

              {/* Client Info */}
              <div className="space-y-3">
                <h4 className="text-violet-400 font-semibold text-sm flex items-center gap-2 font-sans">
                  <Users className="size-4" />
                  Datos del Cliente
                </h4>
                <div className="glass rounded-xl p-4 border border-mystic-700/20 space-y-2">
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-foreground/60">Nombre</span>
                    <span className="text-foreground font-medium">
                      {selectedBooking.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-foreground/60">Email</span>
                    <span className="text-foreground font-medium">
                      {selectedBooking.email}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-foreground/60">Teléfono</span>
                    <span className="text-foreground font-medium">
                      {selectedBooking.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking Info */}
              <div className="space-y-3">
                <h4 className="text-violet-400 font-semibold text-sm flex items-center gap-2 font-sans">
                  <BookOpen className="size-4" />
                  Datos de la Reserva
                </h4>
                <div className="glass rounded-xl p-4 border border-mystic-700/20 space-y-2">
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-foreground/60">Estado</span>
                    <span
                      className={`font-medium ${
                        statusConfig[selectedBooking.status]?.text ||
                        "text-foreground"
                      }`}
                    >
                      {statusConfig[selectedBooking.status]?.label ||
                        selectedBooking.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-foreground/60">Creada</span>
                    <span className="text-foreground font-medium">
                      {formatBookingDate(selectedBooking.createdAt)}
                    </span>
                  </div>
                  {getDeadlineInfo(selectedBooking) &&
                    (() => {
                      const dl = getDeadlineInfo(selectedBooking)!;
                      return (
                        <div className="flex justify-between text-sm font-sans">
                          <span className="text-foreground/60">
                            Fecha límite
                          </span>
                          <span
                            className={`font-medium ${
                              dl.isOverdue
                                ? "text-red-400"
                                : dl.daysRemaining <= 2
                                ? "text-yellow-400"
                                : "text-green-400"
                            }`}
                          >
                            {dl.formattedDeadline}
                            <span className="text-xs ml-1">
                              (
                              {dl.isOverdue
                                ? "vencida"
                                : `${dl.daysRemaining}d restantes`}
                              )
                            </span>
                          </span>
                        </div>
                      );
                    })()}
                </div>
              </div>

              {/* Message */}
              {selectedBooking.message && (
                <div className="space-y-3">
                  <h4 className="text-violet-400 font-semibold text-sm flex items-center gap-2 font-sans">
                    <MessageCircle className="size-4" />
                    Mensaje / Pregunta
                  </h4>
                  <div className="glass rounded-xl p-4 border border-mystic-700/20">
                    <p className="text-foreground/80 text-sm leading-relaxed font-sans">
                      {selectedBooking.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label className="text-foreground/80 text-sm font-medium font-sans">
                  Notas del administrador
                </Label>
                <Textarea
                  placeholder="Agregá notas internas sobre esta reserva..."
                  rows={3}
                  defaultValue={selectedBooking.adminNotes || ""}
                  onChange={(e) => {
                    setSelectedBooking({
                      ...selectedBooking,
                      adminNotes: e.target.value,
                    });
                  }}
                  className="bg-mystic-900/50 border-mystic-700/40 focus:border-violet-500/60 text-foreground placeholder:text-foreground/30 resize-none font-sans"
                />
              </div>

              <Separator className="bg-mystic-800/30" />

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  className="w-full bg-violet-500 hover:bg-violet-600 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 font-sans"
                  onClick={() => {
                    if (selectedBooking.clientWhatsAppLink) {
                      window.open(
                        selectedBooking.clientWhatsAppLink,
                        "_blank"
                      );
                    } else {
                      const phone =
                        selectedBooking.phone?.replace(/[^0-9]/g, "") || "";
                      window.open(`https://wa.me/${phone}`, "_blank");
                    }
                  }}
                >
                  <MessageCircle className="size-4" />
                  Contactar por WhatsApp
                </Button>

                {selectedBooking.status === "confirmada" &&
                  selectedBooking.googleCalendarLink && (
                    <Button
                      variant="outline"
                      className="w-full border-blue-400/30 text-blue-400 hover:bg-blue-400/10 hover:text-blue-300 font-medium py-3 rounded-xl flex items-center justify-center gap-2 font-sans"
                      onClick={() =>
                        window.open(
                          selectedBooking.googleCalendarLink,
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="size-4" />
                      Agendar en Google Calendar
                    </Button>
                  )}

                {selectedBooking.status === "pendiente" && (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 font-sans"
                    onClick={() =>
                      handleStatusChange(selectedBooking.id, "confirmada")
                    }
                  >
                    <CalendarCheck className="size-4" />
                    Marcar como Confirmada
                  </Button>
                )}

                {selectedBooking.status === "confirmada" && (
                  <Button
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 font-sans"
                    onClick={() =>
                      handleStatusChange(selectedBooking.id, "en_progreso")
                    }
                  >
                    <Clock className="size-4" />
                    Marcar como En Progreso
                  </Button>
                )}

                {selectedBooking.status === "en_progreso" && (
                  <Button
                    className="w-full bg-violet-500 hover:bg-violet-600 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 font-sans"
                    onClick={() =>
                      handleStatusChange(selectedBooking.id, "enviada")
                    }
                  >
                    <Check className="size-4" />
                    Marcar como Enviada
                  </Button>
                )}

                <Separator className="bg-mystic-800/30" />

                <Button
                  variant="ghost"
                  className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 font-medium py-3 rounded-xl flex items-center justify-center gap-2 font-sans"
                  onClick={() => handleDeleteBooking(selectedBooking.id)}
                >
                  <Trash2 className="size-4" />
                  Eliminar Reserva
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>



      {/* Scroll to top button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
            className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 text-violet-400 flex items-center justify-center shadow-lg backdrop-blur-sm transition-colors"
            aria-label="Volver arriba"
          >
            <ArrowUp className="size-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp button */}
      <a
        href={`https://wa.me/${contactWhatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-violet-500 hover:bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-900/30 transition-all duration-300 hover:scale-110"
        aria-label="Contactar por WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
}
