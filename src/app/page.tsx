"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
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
  Star,
  ShoppingBag,
  Instagram,
  Menu,
  Plus,
  Minus,
  Trash2,
  BookOpen,
  Eye,
  Sparkles,
  ArrowUp,
  ChevronRight,
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
  ChevronDown,
} from "lucide-react";
import Image from "next/image";

/* -------------------------------------------------------------------------- */
/*                                    DATA                                    */
/* -------------------------------------------------------------------------- */

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

const products: Product[] = [
  {
    id: 1,
    name: "Amatista",
    price: 15000,
    image: "/images/amethyst.png",
    description:
      "Protección y paz interior. Ideal para meditación y conexión espiritual.",
    category: "Amatista",
  },
  {
    id: 2,
    name: "Cuarzo Rosa",
    price: 12000,
    image: "/images/rose-quartz.png",
    description:
      "Amor propio y sanación emocional. Atrae energías de amor y compasión.",
    category: "Cuarzo Rosa",
  },
  {
    id: 3,
    name: "Cuarzo Claro",
    price: 10000,
    image: "/images/clear-quartz.png",
    description:
      "Amplificador energético universal. Limpieza y armonización de chakras.",
    category: "Cuarzo Claro",
  },
  {
    id: 4,
    name: "Citrino",
    price: 13000,
    image: "/images/citrine.png",
    description:
      "Prosperidad y abundancia. Estimula la creatividad y la autoconfianza.",
    category: "Citrino",
  },
  {
    id: 5,
    name: "Turmalina Negra",
    price: 11000,
    image: "/images/tourmaline.png",
    description:
      "Protección contra energías negativas. Radicación y conexión a tierra.",
    category: "Turmalina",
  },
  {
    id: 6,
    name: "Selinita",
    price: 14000,
    image: "/images/selenite.png",
    description:
      "Paz y claridad mental. Conexión con guías espirituales y ángeles.",
    category: "Selinita",
  },
];

const courses = [
  {
    name: "Nivel Inicial",
    description: "Aprendé a conectarte con tus Registros",
    duration: "8 semanas",
    price: 25000,
    features: [
      "Introducción a los Registros Akáshicos",
      "Técnicas de meditación y conexión",
      "Apertura de tu propio registro",
      "Lectura de tu alma y vidas pasadas",
      "Material de estudio incluido",
      "Certificado de finalización",
    ],
  },
  {
    name: "Nivel Intermedio",
    description: "Profundización y lecturas a otros",
    duration: "10 semanas",
    price: 35000,
    features: [
      "Profundización en la lectura akáshica",
      "Técnicas de lectura a terceros",
      "Interpretación de bloqueos kármicos",
      "Sanación a través de los registros",
      "Prácticas supervisadas en vivo",
      "Certificado de nivel intermedio",
    ],
  },
  {
    name: "Nivel Avanzado",
    description: "Maestría y enseñanza",
    duration: "12 semanas",
    price: 45000,
    features: [
      "Maestría en Registros Akáshicos",
      "Técnicas de enseñanza y transmisión",
      "Canalización avanzada",
      "Trabajo con guías y maestros ascendidos",
      "Proyecto final de certificación",
      "Certificado de Maestría",
    ],
  },
];

const readings = [
  {
    name: "Lectura Akáshica Individual",
    description:
      "Accedemos a los Registros de tu alma para revelar el propósito de tu ser, patrones kármicos y el camino hacia tu mayor potencial. Es una experiencia personal e íntima, grabada especialmente para vos.",
    icon: Eye,
    features: [
      "Lectura personalizada e individual",
      "Grabación de audio incluida",
      "Enviada por email dentro de los 5 días hábiles",
      "Guía escrita de los mensajes recibidos",
      "Pregunta focal incluida",
    ],
  },
];

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

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Lecturas", href: "#lecturas" },
  { label: "Cursos", href: "#cursos" },
  { label: "Cristales", href: "#cristales" },
];

const crystalCategories = [
  "Todos",
  "Amatista",
  "Cuarzo Rosa",
  "Cuarzo Claro",
  "Citrino",
  "Turmalina",
  "Selinita",
];

/* -------------------------------------------------------------------------- */
/*                               ANIMATION VARS                               */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                            SECTION WRAPPER                                 */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                  MAIN PAGE                                 */
/* -------------------------------------------------------------------------- */

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [navScrolled, setNavScrolled] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  /* ---- Admin state ---- */
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminBookings, setAdminBookings] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState({ total: 0, pendiente: 0, confirmada: 0, en_progreso: 0, enviada: 0, cancelada: 0 });
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminFilter, setAdminFilter] = useState("todos");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  /* ---- Logo triple-click refs ---- */
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---- Nav scroll effect ---- */
  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 40);
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

  /* ---- Cart operations ---- */
  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} agregado al carrito`, {
      description: `$${product.price.toLocaleString("es-AR")} ARS`,
    });
  }, []);

  const updateQuantity = useCallback((id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts =
    activeCategory === "Todos"
      ? products
      : products.filter((p) => p.category === activeCategory);

  /* ---- Floating stars ---- */
  const stars = Array.from({ length: 20 }, (_, i) => ({
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

  const handleFormChange = (
    field: string,
    value: string
  ) => {
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
          description: "Recibiremos tu lectura grabada por email en los próximos 5 días hábiles.",
          duration: 6000,
        });
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
        });
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
          pendiente: bookings.filter((b: any) => b.status === "pendiente").length,
          confirmada: bookings.filter((b: any) => b.status === "confirmada").length,
          en_progreso: bookings.filter((b: any) => b.status === "en_progreso").length,
          enviada: bookings.filter((b: any) => b.status === "enviada").length,
          cancelada: bookings.filter((b: any) => b.status === "cancelada").length,
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
    if (!window.confirm("¿Estás segura de que querés eliminar esta reserva? Esta acción no se puede deshacer.")) return;
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
    setAdminOpen(true);
    fetchAdminData();
  };

  const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
    pendiente: { label: "Pendiente", bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
    confirmada: { label: "Confirmada", bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
    en_progreso: { label: "En Progreso", bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
    enviada: { label: "Enviada", bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
    cancelada: { label: "Cancelada", bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
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
      formattedDeadline: deadline.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" }),
    };
  };

  const filteredBookings = adminFilter === "todos"
    ? adminBookings
    : adminBookings.filter((b: any) => b.status === adminFilter);

  /* ------------------------------------------------------------------ */
  /*                        RETURN JSX                                   */
  /* ------------------------------------------------------------------ */

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#161310",
            color: "#f0ebe5",
            border: "1px solid #2a252066",
            fontFamily: "var(--font-josefin), sans-serif",
          },
        }}
      />

      {/* ============================================================ */}
      {/*                       NAVIGATION BAR                          */}
      {/* ============================================================ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          navScrolled
            ? "glass shadow-lg"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          {/* Logo */}
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("#inicio");
              logoClickCount.current++;
              if (logoClickCount.current >= 3) {
                logoClickCount.current = 0;
                handleOpenAdmin();
                return;
              }
              if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
              logoClickTimer.current = setTimeout(() => { logoClickCount.current = 0; }, 800);
            }}
            className="flex items-center gap-2"
          >
            <Image
              src="/images/logo-etersomos.jpg"
              alt="Eter Somos Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="text-gold-400 font-serif font-semibold text-lg tracking-[0.2em] uppercase">
              ETER SOMOS
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="text-sm text-foreground/70 hover:text-gold-400 transition-colors duration-200 font-medium"
              >
                {link.label}
              </button>
            ))}
            <a
              href="https://instagram.com/etersomos"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/70 hover:text-gold-400 transition-colors duration-200"
              aria-label="Instagram"
            >
              <Instagram className="size-5" />
            </a>
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center gap-3">
            <a
              href="https://instagram.com/etersomos"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/70 hover:text-gold-400 transition-colors duration-200"
              aria-label="Instagram"
            >
              <Instagram className="size-5" />
            </a>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground/70 hover:text-gold-400">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-mystic-950/95 backdrop-blur-xl border-mystic-800/30 w-72"
              >
                <SheetHeader>
                  <SheetTitle className="text-gold-400 font-serif tracking-[0.2em] uppercase">
                    ETER SOMOS
                  </SheetTitle>
                  <SheetDescription className="text-foreground/60">
                    Navegación
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-8">
                  {navLinks.map((link) => (
                    <button
                      key={link.href}
                      onClick={() => scrollTo(link.href)}
                      className="flex items-center justify-between px-4 py-3 rounded-lg text-foreground/80 hover:text-gold-400 hover:bg-mystic-900/50 transition-all duration-200"
                    >
                      {link.label}
                      <ChevronRight className="size-4" />
                    </button>
                  ))}
                  <Separator className="bg-mystic-800/30 my-4" />
                  <a
                    href="https://instagram.com/etersomos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/80 hover:text-gold-400 hover:bg-mystic-900/50 transition-all duration-200"
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
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/hero-bg.png?v=4')" }}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-mystic-950/80" />

        {/* Bottom fade to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent z-[1]" />

        {/* Floating stars */}
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-gold-300 animate-twinkle pointer-events-none"
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
            <motion.div variants={fadeInUp} transition={{ duration: 0.8 }}>
              <div className="mx-auto mb-8 w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-full overflow-hidden animate-float shadow-lg shadow-black/30 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo-etersomos.jpg"
                  alt="Eter Somos"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-semibold text-foreground tracking-wider mb-4"
            >
              Eter Somos
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl sm:text-2xl md:text-3xl text-foreground/60 font-serif font-light mb-6"
            >
              Descubre la sabiduría ancestral de tus Registros Akáshicos
            </motion.p>

            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-base sm:text-lg text-foreground/60 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Sumergite en un viaje transformador hacia tu esencia más pura. A
              través de los Registros Akáshicos, accedé a la memoria del alma y
              descubrí el propósito divino que te trajo a esta vida.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                onClick={() => scrollTo("#lecturas")}
                className="bg-foreground hover:bg-foreground/80 text-background font-serif text-base px-8 py-6 rounded-full transition-all duration-300 hover:scale-105"
              >
                Pedí tu Lectura
                <ArrowRight className="size-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollTo("#cristales")}
                className="border-foreground/20 text-foreground/80 hover:bg-foreground/5 hover:text-foreground font-semibold font-serif text-base px-8 py-6 rounded-full transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="size-5 mr-2" />
                Ver Cristales
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-gold-400/40 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 rounded-full bg-gold-400/60" />
          </div>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/*                      ABOUT SECTION                            */}
      {/* ============================================================ */}
      <AnimatedSection
        id="sobre"
        className="py-20 sm:py-28 px-4 sm:px-6"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={staggerItem} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-gold-400 mb-4">
              ¿Qué son los Registros Akáshicos?
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto text-lg">
              Una biblioteca cósmica que contiene la historia completa de tu
              alma, desde su creación hasta el presente.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: "¿Qué son?",
                description:
                  "Los Registros Akáshicos son una dimensión energética que almacena cada pensamiento, emoción, palabra y acción de todas las almas a lo largo de la existencia. Es como una biblioteca universal del conocimiento.",
              },
              {
                icon: Eye,
                title: "¿Cómo funciona la lectura?",
                description:
                  "A través de una conexión sagrada y una pregunta específica, accedemos a los registros de tu alma para recibir mensajes, guía y revelaciones de tus Maestros y Guías Espirituales.",
              },
              {
                icon: Sparkles,
                title: "Beneficios",
                description:
                  "Experimentás mayor claridad, sanación de patrones repetitivos, comprensión profunda de tu misión de vida, liberación de bloqueos kármicos y una reconexión con tu esencia divina.",
              },
            ].map((card) => (
              <motion.div key={card.title} variants={staggerItem}>
                <Card className="glass hover:glow-mystic transition-all duration-500 group h-full border-mystic-700/30">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-14 h-14 rounded-full bg-mystic-800/60 flex items-center justify-center mb-2 group-hover:bg-mystic-700/60 transition-colors duration-300">
                      <card.icon className="size-7 text-gold-400" />
                    </div>
                    <CardTitle className="text-xl text-gold-300">
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/60 leading-relaxed text-center">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ============================================================ */}
      {/*                     LECTURA SECTION                           */}
      {/* ============================================================ */}
      <section
        id="lecturas"
        className="relative py-20 sm:py-28 px-4 sm:px-6 overflow-hidden"
      >
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/akashic-bg.png')" }}
        />
        <div className="absolute inset-0 bg-mystic-950/80" />
        {/* Top fade from previous section */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent z-[1]" />
        {/* Bottom fade to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[1]" />

        <AnimatedSection className="relative z-10 max-w-6xl mx-auto">
          <motion.div variants={staggerItem} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-gold-400 mb-4">
              Pedí tu Lectura Akáshica
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto text-lg">
              Cada lectura es una experiencia única y personal. Accedemos a los
              Registros de tu alma para revelar mensajes que tu ser necesita
              escuchar en este momento.
            </p>
          </motion.div>

          <div className="max-w-lg mx-auto mb-12">
            {readings.map((reading) => (
              <motion.div key={reading.name} variants={staggerItem}>
                <Card className="glass hover:glow-gold transition-all duration-500 group border-mystic-700/30">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-14 h-14 rounded-full bg-gold-500/10 flex items-center justify-center mb-2 group-hover:bg-gold-500/20 transition-colors duration-300">
                      <reading.icon className="size-7 text-gold-400" />
                    </div>
                    <CardTitle className="text-xl text-gold-300">
                      {reading.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/60 leading-relaxed mb-4 text-sm">
                      {reading.description}
                    </p>
                    <ul className="space-y-2">
                      {reading.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-foreground/70"
                        >
                          <Check className="size-4 text-gold-400 shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div variants={staggerItem} className="text-center">
            <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-foreground hover:bg-foreground/80 text-background font-serif font-semibold text-lg px-10 py-7 rounded-full transition-all duration-300 hover:scale-105"
                >
                  <Calendar className="size-5 mr-2" />
                  Reservar mi Lectura
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-mystic-950/98 backdrop-blur-xl border-mystic-700/40 sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-gold-400 font-serif text-2xl flex items-center gap-2">
                    <Sparkles className="size-5" />
                    Reservá tu Lectura
                  </DialogTitle>
                  <DialogDescription className="text-foreground/60">
                    Completá el formulario y recibiremos tu lectura grabada por email dentro de los próximos 5 días hábiles.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                  {/* Nombre */}
                  <div className="space-y-2">
                    <Label htmlFor="booking-name" className="text-foreground/80 text-sm font-medium">
                      Nombre completo <span className="text-gold-400">*</span>
                    </Label>
                    <Input
                      id="booking-name"
                      placeholder="Ej: María González"
                      value={formData.name}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                      className={`bg-mystic-900/50 border-mystic-700/40 focus:border-gold-400/60 text-foreground placeholder:text-foreground/30 ${formErrors.name ? "border-red-400/60" : ""}`}
                    />
                    {formErrors.name && (
                      <p className="text-red-400 text-xs">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="booking-email" className="text-foreground/80 text-sm font-medium">
                      Email <span className="text-gold-400">*</span>
                    </Label>
                    <Input
                      id="booking-email"
                      type="email"
                      placeholder="Ej: maria@ejemplo.com"
                      value={formData.email}
                      onChange={(e) => handleFormChange("email", e.target.value)}
                      className={`bg-mystic-900/50 border-mystic-700/40 focus:border-gold-400/60 text-foreground placeholder:text-foreground/30 ${formErrors.email ? "border-red-400/60" : ""}`}
                    />
                    {formErrors.email && (
                      <p className="text-red-400 text-xs">{formErrors.email}</p>
                    )}
                  </div>

                  {/* Teléfono */}
                  <div className="space-y-2">
                    <Label htmlFor="booking-phone" className="text-foreground/80 text-sm font-medium">
                      Teléfono / WhatsApp <span className="text-gold-400">*</span>
                    </Label>
                    <Input
                      id="booking-phone"
                      type="tel"
                      placeholder="Ej: 1155123456"
                      value={formData.phone}
                      onChange={(e) => handleFormChange("phone", e.target.value)}
                      className={`bg-mystic-900/50 border-mystic-700/40 focus:border-gold-400/60 text-foreground placeholder:text-foreground/30 ${formErrors.phone ? "border-red-400/60" : ""}`}
                    />
                    {formErrors.phone && (
                      <p className="text-red-400 text-xs">{formErrors.phone}</p>
                    )}
                  </div>

                  {/* Indicación de plazo */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gold-500/10 border border-gold-400/20">
                    <Clock className="size-5 text-gold-400 shrink-0" />
                    <p className="text-sm text-foreground/70 leading-relaxed">
                      Tu lectura será grabada y enviada por email dentro de los <span className="font-semibold text-gold-300">5 días hábiles</span> posteriores a la solicitud.
                    </p>
                  </div>

                  {/* Mensaje / Pregunta */}
                  <div className="space-y-2">
                    <Label htmlFor="booking-message" className="text-foreground/80 text-sm font-medium">
                      Mensaje o pregunta para la lectura
                    </Label>
                    <Textarea
                      id="booking-message"
                      placeholder="Contanos qué te gustaría explorar en tu lectura, alguna pregunta específica o inquietud..."
                      rows={4}
                      value={formData.message}
                      onChange={(e) => handleFormChange("message", e.target.value)}
                      className="bg-mystic-900/50 border-mystic-700/40 focus:border-gold-400/60 text-foreground placeholder:text-foreground/30 resize-none"
                    />
                  </div>

                  <Separator className="bg-mystic-800/30" />

                  {/* Submit */}
                  <Button
                    onClick={handleSubmitBooking}
                    disabled={formSubmitting}
                    className="w-full bg-foreground hover:bg-foreground/80 text-background font-serif font-semibold text-base py-6 rounded-full transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {formSubmitting ? (
                      <>
                        <Loader2 className="size-5 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="size-5 mr-2" />
                        Solicitar mi Lectura
                      </>
                    )}
                  </Button>

                  <p className="text-center text-foreground/40 text-xs">
                    Al enviar, aceptás que te enviemos la lectura grabada al email indicado.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </AnimatedSection>
      </section>

      {/* ============================================================ */}
      {/*                      CURSOS SECTION                           */}
      {/* ============================================================ */}
      <AnimatedSection
        id="cursos"
        className="py-20 sm:py-28 px-4 sm:px-6"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={staggerItem} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-gold-400 mb-4">
              Cursos de Registros Akáshicos
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto text-lg">
              Aprendé a acceder a la sabiduría de tu alma y transformá tu vida
              con nuestra formación completa en tres niveles.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((course, idx) => (
              <motion.div key={course.name} variants={staggerItem}>
                <Card
                  className={`glass h-full border-mystic-700/30 hover:glow-mystic transition-all duration-500 flex flex-col ${
                    idx === 2 ? "md:-translate-y-4 ring-1 ring-gold-400/20" : ""
                  }`}
                >
                  {idx === 2 && (
                    <div className="mx-auto mt-0">
                      <Badge className="bg-gold-500/20 text-gold-300 font-serif font-semibold px-3 py-1 text-xs">
                        Más Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pt-4">
                    <CardTitle className="text-2xl text-gold-300">
                      {course.name}
                    </CardTitle>
                    <CardDescription className="text-foreground/60 text-base">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <span className="flex items-center gap-1.5 text-sm text-foreground/60">
                        <Clock className="size-4 text-gold-400" />
                        {course.duration}
                      </span>
                      <span className="text-2xl font-serif font-bold text-gold-400">
                        {formatPrice(course.price)}
                      </span>
                    </div>
                    <Separator className="bg-mystic-800/30 mb-4" />
                    <ul className="space-y-2.5">
                      {course.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-foreground/70"
                        >
                          <Check className="size-4 text-gold-400 shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button
                      className="w-full bg-foreground hover:bg-foreground/80 text-background font-serif font-semibold rounded-full py-5 transition-all duration-300"
                      onClick={() => {
                        toast.info(
                          `¡Te interesa ${course.name}! Pronto abriremos inscripciones.`,
                          { description: "Dejanos tu mail para avisarte." }
                        );
                      }}
                    >
                      Inscribirme
                      <ArrowRight className="size-4 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ============================================================ */}
      {/*                    TIENDA DE CRISTALES                         */}
      {/* ============================================================ */}
      <section
        id="cristales"
        className="relative py-20 sm:py-28 px-4 sm:px-6 overflow-hidden"
      >
        {/* Banner Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/crystals-banner.png')" }}
        />
        <div className="absolute inset-0 bg-mystic-950/80" />
        {/* Top fade from previous section */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent z-[1]" />
        {/* Bottom fade to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[1]" />

        <AnimatedSection className="relative z-10 max-w-6xl mx-auto">
          <motion.div variants={staggerItem} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-gold-400 mb-4">
              Tienda de Cristales
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto text-lg">
              Cada cristal es seleccionado con amor e intención. Encontrá la
              piedra perfecta para acompañar tu camino espiritual.
            </p>
          </motion.div>

          {/* Filter Tabs */}
          <motion.div variants={staggerItem} className="mb-10">
            <Tabs
              defaultValue="Todos"
              value={activeCategory}
              onValueChange={setActiveCategory}
            >
              <TabsList className="flex flex-wrap justify-center gap-1 bg-mystic-900/50 p-1 rounded-xl border border-mystic-800/30">
                {crystalCategories.map((cat) => (
                  <TabsTrigger
                    key={cat}
                    value={cat}
                    className={`rounded-lg px-3 py-2 text-sm data-[state=active]:bg-gold-500/20 data-[state=active]:text-gold-300 text-foreground/60 ${
                      cat === activeCategory
                        ? "data-[state=active]:bg-gold-500/20 data-[state=active]:text-gold-300"
                        : "hover:text-foreground/80"
                    }`}
                  >
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Product Grid */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={staggerItem}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="glass hover:glow-mystic transition-all duration-500 group h-full border-mystic-700/30 flex flex-col">
                    <div className="relative aspect-square overflow-hidden rounded-t-xl">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-mystic-950/60 to-transparent" />
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-gold-300">
                          {product.name}
                        </CardTitle>
                        <span className="text-gold-400 font-serif font-semibold text-lg">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-foreground/60 text-sm leading-relaxed">
                        {product.description}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full bg-foreground hover:bg-foreground/80 text-background font-serif font-semibold rounded-full py-5 transition-all duration-300"
                        onClick={() => addToCart(product)}
                      >
                        <ShoppingBag className="size-4 mr-2" />
                        Agregar al carrito
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </AnimatedSection>
      </section>

      {/* ============================================================ */}
      {/*                    TESTIMONIALS SECTION                        */}
      {/* ============================================================ */}
      <AnimatedSection className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={staggerItem} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-gold-400 mb-4">
              Lo que dicen nuestros consultantes
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto text-lg">
              Historias reales de transformación y conexión con la sabiduría
              del alma.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <motion.div key={testimonial.name} variants={staggerItem}>
                <Card className="glass hover:glow-gold transition-all duration-500 h-full border-mystic-700/30">
                  <CardHeader>
                    <div className="flex gap-1 mb-2">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="size-4 text-gold-400 fill-gold-400"
                        />
                      ))}
                    </div>
                    <CardDescription className="text-foreground/70 text-base leading-relaxed italic">
                      &ldquo;{testimonial.quote}&rdquo;
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <div>
                      <p className="font-semibold text-gold-300">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-foreground/50">
                        {testimonial.location}
                      </p>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ============================================================ */}
      {/*                          FOOTER                                */}
      {/* ============================================================ */}
      <footer className="border-t border-mystic-800/30 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/images/logo-etersomos.jpg"
                  alt="Eter Somos"
                  width={36}
                  height={36}
                  className="rounded-full"
                />
                <span className="text-gold-400 font-serif font-bold tracking-[0.2em] uppercase text-lg">
                  ETER SOMOS
                </span>
              </div>
              <p className="text-foreground/50 text-sm leading-relaxed">
                Guías espirituales dedicados a acompañarte en tu camino de
                autoconocimiento a través de los Registros Akáshicos.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-gold-400 font-serif font-semibold mb-4 text-sm uppercase tracking-wider">
                Navegación
              </h3>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <button
                      onClick={() => scrollTo(link.href)}
                      className="text-foreground/50 hover:text-gold-400 transition-colors duration-200 text-sm"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-gold-400 font-serif font-semibold mb-4 text-sm uppercase tracking-wider">
                Contacto
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="mailto:hola@etersomos.com"
                    className="flex items-center gap-2 text-foreground/50 hover:text-gold-400 transition-colors duration-200 text-sm"
                  >
                    <Mail className="size-4" />
                    hola@etersomos.com
                  </a>
                </li>
                <li>
                  <a
                    href="https://instagram.com/etersomos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-foreground/50 hover:text-gold-400 transition-colors duration-200 text-sm"
                  >
                    <Instagram className="size-4" />
                    @etersomos
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/XXXXXXXXXXX"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-foreground/50 hover:text-gold-400 transition-colors duration-200 text-sm"
                  >
                    <MessageCircle className="size-4" />
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-gold-400 font-serif font-semibold mb-4 text-sm uppercase tracking-wider">
                Legal
              </h3>
              <p className="text-foreground/50 text-sm leading-relaxed">
                Las lecturas akáshicas son una herramienta de autoconocimiento y
                crecimiento espiritual. No reemplazan ningún tratamiento médico
                o psicológico profesional.
              </p>
            </div>
          </div>

          <Separator className="bg-mystic-800/30 my-8" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-foreground/40 text-sm">
              © 2025 Eter Somos. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/etersomos"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/40 hover:text-gold-400 transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="size-5" />
              </a>
              <a
                href="https://wa.me/XXXXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/40 hover:text-gold-400 transition-colors duration-200"
                aria-label="WhatsApp"
              >
                <MessageCircle className="size-5" />
              </a>
              <a
                href="mailto:hola@etersomos.com"
                className="text-foreground/40 hover:text-gold-400 transition-colors duration-200"
                aria-label="Email"
              >
                <Mail className="size-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ============================================================ */}
      {/*                       ADMIN PANEL                               */}
      {/* ============================================================ */}
      <Dialog open={adminOpen} onOpenChange={setAdminOpen}>
        <DialogContent className="bg-mystic-950/98 backdrop-blur-xl border-mystic-700/40 w-[95vw] max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-gold-400 text-2xl flex items-center gap-2">
                <Shield className="size-6" />
                Panel de Administración
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAdminOpen(false)}
                className="text-foreground/60 hover:text-gold-400"
              >
                <X className="size-5" />
              </Button>
            </div>
            <DialogDescription className="text-foreground/60">
              Gestión de reservas de lecturas akáshicas
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-4 mt-2">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
              <div className="glass rounded-xl p-4 border border-mystic-700/30">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-gold-500/20 flex items-center justify-center">
                    <FileText className="size-4 text-gold-400" />
                  </div>
                  <span className="text-foreground/60 text-xs font-medium">Total reservas</span>
                </div>
                <p className="text-2xl font-bold text-gold-400">{adminStats.total}</p>
              </div>
              <div className="glass rounded-xl p-4 border border-mystic-700/30">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Clock className="size-4 text-yellow-400" />
                  </div>
                  <span className="text-foreground/60 text-xs font-medium">Pendientes</span>
                </div>
                <p className="text-2xl font-bold text-yellow-400">{adminStats.pendiente}</p>
              </div>
              <div className="glass rounded-xl p-4 border border-mystic-700/30">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <CalendarCheck className="size-4 text-blue-400" />
                  </div>
                  <span className="text-foreground/60 text-xs font-medium">Confirmadas</span>
                </div>
                <p className="text-2xl font-bold text-blue-400">{adminStats.confirmada}</p>
              </div>
              <div className="glass rounded-xl p-4 border border-mystic-700/30">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Check className="size-4 text-green-400" />
                  </div>
                  <span className="text-foreground/60 text-xs font-medium">Enviadas</span>
                </div>
                <p className="text-2xl font-bold text-green-400">{adminStats.enviada}</p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="shrink-0">
              <Tabs value={adminFilter} onValueChange={setAdminFilter}>
                <TabsList className="bg-mystic-900/50 border border-mystic-700/30 flex-wrap h-auto gap-1 p-1">
                  <TabsTrigger value="todos" className="data-[state=active]:bg-gold-500/20 data-[state=active]:text-gold-400 text-foreground/60 text-xs px-3 py-1.5">Todos</TabsTrigger>
                  <TabsTrigger value="pendiente" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400 text-foreground/60 text-xs px-3 py-1.5">Pendiente</TabsTrigger>
                  <TabsTrigger value="confirmada" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 text-foreground/60 text-xs px-3 py-1.5">Confirmada</TabsTrigger>
                  <TabsTrigger value="en_progreso" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 text-foreground/60 text-xs px-3 py-1.5">En Progreso</TabsTrigger>
                  <TabsTrigger value="enviada" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-foreground/60 text-xs px-3 py-1.5">Enviada</TabsTrigger>
                  <TabsTrigger value="cancelada" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 text-foreground/60 text-xs px-3 py-1.5">Cancelada</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Bookings List */}
            <div className="flex-1 overflow-hidden">
              {adminLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-8 text-gold-400 animate-spin" />
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="size-12 text-mystic-700 mb-3" />
                  <p className="text-foreground/50 text-sm">
                    {adminFilter === "todos"
                      ? "No hay reservas registradas"
                      : `No hay reservas con estado "${adminFilter}"`}
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-full max-h-[50vh]">
                  <div className="space-y-2 pr-4">
                    {filteredBookings.map((booking: any) => {
                      const sc = statusConfig[booking.status] || statusConfig.pendiente;
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
                                <span className="text-foreground font-semibold text-sm truncate">
                                  {booking.name}
                                </span>
                                <Badge variant="outline" className={`${sc.bg} ${sc.text} ${sc.border} text-[10px] px-1.5 py-0 border`}>
                                  {booking.readingType}
                                </Badge>
                                <Badge variant="outline" className={`${sc.bg} ${sc.text} ${sc.border} text-[10px] px-1.5 py-0 border`}>
                                  {sc.label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-foreground/50">
                                <span className="flex items-center gap-1">
                                  <Calendar className="size-3" />
                                  {formatBookingDate(booking.createdAt)}
                                </span>
                                {deadlineInfo && (
                                  <span className={`flex items-center gap-1 ${deadlineInfo.isOverdue ? "text-red-400" : deadlineInfo.daysRemaining <= 2 ? "text-yellow-400" : "text-green-400"}`}>
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
                                  className="h-7 px-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                  onClick={(e) => { e.stopPropagation(); handleStatusChange(booking.id, "confirmada"); }}
                                >
                                  Confirmar
                                </Button>
                              )}
                              {booking.status === "confirmada" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                                  onClick={(e) => { e.stopPropagation(); handleStatusChange(booking.id, "en_progreso"); }}
                                >
                                  Iniciar
                                </Button>
                              )}
                              {booking.status === "en_progreso" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs text-green-400 hover:text-green-300 hover:bg-green-500/10"
                                  onClick={(e) => { e.stopPropagation(); handleStatusChange(booking.id, "enviada"); }}
                                >
                                  Marcar Enviada
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs text-gold-400 hover:text-gold-300 hover:bg-gold-500/10"
                                onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); }}
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
      <Sheet open={!!selectedBooking} onOpenChange={(open) => { if (!open) setSelectedBooking(null); }}>
        <SheetContent side="right" className="bg-mystic-950/98 backdrop-blur-xl border-mystic-700/40 w-[95vw] max-w-[500px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-gold-400 font-serif text-xl flex items-center gap-2">
              <Eye className="size-5" />
              Detalle de Reserva
            </SheetTitle>
            <SheetDescription className="text-foreground/60">
              Información completa de la reserva
            </SheetDescription>
          </SheetHeader>

          {selectedBooking && (
            <div className="space-y-6 mt-6">
              {/* Status */}
              {(() => {
                const sc = statusConfig[selectedBooking.status] || statusConfig.pendiente;
                return (
                  <div className="space-y-2">
                    <Label className="text-foreground/80 text-sm font-medium">Estado</Label>
                    <Select
                      value={selectedBooking.status}
                      onValueChange={(val) => handleStatusChange(selectedBooking.id, val)}
                    >
                      <SelectTrigger className="bg-mystic-900/50 border-mystic-700/40 focus:border-gold-400/60 text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-mystic-950 border-mystic-700/40">
                        <SelectItem value="pendiente" className="text-foreground focus:bg-mystic-800/50 focus:text-yellow-300">Pendiente</SelectItem>
                        <SelectItem value="confirmada" className="text-foreground focus:bg-mystic-800/50 focus:text-blue-300">Confirmada</SelectItem>
                        <SelectItem value="en_progreso" className="text-foreground focus:bg-mystic-800/50 focus:text-orange-300">En Progreso</SelectItem>
                        <SelectItem value="enviada" className="text-foreground focus:bg-mystic-800/50 focus:text-green-300">Enviada</SelectItem>
                        <SelectItem value="cancelada" className="text-foreground focus:bg-mystic-800/50 focus:text-red-300">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge variant="outline" className={`${sc.bg} ${sc.text} ${sc.border} text-xs px-2 py-0.5 border`}>
                      {sc.label}
                    </Badge>
                  </div>
                );
              })()}

              {/* Client Info */}
              <div className="space-y-3">
                <h4 className="text-gold-400 font-semibold text-sm flex items-center gap-2">
                  <Users className="size-4" />
                  Datos del Cliente
                </h4>
                <div className="glass rounded-xl p-4 border border-mystic-700/20 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Nombre</span>
                    <span className="text-foreground font-medium">{selectedBooking.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Email</span>
                    <span className="text-foreground font-medium">{selectedBooking.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Teléfono</span>
                    <span className="text-foreground font-medium">{selectedBooking.phone}</span>
                  </div>
                </div>
              </div>

              {/* Booking Info */}
              <div className="space-y-3">
                <h4 className="text-gold-400 font-semibold text-sm flex items-center gap-2">
                  <BookOpen className="size-4" />
                  Datos de la Reserva
                </h4>
                <div className="glass rounded-xl p-4 border border-mystic-700/20 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Estado</span>
                    <span className={`font-medium ${statusConfig[selectedBooking.status]?.text || "text-foreground"}`}>
                      {statusConfig[selectedBooking.status]?.label || selectedBooking.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Creada</span>
                    <span className="text-foreground font-medium">{formatBookingDate(selectedBooking.createdAt)}</span>
                  </div>
                  {getDeadlineInfo(selectedBooking) && (() => {
                    const dl = getDeadlineInfo(selectedBooking)!;
                    return (
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground/60">Fecha límite</span>
                        <span className={`font-medium ${dl.isOverdue ? "text-red-400" : dl.daysRemaining <= 2 ? "text-yellow-400" : "text-green-400"}`}>
                          {dl.formattedDeadline}
                          <span className="text-xs ml-1">
                            ({dl.isOverdue ? "vencida" : `${dl.daysRemaining}d restantes`})
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
                  <h4 className="text-gold-400 font-semibold text-sm flex items-center gap-2">
                    <MessageCircle className="size-4" />
                    Mensaje / Pregunta
                  </h4>
                  <div className="glass rounded-xl p-4 border border-mystic-700/20">
                    <p className="text-foreground/80 text-sm leading-relaxed">{selectedBooking.message}</p>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label className="text-foreground/80 text-sm font-medium">Notas del administrador</Label>
                <Textarea
                  placeholder="Agregá notas internas sobre esta reserva..."
                  rows={3}
                  defaultValue={selectedBooking.adminNotes || ""}
                  onChange={(e) => {
                    setSelectedBooking({ ...selectedBooking, adminNotes: e.target.value });
                  }}
                  className="bg-mystic-900/50 border-mystic-700/40 focus:border-gold-400/60 text-foreground placeholder:text-foreground/30 resize-none"
                />
              </div>

              <Separator className="bg-mystic-800/30" />

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2"
                  onClick={() => {
                    if (selectedBooking.clientWhatsAppLink) {
                      window.open(selectedBooking.clientWhatsAppLink, "_blank");
                    } else {
                      const phone = selectedBooking.phone?.replace(/[^0-9]/g, "") || "";
                      window.open(`https://wa.me/${phone}`, "_blank");
                    }
                  }}
                >
                  <MessageCircle className="size-4" />
                  Contactar por WhatsApp
                </Button>

                {selectedBooking.status === "confirmada" && selectedBooking.googleCalendarLink && (
                  <Button
                    variant="outline"
                    className="w-full border-blue-400/30 text-blue-400 hover:bg-blue-400/10 hover:text-blue-300 font-medium py-3 rounded-xl flex items-center justify-center gap-2"
                    onClick={() => window.open(selectedBooking.googleCalendarLink, "_blank")}
                  >
                    <ExternalLink className="size-4" />
                    Agendar en Google Calendar
                  </Button>
                )}

                {selectedBooking.status === "pendiente" && (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2"
                    onClick={() => handleStatusChange(selectedBooking.id, "confirmada")}
                  >
                    <CalendarCheck className="size-4" />
                    Marcar como Confirmada
                  </Button>
                )}

                {selectedBooking.status === "confirmada" && (
                  <Button
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2"
                    onClick={() => handleStatusChange(selectedBooking.id, "en_progreso")}
                  >
                    <Clock className="size-4" />
                    Marcar como En Progreso
                  </Button>
                )}

                {selectedBooking.status === "en_progreso" && (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2"
                    onClick={() => handleStatusChange(selectedBooking.id, "enviada")}
                  >
                    <Check className="size-4" />
                    Marcar como Enviada
                  </Button>
                )}

                <Separator className="bg-mystic-800/30" />

                <Button
                  variant="ghost"
                  className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 font-medium py-3 rounded-xl flex items-center justify-center gap-2"
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

      {/* ============================================================ */}
      {/*                     FLOATING CART BUTTON                       */}
      {/* ============================================================ */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            className="fixed bottom-6 right-6 z-40"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
              <SheetTrigger asChild>
                <Button
                  size="lg"
                  className="relative bg-foreground hover:bg-foreground/80 text-background font-semibold rounded-full h-14 w-14 p-0 transition-all duration-300 hover:scale-110"
                >
                  <ShoppingBag className="size-6" />
                  <Badge className="absolute -top-2 -right-2 bg-mystic-700 text-gold-300 border border-mystic-600 text-xs px-1.5 min-w-[20px]">
                    {cartCount}
                  </Badge>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-mystic-950/95 backdrop-blur-xl border-mystic-800/30 w-full sm:max-w-md flex flex-col"
              >
                <SheetHeader>
                  <SheetTitle className="text-gold-400 font-serif tracking-wider flex items-center gap-2">
                    <ShoppingBag className="size-5" />
                    Tu Carrito
                  </SheetTitle>
                  <SheetDescription className="text-foreground/60">
                    {cartCount === 0
                      ? "Tu carrito está vacío"
                      : `${cartCount} ${cartCount === 1 ? "producto" : "productos"} en tu carrito`}
                  </SheetDescription>
                </SheetHeader>

                {cart.length > 0 ? (
                  <>
                    <div className="flex-1 overflow-y-auto py-4 space-y-4">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-3 p-3 rounded-xl glass"
                        >
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-gold-300 font-semibold text-sm truncate">
                              {item.name}
                            </h4>
                            <p className="text-gold-400 text-sm font-medium">
                              {formatPrice(item.price)}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-foreground/60 hover:text-gold-400"
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                <Minus className="size-3" />
                              </Button>
                              <span className="text-sm font-medium text-foreground/80 w-6 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-foreground/60 hover:text-gold-400"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                <Plus className="size-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-foreground/40 hover:text-red-400 ml-auto"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="size-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-mystic-800/30 pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-foreground/60 font-medium">
                          Total
                        </span>
                        <span className="text-gold-400 text-xl font-serif font-bold">
                          {formatPrice(cartTotal)}
                        </span>
                      </div>
                      <a
                        href="https://wa.me/XXXXXXXXXXX"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="w-full bg-foreground hover:bg-foreground/80 text-background font-serif font-semibold py-6 rounded-full transition-all duration-300">
                          <MessageCircle className="size-5 mr-2" />
                          Completar compra por WhatsApp
                        </Button>
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                    <ShoppingBag className="size-12 text-mystic-700 mb-4" />
                    <p className="text-foreground/50 text-sm">
                      Explorá nuestra tienda y agregá los cristales que
                      resuenen con vos.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4 border-foreground/20 text-foreground/60 hover:bg-foreground/5 hover:text-foreground rounded-full"
                      onClick={() => {
                        setCartOpen(false);
                        scrollTo("#cristales");
                      }}
                    >
                      Ver Cristales
                      <ArrowRight className="size-4 ml-1" />
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to top button */}
      <AnimatePresence>
        {navScrolled && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-foreground/80 hover:bg-foreground text-background flex items-center justify-center shadow-lg shadow-black/30 backdrop-blur-sm transition-all duration-200 hover:scale-110"
            aria-label="Volver arriba"
          >
            <ArrowUp className="size-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
